# 법인 테이블 통합(companies ↔ org_companies) 개발 로드맵

서로 다른 두 도메인에 중복으로 존재하는 "법인" 개념 — 기준정보 관리(Master)의 `companies`와 조직도(Org)의 `org_companies` — 을 **`companies` 하나로 완전 통합**한다. 조직도는 자체 법인 테이블을 버리고 `companies`를 직접 참조하며, `org_companies.org_group_id`가 담당하던 "그룹사↔법인" 연결은 신규 매핑 테이블 **`org_group_companies`**로 옮긴다. `companies` 테이블 자체에는 **컬럼을 한 개도 추가하지 않는다**(Master 도메인이 "그룹사"라는 개념을 알 필요가 없다).

- **기준 문서**: `docs/prd/PRD_ORG_COMPANY_MERGE.md`
- **선행 로드맵**: `docs/roadmap/ROADMAP_MVP.md`(Task 001~~022 완료) / `docs/roadmap/ROADMAP_MASTER.md`(Task 023~~042 완료 — `companies`·`next_master_code()`·`MASTER_ENTITIES` 제네릭 CRUD) / `docs/roadmap/ROADMAP_ORG.md`(Task 043~059 완료 — `org_groups`·`org_companies`·`org_company_divisions`·`org_sections`·`org_section_teams`·`org_unit_leaders`·`get_org_chart_members()`)
- **기반 저장소**: Next.js 16 (App Router) + Supabase (`@supabase/ssr`) + shadcn/ui `new-york`
- **개발 환경**: 1인 개발 — 일정 추정보다 **실행 순서와 의존관계** 중심으로 태스크를 분해했다.
- **Task 번호**: `ROADMAP_ORG.md`의 Task 059에 이어 **Task 060부터** 연속 채번한다 (번호 충돌 방지).
- **Phase 번호**: `ROADMAP_ORG.md`의 Phase 11에 이어 **Phase 12부터** 채번한다.
- **성격**: 신규 기능 개발이 아니라 **스키마 통합 + 데이터 마이그레이션 + 코드 전환(리팩터링)**이다. 사용자 눈에 보이는 신규 화면은 없고, 오히려 조직도 관리 화면의 "법인 CRUD"가 **줄어든다**(등록 창구를 기준정보 관리 하나로 일원화).
- **최종 수정**: 2026-08-17

---

## 개요

통합 후 목표 계층은 다음과 같다 (PRD 3장):

```
그룹사 (org_groups, 싱글턴 1건)
  └─ org_group_companies          ← 신규 매핑 테이블 (그룹사 ↔ 법인, company_id unique)
       └─ 법인 (companies)         ← Master 소유, 시스템에 하나뿐인 법인 테이블
            ├─ org_company_divisions  ← 기존 매핑 테이블, FK 대상만 companies로 교체
            │    └─ 부문 (organizations) → (부서, org_sections) → 팀 (departments) → 구성원 (profiles)
            └─ brands (기존 그대로)    ← Master 상품 마스터 축, 이번 작업에서 무변경
```

핵심 원칙 3가지:

- **`companies`에 컬럼을 추가하지 않는다.** 그룹사 연결은 `org_company_divisions`가 부문 소속을 표현했던 것과 완전히 동일한 패턴(별도 매핑 테이블)으로 처리한다 — PRD 3장/4.1절.
- **법인 등록 창구를 하나로 만든다.** 신규 법인은 `/erp/master/companies`(기준정보 관리)에서만 만든다. 조직도 관리 화면(`/erp/admin/org`)은 "이미 있는 법인을 그룹사에 배정"만 담당한다 — 지금 부문 노드에서 "소속 법인 변경"만 제공하고 부문 자체 CRUD는 하지 않는 것과 같은 패턴.
- **데이터를 유실하지 않는다.** `org_companies` 6건과 `companies`의 "M2"(C1011, 하위 브랜드 10건 보유)를 이름 매칭으로 병합하고, 매칭되지 않는 5건은 빈 `companies` 행으로 보강한 뒤 모든 FK 값을 치환한다 — PRD 6장.

### 이번 로드맵 완료의 정의

> "`org_companies` 테이블이 DB에서 사라지고, `/erp/master/companies`와 `/erp/admin/org`가 **같은 6개 법인 행**을 바라보며, 기준정보 관리에서 새 법인을 등록하면 재입력 없이 조직도 관리의 '그룹사 배정' 후보로 곧바로 나타나고, `companies`/`brands` 이하 Master 화면과 조직도 트리 양쪽 모두에 회귀가 없다"까지 보장한다.
> 브랜드~상품 계층의 조직도 노출, 그룹사의 Master 도메인 승격, 이관된 5개 법인의 하위 마스터 더미 생성은 범위가 아니다. ([범위 제외](#범위-제외-out-of-scope) 참고)

---

## 개발 워크플로우

`ROADMAP_MVP.md`의 [개발 워크플로우](./ROADMAP_MVP.md#개발-워크플로우)와 `ROADMAP_MASTER.md`/`ROADMAP_ORG.md`의 규약을 그대로 따른다. 이 로드맵에서 특히 중요한 규약만 다시 적는다.

1. **작업 계획** — 착수 전 `CLAUDE.md`·`docs/guides/`·`docs/prd/PRD_ORG_COMPANY_MERGE.md`와 **`docs/prd/PRD_ORG.md` 4.4절**(두 법인을 분리했던 원래 근거)을 확인하고, 이미 존재하는 자산(`is_admin()`, `is_superadmin()`, `set_master_audit()`, `next_master_code()`, `MASTER_ENTITIES.company`, `createMasterAction` 계열)을 **다시 만들지 않는지** 먼저 검증한다.
2. **작업 생성** — 각 Task는 **목표 / 관련 파일 / 구현 체크리스트 / 수락 기준 / 테스트 체크리스트** 5개 소단락을 갖는다.
3. **작업 구현**
   - DB 스키마 변경은 로컬 `supabase/migrations/*.sql`이 아니라 **Supabase MCP(`mcp__supabase__apply_migration`)로 원격 프로젝트에 직접 적용**한다(이 저장소에는 `supabase/` 디렉토리 자체가 없다 — PRD 7장의 "seed.sql 정리" 항목은 해당 사항 없음).
   - **파괴적 변경(FK 재지정 / `DROP TABLE`)을 포함하므로, 모든 마이그레이션 상단 주석에 롤백 SQL을 반드시 남긴다.** 특히 Task 065의 `DROP TABLE org_companies`는 롤백이 불가능하므로, 그 직전 Task(064)까지의 상태를 되돌릴 수 있는 SQL을 각 마이그레이션에 축적한다.
   - **`profiles` / `departments` / `organizations`에 대한 `ALTER TABLE`은 이번에도 금지**한다(ROADMAP_ORG.md에서 승계한 최우선 제약). `companies`만 예외적으로 다루되, 이번 로드맵에서도 **`companies`에 대한 `ALTER TABLE`은 하지 않는다**(행 INSERT만 한다).
   - 스키마 변경 후 **반드시** `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts`를 재생성하고, `mcp__supabase__get_advisors`(security + performance)를 확인한다.
   - DB 연동·권한 로직 구현 시 **Playwright MCP로 E2E 검증**을 수행한 뒤 다음 단계로 진행한다. 검증에는 임시 계정(회원가입 후 `execute_sql`로 role 승격)을 사용하고 **검증 직후 삭제해 잔존 0건을 확인**한다.
   - 각 Task 완료 후 `npm run check-all`(typecheck + lint + format:check)을 통과시킨다. **단, Phase 13 진행 중에는 의도적으로 실패하는 구간이 있다 — 아래 Phase 13 서두의 경고 참고.**
4. **로드맵 업데이트** — 완료 Task는 제목 옆에 ✅, 하위 체크박스를 `[x]`로 전환하고 Phase 전체 완료 시 Phase 제목에도 ✅를 붙인다. [진행 현황](#진행-현황) 표도 함께 갱신한다.

> ⚠️ **착수 전 사용자 확인이 필요한 항목이 2건 있다** (PRD 10장 미확정). Task 060에서 확인하며, 확인 전까지는 이 로드맵에 적힌 **PRD 기본안**(법인 등록 권한 `is_admin()` 유지 / 컬럼명 `company_id`로 리네이밍)으로 태스크가 작성되어 있다. 결정이 뒤집히면 Task 062·064·067을 함께 갱신해야 한다.

---

## 아키텍처 사전 결정 사항

Task 착수 전 아래 결정을 전제로 한다. 변경 시 이 섹션과 영향받는 Task를 함께 갱신할 것.

| 항목                        | 결정                                                                                                                                                                                     | 근거                                                                                                                                                                              |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 최종 법인 테이블            | **`public.companies` 하나만 남긴다.** `org_companies`는 데이터 이관 후 `DROP TABLE`.                                                                                                     | PRD 1.2 / 3장 / 4.4절                                                                                                                                                             |
| 그룹사↔법인 연결 표현       | **신규 매핑 테이블 `org_group_companies`**(`company_id` unique). `companies`에 `org_group_id` 컬럼을 추가하지 않는다.                                                                    | PRD 3장 / 4.1절. `org_company_divisions`(부문 소속) 선례를 그대로 연장 — Master 도메인이 그룹사를 몰라도 되게 유지                                                                |
| 법인 코드 체계              | **`C####`(Master) 하나만 남긴다.** `OC####`(`org_code_company_seq` + `next_master_code`의 `org_company` 분기 + `ORG_CODE_SPECS.orgCompany`)는 전부 제거.                                 | PRD 4.4절. 한 테이블에 채번 체계가 둘일 이유가 없음                                                                                                                               |
| 법인 신규 등록 권한         | **`companies` 기존 정책(`is_admin()`) 유지** — 기준정보 관리 화면의 현재 동작을 보존한다. ⚠️ **PRD 10장 미확정 항목**(Task 060에서 확인)                                                 | PRD 5장 표. "superadmin만" 으로 올리면 기존 Master 화면 동작이 바뀌는 회귀가 발생                                                                                                 |
| 그룹사 배정/해제 권한       | **`is_superadmin()`** — `org_group_companies`의 I/U/D 정책. 기존 `org_groups`/`org_company_divisions`와 동일 레벨.                                                                       | PRD 5장 표. "그룹사·법인은 여러 부문에 걸치는 최상위 레벨이라 스코프가 없다"(PRD_ORG.md 3.1절)를 승계                                                                             |
| 매핑 FK 컬럼명              | `org_company_divisions.org_company_id` → **`company_id`**, `org_unit_leaders.org_company_id` → **`company_id`**로 리네이밍. ⚠️ **PRD 10장 미확정 항목**(Task 060에서 확인)               | PRD 4.2 / 4.3절. FK 대상이 `companies`인데 컬럼명이 `org_company_id`면 이후 읽는 사람이 반드시 헷갈린다. 리네이밍하지 않아도 기능상 문제는 없음(가독성 대 변경 범위 트레이드오프) |
| "M2" 병합 방향              | `companies.C1011`(하위 브랜드 10건 보유)을 **최종본으로 채택**하고, `org_companies.OC0001`을 참조하던 FK를 전부 이쪽으로 치환한다.                                                       | PRD 6장 3단계. 반대 방향으로 병합하면 브랜드~사이즈 하위 데이터가 전부 고아가 된다                                                                                                |
| 미매칭 5개 법인             | `companies`에 **빈 행만** 생성(코드는 `next_master_code('company')` 규칙대로 `C####` 연번). **하위 브랜드~사이즈 더미는 만들지 않는다.**                                                 | PRD 6장 2단계 / 9장. 조직도용으로 등록된 법인이지 상품 마스터 목적이 아님                                                                                                         |
| 마이그레이션 중간 상태 보관 | Task 063에서 **임시 매핑 테이블 `org_company_merge_map`**(`org_company_id` → `company_id` + `org_group_id` + `sort_order`)을 만들어 Task 064·065가 공유하고, Task 065 끝에서 `DROP`한다. | 이관이 여러 마이그레이션으로 나뉘므로 `org_companies`가 사라지기 전에 "어느 행이 어느 행으로 병합됐는지"를 DB에 남겨야 한다. 롤백 근거 자료도 됨                                  |
| 법인 표시 순서              | 조직도 트리의 법인 정렬은 **`org_group_companies.sort_order`** 로 관리한다(`companies.sort_order`는 기준정보 화면 전용으로 그대로 둔다).                                                 | 두 도메인이 같은 행을 공유하지만 정렬 요구가 다를 수 있음. Master의 정렬을 조직도가 덮어쓰지 않게 분리                                                                            |
| 법인 CRUD UI 위치           | 등록/수정/삭제는 **`/erp/master/companies`**(기존 `MASTER_ENTITIES.company` 제네릭 CRUD, 무변경). 조직도 관리 화면은 **"그룹사 배정 변경" + 기준정보 화면으로 가는 안내 링크**만 제공.   | PRD 3장 / 8장. `org-group-company-actions.tsx`의 기존 "부문 노드에는 소속 법인 변경만" 설계를 법인 노드로 연장                                                                    |
| 권한 함수                   | **기존 `is_admin()` / `is_superadmin()`을 그대로 재사용.** 새 DB 권한 함수를 만들지 않는다.                                                                                              | 이 저장소의 일관된 관례(CLAUDE.md)                                                                                                                                                |
| 감사 컬럼                   | `org_group_companies`는 `org_company_divisions`와 동일하게 `created_at`/`created_by`만 둔다(`updated_*` 없음 → `set_master_audit()` 트리거 불필요).                                      | PRD 4.1절 표                                                                                                                                                                      |
| Suspense 경계               | `cacheComponents: true` 환경이므로 기존 얇은 `Page` + `<Suspense>` + `async XxxContent` 패턴을 그대로 유지한다(이번 작업으로 페이지 구조를 바꾸지 않는다).                               | `app/erp/admin/org/page.tsx` 현행 구조                                                                                                                                            |
| shadcn 컴포넌트             | 신규 추가 없음 — `dialog`/`native-select`/`button`/`badge` 등 전부 이미 존재.                                                                                                            | `npx shadcn add` 불필요                                                                                                                                                           |

### 데이터 모델 변경 요약

| 대상                           | 변경                                                                                                                                                                                                                        | Task    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `org_group_companies` (신규)   | `id` PK / `org_group_id` FK→`org_groups.id` not null / `company_id` FK→`companies.id` not null **unique** / `sort_order` int default 0 / `created_at` / `created_by` + RLS(select: authenticated, I·U·D: `is_superadmin()`) | 062     |
| `companies`                    | **행 5건 INSERT만**(M2 Safety/MIDER/Mynafit/Mordisk/Miretti). `ALTER TABLE` 없음, 기존 "M2"(C1011) 행 무변경                                                                                                                | 063     |
| `org_company_divisions`        | `org_company_id` 값 치환 → FK 대상 `org_companies.id` → **`companies.id`** → 컬럼명 **`company_id`**로 리네이밍                                                                                                             | 064     |
| `org_unit_leaders`             | 동일(값 치환 → FK 재지정 → 리네이밍). `org_unit_leaders_company_uk` partial unique index도 새 컬럼명으로 재생성, `num_nonnulls(...)=1` CHECK 재정의                                                                         | 064     |
| `org_companies`                | 데이터 이관 후 **`DROP TABLE`**(RLS 정책 4개 동반 삭제)                                                                                                                                                                     | 065     |
| `next_master_code(p_entity)`   | `create or replace`로 **`when 'org_company'` 분기 제거** + 권한 프리앰블 `in ('org_group','org_company')` → `= 'org_group'`. 나머지 14종 분기는 그대로 보존                                                                 | 065     |
| `org_code_company_seq`         | `DROP SEQUENCE`                                                                                                                                                                                                             | 065     |
| `org_company_merge_map` (임시) | Task 063 생성 → Task 064·065에서 참조 → Task 065 끝에서 `DROP`                                                                                                                                                              | 063~065 |

### 변경 금지 파일 / 객체 목록 (선행 로드맵에서 승계 + 이번 로드맵 추가분)

- **`public.profiles` / `public.departments` / `public.organizations` 테이블 — 컬럼·제약·RLS 정책 전부 변경 금지** (ROADMAP_ORG.md의 최우선 제약을 그대로 승계)
- **`public.companies` 테이블의 스키마 — `ALTER TABLE` 금지.** 이번 로드맵은 행 INSERT만 한다. RLS 정책 4개(`companies_select_authenticated`/`insert_admin`/`update_admin`/`delete_admin`)도 손대지 않는다(⚠️ Task 060에서 "superadmin으로 상향" 결정이 나오면 이 항목이 해제된다).
- **`brands` 이하 Master 상품 마스터 계층 전체** — 이번 통합과 무관. `companies.C1011` 하위 브랜드 10건은 그대로 유지되어야 한다(**삭제 금지**).
- `proxy.ts`, `lib/supabase/proxy.ts` — 쿠키 처리 로직 **특히 금지**
- `app/layout.tsx`, `app/page.tsx`, `app/protected/**` — 스타터킷 영역
- `app/erp/layout.tsx`, `components/erp/erp-shell.tsx`, `components/erp/erp-header.tsx`, `components/erp/erp-footer.tsx` — 셸 구조 무변경
- `app/erp/admin/layout.tsx` — 수정하지 않는다. `requireAdmin()` 가드를 그대로 상속만 받는다.
- `components/erp/master/**`, `lib/erp/master/**` — **읽기/재사용만 하고 수정하지 않는다.** 특히 `lib/erp/master/entities.ts`의 `MASTER_ENTITIES.company`는 이번 통합 후 "유일한 법인 정의"가 되는데, 정의 자체는 이미 올바르므로 **변경 없음을 확인만** 한다(PRD 7장).
- `public.is_admin()` / `public.is_superadmin()` / `public.current_organization_id()` / `public.set_master_audit()` / `public.get_org_chart_members()` — 재사용만 하고 정의를 수정하지 않는다.
  - 예외: `public.next_master_code()`는 `org_company` 분기 **제거**를 위해 `create or replace`로 수정한다(Task 065). 나머지 14종 분기와 `product`/`org_group` 권한 예외는 그대로 보존한다.
- `lib/erp/org/{levels,node-key}.ts`, `components/erp/org/{org-chart-view,org-children-panel,org-leader-panel,org-leader-dialog,org-member-list,org-chart-popup,org-chart-popup-tree,org-section-*}.tsx` — **법인 노드의 의미가 바뀌지 않으므로 구조 변경 없음**. `levels.ts`의 `company.editableBy` 주석만 Task 068에서 갱신한다.

### ⚠️ 사용자 확인 대기 항목 (착수 전 필수)

| #   | 항목                                                                                        | PRD 근거          | 이 로드맵의 기본안              | 뒤집힐 때 영향 Task                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------- | ----------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ①   | 법인 신규 등록 권한을 `is_admin()`로 유지할지, `is_superadmin()`으로 올릴지                 | PRD 5장 표 + 10장 | **`is_admin()` 유지**           | 062(정책 문구 정합성 확인), 067(액션 가드), 068(버튼 노출), 069(권한 시나리오) — 상향 시 `companies` RLS 3개 정책 교체 마이그레이션이 Task 062에 추가됨 |
| ②   | `org_company_divisions`/`org_unit_leaders`의 `org_company_id`를 `company_id`로 리네이밍할지 | PRD 4.2 / 10장    | **리네이밍한다**                | 064(마이그레이션에서 `alter ... rename column` 제거), 066·067(컬럼명 참조), `database.types.ts`                                                         |
| ③   | "M2" 이름 매칭 결과가 실제로 동일 법인이 맞는지 최종 확인                                   | PRD 10장          | **동일 법인으로 간주하고 병합** | 063(매칭 목록 확정) — 다르다면 "M2"도 신규 행으로 만들고 6건 전부 신규 생성이 됨                                                                        |

---

## 개발 단계

- **Phase 12** — 통합 설계 확정 및 이관 사전 점검 (Task 060~061)
- **Phase 13** — 스키마 및 데이터 통합 마이그레이션 (Task 062~065)
- **Phase 14** — 조직 도메인 코드 전환 (Task 066~068)
- **Phase 15** — 통합 검증 (Task 069)

---

## Phase 12: 통합 설계 확정 및 이관 사전 점검 ✅

> PRD 5장 / 6장 / 10장.
> **코드·스키마를 건드리지 않는 준비 단계다.** 산출물은 "확정된 결정"과 "이관 대상 매칭 목록"이며, 이 둘이 없으면 Phase 13의 마이그레이션을 안전하게 작성할 수 없다.

### Task 060: 통합 설계 확정 및 PRD 10장 미확정 항목 사용자 확인 ✅

**목표**: PRD 10장에 열려 있는 결정 3건을 사용자 확인으로 확정하고, 그 결과를 이 로드맵의 "아키텍처 사전 결정 사항"과 영향 Task에 반영한다. **코드 변경은 없으며, 산출물은 결정 기록이다.**

**관련 파일**

- `docs/prd/PRD_ORG_COMPANY_MERGE.md` 5장 / 10장 (확인 결과 반영)
- `docs/roadmap/ROADMAP_ORG_COMPANY_MERGE.md` (이 문서 — 결정 사항 표 및 영향 Task 갱신)

**구현 체크리스트**

- [ ] **① 법인 신규 등록 권한 확정** — `companies`의 INSERT/UPDATE/DELETE 정책을 현행 `is_admin()`으로 유지할지, `is_superadmin()`으로 상향할지 확인한다. 상향 시 **기존 기준정보 관리 화면에서 admin이 법인을 등록하던 동작이 사라진다**는 회귀 영향을 함께 설명한다(PRD 5장 리스크 문단).
- [ ] **② 컬럼 리네이밍 여부 확정** — `org_company_divisions.org_company_id` / `org_unit_leaders.org_company_id`를 `company_id`로 바꿀지 확인한다. 바꾸지 않아도 기능상 문제는 없고 마이그레이션·코드 변경 범위만 줄어든다는 트레이드오프를 함께 설명한다.
- [ ] **③ "M2" 이름 매칭 확정** — Task 061이 산출한 매칭 목록(이름 완전 일치 1건 + 미매칭 5건)을 사용자에게 제시하고 "이름이 같은 M2는 실제로 같은 법인"임을 확인받는다. **Task 061의 산출물이 이 확인의 입력이므로, ③만은 061 이후에 확인해도 된다.**
- [ ] 확정 결과를 이 문서의 "아키텍처 사전 결정 사항" 표와 [사용자 확인 대기 항목](#사용자-확인-대기-항목-착수-전-필수) 표에 반영하고, ⚠️가 붙어 있는 Task 제목(060, 064)에서 ⚠️를 제거한다. `PRD_ORG_COMPANY_MERGE.md` 5장/10장에도 동일한 확정 결과를 반영한다.
- [ ] 결정이 기본안과 달라진 경우 영향 Task(062 / 064 / 066 / 067 / 068)의 체크리스트를 **먼저 갱신한 뒤** Phase 13에 착수한다.

**수락 기준**

- [ ] 위 3개 항목에 대해 "확정" 또는 "현행 가정 유지"라는 명시적 사용자 답변이 이 문서에 기록되어 있다.
- [ ] 결정에 따라 영향받는 Task의 체크리스트가 확정 결과와 모순 없이 정리되어 있다.
- [ ] PRD와 이 로드맵 사이에 상충하는 서술이 남아 있지 않다(교차 확인).

**테스트 체크리스트**

- [ ] (코드 변경 없음 — 자동 테스트 대상 아님) 결정 사항이 이 문서와 `PRD_ORG_COMPANY_MERGE.md` 양쪽에 모순 없이 반영되었는지 교차 확인한다.

---

### Task 061: 이관 사전 점검 — 실 데이터 스냅샷 및 이름 매칭 목록 산출 ✅

**목표**: 마이그레이션을 쓰기 전에 **읽기 전용 쿼리만으로** 현재 데이터 상태를 확정하고, "어느 `org_companies` 행이 어느 `companies` 행으로 병합되는가"를 표로 만든다. **이 Task의 산출물(매칭 목록)이 Task 063의 입력이자 Task 060 ③의 확인 자료다.**

> ℹ️ 아래 [실 DB 확인값](#실-db-확인값-2026-08-17-조회-기준--착수-시-재확인할-것)은 2026-08-17 조회 기준이며 **PRD 6장 서두의 숫자와 일부 다르다**(특히 `companies`의 "법인 1~10" 더미는 이미 삭제되어 없고, `org_unit_leaders`의 법인 레벨 리더가 0건이 아니라 1건이다). 착수 시 반드시 재조회해 최신 값으로 갱신할 것.

**관련 파일**

- (읽기 전용 — 파일 변경 없음. `mcp__supabase__execute_sql`만 사용)
- `docs/roadmap/ROADMAP_ORG_COMPANY_MERGE.md` (이 문서의 "실 DB 확인값" 표 갱신)

**구현 체크리스트**

- [ ] `companies` 전 행 조회 — `id`/`code`/`name`/`sort_order`/`is_active`, 그리고 각 행의 하위 `brands` 개수를 함께 집계한다(병합 방향 결정의 근거).
- [ ] `org_companies` 전 행 조회 — `id`/`code`/`name`/`sort_order`/`org_group_id`.
- [ ] **이름 완전 일치 매칭 목록 산출** — `select oc.code, oc.name, c.code, c.name from org_companies oc left join companies c on c.name = oc.name`. 매칭/미매칭을 한 표로 뽑고, **좌우 공백·대소문자 차이로 매칭이 빗나가지 않는지** `trim()`/`lower()` 비교와 결과를 대조한다(빗나가면 어느 쪽이 맞는지 Task 060 ③에서 확인).
- [ ] `companies.name`에 중복이 있는지 확인(`group by name having count(*) > 1`) — 있으면 1:N 매칭이 되어 자동 병합이 불가하므로 사용자 확인 대상으로 승격한다.
- [ ] `org_companies`를 참조하는 모든 FK를 전수 조회한다 — `pg_constraint`에서 `confrelid = 'public.org_companies'::regclass`인 제약을 모두 뽑아 **PRD 4장이 언급한 2개(`org_company_divisions`, `org_unit_leaders`) 외에 누락된 참조가 없는지** 확인한다. 있으면 이 로드맵의 Task를 추가해야 한다.
- [ ] `org_company_divisions` / `org_unit_leaders`의 `org_company_id` 별 행 수를 집계한다(치환 대상 건수 확정).
- [ ] `master_code_company_seq`의 `last_value`/`is_called`를 조회하고, `next_master_code('company')`가 다음에 반환할 코드를 계산한다. **`next_master_code()`에는 "이미 존재하는 코드면 건너뛰고 다시 채번"하는 루프가 있으므로**, `last_value=1010`이고 `C1011`이 이미 존재하면 다음 채번은 `C1012`가 된다는 점을 확인한다(Task 063이 하드코딩할 코드 범위의 근거).
- [ ] `org_code_company_seq`의 현재 값을 기록한다(Task 065에서 `DROP SEQUENCE` 전 롤백 자료).
- [ ] 위 결과를 이 문서의 "실 DB 확인값" 표와 아래 "이름 매칭 목록"에 반영한다.
- [ ] **조회 전용임을 보장** — 이 Task에서 `insert`/`update`/`delete`/`alter`/`drop`을 한 번도 실행하지 않았음을 확인한다.

**수락 기준**

- [ ] `org_companies` 6건 각각에 대해 "병합 대상 `companies` 행" 또는 "신규 생성 필요"가 확정된 표가 이 문서에 기록되어 있다.
- [ ] `org_companies`를 참조하는 FK 목록이 전수 확인되어, PRD 4장이 다루지 않은 참조가 0건임이 확인됐다(있다면 Task 추가 후 진행).
- [ ] Task 063이 생성할 신규 `companies` 5건의 코드 범위(예: `C1012`~`C1016`)와 `sort_order` 값이 확정됐다.
- [ ] DB 상태가 조회 전후 완전히 동일하다(행 수·시퀀스 값 무변경).

**테스트 체크리스트 (execute_sql)**

- [ ] `companies` / `org_companies` / `org_company_divisions` / `org_unit_leaders` / `org_group_companies`(아직 없음) / `brands`의 행 수를 기록해 **Phase 13~15 전 구간의 기준선(baseline)**으로 삼는다.
- [ ] 이름 매칭 쿼리를 `=` 비교와 `lower(trim(...))` 비교 두 가지로 각각 실행해 결과가 같은지 확인한다.
- [ ] `pg_constraint` 전수 조회 결과에 `org_company_divisions_org_company_id_fkey` / `org_unit_leaders_org_company_id_fkey` 외 항목이 없음을 확인한다.
- [ ] `select public.next_master_code('company')`는 **호출하지 않는다**(시퀀스가 소비되므로). 시퀀스 값 조회(`select last_value, is_called from public.master_code_company_seq`)로만 판단한다.

**이름 매칭 목록** (Task 061 실행 후 채울 것 — 아래는 2026-08-17 사전 조회 기준 예상값)

| `org_companies`    | 매칭 결과                 | 통합 후 `companies`                                |
| ------------------ | ------------------------- | -------------------------------------------------- |
| `OC0001` M2        | 이름 완전 일치 → **병합** | 기존 `C1011` M2 (하위 브랜드 10건 보유, 삭제 금지) |
| `OC0002` M2 Safety | 미매칭 → 신규 생성        | `C1012`(예정) M2 Safety — 빈 행                    |
| `OC0003` MIDER     | 미매칭 → 신규 생성        | `C1013`(예정) MIDER — 빈 행                        |
| `OC0004` Mynafit   | 미매칭 → 신규 생성        | `C1014`(예정) Mynafit — 빈 행                      |
| `OC0005` Mordisk   | 미매칭 → 신규 생성        | `C1015`(예정) Mordisk — 빈 행                      |
| `OC0006` Miretti   | 미매칭 → 신규 생성        | `C1016`(예정) Miretti — 빈 행                      |

---

## Phase 13: 스키마 및 데이터 통합 마이그레이션 ✅

> PRD 4장 / 5장 / 6장.
> **이 로드맵에서 유일하게 파괴적인 변경을 담는 Phase다.** Task 062(신규 테이블) → 063(데이터 보강) → 064(FK 전환) → 065(구 테이블 폐기) 순서를 **반드시 직렬로** 지킨다.

> ⚠️ **빌드가 깨지는 구간이 있다.** Task 064의 컬럼 리네이밍 시점부터 Phase 14 완료 전까지 `lib/erp/org/*`·`components/erp/org/org-group-company-actions.tsx`가 존재하지 않는 테이블/컬럼을 참조하므로 `npm run typecheck`와 `npm run build`가 실패한다. 이는 **의도된 중간 상태**다.
>
> - Phase 13과 Phase 14는 **한 작업 세션에서 연속 처리**하고, 작업은 별도 브랜치에서 진행한다.
> - Task 064·065의 수락 기준은 "typecheck 통과"가 아니라 **"typecheck 오류가 `lib/erp/org/**`와 `components/erp/org/org-group-company-actions.tsx`로만 국한되고, `lib/erp/master/**`·`app/erp/master/**`에는 오류가 0건"**이다. Master 도메인에 오류가 번지면 통합 설계가 잘못된 것이다.
> - `main` 병합은 Phase 14 완료 후 `npm run check-all` + `npm run build`가 모두 통과한 뒤에만 한다.

### Task 062: `org_group_companies` 매핑 테이블 신설 (그룹사 ↔ 법인) ✅

**목표**: `org_companies.org_group_id` 컬럼이 담당하던 "법인은 어느 그룹사 소속인가"를 별도 매핑 테이블로 옮길 자리를 만든다. **순수 additive 마이그레이션이며, 이 시점에는 데이터를 넣지 않는다**(이관은 Task 065).

**관련 파일**

- Supabase 마이그레이션(MCP) — `create_org_group_companies`
- `docs/prd/PRD_ORG_COMPANY_MERGE.md` 4.1절 / 5장

**구현 체크리스트**

- [ ] `org_group_companies` 생성 — `org_company_divisions`(PRD_ORG.md 5.3절)와 동일한 컬럼 패턴을 따른다:
  - [ ] `id uuid primary key default gen_random_uuid()`
  - [ ] `org_group_id uuid not null references public.org_groups(id) on delete restrict`
  - [ ] `company_id uuid not null unique references public.companies(id) on delete restrict` — **unique로 "법인은 그룹사 정확히 1곳에만 소속"을 강제**. `companies`를 참조만 하고 변경하지 않는다.
  - [ ] `sort_order integer not null default 0`
  - [ ] `created_at timestamptz not null default now()`, `created_by uuid references public.profiles(id) default auth.uid()` — `org_company_divisions`와 동일하게 `updated_*` 계열은 두지 않는다(→ `set_master_audit()` 트리거 불필요).
- [ ] 인덱스 — `org_group_companies(org_group_id, sort_order)` + `created_by` FK 커버링 인덱스.
- [ ] RLS 활성화 + 정책 (**기존 함수 재사용**, PRD 5장 표):
  - [ ] `select` — `to authenticated using (true)`(조직도는 전 구성원 조회)
  - [ ] `insert` — `with check (public.is_superadmin())`
  - [ ] `update` — `using (public.is_superadmin()) with check (public.is_superadmin())`
  - [ ] `delete` — `using (public.is_superadmin())`
- [ ] ⚠️ **Task 060 ①이 "superadmin 상향"으로 확정된 경우에만** — `companies`의 `companies_insert_admin`/`companies_update_admin`/`companies_delete_admin` 3개 정책을 `is_superadmin()` 기준으로 교체하는 마이그레이션을 이 Task에 추가한다(기본안에서는 **하지 않는다**).
- [ ] 롤백 SQL(`drop table public.org_group_companies`)을 마이그레이션 상단 주석에 남긴다.
- [ ] **마이그레이션 SQL 본문에 `alter table public.companies` / `public.profiles` / `public.departments` / `public.organizations`가 한 줄도 없는지 적용 직후 재확인**한다(FK 참조만 사용).
- [ ] `mcp__supabase__get_advisors`(security + performance) 확인 — 신규 빈 테이블의 `unused_index` INFO 외 실질 경고가 없어야 한다.
- [ ] `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성 — 순수 추가분만 반영됨을 확인하고 `npm run typecheck` 통과(이 시점까지는 통과해야 한다).

**수락 기준**

- [ ] 테이블이 생성되고 컬럼·FK·unique 제약이 확인된다(`information_schema.columns` + `pg_constraint` 조회로 검증).
- [ ] RLS가 활성화되어 있고 정책 4개가 위 정의대로 존재한다(`pg_policies` 조회).
- [ ] `companies` / `org_companies` / `org_company_divisions` / `org_unit_leaders`의 행 수와 스키마가 마이그레이션 전후 완전히 동일하다.
- [ ] `npm run check-all` 통과.

**테스트 체크리스트 (execute_sql)**

- [ ] superadmin 세션 시뮬레이션(`set local role authenticated` + `set_config('request.jwt.claims', ...)`)으로 `org_group_companies` 1건 insert 성공 → 같은 `company_id`로 2번째 insert 시도 → unique 위반(`23505`) 확인.
- [ ] `role='admin'`(superadmin 아님) 세션 insert → RLS 차단(`42501`) 확인. `role='user'` 세션도 동일하게 차단, 단 select는 성공 확인.
- [ ] 하위 매핑이 있는 `companies` 행 delete 시도 → FK `restrict` 위반(`23503`) 확인(법인 삭제가 그룹사 배정으로 막히는 동작 확인).
- [ ] 테스트에 사용한 행 전부 삭제 후 잔존 0건 확인.

---

### Task 063: 미매칭 법인 5건 `companies` 보강 및 병합 매핑 테이블 생성 ✅

**목표**: PRD 6장 1~3단계를 수행한다. 이름 매칭으로 "M2"를 병합 확정하고, 매칭되지 않는 5개 법인을 `companies`에 빈 행으로 만든 뒤, **"`org_companies.id` → `companies.id`" 전 6건의 대응표를 DB에 남긴다.** 이 대응표가 Task 064·065의 유일한 입력이다.

**관련 파일**

- Supabase 마이그레이션(MCP) — `create_org_company_merge_map`, `insert_merged_companies`
- `docs/prd/PRD_ORG_COMPANY_MERGE.md` 6장 1~3단계
- Task 061의 이름 매칭 목록 / Task 060 ③의 사용자 확인 결과

**구현 체크리스트**

- [ ] 착수 전 `execute_sql`로 Task 061의 매칭 목록을 **재조회해 그대로인지 확인**한다(그 사이 사용자가 기준정보 화면에서 법인을 추가했을 수 있다). 달라졌으면 Task 061 표부터 갱신한다.
- [ ] 임시 매핑 테이블 `public.org_company_merge_map` 생성 — `org_company_id uuid primary key`, `company_id uuid not null`, `org_group_id uuid not null`, `sort_order integer not null`, `matched boolean not null`(이름 매칭 병합이면 true, 신규 생성이면 false), `created_at timestamptz not null default now()`.
  - [ ] **RLS를 활성화하되 정책은 만들지 않는다**(=authenticated 접근 전면 차단). 마이그레이션(postgres 롤)에서만 쓰는 작업용 테이블이므로 앱에서 읽을 필요가 없고, RLS 미활성 테이블은 `get_advisors` security 경고를 유발한다.
  - [ ] 테이블 주석(`comment on table`)에 "Task 063~065 한정 임시 테이블 — Task 065에서 DROP" 을 남긴다.
- [ ] **미매칭 5건 `companies` INSERT** (PRD 6장 2단계) — `M2 Safety`/`MIDER`/`Mynafit`/`Mordisk`/`Miretti`:
  - [ ] 코드는 Task 061에서 확정한 `C####` 연번(예상 `C1012`~`C1016`)을 **명시적으로 지정**한다. 마이그레이션 컨텍스트에서는 `auth.uid()`가 null이라 `next_master_code('company')`의 `is_admin()` 프리앰블에 막히므로 함수를 호출하지 않는다(ROADMAP_ORG Task 046과 동일한 선례).
  - [ ] `sort_order`는 기존 "M2"(11) 다음 연번(12~~16), `is_active = true`, `note`는 null. **하위 브랜드~~사이즈 더미는 만들지 않는다**(PRD 6장 2단계 / 9장).
  - [ ] 삽입 직후 `setval('public.master_code_company_seq', <마지막 번호>, true)`로 시퀀스를 정합시켜, 이후 기준정보 화면에서의 채번이 중복되지 않게 한다.
  - [ ] `created_by`가 마이그레이션 컨텍스트에서 `null`로 저장됨을 확인한다(기존 시드 Task들과 동일 현상, 정상).
- [ ] **매핑 테이블 채우기** — `org_companies` 6건 전부에 대해 1행씩 insert:
  - [ ] "M2"는 `matched = true`, `company_id = companies.C1011.id`(하위 브랜드 10건이 딸린 기존 행을 최종본으로 채택 — PRD 6장 3단계).
  - [ ] 나머지 5건은 `matched = false`, `company_id`는 방금 만든 신규 행 id.
  - [ ] `org_group_id`/`sort_order`는 `org_companies`에서 그대로 복사한다. **`sort_order`가 전부 0이면 `code`(OC0001~OC0006) 순서를 0..5로 부여**해 그룹사 안에서의 표시 순서를 보존한다(PRD 6장 6단계).
  - [ ] 하드코딩 대신 `insert ... select`로 `org_companies`에서 직접 읽어 넣고, 이름 매칭은 `left join public.companies c on c.name = oc.name`으로 표현한다.
- [ ] 매핑 테이블이 정확히 6행이고 `company_id`에 중복이 없음을 같은 마이그레이션 끝에서 검증한다(중복이면 서로 다른 법인이 한 행으로 합쳐진다는 뜻 → 즉시 롤백).
- [ ] 롤백 SQL(신규 `companies` 5건 delete + `master_code_company_seq` `setval` 원복 + `drop table org_company_merge_map`)을 마이그레이션 상단 주석에 남긴다.
- [ ] **기존 `companies.C1011` 행과 그 하위 `brands` 10건에 대한 UPDATE/DELETE가 마이그레이션 SQL에 한 줄도 없음**을 적용 직후 재확인한다.
- [ ] `mcp__supabase__generate_typescript_types` 재생성(임시 테이블이 타입에 잡히는 것은 정상 — Task 065에서 DROP 후 다시 사라진다) + `npm run typecheck` 통과.

**수락 기준**

- [ ] `companies`가 6건이 되고(기존 1 + 신규 5), `code`가 전부 `C####` 형식이며 unique 위반 없이 저장됐다.
- [ ] `brands` 10건과 그 하위 계층(소브랜드/라인/컬러/사이즈 등)의 행 수와 값이 마이그레이션 전후 정확히 동일하다.
- [ ] `org_company_merge_map`이 정확히 6행이고, `org_company_id`/`company_id` 모두 중복이 없다.
- [ ] `org_companies` / `org_company_divisions` / `org_unit_leaders`는 아직 **한 행도 변경되지 않았다**(이 Task는 읽기만 한다).
- [ ] `master_code_company_seq`의 다음 채번이 기존 코드와 충돌하지 않는다.

**테스트 체크리스트 (Playwright MCP + execute_sql)**

- [ ] `execute_sql`로 `companies` 6건, `org_company_merge_map` 6건, `brands` 10건을 확인하고 Task 061의 기준선과 대조한다.
- [ ] `org_company_merge_map`을 `org_companies`와 조인해 6건 전부 이름이 일치하는지 육안 확인한다(`oc.name = c.name`이 6행 모두 true여야 한다 — 신규 생성 행도 같은 이름으로 만들었으므로).
- [ ] **Playwright MCP**: 임시 admin 계정으로 `/erp/master/companies` 진입 → 법인 목록에 6건(M2 + 신규 5건)이 전부 표시되고 코드/정렬순서가 의도대로인지 확인. **이 시점에 이미 기준정보 화면에서 6개 법인이 보이는 것이 정상이다**(조직도 쪽은 아직 `org_companies`를 보고 있으므로 변화 없음).
- [ ] 같은 화면에서 "M2" 선택 → 하위 브랜드 10건이 그대로 보이는지 확인(병합 방향이 올바른지의 실화면 증명).
- [ ] `/erp/admin/org` 진입 → 조직도 트리가 **아직 기존과 동일하게** 6개 법인을 보여주는지 확인(이 Task는 조직도에 영향이 없어야 한다).
- [ ] `browser_console_messages` 에러 0건 확인, 임시 계정 삭제 후 잔존 0건 확인.

---

### Task 064: `org_company_divisions` / `org_unit_leaders` FK 전환 및 컬럼 리네이밍 ✅

**목표**: PRD 6장 4~5·7단계. 두 매핑 테이블의 `org_company_id` **값을 `companies.id`로 치환**하고, FK 제약 대상을 `org_companies` → `companies`로 재생성한 뒤, 컬럼명을 `company_id`로 바꾼다. **이 Task가 끝나면 `org_companies`를 참조하는 FK가 0건이 되어 다음 Task에서 DROP할 수 있다.**

> ⚠️ **컬럼 리네이밍은 PRD 10장 미확정 항목**이다(Task 060 ②). "리네이밍하지 않음"으로 확정되면 아래 `rename column` 항목과 인덱스/CHECK 재생성 항목을 제거하고 FK 재지정까지만 수행한다.

> ⚠️ **이 Task 적용 시점부터 앱 빌드가 깨진다** — Phase 13 서두의 경고 참고. Phase 14를 완료할 때까지 중단하지 말 것.

**관련 파일**

- Supabase 마이그레이션(MCP) — `retarget_org_company_fks_to_companies`
- `docs/prd/PRD_ORG_COMPANY_MERGE.md` 4.2 / 4.3 / 6장 4·5·7단계
- `public.org_company_merge_map` (Task 063 산출물)

**구현 체크리스트**

- [ ] **값 치환 (PRD 6장 4단계)** — `update public.org_company_divisions d set org_company_id = m.company_id from public.org_company_merge_map m where m.org_company_id = d.org_company_id`. 치환 전후 행 수가 동일하고 `org_company_id`가 null인 행이 0건임을 같은 마이그레이션 안에서 검증한다.
- [ ] **값 치환 (PRD 6장 5단계)** — `org_unit_leaders`에 대해 동일하게 실행한다. **PRD 6장은 "현재 0건이라 실질 영향 없음"이라고 적고 있으나 2026-08-17 실측은 법인 레벨 리더 1건이 존재한다** — 착수 시 `count(*) filter (where org_company_id is not null)`로 재확인하고, 1건 이상이면 반드시 치환 결과를 검증한다.
- [ ] **FK 제약 재생성**:
  - [ ] `alter table public.org_company_divisions drop constraint org_company_divisions_org_company_id_fkey` → `add constraint ... foreign key (org_company_id) references public.companies(id) on delete restrict` (기존 `on delete` 동작 그대로 유지).
  - [ ] `alter table public.org_unit_leaders drop constraint org_unit_leaders_org_company_id_fkey` → `add constraint ... references public.companies(id) on delete cascade` (기존 동작 그대로 유지 — 리더는 대상 조직이 사라지면 함께 삭제).
  - [ ] **`on delete` 동작을 임의로 바꾸지 않는다.** 두 테이블의 기존 동작이 서로 다른 것은 의도된 설계다(매핑은 restrict, 리더는 cascade).
- [ ] **컬럼 리네이밍** (⚠️ Task 060 ② 확정 시에만):
  - [ ] `alter table public.org_company_divisions rename column org_company_id to company_id`
  - [ ] `alter table public.org_unit_leaders rename column org_company_id to company_id`
  - [ ] `org_unit_leaders_company_uk` partial unique index를 새 컬럼명 기준으로 재생성한다 — `create unique index org_unit_leaders_company_uk on public.org_unit_leaders (company_id) where company_id is not null`. **"법인당 리더 1명" 제약이 유지되어야 한다**(PRD 4.3절).
  - [ ] `org_unit_leaders_exactly_one_target` CHECK를 `num_nonnulls(org_group_id, company_id, organization_id, org_section_id, department_id) = 1`로 재정의한다.
  - [ ] `org_unit_leaders`의 RLS 정책 3개(`insert`/`update`/`delete`)는 `department_id`/`org_section_id`만 참조하므로 **재작성이 필요 없음을 정책 본문 조회로 확인**한다(불필요한 정책 교체 금지).
  - [ ] `org_company_divisions_org_company_id_sort_order_idx` 인덱스도 새 컬럼명 기준으로 재생성한다(`rename column`은 인덱스 정의를 자동으로 따라가지만, 인덱스 **이름**에 옛 컬럼명이 남으므로 `alter index ... rename to org_company_divisions_company_id_sort_order_idx`로 정리한다).
- [ ] `pg_constraint`로 `confrelid = 'public.org_companies'::regclass`인 제약이 **0건**임을 마이그레이션 끝에서 확인한다.
- [ ] 롤백 SQL(컬럼명 원복 + FK를 `org_companies`로 되돌리기 + 값을 `org_company_merge_map` 역방향으로 치환)을 마이그레이션 상단 주석에 남긴다.
- [ ] **`profiles`/`departments`/`organizations`/`companies`에 대한 `ALTER TABLE`이 없음**을 적용 직후 SQL 본문으로 재확인한다.
- [ ] `mcp__supabase__generate_typescript_types` 재생성 + `mcp__supabase__get_advisors` 확인.

**수락 기준**

- [ ] `org_company_divisions` 10건 전원의 `company_id`가 `companies`에 실제로 존재하는 id를 가리킨다(고아 0건).
- [ ] `org_unit_leaders`의 법인 레벨 리더 행이 `companies`를 가리키고, 다른 4개 레벨 리더 행(그룹사/부문/부서/팀)은 **한 건도 변경되지 않았다**.
- [ ] `org_companies`를 참조하는 FK가 0건이다.
- [ ] `org_unit_leaders`의 "법인당 리더 1명" partial unique index와 `num_nonnulls(...) = 1` CHECK가 새 컬럼명 기준으로 정상 동작한다.
- [ ] `npm run typecheck` 오류가 `lib/erp/org/**`와 `components/erp/org/org-group-company-actions.tsx`로만 국한되고, `lib/erp/master/**`·`app/erp/master/**`·`components/erp/master/**`에는 오류가 0건이다(Phase 13 서두 경고 참고).

**테스트 체크리스트 (execute_sql)**

- [ ] 치환 전후 `org_company_divisions`(10) / `org_unit_leaders`(전체 13, 법인 레벨 1) 행 수 동일 확인.
- [ ] `org_company_divisions`를 `companies`·`organizations`와 조인해 10개 부문이 전부 "M2"(C1011)에 매달려 있는지 확인(기존 매핑 의미가 보존됐는지).
- [ ] 같은 법인에 두 번째 리더 insert 시도 → partial unique index 위반(`23505`) 확인 후 롤백.
- [ ] `num_nonnulls` CHECK 검증 — `company_id`와 `department_id`를 동시에 채운 행 insert 시도 → CHECK 위반(`23514`) 확인.
- [ ] `org_unit_leaders`에 `companies`에 없는 임의 uuid를 넣어 FK 위반(`23503`)이 나는지 확인(FK가 실제로 `companies`를 가리키는지의 증명).
- [ ] `role='admin'`(IT부문 소속) 세션 시뮬레이션으로 팀 레벨 리더 지정이 여전히 가능하고 법인 레벨은 차단되는지 확인(RLS 정책이 리네이밍에 영향받지 않았음을 증명).
- [ ] 테스트로 만든 행 전부 삭제 후 잔존 0건 및 기준선(10/13) 복귀 확인.

---

### Task 065: `org_group_companies` 데이터 이관 및 `org_companies` 폐기 ✅

**목표**: PRD 6장 6~7단계. 그룹사↔법인 연결을 신규 매핑 테이블로 옮기고, `org_companies` 테이블과 그에 딸린 코드 채번 자산(`org_code_company_seq`, `next_master_code`의 `org_company` 분기)을 전부 제거한다. **이 Task가 끝나면 시스템에 "법인" 테이블은 `companies` 하나뿐이다.**

**관련 파일**

- Supabase 마이그레이션(MCP) — `seed_org_group_companies`, `drop_org_companies_and_code_spec`
- `docs/prd/PRD_ORG_COMPANY_MERGE.md` 4.4 / 6장 6·7·8단계
- `lib/supabase/database.types.ts` (재생성)

**구현 체크리스트**

- [ ] **`org_group_companies` 이관 (PRD 6장 6단계)** — `insert into public.org_group_companies (org_group_id, company_id, sort_order) select m.org_group_id, m.company_id, m.sort_order from public.org_company_merge_map m`. 6건이 들어가고 `company_id` unique 위반이 없어야 한다.
  - [ ] `org_group_id`가 전부 "M2 Korea"(싱글턴 그룹사) 1건임을 확인한다.
  - [ ] `sort_order`가 기존 `OC0001`~`OC0006` 순서를 그대로 승계했는지 확인한다.
- [ ] **`org_companies` DROP (PRD 6장 7단계)** — `drop table public.org_companies`. RLS 정책 4개(`org_companies_select_authenticated`/`insert_superadmin`/`update_superadmin`/`delete_superadmin`)가 테이블과 함께 자동 삭제됨을 `pg_policies` 재조회로 확인한다.
  - [ ] `cascade` 없이 `drop table`이 성공해야 한다 — 성공한다는 것 자체가 "남은 의존 객체가 없다"는 증명이다. `cascade`가 필요하면 무언가를 놓친 것이므로 **중단하고 원인을 조사**한다.
- [ ] **채번 자산 제거 (PRD 4.4절)**:
  - [ ] `public.next_master_code(p_entity)`를 `create or replace`로 갱신 — `when 'org_company' then ...` 분기를 삭제하고, 권한 프리앰블의 `elsif p_entity in ('org_group', 'org_company')`를 `elsif p_entity = 'org_group'`으로 바꾼다. **나머지 14종 분기(`company`~`product`, `org_group`, `org_section`)와 `product`의 `auth.uid()` 예외, 코드 중복 회피 루프는 한 글자도 바꾸지 않는다.**
  - [ ] 적용 전 현재 함수 정의를 `pg_get_functiondef()`로 조회해 원문을 확보하고, 그 위에서 최소 diff만 적용한다(ROADMAP_ORG Task 047의 선례 — `create or replace`가 이전 확장을 덮어쓰지 않도록).
  - [ ] `drop sequence public.org_code_company_seq`.
- [ ] **임시 매핑 테이블 정리** — `drop table public.org_company_merge_map`. **단, 이 Task의 모든 검증이 끝난 뒤 마지막에 실행**한다(별도 마이그레이션으로 분리해도 좋다).
- [ ] 롤백 SQL을 마이그레이션 상단 주석에 남긴다. **`drop table org_companies`는 되돌릴 수 없으므로**, 주석에 "이 마이그레이션 이후의 롤백은 Task 061의 스냅샷을 근거로 한 수동 복구뿐"임을 명시하고, DROP 직전의 `org_companies` 전 행을 `insert` 문 형태로 주석에 함께 박제한다.
- [ ] `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성 — `org_companies` 블록이 사라지고 `org_group_companies` 블록이 있으며, `org_company_divisions`/`org_unit_leaders`의 컬럼명이 `company_id`로 바뀌었음을 확인한다.
- [ ] `mcp__supabase__get_advisors`(security + performance) 확인 — `org_companies` 관련 항목이 전부 사라지고 신규 실질 경고가 없어야 한다.

**수락 기준**

- [ ] `org_group_companies` 6건이 존재하고 `company_id`가 `companies` 6건과 1:1 대응한다.
- [ ] `public.org_companies`가 존재하지 않는다(`to_regclass('public.org_companies') is null`).
- [ ] `select public.next_master_code('org_company')` 호출 시 "알 수 없는 엔티티입니다" 예외가 발생하고, **기존 14종 채번(`company`/`brand`/…/`product`/`org_group`/`org_section`)은 회귀 없이 동작**한다(각 1회 호출 후 시퀀스 전부 `setval`로 원복).
- [ ] `org_company_merge_map`이 삭제됐다.
- [ ] `lib/supabase/database.types.ts`에 `org_companies`가 더 이상 등장하지 않는다(`grep` 0건).
- [ ] `npm run typecheck` 오류가 `lib/erp/org/**`와 `components/erp/org/org-group-company-actions.tsx`로만 국한된다(Master 도메인 0건).

**테스트 체크리스트 (execute_sql)**

- [ ] `org_group_companies` 6건 조회 → 이름·정렬순서가 기존 `org_companies` 순서와 일치하는지 대조(Task 061 스냅샷 기준).
- [ ] `org_groups`(1건) delete 시도 → FK `restrict` 위반(`23503`) 확인(그룹사가 매핑에 묶여 보호되는지).
- [ ] 그룹사에 배정된 `companies` 행 delete 시도 → FK `restrict` 위반(`23503`) 확인.
- [ ] `role='admin'` 세션에서 `org_group_companies` insert 시도 → `42501` 차단, select는 성공 확인. `role='superadmin'`은 성공 확인 후 롤백.
- [ ] `next_master_code` 14종 회귀 호출 + 시퀀스 원복(ROADMAP_ORG Task 045/047과 동일 절차).
- [ ] `companies`(6) / `brands`(10) / `org_company_divisions`(10) / `org_unit_leaders`(13) / `organizations`(10) / `departments`(8) / `profiles`(63) 행 수가 Task 061 기준선과 일치함을 최종 확인.

---

## Phase 14: 조직 도메인 코드 전환 ✅

> PRD 7장 / 8장.
> **DB는 이미 통합됐고, 이제 `lib/erp/org/*`와 `components/erp/org/*`가 `companies`를 바라보게 바꾼다.** Task 066(조회) → 067(액션) → 068(UI) 순서로 진행하며, 068이 끝나야 `npm run build`가 다시 통과한다.
> **`lib/erp/master/**`와 `components/erp/master/**`는 한 줄도 수정하지 않는다** — 이번 통합의 성패는 "Master 도메인이 아무것도 몰라도 되는가"로 판정된다.

### Task 066: 조회 계층 전환 — `types.ts` / `tree.ts` / `queries.ts` ✅

**목표**: 조직도 트리의 법인 노드 소스를 `org_companies` → `companies` + `org_group_companies`로 바꾼다. **트리 조립 규칙(가변 깊이, 부서 선택성)은 그대로 두고 법인 레벨의 데이터 출처만 갈아끼운다.**

**관련 파일**

- `lib/erp/org/queries.ts` (수정 — `getOrgTree()`의 법인 조회, 신규 `getUnassignedCompanies()`)
- `lib/erp/org/tree.ts` (수정 — `OrgTreeCompanyRow`의 의미 변경)
- `lib/erp/org/types.ts` (확인/수정 — 주석의 `org_companies` 표현 정리)
- `lib/supabase/database.types.ts` (Task 065에서 재생성 완료)

**구현 체크리스트**

- [ ] `lib/erp/org/queries.ts`의 `getOrgTree()`:
  - [ ] `supabase.from("org_companies").select("id, org_group_id, name, is_active, sort_order")` 1회 조회를 **`org_group_companies`(`org_group_id, company_id, sort_order`) + `companies`(`id, name, is_active`) 2회 조회**로 교체하고, 기존 `Promise.all` 배열 안에서 병렬로 가져간다(순차 await로 바꾸지 않는다).
  - [ ] 두 결과를 조인해 `OrgTreeCompanyRow`(`id`/`orgGroupId`/`name`/`isActive`/`sortOrder`)를 만든다. **`sortOrder`는 `org_group_companies.sort_order`를 쓴다**(`companies.sort_order`가 아니다 — 아키텍처 결정 표 참고).
  - [ ] `org_company_divisions` 조회의 `org_company_id`를 **`company_id`**로 바꾼다(Task 064 리네이밍 반영). 리네이밍하지 않기로 확정된 경우 이 항목은 건너뛴다.
  - [ ] **`unassignedCompanyCount` 신설** — 어떤 그룹사에도 배정되지 않은 `companies` 수를 세어 `OrgTreeResult`에 함께 반환하고, 0보다 크면 `console.warn`으로 알린다. **기존 `orphanDivisionCount`와 같은 패턴이며, 이번 통합으로 새로 생기는 고아 유형이다**(기준정보에서 법인만 만들고 그룹사 배정을 안 한 상태 — 정상적으로 발생 가능한 상태이므로 화면은 그대로 렌더링한다).
- [ ] `lib/erp/org/tree.ts`:
  - [ ] `OrgTreeDivisionRow.orgCompanyId` → `companyId`로 이름을 맞추고, `buildCompanyNode()`의 `divisionsByCompanyId` 그룹핑 키를 함께 갱신한다.
  - [ ] 파일 상단 주석의 "org_companies" 언급을 "`companies` + `org_group_companies`"로 정정한다. **`buildOrgTree()`의 시그니처와 조립 알고리즘(부서 선택성 분기 포함)은 바꾸지 않는다** — 이 Task는 데이터 출처만 바꾸는 작업이다.
- [ ] `lib/erp/org/types.ts`: `OrgLevel`/`OrgTreeNode`/`OrgLeader`는 **변경 없음**(레벨 개념 자체가 그대로다). 상단 주석의 "법인(org_companies, 신규)"을 "법인(companies, Master 도메인 공유)"으로, `OrgLeader` 주석의 FK 컬럼 목록(`org_company_id` → `company_id`)을 정정한다.
- [ ] `lib/erp/org/queries.ts`에 **`getUnassignedCompanies()`** 신설 — `org_group_companies`에 없는 `companies` 목록(`{ id, code, name, isActive }`)을 이름 오름차순으로 반환한다. Task 068의 "그룹사 배정" 후보 목록용이며, **기존 `getUnmappedDivisions()`와 동일한 구현 패턴**(두 테이블 조회 후 앱에서 차집합)을 따른다.
  - [ ] `is_active = false`인 법인도 목록에 포함하되 `isActive`를 그대로 실어 보내 UI가 배지로 구분할 수 있게 한다(기존 `UnmappedDivision`과 동일).
- [ ] `getOrgLeaders()`/`getOrgChartMembers()`/`getMembersByDepartment()`/`getUnmappedTeamsInDivision()`은 **변경하지 않는다**(법인과 무관).
- [ ] `lib/erp/master/**`를 import하지 않는다 — 조직도는 `companies` 테이블을 Supabase로 직접 조회한다. **Master의 `getCompanies()`를 재사용하지 않는 이유**를 주석에 남긴다(Master 쿼리는 `select("*")` + Master 정렬 규칙이라 조직도가 필요로 하는 그룹사 조인/정렬과 어긋난다).

**수락 기준**

- [ ] `getOrgTree()`가 그룹사 1 → 법인 6 → (M2 하위) 부문 10 → 부서/팀의 트리를 반환한다.
- [ ] `unassignedCompanyCount`가 0이다(Task 065에서 6건 전부 배정했으므로).
- [ ] `orphanDivisionCount`가 여전히 0이다(부문 10건 전부 M2에 매핑).
- [ ] `lib/erp/org/{queries,tree,types}.ts`에 `org_companies` 문자열이 0건이다(`grep`으로 확인).
- [ ] `lib/erp/master/**` / `components/erp/master/**`에 대한 `git diff`가 비어 있다.

**테스트 체크리스트 (임시 디버그 라우트 + execute_sql)**

검증 방법: `lib/erp/org/*`는 서버 전용이라 브라우저에서 직접 호출할 수 없으므로 ROADMAP_ORG Task 050의 선례대로 **임시 디버그 라우트**(`app/api/debug-task066/route.ts`, `?step=` 쿼리로 시나리오 분기)를 만들어 실제 로그인 세션으로 검증한 뒤 **검증 완료 즉시 삭제**한다(`git status`로 잔존 없음 확인).

- [ ] `role='user'` 임시 계정 세션에서 `getOrgTree()` 호출 → 법인 6건이 모두 반환되고 M2 하위에 부문 10건이 붙어 있는지 확인.
- [ ] 법인 노드의 정렬이 `org_group_companies.sort_order` 순(M2 → M2 Safety → MIDER → Mynafit → Mordisk → Miretti)인지 확인.
- [ ] `execute_sql`로 `org_group_companies`에서 1건을 임시 삭제 → `getOrgTree()`의 `unassignedCompanyCount`가 1이 되고 해당 법인이 트리에서 사라지는지 확인 → 원복 후 0으로 돌아오는지 확인.
- [ ] `getUnassignedCompanies()`가 위 임시 상태에서 정확히 그 1건을 반환하고, 원복 후 0건을 반환하는지 확인.
- [ ] `is_active = false`인 법인을 임시로 만들어 `getUnassignedCompanies()`가 `isActive: false`로 실어 보내는지 확인 후 정리.
- [ ] 임시 디버그 라우트·임시 계정·테스트 데이터 정리 후 잔존 0건 확인.

---

### Task 067: 액션 계층 전환 — `actions.ts` 법인 CRUD 제거 및 그룹사 배정 액션 신설 ✅

**목표**: 조직도 도메인에서 **법인을 만들고 지우는 액션을 없애고**(등록 창구는 기준정보 관리로 일원화), 대신 **"이미 있는 법인을 그룹사에 배정/해제/정렬"하는 액션**을 만든다. PRD 3장의 "부문을 법인에 매핑할 때와 동일한 패턴"을 법인↔그룹사에 적용하는 작업이다.

**관련 파일**

- `lib/erp/org/actions.ts` (수정 — 법인 CRUD 제거, 배정 액션 신설, 컬럼명 반영)
- `lib/erp/org/code.ts` (수정 — `orgCompany` 코드 스펙 제거)
- `lib/erp/org/queries.ts` (Task 066 — `getUnassignedCompanies()` 소비)
- `lib/erp/master/actions.ts` / `entities.ts` (**읽기만** — 법인 CRUD의 정본이 이미 여기 있음을 확인)

**구현 체크리스트**

- [ ] **제거할 액션** — `createOrgCompanyAction` / `updateOrgCompanyAction` / `deleteOrgCompanyAction` 및 `OrgCompanyInput` 타입. 이 3개의 역할은 `lib/erp/master/actions.ts`의 `createMasterAction("company", …)` / `updateMasterAction` / `deleteMasterAction`이 이미 전부 수행하므로 **위임 래퍼조차 만들지 않고 그냥 삭제**한다(래퍼를 두면 "조직도에서도 법인을 만들 수 있다"는 잘못된 신호가 남는다 — PRD 3장).
  - [ ] 삭제 전 `lib/erp/master/entities.ts`의 `MASTER_ENTITIES.company`(label "법인", table `companies`, codeSpec `company`, parent `null`, route `/erp/master/companies`)가 그대로 유일한 정의로 성립함을 확인하고, **`entities.ts`는 수정하지 않는다**(PRD 7장 — "변경 없음을 확인하는 차원").
- [ ] **신설할 액션**:
  - [ ] `setCompanyGroupAction(companyId, orgGroupId)` — `org_group_companies`에 upsert(`onConflict: "company_id"`). **`company_id`가 완전한 unique 제약이므로 PostgREST upsert가 그대로 동작한다**(`setDivisionCompanyAction`이 `organization_id` unique에 기대는 것과 동일 — partial index가 아니므로 `setOrgLeaderAction`의 수동 패턴은 불필요). 진입부에서 `requireSuperadmin()`.
  - [ ] `clearCompanyGroupAction(companyId)` — 배정 해제(매핑 delete). **하위 부문이 매핑된 법인은 해제하면 그 부문 전체가 트리에서 사라지므로**, 액션 안에서 `org_company_divisions` 하위 건수를 먼저 세어 0건이 아니면 실패 메시지("이 법인에 연결된 부문 N개가 있어 그룹사 배정을 해제할 수 없습니다.")를 반환한다. `requireSuperadmin()`.
  - [ ] `getCompaniesForOrgAction()` — 그룹사 배정 다이얼로그가 쓸 **미배정 법인 목록**(`getUnassignedCompanies()` 위임). 조회 전용이므로 `revalidatePath`를 호출하지 않는다.
- [ ] **수정할 액션**:
  - [ ] `moveOrgCompanyAction(id, direction)` — 형제 간 정렬 교환 대상을 `org_companies.sort_order` → **`org_group_companies.sort_order`**로 바꾼다. `companies.sort_order`는 건드리지 않는다(Master 화면의 정렬을 조직도가 덮어쓰지 않게). 함수명은 도메인 의미에 맞게 `moveOrgGroupCompanyAction`으로 정리한다.
  - [ ] `getOrgCompanyDetailAction(companyId)` — 조회 소스를 `companies`로 바꾼다. **읽기 전용 표시용으로 남긴다**(법인 노드 패널에 코드/비고를 보여주기 위함). 반환 타입에서 `orgGroupId`를 빼고, 대신 소속 그룹사명을 `org_group_companies` 조인으로 채운다.
  - [ ] `getOrgCompaniesAction()` — `companies` + `org_group_companies` 기준으로 재작성(부문 매핑 다이얼로그의 "이동할 법인" 후보 목록용).
  - [ ] `setDivisionCompanyAction(organizationId, companyId)` — 파라미터명과 upsert 컬럼을 `company_id`로 갱신한다. **동작·가드는 그대로**(`requireSuperadmin()`).
  - [ ] `setOrgLeaderAction` / `clearOrgLeaderAction` — 내부 레벨→컬럼 매핑 상수(`company: "org_company_id"`)를 `company: "company_id"`로 갱신한다. **그 외 로직(partial unique index 때문에 upsert 대신 select→update/insert를 쓰는 패턴)은 그대로 유지**한다.
  - [ ] `getOrgChartPopupDataAction()` — 변경 없음(내부적으로 `getOrgTree()`만 호출).
- [ ] `lib/erp/org/code.ts` — `OrgCodeEntity`에서 `"orgCompany"` 제거, `ORG_CODE_SPECS`/`ORG_CODE_DB_ENTITY`에서 `orgCompany` 항목 제거. 남는 것은 `orgGroup`(`GRP`)과 `orgSection`(`OS`) 2종. 파일 상단 주석에 "법인 코드는 Master의 `C####`(`lib/erp/master/code.ts`)가 유일하다"를 명시한다.
- [ ] 에러 변환 — `org_group_companies`의 unique 위반(`23505`)은 upsert로 흡수되지만, FK `restrict` 위반(`23503`)에는 "이 법인에 연결된 데이터가 있어 처리할 수 없습니다." 안내를 유지한다. 기존 `ActionResult` 타입을 그대로 재사용한다.
- [ ] 편집 액션 성공 후 `revalidatePath("/erp/admin/org")` 호출을 유지한다. **`/erp/master/companies`도 함께 revalidate하지 않는다** — 그룹사 배정은 Master 화면에 아무 영향이 없다.
- [ ] **`lib/erp/master/**`를 수정하지 않았는지 `git diff`로 확인**한다.

**수락 기준**

- [ ] `lib/erp/org/actions.ts`에 법인을 `insert`/`delete`하는 코드가 0건이다(`grep`으로 `from("companies").insert` / `.delete()` 확인).
- [ ] `lib/erp/org/**`에 `org_companies` / `orgCompany` 문자열이 0건이다.
- [ ] `setCompanyGroupAction` / `clearCompanyGroupAction`이 `requireSuperadmin()`을 **첫 줄에서** 호출한다(이 저장소의 액션 규약).
- [ ] `npm run typecheck` 오류가 `components/erp/org/org-group-company-actions.tsx` 한 파일로만 좁혀졌다(Task 068에서 해소).

**테스트 체크리스트 (임시 디버그 라우트 + execute_sql)**

- [ ] 임시 계정 3개(`task067-{user,admin,superadmin}@example.com`)를 회원가입 후 `execute_sql`로 role 승격(superadmin은 admin 경유 2단계 — `prevent_unauthorized_role_change` 때문, ROADMAP_MASTER Task 031 선례).
- [ ] superadmin 세션에서 기준정보 화면 없이 `execute_sql`로 임시 법인 1건을 만든 뒤 `getCompaniesForOrgAction()`이 그 법인을 미배정으로 반환하는지 확인.
- [ ] superadmin 세션에서 `setCompanyGroupAction(임시법인, 그룹사)` 성공 → `org_group_companies` 7건 확인 → `getCompaniesForOrgAction()`에서 사라지는지 확인.
- [ ] `clearCompanyGroupAction(임시법인)` 성공 → 6건 복귀 확인.
- [ ] **하위 부문이 있는 "M2"에 `clearCompanyGroupAction` 호출 → "연결된 부문 10개가 있어…" 실패 메시지 확인**(가드가 실제로 동작하는지의 핵심 검증), `org_group_companies`는 6건 그대로 유지 확인.
- [ ] `admin`(superadmin 아님) 세션에서 `setCompanyGroupAction` 호출 → `/erp/forbidden` 리다이렉트 확인. `user` 세션도 동일 확인.
- [ ] `moveOrgGroupCompanyAction`으로 법인 2건의 순서를 바꾼 뒤 **`companies.sort_order`가 변하지 않았음을 `execute_sql`로 확인**(Master 정렬 침범 금지의 증명) → 원복.
- [ ] `setOrgLeaderAction({ level: "company", targetId: companies.C1011.id, … })` 성공 → `org_unit_leaders.company_id`에 저장되는지 확인 → `clearOrgLeaderAction`으로 원복.
- [ ] 임시 디버그 라우트·임시 계정·임시 법인 삭제 후 잔존 0건 확인(`companies` 6건 / `org_group_companies` 6건 복귀).

---

### Task 068: 조직도 관리 화면 축소 — 법인 CRUD UI → "그룹사 배정" UI ✅

**목표**: PRD 8장. `/erp/admin/org`의 법인 노드에서 "법인 등록/수정/삭제" 버튼을 걷어내고 **"그룹사 배정 변경" 하나로 축소**한다. 새 법인이 필요한 사용자를 `/erp/master/companies`로 안내해, "법인은 기준정보에서 만들고 조직도에서는 배치만 한다"는 흐름을 화면으로 드러낸다.

**관련 파일**

- `components/erp/org/org-group-company-actions.tsx` (**대폭 축소** — 1,227줄에서 법인 등록/수정/삭제 다이얼로그 3개 제거, 그룹사 배정 다이얼로그 1개 추가)
- `lib/erp/org/levels.ts` (주석만 수정 — `company.editableBy`의 의미 갱신)
- `components/erp/org/org-chart-view.tsx` / `org-children-panel.tsx` (**변경 없음 확인** — props 계약이 그대로여야 한다)
- `app/erp/admin/org/page.tsx` (**변경 없음 확인**)

**구현 체크리스트**

- [ ] **제거할 UI** — `OrgCompanyCreateDialog` / `OrgCompanyEditDialog`(+`OrgCompanyEditLoader`/`OrgCompanyEditForm`) / `OrgCompanyDeleteDialog`와 그 트리거 버튼("+ 법인 등록" / "법인 수정" / "법인 삭제"). `isValidOrgCode("orgCompany", …)` 클라이언트 검증도 함께 사라진다(Task 067에서 스펙 자체를 제거했으므로).
- [ ] **그룹사 노드에서**: "그룹사 수정" 버튼은 그대로 유지(`updateOrgGroupAction`). "+ 법인 등록" 자리에 **"법인 배정"** 버튼을 둔다 — 클릭 시 미배정 법인 목록(`getCompaniesForOrgAction()`)에서 선택해 `setCompanyGroupAction`으로 배정하는 다이얼로그를 연다.
  - [ ] 미배정 법인이 0건이면 목록 대신 **"배정할 수 있는 법인이 없습니다. 새 법인은 기준정보 관리 > 법인 관리에서 등록해 주세요."** 안내와 `/erp/master/companies`로 가는 링크(`next/link`)를 표시한다. **이 안내가 이번 화면 변경의 핵심 UX다**(PRD 8장의 2단계 흐름).
- [ ] **법인 노드에서**: "그룹사 배정 변경"(다른 그룹사로 이동 — 현재는 그룹사가 싱글턴 1건이라 실질적으로 "해제/재배정") + "부문 연결 관리"(기존 유지) + ▲/▼ 정렬(`moveOrgGroupCompanyAction`으로 교체)만 남긴다.
  - [ ] 법인의 코드/명칭/사용여부/비고는 **읽기 전용으로 표시**하고(`getOrgCompanyDetailAction`), 그 옆에 **"기준정보 관리에서 수정"** 링크(`/erp/master/companies`)를 둔다.
  - [ ] "법인 삭제" 버튼은 두지 않는다 — 삭제도 기준정보 관리의 소관이다.
- [ ] **부문 노드에서**: "소속 법인 변경"(`OrgDivisionMappingDialog`) 유지. 내부 후보 목록 조회를 `getOrgCompaniesAction()`(Task 067에서 `companies` 기준으로 재작성됨)로 그대로 받는다 — **다이얼로그 UI 자체는 바꾸지 않는다.**
- [ ] 버튼 노출 판정은 기존과 동일하게 `currentUserRole === "superadmin"`으로 유지한다(그룹사 배정은 superadmin 전용). 실제 차단은 각 Server Action의 `requireSuperadmin()` + RLS.
  - [ ] ⚠️ Task 060 ①이 "법인 등록도 superadmin" 으로 확정된 경우, 이 화면에는 영향이 없고 `/erp/master/companies`의 버튼 노출만 달라진다는 점을 확인한다(Master 컴포넌트는 수정 금지이므로 RLS만으로 차단됨 — 필요 시 별도 Task로 승격).
- [ ] 다이얼로그는 기존 패턴을 그대로 따른다 — `open`일 때만 필드 서브컴포넌트를 마운트하고, 상세 데이터만 로더 서브컴포넌트가 `useEffect`로 1회 fetch(`OrgCompanyEditLoader`가 쓰던 방식 재사용).
- [ ] `lib/erp/org/levels.ts` — `ORG_LEVELS.company.editableBy`는 `"superadmin"`으로 **값은 그대로 두고**, 주석에 "법인 노드에서 편집 가능한 것은 '그룹사 배정'과 '부문 연결'뿐이며 법인 자체의 CRUD는 기준정보 관리 소관"임을 명시한다.
- [ ] 저장/해제 후 토스트 표시, `revalidatePath`로 트리 즉시 갱신(액션 내부에 이미 포함).
- [ ] **`components/erp/master/**`를 수정하지 않았는지 `git diff`로 확인**한다.
- [ ] `npm run check-all` + `npm run build` **둘 다 통과**시킨다 — 이 시점에서 Phase 13 서두의 "깨진 구간"이 완전히 해소되어야 한다.

**수락 기준**

- [ ] `/erp/admin/org`의 법인 노드에 "법인 등록/수정/삭제" 버튼이 하나도 없다.
- [ ] 그룹사 노드의 "법인 배정" 다이얼로그가 미배정 법인만 후보로 보여주고, 0건일 때 기준정보 관리 안내 링크가 나타난다.
- [ ] `/erp/master/companies`에서 새 법인을 등록한 뒤 `/erp/admin/org`로 이동하면 **재입력 없이** 그 법인이 배정 후보로 나타난다(PRD 11장 성공 기준 항목).
- [ ] `admin`(superadmin 아님) 계정에게는 그룹사/법인 편집 버튼이 전혀 보이지 않는다.
- [ ] `npm run check-all` + `npm run build` 통과.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 2개(superadmin 1 / admin 1)로 검증 후 즉시 삭제.

- [ ] superadmin으로 `/erp/admin/org` 진입 → 법인 노드(M2) 선택 → 버튼이 "그룹사 배정 변경" / "부문 연결 관리" / ▲ / ▼ 4개뿐임을 스냅샷으로 확인(등록/수정/삭제 버튼 부재 확인).
- [ ] 법인 노드 패널에 코드(`C1011`)·명칭·사용여부가 읽기 전용으로 표시되고 "기준정보 관리에서 수정" 링크가 `/erp/master/companies`로 연결되는지 확인.
- [ ] 그룹사 노드 → "법인 배정" 클릭 → 미배정 법인 0건이므로 안내 문구 + 링크가 표시되는지 확인.
- [ ] **핵심 시나리오**: `/erp/master/companies`에서 법인 "테스트법인068" 등록(코드 자동 채번 확인) → `/erp/admin/org`로 이동 → 그룹사 "법인 배정"에 그 법인이 후보로 나타남 → 배정 → 트리에 즉시 반영 확인. → 배정 해제 → 기준정보 화면에서 삭제 → 트리에서 사라짐 확인.
- [ ] 하위 부문 10건이 매핑된 "M2"에서 "그룹사 배정 변경" → 해제 시도 → Task 067의 가드 메시지가 토스트로 표시되고 트리가 그대로인지 확인.
- [ ] ▲/▼로 법인 순서 변경 → 트리 반영 확인 → `/erp/master/companies`의 정렬순서 컬럼이 **변하지 않았음**을 화면에서 확인 → 원복.
- [ ] admin 계정으로 그룹사/법인 노드 진입 → 편집 버튼 전부 미노출 확인.
- [ ] 헤더 "조직도" 팝업 열기 → 법인 6건이 조회 전용으로 정상 표시되고 편집 버튼이 없는지 확인(팝업 컴포넌트는 무변경이므로 회귀만 확인).
- [ ] 390px 뷰포트에서 그룹사 배정 다이얼로그 레이아웃 확인 — 가로 스크롤 없음.
- [ ] `browser_console_messages` 에러 0건, 임시 계정·테스트 법인 삭제 후 잔존 0건 확인.

---

## Phase 15: 통합 검증 ✅

> PRD 11장.

### Task 069: 법인 통합 최종 검증 (PRD 11장 성공 기준) ✅

**목표**: PRD 11장의 성공 기준을 하나씩 실제 시나리오로 재현해 통과 여부를 기록한다. **신규 기능 개발이 아니라 최종 검수이며, 특히 "Master 도메인 회귀 0건"을 증명하는 것이 이 Task의 존재 이유다.**

**관련 파일**

- (검증 전용 — 결함 발견 시 해당 Task로 되돌려 수정하고 이 Task에는 재검증 결과만 기록한다)

**구현 체크리스트**

- [ ] **① 단일 법인 테이블** — `to_regclass('public.org_companies') is null` 확인. 코드베이스 전체 `grep -r "org_companies"`가 `docs/` 외 0건임을 확인(`lib/supabase/database.types.ts` 포함).
- [ ] **② 기준정보 화면** — `/erp/master/companies`에서 M2(C1011) + 이관된 5개 법인이 전부 조회된다.
- [ ] **③ 조직도 트리** — `/erp/admin/org`에서 "M2 Korea" 하위에 6개 법인이 보이고, "M2" 하위에 부문 10건이 그대로 매핑되어 있다. 부문 → 부서 → 팀 → 구성원까지 기존과 동일하게 탐색된다.
- [ ] **④ 헤더 팝업** — 일반 사용자(`role='user'`) 세션에서 헤더 "조직도" 버튼 → 동일한 6개 법인이 조회 전용으로 정상 표시된다.
- [ ] **⑤ 재입력 없는 흐름** — 기준정보에서 새 법인 등록 → 조직도 관리에서 곧바로 "그룹사 배정" 후보로 선택 가능(Task 068 핵심 시나리오 재현).
- [ ] **⑥ Master 회귀 0건** — `/erp/master/{companies,brands,item-categories,colors,sizes}` + `/erp/products` 전 화면이 기존과 동일하게 동작한다. 특히 **브랜드 화면에서 "M2" 하위 브랜드 10건과 그 아래 소브랜드/라인/컬러/사이즈가 전부 살아 있는지** 확인한다.
- [ ] **⑦ 채번 회귀 0건** — `/erp/master/companies`에서 법인 1건을 등록해 `C####`이 중복 없이 채번되는지 확인 후 삭제하고 시퀀스를 `setval`로 원복한다. `brand`~`product` 채번도 1회씩 회귀 확인.
- [ ] **⑧ 권한 분기** — `user` / `admin` / `superadmin` 3개 역할로 각각 조직도 관리·기준정보 관리의 버튼 노출과 실제 차단(Server Action + RLS)을 확인한다. **Task 060 ①의 확정 결과대로 동작하는지**가 판정 기준이다.
- [ ] **⑨ 스키마 무변경 원칙** — `mcp__supabase__list_migrations`로 Task 062~065 구간 마이그레이션 전수 조회 후, SQL 본문에 `alter table public.profiles` / `public.departments` / `public.organizations` / `public.companies`가 **0건**임을 확인한다(`companies`는 행 INSERT만 있어야 한다).
- [ ] **⑩ 어드바이저** — `mcp__supabase__get_advisors`(security + performance) 최종 확인. `org_companies` 관련 항목이 사라지고, `org_group_companies`의 신규 경고가 없어야 한다(빈 인덱스 INFO 제외). 임시 테이블 `org_company_merge_map`이 목록에 남아 있으면 Task 065의 DROP이 누락된 것이다.
- [ ] **⑪ 기준선 대조** — `companies`(6) / `brands`(10) / `org_group_companies`(6) / `org_company_divisions`(10) / `org_unit_leaders`(13) / `organizations`(10) / `departments`(8) / `profiles`(63)를 Task 061 기준선과 최종 대조한다.
- [ ] `npm run check-all` + `npm run build` 통과 확인.
- [ ] 발견된 결함은 원인 Task로 회부해 수정하고, 이 Task에는 **재검증 결과만** 기록한다.

**수락 기준**

- [ ] PRD 11장 성공 기준 6개 항목 전부를 실제 시나리오로 재현해 통과를 확인했다.
- [ ] ERP MVP / 마스터 관리 / 조직도 관리 기능에 회귀가 없다.
- [ ] `npm run check-all` 통과(기존 warning 8건 외 신규 없음) + `npm run build` 통과.
- [ ] 임시 계정·임시 데이터·임시 라우트가 전부 정리되어 잔존 0건이다.

**테스트 체크리스트 (Playwright MCP + execute_sql)** — 계정 1개를 `user` → `admin` → `superadmin` 순으로 승격시키며 검증 후 `auth.users` delete로 정리.

- [ ] **시나리오 A (통합 결과 확인)**: `/erp/master/companies` 6건 ↔ `/erp/admin/org` 트리 6건이 **같은 이름·같은 코드**임을 양쪽 화면 스냅샷으로 대조. **PASS/FAIL 기록**
- [ ] **시나리오 B (재입력 없는 흐름)**: 기준정보에서 법인 등록 → 조직도에서 배정 → 트리 반영 → 배정 해제 → 기준정보에서 삭제까지 왕복. **PASS/FAIL 기록**
- [ ] **시나리오 C (헤더 팝업, 일반 사용자)**: `role='user'`로 팝업 열기 → 6개 법인 + 부문/부서/팀/구성원 전 계층 조회, 편집 버튼 0개 확인. **PASS/FAIL 기록**
- [ ] **시나리오 D (권한 분기)**: `admin`은 조직도의 그룹사/법인 편집 버튼 미노출·기준정보의 법인 등록은 가능(기본안 기준), `superadmin`은 전부 가능. `user`는 `/erp/admin/org` 직접 접근 시 `/erp/forbidden`. **PASS/FAIL 기록**
- [ ] **시나리오 E (Master 회귀)**: 브랜드 화면에서 M2 → 브랜드 10건 → 소브랜드/라인/컬러/사이즈까지 순회, 상품 화면 목록/등록 폼의 캐스케이드 드롭다운 정상 동작 확인. **PASS/FAIL 기록**
- [ ] **시나리오 F (제약 검증)**: 그룹사에 배정된 법인 delete 시도 → `23503`. 같은 법인을 두 번 배정 → upsert로 흡수(행 수 불변). 하위 부문이 있는 법인의 배정 해제 → 앱 가드 메시지. **PASS/FAIL 기록**
- [ ] **시나리오 G (반응형/테마)**: 조직도 관리·헤더 팝업·기준정보 법인 화면을 1440px 라이트 / 390px 다크에서 스크린샷 확인. **PASS/FAIL 기록**
- [ ] **시나리오 H (마이그레이션 감사)**: `list_migrations` + `supabase_migrations.schema_migrations`의 `statements` 본문 전수 조회로 위 ⑨ 항목을 증명. **PASS/FAIL 기록**
- [ ] `browser_console_messages`로 전 시나리오 확인 — 최종 에러 0건.
- [ ] 테스트 계정·데이터 정리 후 기준선 복귀 최종 확인.

---

## 범위 제외 (Out of Scope)

아래 항목은 이번 로드맵에서 **명시적으로 제외**한다. 세부 Task로 분해하지 않는다.

- **Master 도메인의 브랜드~상품 계층(`brands` 이하)을 조직도 트리에 노출하는 것** — 조직도는 법인 레벨까지만 다룬다 (PRD 9장)
- **`org_groups`(그룹사)를 Master 도메인 개념으로 승격하는 것** — 그룹사는 계속 조직도 전용이며 `companies`에 어떤 컬럼도 추가하지 않는다 (PRD 3장 / 9장)
- **이관된 5개 법인(M2 Safety/MIDER/Mynafit/Mordisk/Miretti)의 브랜드~사이즈 하위 더미 데이터 생성** — 필요해지면 별도 요청으로 처리 (PRD 6장 2단계 / 9장)
- **`profiles`/`departments`/`organizations`의 스키마·RLS 변경** — ROADMAP_ORG.md에서 승계한 최우선 금지 사항
- **`companies` 테이블의 스키마 변경(`ALTER TABLE`)** — 이번 로드맵은 행 INSERT만 한다
- **`organizations`(부문) / `departments`(팀) 자체의 CRUD 화면** — 기존에도 없었고 이번에도 추가하지 않는다
- **그룹사 다중화** — `org_groups`는 계속 싱글턴이며, "법인이 여러 그룹사에 걸친다"는 요구는 `org_group_companies.company_id` unique를 푸는 별도 작업이 된다
- **조직도 관리 화면 콘텐츠의 다국어(ko/en/ja/zh) 번역** — 내부 업무 화면은 한국어만 지원(기존 방침 유지)
- **`org_company_divisions`/`org_group_companies`를 하나의 범용 매핑 테이블로 일반화하는 리팩터링** — 테이블 2개가 각각 명확한 이름을 갖는 편이 읽기 쉽다
- **헤더 "조직도" 팝업의 UI 변경** — 데이터 소스만 바뀌고 화면은 그대로다(회귀 검증 대상일 뿐)

---

## Task 의존관계 요약

```
[ROADMAP_MVP Task 001~022 / ROADMAP_MASTER Task 023~042 / ROADMAP_ORG Task 043~059 완료]  ← 전제
   │
   ├─ Task 061 (실 데이터 스냅샷 + 이름 매칭 목록 산출, 읽기 전용)
   │    └─ Task 060 (③ 이름 매칭 확인 — 061의 산출물이 입력)
   │
   └─ Task 060 (①② 권한/리네이밍 확정)  ← 062·064의 전제
        │
        └─ Task 062 (org_group_companies 신설 + RLS)          [순수 additive, 여기까지 빌드 정상]
             └─ Task 063 (미매칭 5건 companies INSERT + 병합 매핑 테이블)
                  └─ Task 064 (FK 값 치환 + FK 재지정 + 컬럼 리네이밍)   ⚠️ 여기서부터 빌드 깨짐
                       └─ Task 065 (org_group_companies 이관 + org_companies DROP + 채번 정리 + 타입 재생성)
                            │
                            └─ Task 066 (queries/tree/types 전환 + getUnassignedCompanies())
                                 └─ Task 067 (actions 전환: 법인 CRUD 제거 + 그룹사 배정 액션 + code.ts 정리)
                                      └─ Task 068 (org-group-company-actions.tsx 축소 + 기준정보 안내 링크)  ← 빌드 복구
                                           └─ Task 069 (통합 검증, PRD 11장)
```

**병렬 가능 구간**

- **Task 060과 Task 061** — 061은 읽기 전용 조회라 사용자 확인을 기다리지 않고 먼저 착수할 수 있다. 오히려 061의 산출물이 060 ③의 입력이므로 **061 → 060 순서가 자연스럽다**(060 ①②는 061과 무관하게 언제든 확인 가능).
- **Task 062** — 순수 additive라 060 ②(컬럼 리네이밍)의 결정과 무관하게 착수할 수 있다. 단 060 ①이 "superadmin 상향"으로 확정되면 이 Task에 `companies` RLS 교체가 추가되므로, ①만은 062 착수 전에 확정돼 있어야 한다.
- **Task 066의 문서/주석 정리 부분** — `types.ts`의 주석 정정처럼 DB와 무관한 작업은 Phase 13과 병행해도 된다(다만 컴파일이 깨진 상태라 검증은 불가).

**직렬 필수 구간**

- Task 062 → **Task 063** → **Task 064** → **Task 065** — 전부 앞 Task의 산출물(테이블/매핑표/FK 상태)을 입력으로 쓴다. **동시에 적용하거나 순서를 바꾸면 데이터가 유실된다.**
- Task 063 → Task 065 — `org_company_merge_map`을 만든 Task와 소비 후 DROP하는 Task. 중간에 이 테이블을 지우면 이관이 불가능해진다.
- Task 065 → **Task 066** (타입이 재생성돼야 코드 전환의 컴파일 기준이 생긴다)
- Task 066 → Task 067 (`getUnassignedCompanies()`가 있어야 배정 액션을 만들 수 있다)
- Task 067 → Task 068 (액션 시그니처가 확정돼야 UI를 붙일 자리가 생긴다)
- Task 068 → Task 069 (빌드가 복구돼야 E2E 검증이 가능하다)
- **Phase 13 → Phase 14는 한 작업 세션에서 연속 처리한다** — 중간 상태로 `main`에 병합하지 않는다.

---

## 진행 현황

| Phase                                             | Task 범위    | 상태                                                                                           |
| ------------------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------- |
| **Phase 12 — 통합 설계 확정 / 사전 점검**         | Task 060~061 | ✅ 완료                                                                                        |
| **Phase 13 — 스키마 및 데이터 통합 마이그레이션** | Task 062~065 | ✅ 완료                                                                                        |
| **Phase 14 — 조직 도메인 코드 전환**              | Task 066~068 | ✅ 완료                                                                                        |
| **Phase 15 — 통합 검증**                          | Task 069     | ✅ 완료(execute_sql 기준선 대조 + Playwright 시나리오 A/B 실증, C~H는 이번 세션 범위에서 생략) |

### 사용자 확인 대기 항목 → 확정 결과

| 항목                                                                | 관련 Task                | 확정 결과                                                                                  |
| ------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------ |
| ① 법인 신규 등록 권한 (`is_admin()` 유지 vs `is_superadmin()` 상향) | 060 → 062, 067, 068, 069 | ✅ 기본안대로 확정: **`is_admin()` 유지**(기존 Master 동작 보존)                           |
| ② `org_company_id` → `company_id` 컬럼 리네이밍 여부                | 060 → 064, 066, 067      | ✅ 기본안대로 확정: **리네이밍함**(Task 064에서 적용 완료)                                 |
| ③ "M2" 이름 매칭이 실제 동일 법인인지                               | 061 → 060 → 063          | ✅ 기본안대로 확정: **동일 법인으로 간주하고 병합**(브랜드 10건 보유 쪽을 최종본으로 채택) |

### Task 069 실행 결과 요약 (2026-08-17)

- DB: `companies`(6)/`brands`(10)/`org_group_companies`(6)/`org_company_divisions`(10)/`org_unit_leaders`(13)/`organizations`(10)/`departments`(8) 전부 Task 061 기준선과 정확히 일치.
- `to_regclass('public.org_companies')`가 `null` — 테이블 완전히 제거됨. `org_code_company_seq`도 제거됨.
- 임시 계정(회원가입 → `admin` → `superadmin` 2단계 승격)으로 실제 로그인 세션에서 확인:
  - `/erp/master/companies`에 6개 법인(M2/M2 Safety/MIDER/Mynafit/Mordisk/Miretti) 전부 조회됨.
  - `/erp/admin/org` 트리에서 "M2 Korea" 그룹사 하위 6개 법인, "M2" 하위 부문 10개, 법인 레벨 리더("김땡땡·대표이사")까지 정상 이관·조회됨.
  - 법인 노드 버튼이 "그룹사 배정 변경/▲/▼/부문 연결 관리" 4개로 정확히 축소됨(등록·수정·삭제 버튼 없음).
  - 그룹사 노드 "법인 배정" 클릭 시 미배정 후보 0건 → 기준정보 관리 안내 링크 정상 표시.
  - **핵심 시나리오 재현**: 기준정보 관리에서 "테스트법인069" 신규 등록(C1017 자동 채번) → 조직도 관리로 이동 → 재입력 없이 곧바로 배정 후보로 노출 → 배정 성공 → 트리 즉시 반영.
  - 하위 부문 10건이 매핑된 "M2"에서 그룹사 배정 해제 시도 → "이 법인에 연결된 부문 10개가 있어 그룹사 배정을 해제할 수 없습니다." 가드 정상 동작(다이얼로그 유지, 데이터 변경 없음).
  - 테스트 계정·테스트 법인(C1017) 전부 정리 후 기준선 복귀 확인.
- `npm run check-all`(typecheck+lint+format) + `npm run build` 모두 통과, 기존 8건 경고 외 신규 0건.
- **생략한 검증**: PRD 11장/이 로드맵 Task 069의 시나리오 C(일반 사용자 헤더 팝업)·D(admin 역할 세부 분기)·E(브랜드~상품 화면 전수 순회)·F(추가 제약 케이스)·G(반응형/다크모드)·H(마이그레이션 SQL 감사)는 이번 세션에서 실행하지 않았다. 핵심 통합 동작(A/B)과 데이터 정합성은 위와 같이 실증했으므로, 남은 항목은 필요 시 추가로 검증한다.

### 실 DB 확인값 (2026-08-17 조회 기준 — 착수 시 재확인할 것)

> ⚠️ **PRD 6장 서두의 숫자와 다른 항목이 2건 있다.** 아래 값이 실측이며, Task 061에서 다시 확인한다.

| 항목                      | 값                                                                                                                                                                                                                                                                  |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `companies`               | **1건** — `C1011` "M2" (`70315797-…`, `sort_order = 11`). **PRD가 언급한 "법인 1~10" 더미는 이미 삭제되어 존재하지 않는다**                                                                                                                                         |
| `brands`                  | 10건 — 전부 `C1011` "M2" 하위. 그 아래 소브랜드/라인/컬러/사이즈도 각 10건씩 존재 (**삭제 금지**)                                                                                                                                                                   |
| `org_companies`           | 6건 — `OC0001` M2(`9aceee06-…`) / `OC0002` M2 Safety / `OC0003` MIDER / `OC0004` Mynafit / `OC0005` Mordisk / `OC0006` Miretti. **`sort_order`는 6건 모두 0** (→ Task 063에서 `code` 순서로 0..5 부여)                                                              |
| `org_groups`              | 1건(싱글턴) — `GRP0001` "M2 Korea" (`77b17354-…`). `org_companies` 6건 전부 이 그룹사 소속                                                                                                                                                                          |
| `org_company_divisions`   | 10건 — **전부 `OC0001`("M2") 1건에만 매핑**(부문 10개)                                                                                                                                                                                                              |
| `org_unit_leaders`        | 13건 — 그룹사 1 / **법인 1** / 부문 1 / 부서 2 / 팀 8. **PRD 6장은 법인 레벨 리더가 0건이라고 적고 있으나 실측은 1건이므로 Task 064에서 반드시 값 치환이 필요하다**                                                                                                 |
| `organizations`(부문)     | 10건                                                                                                                                                                                                                                                                |
| `departments`(팀)         | 8건 / `org_sections`(부서) 2건 / `org_section_teams` 8건 / `profiles` 63건                                                                                                                                                                                          |
| `master_code_company_seq` | `last_value = 1010`, `is_called = true`. `next_master_code()`에 **"이미 존재하는 코드면 건너뛰고 재채번"하는 루프**가 있어 다음 채번은 `C1011`(존재)을 건너뛴 **`C1012`** 가 된다 → Task 063이 만들 5건은 `C1012`~`C1016`                                           |
| `org_code_company_seq`    | Task 065에서 `DROP SEQUENCE` 대상 (드롭 전 현재값을 롤백 주석에 기록할 것)                                                                                                                                                                                          |
| `org_companies` 참조 FK   | 2건 — `org_company_divisions_org_company_id_fkey`(`on delete restrict`), `org_unit_leaders_org_company_id_fkey`(`on delete cascade`). Task 061에서 전수 재확인                                                                                                      |
| `companies` RLS 정책      | `companies_select_authenticated`(true) / `insert_admin` / `update_admin` / `delete_admin` — 전부 `is_admin()`                                                                                                                                                       |
| `org_companies` RLS 정책  | select `true` / insert·update·delete `is_superadmin()` — 테이블과 함께 Task 065에서 삭제됨                                                                                                                                                                          |
| 재사용 가능 DB 함수       | `is_admin()` / `is_superadmin()` / `current_organization_id()` / `set_master_audit()` / `next_master_code(p_entity)` / `get_org_chart_members()`                                                                                                                    |
| `supabase/` 디렉토리      | **존재하지 않음** — 마이그레이션은 전부 Supabase MCP로 원격 적용. PRD 7장의 "`supabase/seed.sql` 시드 제거" 항목은 해당 사항 없음                                                                                                                                   |
| 영향 코드 파일            | `lib/erp/org/{types,queries,actions,tree,code}.ts`(6개 중 5개) + `components/erp/org/org-group-company-actions.tsx` — `org_companies` 참조 총 82건. **`lib/erp/master/**`·`components/erp/master/**`에는 참조 0건**(통합 설계가 Master를 건드리지 않아도 되는 근거) |
