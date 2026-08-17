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

## Phase 8: 조직 데이터 모델 구축

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

### Task 048: `org_unit_leaders` 테이블 생성 (5레벨 공용 리더 + 레벨별 RLS)

**목표**: 그룹사/법인/부문/**부서**/팀 5개 레벨의 "장(長)"을 하나의 테이블로 통일해 저장하고, PRD 3.1의 레벨별 권한 차이를 RLS로 정확히 표현한다.

**관련 파일**

- Supabase 마이그레이션(MCP) — `create_org_unit_leaders`
- `docs/prd/PRD_ORG.md` 5.6절 / 3.1절

**구현 체크리스트**

- [ ] 테이블 생성 (PRD 5.6):
  - [ ] `id uuid primary key default gen_random_uuid()`
  - [ ] `org_group_id uuid references public.org_groups(id) on delete cascade`
  - [ ] `org_company_id uuid references public.org_companies(id) on delete cascade`
  - [ ] `organization_id uuid references public.organizations(id) on delete cascade`
  - [ ] **`org_section_id uuid references public.org_sections(id) on delete cascade`**
  - [ ] `department_id uuid references public.departments(id) on delete cascade`
  - [ ] `profile_id uuid not null references public.profiles(id) on delete cascade`
  - [ ] `title text not null`
  - [ ] `created_at`/`updated_at timestamptz not null default now()`, `updated_by uuid references public.profiles(id)`
  - [ ] **FK 삭제 정책은 `cascade`** — 마스터 도메인의 `restrict` 관례와 반대다. 리더 지정은 "부속 정보"라 조직/구성원이 사라지면 함께 사라지는 것이 옳고, `restrict`로 두면 이 신규 테이블이 기존 `departments`/`organizations`/`profiles` 삭제를 막게 되어 **기존 테이블의 동작을 바꾸는 셈**이 된다(무변경 원칙 위배). 이 결정 근거를 마이그레이션 주석에 남긴다.
- [ ] 제약 추가 (PRD 5.6 SQL 그대로, **5개 컬럼 기준**):
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
- [ ] `before update` 트리거로 기존 `public.set_master_audit()` 연결(`updated_at` + `updated_by`). `created_by` 컬럼이 없으므로 트리거가 설정하는 `updated_by`만 사용한다.
- [ ] 인덱스: `profile_id` FK 커버링 인덱스(리더로 지정된 사람 역조회용) + `updated_by` 커버링 인덱스.
- [ ] RLS 활성화 + 정책:
  - [ ] `select` — `to authenticated using (true)` (조직도 조회는 전 구성원)
  - [ ] `insert` — `with check`에 **레벨별 분기**를 그대로 표현(부서 분기 추가):
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
  - [ ] `update` — 같은 식을 `using`과 `with check` 양쪽에 적용(리더 교체 시 대상 팀/부서를 바꿔 스코프를 우회하지 못하게).
  - [ ] `delete` — 같은 식을 `using`에 적용.
  - [ ] 정책 이름은 기존 관례를 따라 `org_unit_leaders_select_authenticated` / `org_unit_leaders_insert_admin` / `_update_admin` / `_delete_admin`.
- [ ] `get_advisors`(security + performance) 확인 — 신규 경고 유무와 대응을 기록한다.
- [ ] **마이그레이션 SQL에 `alter table public.departments` / `public.profiles` / `public.organizations`가 없음을 재확인**(FK로 참조만 한다).

**수락 기준**

- [ ] 5개 FK 중 2개 이상에 값을 넣은 insert가 CHECK 위반(`23514`)으로 거부된다. 5개 전부 null인 insert도 거부된다.
- [ ] 같은 팀/부서에 리더 2명을 넣으려 하면 partial unique index 위반(`23505`)으로 거부된다(5개 레벨 각각 확인).
- [ ] `role='admin'`이면서 `current_organization_id()`가 일치하는 팀·부서에는 리더를 지정할 수 있고, 부문/법인/그룹사 리더 지정은 거부된다.
- [ ] `role='superadmin'`은 5개 레벨 전부 지정 가능하다.

**테스트 체크리스트 (execute_sql)**

- [ ] `num_nonnulls` CHECK 검증 — 0개/2개/5개 타깃 조합 insert 3건 전부 `23514` 확인, 1개만 채운 insert는 성공 확인.
- [ ] 5개 partial unique index 각각에 대해 중복 지정 시도 → `23505` 확인(그룹사/법인/부문/부서/팀 5회).
- [ ] `role='admin'` 세션 시뮬레이션 — 자기 부문 소속 팀·부서 리더 insert 성공, 다른 부문 팀·부서(있다면 임시 생성) 및 부문/법인/그룹사 리더 insert 차단 확인.
- [ ] `role='superadmin'` 세션 시뮬레이션 — 5개 레벨 전부 insert 성공 확인.
- [ ] `role='user'` 세션 — select 성공, insert `42501` 차단 확인.
- [ ] `profiles` 행 삭제 시 리더 행이 cascade로 함께 삭제되고 **`profiles` 삭제 자체는 막히지 않는지** 확인(임시 계정으로 검증 — 기존 테이블 동작 무변경 확인의 핵심).
- [ ] 리더 교체(UPDATE)를 실행해 `updated_at`/`updated_by`가 갱신되는지 확인.
- [ ] 테스트 행 전부 삭제 후 잔존 0건 확인.

---

### Task 049: `get_org_chart_members()` SECURITY DEFINER 함수 구현

**목표**: `profiles`의 RLS를 **전혀 건드리지 않고** 조직도에 필요한 최소 컬럼만 전 로그인 사용자에게 노출한다. 이 로드맵에서 가장 보안 민감도가 높은 Task다. **관리 화면(Task 053)과 헤더 팝업(Task 054) 둘 다 이 함수를 공유한다.**

**관련 파일**

- Supabase 마이그레이션(MCP) — `create_get_org_chart_members`
- `docs/prd/PRD_ORG.md` 3.2절 (SQL 원본)
- `lib/erp/org/types.ts` (Task 044 — `OrgMember`가 반환 컬럼과 1:1 대응)

**구현 체크리스트**

- [ ] PRD 3.2절 SQL을 그대로 적용한다:
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
  - [ ] PRD 원문의 `set search_path = public` 대신 **`set search_path = ''` + 스키마 정규화(`public.profiles`)** 로 적용한다 — 기존 6개 DB 함수가 전부 이 컨벤션이고, Supabase advisor의 `function_search_path_mutable` 경고를 피하는 방식이다. **반환 컬럼 목록은 PRD와 정확히 동일하게 유지**한다.
  - [ ] **`where department_id is not null` 같은 필터를 넣지 않는다** — 그룹사/법인/부문/부서 리더로 지정될 임원이 특정 팀 소속이 아닐 수 있는데(`profiles.department_id` nullable), 여기서 걸러내면 Task 050의 `getOrgLeaders()` 매칭에서 그 리더의 이름이 조회되지 않는다(PRD 3.2절). 팀 소속 필터링이 필요한 조회(구성원 목록)는 호출부에서 결과를 `department_id`로 걸러 쓴다.
  - [ ] `anon`에는 `execute`를 부여하지 않는다(로그인 사용자 전용).
- [ ] **반환 컬럼에 `phone_number` / `bio` / `email`이 포함되지 않았는지 SQL 본문으로 재확인**한다 — 이 함수의 존재 이유다(PRD 3.2).
- [ ] 함수 상단에 주석으로 "이 함수는 `profiles` RLS를 우회한다. 컬럼을 추가할 때는 개인정보 노출 범위를 반드시 재검토할 것"을 남긴다.
- [ ] `get_advisors`(security) 확인 — `SECURITY DEFINER` WARN이 나오는 것은 기존 7개 함수와 동일한 패턴이므로, "반환 컬럼이 고정되어 있고 `authenticated`에게만 부여됨"이라는 상쇄 근거를 이 Task에 기록한다.
- [ ] **`profiles` 테이블의 정책·컬럼을 변경하는 SQL이 마이그레이션에 없음을 재확인**한다.

**수락 기준**

- [ ] `role='user'` 세션에서 `select * from public.get_org_chart_members()` 호출 시 **`profiles` 63건 전체**(팀 소속 여부와 무관하게)가 반환된다.
- [ ] 같은 세션에서 `select * from public.profiles` 직접 조회 시 **여전히 본인 1건만** 반환된다 (RPC 우회가 기존 RLS를 깨지 않았음).
- [ ] 반환 컬럼이 정확히 6개(`id`, `name`, `department_id`, `avatar_key`, `role`, `is_active`)다.
- [ ] `anon` 롤에서는 실행이 거부된다.

**테스트 체크리스트 (execute_sql)**

- [ ] `set local role authenticated` + `set_config('request.jwt.claims', ...)`로 일반 사용자 세션 시뮬레이션 → 함수 호출 결과 63건 확인.
- [ ] 동일 세션에서 `select count(*) from public.profiles` → 1건 확인(본인만). **이 두 결과의 대비가 이 Task의 핵심 증거다.**
- [ ] `set local role anon` → 함수 실행 시 권한 오류 확인.
- [ ] `information_schema.routines`/`pg_get_functiondef`로 반환 컬럼 6개와 `security definer`/`stable`/`search_path` 설정을 확인.
- [ ] 함수 본문에 `phone_number`/`bio`/`email`/`where` 문자열이 없는지 `pg_get_functiondef` 결과로 확인(필터 없음을 재확인).

---

### Task 050: 타입 재생성 및 조직도 데이터 액세스 계층 구현

**목표**: 관리 화면(Task 053)과 헤더 팝업(Task 054)이 공유할 서버 측 조회 함수와 Server Action을 한 곳에 모은다. **화면이 각자 조인을 짜지 않도록 하는 것, 그리고 "부서 있으면 부서 아래 / 없으면 부문 직속"이라는 트리 조립 규칙을 한 곳에만 구현하는 것이 이 Task의 존재 이유다.**

**관련 파일**

- `lib/supabase/database.types.ts` (재생성)
- `lib/erp/org/queries.ts` (신규 — 조회)
- `lib/erp/org/actions.ts` (신규 — Server Actions)
- `lib/erp/org/tree.ts` (신규 — 평면 행 → `OrgTreeNode[]` 조립, 순수 함수)
- `lib/erp/auth.ts` (**부수 수정** — `requireSuperadmin()` 신규 추가)
- `lib/erp/org/types.ts` / `levels.ts` / `code.ts` (Task 044)

**구현 체크리스트**

- [ ] `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성 — Task 045/047/048의 5개 테이블 블록과 Task 049의 함수 시그니처(`Functions.get_org_chart_members`)가 반영됨을 확인.
- [ ] `lib/erp/auth.ts`에 `requireSuperadmin()` 추가 — `getCurrentErpUser()` 결과의 `role !== "superadmin"`이면 `redirect("/erp/forbidden")`. **기존 `requireAdmin()`은 수정하지 않는다**(추가만).
- [ ] `lib/erp/org/queries.ts` — 조회 함수(전부 함수 내부에서 `await createClient()` 호출, 전역 변수 없음). **관리 화면·헤더 팝업 둘 다 이 함수들만 호출한다(각자 조인을 새로 짜지 않는다).**
  - [ ] `getOrgTree()` — `org_groups` / `org_companies` / `org_company_divisions` / `org_sections` / `org_section_teams` + `organizations` + `departments`를 조회해 **가변 깊이** `OrgTreeNode[]`를 반환. 구성원은 트리에 포함하지 않는다(PRD 6.3).
    - [ ] **부문 노드의 자식 조립 규칙**(PRD 4.2절 그대로 구현): 그 부문 소속 `org_sections` 전부를 자식으로 두고, 그 부문 소속 `departments` 중 `org_section_teams`에 매핑이 **없는** 것만 부문의 직접 자식으로 추가한다(부서에 매핑된 팀은 그 부서의 자식으로만 나타나고 부문에 중복 노출되지 않는다).
    - [ ] 부문/팀의 `isActive`는 `archived_at is null`로 매핑(PRD 6.5).
    - [ ] 정렬: 그룹사·법인·부서는 `sort_order` → `name`, 부문은 `org_company_divisions.sort_order` → `organizations.name`, 팀은 부서 소속이면 `org_section_teams.sort_order`, 부문 직속이면 `departments.name` 가나다순.
    - [ ] **매핑되지 않은 부문(고아)이 있으면 트리에서 누락되므로**, 개발 편의를 위해 고아 부문 수를 함께 반환하거나 서버 로그로 경고한다(Task 046 이후에는 0건이어야 함).
  - [ ] `getOrgLeaders()` — `org_unit_leaders`를 한 번에 조회해 `Map<"level:targetId", OrgLeader>` 형태로 반환. 리더 이름/아바타는 `profiles` 직접 조인이 아니라 **`get_org_chart_members()` 결과와 앱에서 매칭**한다(일반 사용자 세션에서도 리더 이름이 보여야 하므로 — `profiles` 조인은 RLS에 막힌다). **이 점이 이 Task에서 가장 놓치기 쉬운 함정이다.**
  - [ ] `getOrgChartMembers()` — `supabase.rpc("get_org_chart_members")` 호출 결과를 `OrgMember[]`로 매핑.
  - [ ] `getMembersByDepartment(departmentId)` — 위 결과를 필터링(RPC를 팀별로 반복 호출하지 않는다).
  - [ ] `getUnmappedDivisions()` — 아직 법인에 연결되지 않은 `organizations` 목록(Task 055의 매핑 관리 UI용).
  - [ ] **`getUnmappedTeamsInDivision(organizationId)`** — 특정 부문 안에서 아직 어떤 부서에도 매핑되지 않은 `departments` 목록(Task 056의 부서-팀 소속 관리 UI용).
  - [ ] 파일 상단에 "`cookies()`를 쓰는 `createClient()`에 의존하므로 호출하는 컴포넌트는 `<Suspense>` 경계가 필요하다"를 명시(기존 관례).
- [ ] `lib/erp/org/tree.ts` — 평면 행 배열을 `OrgTreeNode[]`로 조립하는 **순수 함수**(`buildOrgTree`). `lib/erp/menu-tree.ts`의 `buildMenuTree` 패턴을 따르되 레벨 이름이 다르고 **부서 유무에 따른 가변 분기가 있으므로** 재사용은 하지 않는다. 순수 함수라 단위 검증이 쉽다 — "부서 0개인 부문", "부서 1개 + 직속 팀 혼재하는 부문" 두 케이스를 반드시 단위 검증한다.
- [ ] `lib/erp/org/actions.ts` — Server Actions (편집용은 전부 진입부에서 권한 가드 먼저 호출):
  - [ ] `createOrgCompanyAction(input)` / `updateOrgCompanyAction(id, input)` / `deleteOrgCompanyAction(id)` — 첫 줄에서 `requireSuperadmin()`. 등록 시 `rpc("next_master_code", { p_entity: "org_company" })`로 채번.
  - [ ] `updateOrgGroupAction(id, input)` — 그룹사는 **이름/비고/사용여부 수정만** 제공(생성·삭제 액션을 만들지 않는다, PRD 6.2).
  - [ ] `setDivisionCompanyAction(organizationId, orgCompanyId)` — `org_company_divisions` upsert(부문당 1건 unique). `requireSuperadmin()`.
  - [ ] `moveOrgCompanyAction(id, direction)` — 형제 간 `sort_order` 교환(`moveMasterEntityAction` 로직 참고, 마스터 액션을 수정하지 않고 조직용으로 별도 구현).
  - [ ] `createOrgSectionAction(input)` / `updateOrgSectionAction(id, input)` / `deleteOrgSectionAction(id)` — 첫 줄에서 `requireAdmin()` 호출 후, 대상 부문이 `current_organization_id()`와 일치하는지 앱에서도 1차 확인(최종 판정은 RLS). `superadmin`은 통과. 등록 시 `next_master_code("org_section")`로 채번.
  - [ ] `assignTeamToSectionAction(departmentId, sectionId)` — `org_section_teams` upsert(팀당 1건 unique, 이미 다른 부서 소속이면 이관). 부서 기준 스코프로 `requireAdmin()` + 검증.
  - [ ] `removeTeamFromSectionAction(departmentId)` — `org_section_teams`에서 해당 팀 매핑 delete(=부문 직속으로 되돌림). 삭제 전 기존 매핑의 부서 기준으로 스코프 검증.
  - [ ] `setOrgLeaderAction({ level, targetId, profileId, title })` — 레벨에 따라 가드 분기: `team`/`section`이면 `requireAdmin()`(DB RLS가 스코프까지 최종 판정), 그 외는 `requireSuperadmin()`. 내부적으로 해당 레벨 컬럼 하나만 채워 upsert한다(partial unique index가 1명 제한을 보장).
  - [ ] `clearOrgLeaderAction({ level, targetId })` — 동일 가드 분기 후 delete.
  - [ ] **`getOrgChartPopupDataAction()`** — 헤더 팝업(Task 054) 전용. `getOrgTree()`/`getOrgLeaders()`/`getOrgChartMembers()`를 한 번에 호출해 `{ tree, leaders, members }`로 묶어 반환하는 **읽기 전용** 액션. **역할 가드를 두지 않는다**(PRD 8.4 — RLS가 이미 로그인 사용자 전체 허용이므로 인증 여부 외 추가 체크 불필요). 이 액션은 다른 편집 액션과 달리 `revalidatePath`도 호출하지 않는다(변경이 없으므로).
  - [ ] 에러 변환: FK `restrict` 위반(`23503`) → "하위 데이터가 있어 삭제할 수 없습니다.", unique 위반(`23505`) → 상황별 한국어 메시지("이미 사용 중인 코드입니다." / "해당 조직에는 이미 리더가 지정되어 있습니다." / "이 부문은 이미 다른 법인에 소속되어 있습니다." / "이 팀은 이미 다른 부서에 소속되어 있습니다."), 트리거 예외(부서-팀 부문 불일치) → "부서와 팀의 소속 부문이 달라 연결할 수 없습니다.", RLS 차단(`42501`) → "권한이 없습니다."
  - [ ] 반환 타입은 기존 `lib/erp/actions.ts`의 `ActionResult`를 import해 재사용한다(단, `getOrgChartPopupDataAction()`은 단순 조회라 별도의 조회 결과 타입을 반환해도 무방).
  - [ ] 편집 액션 성공 후 `revalidatePath("/erp/admin/org")` 호출.
- [ ] **`lib/erp/master/**` 파일을 수정하지 않았는지 `git diff`로 확인**한다.

**수락 기준**

- [ ] `npm run check-all` 통과 (재생성된 타입 기준).
- [ ] `getOrgTree()`가 그룹사 1 → 법인 1 → 부문 1 → 팀 8(부서 아직 없음)의 트리를 반환한다(Task 046까지만 적용된 상태 기준).
- [ ] `getOrgChartMembers()`가 일반 사용자 세션에서도 63건을 반환한다.
- [ ] 일반 사용자 세션에서 `setOrgLeaderAction`(부문 레벨) 호출 시 `/erp/forbidden`으로 리다이렉트된다.
- [ ] 일반 사용자 세션에서 `getOrgChartPopupDataAction()` 호출은 **성공**한다(가드가 없으므로).
- [ ] `buildOrgTree` 단위 테스트가 "부서 0개인 부문"과 "부서 1개 + 직속 팀 혼재" 두 케이스 모두에서 올바른 트리를 만든다.

**테스트 체크리스트 (Playwright MCP + execute_sql)**

검증 방법: `lib/erp/org/*`는 서버 전용이라 브라우저에서 직접 호출할 수 없으므로 ROADMAP_MVP Task 013 / ROADMAP_MASTER Task 029의 선례대로 **임시 디버그 라우트**(`app/api/debug-task050/route.ts`)를 만들어 실제 로그인 세션으로 검증한 뒤 **검증 완료 즉시 삭제**한다(`git status`로 잔존 없음 확인).

- [ ] 임시 계정 3개(superadmin / admin / user)를 회원가입 → `execute_sql`로 role 승격(`prevent_unauthorized_role_change` 때문에 superadmin은 admin 경유 2단계 승격 필요 — ROADMAP_MASTER Task 031 기록 참고)해 준비.
- [ ] user 세션에서 `getOrgChartMembers()` → 63건 반환 확인. 같은 세션에서 `getOrgTree()` → 정상 트리 반환 확인.
- [ ] user 세션에서 `getOrgChartPopupDataAction()` 호출 → 성공 확인(가드 없음 재검증).
- [ ] user 세션에서 `getOrgLeaders()`가 **리더 이름을 정상 반환**하는지 확인(`profiles` 직접 조인이었다면 null이 되었을 지점 — RPC 매칭 구현이 맞는지 검증).
- [ ] superadmin 세션에서 `createOrgCompanyAction` → 코드가 `OC####`로 자동 채번되어 저장됨을 `execute_sql`로 확인.
- [ ] admin 세션에서 `createOrgSectionAction`(자기 부문) 성공 → `execute_sql`로 `OS####` 채번 확인. 임시로 다른 부문을 만들어 그 부문에 `createOrgSectionAction` 시도 → `/erp/forbidden` 또는 RLS 차단 확인 후 정리.
- [ ] admin 세션에서 `assignTeamToSectionAction`(자기 부문 소속 팀 → 방금 만든 부서) 성공 → `getOrgTree()` 재조회 시 그 팀이 부서 하위로 이동했는지 확인. `removeTeamFromSectionAction` 호출 → 다시 부문 직속으로 돌아오는지 확인.
- [ ] admin 세션에서 `setOrgLeaderAction({ level: "team", ... })`(자기 부문 팀) 성공, `{ level: "division", ... }`은 `/erp/forbidden` 리다이렉트 확인.
- [ ] admin 세션에서 `createOrgCompanyAction` 호출 → `/erp/forbidden` 리다이렉트 확인(superadmin 전용).
- [ ] 같은 조직에 리더 2명 지정 시도 → "해당 조직에는 이미 리더가 지정되어 있습니다." 메시지 확인.
- [ ] 임시 디버그 라우트, 테스트 데이터, 임시 계정 3개, 임시 부문/부서 삭제 및 소비된 시퀀스 원복 후 잔존 0건 확인.

---

## Phase 9: 메뉴 등록 및 관리 라우트 골격

> PRD 7장.
> `menus`의 기존 "마스터 관리 > 기본 관리"(사용자/메뉴/권한 관리와 형제) 아래 4번째 소분류로 "조직도 관리"를 추가하고 `/erp/admin/org` 라우트에 연결한다.
> **Phase 8과 병렬 착수 가능하다** — 스키마와 무관한 메뉴/라우팅 작업이다.

### Task 051: menus 데이터 추가 ("마스터 관리 > 기본 관리 > 조직도 관리")

**목표**: 이미 3개 소분류(사용자 관리/메뉴 관리/사용자 권한 관리)가 있는 "기본 관리" 중분류 아래에 4번째 소분류를 신규 등록한다. **기존 메뉴는 한 건도 수정하지 않는다.** 관리 화면이 admin 전용으로 확정되면서, 이전 검토안에 있던 "일반 사용자에게 메뉴 권한을 일괄 부여해야 하는가" 문제는 **더 이상 발생하지 않는다** — 이 메뉴도 기존 3형제와 마찬가지로 일반 사용자에게는 그냥 보이지 않으면 된다(헤더 팝업이 조회를 전담하므로).

**관련 파일**

- Supabase 마이그레이션(MCP) — `add_org_chart_menu`
- `docs/prd/PRD_ORG.md` 7장

**구현 체크리스트**

- [ ] 착수 전 `execute_sql`로 대상 중분류를 재확인한다 — 2026-08-17 실 DB 기준 "기본 관리" = `7ecdefaa-2707-4890-bddd-77e1de731ef1`(level 2, parent "마스터 관리" `d3346981-9b2f-4be7-b21d-1f7c2dac69fa`), 기존 소분류 3건: 사용자 관리(`sort_order=0`) / 메뉴 관리(`1`) / 사용자 권한 관리(`2`). **id가 다르면 조회 결과를 우선한다.**
- [ ] 소분류 insert 1건 — `parent_id` = "기본 관리" id, `level = 3`, `name = '조직도 관리'`, `sort_order = 3`, `is_active = true`.
- [ ] **기존 메뉴 행에 대한 UPDATE/DELETE가 없는지** 마이그레이션 SQL로 확인(순수 INSERT 1건 — 인사급여 하위 신설안 폐기로 인해 이전 버전보다 훨씬 단순해졌다).
- [ ] `user_menu_permissions`에 대한 INSERT는 **하지 않는다** — 이 화면은 `role in ('admin','superadmin')`만 접근하며, 관리자는 `getVisibleMenuTree()`가 권한 행과 무관하게 항상 전체 메뉴를 보여준다(`lib/erp/queries.ts`의 `isAdminRole(role)` 분기, 실 코드로 재확인 완료). 일반 사용자는 이 메뉴 자체가 필요 없다.
- [ ] 롤백 SQL(소분류 delete)을 마이그레이션 주석에 남긴다.

**수락 기준**

- [ ] "기본 관리" 하위에 소분류 1건이 추가되어 총 4건(사용자/메뉴/권한/조직도 관리)이 되고 `is_active = true`다.
- [ ] 기존 메뉴(마스터 관리, 기본 관리 및 그 3형제 등)의 이름·정렬·활성 상태가 마이그레이션 전후 동일하다.
- [ ] 관리자 계정으로 `/erp`에서 상단 "마스터 관리" 선택 시 좌측 트리에 "기본 관리 > 조직도 관리"가 노출된다.
- [ ] 일반 사용자 계정에게는 (기존 3형제와 마찬가지로) 이 메뉴가 노출되지 않는다.

**테스트 체크리스트 (Playwright MCP)**

- [ ] 임시 관리자 계정으로 로그인 → `/erp` → 상단 Menubar "마스터 관리" → 좌측 트리에 "기본 관리" 펼침 → "조직도 관리"가 기존 3형제 아래 4번째로 노출 확인(스크린샷).
- [ ] 임시 일반 사용자 계정으로 로그인 → 트리에서 "기본 관리" 자체가 (기존과 동일하게) 노출되지 않는지 확인.
- [ ] 마이그레이션 전후 `menus` 전체 행 수 대조(+1건) 및 기존 행 체크섬 동일 확인.
- [ ] `browser_console_messages`로 콘솔 에러 0건 확인.
- [ ] 임시 계정 정리 후 잔존 0건 확인.
- [ ] `npm run check-all` 통과 확인(이번 Task는 데이터 마이그레이션이라 코드 변경 없음).

---

### Task 052: `/erp/admin/org` 라우트 골격 및 메뉴 라우트 매핑

**목표**: 조직도 관리 라우트를 스캐폴딩하고 메뉴 → 실제 라우트 매핑을 연결한다. **기존 `app/erp/admin/layout.tsx`가 이미 `requireAdmin()`으로 가드하고 있으므로, 이 Task는 그 가드를 상속받는 `page.tsx`만 추가하면 된다 — 별도 접근 제어 코드가 필요 없다.**

**관련 파일**

- `app/erp/admin/org/page.tsx` (신규, 스텁 — `app/erp/admin/{users,menus,permissions}/page.tsx`와 형제)
- `lib/erp/menu-routes.ts` (기존 — `MENU_ROUTES`에 매핑 1건 추가)
- `components/erp/page-header.tsx` (기존 재사용)

**구현 체크리스트**

- [ ] `lib/erp/menu-routes.ts`의 `MENU_ROUTES`에 매핑 추가 — `"마스터 관리>기본 관리>조직도 관리": "/erp/admin/org"` (PRD 7장). 착수 전 `execute_sql`로 실 DB의 메뉴 이름 3단이 이 키와 정확히 일치하는지 재확인한다(공백·표기 포함).
- [ ] `app/erp/admin/org/page.tsx` 스텁 생성 — 얇은 `Page` + `<Suspense fallback={null}>` + `async OrgContent` 패턴. `PageHeader`로 breadcrumb("마스터 관리 > 기본 관리 > 조직도 관리")를 표시하고 "Task 053에서 구현됩니다" 안내 문구를 둔다. **`app/erp/admin/layout.tsx`를 그대로 상속받으므로 이 페이지에 별도 가드 코드를 넣지 않는다.**
- [ ] `app/erp/menu/[menuId]/page.tsx`의 기존 판정 순서("존재 여부 → `canAccessMenu` → 라우트 매핑 리다이렉트")를 **변경하지 않는다** — 새 매핑이 그 흐름에 자연히 얹힌다.

**수락 기준**

- [ ] 트리에서 "조직도 관리" 클릭 시 `MenuPlaceholder`가 아니라 `/erp/admin/org`로 이동한다.
- [ ] 로그인한 `role='user'` 계정이 `/erp/admin/org`에 **직접 URL로 접근하면 `/erp/forbidden`으로 리다이렉트**된다(기존 `app/erp/admin/layout.tsx` 가드 상속 검증 — 이전 버전(`/erp/org`, 조회 전체 개방)과 정반대 동작이므로 반드시 확인).
- [ ] 미인증 상태로 `/erp/admin/org` 접근 시 `/auth/login`으로 리다이렉트된다(`proxy.ts` 회귀 없음).
- [ ] breadcrumb이 "마스터 관리 > 기본 관리 > 조직도 관리"로 표시된다.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 2개(admin 1 / user 1)로 검증 후 즉시 삭제

- [ ] admin 계정으로 트리 클릭 → `/erp/admin/org`로 이동 및 breadcrumb 확인.
- [ ] **user 계정으로 `/erp/admin/org` 직접 URL 진입 → `/erp/forbidden`으로 튕기는지 확인** (기존 3형제 화면과 동일 동작인지 대조).
- [ ] 로그아웃 상태로 `/erp/admin/org` 접근 → `/auth/login` 리다이렉트 확인.
- [ ] `getMenuPathForRoute("/erp/admin/org")`가 3단 경로를 반환하는지 breadcrumb 표시로 간접 확인.
- [ ] `browser_console_messages` 에러 0건, `npm run check-all` 통과.
- [ ] 임시 계정 삭제 후 잔존 0건 확인.

---

## Phase 10: 조직도 화면 구현

> PRD 6.3절 / 3.1절 / 8장.
> **조회 기반 관리 화면(Task 053)을 먼저 완성해 데이터 계층을 실사용으로 검증하고, 헤더 팝업(Task 054)과 편집 기능(Task 055/056/057)을 그 위에 얹는다.**
> Task 054·055·056·057은 Task 053 완료 후 서로 독립적으로 병렬 개발 가능하다.

### Task 053: 관리 화면 — 가변 깊이 통합 트리 + 리더/하위 패널 (조회 기반)

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

- [ ] `MasterDetailLayout` + `MasterTreePanel`을 **그대로 재사용**한다(신규 트리 컴포넌트를 만들지 않는다). `MasterTreePanel`의 `MasterTreeNode`는 `{ id, name, isActive, children }` 구조라 `OrgTreeNode`에서 `level`/`sortOrder`를 제외해 매핑하면 그대로 들어간다 — 다만 선택된 노드의 **레벨을 알아야 하므로** 화면(`OrgChartView`)이 `id → level` 맵을 별도로 갖는다.
  - [ ] 노드 id가 레벨 간 충돌하지 않도록 트리 노드 키를 `"group:<uuid>"` / `"company:<uuid>"` / `"division:<uuid>"` / **`"section:<uuid>"`** / `"team:<uuid>"` 형태의 **접두사 포함 문자열**로 만든다(서로 다른 테이블의 uuid라 충돌 가능성은 낮지만, 파싱만으로 레벨을 알 수 있는 편이 화면 로직이 단순해진다). **이 키 포맷은 Task 054(헤더 팝업)도 그대로 재사용한다.**
- [ ] 좌측 트리: 그룹사 → 법인 → 부문 → (부서 있으면 부서 →) 팀. **구성원은 트리에 넣지 않는다**(PRD 6.3). **부문 노드 바로 아래에 부서 노드와(부서 없는) 팀 노드가 같은 레벨로 섞여서 나타나는지가 이 Task의 핵심 시각적 검증 포인트다.**
- [ ] 우측 상단 **리더 패널**(`OrgLeaderPanel`) — 선택 노드의 `org_unit_leaders` 정보를 표시. 지정되어 있으면 아바타(`lib/erp/avatar-options.ts`의 `getAvatarEmoji()` 재사용) + 이름 + 직책, 없으면 "미지정" 상태를 표시한다(지정 버튼은 Task 057에서 추가).
- [ ] 우측 하단 **하위 패널**(`OrgChildrenPanel`) — 그룹사/법인/부문/부서 노드면 하위 조직 카드 목록(이름 + 하위 개수 + 리더 이름), **팀 노드면 `getMembersByDepartment()` 결과로 구성원 목록**을 표시한다(PRD 6.3).
- [ ] 구성원 목록(`OrgMemberList`)은 아바타 + 이름 + 역할 배지(`lib/erp/role-labels.ts` 재사용) + 비활성 배지만 표시한다. **`phone_number`/`bio`/`email`은 표시하지 않는다**(애초에 RPC가 반환하지 않지만, 화면에서 다른 경로로 조회하지 않는지도 확인). **이 컴포넌트는 Task 054(헤더 팝업)도 재사용할 수 있는지 검토하되, 강제하지 않는다**(PRD 6.3.2 — 팝업은 독립 컴포넌트로 둬도 무방).
- [ ] 선택 상태를 URL 쿼리(`?node=team:<uuid>`)로 관리해 새로고침/딥링크/뒤로가기에서 유지되게 한다(`erp-menu-tree.tsx`/`brand-structure-manager.tsx`와 동일한 `useSearchParams` + `router.replace` 패턴).
- [ ] 초기 진입 시 그룹사 노드를 기본 선택하고 법인까지 펼친 상태로 시작한다.
- [ ] 비활성(부문/팀의 `archived_at is not null`) 노드는 "비활성" 배지와 함께 계속 노출한다(마스터 화면과 동일 정책).
- [ ] 데이터가 비었을 때(그룹사 0건, 또는 고아 부문만 존재) `components/erp/erp-error-empty.tsx` 계열의 빈 상태 UI로 안내한다 — Task 046 이전 상태에서도 화면이 깨지지 않아야 한다.
- [ ] 반응형: `lg` 미만에서는 `MasterDetailLayout`이 트리를 Sheet 드로어로 전환하므로 **드로어 열림 상태를 `OrgChartView`가 소유**하고, 트리 노드 선택 시 곧바로 닫는다(Task 032에서 확립한 컨트롤드 패턴).
- [ ] 하드코딩 색상 금지 — 모든 UI 색상은 CSS 변수 토큰만 사용.
- [ ] 페이지는 얇은 `Page` + `<Suspense>` + `async OrgContent` 패턴으로 작성하고, `getOrgTree()`/`getOrgLeaders()`/`getOrgChartMembers()`를 **서버에서 병렬(`Promise.all`)로** 한 번씩만 조회해 클라이언트 컴포넌트에 내려준다(팀별 반복 조회 금지).

**수락 기준**

- [ ] `/erp/admin/org`에서 그룹사 → 법인 → 부문 → (부서 있으면 부서 →) 팀이 트리에서 펼침/접힘으로 탐색되고, 팀 선택 시 구성원 목록이 우측에 표시된다.
- [ ] **같은 부문 아래에서 부서 소속 팀과 부문 직속 팀이 동시에 트리에 표시된다** — 부서 선택성의 핵심 증거.
- [ ] 어느 레벨 노드를 클릭해도 리더(지정 시)와 하위 목록이 함께 표시된다.
- [ ] 데스크탑(1440px) / 태블릿(768px) / 모바일(390px) 3개 뷰포트에서 레이아웃이 깨지지 않는다.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 1개(admin)로 검증 후 즉시 삭제. **이 화면은 admin 전용이므로 user 세션 검증은 Task 052에서 이미 완료했다.** Task 047/058에서 부서 예시 데이터가 이미 들어가 있어야 이 Task의 핵심 시나리오를 검증할 수 있다.

- [ ] admin 계정으로 `/erp/admin/org` 진입 → 그룹사 노드부터 팀까지 순차 클릭하며 펼침 확인(스크린샷).
- [ ] **부서가 있는 부문에서, 부서 노드와 부서 없이 직속된 팀 노드가 같은 레벨에 나란히 보이는지 확인**(스크린샷) — 예: "개발부서"와 "IT기획팀"이 "IT부문" 아래 같은 depth에 표시.
- [ ] 부서 노드 선택 → 그 부서의 리더(부서장)와 소속 팀 목록이 우측에 표시되는지 확인.
- [ ] 팀 노드 선택 → 해당 팀 구성원 목록이 표시되고, `execute_sql`로 조회한 그 팀의 실제 인원수와 일치하는지 대조.
- [ ] 리더가 지정된 노드와 미지정 노드 양쪽의 리더 패널 표시를 확인(미지정은 "미지정" 문구).
- [ ] URL(`?node=team:<uuid>`) 직접 진입 → 트리 자동 확장 + 해당 노드 선택 상태 확인. `browser_navigate_back()`으로 이전 선택 복원 확인.
- [ ] `browser_resize`로 1440 / 768 / 390px 순회하며 레이아웃 확인 — 390px에서 `document.body.scrollWidth === window.innerWidth`(가로 스크롤 없음) 확인.
- [ ] 라이트/다크 양쪽에서 트리 하이라이트·비활성 배지 대비 확인.
- [ ] 트리 노드 안에 `<button>` 중첩이 없는지 `browser_console_messages`로 hydration 에러 0건 확인(ROADMAP_MVP Task 017 / ROADMAP_MASTER Task 032에서 실제 발생했던 회귀 지점).
- [ ] 키보드만으로 트리 노드 포커스 → Enter 선택 → 우측 패널 이동이 가능한지 확인.
- [ ] `browser_network_requests`로 팀 전환 시 RPC가 반복 호출되지 않는지 확인(서버에서 1회 조회 후 클라이언트 필터링).
- [ ] 임시 계정 삭제 후 잔존 0건 확인, `npm run check-all` 통과.

---

### Task 054: 헤더 "조직도" 팝업 트리거 구현 (전 사용자, 조회 전용)

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

- [ ] `components/erp/erp-header.tsx` 수정 — 우측 `flex justify-end` 컨테이너 안, `{!hasEnvVars ? <EnvVarWarning /> : <Suspense><AuthButton /></Suspense>}` **바로 앞**에 `<OrgChartPopupTrigger dict={dict} />`를 추가한다. **이 컴포넌트가 이 파일에서 유일하게 새로 추가되는 부분이며, 로고/타이틀 중앙 정렬/기존 계정 영역 로직은 그대로 둔다**(변경 금지 목록 예외 조항 재확인).
  - [ ] `hasEnvVars`가 false인 튜토리얼 모드에서도 이 버튼이 자연스럽게 동작하는지(또는 숨겨지는 게 맞는지) 확인하고, 숨기는 게 맞다면 `EnvVarWarning`과 같은 조건부로 처리한다.
- [ ] `components/erp/org/org-chart-popup.tsx` — Client Component. `Dialog` + `DialogTrigger`(버튼, 라벨은 `dict.erp.header.orgChartTriggerLabel`) + `DialogContent`(넓게, 예: `sm:max-w-3xl`). `onOpenChange`로 열릴 때만 `getOrgChartPopupDataAction()`을 호출해 지연 로딩한다(페이지 진입 시마다 미리 불러오지 않는다 — 헤더는 모든 `/erp/*` 페이지에서 렌더링되므로 불필요한 요청을 피한다).
  - [ ] 로딩 중에는 `Skeleton`으로 트리 자리를 채운다.
  - [ ] 데이터가 비어 있으면(그룹사 0건 등, Task 046 이전 상태) 간단한 빈 상태 문구를 보여준다.
- [ ] `components/erp/org/org-chart-popup-tree.tsx` — Task 053의 `OrgTreeNode`/`buildOrgTree` 조립 로직(`lib/erp/org/tree.ts`)은 그대로 재사용하되, **렌더링 컴포넌트는 관리 화면의 `OrgLeaderPanel`/`OrgChildrenPanel`을 재사용하지 않고 이 파일 안에서 단순하게 새로 만든다**(아키텍처 사전 결정 사항 표 — 편집 슬롯을 조건부로 숨기는 방식보다 단순). `TreeView`(`components/ui/tree-view.tsx`)는 그대로 재사용해도 된다.
  - [ ] 트리 노드 선택 시 우측(또는 좁은 화면에서는 트리 아래)에 **읽기 전용 요약**만 표시: 리더 이름 + 직책(있으면), 팀이면 구성원 이름 목록(역할 배지만, `phone_number`/`bio`/`email` 없음).
  - [ ] Task 053에서 정한 노드 키 포맷(`"team:<uuid>"` 등)을 그대로 재사용한다.
  - [ ] **이 파일 어디에도 등록/수정/삭제/리더 지정 버튼이 없다** — 코드 리뷰 시 최우선 확인 항목(PRD 8.3).
- [ ] `lib/erp/org/actions.ts`의 `getOrgChartPopupDataAction()`을 호출하는 유일한 지점이 이 컴포넌트여야 한다(다른 화면에서 재사용할 필요가 생기면 그때 공용화).
- [ ] `Dictionary` 타입(`lib/i18n/dictionaries/types.ts`)의 `erp.header`에 `orgChartTriggerLabel: string`과 `orgChartTriggerAriaLabel: string`을 추가하고, `ko`("조직도" / "조직도 보기") / `en`("Org Chart" / "View org chart") / `ja`("組織図" / "組織図を見る") / `zh`("组织架构" / "查看组织架构") 4개 파일을 전부 갱신한다(`npm run check-all`의 typecheck가 누락된 언어 파일을 잡아준다 — `Dictionary` 타입에 필수 필드로 추가하면 자동 검증됨).
- [ ] 팝업 안에서 언어를 바꿔도(만약 팝업이 열린 채로 언어 스위처를 쓸 수 있다면) 깨지지 않는지 확인 — 팝업이 열린 상태에서 `router.refresh()`가 일어나도 Dialog 상태는 클라이언트 로컬 상태라 유지되는지 확인.

**수락 기준**

- [ ] `role`과 무관하게(user/admin/superadmin 전부) 로그인 상태라면 헤더에 "조직도" 버튼이 항상 보인다.
- [ ] 버튼 클릭 → 팝업이 열리고 트리가 조회 전용으로 표시된다. **팝업 안 어디에도 편집 버튼이 없다.**
- [ ] `role='user'` 계정도 팝업에서 다른 팀 동료의 이름·소속을 조회할 수 있다.
- [ ] `/erp/*`의 다른 모든 페이지에서 헤더가 기존과 동일하게 렌더링된다(회귀 없음).
- [ ] 언어를 en/ja/zh로 바꾸면 버튼 라벨이 각 언어로 표시된다.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 1개(user)로 검증 후 즉시 삭제. **이 Task가 이 로드맵에서 유일하게 "일반 사용자가 조직도를 실제로 조회하는" 경로를 검증하는 지점이다.**

- [ ] user 계정으로 로그인 → `/erp` 진입 → 헤더에서 "조직도" 버튼 노출 확인(로그인 사용자 표시 바로 앞에 위치하는지 스크린샷으로 확인).
- [ ] 버튼 클릭 → 팝업 오픈 → 트리가 그룹사부터 펼쳐지는지 확인.
- [ ] **부서가 있는 부문과 부서 없이 직속된 팀이 팝업 트리에서도 함께 확인되는지** 확인(관리 화면과 동일 데이터).
- [ ] 팀 노드 선택 → 구성원 목록이 표시되고, 이 계정이 속하지 않은 다른 팀이어도 이름이 보이는지 확인(RPC 우회 실사용 검증, 관리 화면과 별개로 재검증).
- [ ] **팝업 전체에서 등록/수정/삭제/리더 지정 버튼이 단 하나도 없는지** DOM/스크린샷으로 확인.
- [ ] `/erp` 외 다른 페이지(`/erp/products`, `/erp/settings/profile` 등)로 이동해도 헤더와 "조직도" 버튼이 정상 렌더링되는지 확인(회귀).
- [ ] `/erp/admin/org`(관리 화면)에는 여전히 접근이 막히는지(Task 052에서 검증한 내용과 모순 없는지) 재확인.
- [ ] 언어 스위처로 en/ja/zh 전환 후 버튼 라벨이 바뀌는지 확인, ko로 복귀.
- [ ] 1440 / 390px 뷰포트에서 팝업이 정상 표시되는지 확인(390px에서 가로 스크롤 없음).
- [ ] `browser_console_messages` 에러 0건, `npm run check-all` 통과.
- [ ] 임시 계정 삭제 후 잔존 0건 확인.

---

### Task 055: 그룹사 / 법인 CRUD 및 부문↔법인 매핑 관리 UI (superadmin 전용)

**목표**: 비어 있던 상위 2개 레벨을 화면에서 관리할 수 있게 하고, 부문이 어느 법인에 속하는지를 UI로 바꿀 수 있게 한다.

**관련 파일**

- `components/erp/org/org-company-form-dialog.tsx` (신규 — 법인 등록/수정)
- `components/erp/org/org-group-form-dialog.tsx` (신규 — 그룹사 이름 수정 전용)
- `components/erp/org/org-division-mapping-dialog.tsx` (신규 — 부문 → 법인 이동)
- `components/erp/org/org-chart-view.tsx` (Task 053 — 편집 버튼 슬롯 추가)
- `lib/erp/org/actions.ts` (Task 050 — 액션 소비)
- `components/ui/{dialog,alert-dialog,select,input,textarea,switch,button}.tsx` (기존 재사용)

**구현 체크리스트**

- [ ] **`MasterFormSheet`/`MasterDeleteDialog`를 재사용하지 않는다** — `MasterEntityKey`/`MASTER_ENTITIES`에 강결합되어 있어 조직 엔티티를 넣으려면 마스터 레지스트리를 오염시켜야 한다(아키텍처 사전 결정 사항 참고). `components/ui/dialog.tsx` 기반으로 조직 전용 폼을 만들되, **폼 구성과 문구는 마스터 폼과 동일한 톤**을 유지한다.
- [ ] 그룹사 노드 선택 시 — `superadmin`에게만 "그룹사 수정" 버튼 노출. 필드: 코드(읽기 전용) / 그룹사명(필수) / 사용여부 / 비고. **등록·삭제 버튼은 제공하지 않는다**(PRD 6.2 싱글턴).
- [ ] 그룹사 노드 선택 시 — `superadmin`에게 "+ 법인 등록" 버튼 노출. 필드: 코드(등록 시 "자동 생성(OC####)" 안내, 수정 시 편집 가능) / 법인명(필수) / 상위 그룹사(읽기 전용) / 사용여부 / 정렬순서 / 비고.
- [ ] 법인 노드 선택 시 — "법인 수정" / "법인 삭제" / 정렬 위·아래 버튼 노출(`superadmin` 전용). 삭제는 하위 부문 매핑이 있으면 FK `restrict`로 거부되고 **"하위 데이터가 있어 삭제할 수 없습니다. 대신 사용여부를 꺼주세요."** 안내로 전환한다.
- [ ] 법인 노드 선택 시 — "부문 연결 관리" 버튼. 다이얼로그에서 (a) 아직 매핑되지 않은 부문(`getUnmappedDivisions()`) 추가, (b) 이 법인 소속 부문을 다른 법인으로 이동을 처리한다. `organizations` 자체는 읽기만 하고 **이름 수정/생성/삭제 UI는 제공하지 않는다**(PRD 2장 범위 제외).
- [ ] 부문 노드 선택 시 — 부문 자체의 편집 버튼은 없고, "소속 법인 변경"만 제공(`superadmin`). **부서 등록/관리는 Task 056에서 별도 버튼으로 추가된다(이 Task 범위 아님).**
- [ ] 권한에 따른 버튼 노출은 서버에서 내려준 `currentUserRole`과 `ORG_LEVELS`의 `editableBy` 메타로 판정한다. **버튼 숨김은 UX일 뿐이고 실제 차단은 Server Action 가드 + RLS**라는 이중 방어를 주석으로 명시한다.
- [ ] 다이얼로그 폼 상태는 `useEffect`로 초기화하지 않는다 — `open`일 때만 필드 서브컴포넌트를 마운트해 `useState` 초기값으로 계산한다(ROADMAP_MASTER Task 032에서 `react-hooks/set-state-in-effect` 린트로 확립한 해법).
- [ ] 코드 직접 수정 시 `isValidOrgCode()`(Task 044)로 클라이언트 1차 검증 + 서버 unique 위반 메시지 표시(이중 방어).
- [ ] 저장/삭제 후 토스트로 결과를 알리고(등록 시 채번된 코드 포함), 트리가 즉시 갱신되는지 확인한다(`revalidatePath("/erp/admin/org")`).

**수락 기준**

- [ ] `superadmin`이 법인 등록 → 코드가 `OC####`로 자동 채번되고 트리에 즉시 반영된다.
- [ ] `superadmin`이 부문을 다른 법인으로 이동시키면 트리 구조가 그에 맞게 바뀌고, `organizations` 테이블 자체는 변경되지 않는다.
- [ ] `role='admin'`(superadmin 아님) 계정에게는 그룹사/법인/매핑 편집 버튼이 보이지 않고, 직접 액션을 호출해도 차단된다.
- [ ] 그룹사에는 "등록" 버튼이 아예 존재하지 않는다.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 2개(superadmin 1 / admin 1)로 검증 후 즉시 삭제

- [ ] superadmin으로 법인 2건 등록 → 토스트에 채번 코드(`OC####`) 표시 및 트리 반영 확인.
- [ ] 법인명 미입력 저장 시도 → 인라인 에러 + `aria-invalid` 확인(요청 자체가 발생하지 않는 클라이언트 검증).
- [ ] 코드를 잘못된 형식(`OC01`)으로 수정 → 클라이언트 검증 에러 확인. 다른 법인의 코드로 수정 → 서버 unique 에러 문구 확인.
- [ ] 새 법인에 미매핑 부문을 연결 → 트리에서 부문이 해당 법인 하위로 이동하는지 확인. 이어서 원래 법인으로 되돌리고 `execute_sql`로 `organizations` 행이 전혀 변경되지 않았음(`updated`/체크섬 동일)을 확인.
- [ ] 하위 부문이 매핑된 법인 삭제 시도 → 거부 + "사용여부 끄기" 안내 확인. 하위가 없는 법인 삭제 → 트리에서 사라지고 `execute_sql`로 DB에서도 삭제 확인.
- [ ] 그룹사 수정(이름 변경) 후 트리 루트 라벨이 바뀌는지 확인. **그룹사 "등록" 버튼이 화면 어디에도 없는지 확인.**
- [ ] admin 계정으로 동일 화면 진입 → 편집 버튼 미노출 확인. (가능하면 임시 디버그 경로 없이) 액션 차단은 Task 050에서 이미 검증했음을 참조로 기록.
- [ ] 1440 / 768 / 390px 3개 뷰포트에서 다이얼로그가 정상 표시되는지 확인.
- [ ] `browser_console_messages` 에러 0건, `npm run check-all` 통과.
- [ ] 테스트 데이터·계정 삭제 후 잔존 0건 확인(Task 046의 초기 3건은 유지).

---

### Task 056: 부서 CRUD 및 부서 ↔ 팀 소속 관리 UI (부문 스코프 admin)

**목표**: "있을 수도 없을 수도 있는" 부서를 화면에서 만들고, 어느 팀을 그 부서에 넣을지(또는 부문 직속으로 되돌릴지)를 관리할 수 있게 한다. **그룹사·법인과 달리 이 화면은 `admin`도 자기 부문 범위 안에서 사용할 수 있어야 한다.**

**관련 파일**

- `components/erp/org/org-section-form-dialog.tsx` (신규 — 부서 등록/수정)
- `components/erp/org/org-section-team-dialog.tsx` (신규 — 팀 ↔ 부서 소속 변경)
- `components/erp/org/org-chart-view.tsx` (Task 053 — 편집 버튼 슬롯 추가)
- `lib/erp/org/actions.ts` (Task 050 — `createOrgSectionAction` 등 소비)
- `components/ui/{dialog,alert-dialog,select,input,switch,button}.tsx` (기존 재사용)

**구현 체크리스트**

- [ ] 부문 노드 선택 시 — `is_admin()`이면서 그 부문이 `current_organization_id()`와 일치하거나 `superadmin`인 사용자에게 "+ 부서 등록" 버튼 노출. 필드: 코드(자동 생성 `OS####` 안내) / 부서명(필수) / 상위 부문(읽기 전용) / 사용여부 / 정렬순서 / 비고.
- [ ] 부문 노드의 하위 목록(`OrgChildrenPanel`)에 **부서 카드와 부문 직속 팀 카드가 함께 나열**되고, 부서 카드에는 "관리" 배지 또는 버튼으로 구분되도록 한다(Task 053에서 이미 같은 레벨 표시는 되어 있으니, 이 Task는 그 위에 편집 버튼만 얹는다).
- [ ] 부서 노드 선택 시 — "부서 수정" / "부서 삭제" / 정렬 위·아래 버튼 노출(부문 스코프 admin 또는 superadmin). 삭제는 소속 팀이 있어도 **막지 않는다** — `org_section_teams`가 `on delete cascade`라 부서를 지우면 소속 팀들이 자동으로 부문 직속으로 돌아간다(PRD 5.5, Task 047). 삭제 확인 다이얼로그에 **"이 부서를 삭제하면 소속 팀 N개가 부문 직속으로 바뀝니다"**를 명시한다(마스터 도메인의 "하위 있으면 삭제 불가"와 다른 정책이므로 반드시 문구로 안내).
- [ ] 부서 노드 선택 시 — "팀 소속 관리" 버튼. 다이얼로그에서 (a) 이 부문 안에서 아직 어떤 부서에도 속하지 않은 팀(`getUnmappedTeamsInDivision()`) 추가, (b) 이미 이 부서 소속인 팀을 부문 직속으로 되돌리거나 같은 부문의 다른 부서로 이동. **다른 부문 소속 팀은 후보 목록에 아예 나타나지 않는다**(트리거로도 막히지만 UI에서 먼저 걸러 사용자 혼란을 줄인다).
- [ ] 팀 노드 선택 시 — 팀 자체의 편집 버튼 없음(PRD 2장). "소속 부서: OO부서" 또는 "소속 부서: 없음(부문 직속)"만 읽기 전용으로 표시한다.
- [ ] 권한에 따른 버튼 노출은 `ORG_LEVELS.section.editableBy`("adminScoped")와 현재 사용자의 `current_organization_id` 일치 여부로 판정한다. **버튼 숨김은 UX일 뿐이고 실제 차단은 Server Action 가드 + RLS**라는 이중 방어를 주석으로 명시한다(Task 055와 동일 원칙).
- [ ] 다이얼로그 폼 상태는 `useEffect`로 초기화하지 않는다(Task 055와 동일 패턴).
- [ ] 코드 직접 수정 시 `isValidOrgCode()`(Task 044)로 클라이언트 1차 검증 + 서버 unique 위반 메시지 표시.
- [ ] 저장/삭제/소속 변경 후 토스트로 결과를 알리고, 트리가 즉시 갱신되는지 확인한다(`revalidatePath("/erp/admin/org")`).

**수락 기준**

- [ ] 부문 스코프 admin이 자기 부문에 부서를 등록하면 코드가 `OS####`로 자동 채번되고 트리에 즉시 반영된다.
- [ ] admin이 팀을 부서에 배정하면 트리에서 그 팀이 부서 하위로 이동하고, 배정을 해제하면 다시 부문 직속으로 돌아온다. **이 과정에서 `departments` 테이블 자체는 전혀 변경되지 않는다**(execute_sql로 대조).
- [ ] 다른 부문 소속 admin은 이 부문의 부서를 관리할 수 없다(버튼 미노출 + 액션 차단).
- [ ] 부서 삭제 시 "소속 팀 N개가 부문 직속으로 바뀝니다" 안내가 표시되고, 실제로 그렇게 동작한다.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 2개(admin 1 / superadmin 1)로 검증 후 즉시 삭제

- [ ] admin(자기 부문)으로 부서 1건 등록 → 토스트에 채번 코드(`OS####`) 표시 및 트리 반영 확인.
- [ ] "팀 소속 관리"로 미매핑 팀 1개를 이 부서에 배정 → 트리에서 해당 팀이 부서 하위로 이동 확인 → `execute_sql`로 `departments` 행 변경 없음(체크섬 동일) 확인.
- [ ] 같은 팀을 다시 "부문 직속으로 되돌리기" → 트리에서 부문 직속으로 복귀 확인.
- [ ] 이미 다른 부서 소속인 팀을 또 다른 부서 후보 목록에서 찾으면 **나타나지 않는지**(또는 "이관" 동작으로 명확히 구분되는지) 확인.
- [ ] 부서 삭제 → 확인 다이얼로그에 소속 팀 수 안내 → 삭제 후 그 팀들이 부문 직속으로 표시되는지 확인.
- [ ] superadmin으로 진입 → 모든 부문의 부서를 관리할 수 있는지 확인.
- [ ] (가능하면 임시로 다른 부문을 만들어) 그 부문 소속 admin 계정으로 원래 부문의 부서 관리 시도 → 버튼 미노출 및 액션 차단 확인 후 임시 부문 정리.
- [ ] 부서명 미입력 저장 시도 → 인라인 에러 확인.
- [ ] 1440 / 390px 뷰포트에서 다이얼로그가 정상 표시되는지 확인.
- [ ] `browser_console_messages` 에러 0건, `npm run check-all` 통과.
- [ ] 테스트 데이터·계정 삭제 후 잔존 0건 확인(Task 058의 데모 부서/매핑은 이 Task보다 나중에 들어가므로 이 시점엔 영향 없음).

---

### Task 057: 조직별 리더 지정 / 해제 UI (5개 레벨 공용, 관리 화면 전용)

**목표**: 5개 레벨 전부에서 동일한 UI로 리더를 지정·교체·해제할 수 있게 하고, PRD 3.1의 레벨별 권한 차이를 화면에서도 정확히 반영한다. **헤더 팝업(Task 054)에는 이 기능이 없다 — 리더 지정은 관리 화면에서만 가능하다.**

**관련 파일**

- `components/erp/org/org-leader-dialog.tsx` (신규 — 리더 지정 다이얼로그, 5레벨 공용)
- `components/erp/org/org-leader-panel.tsx` (Task 053 — 지정/해제 버튼 추가)
- `lib/erp/org/actions.ts` (Task 050 — `setOrgLeaderAction`/`clearOrgLeaderAction`)
- `lib/erp/org/levels.ts` (Task 044 — `leaderEditableBy`, 레벨별 기본 직책명)
- `components/ui/{dialog,combobox,command,input,avatar,alert-dialog}.tsx` (기존 재사용)

**구현 체크리스트**

- [ ] 리더 패널의 "지정" / "변경" / "해제" 버튼은 `ORG_LEVELS[level].leaderEditableBy`와 현재 사용자 역할로 노출 여부를 판정한다 — **팀·부서는 `admin` 이상, 그 외 3개 레벨(그룹사/법인/부문)은 `superadmin`만.**
  - [ ] **admin의 팀·부서 리더 지정은 "자기 부문 소속"으로만 허용**되지만, `current_organization_id()` 판정은 DB가 최종적으로 한다. 화면은 버튼을 노출하되 서버가 거부하면 "권한이 없습니다." 토스트로 안내한다(현재 실데이터는 부문이 1건뿐이라 이 분기가 실제로 갈라지지 않는다는 점도 주석에 남긴다).
- [ ] 리더 후보 선택은 `combobox`(검색형) — 후보 목록은 `getOrgChartMembers()` 결과를 재사용한다(`profiles` 직접 조회 금지). 63명 규모라 클라이언트 필터링으로 충분.
  - [ ] **같은 조직 소속 구성원을 목록 상단에 우선 노출**하고, 그 외 전체 구성원도 선택 가능하게 한다 — 겸직/파견을 DB에서 강제하지 않기로 한 PRD 5.6 결정을 UX로 유도하는 부분이다. 부서 리더 지정 시에는 그 부서에 배정된 팀들의 구성원을 우선 노출한다.
  - [ ] 비활성(`is_active = false`) 구성원은 목록에서 제외한다.
- [ ] 직책명(`title`) 입력 — 자유 입력 텍스트 필드에 레벨별 기본값(그룹사 "회장님" / 법인 "대표이사" / 부문 "부문장" / **부서 "부서장"** / 팀 "팀장")을 초기값으로 채운다(PRD 5.6, Task 043 ⑤ 확정값).
- [ ] 리더 교체는 이력 없이 기존 행을 UPDATE(또는 삭제 후 재등록)한다(PRD 5.6). 이력 UI는 만들지 않는다.
- [ ] 해제는 `AlertDialog`로 확인 후 `clearOrgLeaderAction` 호출.
- [ ] 동시성/중복 대비 — partial unique index 위반(`23505`)이 오면 "해당 조직에는 이미 리더가 지정되어 있습니다. 새로고침 후 다시 시도해주세요."로 안내한다.
- [ ] 저장 후 리더 패널과 하위 조직 카드(리더 이름 표시)가 함께 갱신되는지 확인한다. **헤더 팝업(Task 054)은 지연 로딩이라, 관리 화면에서 리더를 바꾼 직후 팝업을 다시 열면 최신 값이 보이는지도 함께 확인한다**(팝업이 별도 캐시를 갖지 않는지).

**수락 기준**

- [ ] 5개 레벨 전부에서 리더 지정 → 표시 → 교체 → 해제가 동작한다.
- [ ] `superadmin`은 5개 레벨 전부, `admin`은 팀·부서 레벨만 편집 버튼이 보인다. `user`는 애초에 이 화면(`/erp/admin/org`) 자체에 접근할 수 없다.
- [ ] 리더 지정 결과가 새로고침 후에도 유지되고, `execute_sql`로 `org_unit_leaders`에 정확히 1행(해당 레벨 컬럼만 채워짐)으로 저장된다.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 2개(superadmin / admin)로 검증 후 즉시 삭제. **`user` 계정 검증은 불필요하다 — 이 화면 자체에 접근할 수 없음을 Task 052에서 이미 검증했다.**

- [ ] superadmin으로 그룹사/법인/부문/**부서**/팀 5개 레벨에 각각 리더 지정 → 리더 패널 표시 확인 → `execute_sql`로 `num_nonnulls = 1`인 5개 행 확인.
- [ ] 같은 노드의 리더를 다른 사람으로 교체 → 행이 늘지 않고 UPDATE되는지 확인(`count(*)` 변화 없음).
- [ ] 리더 해제 → 패널이 "미지정"으로 바뀌고 DB 행이 삭제되는지 확인.
- [ ] admin 계정으로 진입 → 팀·부서 노드에만 "지정" 버튼이 보이고 그룹사/법인/부문에는 보이지 않는지 확인. 팀·부서 리더 지정 성공 확인.
- [ ] 콤보박스 검색 → 이름 일부 입력 시 후보가 필터링되고, 비활성 구성원이 목록에 없는지 확인.
- [ ] 팀 노드에서 콤보박스를 열었을 때 **해당 팀 소속 구성원이 상단에 우선 노출**되는지 확인. 부서 노드에서는 그 부서 소속 팀들의 구성원이 우선 노출되는지 확인.
- [ ] 직책명 기본값이 레벨별로 다르게 채워지는지 5개 레벨 순회 확인(부서 = "부서장" 포함).
- [ ] superadmin으로 팀 리더를 새로 지정한 직후, 헤더 "조직도" 팝업을 열어 최신 리더가 반영되는지 확인.
- [ ] 1440 / 390px 뷰포트에서 다이얼로그·콤보박스가 정상 동작하는지 확인.
- [ ] `browser_console_messages` 에러 0건, `npm run check-all` 통과.
- [ ] 테스트로 지정한 리더 행과 임시 계정 삭제 후 잔존 0건 확인.

---

## Phase 11: 더미 데이터 시드 및 통합 검증

> PRD 9장 / 12장.

### Task 058: 조직도 더미 데이터 시드

> Task 043 ①②③④ 확정 완료 — 그룹사 "OO그룹" / 법인 "OO 법인"(둘 다 가안 유지), 부서는 "개발부서" 1건 + 팀 3개 편입, **초기 리더는 전체 미지정으로 시작**(아래 체크리스트가 이 결정을 반영해 리더 시드 항목이 삭제됨).

**목표**: 기존 실데이터(부문 1 / 팀 8 / 구성원 63)를 그대로 유지한 채, 데모·QA에 필요한 **부서 예시**를 채운다. **그룹사·법인·매핑은 Task 046에서 이미 들어갔고, 리더는 Task 043 ④ 확정에 따라 이번 로드맵에서 시드하지 않으므로(전체 미지정 유지) 이 Task는 부서 데이터만 다룬다.**

**관련 파일**

- Supabase 마이그레이션(MCP) — `seed_org_sections_and_leaders`
- `docs/prd/PRD_ORG.md` 9장

**구현 체크리스트**

- [ ] **부서(`org_sections`) 시드** — Task 043 ③ 확정값대로 "IT부문" 하위에 `OS0001` "개발부서" 1건 insert.
- [ ] **부서↔팀 매핑(`org_section_teams`) 시드** — 8개 팀 중 3개(`ERP시스템팀`/`Commerce시스템팀`/`IT기획팀`)만 위 부서에 매핑하고, **나머지 5개 팀은 매핑하지 않고 부문 직속으로 남긴다** — 이것이 "부서가 있을 수도 없을 수도 있다"를 실제로 증명하는 핵심 데이터다.
- [ ] 대상 팀 id는 `execute_sql`로 실제 이름을 조회해 매핑하고(하드코딩 금지), 조회한 id를 마이그레이션 주석에 함께 기록한다.
- [ ] **조직별 리더(`org_unit_leaders`) 시드는 하지 않는다** — Task 043 ④에서 "전체 미지정으로 시작"이 확정됐으므로, 그룹사/법인/부문/부서/팀 5개 레벨 전부 이 Task에서는 리더 행을 삽입하지 않는다. 리더 지정은 Task 057(관리 화면 리더 지정 UI) 완성 후 실사용자가 화면에서 직접 채운다.
- [ ] 그룹사·법인·매핑(`org_company_divisions`)은 **다시 넣지 않는다**(Task 046에서 이미 1건씩 존재). 중복 삽입 시 싱글턴/unique 제약으로 실패한다는 점을 주석에 남긴다.
- [ ] 시드를 되돌릴 수 있도록 롤백 SQL을 마이그레이션 주석에 남긴다.
- [ ] `profiles`/`departments`/`organizations`에 대한 UPDATE가 없는지 확인 — **부서 배정은 전부 `org_section_teams`에만 기록된다.**

**수락 기준**

- [ ] `org_sections` 1건, `org_section_teams` 3건이 존재한다.
- [ ] `org_unit_leaders`는 이 Task로 인해 신규 행이 생기지 않는다(0건 유지) — 전체 미지정 결정이 실제로 지켜졌는지 확인.
- [ ] 기존 `organizations` 1건 / `departments` 8건 / `profiles` 63건의 값이 시드 전후 정확히 동일하다.
- [ ] 관리 화면과 헤더 팝업 양쪽에서 5개 레벨 전부 리더가 "미지정"으로 표시되고, 부서 소속 팀과 부문 직속 팀이 함께 확인된다.

**테스트 체크리스트 (Playwright MCP + execute_sql)**

- [ ] `execute_sql`로 `org_sections`/`org_section_teams` 행 수를 확인하고, `org_unit_leaders`가 이 시드로 인해 늘지 않았음을(0건) 확인.
- [ ] 시드 전후 `organizations`/`departments`/`profiles` 체크섬 동일 확인.
- [ ] 임시 관리자 계정으로 `/erp/admin/org` 진입 → 그룹사/법인/부문/부서 패널이 전부 "미지정"으로 표시되는지 확인.
- [ ] 임시 일반 사용자 계정으로 헤더 팝업을 열어 같은 "미지정" 상태와 부서 구성이 보이는지 확인.
- [ ] 8개 팀을 각각 선택해 전부 "미지정" 문구가 정상 표시되는지 확인.
- [ ] "개발부서" 아래 3개 팀과, 부문 직속으로 남은 5개 팀이 트리에서 동시에 확인되는지 스크린샷으로 검증.
- [ ] `browser_console_messages` 에러 0건, 임시 계정 삭제 후 잔존 0건 확인(시드 데이터는 유지).

---

### Task 059: 조직도 통합 검증 (PRD 12장 성공 기준)

**목표**: PRD 12장의 성공 기준을 하나씩 실제 시나리오로 재현해 통과 여부를 기록한다. **신규 기능 개발이 아니라 최종 검수다.**

**관련 파일**

- (검증 전용 — 코드 변경 없음. 결함 발견 시 해당 Task로 되돌려 수정하고 이 Task에는 재검증 결과만 기록)

**구현 체크리스트**

- [ ] **관리 화면 접근**: `/erp/admin/org`에서 그룹사 → 법인 → 부문 → (부서 있으면 부서 →) 팀 → 구성원까지 하나의 트리에서 펼침/접힘으로 탐색된다.
- [ ] **관리 화면 가드**: `role='user'` 계정으로 `/erp/admin/org`에 직접 URL로 접근하면 `/erp/forbidden`으로 이동한다.
- [ ] **헤더 팝업**: 헤더의 "조직도" 버튼이 `role`과 무관하게 로그인한 모든 사용자에게 노출되고, 클릭 시 팝업에 같은 계층 구조가 조회 전용으로 표시된다. 팝업 안에는 어떤 편집 버튼도 없다.
- [ ] **부서 선택성**: 같은 부문 안에서 부서가 있는 팀과 부서 없이 부문에 직속된 팀이 동시에 트리에 정상 표시된다(관리 화면·헤더 팝업 둘 다).
- [ ] **리더/하위 표시**: 관리 화면에서 아무 레벨 노드를 클릭해도 해당 조직의 리더(지정 시)와 하위 조직(또는 팀이면 구성원 목록)이 함께 표시된다.
- [ ] **스키마 무변경**: `profiles`/`departments`/`organizations` 테이블에 `ALTER TABLE`이 한 번도 실행되지 않았다 — `mcp__supabase__list_migrations`로 Task 043~058에서 적용한 마이그레이션 목록을 뽑고, 각 SQL 본문에 `alter table public.profiles` / `public.departments` / `public.organizations`가 없음을 전수 확인한다. 추가로 세 테이블의 `information_schema.columns` 스냅샷이 로드맵 착수 전과 동일한지 대조한다.
- [ ] **기존 데이터 무결**: 기존 `organizations`(1건) / `departments`(8건) / `profiles`(63건) 데이터가 신규 매핑 이후에도 정확히 그대로 조회된다(행 수·값 변화 없음).
- [ ] **RLS 우회 검증**: `role='user'` 계정으로 헤더 팝업에서 다른 팀 동료의 이름·소속이 조회되지만, 같은 계정으로 `profiles`를 직접 조회하면 여전히 본인 행만 보인다.
- [ ] **싱글턴 제약**: `org_groups`에 2번째 행 INSERT 시도가 DB 제약 위반으로 실패한다.
- [ ] **부서-팀 일관성 트리거**: 서로 다른 부문에 속한 부서와 팀을 억지로 연결(`org_section_teams`)하려 하면 트리거가 막는다.
- [ ] **헤더 회귀**: `erp-header.tsx` 변경 후에도 로그인/로그아웃, 언어 전환, 다른 모든 `/erp/*` 페이지의 헤더 렌더링에 회귀가 없다.
- [ ] 회귀 검증: ERP MVP·마스터 관리 기능(로그인, Menubar/트리 내비게이션, 관리자 3개 화면, 기준정보 5개 화면, 상품 화면)이 이번 변경으로 깨지지 않았는지 확인한다. 특히 **`next_master_code()`가 이번 로드맵에서 두 번(Task 045/047) `create or replace`되는 동안 기존 12종 채번에 영향을 주지 않았는지** 반드시 재확인한다.
- [ ] `mcp__supabase__get_advisors`(security + performance) 최종 확인 — 신규 경고가 있으면 원인·대응(또는 유지 근거)을 기록한다.
- [ ] 발견된 결함은 해당 Task로 되돌려 수정하고, 이 Task에는 재검증 결과만 기록한다.

**수락 기준**

- [ ] PRD 12장 성공 기준이 전부 실제 재현으로 통과했다.
- [ ] ERP MVP / 마스터 관리 기능에 회귀가 없다.
- [ ] `npm run check-all` + `npm run build` 통과.

**테스트 체크리스트 (Playwright MCP + execute_sql)** — 계정은 1개를 `user` → `admin` → `superadmin`으로 순차 승격시키는 방식을 권장한다(`getCurrentErpUser()`가 매 요청 `profiles.role`을 조회하므로 재로그인 없이 즉시 반영 — ROADMAP_MASTER Task 042 선례). `prevent_unauthorized_role_change` 때문에 superadmin 승격은 admin 경유 2단계로 진행한다.

- [ ] **시나리오 A (관리 화면 전 레벨 탐색)**: superadmin으로 `/erp/admin/org`에서 그룹사 → 법인 → 부문 → 부서 → 팀 순으로 클릭하며 각 단계의 리더 패널과 하위 목록을 확인하고, 팀에서 구성원 목록까지 도달.
- [ ] **시나리오 B (부서 선택성)**: "IT부문" 노드를 펼쳐 "개발부서"와 부문 직속 팀들이 같은 depth에 공존하는지 확인.
- [ ] **시나리오 C (헤더 팝업 — 일반 사용자)**: 계정을 `role='user'` 상태로 두고 `/erp`(또는 임의의 `/erp/*` 페이지)에서 헤더 "조직도" 버튼 클릭 → 팝업에서 다른 팀 구성원 이름이 보이는지 확인 → 같은 세션에서 `profiles` 직접 조회(임시 디버그 경로 또는 `execute_sql` 세션 시뮬레이션)로 본인 1건만 반환됨을 확인. → 이어서 `/erp/admin/org` URL 직접 접근 시 `/erp/forbidden` 확인.
- [ ] **시나리오 D (권한 분기)**: `role='admin'`으로 승격 → 관리 화면 접근은 성공하되 팀·부서 리더 지정 및 부서 CRUD만 가능하고 그룹사/법인/부문 편집 버튼이 없는지 확인 → `superadmin`으로 재승격 후 전부 가능해지는지 확인.
- [ ] **시나리오 E (스키마 무변경 증명)**: `list_migrations` + 각 마이그레이션 SQL 본문 검사로 `profiles`/`departments`/`organizations` DDL 0건 확인. 세 테이블 컬럼 목록과 행 수를 로드맵 착수 전 값(`organizations` 1 / `departments` 8 / `profiles` 63)과 대조.
- [ ] **시나리오 F (제약 검증)**: `execute_sql`로 `org_groups` 2번째 행 insert 시도 → `23505` 확인. 다른 부문의 부서-팀을 `org_section_teams`에 연결 시도 → 트리거 예외 확인.
- [ ] **시나리오 G (반응형/테마)**: `/erp/admin/org`와 헤더 팝업 각각을 1440px 라이트 / 390px 다크로 스크린샷 확인, 768px 스팟 체크.
- [ ] **시나리오 H (회귀)**: `/erp/admin/{users,menus,permissions}`, `/erp/master/{companies,brands,item-categories,colors,sizes}`, `/erp/products`, `/erp/settings` 진입 및 기본 렌더링(헤더 포함) 확인. 마스터 화면에서 신규 등록 1건을 해 채번이 정상 동작하는지 확인 후 삭제·시퀀스 원복.
- [ ] `browser_console_messages`로 전 시나리오 콘솔 에러 0건 확인.
- [ ] 테스트 계정·데이터 삭제 후 `execute_sql`로 잔존 0건 확인(Task 046/058의 초기 데이터는 유지).

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
   │                                  └─ Task 058 (더미 데이터 시드 — 부서만, 리더는 전체 미지정 유지)
   │                                       └─ Task 059 (통합 검증)
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

| Phase                                 | Task 범위    | 상태    |
| ------------------------------------- | ------------ | ------- |
| **Phase 8 — 조직 데이터 모델 구축**   | Task 043~050 | ⬜ 대기 |
| **Phase 9 — 메뉴 등록 / 관리 라우트** | Task 051~052 | ⬜ 대기 |
| **Phase 10 — 조직도 화면 구현**       | Task 053~057 | ⬜ 대기 |
| **Phase 11 — 시드 및 통합 검증**      | Task 058~059 | ⬜ 대기 |

### 사용자 확인 완료 항목 (2026-08-17 확정)

| 항목                                    | 관련 Task      | 확정 결과                                                                                                    | 상태    |
| --------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------- | ------- |
| ① 그룹사 실제 이름                      | 043 → 046, 058 | "OO그룹"(가안 그대로 채택)                                                                                     | ✅ 확정 |
| ② 법인 실제 이름                        | 043 → 046, 058 | "OO 법인"(가안 그대로 채택)                                                                                    | ✅ 확정 |
| ③ 부서 구성(부서명, 소속 팀)            | 043 → 058      | 부서 1건 생성 — "개발부서"에 `ERP시스템팀`/`Commerce시스템팀`/`IT기획팀` 3개 편입, 나머지 5개 팀은 부문 직속 | ✅ 확정 |
| ④ 초기 리더 지정자 / 팀 리더 지정 개수  | 043 → 058      | **전체 미지정으로 시작** — 5개 레벨 전부 리더를 시드하지 않고 관리 화면에서 직접 지정하도록 비워둠            | ✅ 확정 |
| ⑤ 레벨별 기본 직책명                    | 043 → 044, 057 | PRD 제안값 그대로 — 회장님 / 대표이사 / 부문장 / **부서장** / 팀장                                            | ✅ 확정 |

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
