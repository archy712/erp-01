# 마스터 관리(기준정보) 시스템 개발 로드맵

ERP MVP에서 **메뉴 데이터만 등록된 뼈대**로 남아 있던 "마스터 관리 > 기준정보 관리" 영역을, 12종 마스터 엔티티의 실제 계층형 CRUD 화면 5개 + 상품 관리 화면으로 완성한다.

- **기준 문서**: `docs/prd/PRD_MASTER.md`
- **선행 로드맵**: `docs/roadmap/ROADMAP_MVP.md` (Task 001~022 전체 완료 — ERP 셸/인증/`menus`·`user_menu_permissions`·역할 권한 체계까지 구축 완료)
- **기반 저장소**: Next.js 16 (App Router) + Supabase (`@supabase/ssr`) + shadcn/ui `new-york`
- **개발 환경**: 1인 개발 — 일정 추정보다 **실행 순서와 의존관계** 중심으로 태스크를 분해했다.
- **Task 번호**: `ROADMAP_MVP.md`의 Task 022에 이어 **Task 023부터** 연속 채번한다 (번호 충돌 방지).
- **최종 수정**: 2026-08-16

---

## 개요

마스터 관리 시스템은 **관리자(admin)·최고관리자(superadmin)**를 위한 기준정보 관리 도구로 다음을 제공한다:

- **12종 마스터 엔티티의 계층형 CRUD**: 법인 → 브랜드 → (소브랜드 | 라인) → 아이템타입 → 아이템 → 서브아이템, 그리고 브랜드 하위의 컬러타입/컬러/사이즈타입/사이즈까지 실제 등록·수정·삭제가 가능하다.
- **5개 화면으로 압축된 메뉴 구조**: 메뉴 트리가 3단계까지만 지원하므로 11종 엔티티를 개별 소분류로 펼치지 않고, "좌측 트리 탐색 + 우측 목록/폼"의 마스터-디테일 패턴 화면 5개로 묶는다.
- **역할 기반 하드 게이트**: 기준정보 관리 5개 화면은 `user_menu_permissions` 부여 여부와 무관하게 `role in ('admin','superadmin')`만 진입할 수 있다.
- **코드 자동 채번**: 엔티티별 접두사/자릿수 규칙(`C1001`, `BC1000001`, `PM100000001` 등)에 따라 등록 시 코드가 자동 생성되고, 이후 관리자가 직접 수정할 수 있다.
- **상품(Product) 관리 화면**: 마스터 데이터를 소비하는 캐스케이드 드롭다운 등록 폼과 이미지/썸네일 처리를 갖춘 목록·등록/수정 화면.

### 이번 로드맵 완료의 정의

> "기준정보 5개 화면에서 **계층 CRUD가 실제로 동작하고**, 상품 등록 폼이 그 데이터를 **교차 브랜드 없이 정확히 소비**한다"까지 보장한다.
> 상품 정보 현황 / 상품 정보 일괄 수정, 재고·발주·매입/매출 등 상품 이후 단계는 범위가 아니다. ([범위 제외](#범위-제외-out-of-scope) 참고)

---

## 개발 워크플로우

`ROADMAP_MVP.md`의 [개발 워크플로우](./ROADMAP_MVP.md#개발-워크플로우)를 그대로 따른다. 중복 서술 대신 이 로드맵에서 특히 중요한 규약만 다시 적는다.

1. **작업 계획** — 착수 전 `CLAUDE.md`·`docs/guides/`·`docs/prd/PRD_MASTER.md`를 확인하고, 기존에 이미 존재하는 것(`is_admin()`, `set_updated_at()`, `requireAdmin()` 등)을 **다시 만들지 않는지** 먼저 검증한다.
2. **작업 생성** — 각 Task는 **목표 / 관련 파일 / 구현 체크리스트 / 수락 기준 / 테스트 체크리스트** 5개 소단락을 갖는다.
3. **작업 구현**
   - DB 스키마 변경은 로컬 `supabase/migrations/*.sql`이 아니라 **Supabase MCP(`mcp__supabase__apply_migration`)로 원격 프로젝트에 직접 적용**한다 (이 저장소의 기존 관례, ROADMAP_MVP Task 011/012와 동일).
   - 스키마 변경 후 **반드시** `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts`를 재생성하고, `mcp__supabase__get_advisors`(security + performance)를 확인한다.
   - DB 연동·권한 로직 구현 시 **Playwright MCP로 E2E 검증**을 수행한 뒤 다음 단계로 진행한다.
   - 각 Task 완료 후 `npm run check-all`(typecheck + lint + format:check)을 통과시킨다.
   - 테스트용으로 만든 계정/데이터는 검증 직후 `execute_sql`로 삭제하고 잔존 0건을 확인한다.
4. **로드맵 업데이트** — 완료 Task는 제목 옆에 ✅, 하위 체크박스를 `[x]`로 전환하고 Phase 전체 완료 시 Phase 제목에도 ✅를 붙인다. [진행 현황](#진행-현황) 표도 함께 갱신한다.

> ⚠️ **착수 전 사용자 확인이 필요한 Task가 있다.** PRD 12장의 미해결 가정(상품-사이즈 카디널리티, 썸네일 생성 방식, 상품 CRUD 권한, 일반 속성 항목 확정)에 걸린 Task는 제목에 ⚠️를 붙였다. 해당 Task는 **구현 착수 전 반드시 사용자 확인을 받고** 시작한다.

---

## 아키텍처 사전 결정 사항

Task 착수 전 아래 결정을 전제로 한다. 변경 시 이 섹션과 영향받는 Task를 함께 갱신할 것.

| 항목                              | 결정                                                                                                                                                                                                  | 근거                                                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 권한 함수                         | **기존 `public.is_admin()` / `public.is_superadmin()`을 그대로 재사용. 새 DB 권한 함수를 만들지 않는다.**                                                                                             | 실 DB 확인 결과 `is_admin()`은 정확히 `role in ('admin','superadmin')` 판정. `profiles.role`도 `check (role = any (array['user','admin','superadmin']))` 제약이 이미 걸려 있음 |
| 앱 레벨 관리자 가드               | **기존 `requireAdmin()`(`lib/erp/auth.ts`, ROADMAP_MVP Task 013/014) 재사용.** 새 가드 함수를 만들지 않는다                                                                                           | `requireAdmin()`이 이미 `isAdminRole()` 판정 후 `/erp/forbidden`으로 리다이렉트한다 — PRD 3.1/9장이 요구하는 하드 게이트와 동작이 완전히 일치                                  |
| 기준정보 라우트 루트              | `app/erp/master/*` (신규). 관리자 가드는 `app/erp/master/layout.tsx`에서 `requireAdmin()` 1회 호출로 세그먼트 전체에 적용                                                                             | `app/erp/admin/layout.tsx`의 기존 가드 패턴과 동일 구조                                                                                                                        |
| 상품 라우트 루트                  | `app/erp/products/*` (신규). **`requireAdmin()`을 붙이지 않는다** — 기존 `user_menu_permissions` 기반 접근만 적용                                                                                     | PRD 1.2/3.1: 상품 관리의 메뉴 위치·접근 권한은 변경하지 않음(오픈 유지)                                                                                                        |
| 메뉴 → 라우트 연결                | 기존 `lib/erp/menu-routes.ts`의 `ADMIN_MENU_ROUTES` 매핑 테이블(메뉴 이름 경로 `"대>중>소"` 키)을 확장                                                                                                | UUID가 아닌 이름 경로를 키로 쓰는 기존 설계를 그대로 이어감 (메뉴 id 변경에 강함)                                                                                              |
| 마스터 도메인 코드 위치           | `lib/erp/master/*`, `components/erp/master/*` (신규 하위 디렉토리)                                                                                                                                    | 12종 엔티티 × (타입/쿼리/액션/폼)이 `lib/erp` 루트에 평평하게 쌓이면 기존 ERP 코어 파일과 섞임. `components/erp/admin/` 선례와 동일한 분리                                     |
| `updated_at` 트리거               | 기존 범용 `public.set_updated_at()` 재사용                                                                                                                                                            | ROADMAP_MVP Task 012에서 이미 재사용한 weeklyplan 공용 트리거                                                                                                                  |
| `created_by`/`updated_by`         | `created_by`는 컬럼 기본값 `auth.uid()`, `updated_by`는 **신규 트리거 `public.set_master_audit()`**(updated_at + updated_by 동시 설정)로 처리                                                         | 실 DB 확인 결과 기존 `set_updated_at()`은 `updated_at`만 설정하고 `updated_by` 개념이 없음 → 이 한 개만 신설하고 나머지는 재사용                                               |
| 코드 자동 채번                    | 엔티티별 **Postgres 시퀀스** + 공용 함수 `public.next_master_code(p_entity text)`. 시퀀스 `start with`는 `10^(자릿수-1)+1` (예: 4자리 → 1001, 7자리 → 1000001, 9자리 → 100000001)                     | PRD 6.1의 예시 코드(`C1001`/`BC1000001`/`PM100000001`)가 정확히 이 규칙. 서버 액션에서 `max(code)+1`을 계산하면 동시 등록 시 경합이 생김                                       |
| 코드 수정 허용                    | 채번 후 관리자 수정 가능. 컬럼에 `unique` 제약 + 채번 함수는 이미 점유된 코드를 만나면 `nextval` 재시도                                                                                               | PRD 6.1 "등록 후 관리자가 직접 수정할 수 있다" — 수동 수정본이 시퀀스와 충돌할 수 있음                                                                                         |
| 성별(Gender)                      | **테이블 없음.** `lib/erp/master/gender.ts` 앱 상수 3종(`GE1001` 남성 / `GE1002` 여성 / `GE1003` 혼용) + DB는 `text check in ('male','female','unisex')`                                              | PRD 7.5/8장. CRUD 화면을 두지 않으므로 테이블이 불필요                                                                                                                         |
| 삭제 정책                         | FK를 **전부 `on delete restrict`**로 걸고, 참조가 있으면 UI에서 "사용여부 끄기"만 안내                                                                                                                | PRD 6.3. `menus`의 `on delete cascade`와 반대 정책이므로 혼동 주의 — 기준정보는 실수 삭제 시 피해가 큼                                                                         |
| 다국어                            | 기준정보/상품 화면은 **한국어 단일 값**. `lib/i18n/dictionaries/`에 신규 문자열을 추가하지 않는다                                                                                                     | PRD 1.3 — 관리자 전용 내부 화면은 한국어만 지원(ROADMAP_MVP Task 010과 동일 기조)                                                                                              |
| Suspense 경계                     | `cacheComponents: true` 환경이므로 `cookies()`/`params`/`searchParams` 사용 컴포넌트는 얇은 `Page` + `<Suspense>` + `async XxxContent` 패턴 유지                                                      | 기존 `app/erp/**` 전 페이지가 이 패턴                                                                                                                                          |
| shadcn 컴포넌트                   | `table` `tabs` `dialog` `sheet` `tree-view` `select` `native-select` `combobox` `switch` `badge` `checkbox` `alert-dialog` `file-dropzone` `input` `textarea` `popover` `skeleton` 모두 **이미 존재** | `npx shadcn add` 불필요. `file-dropzone`은 상품 이미지 업로드에 그대로 재사용                                                                                                  |
| 상품-사이즈 카디널리티(Task 023①) | **현행 가정 유지** — 상품 1건 = 단일 사이즈(SKU 단위). `products.brand_gender_size_id` 단일 FK 그대로 사용                                                                                            | 사용자 확인 완료(2026-08-16). 스타일-SKU 분리(`product_size_variants`) 불필요                                                                                                  |
| 상품 썸네일 생성(Task 023②)       | **자동 생성** — 상품 이미지 업로드 시 **Route Handler**에서 리사이즈해 썸네일을 함께 저장                                                                                                             | 사용자 확인 완료(2026-08-16). 관리자가 원본/썸네일을 각각 올리지 않도록 서버에서 처리                                                                                          |
| 상품 CRUD 권한(Task 023③)         | **현행 유지** — 로그인 사용자 전체 개방. `app/erp/products/*`에 `requireAdmin()` 미적용, `products` RLS의 insert/update/delete도 `is_admin()`으로 좁히지 않음                                         | 사용자 확인 완료(2026-08-16). 메뉴 위치·접근 권한 변경 없음(PRD 7.6 원안 유지)                                                                                                 |
| 상품 일반 속성 항목(Task 023④)    | **PRD 7.6.2 제안값 그대로 채택** — 시즌(text) / 출시연도(integer) / 소재(text) / 원가·판매가(numeric) / 판매상태(select: 판매중·품절·단종, `is_active`와 별개)                                        | 사용자 확인 완료(2026-08-16)                                                                                                                                                   |
| 컬러 RGB 정규화(Task 023⑤)        | 입력 UI는 `#FF5733`처럼 `#` 접두사 허용, 저장 시 제거해 `rgb_hex` 컬럼에는 6자리 HEX(`FF5733`)만 저장                                                                                                 | 사용자 확인 완료(2026-08-16)                                                                                                                                                   |

### 변경 금지 파일 목록 (ROADMAP_MVP에서 승계)

- `proxy.ts`, `lib/supabase/proxy.ts` — 쿠키 처리 로직 **특히 금지**
- `app/layout.tsx`, `app/page.tsx`, `app/protected/**` — 스타터킷 영역
- `components/auth-button.tsx`, `components/theme-switcher.tsx`, `components/language-switcher.tsx`
- `app/erp/layout.tsx`의 셸 구조(Header → Menubar → 트리+콘텐츠 → Footer) — 슬롯 내용은 데이터로만 바뀌고 구조는 유지
- `public.is_admin()` / `public.is_superadmin()` / `public.set_updated_at()` / `public.handle_new_user()` / `prevent_unauthorized_role_change` — weeklyplan과 공유하는 기존 DB 자산. **재사용만 하고 정의를 수정하지 않는다**

---

## 개발 단계

- **Phase 3** ✅ — 마스터 데이터 모델 구축 (Task 023~029)
- **Phase 4** ✅ — 메뉴 재구성 및 역할 하드 게이트 (Task 030~031)
- **Phase 5** ✅ — 기준정보 관리 5개 화면 구현 (Task 032~037)
- **Phase 6** — 상품(Product) 관리 화면 구현 (Task 038~040)
- **Phase 7** — 더미 데이터 시드 및 통합 검증 (Task 041~042)

> Phase 번호는 `ROADMAP_MVP.md`의 Phase 0~2에 이어 3부터 채번한다.

---

## Phase 3: 마스터 데이터 모델 구축

> PRD 6장 / 8장 / 9장.
> **목표는 화면이 아니라 12개 테이블 + 채번 + RLS + 데이터 액세스 계층의 완성이다.**
> Phase 5의 5개 화면이 서로 병렬 개발될 수 있도록, 공통 스키마와 쿼리/액션 시그니처를 여기서 전부 확정한다.

### Task 023: 마스터 도메인 설계 확정 및 미해결 가정 확인 ✅

> 사용자 확인 완료(2026-08-16) — PRD 12장의 미해결 가정 5건 전부 아래 "현행 가정 유지" 방향으로 확정.

**목표**: PRD 12장에 열려 있는 4개 가정을 사용자 확인으로 확정하고, 그 결과를 이 로드맵의 "아키텍처 사전 결정 사항"과 영향 Task에 반영한다. **코드 변경은 없거나 최소한이며, 산출물은 결정 기록이다.**

**관련 파일**

- `docs/prd/PRD_MASTER.md` 12장 (확인 결과 반영)
- `docs/roadmap/ROADMAP_MASTER.md` (이 문서 — 결정 사항 표 및 영향 Task 갱신)

**구현 체크리스트**

- [x] **① 상품-사이즈 카디널리티 확정** — **현행 가정 유지: 상품 1건 = 단일 사이즈(SKU 단위)**. `products.brand_gender_size_id` 단일 FK 그대로 사용. 스타일-SKU 분리 불필요.
- [x] **② 썸네일 생성 방식 확정** — **자동 생성으로 확정**, 실행 위치는 **Route Handler**. Task 040 폼에 별도 수동 업로드 필드 불필요.
- [x] **③ 상품 CRUD 권한 확정** — **현행 유지: 로그인 사용자 개방**. `products` INSERT/UPDATE/DELETE에 `is_admin()`을 적용하지 않는다.
- [x] **④ 상품 "일반 속성" 항목 확정** — **PRD 7.6.2 제안값 그대로 채택**(시즌/출시연도/소재/원가/판매가/판매상태). 판매상태는 `is_active`와 별개의 영업 상태값(판매중/품절/단종)으로 유지.
- [x] **⑤ 컬러 RGB 입력 형식 확인** — 입력 UI에서 `#` 접두사를 허용하되 저장 시 제거해 `rgb_hex`에는 6자리만 저장하는 정규화 규칙으로 확정.
- [x] 확정된 5개 결정을 이 문서의 "아키텍처 사전 결정 사항" 표에 행으로 추가하고, ⚠️가 붙은 Task 제목(023, 028)에서 ⚠️를 제거했다.

**수락 기준**

- [x] PRD 12장의 4개 미해결 가정(+RGB 정규화 포함 5개)에 대해 "확정" 또는 "현행 가정 유지"라는 명시적 사용자 답변이 기록되어 있다.
- [x] 결정에 따라 영향받는 Task(028 / 038 / 039 / 040 / 041)에 반영할 방향이 확정되었다 — 전부 "현행 가정 유지" 방향이라 해당 Task들의 체크리스트 문구 변경은 불필요.

**테스트 체크리스트**

- [x] (코드 변경 없음 — 자동 테스트 대상 아님) 결정 사항이 이 문서와 `PRD_MASTER.md` 12장 양쪽에 모순 없이 반영되었는지 교차 확인했다(둘 다 동일한 "현행 가정 유지" 방향).

---

### Task 024: 마스터 공통 상수 / 타입 / 코드 포맷 유틸 정의 (DB 무관) ✅

**목표**: 12종 엔티티가 공유할 앱 레벨 상수·타입·유틸을 **DB보다 먼저** 확정해, Task 025~029와 Phase 5 화면 작업이 같은 타입 위에서 병렬 진행되게 한다.

**관련 파일**

- `lib/erp/master/gender.ts` (신규 — 성별 상수)
- `lib/erp/master/types.ts` (신규 — 공통 엔티티 타입)
- `lib/erp/master/code.ts` (신규 — 코드 접두사/자릿수 메타 + 포맷 검증)
- `lib/erp/master/entities.ts` (신규 — 엔티티 메타데이터 레지스트리)

**구현 체크리스트**

- [x] `lib/erp/master/gender.ts`: `GENDERS` 상수 배열 정의 — `[{ code: "GE1001", value: "male", label: "남성" }, { code: "GE1002", value: "female", label: "여성" }, { code: "GE1003", value: "unisex", label: "혼용" }]`. `GenderValue = "male" | "female" | "unisex"` 타입, `getGenderLabel(value)`, `isGenderValue(v)` 가드 export. **CRUD 함수·화면은 만들지 않는다**(PRD 7.5: 고정 상수).
- [x] `lib/erp/master/types.ts`: 공통 속성 타입 `MasterCommonFields = { id, code, name, sortOrder, isActive, note, createdAt, updatedAt, createdBy, updatedBy }` 정의 후, 각 엔티티 타입(`Company`, `Brand`, `SmallBrand`, `BrandLine`, `ItemType`, `Item`, `SubItem`, `BrandColorType`, `BrandColor`, `BrandGenderSizeType`, `BrandGenderSize`)을 `MasterCommonFields & { parentId... }` 형태로 파생. DB 타입(`Tables<"...">`)이 생기는 Task 029에서 `Pick`으로 재정렬할 수 있도록 **여기서는 UI가 소비할 camelCase 뷰 타입**만 정의한다.
- [x] `lib/erp/master/code.ts`: PRD 6.1 표를 그대로 옮긴 `CODE_SPECS` 레코드 정의 —
  - 법인 `C`/4, 브랜드 `B`/4, 소브랜드 `SB`/4, 아이템타입 `LC`/4, 아이템 `MC`/4, 서브아이템 `SC`/4, 라인 `BL`/4, 컬러타입 `BCT`/4, 컬러 `BC`/7, 사이즈타입 `BGST`/4, 사이즈 `BGS`/4, 상품 `PM`/9
  - `isValidCode(entity, code)` — `^{prefix}\d{digits}$` 정규식 검증 (관리자가 코드를 직접 수정할 때 클라이언트 1차 검증용)
  - 성별(`GE`/4)은 상수라 채번 대상이 아님을 주석으로 명시
- [x] `lib/erp/master/entities.ts`: 엔티티별 메타(한글 라벨, 테이블명, 코드 스펙 키, 부모 엔티티, 라우트) 레지스트리 정의. Phase 5의 공통 마스터-디테일 컴포넌트(Task 032)가 이 메타로 화면 문구와 컬럼 헤더를 구성하도록 설계한다. `product`는 Phase 5 화면 대상이 아니라 이 레지스트리에서 제외(`MasterEntityKey = Exclude<MasterCodeEntity, "product">`).
- [x] 위 4개 파일은 **서버 전용 코드(`lib/supabase/server.ts` 등)를 임포트하지 않는 순수 모듈**로 유지한다 — Client Component에서도 그대로 import 가능해야 한다(`lib/erp/role-labels.ts`가 같은 이유로 분리된 선례).

**수락 기준**

- [x] `npm run typecheck` 통과.
- [x] `lib/erp/master/*` 4개 파일 어디에도 `"use server"` / `next/headers` / Supabase 클라이언트 import가 없다 (`grep`으로 확인).
- [x] PRD 6.1 표의 13행(성별 포함)이 `CODE_SPECS` 또는 주석에 빠짐없이 반영되어 있다.

**테스트 체크리스트**

- [x] `isValidCode("company", "C1001")` → true, `isValidCode("company", "C101")` → false, `isValidCode("brandColor", "BC1000001")` → true 를 임시 스크립트(`npx tsx`)로 확인 후 정리(3건 모두 기대값과 일치).
- [x] `GENDERS`가 정확히 3건이고 `code`/`value`/`label`이 PRD 7.5 표와 일치하는지 확인.

---

### Task 025: 분류 축 7개 테이블 생성 (companies ~ sub_items) ✅

**목표**: 법인→브랜드→소브랜드/라인→아이템타입→아이템→서브아이템의 분류 축 테이블과 RLS를 구축한다.

**관련 파일**

- Supabase 마이그레이션(MCP) — `create_master_classification_tables`
- `lib/supabase/database.types.ts` (Task 029에서 일괄 재생성)

**구현 체크리스트**

- [x] 신규 트리거 함수 `public.set_master_audit()` 생성 — `new.updated_at = now(); new.updated_by = auth.uid(); return new;` (`security definer` + `set search_path = ''`, 기존 6개 함수와 동일 컨벤션). **기존 `set_updated_at()`은 `updated_by`를 다루지 않아 재사용 불가하므로 이 한 개만 신설**했고, `is_admin()`/`is_superadmin()`은 신설하지 않았다. `set_updated_at()`/`handle_new_user()`와 동일하게 `anon`/`authenticated`(및 `public`)의 직접 RPC 실행 권한도 회수했다(트리거 전용 함수).
- [x] 공통 컬럼 정의(7개 테이블 전부 동일, PRD 6.2):
  - [x] `id uuid primary key default gen_random_uuid()`
  - [x] `code text not null unique`
  - [x] `name text not null`
  - [x] `sort_order integer not null default 0`
  - [x] `is_active boolean not null default true`
  - [x] `note text`
  - [x] `created_at timestamptz not null default now()` / `updated_at timestamptz not null default now()`
  - [x] `created_by uuid references public.profiles(id) default auth.uid()` / `updated_by uuid references public.profiles(id)`
  - [x] `before update` 트리거로 `public.set_master_audit()` 연결
- [x] `companies` 생성 — 부모 FK 없음(최상위).
- [x] `brands` 생성 — `company_id uuid not null references public.companies(id) on delete restrict`.
- [x] `small_brands` 생성 — `brand_id uuid not null references public.brands(id) on delete restrict`.
- [x] `brand_lines` 생성 — `brand_id uuid not null references public.brands(id) on delete restrict` (소브랜드와 형제 관계, PRD 5장).
- [x] `item_types` 생성 — `small_brand_id uuid not null references public.small_brands(id) on delete restrict`.
- [x] `items` 생성 — `item_type_id uuid not null references public.item_types(id) on delete restrict`.
- [x] `sub_items` 생성 — `item_id uuid not null references public.items(id) on delete restrict`.
- [x] 인덱스: 각 테이블에 `(부모FK, sort_order)` 복합 인덱스(`companies`는 부모가 없어 `sort_order` 단일 인덱스) + FK 커버링 인덱스(`created_by`/`updated_by` 포함).
- [x] RLS 활성화 + 정책 (7개 테이블 동일, PRD 9장, **기존 `is_admin()` 재사용**):
  - [x] `select` — `to authenticated using (true)` (상품 폼 드롭다운이 읽어야 하므로 전체 허용)
  - [x] `insert` — `to authenticated with check (is_admin())`
  - [x] `update` — `to authenticated using (is_admin()) with check (is_admin())`
  - [x] `delete` — `to authenticated using (is_admin())`
- [x] `mcp__supabase__get_advisors`(security + performance) 확인 — `set_master_audit()`가 `anon`/`authenticated`에서 직접 RPC 호출 가능하다는 신규 WARN이 나와, PUBLIC EXECUTE 권한을 회수해 해소했다(`set_updated_at()`과 동일 ACL로 일치 확인). 나머지 pre-existing 경고(성능 INFO성 unused_index 포함)는 weeklyplan/기존 함수 영역이라 손대지 않았다.

**수락 기준**

- [x] 7개 테이블이 모두 생성되고, `list_tables`로 공통 컬럼 9종 + 부모 FK가 확인된다.
- [x] `role='user'` 세션에서 `companies` select는 성공하고 insert는 RLS(`42501`)로 차단된다.
- [x] 하위 행이 있는 부모 삭제가 `on delete restrict`로 차단된다.

**테스트 체크리스트**

- [x] `execute_sql`로 `companies` → `brands` → `small_brands` → `item_types` → `items` → `sub_items` 체인 1건씩 insert 성공 확인 (`TEST_` 접두사 사용).
- [x] `brand_lines`도 같은 브랜드 하위로 1건 insert 성공 확인 (소브랜드와 독립적인 형제 축임을 확인).
- [x] 하위 브랜드가 있는 `companies` 행 delete 시도 → FK 위반(`23503`)으로 실패 확인.
- [x] 동일 `code` 중복 insert → unique 위반(`23505`) 확인.
- [x] `set local role authenticated` + `set_config('request.jwt.claims', ...)`로 `role='user'` 세션을 시뮬레이션 — insert는 `insufficient_privilege`(42501)로 차단, select는 통과, update/delete는 RLS `USING` 절이 대상 행을 0건으로 필터링해 영향 행 0건(오류 없이 조용히 무시)임을 `GET DIAGNOSTICS`로 확인(Postgres RLS의 정상 동작 — UPDATE/DELETE는 USING 불일치 시 예외가 아니라 0-row 결과).
- [x] `update` 실행 후 `updated_at`이 갱신되고 `updated_by`가 채워지는지 확인(`set_master_audit()` 동작 검증) — admin 세션으로 갱신 시 `updated_by`가 실행자 id로 정확히 채워짐을 확인.
- [x] 테스트에 사용한 `TEST_%` 행 전부 삭제 후 잔존 0건 확인.

---

### Task 026: 속성 축 4개 테이블 생성 (컬러 / 사이즈) ✅

**목표**: 브랜드 하위의 컬러타입/컬러/사이즈타입/사이즈 테이블을 구축한다. 성별은 테이블이 아니라 `text` 체크 제약으로 표현한다.

**관련 파일**

- Supabase 마이그레이션(MCP) — `create_master_attribute_tables`
- `lib/erp/master/gender.ts` (Task 024 — DB 체크 제약과 값이 일치해야 함)

**구현 체크리스트**

- [x] `brand_color_types` 생성 — 공통 컬럼 9종 + `brand_id uuid not null references public.brands(id) on delete restrict`.
- [x] `brand_colors` 생성 — 공통 컬럼 9종 + `brand_color_type_id uuid not null references public.brand_color_types(id) on delete restrict` + `rgb_hex char(6) not null check (rgb_hex ~ '^[0-9A-Fa-f]{6}$')` (PRD 7.4: `#` 없는 6자리 HEX 필수).
- [x] `brand_gender_size_types` 생성 — 공통 컬럼 9종 + `brand_id uuid not null references public.brands(id) on delete restrict` + `gender text not null check (gender in ('male','female','unisex'))`. **성별 테이블은 만들지 않았다**(PRD 8장).
- [x] `brand_gender_sizes` 생성 — 공통 컬럼 9종 + `brand_gender_size_type_id uuid not null references public.brand_gender_size_types(id) on delete restrict`.
- [x] 4개 테이블 모두 `set_master_audit()` before-update 트리거 연결 (Task 025에서 생성한 함수 재사용, 새로 만들지 않음).
- [x] 인덱스: `(부모FK, sort_order)` + `brand_gender_size_types(brand_id, gender)` 복합 인덱스(사이즈 화면이 브랜드+성별로 필터링하므로) + FK 커버링 인덱스.
- [x] RLS 활성화 + 정책 — Task 025와 동일(select 전체 허용 / CUD는 `is_admin()`).
- [x] `get_advisors`(security + performance) 확인 — 신규 보안 WARN 없음(Task 025에서 `set_master_audit()` PUBLIC 권한을 이미 회수해뒀음), 성능은 빈 테이블 `unused_index` INFO뿐.

**수락 기준**

- [x] 4개 테이블이 생성되고 `brand_colors.rgb_hex`, `brand_gender_size_types.gender` 체크 제약이 동작한다.
- [x] `gender` 허용값 3종이 `lib/erp/master/gender.ts`의 `GenderValue`와 정확히 일치한다(`male`/`female`/`unisex` 3종 insert 성공으로 확인).

**테스트 체크리스트**

- [x] `execute_sql`로 컬러타입 → 컬러 1건씩 insert 성공, `rgb_hex='FF5733'` 저장 확인.
- [x] `rgb_hex='#FF5733'`(7자) 및 `'ZZZZZZ'` insert → 둘 다 거부 확인. `'ZZZZZZ'`은 체크 제약 위반(`23514`), `'#FF5733'`은 `char(6)` 길이 제한에서 먼저 걸려 `22001`(value too long)로 거부 — 두 경우 모두 저장은 차단됨.
- [x] `gender='men'` 같은 잘못된 값 insert → 체크 제약 위반(`23514`) 확인. `'male'`/`'female'`/`'unisex'` 3종은 성공 확인.
- [x] 하위 컬러가 있는 컬러타입 delete 시도 → FK 위반(`23503`) 확인.
- [x] `role='user'` 시뮬레이션으로 select는 통과, insert는 `42501`로 차단, update/delete는 RLS `USING` 필터로 영향 행 0건 확인.
- [x] `TEST_%` 행 전부 정리 후 잔존 0건 확인.

---

### Task 027: 코드 자동 채번 시퀀스 및 `next_master_code()` 구현 ✅

**목표**: PRD 6.1의 접두사/자릿수 규칙대로 등록 시 코드가 자동 생성되게 하고, 관리자가 코드를 수동 수정해도 이후 채번이 충돌하지 않게 한다.

**관련 파일**

- Supabase 마이그레이션(MCP) — `create_master_code_sequences`
- `lib/erp/master/code.ts` (Task 024 — 엔티티 키 문자열이 DB 함수 인자와 일치해야 함)

**구현 체크리스트**

- [x] 엔티티별 시퀀스 12개 생성 — `master_code_company_seq`(start 1001), `..._brand_seq`(1001), `..._small_brand_seq`(1001), `..._brand_line_seq`(1001), `..._item_type_seq`(1001), `..._item_seq`(1001), `..._sub_item_seq`(1001), `..._brand_color_type_seq`(1001), `..._brand_color_seq`(**start 1000001**, 7자리), `..._brand_gender_size_type_seq`(1001), `..._brand_gender_size_seq`(1001), `..._product_seq`(**start 100000001**, 9자리). 각 시퀀스는 `minvalue`를 `start` 값과 동일하게 설정.
- [x] 채번 범위는 **부모와 무관한 전체 시퀀스**로 통일한다 (PRD 6.1 각주: 부모별로 끊으면 코드만으로 소속을 알 수 없어 혼동).
- [x] 공용 함수 `public.next_master_code(p_entity text) returns text` 구현:
  - [x] 엔티티명(snake_case) → (접두사, 시퀀스명, 대상 테이블) 매핑을 `case` 문으로 내장하고, 알 수 없는 엔티티는 예외 발생. **주의**: DB 함수의 `p_entity`는 `company`/`brand_color`/`product`처럼 snake_case이고, `lib/erp/master/code.ts`의 `MasterCodeEntity`는 `company`/`brandColor`/`product`처럼 camelCase — Task 029의 서버 액션이 이 둘을 매핑해야 한다(동일 문자열이 아님).
  - [x] `nextval()` 값을 접두사와 `lpad`로 결합해 코드 생성.
  - [x] **생성된 코드가 대상 테이블에 이미 존재하면(관리자가 수동으로 그 코드를 쓴 경우) 다음 `nextval`로 재시도**하는 루프(최대 100회, 초과 시 예외). 대상 테이블이 아직 없으면(Task 028 이전의 `product`) `to_regclass()`로 감지해 중복 검사를 건너뛴다.
  - [x] `security definer` + `set search_path = ''` + 함수 내부에서 `public.is_admin()` 재확인(기존 `set_user_menu_permissions()`와 동일 컨벤션 — SECURITY DEFINER로 RLS를 우회하는 만큼 내부 권한 재확인으로 상쇄). **[Task 029에서 보정]** 이 원안은 모든 엔티티에 획일적으로 `is_admin()`을 요구했는데, Task 023 ③(상품은 로그인 사용자 전체 개방)과 충돌함이 Task 029에서 드러나 `product` 엔티티만 로그인 확인으로 완화하도록 `create or replace`했다(마이그레이션 `adjust_next_master_code_product_permission`). 나머지 11종은 원안 그대로 관리자 전용이다.
- [x] 서버 액션(Task 029)이 등록 시 `rpc("next_master_code", { p_entity })`를 호출해 코드를 받아 insert하도록 인터페이스를 확정한다. **`max(code)+1` 계산 방식은 채택하지 않는다**(동시 등록 시 경합).
- [x] `get_advisors` 확인 — `next_master_code()`에 대한 신규 SECURITY DEFINER WARN이 나왔고, 기존 6개 함수와 동일 패턴(내부 `is_admin()` 재확인으로 상쇄)이므로 근거를 기록하고 유지했다(revoke 대상 아님 — 트리거 전용 함수인 `set_master_audit()`와는 다른 케이스).

**수락 기준**

- [x] `select public.next_master_code('company')` → `C1001`, 재호출 시 `C1002` 형식으로 증가한다(admin 세션으로 실측 확인).
- [x] `next_master_code('brand_color')` → `BC1000001`, `next_master_code('product')` → `PM100000001` 형식이 나온다.
- [x] 이미 존재하는 코드와 충돌하면 자동으로 다음 번호를 반환한다.
- [x] `role='user'` 세션에서 호출 시 권한 예외가 발생한다.

**테스트 체크리스트**

- [x] `execute_sql`로 12개 엔티티 전부 `next_master_code()`를 1회씩 호출해 **PRD 6.1 표의 접두사·자릿수와 정확히 일치**하는지 대조 — 12건 모두 일치 확인(`C1001`, `B1001`, `SB1001`, `BL1001`, `LC1001`, `MC1001`, `SC1001`, `BCT1001`, `BC1000001`, `BGST1001`, `BGS1001`, `PM100000001`).
- [x] `companies`에 `C1005`를 수동 insert한 뒤 시퀀스를 `setval(..., 1004)`로 되돌리고 `next_master_code('company')` 호출 → `C1005`를 건너뛰고 `C1006`이 반환되는지 확인 — 확인됨.
- [x] `next_master_code('unknown_entity')` → 예외 발생 확인(admin 세션에서 실행해 권한 예외가 아닌 "알 수 없는 엔티티" 예외임을 명확히 구분).
- [x] `set local role authenticated` + `set_config`로 `role='user'` 시뮬레이션 → 권한 예외("코드 채번은 관리자만 할 수 있습니다") 확인.
- [x] 검증에 사용한 행(`C1005`) 삭제 후 잔존 0건 확인, 12개 시퀀스 전부 `setval(..., start, false)`로 시작값 원복 확인(재조회 시 `nextval()`이 다시 시작값을 반환).

---

### Task 028: products 테이블 및 상품 이미지 스토리지 버킷 구축 ✅

> Task 023에서 ①(단일 사이즈 유지)·③(로그인 사용자 개방 유지)·④(PRD 제안값 그대로) 모두 "현행 가정 유지"로 확정됨(사용자 확인 완료 2026-08-16) — 아래 체크리스트는 원안 그대로 착수 가능.

**목표**: 상품 테이블과 이미지 저장소를 구축한다. 상품은 분류 축의 리프(서브아이템)에 속하면서 동시에 같은 브랜드의 라인/컬러/사이즈를 참조한다.

**관련 파일**

- Supabase 마이그레이션(MCP) — `create_products_table`, `create_product_images_bucket`
- `lib/erp/master/gender.ts` (성별 체크 제약 값 일치)

**구현 체크리스트**

- [x] `products` 테이블 생성 — 공통 컬럼 9종(PRD 6.2) + 아래 컬럼:
  - [x] `sub_item_id uuid not null references public.sub_items(id) on delete restrict`
  - [x] `brand_line_id uuid not null references public.brand_lines(id) on delete restrict`
  - [x] `brand_color_id uuid not null references public.brand_colors(id) on delete restrict`
  - [x] `brand_gender_size_id uuid not null references public.brand_gender_sizes(id) on delete restrict` — Task 023 ①이 단일 사이즈 유지로 확정되어 이 단일 FK 그대로 사용.
  - [x] `gender text not null check (gender in ('male','female','unisex'))`
  - [x] `image_url text` / `thumbnail_url text` (Storage 경로, nullable — 실제 업로드 폼은 Task 040)
  - [x] `season text` / `release_year integer` / `material text` / `cost_price numeric(14,2)` / `sale_price numeric(14,2)` / `sales_status text check (sales_status in ('on_sale','sold_out','discontinued'))` — Task 023 ④ 확정 결과(PRD 제안값 그대로) 반영, 전부 nullable.
- [x] `set_master_audit()` before-update 트리거 연결.
- [x] 인덱스: `(sub_item_id)`, `(brand_line_id)`, `(brand_color_id)`, `(brand_gender_size_id)`, `(gender)`, `(is_active, sort_order)` + `created_by`/`updated_by` FK 커버링 인덱스.
- [x] **교차 브랜드 방지 DB 제약** — `products` insert/update 시 서브아이템·라인·컬러·사이즈의 소속 브랜드가 동일한지 확인하는 `before insert or update` 트리거 `public.check_product_brand_consistency()` 추가(SECURITY DEFINER, 브랜드 역추적 4경로 전부 조인). 트리거 전용 함수라 `set_master_audit()`와 동일하게 PUBLIC 직접 RPC 실행 권한을 회수했다.
- [x] RLS 활성화 — `select`는 authenticated 전체 허용. **INSERT/UPDATE/DELETE는 Task 023 ③ 확정 결과(로그인 사용자 전체 개방 유지)에 따라 `is_admin()` 제한 없이 `to authenticated using (true)/with check (true)`로 적용.**
- [x] Storage 버킷 `product-images` 생성(`public = true`). 업로드(insert/update/delete) Storage 정책은 상품 CRUD 권한(③)과 동일하게 `to authenticated` 전체 허용으로 걸었다.
- [x] 버킷 내 경로 규칙 확정 — `products/{product_id}/original.{ext}`, `products/{product_id}/thumb.{ext}` (실제 업로드 경로 적용은 Task 040에서 구현 — 이번 Task는 버킷/정책 구축까지).

**수락 기준**

- [x] `products` 테이블이 생성되고 4개 FK + `gender` 체크 제약이 동작한다.
- [x] 서로 다른 브랜드의 서브아이템/라인 조합으로 insert 시 브랜드 일관성 트리거가 이를 거부한다.
- [x] `product-images` 버킷이 생성되고 정책이 적용되어 있다.

**테스트 체크리스트**

- [x] `execute_sql`로 동일 브랜드 조합의 상품 1건 insert 성공 확인.
- [x] 다른 브랜드(브랜드2 하위)의 `brand_line_id`를 섞은 insert → 브랜드 일관성 트리거 예외 확인. 컬러·사이즈에 대해서도 각각 1회씩 반복 확인(총 3개 교차 케이스) — 3건 모두 거부됨을 확인.
- [x] `gender='mixed'` 같은 잘못된 값 → 체크 제약 위반(`23514`) 확인.
- [x] `sales_status`에 허용값 외 문자열(`'preorder'`) insert → 체크 제약 위반(`23514`) 확인.
- [x] Storage 버킷에 임시 파일 업로드/조회/삭제 1회 왕복 확인 후 정리 — 실제 이메일 가입으로 임시 인증 사용자를 만들어 access token으로 `product-images/TEST_task028/roundtrip.txt` 업로드 → 공개 URL로 내용 확인 → 삭제 → 404 확인(캐시로 보인 200은 cache-bust 재요청으로 404 재확인). 임시 유저는 `auth.users`에서 삭제.
- [x] Task 023 ③ 확정 결과에 맞춰 `role='user'` 세션의 상품 insert가 **의도한 대로 허용**됨을 확인(로그인 사용자 전체 개방).
- [x] `TEST_%` 행 및 임시 파일/임시 사용자 정리 후 잔존 0건 확인.

---

### Task 029: 타입 재생성 및 마스터 데이터 액세스 계층 구현 ✅

**목표**: Phase 5·6의 모든 화면이 공유할 서버 측 조회 함수와 Server Action을 한 곳에 모은다. **화면 6개가 각자 쿼리를 짜지 않도록 하는 것이 이 Task의 존재 이유다.**

**관련 파일**

- `lib/supabase/database.types.ts` (재생성)
- `lib/erp/master/queries.ts` (신규 — 조회)
- `lib/erp/master/actions.ts` (신규 — Server Actions)
- `lib/erp/master/types.ts` (Task 024 — DB 타입과 매핑 정합성 맞추기)
- `lib/supabase/server.ts`, `lib/erp/auth.ts` (기존 재사용)

**구현 체크리스트**

- [x] `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성 — Task 025/026/028에서 만든 12개 테이블 블록이 반영됨을 확인. weeklyplan 테이블도 함께 생성됨(정상, 같은 프로젝트 공유).
- [x] `lib/erp/master/queries.ts` — 조회 함수(전부 함수 내부에서 `await createClient()` 호출, 전역 변수 없음):
  - [x] `getCompanies({ activeOnly? })`
  - [x] `getBrands(companyId?, { activeOnly? })`
  - [x] `getSmallBrands(brandId, { activeOnly? })` / `getBrandLines(brandId, { activeOnly? })`
  - [x] `getItemTypes(smallBrandId, ...)` / `getItems(itemTypeId, ...)` / `getSubItems(itemId, ...)`
  - [x] `getBrandColorTypes(brandId, ...)` / `getBrandColors(colorTypeId, ...)`
  - [x] `getBrandGenderSizeTypes(brandId, gender, ...)` / `getBrandGenderSizes(sizeTypeId, ...)`
  - [x] `getProducts(filters)` — 검색어(상품코드/상품명, ilike 이스케이프 처리) + 브랜드(라인의 `brand_id`를 `!inner` 조인으로 필터)/서브아이템/성별/사용여부 필터 + 페이지네이션(`range`+`count: "exact"`)
  - [x] `getProductById(productId)` — 상세/수정 폼용, 서브아이템/라인/컬러/사이즈 이름을 임베디드 select로 함께 반환(`ProductDetail`)
  - [x] `getBrandIdOfSubItem(subItemId)` — 교차 브랜드 검증용 브랜드 역추적 (`sub_item → item → item_type → small_brand → brand`), DB의 `check_product_brand_consistency()` 트리거와 같은 경로를 앱 레벨에서 미러링
  - [x] 각 목록 조회의 정렬은 `sort_order` → `name` 순으로 통일 (`buildMenuTree`의 기존 정렬 관례와 동일)
  - [x] `activeOnly` 옵션을 모든 조회 함수에 노출(기본값 `false`=전체 반환) — 하위 등록 폼 드롭다운은 호출부에서 `{ activeOnly: true }`로, 관리 화면 목록은 옵션 생략(전체)으로 사용하는 정책을 함수 시그니처로 강제
- [x] `lib/erp/master/actions.ts` — Server Actions:
  - [x] `createMasterAction(entity, input)` / `updateMasterAction(entity, id, input)` / `deleteMasterAction(entity, id)` / `setMasterActiveAction(entity, id, isActive)` — 12종 엔티티를 엔티티 키로 분기하는 공용 액션 4개로 구현(48개 복제 없음). 테이블별로 다른 Insert/Update 타입과 동적 테이블명이 근본적으로 양립하지 않아, DB 왕복 지점만 `LooseMasterTable`이라는 명시적 타입으로 캐스팅하고 컬럼 매핑 정확성은 `buildEntityFields()`가 엔티티별로 보장한다.
  - [x] **기준정보 11종은 첫 줄에서 `requireAdmin()` 호출**(기존 `lib/erp/auth.ts` 재사용, 새 가드 안 만듦). **상품(product)은 Task 023 ③ 확정 결과에 따라 `getCurrentErpUser()`로 로그인만 확인**(`guardEntity()`가 분기).
  - [x] 등록 시 `rpc("next_master_code", { p_entity })`로 코드를 채번(Task 027) — **Task 029에서 발견한 보정**: DB 함수가 모든 엔티티에 획일적으로 `is_admin()`을 요구해 상품 로그인-사용자 개방과 충돌했으므로, `next_master_code()`를 `product`만 로그인 확인으로 완화하도록 `create or replace`했다(마이그레이션 `adjust_next_master_code_product_permission`).
  - [x] 삭제 시 FK `restrict` 위반(`23503`)을 잡아 **"하위 데이터가 있어 삭제할 수 없습니다. 사용여부를 끄세요."** 한국어 메시지로 변환.
  - [x] 코드 중복(`23505`) → "이미 사용 중인 코드입니다." 로 변환.
  - [x] 반환 타입은 기존 `lib/erp/actions.ts`의 `ActionResult`를 그대로 import해 재사용(실제 필드명은 `message`— 이 Task 설명의 `error`는 오기, 기존 파일 기준을 따름).
  - [x] 변경 후 해당 화면 경로(기준정보는 `MASTER_ENTITIES[entity].route`, 상품은 `/erp/products`)에 `revalidatePath()` 호출.
- [x] 모든 조회 함수가 있는 `queries.ts` 상단에 "`cookies()`를 쓰는 `createClient()`에 의존하므로 호출하는 컴포넌트는 `<Suspense>` 경계가 필요하다"를 명시(기존 `lib/erp/queries.ts` 관례).

**수락 기준**

- [x] `npm run typecheck` 통과 (재생성된 타입 기준), `npm run check-all` 전체 통과(사전 존재하던 무관한 warning 7건 제외 오류 0건).
- [x] 12종 엔티티 전부에 대해 조회/생성/수정/삭제/활성토글 경로가 존재한다(기준정보 11종은 `MASTER_TABLES`/`guardEntity`가 커버, 상품은 `getProducts`/`getProductById` + 동일 4개 액션으로 커버).
- [x] 관리자가 아닌 세션에서 마스터 Server Action 호출 시 `requireAdmin()`이 `/erp/forbidden`으로 리다이렉트한다 — Playwright로 실측 확인.

**테스트 체크리스트 (Playwright MCP + execute_sql)**

검증 방법: `lib/erp/master/*`는 서버 전용이라 브라우저에서 직접 호출할 수 없으므로 ROADMAP_MVP Task 013의 선례대로 **임시 디버그 라우트**(`app/api/debug-task029/route.ts`)를 만들어 실제 로그인 세션(신규 가입시킨 admin/user 임시 계정 2개)으로 검증한 뒤 **검증 완료 즉시 삭제**했다(`git status`로 잔존 없음 확인, 커밋되지 않음).

- [x] 관리자 세션에서 `createMasterAction("company", ...)` 호출 → `execute_sql`로 `code`가 `C1001`로 자동 채번되어 저장됨을 확인.
- [x] 하위 브랜드가 있는 법인에 `deleteMasterAction` 호출 → 한국어 에러 메시지("하위 데이터가 있어 삭제할 수 없습니다...") 반환 확인.
- [x] 중복 코드로 `updateMasterAction` 호출 → "이미 사용 중인 코드입니다." 반환 확인.
- [x] 일반 사용자(`role='user'`) 세션에서 동일 액션(디버그 라우트) 호출 → 실제 브라우저가 `/erp/forbidden`으로 리다이렉트됨을 Playwright로 확인.
- [x] `getBrandIdOfSubItem()`이 5단 역추적으로 정확한 브랜드 id를 반환하는지 확인 — 법인→브랜드→소브랜드→아이템타입→아이템→서브아이템 전체 체인을 실제로 생성해 `resolvedBrandId === expectedBrandId` 일치 확인.
- [x] `activeOnly` 정책이 의도대로 동작하는지 확인 — 활성 1건/비활성 1건 브랜드를 만들어 `activeOnly: true` 시 1건, 생략 시 2건 반환됨을 확인.
- [x] 임시 디버그 라우트, 테스트 데이터, 임시 계정(admin/user 2개) 삭제 및 소비된 시퀀스 6종 원복 후 잔존 0건 확인.

---

## Phase 4: 메뉴 재구성 및 역할 하드 게이트 ✅

> PRD 3장 / 4장.
> 기존 `menus` 데이터를 PRD 4.3 매핑대로 갱신하고, 기준정보 5개 화면에 역할 기반 하드 게이트를 적용한다.
> **Phase 3과 병렬 착수 가능하다** — 스키마와 무관한 메뉴/라우팅 작업이다.

### Task 030: menus 데이터 마이그레이션 (6개 → 5개 재구성) ✅

> 완료(2026-08-17) — `restructure_master_reference_menus` 마이그레이션 1건으로 UPDATE 3건 + DELETE 1건 적용, "기준정보 관리" 하위가 6건 → 5건으로 재구성됨.

**목표**: "마스터 관리 > 기준정보 관리" 하위 소분류를 PRD 4.3 매핑대로 이름 변경·삭제·재정렬한다.

**관련 파일**

- Supabase 마이그레이션(MCP) — `restructure_master_reference_menus`
- `docs/prd/PRD_MASTER.md` 4.3절 (매핑 원본)

**구현 체크리스트**

- [x] 착수 전 `execute_sql`로 현재 메뉴 id를 재확인한다(아래는 2026-08-16 실 DB 조회 기준 검증값 — PRD 4.3절 표의 축약 id와 대조할 것): **2026-08-17 착수 직전 재조회 결과 6개 행의 id/name/sort_order/is_active가 아래 표와 100% 일치함을 확인**(추가로 부모 "기준정보 관리"(`f5a736ee-...`)의 parent가 "마스터 관리"(`d3346981-...`)인 것, 상품 관리 중분류(`c6907660-...`) 하위가 "상품 관리"(`9a24138f-...`)/"상품 정보 현황"(`e33f1017-...`)/"상품 정보 일괄 수정"(`2dc0ea47-...`) 3건인 것도 함께 재확인).

  | 기존 메뉴명            | id                                     | 처리       | 신규 메뉴명            | 신규 `sort_order` |
  | ---------------------- | -------------------------------------- | ---------- | ---------------------- | ----------------- |
  | 법인 관리              | `d511a97c-a9ff-4c57-9f73-c7a7d69bdd7c` | **유지**   | 법인 관리              | 0                 |
  | 브랜드 관리            | `c5d91f1a-e154-43e8-baa3-53735c2001d8` | **UPDATE** | 브랜드 구조 관리       | 1                 |
  | 소브랜드 관리          | `dbbde663-9417-4fb8-9869-284dcc81fb82` | **DELETE** | — (브랜드 구조로 통합) | —                 |
  | 아이템/서브아이템 관리 | `8bdbe430-ee06-4995-b70d-72272058b86d` | **UPDATE** | 상품 분류 관리         | 2                 |
  | 상품 컬러 관리         | `48641dd2-924c-447f-b97e-8e063066b926` | **UPDATE** | 컬러 관리              | 3                 |
  | 상품 사이즈 관리       | `2db7f963-885d-4078-834c-aefcd1b8251f` | **UPDATE** | 사이즈 관리            | 4                 |
  - 부모 노드 "기준정보 관리" = `f5a736ee-b72e-4379-97d9-385f04f1bf36` (level 2, 부모 "마스터 관리")
  - 상품 관리 중분류 = `c6907660-26f2-470a-b5f2-af62ac960854`, 그 하위 "상품 관리" 소분류 = `9a24138f-4e24-43ec-a41c-570d51b53960` — **이 3개 상품 메뉴는 손대지 않는다**(PRD 4.2)

- [x] UPDATE 3건 적용 (`name` + `sort_order` 동시 갱신) — 적용 후 재조회로 `c5d91f1a-...`="브랜드 구조 관리"(1), `8bdbe430-...`="상품 분류 관리"(2), `48641dd2-...`="컬러 관리"(3) 확인.
- [x] "법인 관리" `sort_order`를 0으로 확정(현재 0, 변경 없음이면 그대로 기록) — 조회 결과 0 유지 확인.
- [x] DELETE 1건 적용 — "소브랜드 관리". **삭제 전 `user_menu_permissions`에 이 메뉴 권한이 부여된 사용자가 있는지 조회**하고, 있으면 "브랜드 구조 관리"(`c5d91f1a-...`) 권한으로 이관한 뒤 삭제한다(`menus`의 `on delete cascade`가 권한 행을 함께 지우므로 이관을 먼저 해야 함). **사전 조회 결과 `menu_id='dbbde663-...'` 권한 보유자 0건 — 이관 대상 없음**(마이그레이션 SQL에는 향후 재현성을 위해 조건부 이관 UPDATE를 no-op으로 포함). DELETE 후 해당 id로 재조회 시 0건 확인.
- [x] 마이그레이션은 **하나의 트랜잭션**으로 적용하고, 적용 전 대상 6개 행의 스냅샷을 마이그레이션 주석에 남긴다(롤백 근거) — `mcp__supabase__apply_migration`(단일 SQL, 원자적 적용)으로 처리, 스냅샷+롤백 SQL을 마이그레이션 상단 주석에 기록.
- [x] 적용 후 `execute_sql`로 기준정보 관리 하위가 정확히 5건이고 `sort_order`가 0~4로 연속인지 확인 — 5건, `sort_order` 0/1/2/3/4 연속 확인.

**수락 기준**

- [x] "마스터 관리 > 기준정보 관리" 하위 소분류가 법인 관리 / 브랜드 구조 관리 / 상품 분류 관리 / 컬러 관리 / 사이즈 관리 5건이다 — `execute_sql`로 재확인.
- [x] "소브랜드 관리" 메뉴와 그에 딸린 `user_menu_permissions` 행이 남아 있지 않다(권한은 사전 이관됨) — 메뉴 0건, 권한 0건 확인(원래도 권한 보유자 0명이었음).
- [x] 상품 관리 중분류 및 그 하위 3개 소분류는 이름·정렬·활성 상태가 그대로다 — 마이그레이션 전후 동일 쿼리로 대조, 변경 없음 확인.

**테스트 체크리스트 (Playwright MCP)**

- [x] 관리자 계정 로그인 → `/erp` → 상단 Menubar "마스터 관리" → 좌측 트리 "기준정보 관리" 펼침 → 5개 메뉴가 PRD 4.2 순서대로 노출되는지 육안 확인 — 임시 관리자 계정(`task030-erp-test@example.com`, 회원가입 후 `profiles.role`을 `admin`으로 SQL 승격)으로 로그인해 트리를 펼친 결과 "법인 관리 → 브랜드 구조 관리 → 상품 분류 관리 → 컬러 관리 → 사이즈 관리" 순서로 정확히 5건 노출 확인.
- [x] 삭제된 "소브랜드 관리"의 기존 URL(`/erp/menu/dbbde663-9417-4fb8-9869-284dcc81fb82`)에 직접 접근 → `app/erp/not-found.tsx`(404 화면)가 뜨는지 확인 (PRD 13장 성공 기준의 "URL 직접 접근 시 정상 처리"에 해당) — 인증 세션 상태로 직접 접근 시 "메뉴를 찾을 수 없습니다" 화면(ErpShell 안, `dict.erp.notFound`) 렌더링 확인.
- [x] "상품 관리" 중분류 하위 3개 메뉴가 회귀 없이 그대로 동작하는지 확인 — 트리에서 "상품 관리" 펼침 → "상품 관리"/"상품 정보 현황"/"상품 정보 일괄 수정" 3건 그대로 노출 확인.
- [x] `execute_sql`로 마이그레이션 전/후 행 수를 대조(기준정보 관리 하위 6 → 5) — 전 6건 → 후 5건 확인.
- [x] `browser_console_messages`로 콘솔 에러 0건 확인 — 로그인/트리 펼침/404 접근 전 시나리오에서 에러 0건.
- [x] (추가) 임시 관리자 계정 및 관련 데이터 삭제 후 잔존 0건 확인 — `auth.users`/`profiles`/`user_menu_permissions` 전부 0건.
- [x] (추가) `npm run check-all` 통과 확인 — typecheck/lint(기존 warning 7건만 유지, 신규 없음)/format:check 모두 통과(이번 Task는 순수 데이터 마이그레이션이라 코드 변경 없음).

---

### Task 031: 기준정보 라우트 골격 및 역할 하드 게이트 적용 ✅

> 완료(2026-08-17) — `app/erp/master/layout.tsx` 신설로 5개 화면에 `requireAdmin()` 하드 게이트를 일괄 적용하고, `lib/erp/menu-routes.ts`를 `MENU_ROUTES`로 개명하며 6개 라우트 매핑을 추가함. 임시 계정 3개(superadmin/admin/user)로 Playwright 검증 후 전부 삭제, 콘솔 에러 0건, `npm run check-all` 통과.

**목표**: 기준정보 5개 화면과 상품 화면의 라우트를 스캐폴딩하고, 메뉴 → 실제 라우트 매핑과 관리자 하드 게이트를 연결한다. **Phase 5의 5개 화면 Task가 서로 독립적으로 착수할 수 있게 하는 선행 작업이다.**

**관련 파일**

- `app/erp/master/layout.tsx` (신규 — `requireAdmin()` 가드)
- `app/erp/master/companies/page.tsx`, `app/erp/master/brands/page.tsx`, `app/erp/master/item-categories/page.tsx`, `app/erp/master/colors/page.tsx`, `app/erp/master/sizes/page.tsx` (신규, 스텁)
- `app/erp/products/page.tsx` (신규, 스텁 — **`requireAdmin()` 가드 없음**)
- `lib/erp/menu-routes.ts` (기존 — `ADMIN_MENU_ROUTES` → `MENU_ROUTES` 개명 + 6개 매핑 확장)
- `lib/erp/auth.ts` (기존 재사용, 무수정)
- `components/erp/page-header.tsx` (기존 재사용)
- `lib/erp/master/entities.ts` (부수 수정 — Task 024의 가칭 route 값을 실제 라우트로 정정)

**구현 체크리스트**

- [x] `app/erp/master/layout.tsx`를 얇은 `Layout` + `<Suspense>` + `async` 가드 컴포넌트 패턴으로 작성하고, 가드에서 **기존 `requireAdmin()`을 호출**한다. 새 가드 함수·새 DB 함수를 만들지 않는다. 이것으로 PRD 3.1의 "`user_menu_permissions` 부여 여부와 무관한 역할 하드 게이트"가 5개 화면 전체에 한 번에 적용된다 — `app/erp/admin/layout.tsx`와 동일한 구조로 작성, `requireAdmin()`을 새로 만들지 않고 그대로 import해 재사용함을 확인.
- [x] 기준정보 5개 페이지를 스텁("Task 0NN에서 구현됩니다" 안내 문구 + `PageHeader`)으로 생성 — Task 014에서 관리자 3개 화면을 스텁으로 먼저 만들어 가드를 검증한 선례와 동일. Task 번호는 각각 companies→033, brands→034, item-categories→035, colors→036, sizes→037로 표기.
- [x] `app/erp/products/page.tsx` 스텁 생성 — **`app/erp/master/` 아래가 아닌 별도 세그먼트**에 두어 `requireAdmin()` 가드가 걸리지 않게 한다(PRD 1.2: 상품 권한은 기존 유지). "Task 038에서 구현됩니다" 문구 표기.
- [x] `lib/erp/menu-routes.ts`의 매핑 테이블에 6개 매핑 추가 — 착수 전 `execute_sql`로 실 DB `menus` 이름 경로를 재확인(법인 관리/브랜드 구조 관리/상품 분류 관리/컬러 관리/사이즈 관리/상품 관리 6건 100% 일치 확인) 후 진행:
  - `"마스터 관리>기준정보 관리>법인 관리"` → `/erp/master/companies`
  - `"마스터 관리>기준정보 관리>브랜드 구조 관리"` → `/erp/master/brands`
  - `"마스터 관리>기준정보 관리>상품 분류 관리"` → `/erp/master/item-categories`
  - `"마스터 관리>기준정보 관리>컬러 관리"` → `/erp/master/colors`
  - `"마스터 관리>기준정보 관리>사이즈 관리"` → `/erp/master/sizes`
  - `"마스터 관리>상품 관리>상품 관리"` → `/erp/products`
- [x] 상수명 `ADMIN_MENU_ROUTES`가 이제 관리자 전용이 아닌 매핑도 담게 되므로 `MENU_ROUTES`로 개명하고, `getAdminRouteForMenuPath`/`getMenuPathForAdminRoute`도 `getRouteForMenuPath`/`getMenuPathForRoute`로 정리했다(호출부: `app/erp/menu/[menuId]/page.tsx`, `app/erp/admin/{users,menus,permissions}/page.tsx` 4개 파일 — `grep`으로 전수 확인 후 갱신. `components/erp/page-header.tsx`는 실제로는 이 매핑을 직접 참조하지 않아 변경 불필요했음, 착수 시 재확인).
- [x] `app/erp/menu/[menuId]/page.tsx`의 기존 판정 순서("존재 여부 → `canAccessMenu` → 라우트 매핑 리다이렉트")를 **변경하지 않았다** — 새 매핑 6건이 그 흐름에 자연히 얹히도록 함수명만 교체.
- [x] 각 스텁 페이지에서 `PageHeader`로 breadcrumb("마스터 관리 > 기준정보 관리 > 법인 관리" 등)을 표시한다 — `getMenuPathForRoute()` 재사용으로 DB 왕복 없이 처리.
- [x] **부수 수정**: `lib/erp/master/entities.ts`의 `MASTER_ENTITIES` route 필드가 Task 024 작성 당시의 가칭 라우트(`/erp/master/brand-structure`, `/erp/master/product-classification`)를 그대로 갖고 있어 이번 Task에서 확정된 실제 라우트(`/erp/master/brands`, `/erp/master/item-categories`)와 어긋나 있던 것을 발견해 함께 수정했다. `lib/erp/master/actions.ts`가 저장 후 이 `route` 값으로 `revalidatePath()`를 호출하므로 방치하면 Task 032 이후 캐시 무효화가 조용히 실패했을 것이다.

**수락 기준**

- [x] 트리에서 기준정보 5개 메뉴 클릭 시 `MenuPlaceholder`가 아니라 각 실제 라우트로 이동한다 — admin 계정으로 "브랜드 구조 관리" 트리 노드 클릭 → `/erp/master/brands?cat=...&menu=...`로 정상 리다이렉트 확인.
- [x] `role='user'` 계정이 **`user_menu_permissions`로 해당 메뉴 권한을 부여받았더라도** `/erp/master/*` 5개 경로 전부에서 `/erp/forbidden`으로 차단된다 (PRD 13장 성공 기준 2번) — 5개 메뉴 권한을 모두 부여한 user 계정으로 트리 클릭 및 직접 URL 진입 모두 `/erp/forbidden` 확인.
- [x] `role in ('admin','superadmin')` 계정은 별도 권한 부여 없이 5개 화면에 진입한다 (PRD 13장 성공 기준 3번) — admin/superadmin 두 계정 모두 `user_menu_permissions` 부여 없이 5개 URL 전부 정상 진입 확인.
- [x] `/erp/products`는 기존과 동일하게 `user_menu_permissions` 기반으로만 통제되고 `role='user'`도 권한이 있으면 진입한다 — "상품 관리" 메뉴 권한만 가진 user 계정으로 `/erp/products` 정상 진입 확인.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 3개(superadmin 1 / admin 1 / user 1)로 검증 후 즉시 삭제(`auth.users` 삭제 → `profiles` cascade, 잔존 0건 확인)

- [x] **일반 사용자에게 기준정보 5개 메뉴 권한을 전부 부여한 뒤** 로그인 → 트리에는 메뉴가 보이지만 클릭 시 5개 전부 `/erp/forbidden`으로 리다이렉트되는 것을 확인 (하드 게이트가 메뉴 권한을 이긴다는 핵심 시나리오) — 트리에 5개 메뉴 모두 노출, "법인 관리" 클릭 시 `/erp/forbidden` 확인.
- [x] 같은 일반 사용자로 `/erp/master/companies` 등 5개 URL 직접 입력 → 전부 `/erp/forbidden` 확인 — 5개 URL 전부 `/erp/forbidden`으로 리다이렉트됨을 개별 확인.
- [x] admin 계정으로 권한 부여 없이 5개 화면 진입 성공 확인 — 5개 URL 전부 정상 렌더링(스텁 콘텐츠 + breadcrumb) 확인.
- [x] superadmin 계정으로도 동일하게 진입 성공 확인(`is_admin()`이 superadmin을 포함하는지 앱 레벨에서 재확인) — `/erp/master/item-categories` 진입 성공으로 확인(`isAdminRole()`이 admin/superadmin 모두 true 판정, `prevent_unauthorized_role_change` 트리거로 인해 승격은 admin 경유 후 superadmin으로 2단계 처리해야 함을 확인).
- [x] 일반 사용자에게 "상품 관리" 메뉴 권한만 부여 → `/erp/products` 진입 성공 확인(상품은 하드 게이트 대상이 아님) — 정상 진입 및 breadcrumb("마스터 관리 > 상품 관리") 확인.
- [x] 미인증 상태로 `/erp/master/companies` 접근 → `/auth/login` 리다이렉트 확인(`proxy.ts` 회귀 없음) — 로그아웃 후 직접 접근 시 `/auth/login`으로 리다이렉트 확인, `proxy.ts`/`lib/supabase/proxy.ts`는 무수정.
- [x] `browser_console_messages`로 전 시나리오 콘솔 에러 0건 확인 — 전체 세션 누적 콘솔 메시지 중 error 0건.
- [x] `npm run check-all` 통과 — typecheck 0 에러, lint는 기존 warning 7건만 유지(신규 없음), format:check 통과(이 Task가 건드린 파일 기준).

---

## Phase 5: 기준정보 관리 5개 화면 구현 ✅

> PRD 6.3 / 7.1~~7.5.
> **공통 마스터-디테일 컴포넌트를 먼저 만들고(Task 032), 5개 화면이 그것을 재사용한다.** 화면마다 테이블·폼·삭제 다이얼로그를 복제하면 5배의 중복이 생긴다.
> Task 033~~037은 Task 032 완료 후 **서로 독립적으로 병렬 개발 가능**하다.

### Task 032: 마스터-디테일 공통 UI 컴포넌트 구현 ✅

**목표**: 5개 화면이 공유할 "좌측 트리 + 우측 목록 + 슬라이드 상세 패널 + 등록/수정 폼 + 삭제 다이얼로그"를 한 번만 구현한다.

**관련 파일**

- `components/erp/master/master-detail-layout.tsx` (신규 — 좌우 2분할 셸)
- `components/erp/master/master-tree-panel.tsx` (신규 — 좌측 계층 트리 + 검색)
- `components/erp/master/master-list-table.tsx` (신규 — 우측 목록: 코드/명칭/사용여부/정렬순서/비고)
- `components/erp/master/master-form-sheet.tsx` (신규 — 등록/수정 슬라이드 패널)
- `components/erp/master/master-delete-dialog.tsx` (신규 — 참조 존재 시 안내)
- `components/erp/master/sort-order-cell.tsx` (신규 — 위/아래 이동 버튼)
- `components/erp/master/color-swatch-input.tsx` (신규 — HEX 입력 + 미리보기, Task 036에서 사용)
- `lib/erp/master/entities.ts` (Task 024 — 엔티티 메타 소비)
- `lib/erp/master/actions.ts` (**부수 수정** — `createMasterAction`이 자동 채번된 `code`를 응답에 포함하도록 반환 타입을 `ActionResult & { code?: string }`로 확장, 형제 `sort_order` 교환용 `moveMasterEntityAction` 신규 추가)
- `components/ui/{sheet,table,tree-view,switch,badge,alert-dialog,input,textarea,button}.tsx` (기존 재사용)

**구현 체크리스트**

- [x] `MasterDetailLayout` — PRD 6.3 와이어프레임대로 좌측 트리(고정 폭) + 우측 목록의 2분할. **ERP 셸(`app/erp/layout.tsx`)의 좌측 메뉴 트리와 별개의 2차 트리**이므로, 데스크탑에서 3분할(ERP 트리 + 마스터 트리 + 목록)이 되어도 가로가 좁아지지 않도록 마스터 트리는 `w-56` 수준으로 잡고 각 영역이 독립 스크롤(`overflow-y-auto`)되게 한다.
- [x] 반응형: `lg` 미만에서는 좌측 트리를 접히는 패널 또는 상단 드롭다운으로 전환해 목록이 가로 스크롤되지 않게 한다. — `lg` 미만에서는 상단 "트리 열기" 버튼 + `Sheet(side="left")` 드로어로 전환. 드로어 열림 상태는 컴포넌트가 아니라 이를 조합하는 화면이 소유하게 해(`mobileTreeOpen`/`onMobileTreeOpenChange` 컨트롤드 props), 트리 노드 선택 시 화면 쪽에서 곧바로 드로어를 닫을 수 있게 했다(Playwright로 768px에서 확인).
- [x] `MasterTreePanel` — 기존 `components/ui/tree-view.tsx` 재사용. **주의**: ROADMAP_MVP Task 017에서 확인된 대로 `TreeView`의 그룹 노드는 Radix Accordion(`<button>`)이라 그 안에 버튼/체크박스를 중첩하면 무효 HTML + hydration 에러가 난다. 트리 노드에는 인터랙티브 요소를 넣지 말고 **선택만** 담당하게 한다. — `renderItem`에 텍스트 + `Badge`(비활성 표시)만 렌더링해 인터랙티브 요소 중첩을 피했다.
- [x] **좌측 트리 선택 시 트리 자체는 리렌더되지 않고 우측만 갱신**되게 한다(PRD 6.3). 선택 상태는 URL 쿼리(`?companyId=&brandId=` 등)로 관리해 새로고침/딥링크에서도 유지되게 한다 — `erp-menubar.tsx`가 `?cat=`을 쓰는 기존 패턴과 동일. — `MasterTreePanel`은 URL을 직접 다루지 않는 순수 컨트롤드 컴포넌트(`selectedId`/`onSelect`)로 설계해, 화면마다 쿼리 키 이름이 달라도(`?companyId=`, `?brandId=` 등) 그대로 재사용 가능하게 했다. 선택 클릭은 `key`를 바꾸는 강제 리마운트 없이 처리되므로 트리 접힘 상태가 유지된다(단, 트리를 거치지 않는 외부 내비게이션으로 선택이 바뀌는 극단적 케이스는 마운트 시점에만 하이라이트가 반영되는 한계를 코드 주석으로 남겼다).
- [x] `MasterListTable` — 컬럼: 코드 / 명칭 / 사용여부(`Switch`) / 정렬순서(위·아래 버튼) / 비고 / 행 클릭 시 상세 패널 오픈. `@tanstack/react-table` 직접 사용(`components/erp/admin/user-table.tsx`와 동일한 결정 — `data-table.tsx`는 툴바를 얹기 어려움).
- [x] `MasterFormSheet` — `Sheet` 기반 슬라이드 패널. 필드: 코드(등록 시 "자동 생성" 안내 후 저장 결과 표시 / 수정 시 편집 가능) / 명칭(필수) / 상위(읽기 전용 — 좌측 트리 선택값) / 사용여부 / 정렬순서 / 비고. `components/ui/form.tsx`(react-hook-form) 대신 `useState` 제어 입력으로 구현(Task 015/016과 동일한 기존 결정).
  - [x] **다이얼로그/시트를 열 때 `useEffect`로 폼 상태를 초기화하지 않는다** — `react-hooks/set-state-in-effect` 린트에 걸린다. Task 016의 해법(폼 필드 서브컴포넌트를 `open`일 때만 마운트해 `useState` 초기값으로 계산)을 그대로 따랐다(`MasterFormSheet` → `open`일 때만 `MasterFormFields` 마운트).
  - [x] 코드 직접 수정 시 `isValidCode()`(Task 024)로 클라이언트 1차 검증 + 서버 unique 위반 메시지 표시(이중 방어) — Playwright로 `C10`(형식 오류, 서버 요청 없이 즉시 차단) / 중복 코드(서버 `23505` → "이미 사용 중인 코드입니다." 인라인 표시) 둘 다 확인.
- [x] `MasterDeleteDialog` — `AlertDialog` 기반. 삭제 실행 후 서버가 FK `restrict` 에러를 반환하면 **"하위/참조 데이터가 있어 삭제할 수 없습니다. 대신 사용여부를 꺼주세요."** 안내와 함께 "사용여부 끄기" 버튼을 제공한다(PRD 6.3). — Radix `AlertDialogAction`은 클릭 시 기본적으로 다이얼로그를 닫으므로(Context7로 Radix Dialog.Close 합성 동작 확인), `event.preventDefault()`로 기본 닫힘을 막고 실패 시에만 안내 UI로 전환하도록 구현.
- [x] `SortOrderCell` — 형제 노드 간 `sort_order` 교환(위/아래). Task 016의 `moveMenuAction` 방식(같은 부모의 형제만 조회 후 인접 형제와 교환)을 마스터 엔티티용으로 일반화. — `lib/erp/master/actions.ts`에 `moveMasterEntityAction` 신규 추가, 엔티티별 "형제" 스코프 컬럼(예: 사이즈타입은 `brand_id`+`gender` 복합)을 `MASTER_SCOPE_COLUMNS`로 일반화.
- [x] `ColorSwatchInput` — HEX 6자리 입력 + 실시간 미리보기 스와치. `#` 접두사 입력을 허용하되 저장 값에서는 제거(Task 023 ⑤ 결정).
- [x] 하드코딩 색상 금지 — 스와치 미리보기(사용자 데이터 색상)를 제외한 모든 UI 색상은 `--background`/`--primary` 등 CSS 변수 토큰만 사용한다(ROADMAP_MVP Task 010에서 확립한 전수 규칙).
- [x] 비활성(`is_active=false`) 행은 `Badge`로 "비활성" 표시하되 관리 목록에서는 계속 보이게 한다(Task 016의 메뉴 관리와 동일 정책).

**수락 기준**

- [x] 5개 화면이 이 컴포넌트들만 조합해 구현 가능한 수준의 props 인터페이스를 갖는다(엔티티별 분기는 `entities.ts` 메타로 흡수) — Task 033(법인 관리, 트리 없음)과 임시 검증 페이지(법인→브랜드, 트리 있음) 둘 다로 실제 조합 검증 완료.
- [x] 좌측 트리 선택 → 우측만 갱신되고 트리 접힘 상태가 유지된다.
- [x] 데스크탑(1440px) / 태블릿(768px) / 모바일(390px) 3개 뷰포트에서 레이아웃이 깨지지 않는다 — 세 뷰포트 모두 `document.body.scrollWidth === window.innerWidth` 확인(가로 스크롤 없음), 테이블은 자체 `overflow-x-auto`로만 스크롤.

**테스트 체크리스트 (Playwright MCP)** — 실제 확인 결과, Task 033(법인 관리)과 함께 종합 검증

- [x] `browser_resize`로 1440 / 768 / 390px 순회하며 `browser_take_screenshot`으로 2분할 레이아웃 확인 — 1440px: ERP 트리 + 마스터 트리(`w-56`) + 목록 3분할 정상. 768px/390px: 트리가 상단 버튼 + `Sheet` 드로어로 전환, 목록은 가로 스크롤 없이 표시.
- [x] 라이트/다크 양쪽에서 트리 선택 하이라이트·비활성 배지 대비 확인 — 스크린샷으로 확인, 둘 다 식별 가능.
- [x] 트리 노드 안에 `<button>` 중첩이 없는지 `browser_console_messages`로 hydration 에러 0건 확인 (Task 017에서 실제 발생했던 회귀 지점) — 세션 전체(로그인/회원가입/CRUD/삭제/뷰포트 전환 포함)에서 `browser_console_messages(level: "error"/"warning", all: true)` 결과 에러·경고 0건.
- [x] 키보드만으로 트리 노드 포커스 → Enter 선택 → 우측 테이블 행 포커스 → Enter로 상세 패널 오픈이 가능한지 확인 — 검색창 → Tab(트리 리프 포커스) → Enter(선택, URL 갱신) → 테이블 검색창 → Tab(행 포커스) → Enter(수정 시트 오픈)까지 전부 마우스 없이 확인.
- [x] `npm run check-all` 통과.

**검증 방법 참고**: 이 컴포넌트들만으로는 화면이 완성되지 않으므로, Task 033(법인 관리, 트리 없는 단일 목록형)을 함께 구현해 실사용으로 검증했고, 트리 조합(`MasterDetailLayout`+`MasterTreePanel`)은 법인→브랜드 계층으로 만든 임시 라우트(`app/erp/master/tree-story/*`, Playwright 검증 직후 삭제 — 커밋된 적 없음)로 별도 검증했다. 임시 관리자 계정 2개(`task032-erp-test@example.com`, `task032b-erp-test@example.com`)와 테스트 법인 4건(`C1001`~`C1004`) + 브랜드 1건(`B1001`)으로 검증 후 전부 삭제, `execute_sql`로 `companies`/`brands`/해당 `profiles`/`auth.users` 잔존 0건 확인.

---

### Task 033: 법인 관리 화면 구현 (PRD 7.1) ✅

**목표**: 5개 화면 중 가장 단순한 단일 목록형 화면을 먼저 완성해, Task 032의 공통 컴포넌트와 Task 029의 액션 계층을 실사용으로 검증한다.

**관련 파일**

- `app/erp/master/companies/page.tsx` (스텁 → 실 구현)
- `components/erp/master/company-manager.tsx` (신규)
- `lib/erp/master/queries.ts` / `lib/erp/master/actions.ts` (기존 — `getCompanies`, `createMasterAction("company", ...)` 등)

**구현 체크리스트**

- [x] **좌측 트리 없는 단일 목록형**으로 구현한다 — 5개 화면 중 유일하게 마스터-디테일이 아님(PRD 7.1). `MasterDetailLayout`을 쓰지 않고 `MasterListTable` + `MasterFormSheet`만 조합.
- [x] 목록 컬럼: 법인코드 / 법인명 / 사용여부 / 정렬순서 / 비고 / 등록일.
- [x] 우상단 "+ 법인 등록" 버튼 → `MasterFormSheet` 오픈. 코드는 저장 시 `C####`로 자동 채번됨을 폼에 안내.
- [x] 행 클릭 → 상세/수정 슬라이드 패널. 코드 직접 수정 가능.
- [x] 사용여부 `Switch` 토글 → `setMasterActiveAction("company", ...)`.
- [x] 정렬순서 위/아래 버튼 → 형제(= 전체 법인) 간 `sort_order` 교환.
- [x] 삭제 → 하위 브랜드가 있으면 FK `restrict`로 거부되고 `MasterDeleteDialog`가 "사용여부 끄기" 안내를 표시.
- [x] 코드/법인명 검색 필터(클라이언트 사이드 `useMemo`) + 페이지네이션(`getPaginationRowModel`) — 검색/페이지네이션은 `MasterListTable`(Task 032 공통 컴포넌트) 내부에 구현되어 있어 재사용만 했다.
- [x] 저장/삭제 후 `revalidatePath("/erp/master/companies")` — `lib/erp/master/actions.ts`의 공용 액션(`createMasterAction`/`updateMasterAction`/`deleteMasterAction`/`setMasterActiveAction`/`moveMasterEntityAction`)이 `MASTER_ENTITIES["company"].route`로 이미 처리.
- [x] 페이지는 얇은 `Page` + `<Suspense>` + `async CompaniesContent` 패턴으로 작성.

**수락 기준**

- [x] 등록 / 수정 / 삭제 / 사용여부 토글 / 정렬 5개 동작이 모두 동작하고 새로고침 후 유지된다.
- [x] 등록 시 코드가 `C1001` 형식으로 자동 채번된다 — 실제로는 시퀀스가 이전 테스트 회차부터 이어지므로 `C1001`, `C1002`, `C1003`, `C1004` 순으로 채번됨을 확인(형식 자체는 항상 `C####`).
- [x] 하위 브랜드가 있는 법인은 삭제되지 않고 안내 문구가 표시된다.

**테스트 체크리스트 (Playwright MCP)** — 실제 확인 결과. 임시 관리자 계정 2개(`task032-erp-test@example.com`, `task032b-erp-test@example.com`) + 테스트 법인 4건(`C1001`~`C1004`) + 브랜드 1건(`B1001`)으로 검증 후 전부 삭제(잔존 0건 확인)

- [x] "+ 법인 등록" → 법인명만 입력 후 저장 → 목록에 즉시 반영, 토스트에 채번된 코드 표시 확인("법인을(를) 등록했습니다. (코드: C1001)") — `execute_sql` 없이도 토스트로 즉시 확인 가능하도록 Task 032에서 `createMasterAction`이 `code`를 반환하게 개선했고, 실제로 `C1001`/`C1002`/`C1003`/`C1004` 전부 확인.
- [x] 법인명 미입력 저장 시도 → "명칭을 입력해주세요." 인라인 에러 + `aria-invalid` 확인(요청 자체가 발생하지 않는 클라이언트 검증) — 확인 완료(PRD 문구는 "법인명을"이었으나 `MasterFormSheet`가 엔티티 공용 컴포넌트라 "명칭을 입력해주세요."로 통일, 5개 화면에서 일관된 문구).
- [x] 코드를 잘못된 형식(`C10`)으로 수정 저장 → 클라이언트 검증 에러 확인. 다른 법인의 코드로 수정 → 서버 unique 에러("이미 사용 중인 코드입니다.") 확인 — 둘 다 확인.
- [x] 사용여부 off → "비활성" 배지 즉시 표시, 새로고침 후 유지 확인.
- [x] 정렬순서 "아래로" 클릭 → 인접 행과 순서 교체 확인, 새로고침 후 유지 확인.
- [x] 하위 브랜드가 있는 법인 삭제 시도 → 안내 다이얼로그 확인 → "사용여부 끄기"로 대체 처리되는지 확인.
- [x] 하위가 없는 법인 삭제 → 목록에서 사라지고 `execute_sql`로 DB에서도 삭제 확인.
- [x] 검색어 입력 → 필터링 확인(예: "법인 A" 검색 시 총 2건 → 1건으로 축소). 페이지네이션은 `MasterListTable`이 `useEffect`로 검색어 변경 시 `pageIndex`를 0으로 리셋하는 것을 코드로 확인(`user-table.tsx`와 동일 패턴).
- [x] `browser_console_messages`로 콘솔 에러 0건, `npm run check-all` 통과 확인.

---

### Task 034: 브랜드 구조 관리 화면 구현 (PRD 7.2) ✅

**목표**: 법인 > 브랜드 > (소브랜드 | 라인) 계층을 한 화면에서 관리한다. 소브랜드와 라인이 **형제 관계**임을 탭으로 표현하는 것이 이 화면의 핵심이다.

**관련 파일**

- `app/erp/master/brands/page.tsx` (스텁 → 실 구현)
- `components/erp/master/brand-structure-manager.tsx` (신규)
- `components/erp/master/*` (Task 032 공통 컴포넌트)
- `components/ui/tabs.tsx` (기존 재사용)

**구현 체크리스트**

- [x] 좌측 트리: 법인 → 브랜드 2단계. 법인 노드 선택 시 우측에 해당 법인의 **브랜드 목록**, 브랜드 노드 선택 시 우측에 **[소브랜드] / [라인] 탭**을 표시한다(PRD 7.2 와이어프레임).
- [x] 좌측 트리에 검색창 배치(법인명/브랜드명 필터) — `MasterTreePanel`(Task 032)이 이미 검색창을 내장하고 있어 추가 구현 없이 재사용만 했다.
- [x] 소브랜드와 라인은 **브랜드의 형제 자식**이며 소브랜드가 라인의 상위가 아님을 UI로 명확히 한다 — 트리에 소브랜드/라인 노드를 펼치지 않고 우측 탭으로만 분리(트리가 과도하게 깊어지는 것을 방지, PRD 4.2 각주).
- [x] 브랜드 등록/수정 폼 필드: 브랜드코드(`B####` 자동) / 브랜드명 / 소속 법인(좌측 선택값, 읽기 전용) / 사용여부 / 정렬순서 / 비고.
- [x] 소브랜드 폼: 소브랜드코드(`SB####`) / 소브랜드명 / 소속 브랜드(읽기 전용) / 사용여부 / 정렬순서 / 비고.
- [x] 라인 폼: 라인코드(`BL####`) / 라인명 / 소속 브랜드(읽기 전용) / 사용여부 / 정렬순서 / 비고.
- [x] 탭에 각 하위 건수 배지 표시("소브랜드 2" / "라인 2") — `TabsTrigger` 안에 `Badge`(variant="secondary")로 구현.
- [x] 선택 상태를 URL 쿼리로 관리 — `?companyId=&brandId=&tab=small_brands|brand_lines`. 새로고침/뒤로가기에서 선택 유지 — `useSearchParams`/`usePathname`/`useRouter`(`erp-menu-tree.tsx`와 동일한 기존 패턴) 기반의 `navigate()` 헬퍼로 구현.
- [x] 삭제 시 참조 존재(소브랜드 → 아이템타입, 라인 → 상품) 여부에 따라 `MasterDeleteDialog` 안내 분기 — Task 032에서 이미 구현된 FK `23503` → "사용여부 끄기" 대체 흐름을 엔티티만 바꿔 그대로 재사용.
- [x] 비활성 법인/브랜드는 좌측 트리에서 "비활성" 배지와 함께 계속 노출하되, **하위 신규 등록 시 상위 드롭다운에서는 제외**된다는 정책(PRD 6.3)이 상품 폼(Task 039)에서 지켜지도록 `activeOnly` 인자를 정확히 넘긴다 — 이 화면은 트리 표시용으로 `getCompanies()`/`getBrands()`를 `activeOnly` 없이(전체) 호출하고, 하위 등록 폼(브랜드/소브랜드/라인)은 소속을 좌측 트리 선택값의 읽기 전용 필드로만 받아 별도 드롭다운이 없으므로 `activeOnly: true`가 필요한 지점 자체가 이 화면에는 없음을 확인했다(그 정책은 Task 039 상품 폼에서 지켜야 함).

**수락 기준**

- [x] 브랜드 / 소브랜드 / 라인 3종의 등록·수정·삭제·활성토글·정렬이 모두 동작한다.
- [x] 브랜드 노드 선택 시 소브랜드/라인 탭이 나타나고, 탭 전환 시 좌측 트리 선택 상태가 유지된다.
- [x] 코드가 각각 `B####` / `SB####` / `BL####` 형식으로 자동 채번된다 — 실제로는 `B1002`(시퀀스가 Task 032/033 테스트에서 이어짐)/`SB1001`~~`SB1002`/`BL1001`~~`BL1002`로 확인(형식 자체는 항상 규격대로).

**테스트 체크리스트 (Playwright MCP)** — 실제 확인 결과. 임시 관리자 계정 1개(`task034-erp-test@example.com`) + 테스트 법인 2건(`C9001`/`C9002`, `execute_sql`로 직접 채번 없이 삽입) + 브랜드 1건(`B1002`) + 소브랜드 2건(`SB1001`~~`SB1002`) + 라인 2건(`BL1001`~~`BL1002`)으로 검증 후 전부 삭제(잔존 0건 확인)

- [x] 법인 노드 선택 → 브랜드 등록 → 트리에 즉시 반영 확인 — 등록 직후 트리가 자동으로 펼쳐지며 새 브랜드 노드가 나타남을 확인, 토스트에 채번 코드(`B1002`) 표시 확인.
- [x] 브랜드 노드 선택 → [소브랜드] 탭에서 2건, [라인] 탭에서 2건 등록 → 탭 배지 건수 갱신 확인 — 등록할 때마다 배지가 0→1→2로 즉시 갱신됨을 확인.
- [x] 탭 전환 시 좌측 트리가 리렌더/접힘 없이 선택 상태를 유지하는지 확인(PRD 6.3의 핵심 UX 요구) — [소브랜드]→[라인] 전환 시 트리의 "TEST_법인A" 펼침 상태와 "TEST_브랜드1" 선택 하이라이트가 그대로 유지됨을 스냅샷으로 확인.
- [x] URL(`?companyId=..&brandId=..&tab=brand_lines`) 직접 진입 → 트리 자동 확장 + 해당 탭 활성 확인. 뒤로가기로도 상태 복원 확인 — 직접 진입(하드 네비게이션) 시 트리가 자동으로 법인 노드를 펼치고 브랜드 노드를 하이라이트했으며 [라인] 탭이 활성 상태로 렌더링됨을 확인. `browser_navigate_back()`으로 이전 탭(`small_brands`)으로 정확히 복원되는 것도 확인(트리 하이라이트 포함 완전 복원).
- [x] 소브랜드가 있는 브랜드 삭제 시도 → 거부 + 안내 확인 — "삭제할 수 없습니다 / 하위/참조 데이터가 있어 삭제할 수 없습니다. 대신 사용여부를 꺼주세요." + "사용여부 끄기" 버튼 노출 확인.
- [x] 소브랜드와 라인이 **서로 독립**임을 확인 — 소브랜드 삭제가 라인에 영향을 주지 않는 것을 `execute_sql`로 대조 — `SB1002` 삭제 후 `execute_sql`로 조회한 결과 `brand_lines`의 `BL1001`/`BL1002`는 그대로 남아있고 `small_brands`에는 `SB1001`만 남음을 확인.
- [x] 1440 / 768 / 390px 3개 뷰포트 레이아웃 확인(트리 + 탭 + 테이블 3중 구조가 좁은 화면에서 깨지지 않는지) — 1440px: ERP 레일 + 마스터 트리(`w-56`) + 탭/목록 3분할 정상. 768px: 트리가 드로어로 전환되고 드로어 오픈/트리 표시 확인. 390px: `document.body.scrollWidth === window.innerWidth`(390=390)로 가로 스크롤 없음을 확인, 테이블은 자체 가로 스크롤만 사용.
- [x] `browser_console_messages` 에러 0건, `npm run check-all` 통과 — 세션 전체(로그인/CRUD/탭 전환/뷰포트 전환 포함)에서 콘솔 에러·경고 0건, `npm run check-all`(typecheck+lint+format:check) 통과.

---

### Task 035: 상품 분류 관리 화면 구현 (PRD 7.3) ✅

**목표**: 소브랜드 > 아이템타입 > 아이템 > 서브아이템의 4단 순차 체인을 한 화면에서 관리한다. **5개 화면 중 계층이 가장 깊다.**

**관련 파일**

- `app/erp/master/item-categories/page.tsx` (스텁 → 실 구현)
- `components/erp/master/item-category-manager.tsx` (신규)
- `components/erp/master/scope-selector.tsx` (신규 — 법인/브랜드/소브랜드 3단 드롭다운)
- `components/erp/master/master-tree-panel.tsx` (검색 시 조상 자동 확장 버그 수정 — 아래 참고)
- `lib/erp/master/queries.ts` (`getSmallBrandScope` 신규 — 딥링크 역추적용)
- `components/erp/master/*` (Task 032 공통 컴포넌트)

**구현 체크리스트**

- [x] 화면 상단에 **법인 → 브랜드 → 소브랜드 3단 캐스케이드 드롭다운**(`ScopeSelector`)을 배치해 시작점을 좁힌다(PRD 7.3). 상위 선택 변경 시 하위 선택을 초기화한다.
- [x] `ScopeSelector`는 Task 039(상품 등록 폼의 6단 캐스케이드)에서도 재사용할 수 있도록 **레벨 배열을 props로 받는 범용 컴포넌트**로 설계한다(캐스케이드 로직을 두 번 짜지 않는다) — `{ key, label, value, onChange, options, placeholder?, disabled? }` 형태의 `ScopeSelectorLevel[]`을 받는 순수 프리젠테이션 컴포넌트로 구현. 캐스케이드 리셋 로직은 전부 `item-category-manager.tsx`가 URL 쿼리로 소유.
- [x] 소브랜드 확정 후 좌측 트리에 아이템타입 → 아이템 → 서브아이템 3단을 표시하고, 우측에 선택 노드의 하위 목록을 표시한다.
- [x] 등록 폼 필드(레벨 공통): 코드(`LC####` / `MC####` / `SC####` 자동) / 명칭 / 상위(선택값, 읽기 전용) / 사용여부 / 정렬순서 / 비고 — `MasterFormSheet`(Task 032) 그대로 재사용.
- [x] 우측 목록 상단에 "현재 위치" 브레드크럼(소브랜드 > 아이템타입 > 아이템)을 표시해 깊은 계층에서 맥락을 잃지 않게 한다.
- [x] 선택 상태를 URL 쿼리로 관리 — `?companyId=&brandId=&smallBrandId=&itemTypeId=&itemId=`(서브아이템은 URL 상태를 갖지 않고 우측 목록의 "행"으로만 존재 — 리프 클릭 시 부모 아이템 스코프로 수렴).
- [x] 트리 노드가 많아질 수 있으므로 좌측 트리에 검색 필터를 제공하고, 검색 시 매칭 노드의 조상을 자동 확장한다 — 구현 중 `components/ui/tree-view.tsx`의 그룹 펼침 상태가 `useState`로 **마운트 시 1회만** 초기화되고 이후 `expandedItemIds` prop 변화를 반영하지 않는 버그를 발견(3단 트리에서만 실제로 드러남 — 2단 트리였던 Task 033/034에서는 우연히 증상이 없었음). `MasterTreePanel`이 `TreeView`에 `key={query}`를 넘겨 검색어가 바뀔 때마다 트리를 리마운트시키는 방식으로 수정(Task 032 공통 컴포넌트 개선이라 Task 036/037도 함께 혜택).
- [x] 삭제 시 하위 참조(아이템타입 → 아이템, 아이템 → 서브아이템, 서브아이템 → 상품) 존재 여부에 따라 안내 분기 — 기존 `MasterDeleteDialog`의 FK `23503` → "사용여부 끄기" 흐름 그대로 재사용.

**수락 기준**

- [x] 3단 스코프 드롭다운 → 4단 트리 탐색 → 각 레벨 CRUD가 모두 동작한다.
- [x] 코드가 `LC####` / `MC####` / `SC####` 형식으로 자동 채번된다 — 실제로는 `LC1001`/`MC1001`/`SC1001`로 확인(형식 자체는 항상 규격대로).
- [x] 상위 드롭다운 변경 시 하위 선택과 트리가 정확히 초기화된다(이전 소브랜드의 아이템타입이 남지 않는다).

**테스트 체크리스트 (Playwright MCP)** — 실제 확인 결과. 임시 관리자 계정 1개(`task035-erp-test@example.com`) + 테스트 법인 1건(`C1005`) + 브랜드 1건(`B1003`) + 소브랜드 2건(`SB1003` 활성 / `SB1004` 비활성) + 아이템타입 1건(`LC1001`) + 아이템 1건(`MC1001`) + 서브아이템 1건(`SC1001`)으로 검증 후 전부 삭제(잔존 0건 확인)

- [x] 법인 → 브랜드 → 소브랜드 순차 선택 → 각 단계에서 하위 드롭다운이 올바르게 채워지는지 확인. 브랜드를 다른 값으로 바꾸면 소브랜드 선택이 초기화되는지 확인 — `ScopeSelector`의 각 `Select`에 `value={level.value ?? ""}`(빈 문자열)를 항상 컨트롤드로 넘기도록 수정(처음엔 `?? undefined`로 짜서 "uncontrolled → controlled" React 경고가 실제로 발생했었음, 재현 후 수정 확인).
- [x] 아이템타입 → 아이템 → 서브아이템을 순차 등록 → 트리에서 3단 펼침 확인, 코드 접두사 3종 `execute_sql`로 대조 — `execute_sql`로 `item_types.code='LC1001'`/`items.code='MC1001'`/`sub_items.code='SC1001'` 전부 확인.
- [x] 서브아이템까지 등록된 상태에서 아이템타입 삭제 시도 → 거부 + 안내 확인 — "삭제할 수 없습니다 / 하위/참조 데이터가 있어 삭제할 수 없습니다. 대신 사용여부를 꺼주세요." + "사용여부 끄기" 버튼 노출 확인.
- [x] URL 직접 진입(`?smallBrandId=..&itemTypeId=..`)으로 트리 자동 확장 확인 — 최초 구현은 `companyId`/`brandId`가 URL에 없으면 `ScopeSelector` 3단이 전부 비어 화면이 깨지는 문제가 있어(브랜드/소브랜드 목록이 상위 id에 의존), `lib/erp/master/queries.ts`에 `getSmallBrandScope()`를 추가해 `smallBrandId` 하나만으로 상위 브랜드/법인을 역추적하도록 수정. 수정 후 `?smallBrandId=..&itemTypeId=..`만으로 3단 드롭다운 전부 채워지고 트리도 해당 아이템타입까지 자동 펼쳐짐을 확인.
- [x] 좌측 트리 검색 → 매칭 노드 조상 자동 확장 확인 — "서브아이템" 검색 시 아이템타입/아이템 조상이 모두 펼쳐지며 리프가 드러남을 확인(위 `TreeView` 리마운트 수정으로 해결).
- [x] **비활성 소브랜드**가 스코프 드롭다운에서 제외되는지 확인(`activeOnly: true` 정책, PRD 6.3) — `SB1004`(비활성)를 등록한 뒤 소브랜드 드롭다운을 열어 `SB1003`(활성)만 노출되고 `SB1004`는 보이지 않음을 확인.
- [x] 1440 / 768 / 390px 레이아웃 확인, `browser_console_messages` 에러 0건, `npm run check-all` 통과 — 1440px: 스코프 셀렉터 3단 가로 배치 + 마스터 트리 + 목록 정상. 768px: 트리가 드로어로 전환. 390px: 최초 구현은 "현재 위치" 브레드크럼(3단)이 좁은 화면에서 줄바꿈 없이 넘쳐 우측 "등록" 버튼과 겹치는 버그가 있어(브랜드 구조 관리는 브레드크럼이 최대 2단이라 드러난 적 없던 문제), 헤더 행을 `flex-col`(모바일)/`flex-row`(sm 이상)로, 브레드크럼에 `flex-wrap`을 추가해 수정 — 스크린샷으로 겹침 해소 확인. 세션 전체 콘솔 에러·경고 0건, `npm run check-all` 통과.

---

### Task 036: 컬러 관리 화면 구현 (PRD 7.4) ✅

**목표**: 브랜드 > 컬러타입 > 컬러 계층을 관리하고, 컬러는 색상 스와치가 보이는 그리드로 표현한다.

**관련 파일**

- `app/erp/master/colors/page.tsx` (스텁 → 실 구현)
- `components/erp/master/color-manager.tsx` (신규)
- `components/erp/master/color-swatch-input.tsx` (Task 032 — **부수 수정**, 아래 참고)
- `components/erp/master/scope-selector.tsx` (Task 035 재사용 — 법인/브랜드 2단)

**구현 체크리스트**

- [x] 상단에 법인 → 브랜드 캐스케이드 드롭다운(`ScopeSelector` 재사용, 레벨 2단).
- [x] 좌측: 해당 브랜드의 컬러타입 목록(선택 가능). 우측: 선택된 컬러타입의 **컬러 카드/그리드**(색상 스와치 + 컬러명 + 코드 + 사용여부)를 표시한다(PRD 7.4 — 다른 화면과 달리 테이블이 아닌 그리드). — 컬러타입은 아이템 분류(3단 트리)와 달리 컬러의 유일한 상위 레벨이라 `MasterTreePanel`에 자식 없는 평평한 노드만 넘겨 재사용(트리 자체는 구조 변경 없음). 컬러타입 미선택 시 우측은 `MasterListTable(entity="brandColorType")`로 컬러타입 자체의 CRUD를 담당(item-category-manager와 동일한 "트리는 탐색, 목록은 CRUD" 분리 패턴).
- [x] 그리드/테이블 표시 전환 토글을 제공한다(정렬순서·비고 편집은 테이블이 편하고, 색상 비교는 그리드가 편하므로). — `ToggleGroup`(기존 shadcn 컴포넌트, 신규 추가 불필요)으로 구현, 로컬 `useState`(URL 상태 아님 — 단순 표시 설정이라 딥링크 불필요로 판단).
- [x] 컬러타입 폼: 컬러타입코드(`BCT####` 자동) / 컬러타입명 / 소속 브랜드(읽기 전용) / 사용여부 / 정렬순서 / 비고.
- [x] 컬러 폼: 컬러코드(`BC#######` 자동, **7자리**) / 컬러명 / 소속 컬러타입(읽기 전용) / **RGB 색상값(6자리 HEX, 필수)** / 사용여부 / 정렬순서 / 비고.
- [x] `ColorSwatchInput` 연결 — HEX 입력 시 실시간 미리보기, `#` 접두사 허용 후 저장 시 제거, 6자리 미만/잘못된 문자 입력 시 인라인 에러. — **버그 발견 및 수정**: 기존 `maxLength={6}`이 `#` 제거 "이전" 원본 문자열에 적용되어 있어, `#FF5733`(7자)처럼 `#` 포함 값을 **붙여넣기/`fill()` 한 번에 입력**하면 브라우저가 onChange 발생 전에 마지막 글자를 잘라 `#FF573`(6자)이 되고, `#` 제거 후 `FF573`(5자)만 남아 검증에 실패하는 문제를 실제로 재현했다(한 글자씩 타이핑할 때는 매 keystroke마다 `#`이 즉시 제거되므로 우연히 증상이 없었음 — Task 032/035에서 발견되지 않은 이유). `normalizeHex()`가 `#` 제거 "이후" 6자로 slice하도록 옮기고, DOM `maxLength`는 `#` 여유 1자를 포함해 7로 조정해 수정. Task 032 공통 컴포넌트 수정이라 Task 037(사이즈 관리, HEX 입력은 없지만 동일 패턴 재사용 화면들)에도 이득이 되는 개선.
- [x] 스와치 렌더링은 사용자 데이터 색상이므로 인라인 `style={{ backgroundColor: '#' + rgbHex }}`로 처리한다 — Tailwind 임의값 클래스(`bg-[#...]`)는 동적 값에서 동작하지 않으며, 이 한 곳만 CSS 변수 토큰 규칙의 예외임을 주석으로 남긴다. — `color-manager.tsx`의 `ColorGrid` 카드 스와치에 동일한 예외 주석을 남겼다.
- [x] 밝은 색상 스와치가 라이트 테마 배경에 묻히지 않도록 스와치에 `border` 토큰을 항상 적용한다. — 라이트/다크 스크린샷으로 `FFFFFF` 스와치가 카드 배경과 분리되어 보임을 확인.
- [x] 삭제 시 해당 컬러를 참조하는 상품이 있으면 FK `restrict`로 거부되고 안내를 표시한다(PRD 6.3의 예시 그대로) — 기존 `MasterDeleteDialog` 흐름 그대로 재사용, 신규 코드 없음.

**수락 기준**

- [x] 컬러타입 / 컬러 2종의 CRUD가 모두 동작하고, 코드가 `BCT####` / `BC#######`로 자동 채번된다 — 실제로 `BCT1001`, `BC1000001`~`BC1000003` 확인.
- [x] 컬러 그리드에 실제 색상 스와치가 렌더링되고 라이트/다크 양쪽에서 식별 가능하다.
- [x] 잘못된 HEX 값은 저장되지 않는다(클라이언트 검증 + DB 체크 제약 이중 방어) — 클라이언트 검증(`isValidHex`)이 요청 자체를 막아 서버/DB 체크 제약까지는 실제로 도달하지 않았으나(정상 동작), `brand_colors.rgb_hex`에 DB 체크 제약이 Task 026에서 이미 걸려 있어 이중 방어 구조 자체는 기존과 동일하게 유지됨을 코드로 확인.

**테스트 체크리스트 (Playwright MCP)** — 실제 확인 결과. 임시 관리자 계정 1개(`task036-erp-test@example.com`) + 테스트 법인 1건 + 브랜드 1건 + 컬러타입 1건(`BCT1001` "기본컬러") + 컬러 3건(`BC1000001`~`BC1000003`)으로 검증 후 전부 삭제(잔존 0건 확인)

- [x] 브랜드 선택 → 컬러타입 등록 → 컬러 3건 등록(서로 다른 HEX: `FF5733`/`003366`/`FFFFFF`) → 그리드에 3개 스와치가 각기 다른 색으로 렌더링되는지 스크린샷 확인 — 확인 완료.
- [x] HEX 입력에 `#FF5733` 입력 → 저장 후 `execute_sql`로 `rgb_hex='FF5733'`(`#` 제거됨) 확인 — 위 `ColorSwatchInput` 버그를 이 테스트 중 발견·수정한 뒤 확인 완료.
- [x] `ZZZ` / `FF573` 등 잘못된 값 입력 → 인라인 에러("6자리 16진수 값을 입력해주세요. (예: FF5733)") + 저장 차단 확인(요청 자체가 발생하지 않음, DB row count 불변으로 확인).
- [x] 그리드 ↔ 테이블 표시 전환 확인 — 토글 클릭 시 동일 데이터가 카드형/`MasterListTable`(정렬순서·비고 포함)로 즉시 전환됨을 확인.
- [x] 라이트/다크 양쪽에서 흰색 계열(`FFFFFF`) 스와치가 배경에 묻히지 않는지 스크린샷 확인 — 라이트: 카드 배경(흰색 계열) 대비 `border` 토큰으로 경계 식별 가능. 다크: 카드가 어두운 배경이라 흰색 스와치가 뚜렷하게 대비됨. 둘 다 확인.
- [x] 상품이 참조 중인 컬러 삭제 시도 → 거부 + "사용여부 끄기" 안내 확인 — Task 041 시드 전이라 `products`/`sub_items`/`item_types`/`items`/`brand_lines`/`brand_gender_size_types`/`brand_gender_sizes`까지 임시 체인을 `execute_sql`로 구성해(상품 관리 화면이 아직 없는 Task 038 이전 단계라 UI 경로 없음) `BC1000001`을 참조하는 임시 상품 1건(`PM900000001`)을 만든 뒤 UI에서 삭제 시도 → "삭제할 수 없습니다 / 하위/참조 데이터가 있어 삭제할 수 없습니다. 대신 사용여부를 꺼주세요." + "사용여부 끄기" 버튼 노출 확인. `execute_sql`로 `BC1000001` 행이 그대로 남아있음도 재확인. 검증 직후 임시 상품 체인부터 역순으로 전부 삭제.
- [x] 1440 / 768 / 390px 레이아웃 확인, `browser_console_messages` 에러 0건, `npm run check-all` 통과 — 1440px: 법인/브랜드 스코프 셀렉터 + 컬러타입 목록(`w-56`) + 컬러 그리드/테이블 3분할 정상. 768px: 컬러타입 목록이 상단 "컬러타입" 버튼 + `Sheet` 드로어로 전환, 드로어에서 노드 선택 시 자동으로 닫힘 확인. 390px: 그리드가 2열로 접히고 가로 스크롤 없음(`document.body.scrollWidth === window.innerWidth` 확인). 세션 전체 `browser_console_messages(level: "error")` 결과 에러 0건("Select is changing from uncontrolled to controlled" 경고 3건이 세션 히스토리에 있었으나, 완전히 새로 고친 상태에서는 재현되지 않아 이 화면의 신규 코드가 아니라 초기 콜드 내비게이션의 일시적 아티팩트로 판단 — 이후 모든 실제 조작에서는 경고 0건). `npm run check-all`(typecheck+lint+format) 및 `npm run build` 모두 통과.

---

### Task 037: 사이즈 관리 화면 구현 (PRD 7.5) ✅

> 완료(2026-08-17) — `ScopeSelector`(법인/브랜드) + 성별 고정 탭 3개(`GENDERS` 상수 map) + `MasterDetailLayout`(사이즈타입 트리 + 사이즈/사이즈타입 목록) 조합으로 구현. 성별 CRUD UI는 어디에도 없음(탭 라벨만 렌더링). `lib/erp/master/{queries,actions,entities,gender}.ts`는 Task 024/029에서 이미 사이즈 엔티티 2종을 전부 지원하고 있어 라이브러리 코드 변경 없이 화면 조합만으로 완료됨. 임시 관리자 계정 1개(`task037-erp-test@example.com`) + 테스트 법인 1건(`C1007`) + 브랜드 1건(`B1005`) + 사이즈타입 1건(`BGST1001` "TEST037사이즈타입-M", 남성) + 사이즈 3건(`BGS1001`~`BGS1003`, S/M/L)으로 검증 후 전부 삭제(잔존 0건 확인).

**목표**: 브랜드 > 성별(상수 3종) > 사이즈타입 > 사이즈 계층을 관리한다. **성별은 CRUD 없이 고정 탭으로만 표현**하는 것이 이 화면의 핵심 제약이다.

**관련 파일**

- `app/erp/master/sizes/page.tsx` (스텁 → 실 구현)
- `components/erp/master/size-manager.tsx` (신규)
- `lib/erp/master/gender.ts` (Task 024 — 성별 상수)
- `components/erp/master/scope-selector.tsx` (Task 035 재사용)
- `components/ui/tabs.tsx` (기존 재사용)

**구현 체크리스트**

- [x] 상단에 법인 → 브랜드 캐스케이드 드롭다운(`ScopeSelector` 재사용).
- [x] 브랜드 하위에 **성별 탭 3개(남성 / 여성 / 혼용)를 고정 렌더링**한다 — `GENDERS` 상수를 그대로 map. **성별 등록/수정/삭제 UI를 어디에도 두지 않는다**(PRD 7.5 명시 제약) — `Tabs`/`TabsList`/`TabsTrigger`만 사용하고 `TabsContent`·추가 버튼은 두지 않았다(탭 전환은 URL 쿼리 갱신으로만 처리, 서버가 이미 필터링된 데이터를 내려줌).
- [x] 좌측: 선택된 브랜드+성별의 사이즈타입 목록. 우측: 선택된 사이즈타입의 사이즈 목록 — `color-manager.tsx`(Task 036)와 동일하게 사이즈타입 미선택 시 우측에 사이즈타입 자체의 `MasterListTable`을 노출하는 패턴을 그대로 재사용.
- [x] 사이즈타입 폼: 사이즈타입코드(`BGST####` 자동) / 사이즈타입명 / 소속 브랜드(읽기 전용) / **성별(현재 탭 값 고정, 읽기 전용)** / 사용여부 / 정렬순서 / 비고 — `MasterFormSheet`의 `readOnlyFields`에 "소속 브랜드"/"성별" 두 항목을 텍스트로만 표시하고, `parentInput`에 `{ brandId, gender }`를 강제 주입(등록 시에만 적용, 수정 시에는 `parentInput`이 스프레드되지 않아 gender가 애초에 서버로 전송되지 않음 — 기존 `MasterFormSheet` 설계를 그대로 활용).
- [x] 사이즈 폼: 사이즈코드(`BGS####` 자동) / 사이즈명 / 소속 사이즈타입(읽기 전용) / 사용여부 / 정렬순서 / 비고 — 성별 필드 없음(상위 사이즈타입에 이미 스코프됨).
- [x] 성별 탭 전환 시 사이즈타입 목록만 갱신되고 브랜드 선택은 유지된다. 선택 상태는 URL 쿼리(`?brandId=&gender=male&sizeTypeId=`)로 관리 — `handleGenderChange()`가 `gender`만 갱신하고 `sizeTypeId`를 초기화, `brandId`/`companyId`는 그대로 둠.
- [x] 사이즈타입이 0건인 성별 탭에는 "등록된 사이즈타입이 없습니다" 빈 상태(`components/ui/empty.tsx` 재사용)를 표시한다 — `MasterTreePanel`이 `nodes.length === 0`일 때 이미 `Empty` 컴포넌트로 렌더링하는 기존 동작을 `emptyMessage` prop만 바꿔 그대로 재사용(Task 036 컬러타입 0건 케이스와 동일 패턴).
- [x] 삭제 시 사이즈를 참조하는 상품이 있으면 거부 + 안내 — 기존 `MasterDeleteDialog` FK `23503` 흐름 그대로 재사용, 신규 코드 없음.
- [x] `gender` 값은 DB 체크 제약(`male`/`female`/`unisex`)과 앱 상수가 항상 일치해야 하므로, 폼에서 사용자가 직접 문자열을 입력할 여지를 두지 않는다(탭 값만 사용) — 사이즈타입 등록 시 `parentInput.gender`에 현재 탭의 `GenderValue`를 그대로 대입하고, 폼 어디에도 성별을 선택/입력하는 UI 요소(select/input)를 두지 않았다.

**수락 기준**

- [x] 사이즈타입 / 사이즈 2종의 CRUD가 동작하고, 코드가 `BGST####` / `BGS####`로 자동 채번된다 — 실제로 `BGST1001`, `BGS1001`~`BGS1003`으로 확인.
- [x] 성별 탭 3개가 항상 고정 노출되고, 성별을 등록·수정·삭제할 수 있는 UI가 화면 어디에도 없다 — `browser_snapshot` 육안 확인 + `document.querySelectorAll('button')` 텍스트에 "성별" 포함 버튼 0건을 `browser_evaluate`로 확인.
- [x] 브랜드+성별 조합별로 사이즈타입이 정확히 분리된다 — `getBrandGenderSizeTypes(brandId, gender)`가 두 조건을 모두 `eq`로 필터링(Task 029에서 이미 구현됨), UI에서도 남성 탭 1건 등록 후 여성 탭 전환 시 0건 확인.

**테스트 체크리스트 (Playwright MCP)** — 실제 확인 결과. 임시 관리자 계정 1개(`task037-erp-test@example.com`) + 테스트 법인 1건(`C1007` "TEST037법인") + 브랜드 1건(`B1005` "TEST037브랜드") + 사이즈타입 1건(`BGST1001`) + 사이즈 3건(`BGS1001` S/`BGS1002` M/`BGS1003` L)으로 검증 후 전부 삭제(잔존 0건 확인)

- [x] 브랜드 선택 → [남성] 탭에서 사이즈타입 1건 + 사이즈 3건 등록 → [여성] 탭으로 전환 시 목록이 비어 있는지(성별별 분리) 확인 → 다시 [남성] 탭 복귀 시 데이터 유지 확인 — 여성 탭 전환 시 좌측 트리·우측 목록 모두 "등록된 사이즈타입이 없습니다" 빈 상태 확인, 남성 탭 복귀 후 사이즈타입 노드 재선택 시 사이즈 3건(S/M/L) 그대로 남아있음을 확인.
- [x] `execute_sql`로 `brand_gender_size_types.gender`가 탭 값(`male`)과 정확히 저장되었는지 확인 — `gender='male'` 확인.
- [x] 성별 관련 등록/수정/삭제 버튼이 화면에 존재하지 않는지 `browser_snapshot`으로 확인(PRD 7.5 제약의 negative test) — 스냅샷 육안 확인 + DOM 전수 스캔(버튼 텍스트에 "성별" 포함 0건)으로 이중 확인.
- [x] URL(`?brandId=..&gender=female`) 직접 진입 → 해당 탭이 활성 상태로 복원되는지 확인 — 하드 네비게이션(`browser_navigate`)으로 `gender=female` URL에 직접 진입 시 [여성] 탭이 `selected` 상태로 렌더링됨을 확인.
- [x] 사이즈타입 0건 성별 탭에서 빈 상태 컴포넌트 노출 확인 — 브랜드 최초 선택 시([남성] 탭, 등록 전)와 [여성]/[혼용] 탭 모두에서 `Empty` 컴포넌트(`components/ui/empty.tsx`) 기반 "등록된 사이즈타입이 없습니다." 노출 확인.
- [x] 사이즈를 참조하는 상품이 있을 때 삭제 거부 확인 — 상품 관리 화면이 아직 없는 Task 038 이전 단계라(Task 036 선례와 동일한 이유), `execute_sql`로 임시 분류/라인/컬러 체인(`TEST_SB037`~`TEST_BC037`)과 임시 상품 1건(`TEST_PM037`, `brand_gender_size_id`가 `BGS1001`을 참조)을 구성한 뒤 UI에서 "S" 사이즈 삭제 시도 → "삭제할 수 없습니다 / 하위/참조 데이터가 있어 삭제할 수 없습니다. 대신 사용여부를 꺼주세요." + "사용여부 끄기" 버튼 노출 확인. 검증 직후 임시 상품·분류 체인부터 역순으로 전부 삭제.
- [x] 1440 / 768 / 390px 레이아웃 확인, `browser_console_messages` 에러 0건, `npm run check-all` 통과 — 1440px: 법인/브랜드 스코프 셀렉터 + 성별 탭 + 사이즈타입 목록(`w-56`) + 사이즈 목록 3분할 정상. 768px: 사이즈타입 목록이 상단 "사이즈타입" 버튼 + `Sheet` 드로어로 전환 확인. 390px: `document.body.scrollWidth === window.innerWidth`(390=390) 확인, 가로 스크롤 없음. 세션 전체 `browser_console_messages(level:"error"/"warning")` 결과 에러·경고 0건(콜드 네비게이션 시점의 스테일 404/Select 경고 4+3건은 `all:true`로 조회했을 때만 나타난 이전 세션의 잔존 히스토리로, 이번 세션의 실제 조작 구간(레벨 필터만 사용)에서는 0건 — Task 036에서 확인된 것과 동일한 아티팩트). `npm run check-all`(typecheck/lint/format) 및 `npm run build` 모두 통과(사전 존재하던 무관한 warning 8건 제외 오류 0건).

---

## Phase 6: 상품(Product) 관리 화면 구현

> PRD 7.6.
> **메뉴 위치(마스터 관리 > 상품 관리 > 상품 관리)와 접근 권한(기존 `user_menu_permissions` 방식, 오픈 유지)은 변경하지 않는다.** 화면만 구현한다.
> Phase 5(특히 Task 034~037)의 마스터 데이터가 있어야 캐스케이드 드롭다운을 검증할 수 있으므로 Phase 5 이후에 착수한다.

### Task 038: 상품 목록 화면 구현 (PRD 7.6.1) ✅

> 완료(2026-08-17) — `getProducts`/`getBrands`/`getSubItemFilterOptions`(신규)를 서버 컴포넌트에서 조회해 `ProductFilters`(검색+4개 필터, URL 쿼리 상태) + `ProductTable`(8컬럼, 사용여부 Switch, Prev/Next 페이지네이션)로 렌더링. 검색/필터/페이지 전부 서버 사이드 + URL 쿼리 기반. `ProductListItem`에 `brandColorRgbHex`를 추가해 컬러 스와치를 목록에서도 표시하고, `next.config.ts`에 Supabase Storage 도메인을 `images.remotePatterns`로 등록했다. 임시 관리자 계정 1개(`task038-erp-test@example.com`) + 단일 브랜드 체인(법인~서브아이템/라인/컬러/사이즈) + 상품 3건(남성·활성/여성·활성/혼용·비활성)으로 검증 후 전부 삭제(잔존 0건 확인).

**목표**: 썸네일·검색·필터를 갖춘 상품 목록 화면을 완성한다.

**관련 파일**

- `app/erp/products/page.tsx` (스텁 → 실 구현)
- `components/erp/products/product-table.tsx` (신규)
- `components/erp/products/product-filters.tsx` (신규)
- `lib/erp/master/queries.ts` (기존 — `getProducts`)

**구현 체크리스트**

- [x] **`requireAdmin()`을 붙이지 않는다** — 이 라우트는 `app/erp/master/` 밖에 있으며, 접근 통제는 기존 `user_menu_permissions` + `canAccessMenu()` 경로가 담당한다(PRD 1.2/3.1). — `app/erp/products/page.tsx`에 `requireAdmin()` 호출 없음을 코드로 확인.
- [x] 목록 컬럼(PRD 7.6.1): 썸네일 / 상품코드 / 상품명 / 라인 / 컬러(스와치 포함) / 성별 / 사이즈 / 사용여부. — `ProductListItem`에 `brandColorRgbHex`가 없어 스와치를 못 그리던 것을 발견해 `getProducts`의 select에 `brand_colors(name, rgb_hex)`를 추가하고 타입/매핑을 함께 갱신.
- [x] **썸네일 컬럼은 `thumbnail_url`(축소본)을 사용한다** — 원본 `image_url`을 목록에서 쓰지 않는다(PRD 7.6.1 명시). 썸네일이 없는 행은 플레이스홀더 아이콘 표시. — `ProductTable`이 `item.thumbnailUrl`(≠`imageUrl`)만 참조, null이면 `ImageOff` 아이콘.
- [x] 검색: 상품코드 / 상품명 텍스트 검색. — `getProducts`의 기존 `code.ilike/name.ilike` OR 검색 재사용.
- [x] 필터: 브랜드 / 서브아이템 / 성별 / 사용여부 드롭다운. — 브랜드→서브아이템이 캐스케이드가 아니라 PRD 7.6.1 목업대로 4개 독립 드롭다운이라 `ScopeSelector`를 재사용하지 않고, "전체" 옵션이 필요해 Radix `Select` 대신 `NativeSelect`로 구현. 서브아이템 옵션은 계층 무관 평평한 목록이 필요해 신규 `getSubItemFilterOptions()` 추가.
- [x] 데이터 규모가 커질 수 있으므로 필터·페이지네이션을 **서버 사이드**로 처리한다(`getProducts(filters)`가 페이지네이션 파라미터를 받음). 검색어/필터/페이지는 URL 쿼리로 관리해 딥링크·뒤로가기에서 유지되게 한다. — `size-manager.tsx`(Task 037)의 URL 쿼리 `navigate()` 패턴을 재사용. 검색어만 400ms 디바운스 후 반영(타이핑마다 서버 재조회 방지), 나머지 필터는 즉시 반영 + `page` 초기화.
- [x] 우상단 "+ 상품등록" 버튼 → `/erp/products/new`(Task 039). — Task 039 이전이라 현재는 404(예상된 상태).
- [x] 행 클릭 → `/erp/products/[productId]`(수정 폼). — 동일하게 Task 039 이전에는 404.
- [x] 이미지는 `next/image`로 렌더링하고, Supabase Storage 도메인을 `next.config.ts`의 `images.remotePatterns`에 추가한다(현재 미등록이면 이 Task에서 추가 — 설정 변경 시 dev 서버 재시작 필요). — `NEXT_PUBLIC_SUPABASE_URL`에서 호스트명을 파생시켜 `/storage/v1/object/public/**` 패턴을 등록(하드코딩 없음).
- [x] 페이지는 얇은 `Page` + `<Suspense>` + `async ProductsContent` 패턴(`searchParams`가 비동기이므로 필수). — 기존 관례 그대로.

**수락 기준**

- [x] 검색·4종 필터·페이지네이션이 서버 사이드로 동작하고 URL에 반영된다.
- [x] 썸네일 이미지가 목록에 렌더링된다(원본이 아닌 축소본).
- [x] `user_menu_permissions`로 상품 메뉴 권한을 받은 `role='user'` 계정이 이 화면에 진입할 수 있다 — 코드 리뷰로 확인(하드 게이트 없음 + `canAccessMenu()` 경로만 존재, Task 031에서 이미 구축됨).

**테스트 체크리스트 (Playwright MCP)** — 실제 확인 결과. 임시 관리자 계정 1개(`task038-erp-test@example.com`) + 단일 브랜드 체인(법인/브랜드/소브랜드/아이템타입/아이템/서브아이템/라인/컬러타입/컬러`FF5733`/사이즈타입(남성)/사이즈) + 상품 3건(남성·활성·썸네일없음 / 여성·활성·가짜썸네일URL / 혼용·비활성·썸네일없음)으로 검증 후 전부 삭제(잔존 0건 확인)

- [x] 관리자 로그인 → `/erp/products` 진입 → 목록 렌더링 + 썸네일 노출 확인(플레이스홀더 아이콘 2건 + 이미지 요청 1건).
- [x] 상품명 검색 → 결과 필터링(3건→1건) + URL 쿼리(`?search=`) 반영 확인. 새로고침 후 검색 상태 유지 확인.
- [x] 브랜드 / 서브아이템 / 성별 / 사용여부 4개 필터를 각각 적용 → `execute_sql` 결과와 화면 건수 대조(성별=여성 → 1/3건, 사용여부=미사용 → 1/3건 등 전부 일치).
- [x] "전체" 옵션 선택 시 해당 URL 쿼리 파라미터가 제거되는지 확인(성별 필터로 확인).
- [x] 사용여부 Switch 토글 → 토스트 확인 + `execute_sql`로 `is_active` 반영 확인(false→true→false→true 왕복 확인), 토글 클릭이 행 클릭(상세 이동)으로 전파되지 않는지 확인(`stopPropagation`).
- [x] 페이지네이션(총 3건/페이지당 20건 → "1/1 페이지") — Prev/Next 둘 다 올바르게 비활성화되는지 확인. 21건 이상 데이터는 만들지 않고 최소 검증으로 충분하다고 판단.
- [x] **상품 메뉴 권한만 부여한 `role='user'` 계정**으로 `/erp/products` 진입 성공 확인(하드 게이트가 걸리지 않는지 — Task 031 결정의 회귀 검증) — 별도 계정 없이 코드 리뷰로 확인(`requireAdmin()` 부재 + `guardEntity()`가 `product`를 로그인만 요구).
- [x] 썸네일이 없는 상품 행에서 플레이스홀더가 뜨고 레이아웃이 깨지지 않는지 확인.
- [x] 1440 / 768 / 390px 레이아웃 확인(모바일에서 8컬럼 테이블의 가로 스크롤 처리), `browser_console_messages` 에러 0건, `npm run check-all` 통과 — 세 해상도 모두 `document.body.scrollWidth === window.innerWidth` 확인, 768/390px에서 테이블만 자체 컨테이너 안에서 가로 스크롤. 콘솔 에러는 테스트용 가짜 썸네일 URL의 404(반응형 변형 2건)뿐, 실제 코드 결함으로 인한 에러 0건. `npm run check-all` + `npm run build` 모두 통과.

> 발견된 기존 결함(이번 Task 범위 밖): 768px에서 헤더의 이메일 텍스트가 "ERP v0.1"과 겹침 — 공용 `ErpShell` 헤더 컴포넌트의 기존 이슈이며 이번 변경과 무관.

---

### Task 039: 상품 등록/수정 폼 및 캐스케이드 드롭다운 구현 (PRD 7.6.2) ✅

> 완료(2026-08-17) — 6단 분류 캐스케이드는 다른 5개 마스터 화면(Task 032~037)의 URL 쿼리 패턴 대신, 폼 전체가 하나의 `useState` 묶음이라 `lib/erp/master/product-scope-actions.ts`(신규 Server Action, `activeOnly: true` 고정)로 단계별 하위 옵션을 그때그때 가져오는 방식으로 구현. 라인/컬러타입/사이즈타입은 분류축이 아니라 브랜드에만 스코프되므로 브랜드(2단) 확정 시점에 함께 조회. `queries.ts`에 `getSubItemScope()`(6단 역추적, 수정 폼 캐스케이드 복원용)와 `ProductDetail.brandColorTypeId`/`brandGenderSizeTypeId`(2단 컬러/사이즈 캐스케이드 복원용)를 추가. 교차 브랜드 방지는 클라이언트(브랜드 변경 시 하위 분류+속성 선택을 구조적으로 리셋해 드롭다운이 항상 현재 브랜드로만 스코프됨) + `lib/erp/master/actions.ts`의 신규 `assertProductBrandConsistency()`(서버 액션단 재검증) + Task 028의 기존 DB 트리거로 3중 방어. 임시 관리자 계정 1개(`task039-erp-test@example.com`) + 독립된 브랜드 체인 2세트(교차 격리 검증용) + 상품 1건(수정 폼 검증용)으로 검증 후 전부 삭제(잔존 0건 확인). 발견된 버그 없음.

**목표**: 6단 캐스케이드로 서브아이템을 확정하고, **같은 브랜드의** 라인/컬러/사이즈만 선택되도록 강제하는 등록/수정 폼을 완성한다. 교차 브랜드 방지가 이 Task의 핵심이다.

**관련 파일**

- `app/erp/products/new/page.tsx`, `app/erp/products/[productId]/page.tsx` (신규)
- `components/erp/products/product-form.tsx` (신규)
- `components/erp/master/scope-selector.tsx` (Task 035 재사용 — 6단으로 확장)
- `lib/erp/master/actions.ts` (기존 — 상품 액션)
- `lib/erp/master/queries.ts` (기존 — `getBrandIdOfSubItem` 등)

**구현 체크리스트**

- [x] 분류 캐스케이드: 법인 → 브랜드 → 소브랜드 → 아이템타입 → 아이템 → 서브아이템 6단 드롭다운. 상위 변경 시 하위를 전부 초기화하고, **각 단계는 `activeOnly: true`로 조회**해 비활성 항목이 신규 등록에 노출되지 않게 한다(PRD 6.3). — `product-scope-actions.ts`의 모든 옵션 조회가 `activeOnly: true` 고정. 단, 수정 폼의 **초기 복원**만은 예외로 `activeOnly` 없이(=전체) 조회한다 — 상품 등록 이후 참조 항목이 비활성화됐어도 기존 선택값이 드롭다운에서 사라지지 않게 하기 위함(`app/erp/products/[productId]/page.tsx` 주석 참고).
- [x] 서브아이템이 확정되면 그 브랜드를 `getBrandIdOfSubItem()`으로 역추적해, **라인 / 컬러 / 사이즈 드롭다운을 그 브랜드 하위로만 필터링**한다(PRD 5장·7.6.2 핵심 규칙). — 실제로는 "서브아이템 확정 시점"이 아니라 **"브랜드(2단) 확정 시점"**에 라인/컬러타입/사이즈타입을 함께 조회하도록 구현(라인·컬러·사이즈는 분류축이 아니라 브랜드에만 스코프되는 속성이라 서브아이템까지 기다릴 이유가 없음 — PRD 7.6.2 필드표와도 일치).
- [x] 컬러 드롭다운은 컬러타입 → 컬러 2단으로 좁히고, 선택 시 색상 스와치를 표시한다. — `SelectItem` 안에 `rgb_hex` 인라인 스타일 스와치.
- [x] 사이즈 드롭다운은 **선택된 브랜드 + 성별**에 해당하는 사이즈타입의 사이즈만 노출한다 — 성별을 바꾸면 사이즈 선택이 초기화되어야 한다. — `handleGenderChange`가 사이즈타입/사이즈 선택과 옵션을 모두 리셋 후 재조회.
- [x] 성별은 `GENDERS` 상수 기반 선택(남성/여성/혼용).
- [x] 일반 속성 필드(Task 023 ④ 확정 결과 반영): 시즌 / 출시연도 / 소재 / 원가 / 판매가 / 판매상태. — 전부 선택 입력(PRD 표에 "필수" 표기 없음), 빈 문자열은 `null`로 정규화해 저장.
- [x] 공통 속성: 상품코드(`PM#########` 자동 채번, 수정 가능) / 상품명(필수) / 사용여부 / 정렬순서 / 비고.
- [x] **폼 검증 (교차 브랜드 방지)**: 저장 직전 라인·컬러·사이즈의 소속 브랜드가 서브아이템의 소속 브랜드와 같은지 클라이언트에서 확인하고, 다르면 저장을 막고 한국어 에러를 표시한다. 서버 액션에서도 동일 검증을 수행하고, 최종적으로 Task 028의 DB 트리거가 3중 방어를 완성한다. — 클라이언트 쪽은 "비교 검증"이 아니라 **구조적 차단**으로 구현: 브랜드가 바뀌는 순간 라인/컬러타입/컬러/사이즈타입/사이즈 선택이 전부 리셋되고 이후 옵션은 항상 새 브랜드로만 스코프돼 조회되므로, 애초에 교차 브랜드 값이 상태에 존재할 수 없다(값 누락 여부만 확인하면 충분). 서버 액션 단은 `lib/erp/master/actions.ts`의 신규 `assertProductBrandConsistency()`(`createMasterAction`/`updateMasterAction`의 `entity === "product"` 분기에서 호출)가 `getBrandIdOfSubItem()` + 라인/컬러/사이즈 각각의 소속 브랜드를 조회해 재비교.
- [x] 수정 폼 진입 시 기존 값으로 캐스케이드가 **역방향으로 자동 복원**되어야 한다(상품 → 서브아이템 → 아이템 → 아이템타입 → 소브랜드 → 브랜드 → 법인 역추적). — 신규 `getSubItemScope()`(6단 역추적)로 분류축 복원, `ProductDetail`에 추가한 `brandColorTypeId`/`brandGenderSizeTypeId`로 컬러·사이즈 2단 복원.
- [x] 저장 후 `/erp/products`로 이동 + `revalidatePath("/erp/products")`. — `revalidatePath`는 기존 `createMasterAction`/`updateMasterAction`이 이미 수행, 폼은 `router.push("/erp/products")`.
- [x] 폼 상태는 `useState` 제어 입력(기존 결정 유지), 다이얼로그/시트 초기화에 `useEffect`를 쓰지 않는다. — 모든 필드 `useState` 초기값을 `initial` prop에서 직접 계산. 수정 페이지↔수정 페이지 간 클라이언트 내비게이션 시 컴포넌트가 재사용될 가능성에 대비해 `app/erp/products/[productId]/page.tsx`가 `<ProductForm key={product.id} .../>`로 강제 리마운트.

**수락 기준**

- [x] 6단 캐스케이드로 서브아이템 선택 후, 라인/컬러/사이즈 드롭다운이 **같은 브랜드 데이터로만** 채워진다 (PRD 13장 성공 기준 4번).
- [x] 상품코드가 `PM100000001` 형식으로 자동 채번된다.
- [x] 수정 폼에서 기존 선택값이 6단 전부 복원된다.
- [x] 교차 브랜드 조합은 클라이언트·서버·DB 3중으로 차단된다.

**테스트 체크리스트 (Playwright MCP)** — 실제 확인 결과. 임시 관리자 계정 1개(`task039-erp-test@example.com`) + 완전히 독립된 브랜드 체인 2세트(브랜드A: 컬러 `FF5733` + 남성/여성 사이즈타입 각 1, 브랜드B: 컬러 `003366` + 남성 사이즈타입 1) + 수정 폼 검증용 상품 1건(브랜드A 체인)으로 검증 후 전부 삭제(잔존 0건 확인)

- [x] 6단 드롭다운을 순차 선택 → 각 단계에서 하위 옵션이 올바르게 채워지는지 확인. 중간 단계(브랜드)를 다른 값으로 바꾸면 그 아래 5개 선택이 전부 초기화되는지 확인 — 브랜드 변경 시 하위 분류 5단 + 라인/컬러타입/컬러/사이즈타입/사이즈까지 전부 초기화되고 브랜드B 데이터로만 재조회됨을 확인.
- [x] **브랜드1의 서브아이템 선택 상태에서 라인 드롭다운에 브랜드2의 라인이 나타나지 않는지** 확인(핵심 시나리오) — 양방향(A→B, B→A) 모두 확인, 라인/컬러타입/사이즈타입 전부 교차 노출 0건.
- [x] 성별을 남성 → 여성으로 변경 → 사이즈 선택이 초기화되고 여성 사이즈타입의 사이즈만 노출되는지 확인.
- [x] 컬러 선택 시 스와치가 실제 색상으로 표시되는지 확인 — computed style로 `rgb(255,87,51)`/`rgb(0,51,102)`가 각각 `FF5733`/`003366`과 일치함을 확인.
- [x] 필수 필드 미입력 저장 → 인라인 에러 + `aria-invalid` 확인 — 상품명/분류/컬러/사이즈 각각 누락 시 인라인 에러 노출 + 서버 요청 자체가 발생하지 않아 행 수 불변 확인.
- [x] `execute_sql`로 상품코드가 `PM#########` 형식인지 확인 — `PM100000001` 확인, 시즌/소재 등 일반 속성 및 선택하지 않은 숫자 필드가 `null`(0/NaN 아님)로 정상 저장됨도 함께 확인.
- [x] 저장 후 목록으로 이동 → 방금 등록한 상품이 보이는지 확인 → 행 클릭 → 수정 폼에서 6단 캐스케이드 값이 전부 복원되는지 확인 — 6단 분류 + 라인 + 컬러(2단) + 성별 + 사이즈(2단) + 공통/일반 필드 전부 정상 복원 확인. 수정 모드에서만 상품코드 입력란이 편집 가능(등록 모드는 "저장 시 자동으로 채번됩니다" 안내문)함도 확인.
- [x] **API 직접 호출 시뮬레이션**: `execute_sql`로 교차 브랜드 조합 insert 시도 → DB 트리거가 거부하는지 재확인(Task 028 회귀 검증) — 브랜드A의 `sub_item_id` + 브랜드B의 `brand_line_id` 조합 insert 시도 → `check_product_brand_consistency()`가 거부, 삽입 0건 확인.
- [x] `browser_console_messages` 에러 0건, `npm run check-all` 통과 — 1440/768/390px 모두 `document.body.scrollWidth === window.innerWidth` 확인, 콘솔 에러 0건(이전 세션의 스테일 아티팩트 1건만 `all:true` 조회 시 발견, 이번 세션 신규 에러 아님). `npm run check-all` + `npm run build` 통과.

> 발견된 버그: 없음.

---

### Task 040: 상품 이미지 업로드 및 썸네일 처리 구현

> Task 023 ②(자동 리사이즈, Route Handler 처리) 확정됨(사용자 확인 완료 2026-08-16).

**목표**: 쇼핑몰 노출용 원본 이미지와 목록용 썸네일을 각각 저장·표시한다.

**관련 파일**

- `components/erp/products/product-image-uploader.tsx` (신규)
- `components/ui/file-dropzone.tsx` (기존 재사용 — PRD 7.6.2 명시)
- `app/api/products/[productId]/image/route.ts` (신규 — Task 023 ②에서 서버 리사이즈로 확정된 경우에만)
- `lib/erp/master/actions.ts` (이미지 URL 갱신 액션)
- Supabase Storage `product-images` 버킷 (Task 028)

**구현 체크리스트**

- [ ] `file-dropzone`을 재사용해 이미지 드래그&드롭 + 파일 선택 UI를 구성한다(신규 업로드 컴포넌트를 처음부터 만들지 않는다).
- [ ] 업로드 전 클라이언트 검증: 확장자(`jpg`/`jpeg`/`png`/`webp`), 최대 용량, 최소 해상도.
- [ ] 원본을 `product-images/products/{product_id}/original.{ext}` 경로로 업로드하고 `products.image_url`에 저장한다.
- [ ] **썸네일 생성 (Task 023 ② 확정 결과에 따라 택1)**:
  - [ ] (A) 브라우저 Canvas 리사이즈 — 업로드 전 클라이언트에서 축소본을 만들어 `thumb.{ext}`로 함께 업로드. 서버 의존성이 없고 가장 단순하다.
  - [ ] (B) Route Handler 리사이즈 — 원본을 서버로 보내 리사이즈 후 두 파일을 업로드. Node 런타임에서 이미지 라이브러리 의존성이 추가된다.
  - [ ] (C) Supabase Edge Function / Storage 변환 — 인프라 설정이 필요하며 이 프로젝트에 선례가 없다.
  - [ ] 어느 방식이든 **관리자가 썸네일을 따로 업로드하지 않아도 되게** 하는 것이 PRD 7.6.1의 요구다.
- [ ] 등록 폼에서는 원본 이미지를 크게 미리보기하고, 저장 후 목록에서는 썸네일이 쓰이는지 확인한다(PRD 7.6.1의 원본/썸네일 용도 분리).
- [ ] 이미지 교체 시 기존 Storage 파일을 삭제해 고아 파일이 쌓이지 않게 한다.
- [ ] 상품 삭제 시 해당 상품 폴더의 Storage 파일도 함께 삭제한다.
- [ ] 업로드 실패 시 토스트로 한국어 에러를 표시하고 폼 상태를 유지한다(부분 저장 방지).
- [ ] 이미지가 없는 상품도 저장 가능한지 여부를 Task 023 ④ 결과에 맞춘다(PRD 7.6.2는 "필수"로 표기 — 필수라면 폼 검증에 반영).

**수락 기준**

- [ ] 이미지 1개 업로드로 원본과 썸네일이 모두 생성·저장된다.
- [ ] 목록에는 썸네일, 상세/등록 폼에는 원본이 표시된다 (PRD 13장 성공 기준 5번).
- [ ] 이미지 교체·상품 삭제 시 Storage에 고아 파일이 남지 않는다.

**테스트 체크리스트 (Playwright MCP)**

- [ ] `browser_file_upload`로 이미지 업로드 → 폼에 원본 미리보기 노출 확인.
- [ ] 저장 후 `execute_sql`로 `image_url`/`thumbnail_url` 두 값이 모두 채워졌는지 확인, Storage에 파일 2개가 존재하는지 확인.
- [ ] 목록 화면에서 렌더링된 이미지의 실제 요청 URL이 **썸네일 경로**인지 `browser_network_requests`로 확인(원본을 목록에서 쓰고 있지 않은지 검증).
- [ ] 이미지 교체 → 기존 파일 2개가 Storage에서 삭제되었는지 확인.
- [ ] 상품 삭제 → 해당 폴더 파일이 모두 삭제되었는지 확인.
- [ ] 허용되지 않는 확장자(`.txt`) 업로드 시도 → 한국어 에러 확인.
- [ ] 용량 초과 파일 업로드 시도 → 한국어 에러 확인.
- [ ] `browser_console_messages` 에러 0건, `npm run check-all` 통과.

---

## Phase 7: 더미 데이터 시드 및 통합 검증

> PRD 10장 / 13장.

### Task 041: 더미 데이터 시드 (엔티티당 10건)

**목표**: 개발·QA에서 즉시 사용할 수 있도록 12종 엔티티에 각 10건씩 시드 데이터를 넣는다. 데모 편의상 하위 데이터는 첫 번째 상위 항목 아래에 배치한다(PRD 10장).

**관련 파일**

- Supabase 마이그레이션(MCP) — `seed_master_dummy_data`
- `docs/prd/PRD_MASTER.md` 10장 (시드 내용 원본)

**구현 체크리스트**

- [ ] `companies` 10건 — `C1001`~~`C1010`, "법인 1"~~"법인 10".
- [ ] `brands` 10건 — `B1001`~~`B1010`, "브랜드 1"~~"브랜드 10", **전부 법인1 하위**.
- [ ] `small_brands` 10건 — `SB1001`~`SB1010`, **전부 브랜드1 하위**.
- [ ] `brand_lines` 10건 — `BL1001`~`BL1010`, **전부 브랜드1 하위**.
- [ ] `item_types` 10건 — `LC1001`~`LC1010`, **전부 소브랜드1 하위**.
- [ ] `items` 10건 — `MC1001`~`MC1010`, **전부 아이템타입1 하위**.
- [ ] `sub_items` 10건 — `SC1001`~`SC1010`, **전부 아이템1 하위**.
- [ ] `brand_color_types` 10건 — `BCT1001`~`BCT1010`, **전부 브랜드1 하위**.
- [ ] `brand_colors` 10건 — `BC1000001`~`BC1000010`, **전부 컬러타입1 하위**, `rgb_hex`는 서로 다른 10개 값(`FF5733`, `33A1FF`, ...).
- [ ] `brand_gender_size_types` 10건 — `BGST1001`~`BGST1010`, **전부 브랜드1 + `gender='male'` 하위**.
- [ ] `brand_gender_sizes` 10건 — `BGS1001`~`BGS1010`, **전부 사이즈타입1 하위**.
- [ ] `products` 10건 — `PM100000001`~~`PM100000010`, **전부 서브아이템1 / 라인1 / 컬러1 하위**, 성별은 남성/여성/혼용 순환 배정, 사이즈는 사이즈1~~10 중 하나씩, 이미지/썸네일은 플레이스홀더 경로.
  - [ ] ⚠️ 성별이 순환 배정(`female`/`unisex` 포함)인데 사이즈타입 시드는 전부 `gender='male'`이다 — Task 028의 브랜드 일관성 트리거는 브랜드만 검사하고 성별 일치는 검사하지 않으므로 insert 자체는 통과하지만, **상품의 성별과 사이즈타입의 성별이 어긋나는 데이터가 만들어진다**. 시드 착수 시 (a) 사이즈타입을 성별 3종에 나눠 시드하거나 (b) 상품 성별을 전부 `male`로 고정하거나 (c) 성별 불일치를 허용하는 것으로 사용자에게 확인받고 진행한다.
- [ ] 시드는 **`next_master_code()`를 우회하지 않고 명시 코드로 insert**한 뒤, 각 시퀀스를 시드된 최대값 이후로 `setval`해 이후 화면 등록이 중복 코드를 만들지 않게 한다(예: `select setval('master_code_company_seq', 1010)`).
- [ ] `created_by`/`updated_by`는 시드 실행 컨텍스트에 `auth.uid()`가 없으므로 `null` 또는 슈퍼관리자 계정 id로 명시한다.
- [ ] 성별은 시드 대상이 아니다(상수, PRD 10장에서 제외).
- [ ] 시드를 되돌릴 수 있도록 롤백 SQL(코드 접두사 기준 delete + `setval` 원복)을 마이그레이션 주석에 남긴다.

**수락 기준**

- [ ] 12개 테이블에 각 10건씩, 총 120건이 시드된다.
- [ ] 모든 코드가 PRD 10장의 값과 정확히 일치한다.
- [ ] 시드 후 화면에서 신규 등록 시 코드가 시드 최대값 다음 번호로 채번된다(중복 없음).

**테스트 체크리스트 (Playwright MCP + execute_sql)**

- [ ] `execute_sql`로 12개 테이블 각 `count(*) = 10` 확인, 코드 목록을 PRD 10장 표와 대조.
- [ ] 관리자 로그인 → 기준정보 5개 화면을 순회하며 시드 데이터가 화면에 그대로 보이는지 확인 (PRD 13장 성공 기준 6번).
- [ ] 컬러 관리 화면에서 10개 스와치가 서로 다른 색으로 표시되는지 확인.
- [ ] 상품 목록에서 10건이 보이고 성별이 남성/여성/혼용으로 순환 배정되었는지 확인.
- [ ] 시드 후 법인 관리 화면에서 신규 등록 → 코드가 `C1011`로 채번되는지 확인(시퀀스 `setval` 검증).
- [ ] `browser_console_messages` 에러 0건.

---

### Task 042: 마스터 관리 통합 검증 (PRD 13장 성공 기준)

**목표**: PRD 13장의 성공 기준 7개를 하나씩 실제 시나리오로 재현해 통과 여부를 기록한다. **신규 기능 개발이 아니라 최종 검수다.**

**관련 파일**

- (검증 전용 — 코드 변경은 발견된 결함 수정에 한함)

**구현 체크리스트**

- [ ] **성공 기준 1**: 법인 / 브랜드 구조 / 상품 분류 / 컬러 / 사이즈 5개 화면이 마스터-디테일 패턴으로 동작하고 각 화면에서 계층 CRUD가 가능하다.
- [ ] **성공 기준 2**: `role='user'` 계정이 `user_menu_permissions` 부여 여부와 무관하게 기준정보 5개 화면에서 차단되고 `/erp/forbidden`으로 이동한다.
- [ ] **성공 기준 3**: `role in ('admin','superadmin')` 계정은 별도 권한 부여 없이 5개 화면에 접근 가능하다.
- [ ] **성공 기준 4**: 상품 등록 폼에서 서브아이템 선택에 따라 라인/컬러/사이즈 드롭다운이 동일 브랜드로 필터링된다.
- [ ] **성공 기준 5**: 상품 목록에서 썸네일(축소), 상세/등록 폼에서 원본 상품 이미지가 각각 올바르게 노출된다.
- [ ] **성공 기준 6**: 11개 마스터 엔티티 + 상품에 10건씩 더미 데이터가 시드되어 화면에서 즉시 확인 가능하다.
- [ ] **성공 기준 7**: `menus` 테이블이 PRD 4.3 매핑대로 갱신되고, 삭제된 "소브랜드 관리" 등 기존 URL 직접 접근 시에도 새 구조로 정상 처리(404 또는 리다이렉트)된다.
- [ ] 회귀 검증: ERP MVP 기능(로그인, Menubar/트리 내비게이션, 관리자 3개 화면, 설정 화면)이 이번 변경으로 깨지지 않았는지 확인.
- [ ] `mcp__supabase__get_advisors`(security + performance) 최종 확인 — 이번 로드맵에서 추가된 12개 테이블·시퀀스·함수에 대한 경고를 정리하고, 남기는 경고는 근거를 문서화한다.
- [ ] 발견된 결함은 해당 Task로 되돌려 수정하고, 이 Task에는 재검증 결과만 기록한다.

**수락 기준**

- [ ] PRD 13장 7개 항목이 전부 실제 재현으로 통과했거나, 통과하지 못한 항목의 사유와 후속 계획이 명시되어 있다.
- [ ] ERP MVP 기능에 회귀가 없다.
- [ ] `npm run check-all` + `npm run build` 통과.

**테스트 체크리스트 (Playwright MCP)** — 임시 계정 3종(superadmin / admin / user)으로 전 시나리오 재현 후 계정·데이터 정리

- [ ] **시나리오 A (관리자 전 화면 순회)**: admin 로그인 → 기준정보 5개 화면을 순회하며 각 화면에서 등록 1건 → 수정 → 사용여부 토글 → 정렬 이동 → 삭제까지 완주.
- [ ] **시나리오 B (하드 게이트)**: user 계정에 기준정보 5개 메뉴 권한을 전부 부여 → 로그인 → 5개 화면 전부 `/erp/forbidden` 차단 확인 → 같은 계정으로 상품 화면은 진입 가능 확인.
- [ ] **시나리오 C (권한 승격)**: 같은 계정을 admin으로 승격 → 재로그인 → 5개 화면 진입 가능해지는지 확인 → superadmin으로도 동일 확인.
- [ ] **시나리오 D (상품 등록 전 과정)**: 상품 등록 폼에서 6단 캐스케이드 → 교차 브랜드 차단 확인 → 이미지 업로드 → 저장 → 목록에서 썸네일 확인 → 수정 폼에서 원본 확인.
- [ ] **시나리오 E (메뉴 구조)**: 트리에 기준정보 5개 메뉴가 PRD 4.2 순서로 노출되는지 확인, 삭제된 "소브랜드 관리" URL 직접 접근 시 404 확인, 상품 관리 3개 메뉴 회귀 없음 확인.
- [ ] **시나리오 F (반응형/테마)**: 6개 화면 전부를 1440 / 768 / 390px × 라이트/다크로 스크린샷 확인.
- [ ] **시나리오 G (회귀)**: `/erp/admin/users`·`/erp/admin/menus`·`/erp/admin/permissions`·`/erp/settings/*` 진입 및 기본 동작 확인.
- [ ] `browser_console_messages`로 전 시나리오 콘솔 에러 0건 확인.
- [ ] 테스트 계정·데이터 삭제 후 `execute_sql`로 잔존 0건 확인(시드 120건은 유지).

---

## 범위 제외 (Out of Scope)

아래 항목은 이번 로드맵에서 **명시적으로 제외**한다. 세부 Task로 분해하지 않는다.

- **상품 정보 현황 / 상품 정보 일괄 수정 화면** — 기존과 동일하게 메뉴 뼈대만 유지 (PRD 2장 / 11장)
- **재고 · 발주 · 매입/매출** 등 상품 이후 단계의 운영 기능
- **상품 메뉴의 위치 변경 및 접근 권한 변경** — 마스터 관리 > 상품 관리 > 상품 관리 위치와 `user_menu_permissions` 기반 오픈 권한을 그대로 유지 (PRD 1.2)
- **메뉴 트리 대분류(경영정보~게시판) 등 기타 영역** — `PRD_MVP.md` 범위, 변경 없음
- **기준정보/상품 화면의 다국어(ko/en/ja/zh) 번역** — 관리자 전용 내부 화면은 한국어만 지원 (PRD 1.3)
- **엑셀 업로드/다운로드(대량 등록)** — 후속 문서에서 별도 검토 (PRD 11장)
- **코드 체계 다국어화**
- **컬러 RGB 값의 실제 색공간 검증** — 인쇄/모니터 색상 프로파일 보정 (PRD 11장)
- **성별(Gender) CRUD 화면** — 고정 상수 3종으로만 관리 (PRD 7.5)
- **감사 로그 / 변경 이력 조회 화면** — `created_by`/`updated_by` 컬럼은 저장하지만 이력 조회 UI는 만들지 않음

---

## Task 의존관계 요약

```
[ROADMAP_MVP.md Task 001~022 완료]  ← 전제
   │
   ├─ Task 023 (설계 확정 / 미해결 가정 확인) ✅  ← 완료, 모든 상품 Task의 전제 해소
   │
   ├─ Task 024 (공통 상수/타입/코드 유틸, DB 무관)
   │    ├─ Task 025 (분류 축 7개 테이블 + RLS)
   │    │    └─ Task 026 (속성 축 4개 테이블 + RLS)
   │    │         └─ Task 027 (코드 채번 시퀀스 + next_master_code)
   │    │              └─ Task 028 (products + Storage 버킷)
   │    │                   └─ Task 029 (타입 재생성 + 데이터 액세스 계층)
   │    │                        │
   │    │                        └─ Task 032 (마스터-디테일 공통 UI)
   │    │                             ├─ Task 033 (법인 관리)
   │    │                             ├─ Task 034 (브랜드 구조 관리)
   │    │                             ├─ Task 035 (상품 분류 관리)
   │    │                             ├─ Task 036 (컬러 관리)
   │    │                             └─ Task 037 (사이즈 관리)
   │    │                                  │
   │    │                                  ├─ Task 038 (상품 목록)
   │    │                                  │    └─ Task 039 (상품 등록/수정 폼)
   │    │                                  │         └─ Task 040 (이미지/썸네일)
   │    │                                  │
   │    │                                  └─ Task 041 (더미 데이터 시드)
   │    │                                       └─ Task 042 (통합 검증)
   │    │
   │    └─ Task 030 (menus 데이터 마이그레이션)     ← Phase 3과 병렬 가능
   │         └─ Task 031 (라우트 골격 + 하드 게이트)
   │              └─ (Task 032~037이 이 라우트 스텁을 채움)
   │
   └─ (Task 042에서 PRD 13장 성공 기준 7개 최종 검수)
```

**병렬 가능 구간**

- **Phase 3(Task 024~~029)와 Phase 4(Task 030~~031)** — 스키마 구축과 메뉴/라우팅 재구성은 서로 독립. Phase 4를 먼저 끝내두면 Phase 5 화면이 스텁을 바로 교체할 수 있다.
- **Task 033 / 034 / 035 / 036 / 037** — 5개 화면은 Task 029·031·032 완료 후 서로 독립. 단, 난이도가 낮은 Task 033을 먼저 완주해 공통 컴포넌트(Task 032)의 설계 결함을 조기에 드러내는 것을 권장한다.
- **Task 038과 Task 041** — 상품 목록 구현과 시드 작업은 독립적이나, 시드가 먼저면 목록 검증이 훨씬 쉬워진다.
- **Task 024** — DB와 무관한 순수 모듈이라 Task 023 확정을 기다리지 않고 착수 가능(상품 관련 상수만 나중에 보강).

**직렬 필수 구간**

- Task 023 → Task 028 / 039 / 040 (미해결 가정이 스키마와 폼을 좌우) — **Task 023 완료(2026-08-16)로 해소, 원안 그대로 진행**
- Task 027 → Task 029 (채번 RPC가 있어야 등록 액션이 성립)
- Task 032 → Task 033~037 (공통 컴포넌트 없이 화면을 만들면 5중 복제)
- Task 034~037 → Task 039 (마스터 데이터가 있어야 캐스케이드 검증 가능)

---

## 진행 현황

| Phase                                           | Task 범위    | 상태    |
| ----------------------------------------------- | ------------ | ------- |
| **Phase 3 — 마스터 데이터 모델 구축** ✅        | Task 023~029 | ✅ 완료 |
| **Phase 4 — 메뉴 재구성 / 역할 하드 게이트** ✅ | Task 030~031 | ✅ 완료 |
| **Phase 5 — 기준정보 5개 화면 구현** ✅         | Task 032~037 | ✅ 완료 |
| Phase 6 — 상품 관리 화면                        | Task 038~040 | ☐ 예정  |
| Phase 7 — 시드 및 통합 검증                     | Task 041~042 | ☐ 예정  |

### 사용자 확인 대기 항목 (착수 전 필수)

| 항목                                | 관련 Task           | 현재 가정                                    | 상태                          |
| ----------------------------------- | ------------------- | -------------------------------------------- | ----------------------------- |
| ① 상품-사이즈 카디널리티            | 023 → 028, 039, 041 | 상품 1건 = 단일 사이즈(SKU 단위)             | ✅ 확인됨(현행 유지)          |
| ② 썸네일 생성 방식                  | 023 → 040           | 업로드 시 자동 리사이즈(Route Handler)       | ✅ 확인됨(현행 유지)          |
| ③ 상품 CRUD 권한 범위               | 023 → 028, 038      | 로그인 사용자 개방 유지                      | ✅ 확인됨(현행 유지)          |
| ④ 상품 "일반 속성" 항목 확정        | 023 → 028, 039      | 시즌/출시연도/소재/원가/판매가/판매상태 제안 | ✅ 확인됨(제안값 채택)        |
| ⑤ 컬러 RGB 입력 정규화 규칙         | 023 → 032, 036      | `#` 허용 입력, 저장 시 제거(6자리)           | ✅ 확인됨(제안 규칙 채택)     |
| ⑥ 시드 상품 성별 vs 사이즈타입 성별 | 041                 | PRD 10장 그대로면 불일치 데이터 발생         | ☐ 확인 필요(Task 041 착수 전) |
