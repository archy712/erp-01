# 법인 테이블 통합(companies ↔ org_companies) PRD

> 이 문서는 서로 다른 두 도메인에 중복으로 존재하는 "법인" 개념 — 기준정보 관리(Master) 도메인의 `companies`와 조직도(Org) 도메인의 `org_companies` — 을 **`companies` 하나로 완전 통합**하기 위한 PRD다. `PRD_ORG.md` 4.4절은 두 "법인"을 "실제로는 같은 회사를 가리킬 수 있지만 이번 범위에서는 도메인을 분리한다"고 명시하며 `org_companies.master_company_id` FK 추가를 향후 검토 과제로 남겼는데, 이번 문서에서 그 다음 단계로 넘어가 **`org_companies`를 폐기하고 조직도가 `companies`를 직접 참조**하도록 만든다. `companies`/`brands`/`organizations`/`departments` 등 기존 테이블은 이번에도 구조를 함부로 바꾸지 않는 원칙(PRD_ORG.md 1.1절)을 유지하되, `companies`만은 이미 두 도메인이 공유해야 하는 테이블이므로 예외로 다룬다.

---

## 1. 개요 및 목표

### 1.1 배경 — 사용자가 발견한 문제

- 조직도 관리(`/erp/admin/org`)에서 법인 "M2"·"M2 Safety"·"MIDER"·"Mynafit"·"Mordisk"·"Miretti" 6건을 등록했다(`org_companies`).
- 그런데 기준정보 관리(`/erp/master/companies`, "법인 관리" 화면)를 열어보면 이 법인들이 하나도 보이지 않고, 대신 애초에 더미로 심어뒀던 "법인 1"~"법인 10"만 보인다 — 왜냐하면 이 화면은 완전히 다른 테이블 `companies`(Master 도메인)를 조회하기 때문이다.
- 사용자 입장에서는 "법인"이 하나의 개념인데 화면·테이블이 둘로 쪼개져 있어 데이터를 두 번 입력해야 하는 상태다. 실제로 이번 대화에서 이미 임시 조치로 `companies`에도 "M2"(C1011)를 별도로 만들고 그 하위에 브랜드~사이즈 더미 10건씩을 채웠지만, 이는 `org_companies`의 "M2"와 이름만 같을 뿐 `id`가 다른 완전히 별개의 행이다. 근본 해결이 아니라 임시방편이었다.

### 1.2 목표

- `companies`(Master 도메인)를 시스템에서 유일한 "법인" 테이블로 만든다. 조직도는 자체 법인 테이블을 갖지 않고 `companies`를 그대로 참조한다.
- 그룹사(`org_groups`) → 법인(`companies`) → 부문(`organizations`) → 부서(`org_sections`, 선택) → 팀(`departments`) → 구성원(`profiles`) 트리가 끊김 없이 이어지게 한다.
- 법인 데이터(신규 등록/코드/명칭/사용여부)는 기존 기준정보 관리 화면(`/erp/master/companies`)의 CRUD를 그대로 재사용하고, 조직도 관리 화면은 "이미 있는 법인을 그룹사에 배정"하는 역할만 담당하도록 정리한다 — `organizations`(부문)를 법인에 매핑할 때와 동일한 패턴(3.2절)이다.
- 마이그레이션 시점에 이미 등록된 `org_companies` 6건(M2/M2 Safety/MIDER/Mynafit/Mordisk/Miretti)과 `companies`의 임시 "M2"(C1011) 데이터를 **유실 없이** `companies` 하나로 합친다.

### 1.3 비범위 요약 (상세는 9장)

- Master 도메인의 브랜드~상품 계층(`brands` 이하)을 조직도 쪽에 노출하는 것 — 조직도는 법인까지만 다루고 그 아래는 여전히 상품 마스터 전용이다.
- 그룹사(`org_groups`) 개념을 Master 도메인으로 확장하는 것 — 그룹사는 계속 조직도 전용 개념으로 남는다.
- 기존 조직도 더미데이터(9개 부문)·상품 더미데이터 재시딩 — 이미 완료된 상태를 그대로 이관만 한다.

---

## 2. 현황 분석 — 두 테이블 비교

| 항목                     | `companies` (Master, 유지)                                                                             | `org_companies` (Org, 폐기 대상)                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| 소유 도메인              | 기준정보 관리(`lib/erp/master/*`)                                                                      | 조직도 관리(`lib/erp/org/*`)                                                                          |
| 컬럼                     | `id`/`code`/`name`/`sort_order`/`is_active`/`note`/`created_at`/`updated_at`/`created_by`/`updated_by` | 위와 완전히 동일 + **`org_group_id`**(그룹사 FK, `companies`엔 없음)                                  |
| 코드 체계                | `C####` (전체 시퀀스), 6.1절 PRD_MASTER.md                                                             | `OC####` (`org_code.ts`)                                                                              |
| SELECT RLS               | 로그인 사용자 전체 허용                                                                                | 로그인 사용자 전체 허용 (동일)                                                                        |
| INSERT/UPDATE/DELETE RLS | `is_admin()` (admin 이상)                                                                              | `is_superadmin()` (superadmin만) — **더 엄격**                                                        |
| 자식 테이블              | `brands`(→ 소브랜드/라인/컬러/사이즈/아이템 계층)                                                      | `org_company_divisions`(→부문 매핑), `org_unit_leaders`(리더 지정)                                    |
| 현재 데이터              | "M2"(C1011) 1건 + 브랜드~사이즈 10건씩 (이번 대화에서 임시 생성)                                       | 6건: M2/M2 Safety/MIDER/Mynafit/Mordisk/Miretti, 전부 그룹사 "M2 Korea"(`org_groups`, singleton) 소속 |
| 부문 매핑 현황           | 해당 없음                                                                                              | "M2" 1건만 부문 10건(IT부문 + 신규 9개)과 매핑됨. 나머지 5개 법인은 아직 부문 매핑 없음               |

**핵심 관찰**: 컬럼 구조가 `org_group_id` 하나만 빼고 완전히 동일하다. 즉 두 테이블은 애초에 같은 모델이 두 곳에서 독립적으로 자라난 것이며, 통합의 기술적 장벽은 낮다. 유일한 차이(그룹사 연결)는 PRD_ORG.md가 `organizations`/`departments`에 적용했던 것과 동일한 해법 — **원본 테이블에 컬럼을 추가하지 않고 별도 매핑 테이블로 표현** — 을 그대로 적용하면 해소된다.

---

## 3. 목표 아키텍처

```
그룹사 (org_groups, 고정 1건)
  └─ org_group_companies  ← 신규 매핑 테이블 (그룹사 ↔ 법인)
       └─ 법인 (companies)                    ← Master 소유, 유일한 법인 테이블
            └─ org_company_divisions          ← 기존 매핑 테이블, FK 대상만 companies로 교체
                 └─ 부문 (organizations)
                      └─ (부서, org_sections, 선택)
                           └─ 팀 (departments)
                                └─ 구성원 (profiles)
            └─ brands (기존 그대로)            ← Master 상품 마스터 축, 변경 없음
```

- `org_companies` 테이블은 삭제한다. 조직도 코드에서 "법인"을 조회/등록하는 모든 지점은 `companies`를 직접 쓴다.
- **법인 신규 등록**은 이제 하나의 창구, 즉 기준정보 관리(`/erp/master/companies`)의 기존 CRUD(코드 자동 채번 `C####`, `is_admin()` 권한)로 일원화한다. 조직도 관리 화면(`/erp/admin/org`)에서는 법인을 직접 만드는 대신 **"이미 등록된 법인을 그룹사에 배정"**하는 액션만 제공한다 — 지금 부문(`organizations`) 노드에서 "소속 법인 변경" 버튼만 내보내고 부문 자체 CRUD는 안 하는 것과 완전히 같은 패턴(`org-group-company-actions.tsx`의 기존 설계 원칙을 그대로 연장).
- **그룹사↔법인 연결**은 `org_companies.org_group_id` 컬럼이 없어지는 대신, `org_company_divisions`와 같은 모양의 신규 매핑 테이블 `org_group_companies`로 옮긴다. `companies` 테이블 자체에는 컬럼을 한 개도 추가하지 않는다 — Master 도메인이 그룹사라는 개념을 알 필요가 없기 때문이다.

---

## 4. 데이터 모델 변경

### 4.1 신규: `org_group_companies` (그룹사 ↔ 법인 매핑)

`org_company_divisions`(5.3절, PRD_ORG.md)와 동일한 설계 원칙 — "매핑 대상 테이블에 상위를 가리키는 컬럼을 추가하는 대신 별도 매핑 테이블을 둔다."

| 컬럼                        | 타입                                            | 설명                              |
| --------------------------- | ----------------------------------------------- | --------------------------------- |
| `id`                        | uuid, PK                                        | —                                 |
| `org_group_id`              | uuid, FK → `org_groups.id`, not null            | 소속 그룹사                       |
| `company_id`                | uuid, FK → `companies.id`, not null, **unique** | 법인은 그룹사 정확히 1곳에만 소속 |
| `sort_order`                | integer, default 0                              | 같은 그룹사 안에서 법인 표시 순서 |
| `created_at` / `created_by` | —                                               | 변경 이력                         |

### 4.2 변경: `org_company_divisions.org_company_id`

FK 대상을 `org_companies.id` → **`companies.id`**로 교체한다. 컬럼명은 혼동을 줄이기 위해 `company_id`로 리네이밍하는 것을 제안한다(선택 사항, 8장 코드 영향 범위에 반영).

### 4.3 변경: `org_unit_leaders.org_company_id`

동일하게 FK 대상을 `companies.id`로 교체한다. `org_unit_leaders_company_uk` unique index는 그대로 유지(법인당 리더 1명 제약은 변하지 않음).

### 4.4 폐기: `org_companies`

데이터 이관(6장) 완료 후 `DROP TABLE org_companies`. `lib/erp/org/code.ts`의 `orgCompany` 코드 스펙(`OC####`)도 함께 제거한다 — 법인 코드는 이제 `companies`의 `C####` 하나만 존재한다.

---

## 5. 권한(RLS) 설계 — 확인 필요한 지점

두 도메인의 CRUD 권한 레벨이 다르다는 게 이번 통합에서 가장 먼저 결정해야 할 지점이다.

| 동작                                            | 현재 Master (`companies`) | 현재 Org (`org_companies`)                 | 통합 후 제안                                                                                                                   |
| ----------------------------------------------- | ------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| 법인 신규 등록/명칭 수정/삭제                   | `is_admin()`              | `is_superadmin()`                          | **`is_admin()` 유지** — `companies` 자체 정책은 그대로 두고, "법인"을 admin이 만들 수 있다는 기존 Master 동작을 보존한다       |
| 그룹사에 법인 배정/해제 (`org_group_companies`) | 해당 없음(신규)           | `is_superadmin()`(그룹사 자체 정책과 동일) | **`is_superadmin()`** — PRD_ORG.md 3.1절 "그룹사·법인은 여러 부문에 걸치는 최상위 레벨이라 스코프가 없다"는 근거를 그대로 승계 |
| 부문↔법인 매핑 변경 (`org_company_divisions`)   | —                         | `is_superadmin()`                          | 변경 없음                                                                                                                      |

> **리스크**: 이 제안대로면 admin 권한만 있는 사용자도 새 법인을 만들 수 있게 되고(기존 Master 동작 그대로), 그 법인을 그룹사에 실제로 편입시키는 것만 superadmin이 막는다. "법인 자체의 신규 등록도 superadmin만" 이어야 한다는 요구가 나오면 `companies` INSERT 정책을 `is_admin()` → `is_superadmin()`으로 올려야 하는데, 이 경우 **기존 기준정보 관리 화면의 동작이 바뀐다**(현재 admin도 법인을 등록할 수 있음). 이 문서는 "완전 통합" 지시를 받은 상태이지만 이 권한 레벨 결정은 사용자 확인이 필요한 지점으로 남긴다(10장).

---

## 6. 데이터 마이그레이션 절차

마이그레이션 시점 실제 데이터(2026-08-17 기준, 참고용):

- `companies`: "M2"(`C1011`) 1건 — 이번 대화에서 임시로 만든 행, 하위에 브랜드~사이즈 10건씩 존재
- `org_companies`: 6건 — M2(`OC0001`)/M2 Safety(`OC0002`)/MIDER(`OC0003`)/Mynafit(`OC0004`)/Mordisk(`OC0005`)/Miretti(`OC0006`), 전부 `org_groups`의 "M2 Korea"(`GRP0001`) 소속
- `org_company_divisions`: 10건, 전부 `org_companies`의 "M2" 1건에 매핑(부문 10개: IT부문 + 신규 9개)

이관 절차:

1. **이름 매칭**: `org_companies.name`과 `companies.name`이 정확히 일치하는 행을 짝짓는다. 현재는 "M2" 1건만 일치(`companies.C1011` ↔ `org_companies.OC0001`).
2. **매칭 안 되는 행 보강**: "M2 Safety"/"MIDER"/"Mynafit"/"Mordisk"/"Miretti" 5건은 `companies`에 대응 행이 없으므로, Master 도메인의 코드 채번 규칙(`C####`, 다음 번호부터)으로 신규 `companies` 행을 만든다. **하위 브랜드~사이즈 더미는 만들지 않는다** — 이건 조직도에서 등록한 법인일 뿐 상품 마스터 목적이 아니므로, 빈 법인 행만 생성한다(사용자가 추후 필요하면 기준정보 관리 화면에서 직접 채운다).
3. **1번에서 짝지어진 "M2"의 경우 어느 쪽 행을 최종본으로 쓸지 결정**: `companies.C1011`(이미 브랜드 10건 등 하위 데이터가 딸려 있음)을 최종본으로 채택하고, `org_companies.OC0001`의 `id`를 참조하던 모든 FK를 `companies.C1011.id`로 치환한다.
4. `org_company_divisions.org_company_id` 값을 2~3단계에서 확정한 `companies.id`로 UPDATE.
5. `org_unit_leaders.org_company_id` 값도 동일하게 UPDATE(현재 0건이라 실질 영향 없음).
6. `org_group_companies`에 6건 INSERT — `org_group_id`는 전부 "M2 Korea", `company_id`는 2~~3단계에서 확정한 `companies.id`, `sort_order`는 기존 `org_companies.code` 순서(OC0001~~0006) 그대로 승계.
7. `org_company_divisions`/`org_unit_leaders`의 FK 제약을 `companies`로 재생성한 뒤, `org_companies` 테이블과 관련 RLS 정책을 DROP.
8. `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성.

---

## 7. 코드 영향 범위

| 파일                                               | 변경 내용                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/erp/org/types.ts`                             | `OrgCompany`류 타입 제거, `companies` 기반 타입으로 교체                                                                                                                                                                                                                                                             |
| `lib/erp/org/queries.ts`                           | `org_companies` 조회 전부 `companies`로 교체, `getOrgTree()`가 `companies`를 조인하도록 수정                                                                                                                                                                                                                         |
| `lib/erp/org/actions.ts`                           | `createOrgCompanyAction`/`updateOrgCompanyAction`/`deleteOrgCompanyAction`을 제거하거나 `lib/erp/master/actions.ts`의 `MASTER_ENTITIES.company` 제네릭 액션으로 위임. `setDivisionCompanyAction`/`getUnmappedDivisionsAction`은 `company_id` 기준으로 유지. 그룹사 배정용 신규 액션(`setCompanyGroupAction` 등) 추가 |
| `lib/erp/org/tree.ts`                              | 트리 조립 시 법인 노드 소스를 `companies`로 변경                                                                                                                                                                                                                                                                     |
| `lib/erp/org/code.ts`                              | `orgCompany`(`OC####`) 코드 스펙 제거                                                                                                                                                                                                                                                                                |
| `components/erp/org/org-group-company-actions.tsx` | "법인 등록/수정/삭제" UI를 "기존 법인을 그룹사에 배정"으로 축소(3장 참고). 신규 법인이 필요하면 `/erp/master/companies`로 안내하는 링크 제공 검토                                                                                                                                                                    |
| `lib/erp/master/entities.ts`                       | 변경 없음 — `company` 엔티티가 그대로 유일한 정의가 됨을 확인하는 차원                                                                                                                                                                                                                                               |
| `lib/supabase/database.types.ts`                   | 재생성                                                                                                                                                                                                                                                                                                               |
| `supabase/seed.sql`(또는 마이그레이션)             | `org_companies` 시드 제거, 6.장 이관 로직을 마이그레이션 SQL로 작성                                                                                                                                                                                                                                                  |

---

## 8. 화면 영향

- **`/erp/master/companies`("법인 관리")**: 동작 변화 없음. 이제 이 화면에서 만든 법인이 조직도에도 그대로 보인다는 점만 달라진다.
- **`/erp/admin/org`(조직도 관리)**: 법인 노드의 편집 버튼이 "법인 등록/수정/삭제"에서 "그룹사 배정 변경" 하나로 축소된다. 새 법인이 필요하면 사용자는 먼저 기준정보 관리에서 법인을 만든 뒤, 조직도 관리로 돌아와 그룹사에 배정하는 2단계 흐름이 된다(부문을 법인에 매핑하는 지금 흐름과 동일한 UX 패턴).
- **헤더 "조직도" 팝업**: 조회 전용이라 변화 없음. 법인 이름 표시 소스만 `companies`로 바뀐다.

---

## 9. 비범위 (Out of Scope)

- Master 도메인의 브랜드~상품 계층을 조직도 트리에 노출하는 것 — 조직도는 법인 레벨까지만 다룬다.
- `org_groups`(그룹사)를 Master 도메인 개념으로 승격하는 것 — 그룹사는 계속 조직도 전용이며 `companies`에 어떤 컬럼도 추가하지 않는다(3장 원칙).
- 이관 후 "M2 Safety"/"MIDER"/"Mynafit"/"Mordisk"/"Miretti" 5개 법인의 브랜드~사이즈 더미 데이터 생성 — 필요해지면 별도 요청으로 처리한다.
- 5장에서 열어둔 권한 레벨(법인 신규 등록 = admin vs superadmin) 최종 결정 — 사용자 확인 후 확정한다.

---

## 10. 확인된 가정 및 리스크

| 항목                                              | 채택한 가정                                                               | 리스크/확인 필요 시점                                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 법인 신규 등록 권한                               | `companies` 기존 정책(`is_admin()`) 유지, 그룹사 배정만 `is_superadmin()` | "법인 자체도 superadmin만 만들어야 한다"는 요구가 나오면 5장 표 재검토 필요                          |
| "M2" 이름 매칭                                    | 정확히 일치하는 이름은 동일 법인으로 간주하고 병합                        | 실제로는 다른 법인인데 이름만 우연히 같을 가능성 — 이관 직전 사용자에게 매칭 목록으로 재확인 필요    |
| 매칭 안 되는 5개 법인 처리                        | 빈 `companies` 행만 생성(하위 마스터 더미 없음)                           | "이 5개도 M2처럼 브랜드~사이즈 더미가 있어야 한다"는 요구가 나오면 별도 작업 필요                    |
| `org_company_divisions`/`org_unit_leaders` 컬럼명 | `org_company_id` → `company_id` 리네이밍 제안                             | 리네이밍 없이 FK 대상만 바꿔도 기능상 문제는 없음 — 코드 가독성 대 변경 범위 트레이드오프, 확정 필요 |

---

## 11. 성공 기준

- [ ] `org_companies` 테이블이 삭제되고, 시스템 전체에서 "법인"은 `companies` 하나로만 존재한다.
- [ ] `/erp/master/companies`에서 기존 "M2"(C1011)와 이관된 5개 법인(M2 Safety/MIDER/Mynafit/Mordisk/Miretti)이 전부 조회된다.
- [ ] `/erp/admin/org`의 조직도 트리에서 "M2 Korea" 그룹사 하위에 위 6개 법인이 그대로 보이고, "M2" 하위에는 기존처럼 부문 10건이 매핑되어 있다.
- [ ] 헤더 "조직도" 팝업에서도 동일한 6개 법인이 조회 전용으로 정상 표시된다.
- [ ] 기준정보 관리에서 새 법인을 등록하면 조직도 관리 화면에서 곧바로 "그룹사 배정" 대상으로 선택할 수 있다(재입력 없이).
- [ ] `companies`/`brands` 등 기존 Master 하위 테이블·화면 동작에 회귀가 없다(브랜드/컬러/사이즈/상품 화면 전부 기존과 동일하게 작동).
