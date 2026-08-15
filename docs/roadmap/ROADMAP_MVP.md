# 사내 ERP 시스템 MVP 개발 로드맵

기존 Next.js 16 + Supabase Auth 스타터킷 위에, **메뉴 단위 권한으로 통제되는 사내 ERP의 내비게이션 뼈대**를 단계적으로 얹는다.

- **기준 문서**: `docs/prd/PRD_MVP.md` (v1.1)
- **기반 저장소**: Next.js 16 (App Router) + Supabase Auth (`@supabase/ssr`) + shadcn/ui `new-york`
- **개발 환경**: 1인 개발 — 일정 추정보다 **실행 순서와 의존관계** 중심으로 태스크를 분해했다.
- **최종 수정**: 2026-08-15

---

## 개요

사내 ERP MVP는 **사내 실무 사용자와 시스템 관리자**를 위한 ERP 애플리케이션 뼈대로 다음을 제공한다:

- **3단 내비게이션 레이아웃**: 기존 Header/Footer 사이에 상단 Menubar(대분류) + 좌측 트리(중/소분류) + 우측 콘텐츠 영역을 구성한다.
- **메뉴 단위 권한 관리**: 역할(Role) 기반이 아닌 "사용자 ↔ 메뉴" 매핑 방식으로, 관리자가 사용자별 접근 가능 메뉴를 직접 부여/회수한다.
- **관리자 전용 CRUD 3종**: 사용자 관리 / 메뉴 관리 / 사용자 권한 관리만 실제 동작하는 기능으로 구현한다.
- **업무 메뉴 플레이스홀더**: 그 외 모든 업무 메뉴는 "제목만 표시되는 공용 빈 화면"까지만 구현한다.

### MVP 완료의 정의

> "해당 화면으로 **들어갈 수 있고**, 권한이 없으면 **보이지도 들어갈 수도 없다**"까지만 보장한다.
> 각 업무 메뉴의 실제 비즈니스 로직/CRUD는 MVP 범위가 아니다. ([범위 제외](#범위-제외-out-of-scope) 참고)

---

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악한다 (`CLAUDE.md`, `docs/guides/` 필독).
   - 새로운 작업이 생기면 이 `ROADMAP_MVP.md`를 갱신한다.
   - 우선순위 작업은 마지막 완료 Task 다음에 삽입한다.

2. **작업 생성**
   - 각 Task는 **목표 / 관련 파일 / 구현 체크리스트 / 수락 기준**을 포함한다.
   - DB 연동·비즈니스 로직·권한 로직이 포함된 Task는 **"테스트 체크리스트"** 섹션을 필수로 갖는다 (Playwright MCP 시나리오).

3. **작업 구현**
   - Task 명세를 따라 구현하고, 각 단계 완료 시 체크박스를 갱신한다.
   - **DB 연동 및 권한 로직 구현 시 Playwright MCP로 E2E 검증을 수행한 뒤** 다음 단계로 진행한다.
   - 스키마 변경 시 `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts`를 반드시 재생성한다.
   - 각 Task 완료 후 `npm run check-all`(typecheck + lint + format:check)을 통과시킨다.

4. **로드맵 업데이트**
   - 완료된 Task는 제목 옆에 ✅를 붙이고, 하위 체크박스를 `[x]`로 전환한다.
   - Phase 내 모든 Task가 완료되면 Phase 제목에도 ✅를 붙인다.

---

## 아키텍처 사전 결정 사항

Task 착수 전 아래 결정을 전제로 한다. 변경 시 이 섹션과 영향받는 Task를 함께 갱신할 것.

| 항목                      | 결정                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | 근거                                                                                                                                                                                                                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ERP 라우트 루트           | `app/erp/*` (신규). 기존 `app/protected/*`는 손대지 않음                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | 스타터킷 튜토리얼 영역과 ERP 영역을 분리                                                                                                                                                                                         |
| ERP 셸 배치               | `app/erp/layout.tsx`에서 Header → Menubar → (트리 + 콘텐츠) → Footer 순으로 구성                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Phase 0 제약(Header/Footer 마크업 유지)을 지키면서 그 사이에만 신규 요소 삽입                                                                                                                                                    |
| 메뉴 화면 URL             | `app/erp/menu/[menuId]/page.tsx` (menuId = `menus.id`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | PRD의 `menus` 스키마에 `path`/`slug` 컬럼이 없음. 별도 경로 컬럼을 추가하지 않고 id 기반 라우팅으로 해결                                                                                                                         |
| Phase 1 임시 데이터       | `lib/erp/mock-menus.ts`의 하드코딩 트리                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `menus` 테이블 없이 Phase 1 완주 가능해야 한다는 PRD 2.2 요구 충족                                                                                                                                                               |
| 권한 재검증               | 개별 서버 컴포넌트에서 `getClaims()` + 권한 조회 이중 방어 (`app/protected/page.tsx` 패턴)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | PRD 11절. `proxy.ts`의 쿠키 처리 로직은 변경 금지                                                                                                                                                                                |
| Suspense 경계             | `cacheComponents: true` 환경이므로 `cookies()`/`headers()`/`params` 사용 컴포넌트는 반드시 `<Suspense>` 래핑                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `app/page.tsx`의 얇은 `Page` + `async XxxContent` 패턴을 그대로 따름                                                                                                                                                             |
| shadcn 컴포넌트           | `components/ui/`에 `menubar` `sheet` `tree-view` `collapsible` `table` `dialog` `form` `switch` `badge` `data-table` 모두 **이미 존재**                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | 신규 `npx shadcn add` 불필요. 기존 프리미티브 재사용                                                                                                                                                                             |
| 메뉴명 언어               | 한국어 단일 값 (i18n 미적용)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | PRD 9절 비범위                                                                                                                                                                                                                   |
| Header/Footer 재사용 방식 | `app/page.tsx`의 Header/Footer 마크업을 **그대로 복제**해 `components/erp/erp-header.tsx` / `components/erp/erp-footer.tsx`로 추출 (디자인 변경 없음)                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Task 001 확인 결과, Header/Footer는 `app/layout.tsx`가 아니라 각 페이지(`app/page.tsx`, `app/protected/layout.tsx`)에 개별 인라인되어 있어 공용 컴포넌트가 없음. ERP 레이아웃(`app/erp/layout.tsx`)에서 재사용하려면 추출이 필요 |
| Supabase 백엔드 공유      | 이 프로젝트가 연결된 Supabase 프로젝트는 **이미 별도 앱("weeklyplan" 주간업무일지)이 운영 중인 백엔드를 공유**한다. `profiles`(`role`: user/admin/superadmin, RLS, `is_admin()`/`is_superadmin()` 헬퍼, 마지막 관리자 강등 방지 트리거 등)와 `departments`/`organizations`/`work_types`/`weekly_logs*`/`notifications` 등이 이미 존재하며 실사용 데이터가 들어있다(Task 009 검증 중 발견, 마이그레이션 히스토리의 `unprefix_weeklyplan_tables_and_functions`로 확인). ERP MVP는 이 스키마를 **새로 만들지 않고 재사용**하며, `menus`/`user_menu_permissions`처럼 이름이 겹치지 않는 신규 테이블만 추가한다 | Task 011 착수 전 리뷰 결과 — 로드맵과 실제 DB 상태 불일치를 방치하면 Task 011/012/013/015가 이미 존재하는 것을 중복 구현하게 됨. 상세 근거는 Task 011 본문 참고                                                                  |

### 변경 금지 파일 목록 (Task 001 확정)

ERP 신규 코드는 아래 파일의 **마크업/동작을 수정하지 않는다** (Header/Footer 마크업을 복제해 새 컴포넌트로 옮기는 것은 허용, 원본 파일 편집은 금지):

- `app/page.tsx` — 스타터킷 랜딩 Header/Footer 원본
- `app/layout.tsx` — `ThemeProvider`/`TooltipProvider`/`Toaster` 루트
- `app/protected/layout.tsx` — 스타터킷 튜토리얼 영역 nav/footer
- `components/auth-button.tsx`, `components/theme-switcher.tsx`, `components/language-switcher.tsx`
- `proxy.ts`, `lib/supabase/proxy.ts` — 쿠키 처리 로직 특히 금지
- `app/auth/*` — 기존 인증 플로우 전체 (Phase 1에서는 무수정 재사용, Phase 2에서 리다이렉트 대상만 조정 — Task 008)

---

## 개발 단계

- **Phase 0** — 전제 확인 (변경 금지 대상 고정)
- **Phase 1** — ERP 메인 화면 레이아웃 뼈대 **← 최우선**
- **Phase 2** — 나머지 MVP 기능 순차 구현 (2-A ~ 2-E)

---

## Phase 0: 전제 확인 (변경 금지 대상 고정)

> PRD 2.1. **작업 범위가 아니며 신규 구현 대상도 아니다.** Phase 1 착수 전 "무엇을 건드리면 안 되는지"를 한 번 확정하는 단계다.

### Task 001: Phase 0 전제 확인 및 변경 금지 경계 고정 ✅

**목표**: 기존 Header/Footer와 인증 흐름을 그대로 재사용할 수 있음을 확인하고, ERP 신규 코드가 침범하면 안 되는 경계를 문서로 고정한다.

**관련 파일**

- `app/layout.tsx` (ThemeProvider/TooltipProvider/Toaster 루트)
- `app/page.tsx` — 실제 Header/Footer 마크업이 있는 곳 (루트 레이아웃이 아님에 주의)
- `app/protected/layout.tsx` — 인증 영역의 nav/footer 패턴
- `components/auth-button.tsx`, `components/theme-switcher.tsx`, `components/language-switcher.tsx`
- `proxy.ts`, `lib/supabase/proxy.ts`

**구현 체크리스트**

- [x] Header/Footer 마크업의 실제 위치 확인 — 루트 `app/layout.tsx`가 아니라 **각 페이지(`app/page.tsx`)에 인라인**되어 있음을 확인. ERP용 Header/Footer는 `components/erp/erp-header.tsx` / `components/erp/erp-footer.tsx`로 **동일 마크업 그대로 추출**하기로 결정 (디자인 변경 금지, 마크업 복제만 허용, Task 003에서 실행).
- [x] `AuthButton` / `ThemeSwitcher` / `LanguageSwitcher` 3종이 ERP 셸에서도 그대로 렌더링 가능한지 확인 — `AuthButton`은 `getClaims()`를 호출하는 async 서버 컴포넌트라 `<Suspense>` 필수(기존 두 곳 모두 이미 래핑됨), `ThemeSwitcher`/`LanguageSwitcher`는 클라이언트 컴포넌트로 그대로 재사용 가능.
- [x] 기존 이메일/비밀번호 로그인 흐름(`app/auth/login` → `app/auth/confirm` → `app/protected`)이 정상 동작하는지 로컬에서 확인 — `curl`로 `/`(200), `/auth/login`(200) 응답 확인, `npm run typecheck` 통과.
- [x] `lib/supabase/proxy.ts`의 공개 경로 allow-list에 `/erp`가 **없어야** 함을 확인 — 코드 확인 및 실제 요청으로 검증 완료. `/erp`(미존재 라우트) 접근 시 `Location: /auth/login`으로 리다이렉트되는 것을 `curl`로 재현 확인 → Phase 1 인증 게이트가 공짜로 확보됨.
- [x] 변경 금지 대상 목록을 이 로드맵 상단 "아키텍처 사전 결정 사항"에 반영 — "변경 금지 파일 목록" 섹션 추가.

**수락 기준**

- [x] ERP 신규 코드가 건드리면 안 되는 파일 목록이 확정되어 있다. (아키텍처 사전 결정 사항 → 변경 금지 파일 목록)
- [x] `/erp` 경로에 미인증 접근 시 `/auth/login`으로 리다이렉트되는 것이 보장된다. (`curl` 검증 완료)

> 검증 메모: 로컬 dev 서버로 스모크 테스트 중 기존에 떠 있던 dev 서버 프로세스가 함께 종료됨(포트 3000). 코드 변경은 없었으므로 `npm run dev`로 재기동하면 됨.

---

## Phase 1: ERP 메인 화면 레이아웃 뼈대 (최우선)

> PRD 2.2 / F004 · F009 · F010.
> **목표는 데이터/권한 로직의 완성이 아니라 레이아웃과 내비게이션 골격의 완성이다.**
> `menus` / `user_menu_permissions` 테이블 없이 이 Phase를 완주할 수 있어야 한다.

### Task 002: ERP 라우트 골격 및 도메인 타입 정의 ✅

**목표**: ERP 영역의 라우트 구조와 메뉴 도메인 타입을 먼저 확정해, 이후 모든 Task가 같은 타입 위에서 병렬 작업 가능하게 한다.

**관련 파일**

- `app/erp/layout.tsx` (신규, 빈 껍데기)
- `app/erp/page.tsx` (신규, ERP 홈/대시보드 랜딩)
- `app/erp/menu/[menuId]/page.tsx` (신규, 빈 껍데기)
- `lib/erp/types.ts` (신규)
- `lib/erp/menu-tree.ts` (신규)

**구현 체크리스트**

- [x] `app/erp/` 라우트 세그먼트 생성 및 위 3개 파일을 빈 껍데기로 스캐폴딩 (내용은 제목 텍스트만). `app/erp/menu/[menuId]/page.tsx`는 Next 16 비동기 `params`를 사용하므로 `cacheComponents: true` 규약에 맞춰 얇은 `Page` + `<Suspense>` + `async ErpMenuContent` 패턴으로 작성.
- [x] `lib/erp/types.ts`에 도메인 타입 정의 완료: `MenuLevel`, `MenuFlat`, `MenuNode`(`MenuFlat & { children: MenuNode[] }`), `UserRole`, `ErpUser`.
- [x] `lib/erp/menu-tree.ts`에 `buildMenuTree(rows: MenuFlat[]): MenuNode[]` 구현 (정렬은 `sortOrder` → `name`(ko) 순, `Map` 기반 1-pass 구성).
- [x] **각 레벨이 하위 노드 없이도 리프로 취급될 수 있도록** 설계 — `children: []` 초기화만으로 리프가 자연히 성립하므로 별도 분기 불필요 (부모가 없거나 부모 참조가 데이터에 없는 노드는 루트로 폴백 처리해 유실 방지).
- [x] 로그인 성공 후 랜딩 경로를 `/erp`로 결정. 변경 필요 지점 목록화 (**실제 변경은 Task 007에서 수행**):
  - `components/login-form.tsx:44` — `router.push("/protected")` → `/erp`
  - `app/auth/callback/route.ts:7` — `const next = searchParams.get("next") ?? "/protected"` → 기본값 `/erp` (구글 OAuth 콜백이 사용하는 경로. `components/google-auth-button.tsx`는 `next` 파라미터를 넘기지 않으므로 이 기본값만 바꾸면 두 인증 경로 모두 커버됨)
  - `app/auth/confirm/route.ts:10` — `const next = searchParams.get("next") ?? "/"` → 기본값 `/erp` (이메일 인증 링크 클릭 후 랜딩)

**수락 기준**

- [x] `/erp`, `/erp/menu/<임의값>` 접근 시 404 없이 라우트가 존재한다 — `npm run build` 결과 `/erp`(Static), `/erp/menu/[menuId]`(Partial Prerender)로 정상 생성 확인. 미인증 상태에서는 프록시가 `/auth/login`으로 307 리다이렉트(Task 001에서 확정한 정상 동작). **실제 로그인 세션에서의 렌더링 확인은 테스트 계정이 없어 이 Task에서는 미검증 — Task 007(Phase 1 완료 검증)의 Playwright E2E에서 로그인 후 재확인 필요.**
- [x] `npm run typecheck` 통과.

---

### Task 003: ERP 3단 레이아웃 셸 구현 (F009) ✅

**목표**: 기존 Header/Footer를 유지한 채, 그 사이에 Menubar + 좌측 트리 + 우측 콘텐츠 영역의 골격을 구성한다.

**관련 파일**

- `app/erp/layout.tsx`
- `components/erp/erp-shell.tsx` (신규)
- `components/erp/erp-header.tsx`, `components/erp/erp-footer.tsx` (신규 — Task 001 결정에 따라 기존 마크업 복제)
- `lib/i18n/get-locale.ts`, `lib/i18n/dictionaries/`

**구현 체크리스트**

- [x] `app/erp/layout.tsx`를 얇은 `export default function ErpLayout()` + `<Suspense fallback={null}><ErpLayoutContent/></Suspense>` 패턴으로 작성 (`getLocale()`이 `cookies()`/`headers()`를 쓰므로 Suspense 필수).
- [x] 전체 구조는 `flex h-screen flex-col overflow-hidden`으로 셸 자체를 뷰포트에 고정하고, Header(고정 높이) → Menubar 바(`h-12 shrink-0`) → `flex-1 overflow-hidden` 본문(좌우 분할) → Footer 순으로 배치.
- [x] 본문 영역: 데스크탑(`lg` 이상)에서 좌측 트리 고정 폭(`w-64`) + 우측 `flex-1 min-w-0` 콘텐츠. `aside`/`main` 각각 `overflow-y-auto`로 독립 스크롤.
- [x] Header/Footer는 `app/page.tsx`의 기존 마크업을 **디자인 변경 없이 그대로 복제**해 `ErpHeader`/`ErpFooter`로 분리 (`AuthButton`은 `<Suspense>` 래핑 유지, 타이틀 텍스트·링크·클래스 전부 동일).
- [x] 콘텐츠 영역 상단에 `breadcrumb?: ReactNode` 슬롯을 `ErpShell` props로 마련. **주의**: `app/erp/layout.tsx`는 `[menuId]`보다 상위 세그먼트라 현재 선택된 메뉴 경로를 알 수 없으므로, 이번 Task에서는 슬롯만 배치하고 실제 breadcrumb 렌더링(내용 채우기)은 메뉴 데이터를 다루는 Task 006 이후 각 페이지가 `children`으로 채우는 방식으로 연결한다.
- [x] ERP 셸 전용 신규 색상 토큰은 불필요 — 기존 `border`/`muted-foreground`/`background` 등 CSS 변수만으로 구성 가능해 `app/globals.css`/`tailwind.config.ts` 수정 없음.
- [x] (체크리스트에 없었으나 후속 Task 필요성으로 추가) Menubar/트리 영역은 각각 `menubar?`/`tree?` prop으로 슬롯화하고, 비어있을 때 "Task 004/005에서 구현 예정" placeholder를 표시하도록 구현 — Task 004/005가 `ErpShell` 자체를 재설계하지 않고 prop만 채우면 되도록 대비.

**수락 기준**

- [x] `/erp` 접근 시 Header / Menubar 자리 / 좌측 트리 자리(데스크탑) / 우측 콘텐츠 자리 / Footer 5개 영역이 모두 렌더링된다 — `npm run build` 결과 `/erp`가 Partial Prerender로 정상 생성됨(로케일 의존성으로 `○`→`◐` 전환, 정상).
- [x] 기존 Header의 `AuthButton`, `ThemeSwitcher`, `LanguageSwitcher`가 마크업 그대로이므로 동작 방식도 그대로 유지됨 (로직 변경 없음, 복제본이므로 회귀 위험 없음).
- [x] `h-screen overflow-hidden` 셸 + `aside`/`main` 개별 `overflow-y-auto` 구조로 Footer가 항상 하단에 고정되고 좌/우 영역만 스크롤되도록 설계.
- [ ] **미검증 항목**: 실제 로그인 세션에서의 화면 확인(로그인 → `/erp` 진입 → 5영역 육안 확인, 다크모드 대비 확인)은 테스트 계정이 없어 이번 Task에서 수행하지 못함. **Task 007(Phase 1 완료 검증)에서 Playwright로 반드시 재확인.**

---

### Task 004: 상단 Menubar(대분류) 및 임시 메뉴 데이터 구현 (F009) ✅

**목표**: 대분류를 상단 Menubar로 렌더링하고, 선택된 대분류가 좌측 트리로 전달되는 상태 흐름을 완성한다.

**관련 파일**

- `components/erp/erp-menubar.tsx` (신규)
- `components/erp/erp-menu-tree.tsx` (신규 — Task 005에서 완전한 트리 UX로 확장 예정. Task 004는 접기/펴기 없는 평면 목록 최소 구현만 담당)
- `lib/erp/mock-menus.ts` (신규, 하드코딩 트리)
- `components/ui/menubar.tsx` (기존 재사용)
- `app/erp/layout.tsx` (menubar/tree 슬롯 연결)

**구현 체크리스트**

- [x] `lib/erp/mock-menus.ts`에 `MenuFlat[]` 임시 데이터 작성. 대분류 "마스터 관리" → 중분류 "기본 관리" → 소분류 3종(사용자 관리/메뉴 관리/사용자 권한 관리), 그리고 **대분류 단독 노드** "경영정보"(하위 없음) 포함.
- [x] `components/ui/menubar.tsx`(shadcn Menubar)로 대분류 목록 렌더링.
- [x] 대분류 선택 상태를 URL 쿼리(`?cat=<menuId>`)로 관리 (`useSearchParams()` 기반, 로컬 state 없음 — 새로고침/딥링크 시에도 유지됨을 Playwright로 확인).
- [x] 선택된 대분류에 시각적 활성 표시 적용 (`aria-current` + 배경색 클래스).
- [x] Menubar 바 컨테이너가 `overflow-x-auto`(Task 003에서 이미 마련)라 대분류가 늘어나도 가로 스크롤 처리됨. 15개(대분류 14개+마스터관리)가 들어갈 Task 020에서 재검증 예정.
- [x] `lucide-react` 아이콘을 메뉴명 → 아이콘 `Record` 매핑으로 처리(코드 측 이름 기반, 매핑 없는 신규 대분류는 기본 `Folder` 아이콘로 폴백).
- [x] **(계획에 없던 추가 수정)** Radix `MenubarTrigger`는 원래 하위 `MenubarContent`를 여는 용도라 내부 `onKeyDown`이 Enter/Space에서 `preventDefault()`를 호출한다는 것을 소스(`@radix-ui/react-menubar`) 확인 중 발견 — 이 상태로 `asChild+Link`만 쓰면 **키보드 Enter로는 이동이 안 되는 접근성 버그**가 생김. `MenubarTrigger`에 명시적 `onKeyDown`을 추가해 `router.push(href)` 후 `preventDefault()`로 Radix 내부 핸들러를 무력화(`composeEventHandlers`가 내 핸들러를 먼저 실행하고 `defaultPrevented`면 내부 핸들러를 스킵하는 것을 소스로 확인)하는 방식으로 수정. Playwright로 Tab→Enter 이동 재현 확인.

**수락 기준**

- [x] 대분류 클릭 시 URL이 갱신되고 좌측 트리가 해당 대분류의 하위 노드로 교체된다 — Playwright 로그인 세션에서 실제 확인 (`?cat=master` → 트리에 "기본 관리" 그룹 + 소분류 3개 노출, 소분류 클릭 → `/erp/menu/master-basic-users?cat=master`로 이동 + 트리 활성 표시).
- [x] 하위가 없는 대분류("경영정보") 클릭 시에도 에러 없이 플레이스홀더 화면(`/erp/menu/management-info`)으로 이동 — Playwright 확인, 콘솔 에러/경고 0건.

> **테스트 계정으로 실제 검증 완료** (`archy713@naver.com`, 사용자 제공): 로그인 → `/erp` → 5개 영역 렌더링, 대분류 클릭 → 트리 교체, 소분류 클릭 → 플레이스홀더 이동 + 활성 하이라이트, 하위 없는 대분류 직행, 키보드 Tab+Enter 이동까지 전부 Playwright로 재현 확인. Task 002/003에서 미뤄뒀던 "실제 로그인 세션 검증"이 이번에 해소됨 — 이후 Task도 이 계정으로 계속 검증 가능.

---

### Task 005: 좌측 트리메뉴 및 반응형 Drawer 전환 구현 (F009 · F004) ✅

**목표**: 중/소분류를 접이식 트리로 렌더링하고, 모바일에서 Sheet(Drawer)로 전환되는 반응형을 완성한다.

**관련 파일**

- `components/erp/erp-menu-tree.tsx` (재작성 — `TreeView` 기반)
- `components/erp/erp-mobile-nav.tsx` (신규)
- `components/erp/erp-shell.tsx` (반응형 브레이크포인트 + `mobileNav` 슬롯 추가)
- `components/ui/tree-view.tsx` (**접근성 버그 패치** — 아래 참고)
- `components/ui/sheet.tsx` (기존 재사용, 무수정)
- `lib/erp/menu-tree.ts` (`menuNodeToTreeItem`/`getActiveMenuId` 추가)

**구현 체크리스트**

- [x] `components/ui/tree-view.tsx`(shadcn `TreeView`)로 중분류(확장/축소) + 소분류(리프) 트리 렌더링. `Collapsible` 직접 조합 대신 이미 `initialSelectedItemId` 기반 자동 확장·선택 하이라이트를 내장한 이 컴포넌트를 채택(중복 구현 방지).
- [x] 리프 노드 클릭 시 `/erp/menu/[menuId]?cat=...`로 이동, 활성 노드 하이라이트(`TreeView` 내장 `isSelected` 스타일 + 신규 `aria-current`).
- [x] **중분류 자체가 리프인 경우**도 처리 — `menuNodeToTreeItem`이 `children.length === 0` 여부만으로 리프/그룹을 판단하므로 레벨에 상관없이 자동으로 클릭 가능한 리프가 됨(별도 분기 불필요).
- [x] URL의 `menuId` 기준 자동 확장 — `TreeView`의 `initialSelectedItemId`가 조상 경로를 자동 계산. 단, 이 값은 **마운트 시점에만** 반영되므로 뒤로가기/새로고침/직접 진입에도 항상 재계산되도록 `key={pathname}`으로 강제 재마운트 처리(그냥 두면 클릭 내비게이션에서만 갱신되고 새로고침 시 낡은 상태로 남는 문제가 있어 추가한 방어 로직).
- [x] 반응형 브레이크포인트를 `ErpShell`에 구현: 데스크탑(`lg` 이상) 트리 `w-64` 상시 노출 / 태블릿(`md`~`lg`) 트리 `w-48`로 축소 노출 / 모바일(`md` 미만) 트리+Menubar 모두 숨김 + 햄버거 트리거만 노출.
- [x] 모바일 Sheet에서 **리프(최종 화면) 선택 시에만** Sheet 자동으로 닫히고, 그룹(하위 있는 대/중분류) 펼치기는 Sheet를 닫지 않음(탐색 흐름 유지) — `menuNodeToTreeItem`의 콜백에서 `setOpen(false)`를 리프 케이스에만 연결.
- [x] 모바일에서는 상단 Menubar 대신 `ErpMobileNav`가 전체 트리(대~소분류 통합, `categories.map((n) => menuNodeToTreeItem(n, n.id, ...))`)를 Sheet 하나로 제공 — 14개 Placeholder 대분류가 추가돼도 별도 처리 없이 스크롤로 대응.
- [x] 키보드 내비게이션과 `aria-expanded`/`aria-current` 적용 — `TreeNode`(그룹)는 Radix Accordion 기반이라 기존에도 Tab/Enter/`aria-expanded`가 동작했으나, **`TreeLeaf`(리프)는 순수 `<div onClick>`이라 애초에 Tab 포커스조차 안 되는 접근성 버그**를 소스 확인 중 발견 — `role="treeitem"` `tabIndex={0}` `aria-selected` `aria-current` `onKeyDown`(Enter/Space)을 추가해 수정 (하위 호환 additive 변경, `components/gallery/tree-extension-section.tsx` 데모에도 영향 없음).

**수락 기준**

- [x] 데스크탑(1440px)/태블릿(768px)/모바일(390px) 3개 뷰포트에서 레이아웃 정상 — Playwright 스크린샷으로 확인.
- [x] 모바일에서 햄버거 → Sheet 열림 → 그룹 펼침(Sheet 유지) → 리프 선택 → Sheet 닫힘 + 우측 제목 갱신 — Playwright로 전 과정 재현.
- [x] 새로고침 후에도 현재 메뉴가 트리에서 활성 상태로 표시 — `/erp/menu/master-basic-menus?cat=master` 직접 진입(하드 네비게이션)으로 확인, "기본 관리" 자동 확장 + "메뉴 관리" `[selected]` 유지.

**테스트 체크리스트 (Playwright MCP)** — 테스트 계정(`archy713@naver.com`)으로 전부 실제 재현

- [x] `browser_resize`로 1440px / 768px / 390px 순회하며 `browser_take_screenshot`으로 레이아웃 확인 — 1440px 정상, 768px 트리 폭 축소+Menubar 유지 정상, 390px 햄버거만 노출 정상.
- [x] 390px에서 햄버거 클릭 → Sheet 노출 → "마스터 관리" → "기본 관리" 순차 펼침(Sheet 유지) → "사용자 관리" 클릭 → Sheet 닫힘 + URL/제목 갱신 확인.
- [x] 1440px에서 대분류 전환 시 좌측 트리 내용이 교체되는지 확인(Task 004에서 이미 검증한 것을 재확인).
- [x] 키보드만으로 Tab → "기본 관리" 포커스 → Enter 펼침 → Tab → "사용자 관리" 포커스(`role=treeitem` 확인) → Enter → 이동 확인 (패치 전이었다면 애초에 Tab으로 포커스조차 안 됐을 항목).
- [x] `browser_console_messages`로 에러/경고 0건 확인(단, 개발 중 파일 저장 시 발생한 "[Fast Refresh] performing full reload"는 dev 전용 HMR 알림이라 원인이 된 export 배치를 `lib/erp/menu-tree.ts`로 정리해 해소함 — 런타임 버그 아님).

---

### Task 006: 메뉴 플레이스홀더 공용 컴포넌트 구현 (F010) ✅

**목표**: 모든 업무 메뉴가 공통으로 사용할 "제목만 표시되는 빈 화면" 컴포넌트를 완성한다.

**관련 파일**

- `components/erp/menu-placeholder.tsx` (신규)
- `app/erp/menu/[menuId]/page.tsx` (실 조회 로직으로 교체)
- `app/erp/page.tsx` (환영 대시보드로 교체)
- `components/erp/erp-home-chart.tsx` (신규 — ERP 홈 더미 차트)
- `app/erp/not-found.tsx`, `app/erp/error.tsx` (신규)
- `lib/erp/menu-tree.ts` (`getMenuBreadcrumb` 추가)
- `components/ui/badge.tsx`, `components/ui/empty.tsx`, `components/ui/card.tsx`, `components/ui/chart.tsx` (기존 재사용)

**구현 체크리스트**

- [x] `MenuPlaceholder` 컴포넌트 구현 — props: `{ title: string; breadcrumb?: string[] }`. `components/ui/empty.tsx`(`Empty`/`EmptyHeader`/`EmptyMedia`/`EmptyDescription`/`EmptyContent`) 조합으로 구성.
- [x] 화면 제목(실제 `<h1>`, `EmptyTitle`의 `<div>`가 아닌 시맨틱 h1로 직접 작성) + "추후 구현 예정" `Badge` + 안내 문구 표시. breadcrumb(대분류 > 중분류 > 소분류)도 상단에 함께 표시.
- [x] `app/erp/menu/[menuId]/page.tsx`에서 `params`를 **await**해 `menuId`를 읽고, `lib/erp/menu-tree.ts`의 신규 `getMenuBreadcrumb(tree, menuId)`로 경로 전체(대→중→소)를 조회해 `MenuPlaceholder`에 전달. 조회 실패 시 `notFound()` 호출.
- [x] 페이지는 이미 Task 002에서 얇은 `Page` + `async ErpMenuContent` + `<Suspense>` 패턴으로 작성돼 있어 그대로 유지, 내부 로직만 교체.
- [x] `app/erp/page.tsx`(ERP 홈)에 환영 대시보드 구성 — 인사말 + 더미 KPI 카드 3개(Wallet/Users/TrendingUp 아이콘) + `ErpHomeChart`(Recharts `LineChart`, 기존 `components/ui/chart.tsx` 패턴 재사용). **"샘플 데이터" `Badge` + 안내 문구**로 더미 데이터임을 명시.
- [x] `app/erp/not-found.tsx` / `app/erp/error.tsx` 추가 — 둘 다 `app/erp/layout.tsx`(ErpShell) 하위에서 렌더링되므로 Header/Menubar/Footer가 유지된 채 콘텐츠 영역만 대체됨. `error.tsx`는 Next.js 규약대로 Client Component(`"use client"`)로 작성, `reset()` 버튼 포함.

**(체크리스트에 없던 결정)** `ErpShell`에 Task 003부터 마련해둔 `breadcrumb` 슬롯은 이번 Task에서 **사용하지 않기로 결정** — breadcrumb 표시 위치가 페이지마다 다르고(메뉴 상세만 필요, ERP 홈은 불필요) `MenuPlaceholder`가 자체적으로 breadcrumb을 렌더링하므로 셸 레벨 슬롯까지 채우면 중복 표시가 됨. 슬롯 자체는 향후 다른 용도로 재사용 가능하도록 그대로 남겨둠.

**수락 기준**

- [x] 임시 트리의 모든 리프 노드 클릭 시 해당 메뉴 이름이 제목으로 표시된다 — `master-basic-users`로 Playwright 확인(breadcrumb "마스터 관리 > 기본 관리 > 사용자 관리" + h1 "사용자 관리" + Badge 정상 렌더링).
- [x] 존재하지 않는 `menuId` 직접 입력 시 ERP 셸 안에서 not-found 화면이 표시된다 — `/erp/menu/does-not-exist`로 확인, Header/Menubar/Footer 유지된 채 안내 화면 표시.

**검증 중 발견한 이슈**: dev 서버에서 `notFound()` 경로 접근 시 콘솔에 `TypeError: Failed to execute 'measure' on 'Performance': ... cannot have a negative time stamp` 에러가 찍혔으나, 별도 포트로 `next build` + `next start` 프로덕션 실행 결과 동일 시나리오에서 콘솔 에러 0건으로 확인됨 — Next.js 16 dev 전용 RSC 성능 계측기(`flushComponentPerformance`)의 프레임워크 자체 버그로 판단, 애플리케이션 코드 문제 아님.

---

### Task 007: Phase 1 완료 검증 ✅

**목표**: PRD 12절 "Phase 1 완료 기준" 4개 항목을 실제로 통과시킨다.

**관련 파일 (이번 Task에서 실제로 변경한 것 — Task 002에서 예고했던 로그인 후 랜딩 경로 전환)**

- `components/login-form.tsx` — 로그인 성공 후 `router.push("/protected")` → `router.push("/erp")`
- `app/auth/callback/route.ts` — OAuth 콜백 `next` 기본값 `"/protected"` → `"/erp"`
- `app/auth/confirm/route.ts` — 이메일 인증 링크 `next` 기본값 `"/"` → `"/erp"`
- `components/update-password-form.tsx` — **(Task 002 목록에는 없었으나 검증 중 함께 발견)** 비밀번호 변경 후 `router.push("/protected")`도 동일하게 `/erp`로 변경. 비밀번호 재설정 이메일의 `redirectTo`는 `confirm/route.ts`를 거치지 않고 `/auth/update-password`로 직접 가므로 이 파일은 confirm 라우트와 별개로 고쳐야 했음.

**구현 체크리스트**

- [x] 기존 Header/Footer가 디자인 변경 없이 유지되었는지 `git diff`로 확인 — `app/page.tsx`, `app/layout.tsx`, `components/auth-button.tsx`, `components/theme-switcher.tsx`, `components/language-switcher.tsx`, `app/protected/layout.tsx`, `proxy.ts`, `lib/supabase/proxy.ts` 전부 `git diff` 결과 무변경 확인.
- [x] 미인증 상태로 `/erp` 접근 시 `/auth/login`으로 리다이렉트되는지 확인 — Playwright로 로그아웃 후 재현.
- [x] 로그인 → `/erp` 진입 → Menubar/트리/콘텐츠 3영역 렌더링 확인 — 로그인 랜딩 경로 변경 후 `/erp`로 바로 진입하는 것까지 함께 확인.
- [x] `npm run check-all` 통과 — 최초 실행 시 `format:check`에서 4개 파일(`app/erp/layout.tsx`, `components/erp/erp-menu-tree.tsx`, `docs/prd/PRD_MVP.md`, `docs/roadmap/ROADMAP_MVP.md`) 포맷 어긋남 발견 → `prettier --write`로 수정 후 재실행하여 전체 통과.

**테스트 체크리스트 (Playwright MCP)** — 테스트 계정(`archy713@naver.com`)으로 전부 실제 재현

- [x] 미인증 `/erp` 접근 → `/auth/login` 리다이렉트 확인
- [x] 이메일/비밀번호 로그인 → `/erp` 랜딩 확인 (이번 Task에서 리다이렉트 경로를 바꾼 뒤 재확인 — 이전에는 `/protected`로 갔었음)
- [x] 대분류("마스터 관리") → 중분류("기본 관리") 확장 → 소분류("메뉴 관리") 클릭 → 우측에 breadcrumb+제목 표시까지 전체 플로우 1회 완주
- [x] `ThemeSwitcher`로 다크/라이트 전환 시 ERP 셸의 대비/가독성 확인 — 스크린샷 2종으로 확인, Menubar 활성 탭·트리 선택 항목·Badge 전부 양쪽 테마에서 가독성 양호
- [x] 로그아웃 → 로그인 페이지 복귀 확인

**Phase 1 완료 기준 (PRD 12절) 최종 확인**

- [x] 기존 Header/Footer(`AuthButton`, `ThemeSwitcher`, `LanguageSwitcher` 포함)가 변경 없이 그대로 유지된다.
- [x] 로그인 후 진입하는 ERP 메인 화면에서 상단 Menubar + 좌측 트리 + 우측 콘텐츠 영역 레이아웃이 정상 렌더링된다.
- [x] 데스크탑/태블릿/모바일 각 환경에서 위 레이아웃이 반응형으로 정상 대응된다(Task 005에서 검증 완료, 모바일에서 트리는 Sheet로 전환).
- [x] 메뉴 데이터가 최소 수준(하드코딩된 `MOCK_MENUS`)이어도 트리 클릭 → 우측 콘텐츠 영역에 제목 표시까지의 흐름이 동작한다.

**Phase 1 완료. Phase 2(2-A 인증 완성)로 진행 가능.**

---

## Phase 2: 나머지 MVP 기능 순차 구현

> PRD 2.3. Phase 1의 레이아웃 뼈대 완성 이후 착수한다.
> 실행 순서: **인증 완성 → 데이터 모델 → 관리자 CRUD → 접근 제어 → 메뉴 데이터 등록 → 통합 검증**

### Phase 2-A: 인증 완성 및 공통 UI 통합 확인

#### Task 008: 이메일/비밀번호 인증 흐름 세부 완성 (F001) ✅

**목표**: 스타터킷의 인증 흐름을 ERP 문맥에 맞게 마무리한다 (기본 흐름은 이미 존재하므로 **신규 구현이 아닌 정비 작업**).

**관련 파일**

- `components/login-form.tsx`, `components/sign-up-form.tsx`
- `components/forgot-password-form.tsx`, `components/update-password-form.tsx`
- `app/auth/confirm/route.ts`, `app/auth/callback/route.ts`, `app/auth/error/page.tsx`
- `lib/auth/get-auth-error-message.ts` (신규 — 아래 참고)

**구현 체크리스트**

- [x] 로그인 성공 후 리다이렉트 대상을 `/protected` → `/erp`로 변경한다 — **대부분 Task 007에서 이미 처리됨**. 이번 Task에서 빠져 있던 지점 하나를 추가로 발견해 수정: `sign-up-form.tsx`의 `emailRedirectTo`가 여전히 `${window.location.origin}/protected`였음(이메일 인증 링크가 `auth/confirm` 라우트의 `next` 파라미터로 이 값을 받아 최종 랜딩을 결정하므로 실질적 영향이 있었음) → `/erp`로 수정.
- [x] 회원가입 → 이메일 인증 → 로그인 복귀 전체 흐름을 실제 계정으로 1회 완주 검증한다 — Playwright로 신규 이메일(`erp-task008-test@example.com`) 가입 → `sign-up-success` 이동 확인. **검증 중 발견**: 이 Supabase 프로젝트는 Auth "Confirm email" 설정이 꺼져 있어(`auth.users.email_confirmed_at`이 가입 즉시 채워짐, `execute_sql`로 확인) 실제 이메일 클릭 없이도 즉시 가입이 완료됨 — `auth/confirm` 라우트 자체의 정상 동작(토큰 검증 성공 시 `next`로 리다이렉트)은 잘못된 토큰으로 유도한 실패 케이스로 대체 검증(아래 참고). 검증에 사용한 테스트 계정은 `execute_sql`로 삭제해 정리함.
- [x] 비밀번호 재설정(`forgot-password` → 메일 → `update-password`) 흐름을 검증한다 — `forgot-password` 폼에서 "Send reset email" 제출 → 성공 안내 화면 전환까지 Playwright로 확인(`redirectTo`가 `update-password` 페이지를 정확히 가리키는 것도 코드로 확인). **실제 메일함 클릭 후 `update-password` 진입은 이메일 수신 접근 수단이 없어 미검증** — `update-password-form.tsx`는 이번 Task에서 에러 메시지 매핑만 교체했고 기존 로직(변경 없음)은 이미 Task 007 이전부터 동작하던 부분.
- [x] 인증 에러 메시지를 한국어로 정리한다 (잘못된 자격증명 / 미인증 이메일 / 만료된 링크) — `lib/auth/get-auth-error-message.ts` 신설. Supabase `AuthError.code`(예: `invalid_credentials`, `email_not_confirmed`, `user_already_exists`, `otp_expired` 등, `@supabase/auth-js` v2.112.3의 `error-codes.ts` 기준)를 한국어 문구로 매핑하는 테이블 방식으로 구현. `login-form`/`sign-up-form`/`forgot-password-form`/`update-password-form`의 `catch` 블록과 `app/auth/error/page.tsx`에서 공용으로 사용. `auth/confirm/route.ts`·`auth/callback/route.ts`는 기존에 `error.message`(영문 원문)를 그대로 쿼리 파라미터로 넘기던 것을 `error.code`로 교체(에러 페이지가 코드 기반으로 한국어를 렌더링할 수 있도록). 두 라우트 자체가 발급하는 "토큰/코드 없음" 케이스도 `missing_token`/`missing_code`라는 자체 sentinel 코드로 통일. Playwright로 `invalid_credentials`(로그인 오류), `user_already_exists`(중복 가입), `otp_expired`(잘못된 토큰으로 `/auth/confirm` 접근), `missing_token`, `missing_code` 5개 케이스 전부 한국어 문구 렌더링 확인.
- [x] Supabase Auth의 Site URL / Redirect URL 설정에 로컬·배포 도메인이 모두 등록되어 있는지 확인한다 — 사용 가능한 Supabase MCP 도구로는 Auth 설정(Site URL/Redirect URLs)을 조회할 수 없어(DB 스키마가 아닌 프로젝트 설정 영역) 사용자가 Supabase 대시보드 Authentication → URL Configuration에서 직접 육안 확인, 현재 정상 설정되어 있음을 확인함(2026-08-15).
- [x] 인증 호출은 기존 관례대로 **Server Action이 아닌 Client Component에서 `supabase.auth.*` 직접 호출** 패턴을 유지한다 — 이번 Task는 에러 메시지 매핑과 리다이렉트 값만 수정했고 호출 위치/패턴은 변경하지 않음.

**수락 기준**

- [x] 회원가입 / 로그인 / 로그아웃 / 비밀번호 재설정(발송까지) 흐름이 모두 정상 동작한다. 실제 계정(`archy713@naver.com`)으로 정상 로그인 → `/erp` 진입, 로그아웃 → `/auth/login` 복귀까지 Playwright로 확인.
- [x] 로그인 성공 시 `/erp`로 진입한다.

**테스트 체크리스트 (Playwright MCP)** — 실계정(`archy713@naver.com`, 사용자 제공 비밀번호는 세션 내에서만 사용하고 저장하지 않음) + 신규 테스트 계정으로 검증

- [x] 신규 이메일 회원가입 → `sign-up-success` 안내 화면 노출 확인
- [x] 잘못된 비밀번호 입력 시 한국어 에러 메시지("이메일 또는 비밀번호가 올바르지 않습니다.") 노출 확인
- [x] 정상 로그인 → `/erp` 진입 확인, 콘솔 에러 0건
- [x] 비밀번호 재설정 링크 만료/무효 시 `app/auth/error` 화면 노출 확인 — `/auth/confirm`에 잘못된 `token_hash`로 접근해 `error=otp_expired`로 리다이렉트되고 "인증 링크가 만료되었습니다. 다시 시도해주세요."가 렌더링되는 것을 확인 (`missing_token`/`missing_code` 경로도 함께 확인)
- [x] (추가) 중복 이메일 회원가입 시 "이미 가입된 이메일입니다." 노출 확인
- [x] (추가) 비밀번호 불일치(회원가입) 시 "비밀번호가 일치하지 않습니다." 노출 확인

**검증 중 발견한 이슈**: 이 프로젝트의 Supabase Auth "Confirm email" 설정이 꺼져 있어(가입 즉시 `email_confirmed_at` 채워짐) 회원가입 시 실제 이메일 인증 절차 없이 계정이 바로 활성화됨 — 사용자 확인 결과 **의도된 설정**(2026-08-15).

---

#### Task 009: 구글 OAuth 인증 활성화 및 검증 (F002)

**목표**: 구글 로그인을 실제 동작 상태로 만든다.
**참고**: `components/google-auth-button.tsx`(`signInWithOAuth({ provider: "google" })`)와 `app/auth/callback/route.ts`(코드 교환)가 **이미 구현되어 있다.** 이 Task는 대부분 **Provider 설정 + 검증**이다.

**관련 파일**

- `components/google-auth-button.tsx` (기존), `components/login-form.tsx` (이미 연결됨)
- `app/auth/callback/route.ts` (기존)

**구현 체크리스트**

- [ ] Google Cloud Console에서 OAuth 클라이언트를 생성하고 승인된 리디렉션 URI에 Supabase 콜백 URL을 등록한다.
- [ ] Supabase 대시보드 > Authentication > Providers에서 Google Provider를 활성화하고 Client ID/Secret을 설정한다.
- [ ] Supabase Auth의 Redirect URLs에 `http://localhost:3000/auth/callback` 및 배포 도메인 콜백을 등록한다.
- [ ] `redirectTo` 값이 `window.location.origin` 기반이므로 로컬/배포 양쪽에서 올바르게 동작하는지 확인한다.
- [ ] 콜백 후 최종 랜딩이 `/erp`가 되도록 `next` 파라미터 기본값을 정리한다 (Task 008과 동일 지점).
- [ ] 구글 계정으로 최초 로그인 시 `profiles` 레코드가 생성되는지 확인한다 (없다면 Task 010의 트리거로 보강).
- [ ] 회원가입 페이지에도 동일 버튼을 노출할지 결정하고 반영한다.

**수락 기준**

- "Google로 계속하기" → 동의 화면 → 콜백 → `/erp` 진입이 성공한다.
- 구글 로그인 계정도 이메일 계정과 동일하게 `profiles`에 레코드를 갖는다.

**테스트 체크리스트 (Playwright MCP)**

- [ ] 로그인 페이지에서 "Google로 계속하기" 클릭 → Google 도메인으로 리다이렉트되는지 확인 (`browser_network_requests`)
- [ ] 콜백 실패 시나리오(잘못된 code) → `app/auth/error` 화면 노출 확인
- [ ] 로그인 후 `AuthButton`에 구글 계정 정보가 표시되는지 확인

---

#### Task 010: 다크모드 및 i18n 통합 확인 (F003)

**목표**: 기존 `next-themes` / i18n 컴포넌트가 ERP 화면에서도 문제없이 동작하는지 확인한다. **신규 개발이 아닌 통합 점검 수준.**

**관련 파일**

- `components/theme-switcher.tsx`, `components/language-switcher.tsx` (모두 무변경)
- `app/globals.css`, `tailwind.config.ts`
- `lib/i18n/dictionaries/{ko,en,ja,zh}.ts`, `lib/i18n/dictionaries/types.ts`

**구현 체크리스트**

- [ ] ERP 셸(Menubar / 트리 / 콘텐츠 / Breadcrumb)의 모든 색상이 `--background` `--primary` 등 **CSS 변수 토큰**을 사용하는지 점검한다 (하드코딩 색상 제거).
- [ ] 다크모드 전환 시 트리 활성 노드·Menubar 활성 탭의 대비가 충분한지 확인한다.
- [ ] 새로고침 후에도 테마가 유지되는지 확인한다 (`suppressHydrationWarning` + `ThemeProvider` 기존 설정).
- [ ] ERP 셸의 **UI 라벨**(로그아웃, 메뉴 열기, 추후 구현 예정 등)만 4개 언어 사전에 추가한다. **메뉴명 자체는 한국어 단일 값 유지**(범위 제외).
- [ ] 사전 추가 시 `lib/i18n/dictionaries/types.ts`의 `Dictionary` 타입과 `ko/en/ja/zh` 4개 파일을 **모두** 갱신한다.

**수락 기준**

- 라이트/다크 양쪽에서 ERP 화면의 모든 텍스트가 읽히고, 새로고침 후 테마가 유지된다.
- 언어 전환 시 ERP 셸의 UI 라벨이 바뀌고 `router.refresh()` 후 레이아웃이 깨지지 않는다.

---

### Phase 2-B: 데이터 모델 구축 ✅

#### Task 011: profiles.is_active 추가 (기존 role/RLS/관리자 시드는 재사용) ✅

**목표**: 원래 계획은 "역할 컬럼 신설 + 관리자 시드"였으나, Task 009 검증 중 이 Supabase 프로젝트가 이미 다른 앱("weeklyplan")과 백엔드를 공유하며 `profiles.role`(user/admin/superadmin)·RLS·관리자 보호 트리거가 **이미 구현·운영 중**임을 확인했다(위 "아키텍처 사전 결정 사항 → Supabase 백엔드 공유" 참고). 이에 따라 이 Task는 **기존 것을 다시 만들지 않고, 정말로 없는 것(`is_active`)만 추가**하는 것으로 범위를 축소한다.

**착수 전 확인 결과 (재사용 가능 여부 조사)**

| 원래 계획                                                              | 실제 DB 상태                                                                                                                                                                                       | 결론                                                                                                                                    |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `role text` + admin/user 체크 컬럼 신설                                | 이미 존재 — `role in ('user','admin','superadmin')`                                                                                                                                                | **재사용**, 신규 마이그레이션 불필요. ERP 관점에서는 `admin`/`superadmin` 둘 다 "관리자"로 취급                                         |
| `handle_new_user()` 트리거 신설                                        | 이미 존재 (`insert into public.profiles(id, email) values (new.id, new.email)`)                                                                                                                    | **재사용**                                                                                                                              |
| `archy712@gmail.com` → `role='admin'` 시드                             | 이미 `superadmin`(요구보다 상위 등급)                                                                                                                                                              | **불필요**, 손대지 않음                                                                                                                 |
| RLS(본인 select/update + 관리자 전체 select/update, `is_admin()` 헬퍼) | `profiles_select_own_or_admin` / `profiles_update_own_or_admin` 정책 + `is_admin()`/`is_superadmin()` SECURITY DEFINER 함수 이미 존재. `is_admin()` 정의가 정확히 `role in ('admin','superadmin')` | **재사용**                                                                                                                              |
| 마지막 관리자 강등 방지                                                | `prevent_unauthorized_role_change` 트리거가 이미 처리(관리자 1명만 남았을 때 강등 시도 시 예외)                                                                                                    | **재사용**. 단, "본인 강등 방지"(관리자가 여럿일 때 스스로 강등하는 것)는 이 트리거가 막지 않음 → Task 015에서 앱 레벨로 별도 구현 필요 |
| `is_active boolean`                                                    | 없음. `departments`/`organizations`/`work_types`는 `archived_at` 소프트 삭제 방식을 쓰지만 "로그인 자체를 막는 사용자 활성화 여부" 개념은 없음                                                     | **신규 추가 필요** — 이번 Task의 실질적 작업                                                                                            |

**관련 파일**

- Supabase 마이그레이션 (`mcp__supabase__apply_migration`)
- `lib/supabase/database.types.ts` (재생성)

**구현 체크리스트**

- [x] `mcp__supabase__list_tables`/`execute_sql`로 `profiles` 현재 스키마, RLS 정책, 관련 함수(`is_admin`/`is_superadmin`/`handle_new_user`/`prevent_unauthorized_role_change`) 전수 확인 — 위 표로 정리.
- [x] `archy712@gmail.com`/`archy713@naver.com` 등 기존 계정의 `role`을 `execute_sql`로 확인 — 이미 각각 `superadmin`/`admin`으로 설정되어 있음을 확인, 변경 없음.
- [x] 마이그레이션 적용(`add_profiles_is_active`): `alter table public.profiles add column is_active boolean not null default true;` + 컬럼 코멘트. role 컬럼/시드/RLS/트리거는 전부 스킵(이미 있음).
- [x] `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성 — weeklyplan 쪽 테이블(`departments`/`weekly_logs*`/`organizations`/`work_types`/`notifications` 등)도 함께 타입이 생성되는 것은 정상(같은 프로젝트를 공유하므로).
- [x] `mcp__supabase__get_advisors`(security)로 확인 — 새 경고 없음. 기존에 있던 경고(SECURITY DEFINER 함수 6종의 `authenticated` 실행 권한, leaked password protection 비활성화)는 weeklyplan 쪽에서 이미 존재하던 것으로 이번 변경과 무관, 손대지 않음.

**⚠️ 타입 재생성 중 발견한 별도 이슈 (범위 밖이지만 typecheck 통과를 위해 같이 수정)**: 재생성된 타입으로 `npm run typecheck`를 돌리자 `app/protected/profile/page.tsx`/`components/profile-form.tsx`(스타터킷 튜토리얼의 프로필 편집 화면)가 실제로는 **존재한 적 없는 컬럼**(`username`/`full_name`/`avatar_url`)을 참조하고 있었음이 드러남 — 기존 `database.types.ts`가 실제 DB와 맞지 않는(한 번도 재생성된 적 없는) 낡은 스타터킷 기본 타입이라 지금까지 타입 체크는 통과했지만 실제 DB로는 원래도 동작 불가능했던 코드였음. `Tables<"profiles">`가 실제로 갖는 `name` 컬럼 하나로 매핑해 최소 수정(사용자 이름/프로필 이미지 URL 필드는 실제 스키마에 대응 개념이 없어 제거 — `avatar_key`는 URL이 아닌 프리셋 enum이라 별도 선택 UI가 필요하므로 이번 범위에 포함하지 않음). Playwright로 실계정(`archy713@naver.com`) 로그인 후 `/protected/profile`에서 기존 이름("홍길동") 정상 표시, 수정 후 저장, 원복까지 확인.

**수락 기준**

- [x] `archy712@gmail.com` 계정이 admin 이상 권한(`superadmin`)을 갖고 있다 (기존 상태 유지 확인).
- [x] 일반 사용자 세션에서 타인의 `profiles` 행이 조회되지 않는다 (기존 RLS 그대로 유효, 변경 없음이므로 회귀 없음).
- [x] `npm run typecheck` 통과 (재생성된 타입 기준, `npm run check-all` 전체 통과).
- [x] 모든 기존 행(63건)이 `is_active=true`로 채워져 로그인 차단 없이 마이그레이션됨 — `execute_sql`로 `count(*)=63, count(*) filter (where is_active)=63` 확인.

**테스트 체크리스트**

- [x] `execute_sql`로 마이그레이션 후 `profiles` 전체 행이 `is_active=true`인지 확인.
- [x] Playwright로 신규 가입(`erp-task011-test@example.com`) → `execute_sql`로 `role='user'`, `is_active=true` 확인, 테스트 계정은 삭제해 정리.
- [ ] `is_active=false` 계정의 로그인 차단은 이 컬럼을 실제로 읽는 로직(Task 013 `getCurrentErpUser()`)이 아직 없어 **이번 Task에서는 컬럼 추가까지만** 검증, 차단 동작 자체는 Task 013에서 구현 후 검증.

---

#### Task 012: menus / user_menu_permissions 테이블 생성 ✅

**목표**: 메뉴 트리와 사용자별 메뉴 권한을 저장할 스키마를 구축한다.

> Task 011 재검토 결과 참고: 이 두 테이블은 weeklyplan 기존 스키마와 이름이 겹치지 않는 완전 신규 도메인이라 아래 계획을 그대로 진행한다. weeklyplan은 `organization_id` 기반 멀티테넌시 패턴(`current_organization_id()`)을 쓰지만, 현재 `organizations`가 1행뿐이고 ERP MVP PRD엔 멀티테넌시 요구가 없으므로 **`menus`/`user_menu_permissions`에는 `organization_id`를 넣지 않고 전역으로 둔다** (필요해지면 그때 추가).

**관련 파일**

- Supabase 마이그레이션
- `lib/supabase/database.types.ts` (재생성 필요)

**구현 체크리스트**

- [x] `menus` 테이블 생성(`create_menus_and_user_menu_permissions` 마이그레이션):
  - [x] `id uuid pk default gen_random_uuid()`
  - [x] `parent_id uuid references menus(id) on delete cascade` (nullable, 대분류는 null)
  - [x] `level integer not null check (level between 1 and 3)`
  - [x] `name text not null`
  - [x] `sort_order integer not null default 0`
  - [x] `is_active boolean not null default true`
  - [x] `created_at` / `updated_at` timestamptz (`updated_at`는 weeklyplan에 이미 있던 범용 트리거 `public.set_updated_at()`를 재사용 — 새 함수 안 만듦)
  - [x] 인덱스: `(parent_id, sort_order)`
  - [x] 정합성 제약: `menus_level_parent_consistency` check — `level = 1`이면 `parent_id is null`, `level > 1`이면 `parent_id is not null`
- [x] `user_menu_permissions` 테이블 생성:
  - [x] `id uuid pk`, `user_id uuid references profiles(id) on delete cascade`
  - [x] `menu_id uuid references menus(id) on delete cascade`
  - [x] `granted_by uuid references profiles(id)`, `granted_at timestamptz default now()`
  - [x] `unique (user_id, menu_id)` — 중복 부여 방지
  - [x] 인덱스: `(user_id)` + 후속 마이그레이션(`add_user_menu_permissions_fk_covering_indexes`)으로 `menu_id`/`granted_by` FK 커버링 인덱스 추가(`get_advisors` performance 권고 반영)
- [x] RLS 정책 (기존 `is_admin()` 헬퍼 재사용, 새 함수 안 만듦):
  - [x] `menus` — 인증 사용자 select 허용, insert/update/delete는 `is_admin()`만
  - [x] `user_menu_permissions` — 본인 행 또는 `is_admin()` select 허용, insert/update/delete는 `is_admin()`만
- [x] `mcp__supabase__generate_typescript_types`로 타입 재생성 → `lib/supabase/database.types.ts`에 `menus`/`user_menu_permissions` 블록 반영.
- [x] `mcp__supabase__get_advisors`(security+performance) 확인 — security는 기존 경고 외 신규 없음. performance에서 FK 커버링 인덱스 INFO 2건이 나와 바로 인덱스 추가로 해소(위 참고). `unused_index`(INFO)는 방금 만든 테이블이라 아직 쿼리 트래픽이 없어서 뜨는 것으로 정상.

**수락 기준**

- [x] 대분류만 단독 등록(`level=1`, `parent_id=null`)이 성공한다 — 하위 노드 없이도 유효해야 한다.
- [x] 일반 사용자 세션에서 `menus` insert 시도가 RLS로 차단된다.

**테스트 체크리스트**

- [x] `mcp__supabase__execute_sql`로 대분류 단독 insert 성공 확인.
- [x] `level=2`인데 `parent_id=null`인 insert가 제약 위반(`menus_level_parent_consistency`)으로 실패하는지 확인.
- [x] 동일 `(user_id, menu_id)` 중복 insert가 unique 제약(`user_menu_permissions_user_id_menu_id_key`)으로 실패하는지 확인.
- [x] 상위 메뉴 삭제 시 하위 메뉴와 관련 권한이 cascade 삭제되는지 확인 — 테스트 대분류 삭제 후 연결된 `user_menu_permissions` 행이 0건으로 확인.
- [x] (추가) `set_config`로 일반 사용자(`role='user'`) JWT를 시뮬레이션해 `menus` insert 시도 → RLS 정책 위반(`42501`)으로 실제 차단되는 것을 SQL 레벨에서 직접 확인. 테스트에 사용한 모든 `TEST_%` 행은 정리 완료(잔존 0건).

---

#### Task 013: 메뉴/권한 데이터 액세스 계층 구현 ✅

**목표**: 이후 모든 화면이 공유할 서버 측 조회/권한 판정 함수를 한 곳에 모은다.

**관련 파일**

- `lib/erp/queries.ts` (신규 — 조회)
- `lib/erp/auth.ts` (신규 — 권한 판정)
- `lib/erp/actions.ts` (신규 — Server Actions)
- `lib/supabase/server.ts` (기존 재사용)

**구현 체크리스트**

- [x] `lib/erp/auth.ts`:
  - [x] `getCurrentErpUser()` — `getClaims()`로 사용자 확인 후 `profiles`에서 `id/email/name/role/is_active` 조회. 미인증이거나 profiles 행이 없으면 `redirect("/auth/login")`. `is_active=false`면 동일하게 `/auth/login`으로 리다이렉트(Task 011에서 미룬 검증을 여기서 마무리).
  - [x] `requireAdmin()` — `isAdminRole(role)`(`role in ('admin','superadmin')`, DB `public.is_admin()`과 동일 판정)로 앱 레벨에서 미러링. 관리자가 아니면 `/erp`로 리다이렉트(**TODO(Task 014)**: `/erp/forbidden` 생기면 그쪽으로 교체 — 주석으로 남겨둠). 새 DB 함수는 만들지 않음.
  - [x] `canAccessMenu(userId, menuId)` — 관리자면 무조건 `true`, 아니면 `user_menu_permissions` 조회.
- [x] `lib/erp/queries.ts`:
  - [x] `getAllMenus({ activeOnly? })` — 전체 메뉴 평면 조회, `activeOnly` 옵션 지원(기본은 전체 — Task 016 관리자 메뉴 CRUD 화면이 비활성 메뉴도 봐야 하므로).
  - [x] `getVisibleMenuTree(userId, knownRole?)` — 권한 있는 메뉴 + 조상 노드를 포함한 트리 반환(PRD 4.2). **정책 확정**: `is_active=false` 메뉴는 관리자/일반 사용자 구분 없이 항상 제외(활성 관리는 Task 016의 몫). `knownRole`을 넘기면(예: `getCurrentErpUser()`를 이미 호출한 caller) `profiles` 재조회를 생략 — 명시된 시그니처(`getVisibleMenuTree(userId)`)는 그대로 유지하면서 선택적 최적화만 추가.
  - [x] `getMenuById(menuId)`, `getMenuBreadcrumb(menuId)` — breadcrumb은 전체 메뉴를 한 번 조회해 메모리에서 parentId 체인을 역추적(대상 없으면 `null`).
  - [x] `getUsers()`, `getUserPermissions(userId)` — `getUsers()`는 Task 015용 목록 컬럼(`id/email/name/role/is_active/avatar_key/created_at`)만 `Pick`. `getUserPermissions()`는 `user_menu_permissions`→`menus` 임베디드 select로 부여된 메뉴 목록 반환(Task 017용).
- [x] `lib/erp/actions.ts` — 아직 실제 액션 없이 "첫 줄에서 `requireAdmin()` 호출" 규약을 문서화한 골격만 작성(`export {}`). 실제 액션은 Task 015~017에서 채움.
- [x] 조회 함수는 전부 함수 내부에서 `await createClient()`로 매번 새로 생성(전역 변수 없음).
- [x] `getCurrentErpUser`/`getAllMenus` 등은 전부 `cookies()`를 쓰는 `createClient()`에 의존하므로, 이를 호출하는 컴포넌트는 `<Suspense>` 경계가 필요하다는 점을 각 함수 JSDoc에 명시.
- [x] `lib/erp/mock-menus.ts`는 이번 Task에서 손대지 않음 — 실 조회로의 교체 시점은 이미 파일 자체 주석에 "Task 021에서 완전히 제거" 로 명시돼 있어 중복 기록하지 않음. `app/erp/layout.tsx`/`app/erp/menu/[menuId]/page.tsx`에 `getVisibleMenuTree`/`canAccessMenu`를 실제로 연결하는 것은 **Task 018 범위**(로드맵에 이미 명시)라 이번 Task에서는 건드리지 않음.

**수락 기준**

- [x] `getVisibleMenuTree()`가 관리자에게는 (활성) 전체 트리를, 일반 사용자에게는 권한 있는 리프 + 그 조상만 반환한다.
- [x] 권한이 소분류에만 있어도 상위 중/대분류가 경로 노출용으로 함께 반환된다.

**테스트 체크리스트**

검증 방법: `lib/erp/*`는 서버 전용 함수라 브라우저에서 직접 호출할 수 없어, **임시 디버그 라우트**(`app/api/debug-task013/route.ts` — `getCurrentErpUser()`+`getVisibleMenuTree()`+`canAccessMenu()`를 호출해 JSON으로 반환)를 만들어 Playwright로 실제 로그인 세션에 대해 검증한 뒤 **검증 완료 즉시 삭제**했다(커밋된 적 없음, `git status`로 잔존 없음 확인). 테스트용 메뉴 트리(대분류A→중분류B→소분류C1/C2/비활성C3, 단독 대분류D)와 계정(`erp-task013-permitted@example.com`)도 검증 후 전부 삭제.

- [x] 관리자(`archy713@naver.com`, role=admin) / 권한 부여 전 일반 사용자 / 소분류 1개(C1)만 권한 부여된 동일 사용자 — 3개 상태로 `getVisibleMenuTree()` 결과 비교. 권한 부여 전: `tree=[]`. 부여 후: `tree=[A>B>C1]`(C2/C3/D 전부 제외). 관리자: `tree=[A>B>{C1,C2}, D]`(비활성 C3만 제외).
- [x] 소분류 1개(C1)만 부여된 사용자에게 상위 노드 2개(A, B)가 함께 반환되는지 확인 — 위 결과로 확인.
- [x] `is_active=false` 메뉴(C3)가 트리에서 제외되는지 확인 — 관리자 조회에서도 제외됨을 확인(정책: 관리자도 예외 없이 제외).
- [x] (추가) `canAccessMenu()` 확인 — 권한 있는 사용자가 C1은 `true`, C2는 `false`. 관리자는 비활성 C3에 대해서도 `true`(관리자는 활성 여부와 무관하게 항상 통과하는 것이 의도된 동작 — `canAccessMenu`는 접근 제어용이지 노출 필터가 아님).

---

### Phase 2-C: 관리자 전용 CRUD 화면

#### Task 014: 관리자 영역 가드 및 접근 거부 화면 구현 ✅

**목표**: 관리자 전용 화면의 진입 가드와, 권한 없는 접근 시 표시될 공용 안내 화면을 먼저 만든다 (Task 015~017의 공통 선행 작업).

**관련 파일**

- `app/erp/admin/layout.tsx` (신규)
- `components/erp/access-denied.tsx` (신규)
- `app/erp/forbidden/page.tsx` (신규)
- `lib/erp/auth.ts` — `requireAdmin()` 리다이렉트 대상을 `/erp` → `/erp/forbidden`으로 교체
- `lib/erp/menu-routes.ts` (신규)
- `app/erp/menu/[menuId]/page.tsx` — 관리자 3종 소분류를 실제 라우트로 리다이렉트하는 분기 추가
- **(계획에 없었으나 검증을 위해 추가)** `app/erp/admin/{users,menus,permissions}/page.tsx` — Task 015~017 관련 파일로 예정돼 있던 실제 구현 전까지, 가드 동작을 실제 라우트로 검증하기 위한 최소 스텁("Task 0NN에서 구현됩니다" 안내 문구만 있음). 각 Task가 콘텐츠를 실제 화면으로 교체하면 된다.

**구현 체크리스트**

- [x] `app/erp/admin/layout.tsx`에서 `requireAdmin()`을 호출해 관리자가 아니면 접근 거부 화면으로 보낸다.
- [x] `AccessDenied` 컴포넌트 구현 — 안내 메시지 + "홈으로 돌아가기"(`/erp`) 버튼. ERP 셸 안에서 렌더링되어야 한다(`app/erp/forbidden`이 `app/erp/layout.tsx` 하위 세그먼트라 자동으로 `ErpShell` 안에서 렌더링됨).
- [x] 관리자 3개 화면의 라우트를 확정한다: `/erp/admin/users`, `/erp/admin/menus`, `/erp/admin/permissions`.
- [x] 메뉴 트리의 "마스터 관리 > 기본 관리" 하위 3개 소분류를 **플레이스홀더가 아닌 위 실제 라우트로 연결**하는 매핑 규칙을 정한다 — `lib/erp/menu-routes.ts`에 **메뉴 이름 경로("대>중>소")** → 라우트 매핑 테이블로 구현(고정 UUID 대신 이름 경로를 키로 선택: Mock 데이터의 문자열 id와 Task 019 이후 실 DB의 UUID가 서로 달라도 매핑이 깨지지 않도록 하기 위함). `app/erp/menu/[menuId]/page.tsx`에서 breadcrumb 계산 직후 매핑 확인 → 있으면 `redirect()`.
- [x] 레이아웃은 얇은 `Layout` + `<Suspense>` + `async` 가드 컴포넌트 패턴으로 작성한다.

**수락 기준**

- [x] 일반 사용자가 `/erp/admin/users`에 직접 접근하면 접근 거부 화면이 표시된다.
- [x] 관리자는 3개 관리자 경로에 모두 진입할 수 있다.

**테스트 체크리스트 (Playwright MCP)** — 임시 테스트 계정 2개(admin 1 / user 1)로 검증 후 즉시 삭제(`auth.users` 삭제 → `profiles` cascade 확인, 잔존 0건)

- [x] 일반 사용자로 `/erp/admin/users`·`/erp/admin/menus`·`/erp/admin/permissions` 직접 진입 → 3개 모두 `/erp/forbidden`으로 리다이렉트 + 접근 거부 화면 + 홈 버튼 동작 확인
- [x] 관리자로 동일 3개 경로 진입 → 정상 화면(스텁 콘텐츠) 확인
- [x] 미인증 상태로 진입 → `/auth/login` 리다이렉트 확인 (`curl`로 재확인, 코드 변경 없는 영역이라 회귀 없음)
- [x] (추가) `/erp/menu/master-basic-{users,menus,permissions}` 접근 시 관리자는 대응 관리자 라우트로, 일반 사용자는 관리자 라우트를 거쳐 다시 `/erp/forbidden`으로 이어지는 이중 리다이렉트 확인
- [x] (추가) 매핑에 없는 메뉴("경영정보")는 리다이렉트 없이 기존 플레이스홀더 그대로 렌더링되는지 확인(회귀 없음)
- [x] `browser_console_messages`로 전 시나리오 콘솔 에러 0건 확인
- [x] `npm run check-all` 통과 (타입체크/린트/포맷 모두 기존 warning 외 신규 이슈 없음)

---

#### Task 015: 사용자 관리 화면 구현 (F005) ✅

**목표**: 관리자가 전체 사용자를 조회하고 활성 상태·관리자 권한을 변경할 수 있게 한다.

**관련 파일**

- `app/erp/admin/users/page.tsx` (스텁 → 실 구현으로 교체)
- `components/erp/admin/user-table.tsx` (신규)
- `lib/erp/actions.ts` — `setUserActiveAction`/`setUserAdminRoleAction` 추가
- `components/ui/{table,switch,badge,avatar,pagination,alert-dialog,input}.tsx` (기존 재사용 — `data-table.tsx`는 검색 툴바를 얹기 어려워 사용하지 않고, 동일 패턴을 `@tanstack/react-table` 직접 사용으로 재구성)
- **(계획에 없었으나 검증 중 발견해 추가)** `app/erp/layout.tsx` — `getCurrentErpUser()` 호출 추가. 아래 참고.

**구현 체크리스트**

- [x] 사용자 목록 테이블 구현 — 컬럼: 아바타(이니셜 `AvatarFallback` — `avatar_key`는 URL이 아닌 프리셋 enum이라 이미지 매핑 불가, Task 011 결정과 동일 이유) / 이메일 / 이름 / 역할(`Badge`) / 관리자 지정(버튼+`AlertDialog`) / 활성 여부(`Switch`) / 가입일.
- [x] 이메일·이름 검색 필터(클라이언트 사이드, `useMemo` 필터링)와 페이지네이션(`@tanstack/react-table`의 `getPaginationRowModel` + `components/ui/pagination.tsx`)을 적용한다. 검색어 변경 시 페이지를 1페이지로 리셋.
- [x] 활성/비활성 토글 Server Action(`setUserActiveAction`) — `Switch` 변경 시 `profiles.is_active` 갱신.
- [x] 관리자 권한 부여/회수 Server Action(`setUserAdminRoleAction`) — `profiles.role`을 `user ↔ admin`으로만 전환(슈퍼관리자 승격/강등은 화면 범위 밖 — DB 트리거가 admin이 아닌 상태에서 superadmin 직접 승격을 막음). `superadmin` 행은 버튼 대신 "최고 관리자" 텍스트만 표시.
- [x] **자기 자신의 관리자 권한 회수 방지** — Server Action에서 `userId === admin.id && !makeAdmin`이면 즉시 거부. UI에서도 본인 행의 "관리자 해제" 버튼을 `disabled` + `title` 툴팁으로 선제 차단(이중 방어). **마지막 관리자 강등 방지**는 DB 트리거(`prevent_unauthorized_role_change`)가 처리하며, 트리거의 한국어 에러 메시지(`error.message`)를 그대로 토스트에 전달.
- [x] 관리자 지정/해제(파괴적 동작)는 `AlertDialog`로 확인 절차를 둔다. 활성/비활성 토글은 되돌리기 쉬운 조작이라 확인 없이 즉시 반영(체크리스트가 명시적으로 `Switch`로 지정한 것과 일관).
- [x] 성공/실패 피드백은 `sonner`의 `toast.success`/`toast.error`로 표시.
- [x] 변경 후 `revalidatePath("/erp/admin/users")`로 목록을 갱신한다.

**(검증 중 발견해 이번 Task에서 함께 수정)** "비활성화된 사용자는 ERP 진입이 차단된다"는 Task 013에서 이미 구현된 `getCurrentErpUser()`의 `is_active` 체크에 의존하는데, 이 함수가 그때는 `app/erp/admin/layout.tsx`(Task 014, 관리자 영역)에서만 호출되고 있어 **일반(`/erp`, `/erp/menu/*`) 경로에서는 비활성 사용자가 여전히 진입 가능**했다(Playwright로 재현 확인). `app/erp/layout.tsx`(모든 `/erp/*`의 공통 진입점)에 `getCurrentErpUser()` 호출을 추가해 이중 방어를 완성했다 — `proxy.ts`는 세션 존재만 확인하므로 여기서 `is_active=false`를 걸러야 한다. 특정 메뉴 단위 접근 제어(`getVisibleMenuTree`/`canAccessMenu`)는 계획대로 Task 018 범위로 남겨둔다.

**수락 기준**

- [x] 관리자가 다른 사용자를 admin으로 승격/강등할 수 있다.
- [x] 비활성 처리된 사용자는 ERP 진입이 차단된다.
- [x] 마지막 관리자를 강등하려 하면 차단 메시지가 표시된다 — DB 레벨은 Task 012에서 SQL로 직접 검증 완료(트리거가 정상 동작), 이번 Task에서는 실제 운영 관리자 계정 수를 건드릴 수 없어 재현 테스트는 하지 않고 앱 코드가 `error.message`를 그대로 토스트로 전달하는 것만 코드 리뷰로 확인.

**테스트 체크리스트 (Playwright MCP)** — 임시 테스트 계정 2개(admin 1 / 승격 대상 user 1)로 검증 후 즉시 삭제(`auth.users` 삭제 → `profiles` cascade, 잔존 0건)

- [x] 목록 로딩(63명 실 데이터 + 테스트 계정 포함 65명 확인) 및 검색 필터("타깃유저" → 1건으로 좁혀짐, 페이지 표시 1/1로 리셋) 동작 확인
- [x] 활성 토글 off → 스위치 상태 즉시 반영 + 토스트 확인. 동일 계정으로 로그인 시도 → `/auth/login`으로 즉시 리다이렉트(위 `app/erp/layout.tsx` 수정 덕분에 차단) 확인 → 재활성화 후 재검증
- [x] 관리자 지정 → `AlertDialog` 확인 → "관리자" `Badge`+"관리자 해제" 버튼으로 전환 확인 → 관리자 해제 → 다시 "일반 사용자"로 복귀 확인
- [x] 자기 자신(로그인한 테스트 관리자 본인 행) 강등 시도 → "관리자 해제" 버튼이 처음부터 `disabled`로 렌더링되어 클릭 자체가 불가능한 것을 확인(클라이언트 가드). 서버 액션의 동일 조건 차단은 코드 리뷰로 확인(실제 RPC 우회 호출까지는 재현하지 않음).
- [x] 페이지네이션 Next 클릭 → "2 / 7 페이지"로 다음 10명 목록 교체 확인
- [x] 관리자 레이아웃 가드(Task 014)가 이 화면에도 여전히 적용되는지 재확인 — 비관리자 접근 시 `/erp/forbidden` (회귀 없음)
- [x] `browser_console_messages`로 전 시나리오 콘솔 에러 0건 확인
- [x] `npm run check-all` 통과 (신규 warning 없음, 기존 `@tanstack/react-table` 관련 warning만 유지)

---

#### Task 016: 메뉴 관리 화면 구현 (F006)

**목표**: 관리자가 대/중/소분류 메뉴 트리를 등록·수정·삭제·정렬할 수 있게 한다.

**관련 파일**

- `app/erp/admin/menus/page.tsx` (신규)
- `components/erp/admin/menu-manager.tsx`, `components/erp/admin/menu-form-dialog.tsx` (신규)
- `lib/erp/actions.ts`
- `components/ui/{tree-view,dialog,form,input,switch,select,alert-dialog}.tsx` (기존 재사용)

**구현 체크리스트**

- [ ] 좌측에 편집용 메뉴 트리(전체 노드, 비활성 포함)를 표시한다.
- [ ] 메뉴 등록 `Dialog` + `Form` 구현 — 필드: 상위 메뉴(선택, 없으면 대분류) / 레벨 / 메뉴명 / 정렬순서 / 사용여부.
- [ ] **상위 메뉴를 비우고 대분류 단독 노드를 등록**할 수 있어야 한다 (PRD 7.2 필수 요구).
- [ ] 상위 메뉴 선택 시 `level`이 자동 계산되고, 3레벨을 초과하는 등록은 막는다.
- [ ] 메뉴 수정 / 삭제 Server Action 구현. 삭제 시 **하위 메뉴와 부여된 권한이 함께 사라진다**는 경고를 `AlertDialog`로 표시한다.
- [ ] 정렬순서 변경 UI 구현 — 위/아래 버튼 방식(최소 구현) 또는 드래그 앤 드롭. **동일 부모 내 형제 노드끼리만** 순서가 유효하다.
- [ ] 사용여부 `Switch` 토글 구현 — 비활성 메뉴는 내비게이션에서 제외되지만 관리 화면에서는 계속 보인다.
- [ ] 모든 Server Action 첫 줄에서 `requireAdmin()` 호출.
- [ ] 변경 시 `revalidatePath("/erp", "layout")`로 내비게이션 트리를 갱신한다.

**수락 기준**

- 대분류만 단독으로 등록해도 정상 저장되고 Menubar에 즉시 노출된다.
- 등록/수정/삭제/정렬/사용여부 5개 동작이 모두 동작하고 새로고침 후 유지된다.

**테스트 체크리스트 (Playwright MCP)**

- [ ] 대분류 단독 등록 → Menubar 반영 확인
- [ ] 중분류 → 소분류 순차 등록 후 좌측 트리 계층 확인
- [ ] 정렬순서 변경 → 트리 순서 반영 확인
- [ ] 사용여부 off → 일반 사용자 내비게이션에서 사라지는지 확인
- [ ] 하위 노드가 있는 메뉴 삭제 → 경고 표시 및 cascade 결과 확인
- [ ] 메뉴명 미입력 등 유효성 실패 시 폼 에러 메시지 확인 (엣지 케이스)

---

#### Task 017: 사용자 권한 관리 화면 구현 (F007)

**목표**: 관리자가 사용자별로 접근 가능한 메뉴를 임의 레벨에서 부여/회수할 수 있게 한다.

**관련 파일**

- `app/erp/admin/permissions/page.tsx` (신규)
- `components/erp/admin/permission-editor.tsx` (신규)
- `lib/erp/actions.ts`
- `components/ui/{combobox,command,tree-view,checkbox,button}.tsx` (기존 재사용)

**구현 체크리스트**

- [ ] 사용자 선택 UI 구현 — `Combobox`/`Command` 기반 검색 가능 드롭다운.
- [ ] 선택한 사용자의 현재 권한을 반영한 **체크박스 트리**를 렌더링한다.
- [ ] **임의 레벨(대/중/소) 어디에나 체크 가능**해야 한다 (대분류만 체크하는 케이스 포함).
- [ ] 부모 체크 시 자식 일괄 체크 / 부분 선택(indeterminate) 표시 등 편의 동작을 정의하고 구현한다.
- [ ] 일괄 저장 Server Action 구현 — 기존 권한과 비교해 **추가분 insert / 제거분 delete**로 처리하고, `granted_by`에 현재 관리자 id, `granted_at`에 현재 시각을 기록한다.
- [ ] 저장은 단일 트랜잭션(또는 RPC)으로 처리해 부분 반영을 방지한다.
- [ ] 관리자 계정 선택 시 "관리자는 모든 메뉴에 접근하므로 개별 권한 설정이 불필요합니다" 안내를 표시한다.
- [ ] 저장하지 않고 사용자를 전환하려 할 때 변경사항 유실 경고를 표시한다.
- [ ] 저장 후 `revalidatePath("/erp", "layout")`.

**수락 기준**

- 특정 사용자에게 소분류 1개만 부여하면, 그 사용자 내비게이션에 해당 소분류와 상위 경로만 노출된다.
- 권한 회수 후 해당 메뉴가 즉시 사라진다.

**테스트 체크리스트 (Playwright MCP)**

- [ ] 사용자 검색 → 선택 → 기존 권한 체크 상태 반영 확인
- [ ] 소분류 1개 체크 → 저장 → 해당 사용자로 로그인 → 상위 경로 포함 노출 확인
- [ ] 대분류 단독 노드 체크 → 저장 → 해당 사용자 Menubar 노출 확인
- [ ] 권한 전체 해제 → 저장 → 해당 사용자에게 메뉴가 하나도 안 보이는지 확인
- [ ] 저장 중 네트워크 실패 시 롤백 및 에러 토스트 확인 (엣지 케이스)

---

### Phase 2-D: 메뉴 접근 제어 및 전체 메뉴 데이터 연결

#### Task 018: 메뉴 접근 제어 적용 (F008)

**목표**: 내비게이션 필터링과 서버단 재검증의 이중 방어를 완성한다.

**관련 파일**

- `components/erp/erp-menubar.tsx`, `components/erp/erp-menu-tree.tsx`
- `app/erp/layout.tsx`, `app/erp/menu/[menuId]/page.tsx`
- `lib/erp/auth.ts`, `lib/erp/queries.ts`
- `components/erp/access-denied.tsx`

**구현 체크리스트**

- [ ] ERP 셸의 트리/Menubar 데이터 소스를 `getVisibleMenuTree(userId)` 결과로 교체한다 (**1차 방어: 노출 필터링**).
- [ ] `app/erp/menu/[menuId]/page.tsx`에서 `getClaims()` + `canAccessMenu()`로 재검증한다 (**2차 방어: 서버단**). 실패 시 `AccessDenied` 렌더링.
- [ ] 관리자 화면 3종에도 동일한 2차 방어가 적용되어 있는지 확인한다 (Task 014와 중복 점검).
- [ ] `role='admin'`이면 권한 데이터와 무관하게 항상 통과하는 경로를 확인한다.
- [ ] `is_active=false` 사용자는 ERP 진입 자체를 차단한다.
- [ ] **`proxy.ts` / `lib/supabase/proxy.ts`의 쿠키 처리 로직은 변경하지 않는다** — 메뉴 단위 권한은 프록시가 아닌 서버 컴포넌트에서 판정한다.
- [ ] 권한 조회가 매 페이지 렌더마다 중복 발생하지 않도록 요청 단위 캐싱(`React.cache` 등)을 적용한다.

**수락 기준**

- 권한 없는 메뉴는 Menubar/트리 어디에도 노출되지 않는다.
- URL을 직접 입력해도 접근 거부 화면이 표시된다.
- 관리자는 예외 없이 전체 메뉴에 접근한다.

**테스트 체크리스트 (Playwright MCP)**

- [ ] 일반 사용자 로그인 → 부여받은 메뉴만 노출되는지 확인
- [ ] 권한 없는 `menuId` URL 직접 입력 → 접근 거부 화면 확인
- [ ] 관리자 로그인 → 전체 메뉴 노출 및 전 메뉴 진입 확인
- [ ] 권한 부여 직후 해당 사용자 화면 새로고침 → 즉시 반영 확인 (revalidate 검증)
- [ ] 비활성 사용자 로그인 → ERP 진입 차단 확인
- [ ] 존재하지 않는 `menuId` → not-found 화면 확인 (엣지 케이스)

---

#### Task 019: 기준정보/상품 관리 메뉴 데이터 등록 (F011)

**목표**: 마스터 관리 하위의 기준정보 관리·상품 관리 메뉴를 데이터로 등록한다. **화면 로직은 F010 공용 플레이스홀더로 렌더링하며 CRUD는 범위 제외.**

**관련 파일**

- Supabase 시드 마이그레이션
- `app/erp/admin/menus/page.tsx` (등록 수단)
- `components/erp/menu-placeholder.tsx`

**구현 체크리스트**

- [ ] 대분류 "마스터 관리" 등록.
- [ ] 중분류 "기본 관리" + 소분류 3개(사용자 관리 / 메뉴 관리 / 사용자 권한 관리) 등록 → **Task 014의 매핑 규칙에 따라 실제 관리자 화면으로 연결**.
- [ ] 중분류 "기준정보 관리" + 소분류 6개 등록: 법인 관리 / 브랜드 관리 / 소브랜드 관리 / 아이템·서브아이템 관리 / 상품 컬러 관리 / 상품 사이즈 관리.
- [ ] 중분류 "상품 관리" + 소분류 3개 등록: 상품 관리 / 상품 정보 현황 / 상품 정보 일괄 수정.
- [ ] 각 노드의 `sort_order`를 PRD 7.2 트리 순서와 일치시킨다.
- [ ] 기본 관리 3종을 제외한 9개 소분류가 모두 `MenuPlaceholder`로 렌더링되는지 확인한다.
- [ ] 시드는 **멱등하게** 작성한다 (재실행 시 중복 생성 없음 — 고정 UUID 또는 `on conflict do nothing`).

**수락 기준**

- 마스터 관리 하위 3개 중분류와 12개 소분류가 트리에 정상 표시된다.
- 기본 관리 3종은 실제 화면으로, 나머지 9종은 플레이스홀더로 이동한다.

**테스트 체크리스트 (Playwright MCP)**

- [ ] 관리자 로그인 → 마스터 관리 대분류 클릭 → 중분류 3개 확인
- [ ] 기준정보 관리 하위 6개 소분류 각각 클릭 → 제목 + "추후 구현 예정" 배지 확인
- [ ] 기본 관리 > 사용자 관리 클릭 → 플레이스홀더가 아닌 실제 테이블 화면 진입 확인

---

#### Task 020: 대분류 Placeholder 메뉴 14개 등록 (F012)

**목표**: 중/소분류가 미확정인 14개 대분류를 대분류 노드만으로 등록한다.

**관련 파일**

- Supabase 시드 마이그레이션
- `components/erp/erp-menubar.tsx`

**구현 체크리스트**

- [ ] 대분류 14개 등록 (`level=1`, `parent_id=null`): 경영정보 / 인사급여 / 웹회계 / 기획 / 소싱 / 물류 / 협력사 / 영업 / 영업관리 / 영업기획 / 고객관리 / 웹POS / C&F / 게시판.
- [ ] `sort_order`를 PRD 7.2 나열 순서와 일치시키고, "마스터 관리"가 가장 앞에 오도록 한다.
- [ ] 각 대분류 클릭 시 하위 노드가 없어도 에러 없이 `MenuPlaceholder`가 렌더링되는지 확인한다.
- [ ] Menubar에 총 15개 대분류가 들어갔을 때의 **가로 오버플로우 처리**를 최종 확인한다 (Task 004에서 준비한 처리 검증).
- [ ] 좌측 트리 영역이 비었을 때의 빈 상태 UI를 처리한다 (`components/ui/empty.tsx`).
- [ ] 향후 하위 메뉴 추가 시 **스키마 변경 없이** 메뉴 관리 화면에서 확장 가능함을 실제로 1건 추가해 검증한다 (검증 후 롤백).
- [ ] 시드는 멱등하게 작성한다.

**수락 기준**

- Menubar에 총 15개 대분류가 표시되고 모두 클릭 가능하다.
- 하위 없는 대분류 클릭 시 플레이스홀더 화면이 정상 표시된다.

**테스트 체크리스트 (Playwright MCP)**

- [ ] 15개 대분류 전부 순회 클릭 → 각각 제목 표시 확인
- [ ] 모바일 뷰(390px)에서 15개 대분류 접근성 확인
- [ ] 임의 대분류에 중분류 1개 추가 → 트리 확장 동작 확인 → 삭제 후 원복

---

#### Task 021: 임시 데이터 제거 및 DB 연동 최종 전환

**목표**: Phase 1의 하드코딩 트리를 완전히 걷어내고 DB를 유일한 메뉴 소스로 만든다.

**관련 파일**

- `lib/erp/mock-menus.ts` (삭제 대상)
- `components/erp/erp-menubar.tsx`, `components/erp/erp-menu-tree.tsx`
- `app/erp/layout.tsx`

**구현 체크리스트**

- [ ] `lib/erp/mock-menus.ts`에 대한 모든 참조를 제거하고 파일을 삭제한다.
- [ ] Task 013에서 남긴 TODO 주석을 전부 해소한다.
- [ ] 메뉴 조회 지연에 대비해 트리/Menubar에 `Skeleton` 로딩 상태를 적용한다 (`components/ui/skeleton.tsx`).
- [ ] 메뉴 조회 실패 시의 에러 바운더리 동작을 확인한다 (`app/erp/error.tsx`).
- [ ] `npm run check-all` 통과.

**수락 기준**

- 코드베이스에 하드코딩된 메뉴 데이터가 남아 있지 않다.
- DB에서 메뉴를 수정하면 즉시 화면에 반영된다.

---

### Phase 2-E: 통합 검증

#### Task 022: MVP 완료 기준 전체 검증

**목표**: PRD 12절 "Phase 2 이후 완료 기준" 8개 항목을 전수 검증한다.

**구현 체크리스트**

- [ ] 이메일/비밀번호 및 구글 OAuth 로그인/회원가입/로그아웃 정상 동작
- [ ] 다크모드 토글 즉시 반영 + 새로고침 후 유지
- [ ] `archy712@gmail.com` 계정이 관리자 권한 보유
- [ ] 메뉴 관리에서 대/중/소분류 등록·수정·정렬 가능 + 대분류 단독 등록 가능
- [ ] 사용자 권한 관리에서 임의 레벨 메뉴 부여/회수 가능
- [ ] 일반 사용자는 권한 있는 메뉴만 노출 + URL 직접 접근 차단
- [ ] 관리자는 전체 메뉴(마스터 관리 + 14개 Placeholder) 접근 가능
- [ ] 기본 관리 3종을 제외한 모든 메뉴가 공용 빈 화면으로 정상 렌더링
- [ ] 전체 메뉴 트리(마스터 관리 하위 3개 그룹 + 14개 Placeholder)가 DB에 모두 등록됨
- [ ] `mcp__supabase__get_advisors`로 보안/성능 경고 최종 확인 및 해소
- [ ] `npm run check-all` 및 `npm run build` 통과

**테스트 체크리스트 (Playwright MCP) — 시나리오별 E2E**

- [ ] **시나리오 A (관리자)**: 로그인 → 메뉴 등록 → 사용자 권한 부여 → 로그아웃
- [ ] **시나리오 B (일반 사용자)**: 로그인 → 부여받은 메뉴만 노출 확인 → 진입 → 로그아웃
- [ ] **시나리오 C (권한 없는 접근)**: 일반 사용자로 관리자 URL 직접 입력 → 접근 거부 → 홈 복귀
- [ ] **시나리오 D (반응형)**: 시나리오 B를 1440 / 768 / 390px에서 각각 재현
- [ ] **시나리오 E (구글 OAuth)**: 구글 로그인 → `/erp` 진입 → 권한 없는 상태 확인 → 관리자가 권한 부여 → 재확인
- [ ] `browser_console_messages`로 전 시나리오 콘솔 에러 0건 확인

---

## 범위 제외 (Out of Scope)

아래 항목은 이번 MVP에서 **명시적으로 제외**한다. 세부 Task로 분해하지 않는다.

- **기존 Header/Footer 재설계** — `app/layout.tsx` / `app/page.tsx`의 Header·Footer는 그대로 유지
- **업무 화면 실제 로직** — 기준정보 관리(법인/브랜드/소브랜드/아이템/컬러/사이즈), 상품 관리(관리/현황/일괄수정), 경영정보~게시판 14개 대분류 하위의 실제 CRUD·조회/입력 폼·비즈니스 로직
- **사용자 프로필 상세 관리** — 아바타 업로드, 자기소개, 알림/설정
- **역할(Role) 기반 세분화 권한 체계** — 그룹/부서 단위 권한 (MVP는 admin/user 2단계 + 사용자별 메뉴 매핑만)
- **메뉴명 다국어 관리** — 메뉴명은 한국어 단일 값
- **감사 로그 / 변경 이력 추적**
- **대시보드 차트 위젯의 실 데이터 연동** — Recharts 컴포넌트 활용 자체는 범위 내이나 표시할 실제 업무 데이터는 범위 외

---

## Task 의존관계 요약

```
Task 001 (Phase 0 전제 확인)
   └─ Task 002 (라우트 골격/타입)
        ├─ Task 003 (3단 셸)
        │    ├─ Task 004 (Menubar + 임시 데이터)
        │    │    └─ Task 005 (트리 + 반응형 Drawer)
        │    └─ Task 006 (플레이스홀더 컴포넌트)
        └─ Task 007 (Phase 1 완료 검증)  ← Phase 1 종료
             │
             ├─ Task 008 (이메일 인증 완성) ─ Task 009 (구글 OAuth) ─ Task 010 (테마/i18n 확인)
             │
             └─ Task 011 (profiles 확장/관리자 시드)
                  └─ Task 012 (menus / user_menu_permissions)
                       └─ Task 013 (데이터 액세스 계층)
                            └─ Task 014 (관리자 가드 + 접근 거부 화면)
                                 ├─ Task 015 (사용자 관리)
                                 ├─ Task 016 (메뉴 관리)
                                 └─ Task 017 (사용자 권한 관리)
                                      └─ Task 018 (메뉴 접근 제어)
                                           ├─ Task 019 (기준정보/상품 메뉴 등록)
                                           └─ Task 020 (대분류 14개 등록)
                                                └─ Task 021 (임시 데이터 제거)
                                                     └─ Task 022 (MVP 통합 검증)
```

**병렬 가능 구간**

- Task 004 / Task 006 — Menubar와 플레이스홀더 컴포넌트는 독립 개발 가능
- Phase 2-A(Task 008~~010)와 Phase 2-B(Task 011~~013) — 인증 정비와 스키마 구축은 서로 독립
- Task 015 / 016 / 017 — 세 관리자 화면은 Task 013·014 완료 후 서로 독립
- Task 019 / 020 — 두 시드 작업은 서로 독립

---

## 진행 현황

| Phase                               | Task 범위    | 상태                                    |
| ----------------------------------- | ------------ | --------------------------------------- |
| Phase 0 — 전제 확인 ✅              | Task 001     | ☑ 완료                                  |
| **Phase 1 — ERP 메인 화면 뼈대** ✅ | Task 002~007 | ☑ 완료                                  |
| Phase 2-A — 인증 완성 / 공통 UI     | Task 008~010 | ☐ 진행중 (008 완료, 009~010 대기)       |
| Phase 2-B — 데이터 모델 ✅          | Task 011~013 | ☑ 완료                                  |
| Phase 2-C — 관리자 CRUD             | Task 014~017 | ☐ 진행중 (014~~015 완료, 016~~017 대기) |
| Phase 2-D — 접근 제어 / 메뉴 등록   | Task 018~021 | ☐ 대기                                  |
| Phase 2-E — 통합 검증               | Task 022     | ☐ 대기                                  |
