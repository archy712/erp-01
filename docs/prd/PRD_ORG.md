# 조직도 관리 시스템 PRD

> 이 문서는 사내 ERP 시스템에 "그룹사(고정) → 법인 → 부문 → **부서(있을 수도 없을 수도 있음)** → 팀 → 일반 직원" 조직도를 도입하기 위한 PRD다. 조직도는 클릭한 노드의 "장(長)"(회장님/대표이사/부문장/**부서장**/팀장)과 하위 조직을 함께 펼쳐 보여주는 트리 UI로 구현한다. **기존 `profiles`(구성원)·`departments`(팀)·`organizations`(부문) 테이블은 구조를 변경하지 않고 그대로 재사용**하며, 부족한 계층은 신규 테이블로 보강한다.

---

## 1. 개요 및 목표

### 1.1 배경

- 사용자가 원하는 조직도는 "그룹사(고정) → 법인 → 부문 → 팀 → 일반 직원" 5단계였으나, 검토 과정에서 **"부문과 팀 사이에 '부서'라는 계층이 추가로 있을 수 있다"**는 요구가 확인됐다. 부서는 모든 부문에 항상 있는 게 아니라 **있을 수도 있고 없을 수도 있는 선택적(optional) 계층**이다 — 어떤 부문은 팀이 바로 붙고, 어떤 부문은 부서로 한 번 더 묶인 뒤 팀이 붙는다.
- DB를 조사한 결과 이 회사에는 이미 조직 관련 실데이터가 존재한다.
  - `organizations` — 1건, `name = "IT부문"`. `departments.organization_id`가 이 테이블을 참조한다.
  - `departments` — 8건(`ERP시스템팀`, `IT기획팀`, `보안 운영지원팀` 등 실제 팀명), "팀" 레벨. **전부 `organizations`(부문)에 직접 연결되어 있고, 지금 이 8개 팀은 어떤 "부서" 소속도 아니다.**
  - `profiles` — 63건, `department_id`로 `departments`에 연결된 "구성원"(사람) 레벨.
  - 즉 지금 실데이터는 이미 **"부문(1건) → 팀(8건, 부서 없이 부문 직속) → 구성원(63건)"** 구조로 채워져 있다. 그룹사·법인·부서 3단계가 비어 있고, 그중 부서는 애초에 "없어도 되는" 레벨이라 지금 상태(0건)가 곧 유효한 상태다.

> **⚠️ 이름 충돌 주의**: 기존 테이블 `departments`는 이 문서와 코드 전체에서 **"팀"**을 가리킨다(4.1절). 이번에 새로 추가하는 개념 **"부서"는 영어로도 흔히 "department"로 옮기는 단어지만, 이 문서와 실제 DB/코드 어디에서도 `department`라는 이름을 재사용하지 않는다** — 새 개념은 항상 **"부서" / `org_sections` / `section`**으로만 부른다. 기존 `departments`(팀)와 신규 "부서"가 이름만 보면 완전히 헷갈리는 두 개념이므로, 구현 전체에서 이 구분을 엄격히 지킨다.

- 이 `organizations`/`departments`는 "마스터 관리"(법인~~상품) 도메인의 `companies`/`brands`와는 **완전히 다른 도메인**(주간업무일지 등을 다루는 기존 "weeklyplan" 스키마)이다. 이름이 같은 `companies`("법인 1"~~"법인 10", 더미 데이터, 상품 마스터 축)와 조직도의 "법인"을 혼동하면 안 되므로, 조직도용 법인은 **별도 신규 테이블**로 만든다(4.4절 근거 참고).
- 사용자 요청에 따라 **`profiles`/`departments`/`organizations`는 컬럼조차 추가하지 않고 원래 구조 그대로 사용**하며, 부족한 부분(그룹사/법인/부서/조직별 리더/부서-팀 소속)은 전부 신규 테이블로 보강한다.

### 1.2 목표

- 그룹사(고정 1건) → 법인 → 부문(`organizations` 재해석) → **부서(선택, 신규)** → 팀(`departments`) → 구성원(`profiles`)을 하나의 트리 화면에서 탐색할 수 있게 한다. **부서가 없는 부문은 팀이 부문 바로 아래에 표시되고, 부서가 있는 부문은 부서 아래에 팀이 표시된다 — 같은 트리 안에서 두 형태가 공존할 수 있어야 한다.**
- 각 조직 노드를 클릭하면 그 조직의 장(회장님/대표이사/부문장/부서장/팀장)과 바로 아래 하위 조직(또는 팀 노드의 경우 소속 구성원 목록)이 함께 펼쳐진다.
- 그룹사(신규)·법인(신규)·부서(신규)는 관리자가 CRUD할 수 있게 하고, 부문(`organizations`)·팀(`departments`)은 **기존 스키마 그대로** 조회·연결만 한다.
- `profiles`/`departments`/`organizations` 테이블은 **한 컬럼도 추가하지 않는다.** 새로 필요한 정보(그룹사, 법인, 부서, 법인↔부문 연결, 부서↔팀 연결, 조직별 리더)는 전부 신규 테이블에 담는다.

### 1.3 이번 문서가 아닌 것 (비범위 요약, 상세는 11장)

- `organizations`/`departments`의 기존 용도(주간업무일지 등)에 대한 변경 — 이번 문서는 조회·연결만 추가한다.
- 인사발령(팀 이동, 조직 개편) 이력 관리, 결재선/보고라인 설정
- `profiles.role`(user/admin/superadmin) 체계 자체의 변경

---

## 2. 범위 (Scope)

| 구분                                                     | 포함 여부 | 비고                                                                            |
| -------------------------------------------------------- | --------- | ------------------------------------------------------------------------------- |
| 그룹사 관리 (신규, 고정 1건)                             | ✅        | 신규 테이블 + 조회 전용에 가까운 CRUD(이름 수정 정도)                           |
| 법인 관리 (신규)                                         | ✅        | 신규 테이블, Master 도메인 CRUD 패턴 재사용                                     |
| 부문(`organizations`) ↔ 법인 연결                        | ✅        | 신규 매핑 테이블. `organizations` 자체는 변경 없음                              |
| **부서 관리 (신규, 선택적 레벨)**                        | ✅        | 신규 테이블. 부문 하위에 0개 이상 생성 가능                                     |
| **부서(`org_sections`) ↔ 팀(`departments`) 소속 연결**   | ✅        | 신규 매핑 테이블. 매핑이 없으면 팀은 부문에 직접 소속(현재 8개 팀 전부 이 상태) |
| 조직별 리더(회장님/대표이사/부문장/**부서장**/팀장) 지정 | ✅        | 신규 테이블. `profiles`/`departments`/`organizations` 변경 없음                 |
| 통합 트리 화면                                           | ✅        | 신규 화면, `/erp` 메뉴에 신규 소분류로 등록. 부서 유무에 따라 가변 깊이         |
| 부문(`organizations`) 자체 CRUD (이름 등)                | ❌        | 기존 스키마·기존 용도 보존을 위해 이번 범위에서 제외(11장)                      |
| 팀(`departments`) 자체 CRUD                              | ❌        | 동일 사유로 제외. 소속 변경(부서↔팀, 부문↔법인)만 이번 범위                     |
| 인사발령 이력, 결재선                                    | ❌        | Out of scope                                                                    |

---

## 3. 사용자 및 권한 모델

`PRD_MVP.md`/`PRD_MASTER.md`와 동일하게 `profiles.role`(`user`/`admin`/`superadmin`)과 `is_admin()`/`is_superadmin()`을 재사용한다. 추가로 `departments`/`organizations`에 이미 걸려 있는 `current_organization_id()`(로그인 사용자가 속한 팀의 부문 id를 반환) 기반 스코프 규칙도 그대로 존중하고, **부서 레벨에도 동일한 스코프 규칙을 확장 적용**한다.

### 3.1 화면 접근

| 화면                                | 접근 가능 역할                                                                                   | 근거                                                                                                                 |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| 조직도 조회                         | 로그인 사용자 전체                                                                               | 사내 조직도는 전 구성원이 보는 것이 일반적 — `PRD_MASTER.md` 9장의 "SELECT는 로그인 사용자 전체 허용" 기조와 동일    |
| 그룹사/법인 등록·수정·삭제          | `superadmin`만                                                                                   | 그룹사·법인은 여러 부문에 걸치는 최상위 레벨이라 "내 부문만" 같은 스코프가 없다.                                     |
| 부문↔법인 매핑 변경                 | `superadmin`만                                                                                   | 위와 동일 근거                                                                                                       |
| **부서 등록·수정·삭제**             | `is_admin()`이면서 그 부서의 `organization_id = current_organization_id()`, 또는 `superadmin`    | 부서는 특정 부문에 종속되므로, 기존 `departments_update_admin` 정책과 동일한 "내 부문만" 스코프 규칙을 그대로 따른다 |
| **부서↔팀 소속 변경**               | 위와 동일(부서 기준 스코프)                                                                      | 팀을 어느 부서에 넣을지는 그 부서를 관리할 수 있는 사람이 결정                                                       |
| 조직별 리더 지정 — 팀 / 부서        | `is_admin()`이면서 그 팀/부서의 `organization_id = current_organization_id()`, 또는 `superadmin` | 기존 `departments_update_admin` 정책과 동일한 스코프 규칙을 그대로 따른다                                            |
| 조직별 리더 지정 — 부문/법인/그룹사 | `superadmin`만                                                                                   | 스코프 규칙이 없는 상위 레벨이므로                                                                                   |

### 3.2 조직도에서 노출되는 구성원 정보 — RLS 상 주의점 (중요)

`profiles`의 현재 SELECT 정책은 `profiles_select_own_or_admin`: **`id = auth.uid()` 이거나 `is_admin()`인 경우에만 다른 사람의 행을 볼 수 있다.** 즉 지금 그대로면 일반 사용자는 팀 노드를 펼쳐도 "본인 이름 하나만" 보이고 동료는 전혀 조회되지 않는다 — 조직도 기능 자체가 성립하지 않는다.

- **해결책으로 `profiles` 테이블의 RLS 정책을 느슨하게 바꾸는 건 채택하지 않는다.** RLS는 행(row) 단위 제어라 "이름/부서만 공개, 전화번호/이메일/자기소개는 비공개"처럼 컬럼 단위로 제한할 수 없다. `profiles` SELECT를 전체 공개로 바꾸면 `phone_number`/`bio`/`email` 같은 개인정보까지 전 직원에게 노출된다.
- **대신 `SECURITY DEFINER` 함수(RPC) 하나를 신규로 추가**해서, 조직도에 필요한 최소 컬럼(`id`, `name`, `department_id`, `avatar_key`, `role`, `is_active`)만 반환하게 한다. 이 함수는 `profiles` 테이블 자체나 그 RLS 정책을 전혀 건드리지 않는 **새 데이터베이스 객체**이므로, "기존 테이블 구조를 그대로 둔다"는 원칙을 satisfy한다.

```sql
create or replace function public.get_org_chart_members()
returns table (id uuid, name text, department_id uuid, avatar_key text, role text, is_active boolean)
language sql
security definer
set search_path = public
stable
as $$
  select id, name, department_id, avatar_key, role, is_active
  from public.profiles
$$;

revoke all on function public.get_org_chart_members() from public;
grant execute on function public.get_org_chart_members() to authenticated;
```

- `department_id`가 `null`인 행(특정 팀에 속하지 않는 임원 등)도 걸러내지 않고 그대로 반환한다. `org_unit_leaders`의 리더 이름은 이 함수 결과와 `profile_id`로 매칭하는데(6.3절), 그룹사·법인·부문·부서 리더로 지정될 만한 사람이 오히려 특정 팀 소속이 아닐 가능성이 높다 — 여기서 필터링하면 정작 리더 이름이 조직도에 표시되지 않는다. 팀별 구성원 목록처럼 팀 소속이 필요한 조회는 이 함수 결과를 호출부에서 `department_id`로 걸러 쓴다.
- 이 함수는 로그인 사용자(`authenticated`)라면 누구나 실행할 수 있지만, 반환 컬럼이 조직도에 필요한 값으로 고정되어 있어 `phone_number`/`bio`/`email`은 애초에 노출되지 않는다.

---

## 4. 조직 계층 구조 및 기존 테이블 재해석

### 4.1 레벨 매핑

| 조직도 레벨         | 실제 테이블     | 상태               | 비고                                                                                                                        |
| ------------------- | --------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| ① 그룹사(고정)      | `org_groups`    | **신규**           | 딱 1건만 존재하도록 DB 레벨에서 강제(6.2절)                                                                                 |
| ② 법인              | `org_companies` | **신규**           | Master 도메인의 `companies`(상품 마스터용 "법인")와는 별개 테이블                                                           |
| ③ 부문              | `organizations` | **기존, 재해석만** | 현재 1건(`"IT부문"`)을 그대로 "부문" 데이터로 사용. 스키마 변경 없음                                                        |
| ④ 부서 (**선택적**) | `org_sections`  | **신규**           | 부문 하위에 0개 이상. **팀은 부서가 있어도 없어도 존재할 수 있다**                                                          |
| ⑤ 팀                | `departments`   | **기존, 그대로**   | `organization_id`로 이미 부문에 연결. 부서 소속 여부는 별도 매핑(`org_section_teams`)으로 표현하며, 매핑이 없으면 부문 직속 |
| ⑥ 일반 직원         | `profiles`      | **기존, 그대로**   | `department_id`로 이미 팀에 연결되어 있음                                                                                   |

### 4.2 팀의 "실제 상위" 판정 규칙

부서가 선택적이기 때문에, 팀의 트리상 부모는 다음 순서로 정해진다.

1. `org_section_teams`에 이 팀(`department_id`)의 매핑 행이 있으면 → 그 행이 가리키는 **부서**가 부모.
2. 매핑이 없으면 → `departments.organization_id`가 가리키는 **부문**이 그대로 부모(지금 8개 팀 전부 이 경우).

즉 부서는 "팀의 상위를 부문에서 부서로 가로채는" 선택적 레이어다. 같은 부문 안에서도 일부 팀은 부서 소속, 일부 팀은 부문 직속으로 **공존**할 수 있다.

### 4.3 전체 계층 다이어그램

```
그룹사 (org_groups, 고정 1건)
└── 법인 (org_companies)
    └── 부문 (organizations)                        ← 재해석. org_company_divisions로 법인과 연결
        ├── 부서 (org_sections, 있을 수도 없을 수도)   ← 신규, 선택적
        │   └── 팀 (departments)                      ← org_section_teams로 이 부서에 연결된 팀만
        │       └── 구성원 (profiles)
        └── 팀 (departments)                          ← org_section_teams에 매핑이 없는 팀(부문 직속)
            └── 구성원 (profiles)

각 레벨(①~⑤)은 org_unit_leaders를 통해 "장(長)" 1명(profiles 참조)을 가질 수 있다.
```

- ③(부문)~⑥(구성원) 구간 중 "부문→팀(부서 없이 직속)"과 "팀→구성원"은 **기존 FK가 이미 정확히 그 방향으로 존재**하기 때문에 신규 매핑 테이블이 필요 없다. 신규 매핑이 필요한 지점은 "②법인 ↔ ③부문"과 "④부서 ↔ ⑤팀" 두 곳이다(`organizations`/`departments` 둘 다 상위를 가리키는 컬럼이 없기 때문).

### 4.4 왜 Master 도메인의 `companies`를 재사용하지 않는가

Master 도메인(`docs/prd/PRD_MASTER.md`)의 `companies`("법인 1"~"법인 10")는 상품이 속하는 **분류 축**(브랜드·상품을 소유하는 판매 법인 단위)이고, RLS·CRUD 화면·시드 데이터 전부 상품 마스터 정보 취급을 전제로 설계되어 있다. 조직도의 "법인"은 인사 조직 단위(부문/부서/팀/구성원을 소유)로 목적이 다르고, 소속 데이터(`organizations`/`departments`/`profiles`)도 완전히 다른 스키마 계열(옛 weeklyplan 도메인)에 있다. 두 "법인" 개념이 현실에서는 같은 회사를 가리킬 수 있지만, 이번 범위에서는 **도메인을 분리해 별개 테이블(`org_companies`)로 관리**하고, 두 개념을 잇는 작업(예: `org_companies.master_company_id → companies.id`)은 필요해지는 시점에 별도로 검토한다(12장 리스크).

---

## 5. 신규 테이블 설계

### 5.1 `org_groups` (그룹사)

| 컬럼                                                | 타입                            | 설명                                     |
| --------------------------------------------------- | ------------------------------- | ---------------------------------------- |
| `id`                                                | uuid, PK                        | —                                        |
| `code`                                              | text, unique                    | 자동 채번, `GRP` + 4자리 (예: `GRP0001`) |
| `name`                                              | text                            | 그룹사명                                 |
| `is_active`                                         | boolean, default true           | —                                        |
| `note`                                              | text, nullable                  | —                                        |
| `singleton`                                         | boolean, not null, default true | **딱 1건만 허용**하는 제약용 컬럼(6.2절) |
| `created_at`/`updated_at`/`created_by`/`updated_by` | —                               | Master 도메인과 동일 관례                |

### 5.2 `org_companies` (법인)

| 컬럼           | 타입                                 | 설명                                                                         |
| -------------- | ------------------------------------ | ---------------------------------------------------------------------------- |
| `id`           | uuid, PK                             | —                                                                            |
| `org_group_id` | uuid, FK → `org_groups.id`, not null | 상위 그룹사(사실상 항상 동일한 1건을 가리킴)                                 |
| `code`         | text, unique                         | 자동 채번, `OC` + 4자리 (예: `OC0001`) — Master `companies`의 `C####`와 구분 |
| `name`         | text                                 | 법인명                                                                       |
| `sort_order`   | integer, default 0                   | —                                                                            |
| `is_active`    | boolean, default true                | —                                                                            |
| `note`         | text, nullable                       | —                                                                            |
| 공통 컬럼      | —                                    | 5.1과 동일 관례                                                              |

### 5.3 `org_company_divisions` (법인 ↔ 부문 매핑)

`organizations`에는 상위를 가리키는 컬럼이 없으므로, "이 부문이 어느 법인 소속인가"를 별도 테이블로 표현한다. **`organizations`는 이 테이블 추가로 인해 전혀 변경되지 않는다.**

| 컬럼                      | 타입                                                | 설명                                                      |
| ------------------------- | --------------------------------------------------- | --------------------------------------------------------- |
| `id`                      | uuid, PK                                            | —                                                         |
| `org_company_id`          | uuid, FK → `org_companies.id`, not null             | 소속 법인                                                 |
| `organization_id`         | uuid, FK → `organizations.id`, not null, **unique** | 부문은 법인 정확히 1곳에만 소속                           |
| `sort_order`              | integer, default 0                                  | 같은 법인 안에서 부문 표시 순서                           |
| `created_at`/`created_by` | —                                                   | 변경 이력(부문은 자주 안 바뀌므로 updated 계열 생략 가능) |

> **마이그레이션 시 필수 작업**: 기존 `organizations` 1건("IT부문")은 법인 어디에도 연결되어 있지 않은 상태로 존재한다. 신규 테이블 배포 시 최소 1건의 `org_companies`(예: 임시 법인명)를 만들고 `org_company_divisions`에 "IT부문 → 그 법인" 매핑을 반드시 추가해야, 기존 부문 데이터가 트리에서 고아 노드가 되지 않는다(10장 더미 데이터 참고).

### 5.4 `org_sections` (부서, 선택적 레벨)

| 컬럼              | 타입                                    | 설명                                             |
| ----------------- | --------------------------------------- | ------------------------------------------------ |
| `id`              | uuid, PK                                | —                                                |
| `organization_id` | uuid, FK → `organizations.id`, not null | 소속 부문. **부서는 정확히 1개 부문에만 속한다** |
| `code`            | text, unique                            | 자동 채번, `OS` + 4자리 (예: `OS0001`)           |
| `name`            | text                                    | 부서명                                           |
| `sort_order`      | integer, default 0                      | —                                                |
| `is_active`       | boolean, default true                   | —                                                |
| `note`            | text, nullable                          | —                                                |
| 공통 컬럼         | —                                       | 5.1과 동일 관례                                  |

- 특정 부문에 부서 행이 **0건**이면, 그 부문의 모든 팀은 4.2절 규칙에 따라 부문에 직접 소속된 것으로 취급된다 — 이것이 "부서가 없을 수도 있다"의 실제 구현이다. 별도의 "부서 없음" 플래그나 더미 행이 필요 없다.

### 5.5 `org_section_teams` (부서 ↔ 팀 매핑, 선택적)

`departments`에는 상위(부서)를 가리키는 컬럼이 없으므로, "이 팀이 어느 부서 소속인가"를 별도 테이블로 표현한다. **`departments`는 이 테이블 추가로 인해 전혀 변경되지 않는다.**

| 컬럼                      | 타입                                              | 설명                                                 |
| ------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| `id`                      | uuid, PK                                          | —                                                    |
| `section_id`              | uuid, FK → `org_sections.id`, not null            | 소속 부서                                            |
| `department_id`           | uuid, FK → `departments.id`, not null, **unique** | 팀은 부서 정확히 1곳에만 소속(행이 없으면 부문 직속) |
| `sort_order`              | integer, default 0                                | 같은 부서 안에서 팀 표시 순서                        |
| `created_at`/`created_by` | —                                                 | 변경 이력                                            |

```sql
-- 부서와 팀이 같은 부문 소속인지 무결성 검증(둘 다 기존/신규 테이블을 참조만 하고 변경하지 않음)
create or replace function public.check_org_section_team_consistency()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_section_org_id uuid;
  v_department_org_id uuid;
begin
  select organization_id into v_section_org_id from public.org_sections where id = new.section_id;
  select organization_id into v_department_org_id from public.departments where id = new.department_id;
  if v_section_org_id is distinct from v_department_org_id then
    raise exception '부서와 팀이 서로 다른 부문에 속해 있어 연결할 수 없습니다.';
  end if;
  return new;
end;
$$;

create trigger org_section_teams_consistency
  before insert or update on public.org_section_teams
  for each row execute function public.check_org_section_team_consistency();
```

- 이 트리거는 `org_sections`/`departments`를 **읽기만** 하고 절대 쓰지 않는다 — "이 팀을 다른 부문의 부서에는 연결할 수 없다"는 규칙만 강제한다.

### 5.6 `org_unit_leaders` (조직별 리더)

그룹사~팀 5개 레벨 전부 "장(長) 1명"을 가질 수 있다는 점이 동일하므로, 레벨마다 컬럼을 추가하는 대신(특히 `organizations`/`departments`는 컬럼 추가 자체가 금지) **하나의 공용 테이블**로 통일한다.

| 컬럼                                   | 타입                                    | 설명                                                                                                         |
| -------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `id`                                   | uuid, PK                                | —                                                                                                            |
| `org_group_id`                         | uuid, FK → `org_groups.id`, nullable    | 5개 FK 중 정확히 하나만 값이 있어야 함(아래 CHECK)                                                           |
| `org_company_id`                       | uuid, FK → `org_companies.id`, nullable | 〃                                                                                                           |
| `organization_id`                      | uuid, FK → `organizations.id`, nullable | 〃 — 부문의 리더("부문장")                                                                                   |
| `org_section_id`                       | uuid, FK → `org_sections.id`, nullable  | 〃 — 부서의 리더("부서장")                                                                                   |
| `department_id`                        | uuid, FK → `departments.id`, nullable   | 〃 — 팀의 리더("팀장")                                                                                       |
| `profile_id`                           | uuid, FK → `profiles.id`, not null      | 리더로 지정된 구성원                                                                                         |
| `title`                                | text, not null                          | 표시용 직책명(예: "회장님", "대표이사", "부문장", "부서장", "팀장" — 자유 입력, 레벨별 기본값만 폼에서 제안) |
| `created_at`/`updated_at`/`updated_by` | —                                       | 변경 이력                                                                                                    |

```sql
alter table org_unit_leaders
  add constraint org_unit_leaders_exactly_one_target
  check (num_nonnulls(org_group_id, org_company_id, organization_id, org_section_id, department_id) = 1);

create unique index org_unit_leaders_group_uk    on org_unit_leaders(org_group_id)    where org_group_id is not null;
create unique index org_unit_leaders_company_uk  on org_unit_leaders(org_company_id)  where org_company_id is not null;
create unique index org_unit_leaders_division_uk on org_unit_leaders(organization_id) where organization_id is not null;
create unique index org_unit_leaders_section_uk  on org_unit_leaders(org_section_id)  where org_section_id is not null;
create unique index org_unit_leaders_team_uk     on org_unit_leaders(department_id)   where department_id is not null;
```

- 5개의 부분 유니크 인덱스가 "조직 단위당 리더는 동시에 최대 1명"을 DB 레벨에서 강제한다.
- 리더 교체는 이력 없이 해당 행을 `UPDATE`(또는 삭제 후 재등록)하는 것으로 처리한다. 이력이 필요해지면 `valid_from`/`valid_to`를 이 테이블에 추가하는 것으로 확장 가능(테이블이 신규이므로 이 시점엔 자유롭게 컬럼 추가 가능).
- `profile_id`가 그 조직의 실제 소속원이어야 하는지(예: 팀장이 그 팀 소속 `profiles.department_id`와 일치해야 하는지) 여부는 강제하지 않는다 — 겸직/파견 등 예외가 흔하므로 트리거로 강제하지 않고 폼 UX(같은 팀/부서 소속을 우선 추천)로만 유도한다.

---

## 6. 공통 설계 원칙

### 6.1 코드 자동 채번 규칙 (신규 3개 테이블만 해당)

| 엔티티       | 접두사 | 자릿수 | 예시      |
| ------------ | ------ | ------ | --------- |
| 그룹사       | `GRP`  | 4      | `GRP0001` |
| 법인(조직도) | `OC`   | 4      | `OC0001`  |
| 부서         | `OS`   | 4      | `OS0001`  |

`organizations`(부문)/`departments`(팀)는 `code` 컬럼이 원래 없고 이번에도 추가하지 않으므로, 이 두 레벨은 이름만으로 식별한다(6.5절).

### 6.2 그룹사 "고정(싱글턴)" 강제 방법

```sql
alter table org_groups add constraint org_groups_singleton_true check (singleton);
alter table org_groups add constraint org_groups_singleton_unique unique (singleton);
```

`singleton` 컬럼은 항상 `true`여야 하고(`CHECK`), `true` 값은 유니크해야 하므로(`UNIQUE`) 두 번째 행을 `INSERT`하는 순간 유니크 제약 위반으로 실패한다. 애플리케이션 레벨에서도 등록 화면 자체를 제공하지 않고 이름 수정 UI만 둔다.

### 6.3 화면 공통 UI 패턴 — 통합 트리 + 리더 패널 (부서 유무에 따라 가변 깊이)

```
┌─────────────────────────────────────────────────────────┐
│ 조직도 관리                                                │
├───────────────────┬─────────────────────────────────────┤
│ ▾ (그룹사명)         │  [선택한 노드의 장(長)]                 │
│   ▾ 법인1            │   대표이사  홍길동                     │
│     ▾ IT부문         │                                     │
│       ▾ 개발부서      │  [하위 조직 목록 또는(팀인 경우) 구성원 목록]│
│         ▸ ERP시스템팀 │   ERP시스템팀 (5명)                   │
│         ▸ Commerce...│                                     │
│       ▸ IT기획팀      │  ← 부서 없이 부문에 바로 붙는 팀        │
│     ▸ 법인2 부문...   │                                     │
└───────────────────┴─────────────────────────────────────┘
```

- 좌측 트리는 `PRD_MASTER.md` 6.3절과 동일하게 `components/ui/tree-view.tsx` 기반 `TreeView`를 그대로 재사용한다(재귀 깊이 제한이 없어 부서 유무에 따라 깊이가 달라져도 코드 변경 없이 렌더링됨).
- 부문 노드의 자식은 "그 부문에 속한 부서들"과 "그 부문에 부서 없이 직접 매달린 팀들"을 **같은 레벨에 섞어서** 나열한다(4.2절 판정 규칙 그대로 트리에 반영). 위 와이어프레임의 "IT기획팀"이 그 예다.
- 우측은 선택된 노드에 따라 두 블록을 보여준다: **① 리더 패널**(`org_unit_leaders` 조회, 없으면 "미지정" + 지정 버튼) **② 하위 목록**(그룹사~부서까지는 하위 조직 카드/목록, 팀 노드에서는 `get_org_chart_members()`로 가져온 구성원 목록).
- 팀 노드가 트리의 사실상 리프이고, 구성원은 트리 노드로 펼치지 않고 우측 목록으로만 보여준다 — `PRD_MASTER.md`가 소브랜드/라인을 트리로 더 펼치지 않고 탭으로 분리한 것과 같은 이유(불필요한 트리 깊이 증가 방지)다.

### 6.4 검토: `departments`(팀)에 컬럼을 추가해서 쓰는 방법은 없는가

사용자 요청으로 "팀장을 `departments.leader_profile_id` 컬럼 하나로 표현하는 방법"과 "부서 소속을 `departments.section_id` 컬럼으로 표현하는 방법"을 별도 검토했다.

| 항목                 | 옵션 A — 기존 테이블에 컬럼 추가                                                                                                                                             | 옵션 B — 신규 테이블(채택)                                                                   |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 스키마 정합성        | 1:1 관계라 교과서적으로는 더 "정석"에 가깝다                                                                                                                                 | 약간의 조인이 추가되지만 큰 비용은 아님                                                      |
| 기존 테이블 영향     | `ALTER TABLE`로 프로덕션 테이블(63건 참조 중인 `profiles`의 FK 대상) 구조가 바뀐다. 마이그레이션·RLS 정책 재검토가 필요하고, 기존 코드의 컬럼 가정도 다시 점검해야 한다      | **기존 테이블에 전혀 영향 없음** — 새 테이블만 추가되는 순수 additive 마이그레이션           |
| 레벨 간 일관성       | 그룹사·법인·부서(신규 테이블)는 컬럼으로, 부문·팀(기존 테이블)은 컬럼을 못 추가하니 결국 별도 테이블로 — **레벨마다 리더/소속 조회 방식이 달라져** 화면/쿼리 코드가 갈라진다 | 5개 레벨 전부 동일한 테이블·동일한 쿼리 한 줄로 리더를 조회 — UI/쿼리 코드가 하나로 통일된다 |
| 사용자의 명시적 요구 | "`profiles`/`departments`/`organizations` 구조를 그대로 건드리지 않는다"는 요청과 정면으로 배치                                                                              | 요청과 일치                                                                                  |
| **결론**             | **미채택**                                                                                                                                                                   | **채택**                                                                                     |

옵션 A가 기술적으로 틀린 방법은 아니지만, ①기존 프로덕션 테이블에 손을 대지 않는다는 명시적 요구, ②레벨 간 코드 일관성 두 가지 이유로 이번 문서는 옵션 B로 확정한다. 이 판단은 "요구가 바뀌면 뒤집을 수 있는" 가정으로 12장에 남긴다.

### 6.5 `organizations`/`departments`의 "사용여부"·"정렬순서" 부재

Master 도메인 테이블은 전부 `is_active`(boolean)·`sort_order`(integer)를 공통으로 갖지만, `organizations`/`departments`는 이 두 컬럼이 없고 대신 `archived_at`(nullable timestamptz)만 있다. 이번 문서도 이 두 테이블에 컬럼을 추가하지 않으므로:

- **활성 여부**: 조회 시 `archived_at is null`을 "사용중"으로 매핑해 트리 UI의 `isActive`로 변환한다(신규 컬럼 없이 쿼리 레이어에서 어댑팅).
- **정렬순서**: 부문·팀 레벨은 정렬 컬럼이 없으므로 이름 가나다순(또는 `created_at`)으로 정렬한다. 그룹사·법인·부서(신규 테이블)만 `sort_order` 기반 정렬을 제공한다.

---

## 7. 메뉴 구조

`menus` 테이블에 이미 존재하는 대분류 **"인사급여"**(현재 하위 중/소분류가 비어 있는 placeholder 상태, `PRD_MVP.md` 범위에서 이름만 등록됨)를 활용한다.

```
📁 인사급여                        (기존 대분류, 현재 하위 없음)
└── 📂 조직 관리                   (신규 중분류)
    └── 조직도 관리                (신규 소분류) → /erp/org
```

- 신규 라우트 `/erp/org`를 `lib/erp/menu-routes.ts`의 `MENU_ROUTES`에 `"인사급여>조직 관리>조직도 관리": "/erp/org"`로 등록한다(`PRD_MASTER.md` 4.3절과 동일 패턴).
- 접근 권한은 3.1절대로 로그인 사용자 전체 열람 가능, 등록/수정은 라우트 내부에서 `superadmin`/`is_admin()` 재검증.

---

## 8. 더미 데이터

기존 실데이터(부문 1건 "IT부문", 팀 8건, 구성원 63건)를 그대로 유지한 채, 빈 상위 레벨만 최소로 채운다. **부서가 "있을 수도 없을 수도 있다"는 것을 데모에서 실제로 보여주기 위해, 8개 팀 중 일부만 부서에 묶고 나머지는 부문 직속으로 남긴다.**

- **그룹사(`org_groups`)**: 1건 고정. `GRP0001`, 이름은 실제 그룹사명으로 최종 확정 필요(가안 "OO그룹").
- **법인(`org_companies`)**: 최소 1건. `OC0001`, 이름 가안 "OO 법인"(그룹사 하위).
- **법인↔부문 매핑(`org_company_divisions`)**: 기존 `organizations`(1건, "IT부문")를 위 법인 1건에 연결하는 1건 — **이 매핑이 없으면 기존 부문 데이터가 트리에서 고아가 되므로 이번 작업에서 필수로 삽입**한다.
- **부서(`org_sections`)**: "IT부문" 하위에 1~2건(예: `OS0001` "개발부서"). 나머지 팀은 부서 없이 부문 직속으로 남겨 **"부서가 없을 수도 있다"는 상태를 그대로 보존**한다.
- **부서↔팀 매핑(`org_section_teams`)**: 8개 팀 중 일부(예: `ERP시스템팀`, `Commerce시스템팀`, `IT기획팀` 3개)만 "개발부서"에 연결하고, 나머지 5개 팀은 매핑 없이 부문 직속으로 둔다.
- **조직별 리더(`org_unit_leaders`)**: 그룹사/법인/부문/부서 각 1건씩, 임의의 기존 `profiles` 중 `admin`/`superadmin` 계정을 리더로 지정(데모용). 팀 리더는 8개 팀 중 일부만 지정해 "미지정" 상태 UI도 함께 확인한다.

---

## 9. 비범위 (Out of Scope)

- `organizations`/`departments` 테이블 자체의 신규 CRUD 화면(이름 변경, 신규 팀 생성 등) — 기존에도 없었고 이번 문서도 추가하지 않는다. 필요해지면 별도 PRD에서 두 테이블 전용 관리 화면을 다룬다.
- 인사발령(조직 개편) 이력, 겸직/파견 표현
- 조직도와 Master 도메인 `companies`(상품 마스터 "법인") 간의 연계
- 프로필 사진 외의 조직도 카드 꾸미기(직급 체계, 명함 다운로드 등)
- 부서 하위에 "부서" 또는 그 이상 깊은 재귀 계층(부서는 부문과 팀 사이 딱 1단계로 고정, 부서의 하위 부서 같은 재귀 구조는 범위 밖)

---

## 10. 확인된 가정 및 리스크

| 항목                                                                     | 채택한 가정                                                                                                                                                                                      | 리스크/확인 필요 시점                                                                                                                                                                                          |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `organizations` = "부문" 재해석                                          | 사용자 확인 완료(3가지 옵션 중 선택)                                                                                                                                                             | 향후 멀티테넌시(여러 그룹사 SaaS화)가 필요해지면 `organizations`의 원래 용도(테넌트 루트)와 "부문" 의미가 다시 충돌할 수 있음                                                                                  |
| **부서의 선택성 해석**                                                   | **"팀 단위"로 선택적**이라고 해석했다 — 같은 부문 안에서도 일부 팀은 부서 소속, 일부는 부문 직속으로 공존 가능(4.2절). "부문 전체가 부서 체계를 쓰거나 안 쓰거나" 같은 부문 단위 on/off가 아니다 | 실제로는 "부문 단위로 부서 사용 여부가 고정"이어야 한다는 요구가 나오면, `organizations` 부문별로 부서 사용 여부를 표시할 플래그가 필요(단, 이 역시 `organizations`에 컬럼을 못 추가하므로 별도 테이블로 표현) |
| `departments`/`organizations` 컬럼 추가 안 함                            | 6.4절 근거로 옵션 B(신규 테이블) 채택                                                                                                                                                            | "조인이 늘어 느리다" 등 성능 이슈가 실측되면 재검토                                                                                                                                                            |
| `profiles` 조회는 신규 RPC로 우회                                        | 3.2절 — 컬럼 단위 노출 제어를 위해 `SECURITY DEFINER` 함수 사용                                                                                                                                  | 조직도 화면 외 다른 곳에서도 "동료 이름 조회"가 필요해지면 이 함수를 공용화할지 검토                                                                                                                           |
| 그룹사/법인 CRUD 권한 = `superadmin` 전용, 부서 CRUD = 부문 스코프 admin | 스코프 규칙이 없는 최상위 2개 레벨은 보수적으로 superadmin, 부문에 종속된 부서는 기존 `departments_update_admin`과 동일 스코프                                                                   | 실제 운영 조직에서 "법인 관리자"급 별도 역할이 필요하면 역할 체계 확장 필요                                                                                                                                    |
| Master 도메인 `companies`와 미연계                                       | 4.4절 — 도메인 분리, 별도 테이블                                                                                                                                                                 | 두 "법인" 개념을 실제로 통합 관리해야 한다는 요구가 나오면 `org_companies.master_company_id` FK 추가 검토                                                                                                      |
| 그룹사/법인/부서 이름, 초기 리더 지정자                                  | 가안(8장)                                                                                                                                                                                        | 실제 회사명·부서명·초대 리더는 구현 전 확정 필요                                                                                                                                                               |

---

## 11. 성공 기준

- [ ] `/erp/org`에서 그룹사 → 법인 → 부문 → (부서 있으면 부서 →) 팀 → 구성원까지 하나의 트리에서 펼침/접힘으로 탐색된다.
- [ ] **같은 부문 안에서 부서가 있는 팀과 부서 없이 부문에 직속된 팀이 동시에 트리에 정상 표시된다** — 부서의 "선택성"이 실제로 동작함을 증명.
- [ ] 아무 레벨 노드를 클릭해도 해당 조직의 리더(지정되어 있다면)와 하위 조직(또는 팀이면 구성원 목록)이 함께 표시된다.
- [ ] `profiles`/`departments`/`organizations` 테이블에 `ALTER TABLE`이 한 번도 실행되지 않는다 — 마이그레이션 diff에 이 세 테이블이 전혀 등장하지 않는 것으로 검증.
- [ ] 기존 `organizations`(1건, "IT부문")와 `departments`(8건) 데이터가 신규 매핑(`org_company_divisions`, `org_section_teams`) 이후에도 정확히 그대로 조회된다(행 수·값 변화 없음).
- [ ] `role='user'` 계정으로 로그인해도 조직도 화면에서 다른 팀 동료의 이름·소속이 조회되지만, 그 계정으로 `profiles` 테이블을 직접 조회(다른 화면 경유)했을 때는 여전히 본인 행만 보인다 — RPC 우회가 기존 RLS를 깨지 않았음을 확인.
- [ ] 그룹사 테이블에 2번째 행 `INSERT`를 시도하면 DB 제약 위반으로 실패한다.
- [ ] 서로 다른 부문에 속한 부서와 팀을 억지로 연결(`org_section_teams`)하려 하면 트리거가 막는다.
