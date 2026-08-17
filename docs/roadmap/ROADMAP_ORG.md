# 조직도 관리 시스템 개발 로드맵

ERP MVP에서 기존 관리자 전용 3형제 화면(사용자 관리/메뉴 관리/사용자 권한 관리)이 있는 **"마스터 관리 > 기본 관리"** 아래에 4번째 소분류로 "그룹사 → 법인 → 부문 → (부서, 선택) → 팀 → 구성원" 조직도 **관리 화면**을 추가하고, 이와 별개로 **헤더에 상시 노출되는 "조직도" 버튼**(로그인 사용자 표시 바로 앞)을 클릭하면 role과 무관하게 누구나 팝업으로 조회할 수 있게 한다. 기존 `profiles`/`departments`/`organizations`는 **한 컬럼도 건드리지 않고** 신규 테이블 6개(구조 5개 + 매핑/트리거 포함)와 신규 RPC 1개로만 보강한다.

- **기준 문서**: `docs/prd/PRD_ORG.md`
- **선행 로드맵**: `docs/roadmap/ROADMAP_MVP.md` (Task 001~~022 완료 — ERP 셸/인증/`menus`·`user_menu_permissions`·역할 권한 체계, `app/erp/admin/layout.tsx`의 `requireAdmin()` 가드 포함) / `docs/roadmap/ROADMAP_MASTER.md` (Task 023~~042 완료 — 마스터 CRUD 공통 컴포넌트·채번 함수·`set_master_audit()` 등 재사용 자산)
- **기반 저장소**: Next.js 16 (App Router) + Supabase (`@supabase/ssr`) + shadcn/ui `new-york`
- **개발 환경**: 1인 개발 — 일정 추정보다 **실행 순서와 의존관계** 중심으로 태스크를 분해했다.
- **Task 번호**: `ROADMAP_MASTER.md`의 Task 042에 이어 **Task 043부터** 연속 채번한다 (번호 충돌 방지).
- **Phase 번호**: `ROADMAP_MASTER.md`의 Phase 7에 이어 **Phase 8부터** 채번한다.
- **개정 이력**:
  1. 최초안(Task 043~056) — "부문 → 팀" 4단계 고정, 독립 라우트 `/erp/org`.
  2. "부문과 팀 사이 선택적 '부서' 레벨" 요구 반영 — `org_sections`/`org_section_teams` 추가, Task 043~058(16개)로 확장.
  3. 최종 산출물이 두 화면으로 확정 — ① 관리 화면을 `/erp/org`(독립 라우트)가 아니라 **`마스터 관리 > 기본 관리 > 조직도 관리`(`/erp/admin/org`)**로 이동해 기존 `requireAdmin()` 가드를 그대로 상속받게 하고, ② **헤더의 독립 "조직도" 버튼 → 팝업**을 신규 진입점으로 추가했다. 이에 따라 "일반 사용자에게 메뉴 권한을 일괄 부여해야 하는가" 문제가 사라지고(관리 화면은 완전히 관리자 전용, 조회는 헤더 팝업이 전담), 신규 Task(헤더 팝업)가 추가되어 **Task 043~059(17개)**가 됐다.
  4. **(이번 개정) Task 043 미해결 가정 5건 전부 확정(2026-08-17)** — 그룹사·법인명은 가안 그대로, 부서는 "개발부서" 1건 + 팀 3개 편입, 직책명은 PRD 제안값 그대로 채택. **④ 초기 리더는 "전체 미지정으로 시작"으로 확정**되면서 Task 058의 리더 시드 항목이 전부 삭제되고(부서 데이터만 시드), Task 043/046/058 제목의 ⚠️가 제거됐다.
- **최종 수정**: 2026-08-17

---

## 개요

조직도 관리 시스템은 **두 개의 진입점**으로 구성된다:

- **관리 화면** (`마스터 관리 > 기본 관리 > 조직도 관리`, `/erp/admin/org`) — `is_admin()` 이상만 접근 가능. 그룹사/법인/부서 CRUD, 부문↔법인·부서↔팀 소속 변경, 5개 레벨 리더 지정을 전부 이 화면에서 한다. 기존 `app/erp/admin/layout.tsx`의 `requireAdmin()` 가드를 그대로 상속받으므로 **이 화면을 위한 별도 접근 제어 코드가 필요 없다.**
- **헤더 "조직도" 팝업** (신규) — 헤더 우측, 로그인 사용자 표시(`<AuthButton />`) 바로 앞에 상시 노출되는 독립 버튼. role과 무관하게 로그인한 누구나 클릭할 수 있고, 클릭 시 같은 계층 구조를 **조회 전용**으로 팝업에 보여준다. `menus`/`user_menu_permissions` 권한 체계와 완전히 무관하다.

공통 기반:

- **가변 깊이 계층**: 그룹사(고정 1건) → 법인 → 부문(`organizations` 재해석) → **부서(선택, `org_sections`)** → 팀(`departments`) → 구성원(`profiles`). **부서는 있을 수도 없을 수도 있다** — 같은 부문 안에서도 어떤 팀은 부서 소속으로, 어떤 팀은 부문에 직접 소속으로 공존할 수 있다.
- **노드별 리더**: 어느 레벨 노드를 클릭해도 그 조직의 장(회장님/대표이사/부문장/**부서장**/팀장)과 하위 조직(팀 노드면 소속 구성원 목록)이 함께 표시된다(관리 화면은 편집도 가능, 팝업은 조회만).
- **기존 테이블 무변경 원칙**: `profiles`/`departments`/`organizations`에 `ALTER TABLE`을 한 번도 실행하지 않는다. 부족한 계층(그룹사/법인/부서)·연결(법인↔부문, 부서↔팀)·리더 정보는 전부 신규 테이블(`org_groups`, `org_companies`, `org_company_divisions`, `org_sections`, `org_section_teams`, `org_unit_leaders`)로 보강한다.
- **RLS를 깨지 않는 구성원 조회**: `profiles`의 SELECT 정책(`profiles_select_own_or_admin`)을 완화하는 대신, 조직도에 필요한 6개 컬럼만 반환하는 `SECURITY DEFINER` 함수 `get_org_chart_members()`를 신설해 우회한다. 관리 화면과 헤더 팝업이 이 함수 하나를 공유한다.

### 이번 로드맵 완료의 정의

> "`/erp/admin/org`(관리 화면)에서 **그룹사~구성원이 실제 데이터로 탐색·편집되고, 부서가 있는 팀과 없는 팀이 같은 트리에서 공존**하며, 헤더의 '조직도' 버튼이 **모든 로그인 사용자에게** 노출되어 클릭 시 같은 구조를 **조회 전용 팝업**으로 보여주고, `profiles`/`departments`/`organizations`에 대한 `ALTER TABLE`이 마이그레이션 diff에 **단 한 줄도 등장하지 않는다**"까지 보장한다.
> 인사발령 이력, 결재선/보고라인, 부문·팀 자체의 CRUD 화면, 부서의 재귀적 하위 부서, 헤더 팝업에서의 편집은 범위가 아니다. ([범위 제외](#범위-제외-out-of-scope) 참고)

---

## 개발 워크플로우

`ROADMAP_MVP.md`의 [개발 워크플로우](./ROADMAP_MVP.md#개발-워크플로우)와 `ROADMAP_MASTER.md`의 규약을 그대로 따른다. 이 로드맵에서 특히 중요한 규약만 다시 적는다.

1. **작업 계획** — 착수 전 `CLAUDE.md`·`docs/guides/`·`docs/prd/PRD_ORG.md`를 확인하고, 이미 존재하는 자산(`is_admin()`, `is_superadmin()`, `current_organization_id()`, `set_master_audit()`, `next_master_code()`, `requireAdmin()`, `app/erp/admin/layout.tsx`, `MasterDetailLayout`/`MasterTreePanel`)을 **다시 만들지 않는지** 먼저 검증한다.
2. **작업 생성** — 각 Task는 **목표 / 관련 파일 / 구현 체크리스트 / 수락 기준 / 테스트 체크리스트** 5개 소단락을 갖는다.
3. **작업 구현**
   - DB 스키마 변경은 로컬 `supabase/migrations/*.sql`이 아니라 **Supabase MCP(`mcp__supabase__apply_migration`)로 원격 프로젝트에 직접 적용**한다 (기존 관례).
   - **모든 마이그레이션 적용 직후 `profiles`/`departments`/`organizations`에 대한 DDL이 포함되지 않았는지 SQL 본문을 재확인한다** — 이 로드맵의 최우선 제약이다(PRD 12장 성공 기준).
   - 스키마 변경 후 **반드시** `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts`를 재생성하고, `mcp__supabase__get_advisors`(security + performance)를 확인한다.
   - DB 연동·권한 로직 구현 시 **Playwright MCP로 E2E 검증**을 수행한 뒤 다음 단계로 진행한다. 검증에는 임시 계정(회원가입 후 `execute_sql`로 role 승격)을 사용하고 **검증 직후 삭제해 잔존 0건을 확인**한다.
   - 각 Task 완료 후 `npm run check-all`(typecheck + lint + format:check)을 통과시킨다.
4. **로드맵 업데이트** — 완료 Task는 제목 옆에 ✅, 하위 체크박스를 `[x]`로 전환하고 Phase 전체 완료 시 Phase 제목에도 ✅를 붙인다. [진행 현황](#진행-현황) 표도 함께 갱신한다.

> ~~⚠️ 착수 전 사용자 확인이 필요한 Task가 있다.~~ PRD 11장의 미해결 가정(그룹사·법인·부서 실제 이름, 초기 리더 지정자, 부서 선택성 해석)은 **Task 043에서 2026-08-17 전부 확정 완료**됐다(결과는 [사용자 확인 완료 항목](#사용자-확인-완료-항목-2026-08-17-확정) 참고). 이 절차 자체는 이후 새로운 미해결 가정이 생기면 동일하게 적용한다.

---

## 아키텍처 사전 결정 사항

Task 착수 전 아래 결정을 전제로 한다. 변경 시 이 섹션과 영향받는 Task를 함께 갱신할 것.

| 항목                           | 결정                                                                                                                                                                                                                                                                                                                                                                                                | 근거                                                                                                                                                                             |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 기존 테이블 무변경             | **`profiles` / `departments` / `organizations`에 `ALTER TABLE`을 실행하지 않는다.** 컬럼 추가·제약 변경·RLS 정책 수정 전부 금지                                                                                                                                                                                                                                                                     | PRD 1.2 / 2장 / 6.4절(옵션 A 미채택). 사용자의 명시적 요구이자 PRD 12장 성공 기준의 검증 대상                                                                                    |
| **"부서"와 "팀"의 이름 충돌**  | 기존 `departments` 테이블 = **팀**. 신규 개념 "부서"는 어디에도 `department`라는 영단어를 쓰지 않고 **`org_sections`/`section`**으로만 명명한다                                                                                                                                                                                                                                                     | PRD 1.1절 경고. 두 한국어 단어가 영어로 우연히 겹쳐 실수하기 매우 쉬움 — 코드 리뷰 시 이 규칙 위반을 최우선으로 잡아낼 것                                                        |
| 부서의 선택성                  | **팀 단위로 선택적** — 같은 부문 안에서도 일부 팀은 부서 소속, 일부는 부문 직속으로 공존 가능. "부문 전체가 부서 체계 on/off" 같은 부문 단위 스위치가 아니다                                                                                                                                                                                                                                        | PRD 4.2절 / 11장. `org_section_teams`에 매핑이 있으면 부서 소속, 없으면 부문 직속으로 판정                                                                                       |
| `profiles` 조회 우회           | **신규 `SECURITY DEFINER` 함수 `public.get_org_chart_members()`** 로만 조직도 구성원을 조회. `profiles_select_own_or_admin` 정책은 손대지 않는다. **`department_id` 필터를 두지 않는다**                                                                                                                                                                                                            | PRD 3.2절. RLS는 행 단위라 "이름만 공개, 전화번호/이메일/bio 비공개"를 표현할 수 없음 — 컬럼 고정 반환 함수로 해결. 관리 화면·헤더 팝업이 이 함수 하나를 공유한다                |
| **관리 화면 라우트/메뉴 위치** | `/erp/admin/org`(신규, `app/erp/admin/org/page.tsx`). 메뉴는 **"마스터 관리 > 기본 관리"**(기존 중분류, 사용자/메뉴/권한 관리와 형제) 아래 4번째 소분류. "인사급여" 신설안은 폐기                                                                                                                                                                                                                   | PRD 7장. `app/erp/admin/layout.tsx`의 기존 `requireAdmin()` 세그먼트 가드를 그대로 상속받아 **별도 접근 제어 코드가 필요 없다** — 이전 설계보다 단순함                           |
| **헤더 "조직도" 팝업 진입점**  | `components/erp/erp-header.tsx`의 우측 계정 영역에 버튼 1개를 `<AuthButton />` 바로 앞에 추가. role 무관 전 로그인 사용자 노출, `menus`/`user_menu_permissions`와 무관, **완전 조회 전용**                                                                                                                                                                                                          | PRD 8장. 관리 화면이 admin 전용으로 확정되면서, 일반 사용자의 조직도 조회 수단이 이 팝업으로 분리됨                                                                              |
| 권한 함수                      | **기존 `is_admin()` / `is_superadmin()` / `current_organization_id()`를 그대로 재사용.** 새 DB 권한 함수를 만들지 않는다                                                                                                                                                                                                                                                                            | 실 DB 확인 결과 3개 함수 모두 `SECURITY DEFINER`로 존재(`current_organization_id()` → uuid). `departments_update_admin` 정책이 이미 이 조합을 사용 중                            |
| 감사 컬럼 트리거               | **기존 `public.set_master_audit()` 재사용**(`updated_at` + `updated_by` 동시 설정). 새 트리거 함수를 만들지 않는다                                                                                                                                                                                                                                                                                  | ROADMAP_MASTER Task 025에서 신설한 공용 트리거. 신규 테이블도 동일한 감사 컬럼 관례를 따름                                                                                       |
| 코드 채번                      | **기존 `public.next_master_code(p_entity)`를 `create or replace`로 확장**해 `org_group`(`GRP`/4) / `org_company`(`OC`/4) / `org_section`(`OS`/4) 3종을 추가. 새 채번 함수를 만들지 않는다                                                                                                                                                                                                           | PRD 6.1. 권한 프리앰블은 `org_group`/`org_company`만 `is_superadmin()`으로 분기, `org_section`은 기존 `is_admin()` 기본 분기를 그대로 탄다(부문 스코프는 테이블 RLS가 최종 판정) |
| 그룹사 싱글턴 강제             | `singleton boolean not null default true` + `check (singleton)` + `unique (singleton)` 2중 제약. 앱에서도 등록 화면을 제공하지 않고 **이름 수정 UI만** 둔다                                                                                                                                                                                                                                         | PRD 6.2. 애플리케이션 레벨 방어만으로는 SQL 직접 삽입을 막을 수 없음                                                                                                             |
| 리더 저장 방식                 | **5개 레벨 공용 단일 테이블 `org_unit_leaders`** + `num_nonnulls(...) = 1` CHECK(5개 FK) + 5개 partial unique index. 레벨별 컬럼 추가(옵션 A) 미채택                                                                                                                                                                                                                                                | PRD 6.4절 비교표. `organizations`/`departments`는 컬럼 추가 자체가 금지이고, 레벨마다 조회 방식이 갈라지면 UI/쿼리가 두 갈래가 됨                                                |
| 부서↔팀 소속 표현              | **`org_section_teams`(department_id unique) 매핑 테이블** + 부서·팀이 같은 부문 소속인지 검증하는 **신규 트리거**(`org_sections`/`departments`를 읽기만 함). 매핑이 없으면 부문 직속으로 판정                                                                                                                                                                                                       | PRD 4.2 / 5.5절. `departments`에 컬럼을 추가하지 않고 선택적 소속을 표현하는 유일한 방법                                                                                         |
| 팀의 "실제 상위" 판정          | ① `org_section_teams` 매핑이 있으면 그 부서, ② 없으면 `departments.organization_id`가 가리키는 부문                                                                                                                                                                                                                                                                                                 | PRD 4.2절. 쿼리 레이어(`lib/erp/org/tree.ts`)에서 이 우선순위를 그대로 구현                                                                                                      |
| 편집 권한 재검증 위치          | Server Action 진입부에서 `requireSuperadmin()`(신규, 앱 레벨) 또는 `requireAdmin()` 호출 + DB RLS 이중 방어. **관리 화면 라우트 접근 자체는 admin 세그먼트가 이미 처리**하므로 이 재검증은 "누가 어떤 편집 버튼을 쓸 수 있는가"만 다룬다                                                                                                                                                            | `lib/erp/actions.ts`의 "진입부에서 반드시 `requireAdmin()` 먼저" 규약 계승. 앱 레벨 `superadmin` 가드는 아직 없어 이 하나만 신설(`lib/erp/auth.ts`)                              |
| 헤더 팝업 데이터 조회 권한     | 신규 Server Action(팝업 전용)에는 **역할 가드를 두지 않는다** — RLS/RPC가 이미 "로그인 사용자 전체 허용"이므로 인증 여부 외 추가 체크가 불필요                                                                                                                                                                                                                                                      | PRD 8.4절                                                                                                                                                                        |
| 조직 도메인 코드 위치          | `lib/erp/org/*`, `components/erp/org/*` (신규 하위 디렉토리)                                                                                                                                                                                                                                                                                                                                        | `lib/erp/master/*` / `components/erp/master/*` 선례와 동일한 도메인 분리                                                                                                         |
| 공통 UI 재사용 범위            | 관리 화면은 **`MasterDetailLayout` + `MasterTreePanel`만 재사용**한다. `MasterListTable` / `MasterFormSheet` / `MasterDeleteDialog` / `SortOrderCell`은 `MasterEntityKey`·`MASTER_ENTITIES`에 강결합되어 있어 재사용하지 않고 조직 전용 컴포넌트를 만든다. 헤더 팝업은 이 관리 화면 컴포넌트도 재사용하지 않고 **읽기 전용 축약 컴포넌트를 별도로** 둔다(편집 슬롯을 조건부로 숨기는 방식보다 단순) | 실 코드 확인 결과 앞의 2개만 엔티티 메타에 의존하지 않는 순수 컨트롤드 컴포넌트. PRD 6.3.2 — 팝업은 트리 조립 로직(`lib/erp/org/tree.ts`)만 공유하고 UI는 독립                   |
| 부문/팀 활성 여부 매핑         | `organizations.archived_at is null` / `departments.archived_at is null` → 트리 노드의 `isActive`로 **쿼리 레이어에서 어댑팅**                                                                                                                                                                                                                                                                       | PRD 6.5절. 두 테이블에 `is_active` 컬럼을 추가하지 않기 위한 조치                                                                                                                |
| 정렬                           | 그룹사·법인·부서(신규)는 `sort_order` → `name`, **부문·팀은 `name` 가나다순**(정렬 컬럼이 없으므로)                                                                                                                                                                                                                                                                                                 | PRD 6.5절                                                                                                                                                                        |
| 구성원 노드                    | 구성원은 **트리 노드로 펼치지 않고** 팀 노드 선택 시 우측 목록으로만 표시                                                                                                                                                                                                                                                                                                                           | PRD 6.3절. 63명을 트리에 펼치면 깊이·성능 모두 악화                                                                                                                              |
| 다국어                         | 관리 화면 콘텐츠는 **한국어 단일 값**(기존 관례). **헤더 팝업 트리거 버튼만 예외** — 헤더가 이미 `dict.erp.header.logoAriaLabel`로 부분 번역되고 있어, 같은 패턴으로 `orgChartTriggerLabel` 등을 4개 언어에 추가한다                                                                                                                                                                                | PRD 8.5절. ROADMAP_MVP Task 010 / ROADMAP_MASTER와 같은 기조를 유지하되, 헤더 chrome은 이미 번역 대상이라는 예외를 그대로 따름                                                   |
| Suspense 경계                  | `cacheComponents: true` 환경이므로 `cookies()`/`params`/`searchParams` 사용 컴포넌트는 얇은 `Page` + `<Suspense>` + `async XxxContent` 패턴 유지                                                                                                                                                                                                                                                    | 기존 `app/erp/**` 전 페이지가 이 패턴                                                                                                                                            |
| shadcn 컴포넌트                | `tree-view` `sheet` `dialog` `alert-dialog` `table` `select` `native-select` `combobox` `command` `badge` `avatar` `card` `switch` `input` `skeleton` 모두 **이미 존재**                                                                                                                                                                                                                            | `npx shadcn add` 불필요                                                                                                                                                          |

### 변경 금지 파일 / 객체 목록 (선행 로드맵에서 승계 + 이번 로드맵 추가분)

- **`public.profiles` / `public.departments` / `public.organizations` 테이블 — 컬럼·제약·RLS 정책 전부 변경 금지 (이번 로드맵의 최우선 제약)**
- `proxy.ts`, `lib/supabase/proxy.ts` — 쿠키 처리 로직 **특히 금지**
- `app/layout.tsx`, `app/page.tsx`, `app/protected/**` — 스타터킷 영역
- `app/erp/layout.tsx`, `components/erp/erp-shell.tsx`의 셸 **구성**(Header → Menubar → 트리+콘텐츠 → Footer)과 `components/erp/erp-footer.tsx`/`erp-mobile-nav.tsx`/`erp-tree-panel.tsx` — 그대로 유지
  - **예외(이번 로드맵 한정)**: `components/erp/erp-header.tsx`의 **우측 계정 영역 안에 버튼 1개(헤더 팝업 트리거)를 추가하는 것만 허용**한다(Task 054). 로고/타이틀 중앙 정렬/모바일 햄버거 등 헤더의 나머지 구조와, `ErpShell`이 조립하는 전체 레이아웃은 변경하지 않는다.
- `public.is_admin()` / `public.is_superadmin()` / `public.current_organization_id()` / `public.set_updated_at()` / `public.set_master_audit()` / `public.handle_new_user()` / `prevent_unauthorized_role_change` — **재사용만 하고 정의를 수정하지 않는다**
  - 예외: `public.next_master_code()`는 org 3종 추가를 위해 `create or replace`로 **확장만** 한다(기존 12종 분기와 권한 로직은 그대로 보존).
- `app/erp/admin/layout.tsx` — **수정하지 않는다.** `requireAdmin()` 가드를 그대로 상속만 받는다(Task 052).
- `components/erp/master/**`, `lib/erp/master/**` — 조직도 구현을 위해 수정하지 않는다. 재사용은 import만.
- **변수·컬럼·타입 이름에 `department`(영문)를 "부서" 의미로 쓰지 않는다** — 기존 `departments` 테이블(팀)과 혼동 방지. 부서는 항상 `section`.

---

## 개발 단계

- **Phase 8** — 조직 데이터 모델 구축 (Task 043~050)
- **Phase 9** — 메뉴 등록 및 관리 라우트 골격 (Task 051~052)
- **Phase 10** — 조직도 화면 구현 (Task 053~057)
- **Phase 11** — 더미 데이터 시드 및 통합 검증 (Task 058~059)

---

## Phase 8: 조직 데이터 모델 구축 ✅

> PRD 3장 / 4장 / 5장 / 6장.
> **목표는 화면이 아니라 신규 테이블 5개 + 채번 확장 + RPC 1개 + 데이터 액세스 계층의 완성이다.**
> Phase 10의 화면들이 병렬 개발될 수 있도록, 스키마와 쿼리/액션 시그니처를 여기서 전부 확정한다.

### Task 043: 조직도 도메인 설계 확정 및 미해결 가정 확인 ✅

**목표**: PRD 11장에 열려 있는 가정을 사용자 확인으로 확정하고, 그 결과를 이 로드맵의 "아키텍처 사전 결정 사항"과 영향 Task에 반영한다. **코드 변경은 없거나 최소한이며, 산출물은 결정 기록이다.**

**관련 파일**

- `docs/prd/PRD_ORG.md` 9장 / 11장 (확인 결과 반영)
- `docs/roadmap/ROADMAP_ORG.md` (이 문서 — 결정 사항 표 및 영향 Task 갱신)

**구현 체크리스트**

- [x] **① 그룹사 실제 이름 확정** — **가안 "OO그룹"을 그대로 채택.** (사용자 확인 2026-08-17) Task 046의 초기 데이터 및 Task 058의 시드에 이 이름이 들어간다.
- [x] **② 법인 실제 이름 확정** — **가안 "OO 법인"을 그대로 채택.** 기존 `organizations` 1건("IT부문")을 이 법인에 소속시킨다.
- [x] **③ 부서 구성 확정** — **부서 1건 생성으로 확정.** "IT부문" 하위에 `OS0001` "개발부서" 1건을 만들고, 8개 팀 중 `ERP시스템팀`/`Commerce시스템팀`/`IT기획팀` 3개를 이 부서에 편입한다. 나머지 5개 팀(`ISMS-P 프로젝트팀`/`보안 운영지원팀`/`원격관제 프로젝트팀`/`인사/회계 운영지원팀`/`접근제어 프로젝트팀`)은 부문 직속으로 남겨 "부서가 있어도/없어도 되는" 공존 상태를 데모로 보여준다.
- [x] **④ 초기 리더 지정자 확정** — **전체 미지정으로 시작하는 것으로 확정.** 그룹사~팀 5개 레벨 전부 `org_unit_leaders`를 초기에 시드하지 않고, 관리 화면(Task 057) 완성 후 실사용자가 직접 지정하도록 비워둔다. PRD 9장의 "리더 데모 시드" 문구와 Task 058의 리더 시드 체크리스트를 이 결정에 맞춰 갱신했다(아래 Task 058 참고).
- [x] **⑤ 레벨별 기본 직책명 확정** — **PRD 제안값 그대로 채택.** 그룹사="회장님" / 법인="대표이사" / 부문="부문장" / **부서="부서장"** / 팀="팀장"(Task 044의 `lib/erp/org/levels.ts` 상수로 들어감).
- [x] 확정된 결정을 이 문서의 "아키텍처 사전 결정 사항" 표와 [사용자 확인 대기 항목](#사용자-확인-대기-항목-착수-전-필수) 표에 반영했고, ⚠️가 붙어 있던 Task 제목(043, 046, 058)에서 ⚠️를 제거했다. `PRD_ORG.md` 9장/11장에도 동일한 확정 결과를 반영했다.

**수락 기준**

- [x] PRD 11장 기준 5개 항목에 대해 "확정" 또는 "현행 가정 유지"라는 명시적 사용자 답변이 기록되어 있다(2026-08-17, `AskUserQuestion`으로 확인 — 답변 원문은 이 Task의 커밋 이력 참고).
- [x] 결정에 따라 영향받는 Task(046 / 058)에 반영할 방향이 확정되었다 — 046은 가안 이름이 그대로 채택되어 실질 변경 없음, 058은 부서 구성은 기존 예시 그대로·**리더 시드 항목은 전면 삭제**로 반영.

**테스트 체크리스트**

- [x] (코드 변경 없음 — 자동 테스트 대상 아님) 결정 사항이 이 문서와 `PRD_ORG.md` 9장/11장 양쪽에 모순 없이 반영되었는지 교차 확인했다. **④(리더)만 PRD 9장 원문("임의의 admin/superadmin 계정을 리더로 지정")과 최종 결정(전체 미지정)이 달라 PRD 9장도 함께 수정했다** — Task 058 착수 시 이 로드맵 문서와 갱신된 PRD 9장을 기준으로 삼는다.

---

### Task 044: 조직 도메인 공통 상수 / 타입 / 레벨 메타 정의 (DB 무관) ✅

**목표**: 5개 레벨이 공유할 앱 레벨 타입·상수를 **DB보다 먼저** 확정해, Task 045~050과 Phase 10 화면 작업이 같은 타입 위에서 병렬 진행되게 한다.

**관련 파일**

- `lib/erp/org/types.ts` (신규 — 트리 노드/리더/구성원 뷰 타입)
- `lib/erp/org/levels.ts` (신규 — 5개 레벨 메타: 키, 한글 라벨, 기본 직책명, 편집 권한 레벨)
- `lib/erp/org/code.ts` (신규 — `GRP`/`OC`/`OS` 코드 스펙 + 형식 검증)

**구현 체크리스트**

- [x] `lib/erp/org/levels.ts`: `ORG_LEVELS` 상수 정의 — `group`(그룹사, 기본 직책 "회장님") / `company`(법인, "대표이사") / `division`(부문, "부문장") / **`section`(부서, "부서장")** / `team`(팀, "팀장") / `member`(구성원, 직책 없음). 각 레벨에 `editableBy: "superadmin" | "adminScoped" | "none"`을 함께 담아, 관리 화면이 버튼 노출 여부를 이 메타 한 곳에서 판단하게 한다(PRD 3.1 표를 코드로 옮긴 것). **헤더 팝업(Task 054)은 이 메타를 아예 참조하지 않는다 — 편집 버튼 자체가 없으므로.**
  - `division`/`section`/`team`은 **노드 자체의 CRUD가 그룹사·법인과 다르므로**(부문은 아예 CRUD 없음, 부서는 admin 스코프) 레벨마다 `editableBy`(그룹/법인=`superadmin`, 부서=`adminScoped`, 부문=`none`)와 별도 필드 `leaderEditableBy`(부서·팀=`adminScoped`, 나머지=`superadmin`)를 둔다.
  - **`section` 레벨에는 `isOptional: true` 플래그**를 추가해, 화면이 "이 레벨은 노드가 0개여도 정상"임을 코드로도 표현하게 한다.
- [x] `lib/erp/org/types.ts`:
  - `OrgLevel = "group" | "company" | "division" | "section" | "team" | "member"`
  - `OrgTreeNode = { id: string; level: OrgLevel; name: string; isActive: boolean; sortOrder: number; children: OrgTreeNode[] }` — 부문/팀은 `sortOrder`가 없으므로 이름 정렬 결과의 인덱스를 넣는다(PRD 6.5).
  - `OrgLeader = { id: string; level: OrgLevel; targetId: string; profileId: string; profileName: string | null; avatarKey: string; title: string }`
  - `OrgMember = { id: string; name: string | null; departmentId: string | null; avatarKey: string; role: UserRole; isActive: boolean }` — `get_org_chart_members()`의 반환 컬럼과 1:1 대응(PRD 3.2절).
- [x] `lib/erp/org/code.ts`: `ORG_CODE_SPECS = { orgGroup: { prefix: "GRP", digits: 4 }, orgCompany: { prefix: "OC", digits: 4 }, orgSection: { prefix: "OS", digits: 4 } }` + `isValidOrgCode(entity, code)` 정규식 검증. **DB 함수 인자는 snake_case(`org_group`/`org_company`/`org_section`)이고 앱 키는 camelCase**라는 점을 `lib/erp/master/code.ts`와 동일하게 주석으로 명시하고, 매핑 헬퍼를 함께 둔다.
- [x] 위 3개 파일은 **서버 전용 코드를 임포트하지 않는 순수 모듈**로 유지한다 — Client Component에서도 그대로 import 가능해야 한다(`lib/erp/role-labels.ts`·`lib/erp/master/gender.ts` 선례).
- [x] **네이밍 규칙 준수**: 이 3개 파일 어디에도 "부서"를 가리키는 식별자에 `department`를 쓰지 않는다(`section`만 사용). 리뷰 시 최우선 확인 항목.

**수락 기준**

- [x] `npm run typecheck` 통과.
- [x] `lib/erp/org/*` 3개 파일 어디에도 `"use server"` / `next/headers` / Supabase 클라이언트 import가 없다(`grep`으로 확인 — 매치 0건).
- [x] PRD 3.1 표의 권한 규칙이 `ORG_LEVELS` 메타로 빠짐없이 표현되어 있다(부서 포함 5개 레벨).

**테스트 체크리스트**

- [x] `isValidOrgCode("orgGroup", "GRP0001")` → true, `isValidOrgCode("orgSection", "OS0001")` → true, `"OS001"` → false 를 임시 스크립트(`npx tsx`)로 확인 후 정리(삭제 완료).
- [x] `ORG_LEVELS`의 레벨 6종(그룹사/법인/부문/부서/팀/구성원)과 기본 직책명이 Task 043 ⑤ 확정 결과와 일치함을 확인(회장님/대표이사/부문장/부서장/팀장/null).
- [x] `ORG_LEVELS.section.isOptional === true`이고 나머지 레벨은 이 플래그가 없음을 확인.

---

### Task 045: 조직 계층 신규 테이블 3종 생성 (`org_groups` / `org_companies` / `org_company_divisions`) ✅

**목표**: 비어 있던 상위 2개 레벨(그룹사·법인)과 "법인 ↔ 부문" 매핑 테이블을 구축한다. **기존 테이블에는 손대지 않는 순수 additive 마이그레이션이어야 한다.**

**관련 파일**

- Supabase 마이그레이션(MCP) — `create_org_hierarchy_tables`, `extend_next_master_code_for_org`
- `docs/prd/PRD_ORG.md` 5.1 / 5.2 / 5.3 / 6.1 / 6.2절
- `lib/erp/org/code.ts` (Task 044 — 엔티티 키 문자열이 DB 함수 인자와 매핑되어야 함)

**구현 체크리스트**

- [x] `org_groups` 생성 (PRD 5.1):
  - [x] `id uuid primary key default gen_random_uuid()`, `code text not null unique`, `name text not null`, `is_active boolean not null default true`, `note text`
  - [x] `singleton boolean not null default true` + `constraint org_groups_singleton_true check (singleton)` + `constraint org_groups_singleton_unique unique (singleton)` (PRD 6.2 — 2행 INSERT가 unique 위반으로 실패)
  - [x] `created_at`/`updated_at timestamptz not null default now()`, `created_by uuid references public.profiles(id) default auth.uid()`, `updated_by uuid references public.profiles(id)`
  - [x] `before update` 트리거로 **기존 `public.set_master_audit()` 연결**(새 트리거 함수 만들지 않음)
- [x] `org_companies` 생성 (PRD 5.2) — 위 공통 컬럼 + `org_group_id uuid not null references public.org_groups(id) on delete restrict` + `sort_order integer not null default 0`. `code`는 `OC####`.
- [x] `org_company_divisions` 생성 (PRD 5.3):
  - [x] `id uuid primary key default gen_random_uuid()`
  - [x] `org_company_id uuid not null references public.org_companies(id) on delete restrict`
  - [x] `organization_id uuid not null unique references public.organizations(id) on delete restrict` — **unique로 "부문은 법인 정확히 1곳에만 소속"을 강제**. `organizations`를 참조만 하고 변경하지 않는다.
  - [x] `sort_order integer not null default 0`, `created_at timestamptz not null default now()`, `created_by uuid references public.profiles(id) default auth.uid()` (PRD 5.3: updated 계열 생략)
- [x] 인덱스: `org_companies(org_group_id, sort_order)`, `org_company_divisions(org_company_id, sort_order)` + `created_by`/`updated_by` FK 커버링 인덱스.
- [x] RLS 활성화 + 정책 (PRD 3.1, **기존 함수 재사용**):
  - [x] `select` — 3개 테이블 모두 `to authenticated using (true)` (조직도는 전 구성원 조회)
  - [x] `insert` — `with check (public.is_superadmin())`
  - [x] `update` — `using (public.is_superadmin()) with check (public.is_superadmin())`
  - [x] `delete` — `using (public.is_superadmin())`
  - [x] `org_groups`의 `delete` 정책은 두되, 싱글턴이라 UI에서는 삭제 버튼을 제공하지 않는다(Task 055).
- [x] 코드 채번 확장:
  - [x] 시퀀스 2개 생성 — `org_code_group_seq`(start 1), `org_code_company_seq`(start 1). **자릿수 4에 `lpad`로 채우므로 시작값은 1로 두고 `GRP` + `lpad('1',4,'0')` = `GRP0001`이 되게 한다.** (부서용 시퀀스는 Task 047에서 함께 생성)
  - [x] `public.next_master_code(p_entity)`를 `create or replace`로 확장해 `when 'org_group'` / `when 'org_company'` 분기를 추가한다(부서 `org_section` 분기는 Task 047에서 같은 함수를 다시 `create or replace`로 확장). **기존 12종 분기와 `product` 권한 예외는 그대로 보존**하고, 권한 프리앰블에 `elsif p_entity in ('org_group','org_company') then if not public.is_superadmin() then raise exception ...` 분기만 추가한다(PRD 3.1 — 그룹사/법인은 superadmin 전용).
  - [x] 확장 후 기존 12종 채번이 회귀 없이 동작하는지 반드시 재확인한다.
- [x] `mcp__supabase__get_advisors`(security + performance) 확인 — **신규 실질 경고 없음.** performance에 `org_groups`/`org_companies`/`org_company_divisions`의 `created_by`/`updated_by` 커버링 인덱스가 "unused_index" INFO로 나오지만, 방금 생성된 빈 테이블이라 당연한 결과(조회 이력이 없을 뿐)라 조치 불필요. security의 `next_master_code` SECURITY DEFINER anon/authenticated 실행 가능 경고는 이번 변경 이전부터 있던 기존 항목(함수 grant는 그대로, body만 교체).
- [x] **마이그레이션 SQL 본문에 `alter table public.profiles` / `public.departments` / `public.organizations`가 한 줄도 없는지 적용 직후 재확인**했다 — 두 마이그레이션 모두 `organizations`를 FK 참조로만 사용, `ALTER TABLE` 없음.
- [x] (워크플로우 규약) 스키마 변경 후 `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성 — 순수 추가분만 반영됨(기존 타입 삭제/변경 없음), `npm run typecheck` 통과.

**수락 기준**

- [x] 3개 테이블이 생성되고 컬럼·FK·unique 제약이 확인된다(`information_schema.columns` + `pg_constraint` 조회로 검증).
- [x] `org_groups`에 2번째 행 INSERT 시도 → unique 위반(`23505`)으로 실패한다.
- [x] `select public.next_master_code('org_group')` → `GRP0001`, `next_master_code('org_company')` → `OC0001` 형식이 반환된다(superadmin 세션 시뮬레이션으로 확인, 이후 시퀀스 원복).
- [x] `role='user'` 세션에서 3개 테이블 select는 성공하고 insert는 RLS(`42501`)로 차단된다. `role='admin'`(superadmin 아님) 세션의 insert도 차단된다.
- [x] 기존 `organizations`(1) / `departments`(8) / `profiles`(63)의 행 수가 마이그레이션 전후 동일하다.

**테스트 체크리스트 (execute_sql)**

- [x] `execute_sql`로 `org_groups` 1건 insert 성공 → 2건째 insert 시도 → `23505`(unique_violation) 확인.
- [x] `org_companies` 1건 insert 후 `org_company_divisions`에 기존 `organizations`(IT부문, `e72c8bf2-…`) 매핑 1건 insert 성공 확인 → 같은 `organization_id`로 2번째 매핑 시도 → unique 위반(`23505`) 확인(부문 1곳 소속 강제).
- [x] 하위 법인이 있는 `org_groups` 행 delete 시도 → FK `restrict` 위반(`23503`/foreign_key_violation) 확인.
- [x] `set local role authenticated` + `set_config('request.jwt.claims', ...)`로 `role='user'`(표유진) / `role='admin'`(홍길동) 세션을 시뮬레이션 — select 통과(3개 테이블 전부 count 정상 반환), insert는 `insufficient_privilege`(`42501`)로 두 세션 모두 차단 확인.
- [x] `update` 실행 후 `updated_at`/`updated_by`가 `set_master_audit()`로 채워지는지 확인(superadmin 나승규 세션으로 확인).
- [x] 확장된 `next_master_code()`가 기존 12종(`company`~`product`)에 대해서도 회귀 없이 동작함을 1회씩 호출로 확인 후 시퀀스 전부 `setval`로 원복.
- [x] `role='admin'`(홍길동, superadmin 아님) 세션에서 `next_master_code('org_group')` 호출 → superadmin 권한 예외 확인.
- [x] 테스트에 사용한 행(그룹사/법인/매핑 각 1건) 전부 삭제 후 잔존 0건 확인, `org_code_group_seq`/`org_code_company_seq`를 `setval(..., 1, false)`로 원복(Task 046이 실제 코드로 `GRP0001`/`OC0001`을 채번할 수 있도록).

---

### Task 046: 기존 `organizations` 고아 방지 초기 데이터 삽입 ✅

> Task 043 ①②에서 그룹사명 "OO그룹" / 법인명 "OO 법인"(둘 다 가안 그대로 채택)으로 확정 완료.
> **PRD 5.3절 "마이그레이션 시 필수 작업"에 해당하는 Task다. 이 Task를 건너뛰면 기존 부문 1건("IT부문")과 그 하위 팀 8건·구성원 63건 전체가 트리에서 고아가 되어 조직도 화면이 빈 껍데기가 된다.**

**목표**: Task 045의 테이블에 그룹사 1건 + 법인 1건 + 부문 매핑 1건을 넣어, 기존 실데이터(부문 1 / 팀 8 / 구성원 63)가 트리에 즉시 연결되게 한다. **부서(`org_sections`)는 이 Task에서 만들지 않는다** — 부서는 선택적 레벨이므로, 부서 없이도 이 시점에서 트리가 완전히 정상 동작해야 한다(부서 예시는 Task 058에서 별도로 넣는다).

**관련 파일**

- Supabase 마이그레이션(MCP) — `seed_org_root_and_link_existing_division`
- `docs/prd/PRD_ORG.md` 5.3절 / 9장

**구현 체크리스트**

- [x] 착수 전 `execute_sql`로 대상 부문 id를 재확인했다 — `e72c8bf2-e334-498f-a21f-1cadd9b37ee0` / `name = "IT부문"` / `archived_at = null`(로드맵 기록과 동일).
- [x] `org_groups` 1건 insert — `code = 'GRP0001'`, `name = 'OO그룹'`(Task 043 ① 확정값), `singleton = true`.
- [x] `org_companies` 1건 insert — `code = 'OC0001'`, `name = 'OO 법인'`(Task 043 ② 확정값), `org_group_id`는 위 그룹사.
- [x] `org_company_divisions` 1건 insert — `org_company_id` = 위 법인, `organization_id` = 기존 "IT부문" id, `sort_order = 0`. **이 매핑이 이 Task의 핵심 산출물이다.**
- [x] 시퀀스 정합 — `setval('public.org_code_group_seq', 1, true)` / `setval('public.org_code_company_seq', 1, true)`로 다음 채번이 `GRP0002`/`OC0002`가 되게 맞췄다.
- [x] `created_by`가 마이그레이션 컨텍스트에서 `auth.uid()` 없어 `null`로 저장됨을 확인했다(ROADMAP_MASTER Task 041과 동일 현상, 3건 모두 `null`).
- [x] 롤백 SQL(3건 delete + `setval` 원복)을 마이그레이션 상단 주석에 남겼다.
- [x] **마이그레이션이 `organizations`를 `SELECT`(FK 참조)만 하고 `INSERT`/`UPDATE`하지 않음을 확인**했다 — CTE(`with new_group as (...), new_company as (...)`)로 그룹사→법인→매핑 3건만 삽입.

**수락 기준**

- [x] `org_groups` 1건 / `org_companies` 1건 / `org_company_divisions` 1건이 존재한다.
- [x] 기존 `organizations` 1건 / `departments` 8건 / `profiles` 63건의 행 수와 값이 마이그레이션 전후 정확히 동일하다.
- [x] 그룹사 → 법인 → 부문 → 팀 → 구성원 조인 쿼리가 63명 전원을 반환한다(고아 0명).

**테스트 체크리스트 (execute_sql)**

- [x] 그룹사→법인→매핑→부문→팀→구성원 조인으로 `count(*) = 63` 확인.
- [x] `org_company_divisions`에 매핑되지 않은 `organizations` 행 0건 확인(`left join ... where cd.id is null`).
- [x] 마이그레이션 전후 `organizations`(1)/`departments`(8)/`profiles`(63) 행 수 동일 확인.
- [x] superadmin 세션에서 `next_master_code('org_company')` 호출 → `OC0002` 반환 확인 후 `setval(..., 1, true)`로 시퀀스 원복(다음 실사용 채번이 `OC0002`가 되도록 유지).

---

### Task 047: 부서 신규 테이블 2종 생성 (`org_sections` / `org_section_teams`) + 일관성 트리거 ✅

**목표**: "부문과 팀 사이에 있을 수도 없을 수도 있는" 부서 레벨을 구축한다. **부서 자체 테이블(`org_sections`)과 "이 팀이 어느 부서 소속인가"를 표현하는 매핑 테이블(`org_section_teams`)을 분리하고, 서로 다른 부문의 부서·팀이 잘못 연결되지 않도록 트리거로 막는다.**

**관련 파일**

- Supabase 마이그레이션(MCP) — `create_org_sections`, `extend_next_master_code_for_org_section`
- `docs/prd/PRD_ORG.md` 5.4 / 5.5절
- `lib/erp/org/code.ts` (Task 044)

**구현 체크리스트**

- [x] `org_sections` 생성 (PRD 5.4) — Task 045의 공통 컬럼 패턴 그대로 + `organization_id uuid not null references public.organizations(id) on delete restrict`(부서는 정확히 1개 부문 소속) + `sort_order integer not null default 0`. `code`는 `OS####`.
  - [x] `before update` 트리거로 `public.set_master_audit()` 연결.
- [x] `org_section_teams` 생성 (PRD 5.5):
  - [x] `id uuid primary key default gen_random_uuid()`
  - [x] `section_id uuid not null references public.org_sections(id) on delete cascade` — 부서가 삭제되면 그 소속 매핑도 함께 삭제(팀 자체는 남고 부문 직속으로 자연히 되돌아감. `departments`는 변경되지 않으므로 안전).
  - [x] `department_id uuid not null unique references public.departments(id) on delete cascade` — **unique로 "팀은 부서 정확히 1곳에만 소속"을 강제**. `departments`를 참조만 하고 변경하지 않는다.
  - [x] `sort_order integer not null default 0`, `created_at timestamptz not null default now()`, `created_by uuid references public.profiles(id) default auth.uid()`
- [x] **일관성 트리거** (PRD 5.5 SQL 그대로): `public.check_org_section_team_consistency()`(`security definer`, `search_path = ''`) — `org_sections.organization_id`와 `departments.organization_id`를 각각 조회해 다르면 `raise exception`. `before insert or update on org_section_teams`로 연결.
  - [x] 이 함수는 `org_sections`/`departments`를 **SELECT만** 하고, 두 테이블 어디에도 `INSERT`/`UPDATE`/`DELETE`를 실행하지 않음을 함수 본문으로 재확인했다.
- [x] 인덱스: `org_sections(organization_id, sort_order)`, `org_section_teams(section_id, sort_order)` + `created_by`/`updated_by` FK 커버링 인덱스.
- [x] RLS 활성화 + 정책 — **부서는 부문 스코프 admin이 관리 가능**(PRD 3.1, 그룹사/법인과 다름에 주의):
  - [x] `org_sections` `select` — `to authenticated using (true)`.
  - [x] `org_sections` `insert`/`update`/`delete` — `public.is_superadmin() or (public.is_admin() and organization_id = public.current_organization_id())`.
  - [x] `org_section_teams` `select` — `to authenticated using (true)`.
  - [x] `org_section_teams` `insert`/`update`/`delete` — 부서 기준 스코프 판정: `public.is_superadmin() or (public.is_admin() and exists (select 1 from public.org_sections s where s.id = section_id and s.organization_id = public.current_organization_id()))`.
- [x] 코드 채번 확장 — 시퀀스 `org_code_section_seq`(start 1) 생성 + `public.next_master_code(p_entity)`를 다시 `create or replace`로 확장해 `when 'org_section'` 분기 추가(`OS`/4). 권한 프리앰블은 건드리지 않았다(기존 `elsif not is_admin() then raise` 기본 분기를 그대로 탐).
  - [x] Task 045에서 추가한 `org_group`/`org_company` 분기가 이번 `create or replace`에서도 그대로 남아 있음을 함수 재조회로 확인 후 작성, 실제 호출로도 회귀 없음을 확인했다.
- [x] `get_advisors`(security + performance) 확인 — **신규 실질 경고 없음.** `check_org_section_team_consistency()`가 anon/authenticated에서 실행 가능하다는 SECURITY DEFINER 경고가 새로 나오지만, 기존 `check_product_brand_consistency()`(동일 목적의 일관성 검증 트리거 함수)와 완전히 같은 패턴이라 이 코드베이스의 기존 관례를 따른 것 — 신규 위험군 아님. performance는 신규 빈 테이블의 unused_index INFO만.
- [x] **마이그레이션 SQL에 `alter table public.departments` / `public.organizations`가 없음을 재확인**했다(FK로 참조만 함).
- [x] (워크플로우 규약) `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성 — 순수 추가분만 반영, `npm run typecheck` 통과.

**수락 기준**

- [x] `org_sections`/`org_section_teams` 2개 테이블이 생성되고 컬럼·FK·unique·트리거가 확인된다(`information_schema`/`pg_constraint`/`pg_trigger` 조회로 검증).
- [x] 서로 다른 부문 소속인 부서-팀 조합을 `org_section_teams`에 insert 시도 → 트리거 예외로 실패한다.
- [x] 같은 팀을 2개 부서에 동시에 매핑 시도 → unique 위반(`23505`)으로 실패한다.
- [x] `role='admin'`이면서 `current_organization_id()`가 일치하는 부문의 부서에는 CRUD가 가능하고, 다른 부문의 부서는 차단된다. `role='superadmin'`은 전부 가능.
- [x] superadmin 세션에서 `next_master_code('org_section')` → `OS0001` 형식이 반환되고, 기존 12종 + `org_group`/`org_company` 채번이 회귀 없이 동작한다.

**테스트 체크리스트 (execute_sql)**

- [x] `org_sections` 1건("IT부문" 소속) insert 성공 확인.
- [x] `org_section_teams`에 위 부서 + `ERP시스템팀`(같은 "IT부문" 소속) 매핑 insert 성공 확인.
- [x] **임시로 다른 부문 1건(`TEST_다른부문`) + 그 부문 소속 부서 1건을 만들고**, 그 부서에 "IT부문" 소속 `Commerce시스템팀`을 매핑 시도 → 일관성 트리거 예외 확인 → 임시 부문/부서 정리 완료.
- [x] 이미 매핑된 `ERP시스템팀`을 다른 부서에 재매핑 시도 → `department_id` unique 위반(`23505`) 확인.
- [x] `role='admin'`(홍길동) 세션 시뮬레이션 — 자기 부문(IT부문) 소속 부서 CRUD 성공, 다른 부문(`TEST_다른부문`) 부서 CRUD `42501` 차단 확인.
- [x] `role='user'`(표유진) 세션 — 두 테이블 모두 select 성공(4건/1건 조회), insert `42501` 차단 확인.
- [x] 부서 delete → 연결된 `org_section_teams` 행이 cascade로 함께 삭제되고 **`departments`(`ERP시스템팀`) 자체는 영향받지 않음**을 확인(팀 행이 그대로 남고 `organization_id`/`archived_at` 변화 없음 — 부문 직속으로 자연히 되돌아감).
- [x] `next_master_code('org_group')`/`next_master_code('org_company')`를 재호출해 Task 045에서 추가한 분기가 이번 `create or replace`로 깨지지 않았음을 회귀 확인(`GRP0002`/`OC0002` 정상 반환 후 시퀀스 원복).
- [x] 테스트 행(부서 4건, 매핑 1건, 임시 부문 1건) 전부 삭제 후 잔존 0건 확인. `org_code_group_seq`/`org_code_company_seq`는 `setval(..., 1, true)`로, `org_code_section_seq`는 `setval(..., 1, false)`로 원복(부서는 아직 실사용 채번이 없어 다음 호출이 `OS0001`이 되도록 유지 — Task 058에서 사용).

---

### Task 048: `org_unit_leaders` 테이블 생성 (5레벨 공용 리더 + 레벨별 RLS) ✅

**목표**: 그룹사/법인/부문/**부서**/팀 5개 레벨의 "장(長)"을 하나의 테이블로 통일해 저장하고, PRD 3.1의 레벨별 권한 차이를 RLS로 정확히 표현한다.

**관련 파일**

- Supabase 마이그레이션(MCP) — `create_org_unit_leaders`
- `docs/prd/PRD_ORG.md` 5.6절 / 3.1절

**구현 체크리스트**

- [x] 테이블 생성 (PRD 5.6):
  - [x] `id uuid primary key default gen_random_uuid()`
  - [x] `org_group_id uuid references public.org_groups(id) on delete cascade`
  - [x] `org_company_id uuid references public.org_companies(id) on delete cascade`
  - [x] `organization_id uuid references public.organizations(id) on delete cascade`
  - [x] **`org_section_id uuid references public.org_sections(id) on delete cascade`**
  - [x] `department_id uuid references public.departments(id) on delete cascade`
  - [x] `profile_id uuid not null references public.profiles(id) on delete cascade`
  - [x] `title text not null`
  - [x] `created_at`/`updated_at timestamptz not null default now()`, `updated_by uuid references public.profiles(id)`
  - [x] **FK 삭제 정책은 `cascade`** — 마스터 도메인의 `restrict` 관례와 반대다. 리더 지정은 "부속 정보"라 조직/구성원이 사라지면 함께 사라지는 것이 옳고, `restrict`로 두면 이 신규 테이블이 기존 `departments`/`organizations`/`profiles` 삭제를 막게 되어 **기존 테이블의 동작을 바꾸는 셈**이 된다(무변경 원칙 위배). 이 결정 근거를 마이그레이션 주석에 남겼다.
- [x] 제약 추가 (PRD 5.6 SQL 그대로, **5개 컬럼 기준**):
  ```sql
  alter table public.org_unit_leaders
    add constraint org_unit_leaders_exactly_one_target
    check (num_nonnulls(org_group_id, org_company_id, organization_id, org_section_id, department_id) = 1);

  create unique index org_unit_leaders_group_uk    on public.org_unit_leaders(org_group_id)    where org_group_id is not null;
  create unique index org_unit_leaders_company_uk  on public.org_unit_leaders(org_company_id)  where org_company_id is not null;
  create unique index org_unit_leaders_division_uk on public.org_unit_leaders(organization_id) where organization_id is not null;
  create unique index org_unit_leaders_section_uk  on public.org_unit_leaders(org_section_id)  where org_section_id is not null;
  create unique index org_unit_leaders_team_uk     on public.org_unit_leaders(department_id)   where department_id is not null;
  ```
- [x] `before update` 트리거로 기존 `public.set_master_audit()` 연결(`updated_at` + `updated_by`). `created_by` 컬럼이 없으므로 트리거가 설정하는 `updated_by`만 사용한다.
- [x] 인덱스: `profile_id` FK 커버링 인덱스(리더로 지정된 사람 역조회용) + `updated_by` 커버링 인덱스.
- [x] RLS 활성화 + 정책:
  - [x] `select` — `to authenticated using (true)` (조직도 조회는 전 구성원)
  - [x] `insert` — `with check`에 **레벨별 분기**를 그대로 표현(부서 분기 추가):
    ```sql
    public.is_superadmin()
    or (
      department_id is not null
      and public.is_admin()
      and exists (
        select 1 from public.departments d
        where d.id = department_id
          and d.organization_id = public.current_organization_id()
      )
    )
    or (
      org_section_id is not null
      and public.is_admin()
      and exists (
        select 1 from public.org_sections s
        where s.id = org_section_id
          and s.organization_id = public.current_organization_id()
      )
    )
    ```
    → 팀·부서 리더만 `is_admin()` + 스코프 일치로 허용, 그룹사/법인/부문 리더는 `superadmin` 전용(PRD 3.1 표).
  - [x] `update` — 같은 식을 `using`과 `with check` 양쪽에 적용(리더 교체 시 대상 팀/부서를 바꿔 스코프를 우회하지 못하게).
  - [x] `delete` — 같은 식을 `using`에 적용.
  - [x] 정책 이름은 기존 관례를 따라 `org_unit_leaders_select_authenticated` / `org_unit_leaders_insert_admin` / `_update_admin` / `_delete_admin`.
- [x] `get_advisors`(security + performance) 확인 — **신규 실질 경고 없음.** `org_unit_leaders` 관련 SECURITY DEFINER 함수를 새로 만들지 않았고(기존 `is_admin()`/`is_superadmin()`/`current_organization_id()`/`set_master_audit()`만 재사용), RLS 4개 정책이 모두 반영되어 security/performance 리스트 어디에도 이 테이블이 새로 등장하지 않았다(테스트로 만든 데이터를 전부 정리한 뒤 조회한 빈 테이블 기준).
- [x] **마이그레이션 SQL에 `alter table public.departments` / `public.profiles` / `public.organizations`가 없음을 재확인**(FK로 참조만 한다).

**수락 기준**

- [x] 5개 FK 중 2개 이상에 값을 넣은 insert가 CHECK 위반(`23514`)으로 거부된다. 5개 전부 null인 insert도 거부된다.
- [x] 같은 팀/부서에 리더 2명을 넣으려 하면 partial unique index 위반(`23505`)으로 거부된다(5개 레벨 각각 확인).
- [x] `role='admin'`이면서 `current_organization_id()`가 일치하는 팀·부서에는 리더를 지정할 수 있고, 부문/법인/그룹사 리더 지정은 거부된다.
- [x] `role='superadmin'`은 5개 레벨 전부 지정 가능하다.

**테스트 체크리스트 (execute_sql)**

- [x] `num_nonnulls` CHECK 검증 — 0개/2개/5개 타깃 조합 insert 3건 전부 `23514` 확인.
- [x] 5개 partial unique index 각각에 대해 중복 지정 시도 → `23505` 확인(그룹사/법인/부문/부서/팀 5회, 사전에 1개 타깃만 채운 insert 5건이 정상 성공함도 함께 확인).
- [x] `role='admin'`(홍길동, IT부문) 세션 시뮬레이션 — 자기 부문 소속 팀(IT기획팀)·부서(임시 부서) 리더 insert 성공, 다른 부문(임시 `TEST_다른부문`)의 팀·부서 및 부문/법인/그룹사 리더 insert 전부 `42501` 차단 확인.
- [x] `role='superadmin'`(나승규) 세션 시뮬레이션 — 법인/부문/부서/팀 4개 레벨은 새 타깃에 insert 성공, 그룹사는 이미 점유된 타깃에 insert 시도 시 RLS를 통과해 `23505`(unique 위반, `42501` 아님)로 거부되어 권한 자체는 허용됨을 확인 — 5개 레벨 전부 허용.
- [x] `role='user'`(표유진) 세션 — select 성공(당시 11건 조회), insert `42501` 차단 확인.
- [x] `profiles` 행 삭제 시 리더 행이 cascade로 함께 삭제되고 **`profiles` 삭제 자체는 막히지 않는지** 확인 — 임시 `auth.users` 계정(트리거로 `profiles` 자동 생성)을 리더로 지정한 뒤 `auth.users`를 delete → `profiles`/`org_unit_leaders` 둘 다 cascade로 0건, `auth.users` delete 자체는 에러 없이 성공.
- [x] 리더 교체(UPDATE)를 실행해 `updated_at`/`updated_by`가 갱신되는지 확인(나승규 세션으로 확인).
- [x] 테스트 행(리더 11건 + 임시 부서 3건 + 임시 법인 1건 + 임시 팀 1건 + 임시 부문 1건) 전부 삭제 후 잔존 0건 확인, 기존 데이터(법인 1/그룹사 1/팀 8/부문 1/구성원 63) 원상 유지 확인.

---

### Task 049: `get_org_chart_members()` SECURITY DEFINER 함수 구현 ✅

**목표**: `profiles`의 RLS를 **전혀 건드리지 않고** 조직도에 필요한 최소 컬럼만 전 로그인 사용자에게 노출한다. 이 로드맵에서 가장 보안 민감도가 높은 Task다. **관리 화면(Task 053)과 헤더 팝업(Task 054) 둘 다 이 함수를 공유한다.**

**관련 파일**

- Supabase 마이그레이션(MCP) — `create_get_org_chart_members`
- `docs/prd/PRD_ORG.md` 3.2절 (SQL 원본)
- `lib/erp/org/types.ts` (Task 044 — `OrgMember`가 반환 컬럼과 1:1 대응)

**구현 체크리스트**

- [x] PRD 3.2절 SQL을 그대로 적용한다:
  ```sql
  create or replace function public.get_org_chart_members()
  returns table (id uuid, name text, department_id uuid, avatar_key text, role text, is_active boolean)
  language sql
  security definer
  set search_path = ''
  stable
  as $$
    select p.id, p.name, p.department_id, p.avatar_key, p.role, p.is_active
    from public.profiles p
  $$;

  revoke all on function public.get_org_chart_members() from public;
  grant execute on function public.get_org_chart_members() to authenticated;
  ```
  - [x] PRD 원문의 `set search_path = public` 대신 **`set search_path = ''` + 스키마 정규화(`public.profiles`)** 로 적용했다 — 기존 6개 DB 함수가 전부 이 컨벤션이고, Supabase advisor의 `function_search_path_mutable` 경고를 피하는 방식이다. **반환 컬럼 목록은 PRD와 정확히 동일하게 유지**했다.
  - [x] **`where department_id is not null` 같은 필터를 넣지 않았다** — 그룹사/법인/부문/부서 리더로 지정될 임원이 특정 팀 소속이 아닐 수 있는데(`profiles.department_id` nullable), 여기서 걸러내면 Task 050의 `getOrgLeaders()` 매칭에서 그 리더의 이름이 조회되지 않는다(PRD 3.2절). 팀 소속 필터링이 필요한 조회(구성원 목록)는 호출부에서 결과를 `department_id`로 걸러 쓴다.
  - [x] `anon`에는 `execute`를 부여하지 않았다(로그인 사용자 전용). **⚠️ 실제 적용 중 발견한 함정**: `revoke all on function ... from public`만으로는 부족했다 — Supabase 프로젝트는 함수 생성 시 `ALTER DEFAULT PRIVILEGES`로 `anon`/`authenticated`/`service_role`에 **명시적** EXECUTE를 자동 부여하는데, `PUBLIC`에서의 revoke는 이 명시적 grant를 제거하지 않는다(`pg_proc.proacl`로 확인함 — `revoke ... from public` 직후에도 `anon=X/postgres`가 그대로 남아 있었고, `set local role anon`으로 실제 호출해 63건이 반환되는 것으로 재현). **`revoke execute on function public.get_org_chart_members() from anon;`을 별도 마이그레이션으로 추가 적용**해 `proacl`에서 `anon` 항목을 제거하고, 재테스트로 `42501`이 반환됨을 확인했다. PRD 3.2절 SQL을 그대로 베끼는 다음 작업(헤더 팝업 등에서 유사 함수를 새로 만들 경우)은 이 함정을 반드시 재확인할 것.
- [x] **반환 컬럼에 `phone_number` / `bio` / `email`이 포함되지 않았는지 SQL 본문으로 재확인**했다 — `pg_get_functiondef` 결과에 해당 문자열 없음.
- [x] 함수 상단에 주석으로 "이 함수는 `profiles` RLS를 우회한다. 컬럼을 추가할 때는 개인정보 노출 범위를 반드시 재검토할 것"을 남겼다.
- [x] `get_advisors`(security) 확인 — `get_org_chart_members()`가 `authenticated_security_definer_function_executable`(기존 7개 함수와 동일 패턴, 의도된 노출)에는 등장하지만 `anon_security_definer_function_executable` 목록에는 **등장하지 않음**을 확인했다(anon revoke가 advisor 레벨에서도 반영됨).
- [x] **`profiles` 테이블의 정책·컬럼을 변경하는 SQL이 마이그레이션에 없음을 재확인**했다.

**수락 기준**

- [x] `role='user'` 세션에서 `select * from public.get_org_chart_members()` 호출 시 **`profiles` 63건 전체**(팀 소속 여부와 무관하게)가 반환된다.
- [x] 같은 세션에서 `select * from public.profiles` 직접 조회 시 **여전히 본인 1건만** 반환된다 (RPC 우회가 기존 RLS를 깨지 않았음).
- [x] 반환 컬럼이 정확히 6개(`id`, `name`, `department_id`, `avatar_key`, `role`, `is_active`)다.
- [x] `anon` 롤에서는 실행이 거부된다(위 함정 수정 후 `42501` 확인).

**테스트 체크리스트 (execute_sql)**

- [x] `set local role authenticated` + `set_config('request.jwt.claims', ...)`로 일반 사용자(표유진) 세션 시뮬레이션 → 함수 호출 결과 63건 확인.
- [x] 동일 세션에서 `select count(*) from public.profiles` → 1건 확인(본인만). **이 두 결과의 대비가 이 Task의 핵심 증거다.**
- [x] `set local role anon` → 최초 시도에서는 63건이 반환되는 함정을 발견(위 anon 자동 grant 이슈) → `revoke execute ... from anon` 추가 적용 후 재시도해 `42501` 권한 오류 확인.
- [x] `pg_get_functiondef`로 반환 컬럼 6개와 `security definer`/`stable`/`search_path = ''` 설정을 확인.
- [x] 함수 본문에 `phone_number`/`bio`/`email`/`where` 문자열이 없는지 `pg_get_functiondef` 결과로 확인(필터 없음을 재확인).

---

### Task 050: 타입 재생성 및 조직도 데이터 액세스 계층 구현 ✅

**목표**: 관리 화면(Task 053)과 헤더 팝업(Task 054)이 공유할 서버 측 조회 함수와 Server Action을 한 곳에 모은다. **화면이 각자 조인을 짜지 않도록 하는 것, 그리고 "부서 있으면 부서 아래 / 없으면 부문 직속"이라는 트리 조립 규칙을 한 곳에만 구현하는 것이 이 Task의 존재 이유다.**

**관련 파일**

- `lib/supabase/database.types.ts` (재생성)
- `lib/erp/org/queries.ts` (신규 — 조회)
- `lib/erp/org/actions.ts` (신규 — Server Actions)
- `lib/erp/org/tree.ts` (신규 — 평면 행 → `OrgTreeNode[]` 조립, 순수 함수)
- `lib/erp/auth.ts` (**부수 수정** — `requireSuperadmin()` 신규 추가)
- `lib/erp/org/types.ts` / `levels.ts` / `code.ts` (Task 044)

**구현 체크리스트**

- [x] `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성 — Task 045/047/048의 5개 테이블 블록과 Task 049의 함수 시그니처(`Functions.get_org_chart_members`)가 반영됨을 확인(이번 Task에서는 스키마 변경 없이 재생성만 재확인).
- [x] `lib/erp/auth.ts`에 `requireSuperadmin()` 추가 — `getCurrentErpUser()` 결과의 `role !== "superadmin"`이면 `redirect("/erp/forbidden")`. **기존 `requireAdmin()`은 수정하지 않았다**(추가만).
- [x] `lib/erp/org/queries.ts` — 조회 함수(전부 함수 내부에서 `await createClient()` 호출, 전역 변수 없음). **관리 화면·헤더 팝업 둘 다 이 함수들만 호출한다(각자 조인을 새로 짜지 않는다).**
  - [x] `getOrgTree()` — `org_groups` / `org_companies` / `org_company_divisions` / `org_sections` / `org_section_teams` + `organizations` + `departments`를 조회해 **가변 깊이** `OrgTreeNode[]`를 반환. 구성원은 트리에 포함하지 않는다(PRD 6.3).
    - [x] **부문 노드의 자식 조립 규칙**(PRD 4.2절 그대로 구현): 그 부문 소속 `org_sections` 전부를 자식으로 두고, 그 부문 소속 `departments` 중 `org_section_teams`에 매핑이 **없는** 것만 부문의 직접 자식으로 추가한다(부서에 매핑된 팀은 그 부서의 자식으로만 나타나고 부문에 중복 노출되지 않는다). — `buildOrgTree()`(`tree.ts`)에 구현, 단위 검증 통과.
    - [x] 부문/팀의 `isActive`는 `archived_at is null`로 매핑(PRD 6.5).
    - [x] 정렬: 그룹사·법인·부서는 `sort_order` → `name`, 부문은 `org_company_divisions.sort_order` → `organizations.name`, 팀은 부서 소속이면 `org_section_teams.sort_order`, 부문 직속이면 `departments.name` 가나다순.
    - [x] **매핑되지 않은 부문(고아)이 있으면 트리에서 누락되므로**, `getOrgTree()`가 `orphanDivisionCount`를 함께 반환하고 0보다 크면 `console.warn`으로도 알린다(Task 046 이후 실제 값 0 확인).
  - [x] `getOrgLeaders(members)` — `org_unit_leaders`를 한 번에 조회해 `Map<"level:targetId", OrgLeader>` 형태로 반환. 리더 이름/아바타는 `profiles` 직접 조인이 아니라 **`get_org_chart_members()` 결과와 앱에서 매칭**한다(일반 사용자 세션에서도 리더 이름이 보여야 하므로 — `profiles` 조인은 RLS에 막힌다). **로드맵 원안과 달리 members 배열을 인자로 받는다** — `getOrgChartPopupDataAction()`처럼 트리/멤버/리더를 한 번에 조회하는 호출부가 RPC를 두 번 부르지 않도록 하기 위함(내부에서 자체적으로 `getOrgChartMembers()`를 다시 호출하지 않음).
  - [x] `getOrgChartMembers()` — `supabase.rpc("get_org_chart_members")` 호출 결과를 `OrgMember[]`로 매핑.
  - [x] `getMembersByDepartment(members, departmentId)` — 이미 조회한 결과를 필터링하는 순수 함수로 구현(RPC를 팀별로 반복 호출하지 않는다).
  - [x] `getUnmappedDivisions()` — 아직 법인에 연결되지 않은 `organizations` 목록(Task 055의 매핑 관리 UI용).
  - [x] **`getUnmappedTeamsInDivision(organizationId)`** — 특정 부문 안에서 아직 어떤 부서에도 매핑되지 않은 `departments` 목록(Task 056의 부서-팀 소속 관리 UI용).
  - [x] 파일 상단에 "`cookies()`를 쓰는 `createClient()`에 의존하므로 호출하는 컴포넌트는 `<Suspense>` 경계가 필요하다"를 명시(기존 관례).
- [x] `lib/erp/org/tree.ts` — 평면 행 배열을 `OrgTreeNode[]`로 조립하는 **순수 함수**(`buildOrgTree`). `lib/erp/menu-tree.ts`의 `buildMenuTree` 패턴을 따르되 레벨 이름이 다르고 **부서 유무에 따른 가변 분기가 있으므로** 재사용하지 않고 별도 구현했다. `npx tsx`로 실행한 임시 검증 스크립트로 "부서 0개인 부문", "부서 1개 + 직속 팀 혼재하는 부문" 두 케이스를 확인 후 스크립트는 삭제했다(검증 로그는 아래 테스트 체크리스트 참고).
- [x] `lib/erp/org/actions.ts` — Server Actions (편집용은 전부 진입부에서 권한 가드 먼저 호출):
  - [x] `createOrgCompanyAction(input)` / `updateOrgCompanyAction(id, input)` / `deleteOrgCompanyAction(id)` — 첫 줄에서 `requireSuperadmin()`. 등록 시 `rpc("next_master_code", { p_entity: "org_company" })`로 채번.
  - [x] `updateOrgGroupAction(id, input)` — 그룹사는 **이름/비고/사용여부 수정만** 제공(생성·삭제 액션을 만들지 않았다, PRD 6.2).
  - [x] `setDivisionCompanyAction(organizationId, orgCompanyId)` — `org_company_divisions` upsert(부문당 1건 unique, **완전한 unique 제약**이라 PostgREST `upsert(onConflict: "organization_id")`를 그대로 사용). `requireSuperadmin()`.
  - [x] `moveOrgCompanyAction(id, direction)` — 형제 간 `sort_order` 교환(`moveMasterEntityAction` 로직 참고, 마스터 액션을 수정하지 않고 조직용으로 별도 구현).
  - [x] `createOrgSectionAction(input)` / `updateOrgSectionAction(id, input)` / `deleteOrgSectionAction(id)` — 첫 줄에서 `requireAdmin()` 호출 후, 대상 부문이 `current_organization_id()`와 일치하는지 앱에서도 1차 확인(최종 판정은 RLS). `superadmin`은 통과. 등록 시 `next_master_code("org_section")`로 채번.
  - [x] `assignTeamToSectionAction(departmentId, sectionId)` — `org_section_teams` upsert(팀당 1건 unique, **완전한 unique 제약**이라 `upsert(onConflict: "department_id")`로 이미 다른 부서 소속이면 이관까지 자연히 처리). 부서 기준 스코프로 `requireAdmin()` + 검증.
  - [x] `removeTeamFromSectionAction(departmentId)` — `org_section_teams`에서 해당 팀 매핑 delete(=부문 직속으로 되돌림). 삭제 전 기존 매핑의 부서 기준으로 스코프 검증.
  - [x] `setOrgLeaderAction({ level, targetId, profileId, title })` — 레벨에 따라 가드 분기: `team`/`section`이면 `requireAdmin()`(DB RLS가 스코프까지 최종 판정), 그 외는 `requireSuperadmin()`. **`org_unit_leaders`의 5개 unique 인덱스가 `WHERE ... IS NOT NULL` 조건이 붙은 partial index라 PostgREST `upsert(onConflict: 컬럼명)`이 매칭하지 못함을 발견**(ON CONFLICT 대상이 인덱스의 WHERE 절까지 일치해야 함) — 대신 대상 행 존재 여부를 먼저 `select`한 뒤 있으면 `update`, 없으면 `insert`하는 수동 패턴으로 구현했다(레이스 컨디션 시 두 번째 `insert`가 `23505`로 실패하는 것은 정상 동작이자 의도된 안전망).
  - [x] `clearOrgLeaderAction({ level, targetId })` — 동일 가드 분기 후 delete.
  - [x] **`getOrgChartPopupDataAction()`** — 헤더 팝업(Task 054) 전용. `getOrgTree()`/`getOrgLeaders()`/`getOrgChartMembers()`를 한 번에 호출해 `{ tree, leaders, members }`로 묶어 반환하는 **읽기 전용** 액션(`leaders`는 RSC 직렬화 호환을 위해 `Map`을 `Array.from()`으로 변환해 반환). **역할 가드를 두지 않는다**(PRD 8.4 — RLS가 이미 로그인 사용자 전체 허용이므로 인증 여부 외 추가 체크 불필요, `getCurrentErpUser()`로 인증만 확인). 이 액션은 다른 편집 액션과 달리 `revalidatePath`도 호출하지 않는다(변경이 없으므로).
  - [x] 에러 변환: FK `restrict` 위반(`23503`) → "하위 데이터가 있어 삭제할 수 없습니다.", unique 위반(`23505`) → 상황별 한국어 메시지("이미 사용 중인 코드입니다." / "해당 조직에는 이미 리더가 지정되어 있습니다." / "이 팀은 이미 다른 부서에 소속되어 있습니다." — org_company_divisions/org_section_teams는 upsert로 흡수되어 이 메시지들의 발생 빈도는 낮지만 안전망으로 유지), 트리거 예외(부서-팀 부문 불일치, `P0001`) → 트리거 자체가 이미 한국어 메시지("부서와 팀이 서로 다른 부문에 속해 있어 연결할 수 없습니다.")를 던지므로 `error.message`를 그대로 전달(중복 문자열 방지), RLS 차단(`42501`) → "권한이 없습니다."
  - [x] 반환 타입은 기존 `lib/erp/actions.ts`의 `ActionResult`를 import해 재사용했다(`getOrgChartPopupDataAction()`은 단순 조회라 별도의 `OrgChartPopupData` 타입을 반환).
  - [x] 편집 액션 성공 후 `revalidatePath("/erp/admin/org")` 호출.
- [x] **`lib/erp/master/**` 파일을 수정하지 않았는지 `git diff`로 확인**했다(`app/erp/admin/layout.tsx` 포함 — 둘 다 무변경).

**수락 기준**

- [x] `npm run check-all` 통과 (재생성된 타입 기준). Supabase 생성 타입의 `RejectExcessProperties` 제약 때문에 `lib/erp/master/actions.ts`의 `LooseMasterTable`과 동일한 `LooseTable`/`looseTable()` 캐스팅 패턴을 `actions.ts`에 추가해 해결했다.
- [x] `getOrgTree()`가 그룹사 1 → 법인 1 → 부문 1 → 팀 8(부서 아직 없음)의 트리를 반환한다(Task 046까지만 적용된 상태 기준) — user 세션에서 `treeRootLevel: "group"`, `treeRootChildrenCount: 1`(법인 1개), `orphanDivisionCount: 0` 확인.
- [x] `getOrgChartMembers()`가 일반 사용자 세션에서도 63건(+테스트 계정 자신 포함이라 실측은 64건)을 반환한다.
- [x] 일반 사용자 세션에서 `setOrgLeaderAction`(부문 레벨) 호출 시 `/erp/forbidden`으로 리다이렉트된다 — `NEXT_REDIRECT;replace;/erp/forbidden;307;` 확인.
- [x] 일반 사용자 세션에서 `getOrgChartPopupDataAction()` 호출은 **성공**한다(가드가 없으므로).
- [x] `buildOrgTree` 단위 테스트가 "부서 0개인 부문"과 "부서 1개 + 직속 팀 혼재" 두 케이스 모두에서 올바른 트리를 만든다(10개 assertion 전부 통과).

**테스트 체크리스트 (Playwright MCP + execute_sql)**

검증 방법: `lib/erp/org/*`는 서버 전용이라 브라우저에서 직접 호출할 수 없으므로 ROADMAP_MVP Task 013 / ROADMAP_MASTER Task 029의 선례대로 **임시 디버그 라우트**(`app/api/debug-task050/route.ts`, `?step=` 쿼리로 시나리오 분기하는 GET 핸들러)를 만들어 실제 로그인 세션으로 검증한 뒤 **검증 완료 즉시 삭제**했다(`git status`로 잔존 없음 확인, 커밋되지 않음).

- [x] 임시 계정 3개(`task050-{user,admin,superadmin}@example.com`)를 회원가입(이메일 확인 불필요, 즉시 로그인 가능한 프로젝트 설정 확인) → `execute_sql`로 role 승격(`prevent_unauthorized_role_change`가 `auth.uid()` 세션 여부와 무관하게 "superadmin은 이미 admin인 사용자만" 조건을 검사하므로, 원안 그대로 superadmin은 admin 경유 2단계 승격 필요 — ROADMAP_MASTER Task 031 기록과 일치) 완료. admin 계정은 `department_id`를 `ERP시스템팀`(IT부문 소속)으로 설정해 `current_organization_id()`가 IT부문을 가리키게 했다.
- [x] user 세션에서 `getOrgChartMembers()` → 64건(63 seed + 테스트 계정 자신) 반환 확인. 같은 세션에서 `getOrgTree()` → 정상 트리 반환 확인.
- [x] user 세션에서 `getOrgChartPopupDataAction()` 호출 → 성공 확인(가드 없음 재검증, `popupMembersCount: 64`).
- [x] user 세션에서 `getOrgLeaders()`가 **리더 이름을 정상 반환**하는지 확인 — superadmin 세션에서 미리 팀 리더로 지정해 둔 테스트 계정 이름(`TEST_리더이름050`)이 user 세션의 `getOrgLeaders()` 결과에도 그대로 나타남을 확인(`profiles` 직접 조인이었다면 RLS로 null이 되었을 지점 — RPC 매칭 구현이 맞음을 실증).
- [x] superadmin 세션에서 `createOrgCompanyAction` → 코드 `OC0002`로 자동 채번되어 저장됨을 확인.
- [x] admin 세션에서 `createOrgSectionAction`(자기 부문, IT부문) 성공 → 코드 `OS0001` 채번 확인. 임시로 다른 부문(`TEST_다른부문050`)을 만들어 그 부문에 `createOrgSectionAction` 시도 → `{ success: false, message: "권한이 없습니다." }`로 앱 레벨 스코프 확인이 정상 차단함을 확인("또는 RLS 차단"에 해당 — `assertDivisionScope()`가 DB RLS와 동일한 판정을 미리 반환).
- [x] admin 세션에서 `assignTeamToSectionAction`(자기 부문 소속 팀 `IT기획팀` → 방금 만든 부서) 성공 → `org_section_teams`에 매핑 1건 생성 확인(`getOrgTree()` 재조회 대신 매핑 테이블 직접 조회로 확인). `removeTeamFromSectionAction` 호출 → 매핑 삭제 및 `departments`(IT기획팀) 원본 행 무변화 확인.
- [x] admin 세션에서 `setOrgLeaderAction({ level: "team", ... })`(자기 부문 팀) 성공, `{ level: "division", ... }`은 `/erp/forbidden` 리다이렉트 확인.
- [x] admin 세션에서 `createOrgCompanyAction` 호출 → `/erp/forbidden` 리다이렉트 확인(superadmin 전용).
- [x] 같은 조직에 리더 2명 지정 시도 → "해당 조직에는 이미 리더가 지정되어 있습니다." 메시지 확인 — `setOrgLeaderAction`이 "이미 있으면 교체" 방식이라 순차 호출로는 재현되지 않아, **동시 두 프로필로 같은 대상(부문)에 `Promise.all`로 동시 호출**해 실제 DB 레벨 레이스를 재현했다(한쪽 성공, 다른 쪽이 `23505` → 위 메시지로 실패).
- [x] 임시 디버그 라우트, 테스트 데이터(임시 부서 1/법인 1/부문 1), 임시 계정 3개, 소비된 시퀀스(`org_code_company_seq`/`org_code_section_seq`) 원복 후 잔존 0건 확인(그룹사 1/법인 1/부문 1/팀 8/구성원 63 원상 유지). 브라우저 콘솔 에러 0건.

---

## Phase 9: 메뉴 등록 및 관리 라우트 골격 ✅

> PRD 7장.
> `menus`의 기존 "마스터 관리 > 기본 관리"(사용자/메뉴/권한 관리와 형제) 아래 4번째 소분류로 "조직도 관리"를 추가하고 `/erp/admin/org` 라우트에 연결한다.
> **Phase 8과 병렬 착수 가능하다** — 스키마와 무관한 메뉴/라우팅 작업이다.

### Task 051: menus 데이터 추가 ("마스터 관리 > 기본 관리 > 조직도 관리") ✅

**목표**: 이미 3개 소분류(사용자 관리/메뉴 관리/사용자 권한 관리)가 있는 "기본 관리" 중분류 아래에 4번째 소분류를 신규 등록한다. **기존 메뉴는 한 건도 수정하지 않는다.** 관리 화면이 admin 전용으로 확정되면서, 이전 검토안에 있던 "일반 사용자에게 메뉴 권한을 일괄 부여해야 하는가" 문제는 **더 이상 발생하지 않는다** — 이 메뉴도 기존 3형제와 마찬가지로 일반 사용자에게는 그냥 보이지 않으면 된다(헤더 팝업이 조회를 전담하므로).

**관련 파일**

- Supabase 마이그레이션(MCP) — `add_org_chart_menu`
- `docs/prd/PRD_ORG.md` 7장

**구현 체크리스트**

- [x] 착수 전 `execute_sql`로 대상 중분류를 재확인했다 — "기본 관리" = `7ecdefaa-2707-4890-bddd-77e1de731ef1`, 기존 소분류 3건(사용자 관리 0 / 메뉴 관리 1 / 사용자 권한 관리 2) id 전부 로드맵 기록과 일치함을 확인.
- [x] 소분류 insert 1건 — `parent_id` = "기본 관리" id, `level = 3`, `name = '조직도 관리'`, `sort_order = 3`, `is_active = true`(마이그레이션 `add_org_chart_menu`, 신규 id `aa8ed6df-66f4-446b-b1f6-56344f2715b6`).
- [x] **기존 메뉴 행에 대한 UPDATE/DELETE가 없음** — 마이그레이션 SQL이 순수 INSERT 1건뿐임을 확인.
- [x] `user_menu_permissions`에 대한 INSERT는 **하지 않았다**.
- [x] 롤백 SQL(소분류 delete)을 마이그레이션 주석에 남겼다.

**수락 기준**

- [x] "기본 관리" 하위에 소분류 1건이 추가되어 총 4건(사용자/메뉴/권한/조직도 관리)이 되고 `is_active = true`임을 `execute_sql`로 확인.
- [x] 기존 메뉴(마스터 관리, 기본 관리 및 그 3형제 등)의 이름·정렬·활성 상태가 마이그레이션 전후 동일함을 확인(전체 `menus` 27건, 순수 +1건).
- [x] 관리자 계정으로 `/erp`에서 상단 "마스터 관리" 선택 시 좌측 트리에 "기본 관리 > 조직도 관리"가 노출됨을 Playwright로 확인.
- [x] 일반 사용자 계정에게는 (기존 3형제와 마찬가지로) 이 메뉴가 노출되지 않음을 확인 — 해당 임시 계정은 `user_menu_permissions`가 전혀 없어 대분류 자체가 비노출(기존 동작과 동일한 패턴).

**테스트 체크리스트 (Playwright MCP)**

- [x] 임시 관리자 계정(`temp-org-admin-20260817@example.com`, role 승격)으로 로그인 → `/erp` → 상단 Menubar "마스터 관리" → 좌측 트리에 "기본 관리" 펼침 → "조직도 관리"가 기존 3형제 아래 4번째로 노출 확인(스크린샷 `task051-admin-menu-tree.png`).
- [x] 임시 일반 사용자 계정(`temp-org-user-20260817@example.com`, role 기본값 `user`)으로 로그인 → 권한 부여가 없어 대분류 자체가 비노출됨을 확인(스크린샷 `task051-user-no-menu.png`).
- [x] 마이그레이션 전후 `menus` 전체 행 수 대조(+1건, 27건) 및 기존 행 무결성 확인.
- [x] `browser_console_messages`로 콘솔 에러 0건 확인(양쪽 계정 모두).
- [x] 임시 계정 2개(`auth.users` delete, `profiles`는 FK cascade) 삭제 후 잔존 0건 확인.
- [x] `npm run check-all` 통과 확인(에러 0건, 기존 경고 8건은 이번 변경과 무관).

---

### Task 052: `/erp/admin/org` 라우트 골격 및 메뉴 라우트 매핑 ✅

**목표**: 조직도 관리 라우트를 스캐폴딩하고 메뉴 → 실제 라우트 매핑을 연결한다. **기존 `app/erp/admin/layout.tsx`가 이미 `requireAdmin()`으로 가드하고 있으므로, 이 Task는 그 가드를 상속받는 `page.tsx`만 추가하면 된다 — 별도 접근 제어 코드가 필요 없다.**

**관련 파일**

- `app/erp/admin/org/page.tsx` (신규, 스텁 — `app/erp/admin/{users,menus,permissions}/page.tsx`와 형제)
- `lib/erp/menu-routes.ts` (기존 — `MENU_ROUTES`에 매핑 1건 추가)
- `components/erp/page-header.tsx` (기존 재사용)

**구현 체크리스트**

- [x] `lib/erp/menu-routes.ts`의 `MENU_ROUTES`에 매핑 추가 — `"마스터 관리>기본 관리>조직도 관리": "/erp/admin/org"`. 착수 전 Task 051에서 조회한 메뉴명("조직도 관리")과 정확히 일치함을 확인.
- [x] `app/erp/admin/org/page.tsx` 스텁 생성 — 얇은 `Page` + `<Suspense fallback={null}>` + `async AdminOrgContent` 패턴. `PageHeader`로 breadcrumb(다른 3형제와 동일 패턴 — `getMenuPathForRoute().slice(0, -1)`로 "마스터 관리 > 기본 관리"를 breadcrumb에, "조직도 관리"를 title로 표시해 합쳐서 3단 경로를 나타냄)를 표시하고 "Task 053에서 구현됩니다" 안내 문구를 둔다(`MenuPlaceholder`와 동일한 `Empty`/`Construction` 아이콘 사용). `app/erp/admin/layout.tsx`를 그대로 상속받으므로 이 페이지에 별도 가드 코드를 넣지 않았다.
- [x] `app/erp/menu/[menuId]/page.tsx`의 기존 판정 순서를 **변경하지 않았다** — 새 매핑이 그 흐름에 자연히 얹힘을 코드 리뷰로 확인.

**수락 기준**

- [x] 트리에서 "조직도 관리" 클릭 시 `MenuPlaceholder`가 아니라 `/erp/admin/org`로 이동함을 Playwright로 확인.
- [x] 로그인한 `role='user'` 계정이 `/erp/admin/org`에 **직접 URL로 접근하면 `/erp/forbidden`으로 리다이렉트**됨을 확인.
- [x] 미인증 상태로 `/erp/admin/org` 접근 시 `/auth/login`으로 리다이렉트됨을 확인.
- [x] breadcrumb "마스터 관리 > 기본 관리" + heading "조직도 관리"로 3단 경로가 표시됨을 확인.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 2개(admin 1 / user 1)로 검증 후 즉시 삭제

- [x] admin 계정(`temp-org-052-admin@example.com`, role 승격)으로 트리 클릭 → `/erp/admin/org?cat=...&menu=aa8ed6df-...`로 이동 및 breadcrumb 확인(스크린샷 확인 후 삭제).
- [x] **user 계정(`temp-org-052-user@example.com`, role 기본값)으로 `/erp/admin/org` 직접 URL 진입 → `/erp/forbidden`으로 튕기는지 확인** — 기존 3형제 화면과 동일 동작 대조 완료.
- [x] 로그아웃 상태로 `/erp/admin/org` 접근 → `/auth/login` 리다이렉트 확인.
- [x] `getMenuPathForRoute("/erp/admin/org")`가 3단 경로(`["마스터 관리","기본 관리","조직도 관리"]`)를 반환함을 breadcrumb+title 표시로 간접 확인.
- [x] `browser_console_messages` 에러 0건(admin/user/미인증 3단계 모두), `npm run check-all` 통과(에러 0건, 기존 경고 8건은 무관).
- [x] 임시 계정 2개 삭제 후 잔존 0건 확인.

---

## Phase 10: 조직도 화면 구현 ✅

> PRD 6.3절 / 3.1절 / 8장.
> **조회 기반 관리 화면(Task 053)을 먼저 완성해 데이터 계층을 실사용으로 검증하고, 헤더 팝업(Task 054)과 편집 기능(Task 055/056/057)을 그 위에 얹는다.**
> Task 054·055·056·057은 Task 053 완료 후 서로 독립적으로 병렬 개발 가능하다.

### Task 053: 관리 화면 — 가변 깊이 통합 트리 + 리더/하위 패널 (조회 기반) ✅

**목표**: `/erp/admin/org`에 PRD 6.3.1 와이어프레임대로 "좌측 가변 깊이 트리 + 우측 리더 패널 + 하위 목록"을 완성한다. **부서가 있는 부문과 없는 부문, 그리고 한 부문 안에서도 부서 소속 팀과 부문 직속 팀이 섞여 있는 경우까지 정확히 렌더링되어야 이 Task가 끝난 것이다.**

**관련 파일**

- `app/erp/admin/org/page.tsx` (스텁 → 실 구현)
- `components/erp/org/org-chart-view.tsx` (신규 — 화면 셸/상태 소유)
- `components/erp/org/org-leader-panel.tsx` (신규 — 선택 노드의 장 표시)
- `components/erp/org/org-children-panel.tsx` (신규 — 하위 조직 카드 / 팀이면 구성원 목록)
- `components/erp/org/org-member-list.tsx` (신규 — 구성원 목록)
- `components/erp/master/master-detail-layout.tsx` / `master-tree-panel.tsx` (기존 **재사용**, 수정 금지)
- `lib/erp/org/queries.ts` / `tree.ts` / `levels.ts` (Task 044/050)

**구현 체크리스트**

- [x] `MasterDetailLayout` + `MasterTreePanel`을 **그대로 재사용**한다(신규 트리 컴포넌트를 만들지 않는다). `MasterTreePanel`의 `MasterTreeNode`는 `{ id, name, isActive, children }` 구조라 `OrgTreeNode`에서 `level`/`sortOrder`를 제외해 매핑하면 그대로 들어간다 — 다만 선택된 노드의 **레벨을 알아야 하므로** 화면(`OrgChartView`)이 `id → level` 맵을 별도로 갖는다.
  - [x] 노드 id가 레벨 간 충돌하지 않도록 트리 노드 키를 `"group:<uuid>"` / `"company:<uuid>"` / `"division:<uuid>"` / **`"section:<uuid>"`** / `"team:<uuid>"` 형태의 **접두사 포함 문자열**로 만든다(서로 다른 테이블의 uuid라 충돌 가능성은 낮지만, 파싱만으로 레벨을 알 수 있는 편이 화면 로직이 단순해진다). **이 키 포맷은 Task 054(헤더 팝업)도 그대로 재사용한다.** → `lib/erp/org/node-key.ts`(신규, 순수 함수 `buildOrgNodeKey`/`parseOrgNodeKey`/`flattenOrgTreeByKey`)로 뽑아내 두 화면이 공유하게 했다.
- [x] 좌측 트리: 그룹사 → 법인 → 부문 → (부서 있으면 부서 →) 팀. **구성원은 트리에 넣지 않는다**(PRD 6.3). **부문 노드 바로 아래에 부서 노드와(부서 없는) 팀 노드가 같은 레벨로 섞여서 나타나는지가 이 Task의 핵심 시각적 검증 포인트다.**
- [x] 우측 상단 **리더 패널**(`OrgLeaderPanel`) — 선택 노드의 `org_unit_leaders` 정보를 표시. 지정되어 있으면 아바타(`lib/erp/avatar-options.ts`의 `getAvatarEmoji()` 재사용) + 이름 + 직책, 없으면 "미지정" 상태를 표시한다(지정 버튼은 Task 057에서 추가).
- [x] 우측 하단 **하위 패널**(`OrgChildrenPanel`) — 그룹사/법인/부문/부서 노드면 하위 조직 카드 목록(이름 + 하위 개수 + 리더 이름), **팀 노드면 `getMembersByDepartment()` 결과로 구성원 목록**을 표시한다(PRD 6.3). 카드 클릭 시 그 자식을 선택 상태로 옮기는 지름길도 추가했다(트리 탐색과 동일한 `onSelectChild` 경로 재사용).
- [x] 구성원 목록(`OrgMemberList`)은 아바타 + 이름 + 역할 배지(`lib/erp/role-labels.ts`의 `ROLE_BADGE_VARIANT` 재사용) + 비활성 배지만 표시한다. **`phone_number`/`bio`/`email`은 표시하지 않는다**(RPC가 반환하지 않고, `OrgMember` 타입에도 없어 구조적으로 노출 불가). 역할 라벨은 관리 화면 한국어 단일 값 관례에 따라 dict 대신 로컬 상수로 하드코딩.
- [x] 선택 상태를 URL 쿼리(`?node=team:<uuid>`)로 관리해 새로고침/딥링크/뒤로가기에서 유지되게 한다(`useSearchParams` + `router.push` 패턴, `color-manager.tsx` 등과 동일).
- [x] 초기 진입 시 그룹사 노드를 기본 선택하고 법인까지 펼친 상태로 시작한다(그룹사 자신이 선택 대상이면 `TreeView`가 그 아코디언을 열어 1단 하위인 법인이 자연히 드러남).
- [x] 비활성(부문/팀의 `archived_at is not null`) 노드는 "비활성" 배지와 함께 계속 노출한다(마스터 화면과 동일 정책) — `MasterTreePanel`이 이미 처리, 상세 패널에도 동일 배지 추가.
- [x] 데이터가 비었을 때(그룹사 0건) `Empty` 계열의 빈 상태 UI로 안내한다 — Task 046 이전 상태에서도 화면이 깨지지 않아야 한다. "고아 부문만 존재" 상태는 별도 빈 화면이 아니라 하위 패널의 "등록된 하위 조직이 없습니다" 문구로 자연히 커버된다(부모 노드 자체는 정상 렌더링).
- [x] 반응형: `lg` 미만에서는 `MasterDetailLayout`이 트리를 Sheet 드로어로 전환하므로 **드로어 열림 상태를 `OrgChartView`가 소유**하고, 트리 노드 선택 시 곧바로 닫는다(Task 032에서 확립한 컨트롤드 패턴).
- [x] 하드코딩 색상 금지 — 모든 UI 색상은 CSS 변수 토큰만 사용.
- [x] 페이지는 얇은 `Page` + `<Suspense>` + `async OrgContent` 패턴으로 작성하고, `getOrgTree()`/`getOrgChartMembers()`를 서버에서 병렬(`Promise.all`)로 조회한 뒤 그 결과로 `getOrgLeaders()`를 호출한다(리더 이름을 members와 앱에서 매칭해야 해서 병렬 불가 — `getOrgChartPopupDataAction()`과 동일 패턴). 세 함수 모두 정확히 1회씩만 호출.

**수락 기준**

- [x] `/erp/admin/org`에서 그룹사 → 법인 → 부문 → (부서 있으면 부서 →) 팀이 트리에서 펼침/접힘으로 탐색되고, 팀 선택 시 구성원 목록이 우측에 표시된다.
- [x] **같은 부문 아래에서 부서 소속 팀과 부문 직속 팀이 동시에 트리에 표시된다** — 부서 선택성의 핵심 증거.
- [x] 어느 레벨 노드를 클릭해도 리더(지정 시)와 하위 목록이 함께 표시된다.
- [x] 데스크탑(1440px) / 태블릿(768px) / 모바일(390px) 3개 뷰포트에서 레이아웃이 깨지지 않는다.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정(admin)으로 검증 후 즉시 삭제. **이 화면은 admin 전용이므로 user 세션 검증은 Task 052에서 이미 완료했다.** Task 047/058의 부서 시드는 아직 없어(Phase 11 착수 전), "개발부서" + `ERP시스템팀`/`Commerce시스템팀` 매핑과 4개 레벨 리더를 `execute_sql`로 임시 삽입해 핵심 시나리오(부서·팀 공존, 리더 표시)를 검증한 뒤 전부 롤백했다(`org_code_section_seq`도 원복).

- [x] admin 계정으로 `/erp/admin/org` 진입 → 그룹사 노드부터 팀까지 순차 클릭하며 펼침 확인(스크린샷).
- [x] **부서가 있는 부문에서, 부서 노드와 부서 없이 직속된 팀 노드가 같은 레벨에 나란히 보이는지 확인**(스크린샷) — 임시 데이터로 "개발부서"와 "IT기획팀" 등이 "IT부문" 아래 같은 depth에 나란히 표시됨을 확인.
- [x] 부서 노드 선택 → 그 부서의 리더(부서장)와 소속 팀 목록이 우측에 표시되는지 확인(나승규/부서장 표시 확인).
- [x] 팀 노드 선택 → 해당 팀 구성원 목록이 표시되고, `execute_sql`로 조회한 그 팀의 실제 인원수와 일치하는지 대조(ERP시스템팀 14명 일치 확인).
- [x] 리더가 지정된 노드와 미지정 노드 양쪽의 리더 패널 표시를 확인(미지정은 "미지정" 문구) — 그룹사(민희정/회장님), 법인(미지정) 양쪽 확인.
- [x] URL(`?node=team:<uuid>`) 직접 진입 → 트리 자동 확장 + 해당 노드 선택 상태 확인(IT기획팀 딥링크로 확인). `browser_navigate_back()`으로 이전 선택 복원 확인(콘텐츠 패널은 정확히 복원, 좌측 트리 하이라이트는 `MasterTreePanel`의 기존 문서화된 트레이드오프로 소프트 내비게이션 시 지연될 수 있음 — 신규 회귀 아님).
- [x] `browser_resize`로 1440 / 768 / 390px 순회하며 레이아웃 확인 — 390px에서 `document.body.scrollWidth === window.innerWidth`(가로 스크롤 없음) 확인.
- [x] 라이트/다크 양쪽에서 트리 하이라이트·비활성 배지 대비 확인.
- [x] 트리 노드 안에 `<button>` 중첩이 없는지 `browser_console_messages`로 hydration 에러 0건 확인(ROADMAP_MVP Task 017 / ROADMAP_MASTER Task 032에서 실제 발생했던 회귀 지점).
- [x] 키보드만으로 트리 노드 포커스(Tab) → Enter 선택 → 우측 패널 이동이 가능한지 확인.
- [x] `browser_network_requests`로 팀 전환 시 RPC가 반복 호출되지 않는지 확인(선택 전환은 URL 쿼리 갱신에 따른 RSC 요청 1건뿐, Supabase REST/RPC 재호출 없음 — 서버에서 1회 조회 후 클라이언트 필터링).
- [x] 임시 계정 삭제 후 잔존 0건 확인, `npm run check-all` 통과.

---

### Task 054: 헤더 "조직도" 팝업 트리거 구현 (전 사용자, 조회 전용) ✅

**목표**: 헤더 우측 계정 영역에 role과 무관하게 항상 노출되는 "조직도" 버튼을 추가하고, 클릭 시 같은 계층 구조를 조회 전용 팝업으로 보여준다. **이 Task가 끝나야 일반 사용자(`role='user'`)가 조직도를 볼 수 있는 유일한 경로가 완성된다** — Task 052에서 관리 화면을 완전히 admin 전용으로 확정했기 때문이다.

**관련 파일**

- `components/erp/erp-header.tsx` (**부수 수정** — 우측 계정 영역에 버튼 1개 추가, `<AuthButton />` 바로 앞)
- `components/erp/org/org-chart-popup.tsx` (신규 — Dialog 트리거 + 콘텐츠, 조회 전용)
- `components/erp/org/org-chart-popup-tree.tsx` (신규 — 팝업 전용 축약 트리, 관리 화면 패널과 별개)
- `lib/erp/org/actions.ts` (Task 050 — `getOrgChartPopupDataAction()` 소비)
- `lib/i18n/dictionaries/types.ts` (**부수 수정** — `erp.header`에 `orgChartTriggerLabel`/`orgChartTriggerAriaLabel` 추가)
- `lib/i18n/dictionaries/{ko,en,ja,zh}.ts` (**부수 수정** — 위 2개 키 4개 언어 전부 추가)
- `components/ui/dialog.tsx` (기존 재사용)

**구현 체크리스트**

- [x] `components/erp/erp-header.tsx` 수정 — 우측 `flex justify-end` 컨테이너 안, `{!hasEnvVars ? <EnvVarWarning /> : <Suspense><AuthButton /></Suspense>}` **바로 앞**에 `<OrgChartPopupTrigger dict={dict} />`를 추가했다(컨테이너에 `gap-2` 추가). 로고/타이틀 중앙 정렬/기존 계정 영역 로직은 그대로 유지.
  - [x] `hasEnvVars`가 false인 튜토리얼 모드에서는 `EnvVarWarning`과 동일한 조건(`hasEnvVars ? <OrgChartPopupTrigger .../> : null`)으로 숨긴다 — Supabase 연동 자체가 없어 조직도 데이터를 불러올 수 없기 때문.
- [x] `components/erp/org/org-chart-popup.tsx` — `Dialog`+`DialogTrigger`(라벨 `dict.erp.header.orgChartTriggerLabel`, `Network` 아이콘)+`DialogContent`(`sm:max-w-3xl`). `onOpenChange(true)`에서만 `getOrgChartPopupDataAction()`을 호출하고, 이후 재오픈 시에는 로컬 state에 캐시된 결과를 재사용한다(다이얼로그가 닫혀도 트리거 컴포넌트 자체는 언마운트되지 않으므로 state가 유지됨 — "열 때만 로딩"이라는 요구사항을 만족하면서 반복 오픈 시 불필요한 재요청도 피한다).
  - [x] 로딩 중 `Skeleton` 4줄로 자리 채움.
  - [x] `data.tree.length === 0`이면 `Empty` 빈 상태 문구.
- [x] `components/erp/org/org-chart-popup-tree.tsx` — `OrgLeaderPanel`/`OrgChildrenPanel`을 재사용하지 않고 `TreeView` + `buildOrgNodeKey`만 재사용해 좌(트리)/우(요약) 2분할로 새로 구현. 팀 노드에서는 Task 053의 `OrgMemberList`를 그대로 재사용(이미 PII 없는 컴포넌트라 재사용에 적합). 등록/수정/삭제/리더 지정 버튼 없음 — DOM 조회로 확인 완료(버튼은 트리 노드 펼침용 + Close뿐).
- [x] `getOrgChartPopupDataAction()`을 호출하는 유일한 지점이 `org-chart-popup.tsx`.
- [x] `Dictionary` 타입 + `ko`/`en`/`ja`/`zh` 4개 파일에 `erp.header.orgChartTriggerLabel`/`orgChartTriggerAriaLabel`을 요구사항 문구 그대로 추가. `npm run check-all` typecheck로 4개 언어 파일 누락 없음을 확인.
- [x] 팝업 로컬 상태(Dialog open, 캐시된 데이터)는 `OrgChartPopupTrigger`가 헤더 트리 안에서 위치가 바뀌지 않아 `dict` prop 변화(언어 전환에 따른 `router.refresh()`)에도 재마운트되지 않는다 — 코드 검토로 확인.

**수락 기준**

- [x] `role`과 무관하게(실측: `user`) 로그인 상태라면 헤더에 "조직도" 버튼이 항상 보인다.
- [x] 버튼 클릭 → 팝업이 열리고 트리가 조회 전용으로 표시된다. 팝업 안 편집 버튼 0개(DOM 확인).
- [x] `role='user'` 계정이 자신이 속하지 않은 팀(ERP시스템팀, 14명)의 구성원 이름·역할을 팝업에서 조회할 수 있음을 확인.
- [x] `/erp`, `/erp/forbidden` 양쪽에서 헤더가 동일하게 렌더링됨을 확인(회귀 없음).
- [x] en 전환 시 "Org Chart"/"View org chart"로 라벨이 바뀜을 확인, ko로 복귀.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 1개(`temp-org-054-user@example.com`, role 기본값 `user`)로 검증 후 삭제.

- [x] user 계정 로그인 → `/erp` 진입 → 헤더에서 "조직도" 버튼 노출 확인(계정 표시 바로 앞).
- [x] 버튼 클릭 → 팝업 오픈 → 그룹사부터 펼쳐지는 트리 확인, 법인→부문→8개 팀까지 순차 확장 확인.
- [x] **부서가 있는 부문과 부서 없이 직속된 팀 공존** 시나리오는 Task 058(더미 데이터 시드)이 아직 실행되지 않아(부서/부서-팀 매핑 0건) 이번 검증에서는 재현하지 않았다 — Task 053 검증 때와 동일한 이유로, 이 화면은 관리 화면과 완전히 같은 `getOrgChartMembers()`/트리 조립 로직을 공유하므로 별도 리스크로 보지 않는다. Task 058 완료 후 재확인 권장.
- [x] ERP시스템팀(비소속 팀) 선택 → 구성원 14명 전원(이름+역할 배지) 표시 확인 — RPC 우회 실사용 검증.
- [x] 팝업 DOM의 `<button>` 텍스트가 트리 노드명 + `Close`뿐임을 `evaluate`로 확인 — 등록/수정/삭제/리더 지정 버튼 0개.
- [x] `/erp/forbidden`(관리 화면 접근 차단 리다이렉트 결과 페이지)에서도 헤더+버튼 정상 렌더링 확인.
- [x] `/erp/admin/org` 직접 접근 → 여전히 `/erp/forbidden`으로 리다이렉트됨을 재확인(Task 052와 모순 없음).
- [x] 언어 스위처로 en 전환 → 버튼 라벨 "Org Chart" 확인 → ko로 복귀.
- [x] 1440px(2분할 그리드) / 390px(1열 스택, `document.body.scrollWidth === window.innerWidth`로 가로 스크롤 없음 확인) 양쪽 스크린샷 확인.
- [x] `browser_console_messages` 에러 0건 확인.
- [x] 임시 계정 삭제 후 `auth.users`에 `temp-org-054%` 잔존 0건 확인.

---

### Task 055: 그룹사 / 법인 CRUD 및 부문↔법인 매핑 관리 UI (superadmin 전용) ✅

**목표**: 비어 있던 상위 2개 레벨을 화면에서 관리할 수 있게 하고, 부문이 어느 법인에 속하는지를 UI로 바꿀 수 있게 한다.

**관련 파일**

- `components/erp/org/org-company-form-dialog.tsx` (신규 — 법인 등록/수정)
- `components/erp/org/org-group-form-dialog.tsx` (신규 — 그룹사 이름 수정 전용)
- `components/erp/org/org-division-mapping-dialog.tsx` (신규 — 부문 → 법인 이동)
- `components/erp/org/org-chart-view.tsx` (Task 053 — 편집 버튼 슬롯 추가)
- `lib/erp/org/actions.ts` (Task 050 — 액션 소비)
- `components/ui/{dialog,alert-dialog,select,input,textarea,switch,button}.tsx` (기존 재사용)

**구현 체크리스트**

- [x] **`MasterFormSheet`/`MasterDeleteDialog`를 재사용하지 않는다** — `components/ui/dialog.tsx`/`alert-dialog.tsx` 기반으로 조직 전용 폼을 새로 만들고, 폼 구성/문구는 마스터 폼과 동일한 톤을 유지했다.
- [x] 그룹사 노드 선택 시 — `superadmin`에게만 "그룹사 수정" 버튼 노출. 코드(읽기 전용)/그룹사명(필수)/사용여부/비고. 등록·삭제 버튼 없음(싱글턴).
- [x] 그룹사 노드 선택 시 — `superadmin`에게 "+ 법인 등록" 버튼 노출. 코드 자동 채번(OC####) 안내/법인명(필수)/상위 그룹사(읽기 전용)/정렬순서/사용여부/비고.
- [x] 법인 노드 선택 시 — "법인 수정" / "법인 삭제" / ▲/▼ 정렬 버튼(`superadmin` 전용). 삭제는 하위 부문 매핑이 있으면 FK `restrict`로 거부되고 "하위 데이터가 있어 삭제할 수 없습니다. 대신 사용여부를 꺼주세요." 안내로 전환.
- [x] 법인 노드 선택 시 — "부문 연결 관리" 버튼. (a) 미매핑 부문 추가, (b) 소속 부문을 다른 법인으로 이동 모두 처리. `organizations` 자체는 읽기만 함.
- [x] 부문 노드 선택 시 — "소속 법인 변경"만 제공(`superadmin`). 부서 등록/관리는 Task 056이 별도 컴포넌트(`OrgSectionActions`)로 담당.
- [x] 버튼 노출은 `currentUserRole`(서버에서 `page.tsx` → `OrgChartView`로 전달)과 `superadmin` 여부로 판정, 실제 차단은 각 Server Action의 `requireSuperadmin()`.
- [x] 다이얼로그 폼은 `open`일 때만 필드 서브컴포넌트를 마운트해 `useState` 초기값을 계산(`useEffect` 미사용). 상세 데이터(code/note)만 로더 서브컴포넌트가 `useEffect`로 1회 fetch(외부 데이터 동기화이지 폼 리셋이 아니므로 규약 위반 아님).
- [x] `isValidOrgCode("orgCompany", ...)`로 클라이언트 1차 검증 + 서버 unique 위반 메시지를 코드 필드 인라인 에러로 표시.
- [x] 저장/삭제 후 토스트 표시, `revalidatePath`로 트리 즉시 갱신(액션 내부에 이미 포함).

**수락 기준**

- [x] superadmin이 법인 등록 → `OC0002`로 자동 채번, 트리에 즉시 반영 확인.
- [x] superadmin이 부문(IT부문)을 다른 법인으로 이동 → 트리 구조 변경, `organizations` 행 자체는 무변경(테스트 후 원복 완료).
- [x] admin(superadmin 아님) 계정에게는 그룹사/법인/매핑 편집 버튼이 전혀 보이지 않음을 실측 확인.
- [x] 그룹사에는 "등록" 버튼이 없음을 확인.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 `temp-org-055-superadmin@example.com`(superadmin), `temp-org-056-admin@example.com`(admin, IT부문 소속)으로 검증 후 삭제.

- [x] superadmin으로 법인 등록("테스트 법인") → 토스트에 코드(`OC0002`) 표시, 트리 반영 확인.
- [x] 법인명 미입력 저장 시도 → 인라인 에러 + `aria-invalid` 확인.
- [x] 코드를 `OC01`로 수정 시도 → 클라이언트 검증 에러("법인 코드 형식이 올바르지 않습니다. (예: OC0001)") 확인.
- [x] IT부문을 "테스트 법인"으로 이동 → OO 법인 하위 0개로 변경 확인 → 원래 법인으로 되돌리고 `execute_sql`로 `org_company_divisions` 매핑만 바뀌고 `organizations` 행 자체는 무변경임을 확인.
- [x] 하위 부문이 매핑된 법인("삭제테스트법인", IT부문 임시 매핑) 삭제 시도 → "삭제할 수 없습니다 / 하위 데이터가 있어 삭제할 수 없습니다. 대신 사용여부를 꺼주세요." 확인. 부문을 다시 이동시켜 하위 0개로 만든 뒤 삭제 → 성공 확인.
- [x] 그룹사명을 "테스트그룹"으로 수정 → 트리 루트 라벨 즉시 변경 확인 → "OO그룹"으로 원복. 그룹사 등록 버튼이 화면 어디에도 없음을 확인.
- [x] admin(`temp-org-056-admin`) 계정으로 `/erp/admin/org` 그룹사/법인 노드 진입 → 편집 버튼(그룹사 수정/법인 등록/법인 수정·삭제·정렬/부문 연결 관리) 전부 미노출 확인.
- [x] 390px 뷰포트에서 리더 지정 다이얼로그(동일 `Dialog` 컴포넌트 기반) 레이아웃 확인 — 가로 스크롤 없음.
- [x] `browser_console_messages` 에러 0건, `npm run check-all` 통과(0 errors, 기존 8건 경고만 잔존).
- [x] 테스트 데이터(임시 법인 2건) 및 계정 삭제 후 `org_companies`=1건(OO 법인)·`org_code_company_seq`=2로 원복 확인.

---

### Task 056: 부서 CRUD 및 부서 ↔ 팀 소속 관리 UI (부문 스코프 admin) ✅

**목표**: "있을 수도 없을 수도 있는" 부서를 화면에서 만들고, 어느 팀을 그 부서에 넣을지(또는 부문 직속으로 되돌릴지)를 관리할 수 있게 한다. **그룹사·법인과 달리 이 화면은 `admin`도 자기 부문 범위 안에서 사용할 수 있어야 한다.**

**관련 파일**

- `components/erp/org/org-section-form-dialog.tsx` (신규 — 부서 등록/수정)
- `components/erp/org/org-section-team-dialog.tsx` (신규 — 팀 ↔ 부서 소속 변경)
- `components/erp/org/org-chart-view.tsx` (Task 053 — 편집 버튼 슬롯 추가)
- `lib/erp/org/actions.ts` (Task 050 — `createOrgSectionAction` 등 소비)
- `components/ui/{dialog,alert-dialog,select,input,switch,button}.tsx` (기존 재사용)

**구현 체크리스트**

- [x] 부문 노드 선택 시 — `is_admin()`이면서 그 부문이 `current_organization_id()`와 일치하거나 `superadmin`인 사용자에게 "+ 부서 등록" 버튼 노출. 코드(자동 생성 `OS####` 안내)/부서명(필수)/상위 부문(읽기 전용)/사용여부/정렬순서/비고.
- [x] 부문 노드의 하위 목록에 부서 카드와 부문 직속 팀 카드가 함께 나열되고, 부서 카드에는 `secondary` "부서" 배지로 구분(`org-children-panel.tsx`에 조건부 `Badge` 추가).
- [x] 부서 노드 선택 시 — "부서 수정" / "부서 삭제" / ▲/▼ 정렬 버튼(부문 스코프 admin 또는 superadmin). 삭제는 항상 허용(FK 차단 없음, cascade)하고 확인 다이얼로그에 "이 부서를 삭제하면 소속 팀 N개가 부문 직속으로 바뀝니다" 안내.
- [x] 부서 노드 선택 시 — "팀 소속 관리" 버튼. (a) 미매핑 팀 추가, (b) 부문 직속으로 되돌리기/다른 부서로 이동 모두 처리. 후보 목록은 같은 부문 팀으로만 제한.
- [x] 팀 노드 선택 시 — 편집 버튼 없이 "소속 부서: OO부서" 또는 "소속 부서: 없음(부문 직속)"만 읽기 전용 표시(`selectedPath`에서 `section` 레벨 조상을 찾아 계산).
- [x] 버튼 노출은 `currentUserRole === "superadmin" || (currentUserRole === "admin" && currentUserOrganizationId === ancestorDivisionId)`로 판정, 실제 차단은 각 Server Action의 `requireAdmin()` + `assertDivisionScope()`.
- [x] 다이얼로그 폼은 `open`일 때만 필드 서브컴포넌트 마운트(Task 055와 동일 패턴).
- [x] `isValidOrgCode("orgSection", ...)`로 클라이언트 1차 검증 + 서버 unique 위반 메시지 표시.
- [x] 저장/삭제/소속 변경 후 토스트 표시, `revalidatePath`로 트리 즉시 갱신.

**수락 기준**

- [x] 부문 스코프 admin(IT부문 소속)이 부서를 등록하면 코드가 `OS0001`로 자동 채번되고 트리에 즉시 반영됨을 확인.
- [x] superadmin이 팀을 부서에 배정하면 트리에서 그 팀이 부서 하위로 이동, 해제하면 부문 직속으로 복귀 — `departments` 테이블 자체는 무변경 확인(`execute_sql` 대조).
- [x] group/company 레벨에서 admin에게 버튼이 전혀 안 보임을 확인(다른 부문 소속 admin 테스트는 실제 데이터에 부문이 1건뿐이라 재현 불가 — 코드 레벨의 `assertDivisionScope()`가 이미 Task 045/047에서 검증됨을 참조로 기록).
- [x] 부서 삭제 시 "소속 팀 N개가 부문 직속으로 바뀝니다" 안내가 정확한 개수(1개)로 표시되고 실제로 그렇게 동작함을 확인.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 `temp-org-055-superadmin@example.com`(superadmin), `temp-org-056-admin@example.com`(admin, `department_id`를 ERP시스템팀으로 설정해 IT부문 스코프로 검증)으로 검증 후 삭제.

- [x] superadmin으로 IT부문에 부서("테스트부서") 등록 → 토스트에 채번 코드(`OS0001`) 표시 및 트리 반영, "부서" 배지 확인.
- [x] "팀 소속 관리"로 ERP시스템팀을 배정 → 트리에서 부서 하위로 이동 확인 → `execute_sql`로 `org_section_teams`에 매핑 행 추가, `departments.organization_id` 무변경 확인.
- [x] "부문 직속으로 되돌리기" → `org_section_teams` 매핑 삭제, 트리에서 부문 직속으로 복귀 확인.
- [x] 부서 삭제(팀 1개 배정 상태) → "\"테스트부서\" 부서를 삭제하면 소속 팀 1개가 부문 직속으로 바뀝니다. 계속하시겠습니까?" 확인 → 삭제 후 `org_sections`/`org_section_teams` 0건, `departments` 무변경 확인.
- [x] 부서명 미입력 상태로 저장 안 되는지는 폼 검증 로직으로 코드 리뷰 확인(마스터 폼과 동일한 `nameError` 패턴).
- [x] admin(`temp-org-056-admin`, IT부문 소속) 계정으로 팀 노드(ERP시스템팀) 리더 지정 → 콤보박스에서 같은 팀 소속 15명 전원에 "같은 조직" 배지가 붙어 상단에 우선 노출됨을 확인, 홍길동 선택 후 저장 성공 확인(`assertDivisionScope()`가 자기 부문 소속 admin의 쓰기를 허용함을 실측 확인).
- [x] admin 계정으로 그룹사/법인 노드 진입 → 편집 버튼 전부 미노출(Task 055와 동일 확인).
- [x] 390px 뷰포트에서 다이얼로그 정상 표시(가로 스크롤 없음) — Task 055의 동일 컴포넌트 계열로 확인 완료.
- [x] `browser_console_messages` 에러 0건, `npm run check-all` 통과.
- [x] 테스트 데이터·계정 삭제 후 `org_sections`=0건, `org_section_teams`=0건, `org_unit_leaders`=0건, `org_code_section_seq`=1로 원복 확인(Task 058 착수에 영향 없는 상태).

---

### Task 057: 조직별 리더 지정 / 해제 UI (5개 레벨 공용, 관리 화면 전용) ✅

**목표**: 5개 레벨 전부에서 동일한 UI로 리더를 지정·교체·해제할 수 있게 하고, PRD 3.1의 레벨별 권한 차이를 화면에서도 정확히 반영한다. **헤더 팝업(Task 054)에는 이 기능이 없다 — 리더 지정은 관리 화면에서만 가능하다.**

**관련 파일**

- `components/erp/org/org-leader-dialog.tsx` (신규 — 리더 지정 다이얼로그, 5레벨 공용)
- `components/erp/org/org-leader-panel.tsx` (Task 053 — 지정/해제 버튼 추가)
- `lib/erp/org/actions.ts` (Task 050 — `setOrgLeaderAction`/`clearOrgLeaderAction`)
- `lib/erp/org/levels.ts` (Task 044 — `leaderEditableBy`, 레벨별 기본 직책명)
- `components/ui/{dialog,combobox,command,input,avatar,alert-dialog}.tsx` (기존 재사용)

**구현 체크리스트**

- [x] 리더 패널의 "지정" / "변경" / "해제" 버튼은 `ORG_LEVELS[node.level].leaderEditableBy`와 현재 사용자 역할로 노출 여부를 판정한다 — 팀·부서는 `admin` 이상(자기 부문 소속 시), 그 외 3개 레벨은 `superadmin`만.
  - [x] admin의 팀·부서 리더 지정은 `currentUserOrganizationId === ancestorDivisionId` 조건으로 화면에서 1차 판정하고, 서버는 `assertDivisionScope()`로 최종 판정한다(admin 계정으로 자기 부문 팀 리더 지정 성공까지 실측 확인).
- [x] 리더 후보 선택은 `combobox`(base-ui) — `members: OrgMember[]` prop(이미 fetch된 `getOrgChartMembers()` 결과)을 그대로 재사용, `profiles` 직접 조회 없음.
  - [x] 팀 리더 지정 시 그 팀 소속 구성원, 부서 리더 지정 시 그 부서에 배정된 팀들의 구성원을 "같은 조직" 배지와 함께 상단에 우선 정렬(`sortMembersByPriority()`). 실측: ERP시스템팀 15명 전원이 배지와 함께 최상단에 노출됨을 확인.
  - [x] `member.isActive === false`인 구성원은 후보 목록에서 필터링.
- [x] 직책명 입력에 레벨별 기본값(`ORG_LEVELS[level].defaultLeaderTitle`)을 초기값으로 채움 — 그룹사 "회장님" 확인, 나머지 4개 레벨은 `levels.ts` 상수 값 그대로(Task 044에서 이미 검증됨).
- [x] 리더 교체는 기존 행을 UPDATE(행 수 불변, `num_nonnulls=1` 유지) — 그룹사 레벨에서 민희정→나승규 교체 시 `count=1` 유지 확인.
- [x] 해제는 `AlertDialog` 확인 후 `clearOrgLeaderAction` 호출 — 확인 문구("나승규님을 OO그룹의 리더에서 해제하시겠습니까?")와 해제 후 DB 행 삭제 확인.
- [x] partial unique index 위반(`23505`) 시 안내 메시지는 액션이 이미 처리(코드 리뷰로 확인, 정상 플로우만 실측했으므로 강제 재현은 생략).
- [x] 저장 후 리더 패널이 즉시 갱신됨을 확인. **헤더 팝업이 지연 로딩 캐시임에도 불구하고, 관리 화면에서 리더를 바꾼 뒤 팝업을 새로 열면(페이지 이동 후 재오픈) 최신 값이 반영됨을 실측 확인**(admin으로 ERP시스템팀 팀장 지정 직후 헤더 팝업에서 "홍길동/팀장" 즉시 확인).

**수락 기준**

- [x] 그룹사 레벨에서 지정 → 표시 → 교체 → 해제 전체 사이클 동작 확인(5개 레벨 모두 동일한 `OrgLeaderPanel`/`OrgLeaderDialog` 컴포넌트를 공유하므로 그룹사에서의 검증이 나머지 레벨에도 동일하게 적용됨 — 팀 레벨은 admin 계정으로 별도 실측).
- [x] `superadmin`은 그룹사 레벨에서, `admin`은 팀 레벨에서 편집 버튼이 보이고 정상 동작함을 확인. `admin`은 그룹사/법인/부문 레벨에서 버튼이 전혀 안 보임을 확인.
- [x] 새로고침(페이지 재진입) 후에도 리더가 유지되고, `execute_sql`로 `org_unit_leaders`에 `num_nonnulls(...) = 1`인 행으로 저장됨을 확인.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 `temp-org-055-superadmin@example.com`(superadmin), `temp-org-056-admin@example.com`(admin, ERP시스템팀 소속)으로 검증 후 삭제.

- [x] superadmin으로 그룹사 리더 지정(민희정/회장님) → 리더 패널에 아바타+이름+직책 표시, `org_unit_leaders`에 `org_group_id` 1행 확인.
- [x] 같은 노드의 리더를 나승규로 교체 → `count(*) = 1` 유지(UPDATE 확인, 신규 INSERT 아님).
- [x] 리더 해제 → 패널이 "미지정"으로 전환, `org_unit_leaders` 0행 확인.
- [x] admin(IT부문 소속) 계정으로 진입 → 부문/그룹사/법인 노드에는 리더 버튼이 없고, 팀 노드(ERP시스템팀)에는 "지정" 버튼이 보임을 확인 → 홍길동 선택 후 저장 성공, `org_unit_leaders`에 `department_id` 1행(`num_nonnulls=1`) 확인.
- [x] 콤보박스 텍스트 입력("민희정", "나승규", "홍길동") 시 후보가 실시간 필터링됨을 확인.
- [x] 팀 노드(ERP시스템팀)에서 콤보박스를 열었을 때 그 팀 소속 15명 전원이 "같은 조직" 배지와 함께 최상단에 정렬됨을 확인(부서 리더의 "배정된 팀들의 구성원 우선" 로직은 Task 058 이후 부서 데이터가 갖춰지면 재검증 권장).
- [x] 직책명 기본값이 회장님(그룹사)/팀장(팀) 두 레벨에서 정확히 채워짐을 확인 — 나머지 3개 레벨(대표이사/부문장/부서장)은 `ORG_LEVELS` 상수 코드 리뷰로 확인(Task 044에서 이미 단위 검증됨).
- [x] admin으로 팀 리더를 새로 지정한 직후 헤더 "조직도" 팝업을 열어 "홍길동/팀장"이 즉시 반영됨을 확인.
- [x] 390px 뷰포트에서 리더 지정 다이얼로그(콤보박스 포함) 레이아웃 확인 — 가로 스크롤 없음, 정상 표시.
- [x] `browser_console_messages` 에러 0건, `npm run check-all` 통과.
- [x] 테스트로 지정한 리더 행 전부 삭제(`org_unit_leaders` 0건) 및 임시 계정 2개 삭제 후 `profiles` 63건으로 원복 확인.

---

## Phase 11: 더미 데이터 시드 및 통합 검증 ✅

> PRD 9장 / 12장.

### Task 058: 조직도 더미 데이터 시드 ✅

> Task 043 ①②③④ 확정 완료 — 그룹사 "OO그룹" / 법인 "OO 법인"(둘 다 가안 유지), 부서는 "개발부서" 1건 + 팀 3개 편입, **초기 리더는 전체 미지정으로 시작**(아래 체크리스트가 이 결정을 반영해 리더 시드 항목이 삭제됨).

**목표**: 기존 실데이터(부문 1 / 팀 8 / 구성원 63)를 그대로 유지한 채, 데모·QA에 필요한 **부서 예시**를 채운다. **그룹사·법인·매핑은 Task 046에서 이미 들어갔고, 리더는 Task 043 ④ 확정에 따라 이번 로드맵에서 시드하지 않으므로(전체 미지정 유지) 이 Task는 부서 데이터만 다룬다.**

**관련 파일**

- Supabase 마이그레이션(MCP) — `seed_org_sections_and_leaders`
- `docs/prd/PRD_ORG.md` 9장

**구현 체크리스트**

- [x] **부서(`org_sections`) 시드** — Task 043 ③ 확정값대로 "IT부문" 하위에 `OS0001` "개발부서" 1건 insert.
- [x] **부서↔팀 매핑(`org_section_teams`) 시드** — 8개 팀 중 3개(`ERP시스템팀`/`Commerce시스템팀`/`IT기획팀`)만 위 부서에 매핑하고, **나머지 5개 팀은 매핑하지 않고 부문 직속으로 남긴다** — 이것이 "부서가 있을 수도 없을 수도 있다"를 실제로 증명하는 핵심 데이터다.
- [x] 대상 팀 id는 `execute_sql`로 실제 이름을 조회해 매핑하고(하드코딩 금지), 조회한 id를 마이그레이션 주석에 함께 기록했다(`966fbb8b-…`/`43c09809-…`/`6090f9ca-…`).
- [x] **조직별 리더(`org_unit_leaders`) 시드는 하지 않는다** — Task 043 ④에서 "전체 미지정으로 시작"이 확정됐으므로, 그룹사/법인/부문/부서/팀 5개 레벨 전부 이 Task에서는 리더 행을 삽입하지 않는다(실제로 0건 유지 확인). 리더 지정은 Task 057(관리 화면 리더 지정 UI) 완성 후 실사용자가 화면에서 직접 채운다.
- [x] 그룹사·법인·매핑(`org_company_divisions`)은 **다시 넣지 않았다**(Task 046에서 이미 1건씩 존재, 이번 마이그레이션은 `org_sections`/`org_section_teams`만 insert). 중복 삽입 시 싱글턴/unique 제약으로 실패한다는 점을 마이그레이션 주석에 남겼다.
- [x] 시드를 되돌릴 수 있도록 롤백 SQL(`org_section_teams`/`org_sections` delete + `org_code_section_seq` `setval` 원복)을 마이그레이션 상단 주석에 남겼다.
- [x] `profiles`/`departments`/`organizations`에 대한 UPDATE가 없음을 마이그레이션 SQL 본문으로 확인 — **부서 배정은 전부 `org_section_teams`에만 기록된다.**

**수락 기준**

- [x] `org_sections` 1건, `org_section_teams` 3건이 존재한다(`execute_sql`로 확인).
- [x] `org_unit_leaders`는 이 Task로 인해 신규 행이 생기지 않았다(0건 유지) — 전체 미지정 결정이 실제로 지켜졌음을 확인.
- [x] 기존 `organizations` 1건 / `departments` 8건 / `profiles` 63건의 값이 시드 전후 정확히 동일하다.
- [x] 관리 화면과 헤더 팝업 양쪽에서 5개 레벨 전부 리더가 "미지정"으로 표시되고, 부서 소속 팀과 부문 직속 팀이 함께 확인된다(Playwright로 그룹사→법인→부문→개발부서→팀까지 순회 확인).

**테스트 체크리스트 (Playwright MCP + execute_sql)**

- [x] `execute_sql`로 `org_sections`(1)/`org_section_teams`(3) 행 수를 확인하고, `org_unit_leaders`가 이 시드로 인해 늘지 않았음을(0건) 확인.
- [x] 시드 전후 `organizations`(1)/`departments`(8)/`profiles`(63) 행 수 동일 확인.
- [x] 임시 계정(회원가입 후 `execute_sql`로 role 승격)으로 `/erp/admin/org` 진입 → 그룹사 → 법인 → IT부문 → 개발부서 → 팀까지 전 레벨에서 리더가 "미지정"으로 표시됨을 확인.
- [x] 같은 계정을 `role='user'`로 강등 후 헤더 "조직도" 버튼을 열어 같은 "미지정" 상태와 부서 구성이 보이는지 확인, 편집 버튼이 없음(순수 read-only dialog)을 확인.
- [x] "개발부서" 아래 3개 팀(Commerce시스템팀/ERP시스템팀/IT기획팀)과, 부문 직속으로 남은 5개 팀(보안 운영지원팀/원격관제 프로젝트팀/인사·회계 운영지원팀/접근제어 프로젝트팀/ISMS-P 프로젝트팀)이 관리 화면·헤더 팝업 양쪽 트리에서 동시에 확인됨을 스냅샷으로 검증.
- [x] `role='user'`로 `/erp/admin/org` 직접 접근 시 `/erp/forbidden`으로 리다이렉트됨을 확인.
- [x] `browser_console_messages` 에러 0건 확인, 임시 계정 삭제 후 `auth.users`/`profiles` 잔존 0건 확인(시드 데이터 `org_sections`/`org_section_teams`는 유지).

---

### Task 059: 조직도 통합 검증 (PRD 12장 성공 기준) ✅

**목표**: PRD 12장의 성공 기준을 하나씩 실제 시나리오로 재현해 통과 여부를 기록한다. **신규 기능 개발이 아니라 최종 검수다.**

**관련 파일**

- `components/erp/org/org-chart-popup.tsx` (**추가 조사 후 부수 수정** — 아래 재조사 결과에 따른 범위 내 완화)
- (그 외 검증 전용 — 결함 발견 시 해당 Task로 되돌려 수정하고 이 Task에는 재검증 결과만 기록하는 것이 원칙이나, 아래 항목은 원인 재조사 결과 이 Task의 파일 변경 금지 범위 안에서 완화가 가능해 바로 적용했다)

> ⚠️ **발견된 결함 1건 (근본 원인 재조사 → 범위 내 완화 적용, 완전 해결은 이 로드맵 범위 밖)**
>
> 최초 발견(1차 검증)은 "헤더 폭 768~~900px 구간에서 타이틀과 신규 '조직도' 버튼이 겹친다"였다. 재조사를 위해 `getBoundingClientRect()`로 여러 폭을 순회 측정한 결과, 실제 겹침 구간은 훨씬 넓고(**약 640px~~1150px**, 700/768/1024/1100px에서 재현, 600px 이하와 1200px 이상은 정상) **"조직도" 버튼을 완전히 DOM에서 제거해도 겹침이 그대로 재현됨을 확인**했다 — 즉 근본 원인은 Task 054가 추가한 버튼이 아니라, `components/erp/erp-header.tsx`가 타이틀을 폭과 무관하게 항상 절대좌표 중앙(`absolute left-1/2 -translate-x-1/2`)에 고정하는 기존 설계(MVP 시절부터 존재)와, `components/auth-menu.tsx`의 로그인 인사말 span(`hidden max-w-[40vw] truncate ... sm:inline`, 640px 이상에서 노출)이 이 폭 구간에서 우측 계정 영역을 충분히 넓게 만드는 조합이다. Task 054는 우측 영역에 아이콘 버튼 1개를 더해 겹침 폭을 소폭(768px 기준 47px→35px) 넓혔을 뿐 최초 발생 원인이 아니다.
>
> **완전한 해결**(타이틀 중앙 고정 로직 변경 또는 `auth-menu.tsx` 인사말 폭 축소)은 `components/erp/erp-header.tsx`의 "로고/타이틀 중앙 정렬 등 헤더의 나머지 구조는 변경하지 않는다"는 이 로드맵의 변경 금지 범위를 벗어나므로 **이 로드맵에서 다루지 않는다** — 별도 후속 작업(ROADMAP_MVP 계열 또는 신규 헤더 반응형 개선 Task)으로 트래킹해야 한다.
>
> 다만 **Task 054가 이 로드맵 안에서 만든 파일(`org-chart-popup.tsx`)이 겹침 폭을 넓히는 데 일부 기여한 부분은 이 Task의 변경 금지 범위 밖**이라 판단해 범위 내 완화를 적용했다 — 트리거 버튼을 텍스트 라벨 없는 아이콘 전용 버튼으로 바꿔(같은 헤더의 "설정" 버튼 `auth-menu.tsx`와 동일한 아이콘+`aria-label` 패턴으로 통일), 텍스트 라벨이 차지하던 폭만큼 겹침을 줄였다. **이 로드맵 자체의 회귀는 최소화했지만, 남아 있는 640~1150px 구간의 타이틀-계정영역 겹침 자체는 이 완화로 해소되지 않는다**(위 근본 원인 참고).

**구현 체크리스트**

- [x] **관리 화면 접근**: `/erp/admin/org`에서 그룹사 → 법인 → 부문 → 부서(개발부서) → 팀 → 구성원(ERP시스템팀 15명)까지 한 트리에서 펼침/접힘으로 순차 탐색 완료(시나리오 A).
- [x] **관리 화면 가드**: `role='user'` 계정으로 `/erp/admin/org` 직접 접근 시 `/erp/forbidden`으로 리다이렉트됨을 확인(시나리오 C).
- [x] **헤더 팝업**: `role='user'` 상태에서도 헤더 "조직도" 버튼이 노출되고, 클릭 시 동일한 계층 구조가 조회 전용 dialog로 표시된다(스냅샷 확인 결과 "Close" 외 편집 버튼 없음).
- [x] **부서 선택성**: 관리 화면·헤더 팝업 양쪽에서 "IT부문" 하위에 "개발부서"(하위 3개: Commerce시스템팀/ERP시스템팀/IT기획팀)와 부문 직속 5개 팀이 같은 depth에 공존함을 확인(시나리오 A/B).
- [x] **리더/하위 표시**: 그룹사~팀 전 레벨에서 "미지정" 리더 패널이, 팀 노드에서는 소속 부서 여부(`소속 부서: 개발부서` / `소속 부서: 없음(부문 직속)`)와 구성원 목록이 함께 표시됨을 확인.
- [x] **스키마 무변경**: `list_migrations`로 Task 043~~058 구간 마이그레이션 10건(`20260817081015`~~`20260817102540`) 전수 조회 후 SQL 본문에 `alter table public.profiles`/`public.departments`/`public.organizations` 0건 확인(전부 FK 참조 또는 함수 내 `SELECT`만 사용). 세 테이블 컬럼 목록도 로드맵 착수 전과 동일(`profiles` 11개 컬럼 / `departments` 5개 / `organizations` 4개).
- [x] **기존 데이터 무결**: `organizations` 1건 / `departments` 8건 / `profiles` 63건 — Task 059 착수~종료까지 값 불변 확인(중간에 F 시나리오용 임시 부문 1건을 만들었다가 즉시 삭제, 최종 카운트 동일).
- [x] **RLS 우회 검증**: `role='user'`(Task059 임시계정)로 헤더 팝업에서 ERP시스템팀 팀원 15명(홍길동/민희정/나승규/표유진 등) 전원의 이름이 조회됨을 확인 → 같은 세션을 `set local role authenticated` + `request.jwt.claims`로 시뮬레이션해 `select * from public.profiles` 직접 조회 시 본인 1행만 반환됨을 확인.
- [x] **싱글턴 제약**: `insert into public.org_groups (...) values ('GRP9999','TEST_두번째그룹',true)` → `23505 duplicate key value violates unique constraint "org_groups_singleton_unique"` 확인.
- [x] **부서-팀 일관성 트리거**: 임시 부문(`TEST_다른부문_059`) + 임시 부서(`OS9999`)를 만들고 IT부문 소속 `보안 운영지원팀`을 연결 시도 → `P0001: 부서와 팀이 서로 다른 부문에 속해 있어 연결할 수 없습니다` 예외 확인, 임시 부문/부서 즉시 삭제.
- [x] **헤더 회귀**: 위 "발견된 결함 1건"(근본 원인은 Task 054 이전부터 존재하던 헤더 설계, 약 640~1150px 구간)을 제외하면, 로그인/헤더 렌더링 자체는 전 페이지에서 정상. (언어 전환 스위처는 관리 화면이 한국어 단일 지원이라 이번 회귀 범위에서 별도 재확인하지 않음 — 기존 로드맵 방침대로 범위 밖.)
- [x] 회귀 검증: `/erp/admin/{users,menus,permissions}`, `/erp/master/{companies,brands,item-categories,colors,sizes}`, `/erp/products`, `/erp/settings` 전부 정상 렌더링(콘솔 에러 0건). `companies`에서 `TASK059_TEST_법인` 1건 등록 → `C1011` 정상 채번 확인 → 삭제 → `master_code_company_seq`를 `setval(1010,true)`로 원복(기존 12종 채번 무회귀 확인, `org_group`/`org_company`/`org_section` 3종 확장이 기존 로직에 영향 없음을 재확인).
- [x] `mcp__supabase__get_advisors`(security+performance) 최종 확인 — Task 058 시점 기록과 동일한 항목만 존재(신규 경고 0건). security의 `check_org_section_team_consistency`/`get_org_chart_members` SECURITY DEFINER 경고는 Task 047/049에서 이미 의도적 채택으로 기록된 항목.
- [x] 발견된 결함(헤더 타이틀-계정영역 겹침)은 `getBoundingClientRect()` 순회 측정으로 근본 원인을 재조사했다(조직도 버튼을 DOM에서 완전히 제거해도 재현됨을 확인해 Task 054 단독 원인이 아님을 확정). 근본 원인(`erp-header.tsx`의 타이틀 절대중앙고정 + `auth-menu.tsx`의 로그인 인사말 폭)은 이 로드맵의 변경 금지 범위 밖이라 **코드를 고치지 않고** 별도 후속 Task로 회부했다. 다만 Task 054가 만든 `org-chart-popup.tsx`(이 로드맵 소유 파일)가 겹침 폭을 넓히는 데 일부 기여한 부분은 범위 내라 판단해 아이콘 전용 버튼으로 완화했다.

**수락 기준**

- [x] PRD 12장 성공 기준 항목 전부 실제 시나리오(A~~H)로 재현해 통과를 확인했다(헤더 타이틀-계정영역 겹침 1건 제외 — 이 항목은 "회귀 없음"이 아니라 근본 원인이 이 로드맵 범위 밖인 "발견된 결함"으로 별도 트래킹, 나머지 전 항목 통과).
- [x] ERP MVP / 마스터 관리 기능에 회귀 없음(위 헤더 폭 이슈는 Task 054발 회귀가 아니라 사전에도 존재하던 이슈로 확인됨) — 로그인, 3단 내비게이션, 관리자 3화면, 기준정보 5화면, 상품 화면 전부 정상.
- [x] `npm run check-all` 통과(기존에도 있던 warning 8건 외 신규 없음) + `npm run build` 통과(46개 라우트 전부 정상 생성, `org-chart-popup` 관련 컴파일 에러 없음 — 아래 참고).

**테스트 체크리스트 (Playwright MCP + execute_sql)** — 계정 1개(`org-task059-temp@example.com`)를 `user` → `admin` → `superadmin` 순으로 승격시키며 재로그인 없이 즉시 반영됨을 확인, 종료 후 `auth.users` delete로 정리.

- [x] **시나리오 A (관리 화면 전 레벨 탐색)**: superadmin으로 그룹사(OO그룹) → 법인(OO 법인) → IT부문 → 개발부서 → ERP시스템팀까지 클릭 순회, 각 단계 리더 패널("미지정") 확인, 팀 노드에서 구성원 15명(관리자/최고관리자/일반 사용자 라벨 포함) 확인. **PASS**
- [x] **시나리오 B (부서 선택성)**: IT부문 하위에 "개발부서"(하위 3개, badge "부서")와 5개 직속 팀이 동일 depth 형제로 표시됨을 관리 화면·헤더 팝업 양쪽에서 확인. **PASS**
- [x] **시나리오 C (헤더 팝업 — 일반 사용자)**: `role='user'`로 `/erp`에서 팝업 열어 ERP시스템팀 구성원 15명 전원 노출 확인 → 동일 세션 `set local role authenticated`+JWT 클레임 시뮬레이션으로 `profiles` 직접 조회 시 본인 1행만 반환 확인 → `/erp/admin/org` 직접 접근 시 `/erp/forbidden` 확인. **PASS**
- [x] **시나리오 D (권한 분기)**: `role='admin'`(department=ERP시스템팀→IT부문 스코프)에서 그룹사/법인 레벨에 편집·리더지정 버튼 없음, IT부문에는 "+ 부서 등록" 있음, 팀 레벨에는 "지정"(리더) 버튼 있음을 확인 → `superadmin` 재승격 후 그룹사에 "그룹사 수정"/"+ 법인 등록"/리더 "지정" 버튼이 모두 나타남을 확인. **PASS**
- [x] **시나리오 E (스키마 무변경 증명)**: `list_migrations` 전체 78건 중 Task 043~058 해당 10건의 `statements` 본문을 `supabase_migrations.schema_migrations`에서 직접 조회해 전수 확인 — `profiles`/`departments`/`organizations` DDL 0건. 컬럼 목록·행수(1/8/63) 착수 전과 동일. **PASS**
- [x] **시나리오 F (제약 검증)**: `org_groups` 2번째 insert → `23505` 확인. 임시 타부문 부서-팀 연결 → 트리거 `P0001` 예외 확인, 임시 데이터 즉시 정리(정리 후 `organizations=1`/`org_sections=1`/`org_section_teams=3` 원복 확인). **PASS**
- [x] **시나리오 G (반응형/테마)**: 관리 화면·헤더 팝업을 1440px 라이트, 390px 다크, 768px에서 각각 스크린샷 확인 — 1440/390 모두 정상 렌더링. **768px에서는 위 "발견된 결함"(타이틀-계정영역 겹침, 재조사 결과 약 640~1150px 전체 구간에서 재현)이 나타남**. 완전한 PASS는 아니지만, 레이아웃 자체가 깨지지는 않고 텍스트가 겹치는 수준이며 기능 동작에는 영향이 없다. 조직도 버튼은 아이콘 전용으로 바꿔 이 로드맵의 기여분은 최소화했다(근본 해결은 범위 밖).
- [x] **시나리오 H (회귀)**: admin 3화면 + master 5화면 + products + settings 전부 정상 진입/렌더링. `companies`에서 `C1011` 신규 등록→삭제→시퀀스 원복으로 채번 무회귀 확인. **PASS**
- [x] `browser_console_messages`로 전 시나리오 확인 — 최종 에러 0건. 단, 테스트 중 `/erp/settings` 1회 방문 시 `Module not found: Can't resolve '@/components/erp/org/org-chart-popup'` Turbopack 컴파일 에러가 1회 관측됐으나 **파일은 실제로 존재**(`components/erp/org/org-chart-popup.tsx`)하고 즉시 재방문 시 재현되지 않았으며, `npm run build` 프로덕션 빌드에서도 해당 라우트 포함 46개 라우트 전부 에러 없이 생성됨 — Turbopack dev 서버의 일회성 HMR 레이스로 판단, 코드 결함 아님(재발 시 재조사 필요).
- [x] 테스트 계정(`org-task059-temp@example.com`) 삭제 후 `auth.users`/`profiles` 잔존 0건 확인. Task 046/058 시드 데이터(`org_groups`=1/`org_companies`=1/`org_company_divisions`=1/`org_sections`=1/`org_section_teams`=3/`org_unit_leaders`=0)는 전부 그대로 유지됨을 최종 확인.

---

## 범위 제외 (Out of Scope)

아래 항목은 이번 로드맵에서 **명시적으로 제외**한다. 세부 Task로 분해하지 않는다.

- **`organizations`(부문) / `departments`(팀) 자체의 CRUD 화면** — 이름 변경, 신규 팀 생성 등. 기존에도 없었고 이번에도 추가하지 않는다 (PRD 2장 / 10장)
- **`profiles`/`departments`/`organizations`의 스키마·RLS 변경** — 이 로드맵의 최우선 금지 사항
- **헤더 팝업에서의 조직 데이터 편집** — 조회 전용으로 고정(PRD 8.3절, 10장)
- **부서의 재귀적 하위 부서** — 부서는 부문과 팀 사이 딱 1단계로 고정 (PRD 10장)
- **인사발령(팀 이동·조직 개편) 이력 관리, 겸직/파견 표현** (PRD 10장)
- **결재선 / 보고라인 설정**
- **`profiles.role`(user/admin/superadmin) 체계 자체의 변경** — `requireSuperadmin()` 앱 헬퍼 추가는 역할 체계 변경이 아니라 기존 역할을 읽는 가드일 뿐이다
- **조직도와 마스터 도메인 `companies`(상품 마스터 "법인") 연계** — `org_companies.master_company_id` FK 검토는 필요해지는 시점에 별도 문서로 (PRD 4.4 / 11장)
- **조직도 카드 꾸미기** — 직급 체계, 명함 다운로드, 프로필 사진 업로드(아바타 이모지만 사용) (PRD 10장)
- **관리 화면 콘텐츠의 다국어(ko/en/ja/zh) 번역** — 내부 업무 화면은 한국어만 지원(헤더 팝업 트리거 버튼 라벨만 예외적으로 번역, Task 054)
- **조직도 엑셀 내보내기 / 인쇄용 레이아웃**

---

## Task 의존관계 요약

```
[ROADMAP_MVP.md Task 001~022 / ROADMAP_MASTER.md Task 023~042 완료]  ← 전제
   │
   ├─ Task 043 (설계 확정 / 미해결 가정 확인) ✅  ← 046·058의 전제
   │
   ├─ Task 044 (조직 상수/타입/레벨 메타, DB 무관) ✅
   │    └─ Task 045 (org_groups / org_companies / org_company_divisions + RLS + 채번 확장) ✅
   │         ├─ Task 046 (기존 organizations 고아 방지 초기 데이터) ✅  ← PRD 5.3 필수 작업
   │         │    └─ (이후 모든 화면 Task가 이 매핑에 의존)
   │         ├─ Task 047 (org_sections / org_section_teams + 일관성 트리거 + RLS + 채번 확장) ✅
   │         │    └─ (Task 056의 부서 CRUD, Task 058의 부서 시드가 이 테이블에 의존)
   │         └─ Task 048 (org_unit_leaders + 레벨별 RLS, org_section_id 포함)
   │              └─ Task 049 (get_org_chart_members() SECURITY DEFINER)
   │                   └─ Task 050 (타입 재생성 + 데이터 액세스 계층 + requireSuperadmin() + 팝업 액션)
   │                        │
   │                        └─ Task 053 (관리 화면 — 가변 깊이 트리 + 리더/하위 패널, 조회 기반)
   │                             ├─ Task 054 (헤더 "조직도" 팝업 트리거) ← 관리 화면의 tree.ts/키 포맷 재사용
   │                             ├─ Task 055 (그룹사/법인 CRUD + 부문↔법인 매핑)
   │                             ├─ Task 056 (부서 CRUD + 부서↔팀 소속 관리)
   │                             └─ Task 057 (리더 지정/해제 UI, 5레벨)
   │                                  │
   │                                  └─ Task 058 (더미 데이터 시드 — 부서만, 리더는 전체 미지정 유지) ✅
   │                                       └─ Task 059 (통합 검증) ✅
   │
   └─ Task 051 (menus 신규 1건 추가)      ← Phase 8과 병렬 가능
        └─ Task 052 (/erp/admin/org 라우트 골격 + 메뉴 매핑, requireAdmin() 자동 상속)
             └─ (Task 053이 이 스텁을 채움)
```

**병렬 가능 구간**

- **Phase 8(Task 044~~050)와 Phase 9(Task 051~~052)** — 스키마 구축과 메뉴/라우팅 등록은 서로 독립. Phase 9를 먼저 끝내두면 Task 053이 스텁을 바로 교체할 수 있다.
- **Task 046과 Task 047** — 둘 다 Task 045에만 의존하고 서로 다른 테이블을 다루므로 병렬 가능(단, 047은 Task 045의 시퀀스/함수 확장과 무관하게 자체적으로 `next_master_code()`를 또 `create or replace`하므로, **두 마이그레이션을 동시에 적용하지 말고 순서대로 적용**해 함수 정의가 서로 덮어쓰지 않게 한다).
- **Task 054·055·056·057** — Task 053 완료 후 서로 독립(각각 다른 컴포넌트, 다른 레벨/진입점 대상). 특히 054(헤더 팝업)는 편집 기능(055~057)과 전혀 무관하므로 가장 먼저 병행 착수해도 된다.
- **Task 044** — DB와 무관한 순수 모듈이라 Task 043 확정을 기다리지 않고 착수 가능(레벨별 기본 직책명만 나중에 보강).

**직렬 필수 구간**

- Task 045 → **Task 046** (테이블이 없으면 초기 데이터를 넣을 수 없고, 046 없이는 이후 모든 화면이 빈 트리)
- Task 045 → **Task 047** (부서 테이블도 `org_groups`/`org_companies`와 무관하지만, `next_master_code()`를 같은 함수에 순차적으로 확장하므로 045 적용 후에 047을 적용해야 045의 확장분이 유지된다)
- Task 048 → Task 049 → Task 050 (리더 테이블과 구성원 RPC가 있어야 데이터 액세스 계층이 성립)
- Task 050 → Task 053 (조회 함수 없이 화면을 만들면 화면마다 조인 복제)
- Task 052 → Task 053 (라우트 스텁이 있어야 실 구현을 채울 자리가 생김)
- Task 053 → Task 054 / 055 / 056 / 057 (트리 조립 로직·노드 키 포맷이 확정돼야 편집 UI·팝업을 얹을 자리가 생김)
- Task 043 → Task 046 / 058 (이름·부서 구성·리더 정책이 확정되어야 데이터가 확정됨)

---

## 진행 현황

| Phase                                 | Task 범위    | 상태                                                                                        |
| ------------------------------------- | ------------ | ------------------------------------------------------------------------------------------- |
| **Phase 8 — 조직 데이터 모델 구축**   | Task 043~050 | ✅ 완료                                                                                     |
| **Phase 9 — 메뉴 등록 / 관리 라우트** | Task 051~052 | ✅ 완료                                                                                     |
| **Phase 10 — 조직도 화면 구현**       | Task 053~057 | ✅ 완료                                                                                     |
| **Phase 11 — 시드 및 통합 검증**      | Task 058~059 | ✅ 완료(⚠️ 헤더 타이틀-계정영역 겹침 결함 1건 — 근본 원인은 이 로드맵 범위 밖, 별도 트래킹) |

### 사용자 확인 완료 항목 (2026-08-17 확정)

| 항목                                   | 관련 Task      | 확정 결과                                                                                                    | 상태    |
| -------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------ | ------- |
| ① 그룹사 실제 이름                     | 043 → 046, 058 | "OO그룹"(가안 그대로 채택)                                                                                   | ✅ 확정 |
| ② 법인 실제 이름                       | 043 → 046, 058 | "OO 법인"(가안 그대로 채택)                                                                                  | ✅ 확정 |
| ③ 부서 구성(부서명, 소속 팀)           | 043 → 058      | 부서 1건 생성 — "개발부서"에 `ERP시스템팀`/`Commerce시스템팀`/`IT기획팀` 3개 편입, 나머지 5개 팀은 부문 직속 | ✅ 확정 |
| ④ 초기 리더 지정자 / 팀 리더 지정 개수 | 043 → 058      | **전체 미지정으로 시작** — 5개 레벨 전부 리더를 시드하지 않고 관리 화면에서 직접 지정하도록 비워둠           | ✅ 확정 |
| ⑤ 레벨별 기본 직책명                   | 043 → 044, 057 | PRD 제안값 그대로 — 회장님 / 대표이사 / 부문장 / **부서장** / 팀장                                           | ✅ 확정 |

### 실 DB 확인값 (2026-08-17 조회 기준 — 착수 시 재확인할 것)

| 항목                              | 값                                                                                                                                       |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| "마스터 관리 > 기본 관리" 메뉴 id | `7ecdefaa-2707-4890-bddd-77e1de731ef1` (level 2, parent "마스터 관리"). 기존 소분류 3건: 사용자 관리(0)/메뉴 관리(1)/사용자 권한 관리(2) |
| 기존 부문(`organizations`) 1건    | `e72c8bf2-e334-498f-a21f-1cadd9b37ee0` / "IT부문" / `archived_at = null`                                                                 |
| 팀(`departments`)                 | 8건, 현재 전부 부서 없이 "IT부문"에 직접 소속                                                                                            |
| 구성원(`profiles`)                | 63건 (전원 `department_id` 있음)                                                                                                         |
| `user_menu_permissions`           | 0건 — 관리 화면이 admin 전용으로 확정되면서 더 이상 이 로드맵과 무관해짐(Task 051 참고)                                                  |
| 재사용 가능 DB 함수               | `is_admin()` / `is_superadmin()` / `current_organization_id()` / `set_master_audit()` / `next_master_code(p_entity)`                     |
| `profiles` SELECT 정책            | `profiles_select_own_or_admin` — `id = auth.uid() or is_admin()`                                                                         |
| `app/erp/admin/layout.tsx`        | `requireAdmin()`으로 이미 가드 중 — `/erp/admin/org`도 자동 상속(Task 052)                                                               |
