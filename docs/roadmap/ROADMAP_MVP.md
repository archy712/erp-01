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

| 항목 | 결정 | 근거 |
|---|---|---|
| ERP 라우트 루트 | `app/erp/*` (신규). 기존 `app/protected/*`는 손대지 않음 | 스타터킷 튜토리얼 영역과 ERP 영역을 분리 |
| ERP 셸 배치 | `app/erp/layout.tsx`에서 Header → Menubar → (트리 + 콘텐츠) → Footer 순으로 구성 | Phase 0 제약(Header/Footer 마크업 유지)을 지키면서 그 사이에만 신규 요소 삽입 |
| 메뉴 화면 URL | `app/erp/menu/[menuId]/page.tsx` (menuId = `menus.id`) | PRD의 `menus` 스키마에 `path`/`slug` 컬럼이 없음. 별도 경로 컬럼을 추가하지 않고 id 기반 라우팅으로 해결 |
| Phase 1 임시 데이터 | `lib/erp/mock-menus.ts`의 하드코딩 트리 | `menus` 테이블 없이 Phase 1 완주 가능해야 한다는 PRD 2.2 요구 충족 |
| 권한 재검증 | 개별 서버 컴포넌트에서 `getClaims()` + 권한 조회 이중 방어 (`app/protected/page.tsx` 패턴) | PRD 11절. `proxy.ts`의 쿠키 처리 로직은 변경 금지 |
| Suspense 경계 | `cacheComponents: true` 환경이므로 `cookies()`/`headers()`/`params` 사용 컴포넌트는 반드시 `<Suspense>` 래핑 | `app/page.tsx`의 얇은 `Page` + `async XxxContent` 패턴을 그대로 따름 |
| shadcn 컴포넌트 | `components/ui/`에 `menubar` `sheet` `tree-view` `collapsible` `table` `dialog` `form` `switch` `badge` `data-table` 모두 **이미 존재** | 신규 `npx shadcn add` 불필요. 기존 프리미티브 재사용 |
| 메뉴명 언어 | 한국어 단일 값 (i18n 미적용) | PRD 9절 비범위 |
| Header/Footer 재사용 방식 | `app/page.tsx`의 Header/Footer 마크업을 **그대로 복제**해 `components/erp/erp-header.tsx` / `components/erp/erp-footer.tsx`로 추출 (디자인 변경 없음) | Task 001 확인 결과, Header/Footer는 `app/layout.tsx`가 아니라 각 페이지(`app/page.tsx`, `app/protected/layout.tsx`)에 개별 인라인되어 있어 공용 컴포넌트가 없음. ERP 레이아웃(`app/erp/layout.tsx`)에서 재사용하려면 추출이 필요 |

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

### Task 004: 상단 Menubar(대분류) 및 임시 메뉴 데이터 구현 (F009)

**목표**: 대분류를 상단 Menubar로 렌더링하고, 선택된 대분류가 좌측 트리로 전달되는 상태 흐름을 완성한다.

**관련 파일**
- `components/erp/erp-menubar.tsx` (신규)
- `lib/erp/mock-menus.ts` (신규, 하드코딩 트리)
- `components/ui/menubar.tsx` (기존 재사용)

**구현 체크리스트**
- [ ] `lib/erp/mock-menus.ts`에 `MenuFlat[]` 형태의 임시 데이터를 작성한다. **최소 세트**: 대분류 "마스터 관리" → 중분류 "기본 관리" → 소분류 "사용자 관리 / 메뉴 관리 / 사용자 권한 관리". 여기에 **대분류 단독 노드**(예: "경영정보") 1개를 반드시 포함해 리프 취급 케이스를 함께 검증한다.
- [ ] `components/ui/menubar.tsx`(shadcn Menubar)로 대분류 목록을 렌더링한다.
- [ ] 대분류 선택 상태를 URL 쿼리(`?cat=<menuId>`)로 관리한다 — 새로고침/딥링크 시에도 선택 상태가 유지되어야 하므로 로컬 state가 아닌 URL을 단일 소스로 둔다.
- [ ] 선택된 대분류에 시각적 활성 표시(active state)를 적용한다.
- [ ] 대분류가 화면 폭을 넘칠 때(14개 Placeholder 추가 시) 가로 스크롤 또는 오버플로우 처리를 적용한다.
- [ ] `lucide-react` 아이콘을 대분류에 매핑할 수 있는 선택적 구조를 마련한다 (`menus` 스키마에 아이콘 컬럼이 없으므로 **코드 측 이름 기반 매핑**으로 처리).

**수락 기준**
- 대분류 클릭 시 URL이 갱신되고 좌측 트리가 해당 대분류의 하위 노드로 교체된다.
- 하위가 없는 대분류(예: "경영정보") 클릭 시에도 에러 없이 플레이스홀더 화면으로 이동한다.

---

### Task 005: 좌측 트리메뉴 및 반응형 Drawer 전환 구현 (F009 · F004)

**목표**: 중/소분류를 접이식 트리로 렌더링하고, 모바일에서 Sheet(Drawer)로 전환되는 반응형을 완성한다.

**관련 파일**
- `components/erp/erp-menu-tree.tsx` (신규)
- `components/erp/erp-mobile-nav.tsx` (신규)
- `components/ui/tree-view.tsx`, `components/ui/collapsible.tsx`, `components/ui/sheet.tsx` (기존 재사용)
- `hooks/` (필요 시 `use-media-query` 추가)

**구현 체크리스트**
- [ ] `components/ui/tree-view.tsx` 또는 `collapsible.tsx` 조합으로 중분류(확장/축소) + 소분류(리프) 트리를 렌더링한다.
- [ ] 리프 노드 클릭 시 `/erp/menu/[menuId]`로 이동시키고, 현재 활성 노드를 하이라이트한다.
- [ ] **중분류 자체가 리프인 경우**(하위 소분류 없음)에도 클릭 가능한 링크로 동작하게 한다.
- [ ] 현재 URL의 `menuId` 기준으로 상위 중분류가 **자동 확장**되도록 초기 확장 상태를 계산한다.
- [ ] 반응형 브레이크포인트 정의:
  - [ ] 데스크탑(`lg` 이상) — 좌측 트리 상시 노출
  - [ ] 태블릿(`md`~`lg`) — 트리 폭 축소 또는 토글 가능
  - [ ] 모바일(`md` 미만) — 트리 숨김 + 햄버거 토글 버튼 → `Sheet`(좌측 슬라이드) 로 표시
- [ ] 모바일 Sheet 내에서 메뉴 선택 시 Sheet가 자동으로 닫히도록 처리한다.
- [ ] 모바일에서는 상단 Menubar도 접히거나 Sheet 내부로 통합되도록 처리한다 (대분류 14개+ 대응).
- [ ] 키보드 내비게이션(Tab/Enter/방향키)과 `aria-expanded` / `aria-current` 접근성 속성을 적용한다.

**수락 기준**
- 데스크탑/태블릿/모바일 3개 뷰포트에서 레이아웃이 깨지지 않는다.
- 모바일에서 햄버거 → Sheet 열림 → 메뉴 선택 → Sheet 닫힘 + 콘텐츠 갱신이 동작한다.
- 새로고침 후에도 현재 메뉴가 트리에서 활성 상태로 표시된다.

**테스트 체크리스트 (Playwright MCP)**
- [ ] `browser_resize`로 1440px / 768px / 390px 3개 뷰포트를 순회하며 `browser_take_screenshot`으로 레이아웃 확인
- [ ] 390px에서 햄버거 클릭 → Sheet 노출 → 소분류 클릭 → Sheet 닫힘 + 우측 제목 변경 확인
- [ ] 1440px에서 대분류 전환 시 좌측 트리 내용이 교체되는지 확인
- [ ] `browser_console_messages`로 하이드레이션 경고/에러 0건 확인

---

### Task 006: 메뉴 플레이스홀더 공용 컴포넌트 구현 (F010)

**목표**: 모든 업무 메뉴가 공통으로 사용할 "제목만 표시되는 빈 화면" 컴포넌트를 완성한다.

**관련 파일**
- `components/erp/menu-placeholder.tsx` (신규)
- `app/erp/menu/[menuId]/page.tsx`
- `app/erp/page.tsx`
- `components/ui/badge.tsx`, `components/ui/empty.tsx` (기존 재사용)

**구현 체크리스트**
- [ ] `MenuPlaceholder` 컴포넌트를 구현한다 — props: `{ title: string; breadcrumb?: string[] }`.
- [ ] 화면 제목(h1) + "추후 구현 예정" `Badge` + 간단한 안내 문구를 표시한다.
- [ ] `app/erp/menu/[menuId]/page.tsx`에서 `params`를 **await**해 `menuId`를 읽고(Next 16 비동기 params), 메뉴 이름을 조회해 `MenuPlaceholder`에 전달한다. 조회 실패 시 `notFound()` 처리.
- [ ] 페이지를 얇은 `Page` + `async MenuContent` + `<Suspense>` 패턴으로 작성한다 (`params` 사용 → Suspense 필수).
- [ ] `app/erp/page.tsx`(ERP 홈)에 간단한 환영 화면을 구성한다. Recharts 위젯을 배치할 경우 **더미 데이터임을 명시**한다 (실데이터 연동은 범위 제외).
- [ ] `app/erp/not-found.tsx` / `app/erp/error.tsx`를 추가해 잘못된 `menuId` 접근 시 ERP 셸을 유지한 채 안내가 표시되게 한다.

**수락 기준**
- 임시 트리의 모든 리프 노드 클릭 시 해당 메뉴 이름이 제목으로 표시된다.
- 존재하지 않는 `menuId` 직접 입력 시 ERP 셸 안에서 not-found 화면이 표시된다.

---

### Task 007: Phase 1 완료 검증

**목표**: PRD 12절 "Phase 1 완료 기준" 4개 항목을 실제로 통과시킨다.

**구현 체크리스트**
- [ ] 기존 Header/Footer가 디자인 변경 없이 유지되었는지 `git diff`로 확인한다 (`app/page.tsx`, `app/layout.tsx`, `components/auth-button.tsx` 등 무변경).
- [ ] 미인증 상태로 `/erp` 접근 시 `/auth/login`으로 리다이렉트되는지 확인한다.
- [ ] 로그인 → `/erp` 진입 → Menubar/트리/콘텐츠 3영역 렌더링을 확인한다.
- [ ] `npm run check-all` 통과.

**테스트 체크리스트 (Playwright MCP)**
- [ ] 미인증 `/erp` 접근 → `/auth/login` 리다이렉트 확인
- [ ] 이메일/비밀번호 로그인 → `/erp` 랜딩 확인
- [ ] 대분류 → 중분류 확장 → 소분류 클릭 → 우측 제목 표시 전체 플로우 1회 완주
- [ ] `ThemeSwitcher`로 다크/라이트 전환 시 ERP 셸의 대비/가독성 확인 (스크린샷 2종)
- [ ] 로그아웃 → 로그인 페이지 복귀 확인

---

## Phase 2: 나머지 MVP 기능 순차 구현

> PRD 2.3. Phase 1의 레이아웃 뼈대 완성 이후 착수한다.
> 실행 순서: **인증 완성 → 데이터 모델 → 관리자 CRUD → 접근 제어 → 메뉴 데이터 등록 → 통합 검증**

### Phase 2-A: 인증 완성 및 공통 UI 통합 확인

#### Task 008: 이메일/비밀번호 인증 흐름 세부 완성 (F001)

**목표**: 스타터킷의 인증 흐름을 ERP 문맥에 맞게 마무리한다 (기본 흐름은 이미 존재하므로 **신규 구현이 아닌 정비 작업**).

**관련 파일**
- `components/login-form.tsx`, `components/sign-up-form.tsx`
- `components/forgot-password-form.tsx`, `components/update-password-form.tsx`
- `app/auth/confirm/route.ts`, `app/auth/callback/route.ts`, `app/auth/error/page.tsx`

**구현 체크리스트**
- [ ] 로그인 성공 후 리다이렉트 대상을 `/protected` → `/erp`로 변경한다 (`login-form.tsx`, `app/auth/callback/route.ts`의 `next` 기본값, `app/auth/confirm/route.ts`).
- [ ] 회원가입 → 이메일 인증 → 로그인 복귀 전체 흐름을 실제 계정으로 1회 완주 검증한다.
- [ ] 비밀번호 재설정(`forgot-password` → 메일 → `update-password`) 흐름을 검증한다.
- [ ] 인증 에러 메시지를 한국어로 정리한다 (잘못된 자격증명 / 미인증 이메일 / 만료된 링크).
- [ ] Supabase Auth의 Site URL / Redirect URL 설정에 로컬·배포 도메인이 모두 등록되어 있는지 확인한다.
- [ ] 인증 호출은 기존 관례대로 **Server Action이 아닌 Client Component에서 `supabase.auth.*` 직접 호출** 패턴을 유지한다.

**수락 기준**
- 회원가입 / 로그인 / 로그아웃 / 비밀번호 재설정 4개 흐름이 모두 정상 동작한다.
- 로그인 성공 시 `/erp`로 진입한다.

**테스트 체크리스트 (Playwright MCP)**
- [ ] 신규 이메일 회원가입 → `sign-up-success` 안내 화면 노출 확인
- [ ] 잘못된 비밀번호 입력 시 한국어 에러 메시지 노출 확인
- [ ] 정상 로그인 → `/erp` 진입 확인
- [ ] 비밀번호 재설정 링크 만료/무효 시 `app/auth/error` 화면 노출 확인

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

### Phase 2-B: 데이터 모델 구축

#### Task 011: profiles 테이블 확장 및 초기 관리자 시드

**목표**: 역할/활성 여부 컬럼을 추가하고 `archy712@gmail.com`을 관리자로 지정한다.

**관련 파일**
- Supabase 마이그레이션 (`mcp__supabase__apply_migration`)
- `lib/supabase/database.types.ts` (재생성 필요)

**구현 체크리스트**
- [ ] `mcp__supabase__list_tables`로 `profiles` 현재 스키마를 확인한다.
- [ ] 마이그레이션 작성:
  - [ ] `role text not null default 'user'` + `check (role in ('admin','user'))`
  - [ ] `is_active boolean not null default true`
- [ ] `auth.users` 신규 가입 시 `profiles` 행이 자동 생성되는지 확인하고, 없다면 `handle_new_user()` 트리거를 추가한다 (구글 OAuth 가입자 포함).
- [ ] 시드 마이그레이션으로 `archy712@gmail.com` 계정에 `role = 'admin'`을 부여한다. **해당 계정이 아직 없을 수도 있으므로**, 트리거 내에서 특정 이메일이면 admin을 부여하는 방식 또는 멱등한 `update ... where email = ...` 방식 중 하나로 안전하게 처리한다.
- [ ] `profiles` RLS 정책 정비:
  - [ ] 본인 행 select/update 허용
  - [ ] 관리자는 전체 행 select/update 허용 (재귀 방지를 위해 `security definer` 헬퍼 함수 `is_admin()` 사용 권장)
- [ ] `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts`를 재생성한다.
- [ ] `mcp__supabase__get_advisors`로 보안/성능 경고를 확인하고 해소한다.

**수락 기준**
- `archy712@gmail.com` 계정의 `role`이 `admin`이다.
- 일반 사용자 세션에서 타인의 `profiles` 행이 조회되지 않는다.
- `npm run typecheck` 통과 (재생성된 타입 기준).

**테스트 체크리스트 (Playwright MCP)**
- [ ] 관리자 계정 로그인 후 세션에서 role이 admin으로 조회되는지 확인 (임시 디버그 페이지 또는 `mcp__supabase__execute_sql` 병행)
- [ ] 신규 회원가입 계정이 `role='user'`, `is_active=true`로 생성되는지 확인
- [ ] `is_active=false` 계정이 로그인 시 차단되는지 확인 (차단 지점: 로그인 후 서버 컴포넌트 가드)

---

#### Task 012: menus / user_menu_permissions 테이블 생성

**목표**: 메뉴 트리와 사용자별 메뉴 권한을 저장할 스키마를 구축한다.

**관련 파일**
- Supabase 마이그레이션
- `lib/supabase/database.types.ts` (재생성 필요)

**구현 체크리스트**
- [ ] `menus` 테이블 생성:
  - [ ] `id uuid pk default gen_random_uuid()`
  - [ ] `parent_id uuid references menus(id) on delete cascade` (nullable, 대분류는 null)
  - [ ] `level integer not null check (level between 1 and 3)`
  - [ ] `name text not null`
  - [ ] `sort_order integer not null default 0`
  - [ ] `is_active boolean not null default true`
  - [ ] `created_at` / `updated_at` timestamptz
  - [ ] 인덱스: `(parent_id, sort_order)`
  - [ ] 정합성 제약: `level = 1`이면 `parent_id is null`, `level > 1`이면 `parent_id is not null` (check 또는 트리거)
- [ ] `user_menu_permissions` 테이블 생성:
  - [ ] `id uuid pk`, `user_id uuid references profiles(id) on delete cascade`
  - [ ] `menu_id uuid references menus(id) on delete cascade`
  - [ ] `granted_by uuid references profiles(id)`, `granted_at timestamptz default now()`
  - [ ] `unique (user_id, menu_id)` — 중복 부여 방지
  - [ ] 인덱스: `(user_id)`
- [ ] RLS 정책:
  - [ ] `menus` — 인증 사용자 select 허용, insert/update/delete는 관리자만
  - [ ] `user_menu_permissions` — 본인 행 select 허용, 그 외 모든 작업은 관리자만
- [ ] `mcp__supabase__generate_typescript_types`로 타입 재생성.
- [ ] `mcp__supabase__get_advisors` 확인.

**수락 기준**
- 대분류만 단독 등록(`level=1`, `parent_id=null`)이 성공한다 — 하위 노드 없이도 유효해야 한다.
- 일반 사용자 세션에서 `menus` insert 시도가 RLS로 차단된다.

**테스트 체크리스트**
- [ ] `mcp__supabase__execute_sql`로 대분류 단독 insert 성공 확인
- [ ] `level=2`인데 `parent_id=null`인 insert가 제약 위반으로 실패하는지 확인
- [ ] 동일 `(user_id, menu_id)` 중복 insert가 unique 제약으로 실패하는지 확인
- [ ] 상위 메뉴 삭제 시 하위 메뉴와 관련 권한이 cascade 삭제되는지 확인

---

#### Task 013: 메뉴/권한 데이터 액세스 계층 구현

**목표**: 이후 모든 화면이 공유할 서버 측 조회/권한 판정 함수를 한 곳에 모은다.

**관련 파일**
- `lib/erp/queries.ts` (신규 — 조회)
- `lib/erp/auth.ts` (신규 — 권한 판정)
- `lib/erp/actions.ts` (신규 — Server Actions)
- `lib/supabase/server.ts` (기존 재사용)

**구현 체크리스트**
- [ ] `lib/erp/auth.ts`:
  - [ ] `getCurrentErpUser()` — `getClaims()`로 사용자 확인 후 `profiles`에서 `role`/`is_active` 조회. 미인증이면 `redirect("/auth/login")`.
  - [ ] `requireAdmin()` — admin이 아니면 접근 거부 처리.
  - [ ] `canAccessMenu(userId, menuId)` — `role='admin'`이면 무조건 `true`, 아니면 `user_menu_permissions` 조회.
- [ ] `lib/erp/queries.ts`:
  - [ ] `getAllMenus()` — 전체 메뉴 평면 조회 (`is_active` 필터 옵션 포함)
  - [ ] `getVisibleMenuTree(userId)` — 권한 있는 메뉴 + **그 조상 노드를 경로 노출용으로 자동 포함**해 트리 반환 (PRD 4.2)
  - [ ] `getMenuById(menuId)`, `getMenuBreadcrumb(menuId)`
  - [ ] `getUsers()`, `getUserPermissions(userId)`
- [ ] `lib/erp/actions.ts`에 Server Action 골격 작성 (Task 014~016에서 채움). 각 액션은 **첫 줄에서 `requireAdmin()`을 호출**하는 규약을 지킨다.
- [ ] 조회 함수는 매 요청마다 `await createClient()`로 클라이언트를 새로 생성한다 (전역 변수 금지 — Fluid compute).
- [ ] `cacheComponents: true` 환경이므로 이들 함수를 호출하는 컴포넌트는 반드시 Suspense 경계 안에 두도록 주석으로 명시한다.
- [ ] Task 004의 `lib/erp/mock-menus.ts`를 개발/폴백용으로만 남기고, 실 조회로 교체할 지점을 TODO로 표시한다.

**수락 기준**
- `getVisibleMenuTree()`가 관리자에게는 전체 트리를, 일반 사용자에게는 권한 있는 리프 + 그 조상만 반환한다.
- 권한이 소분류에만 있어도 상위 중/대분류가 경로 노출용으로 함께 반환된다.

**테스트 체크리스트**
- [ ] 관리자 / 권한 있는 일반 사용자 / 권한 없는 일반 사용자 3개 계정으로 `getVisibleMenuTree()` 결과 비교
- [ ] 소분류 1개만 부여된 사용자에게 상위 노드 2개가 함께 반환되는지 확인
- [ ] `is_active=false` 메뉴가 트리에서 제외되는지 확인 (관리자 제외 여부 정책 확정 후 검증)

---

### Phase 2-C: 관리자 전용 CRUD 화면

#### Task 014: 관리자 영역 가드 및 접근 거부 화면 구현

**목표**: 관리자 전용 화면의 진입 가드와, 권한 없는 접근 시 표시될 공용 안내 화면을 먼저 만든다 (Task 015~017의 공통 선행 작업).

**관련 파일**
- `app/erp/admin/layout.tsx` (신규)
- `components/erp/access-denied.tsx` (신규)
- `app/erp/forbidden/page.tsx` (신규)
- `lib/erp/auth.ts`

**구현 체크리스트**
- [ ] `app/erp/admin/layout.tsx`에서 `requireAdmin()`을 호출해 관리자가 아니면 접근 거부 화면으로 보낸다.
- [ ] `AccessDenied` 컴포넌트 구현 — 안내 메시지 + "홈으로 돌아가기"(`/erp`) 버튼. ERP 셸 안에서 렌더링되어야 한다.
- [ ] 관리자 3개 화면의 라우트를 확정한다: `/erp/admin/users`, `/erp/admin/menus`, `/erp/admin/permissions`.
- [ ] 메뉴 트리의 "마스터 관리 > 기본 관리" 하위 3개 소분류를 **플레이스홀더가 아닌 위 실제 라우트로 연결**하는 매핑 규칙을 정한다 (예: `lib/erp/menu-routes.ts`에 메뉴명/고정 UUID → 경로 매핑 테이블).
- [ ] 레이아웃은 얇은 `Layout` + `<Suspense>` + `async` 가드 컴포넌트 패턴으로 작성한다.

**수락 기준**
- 일반 사용자가 `/erp/admin/users`에 직접 접근하면 접근 거부 화면이 표시된다.
- 관리자는 3개 관리자 경로에 모두 진입할 수 있다.

**테스트 체크리스트 (Playwright MCP)**
- [ ] 일반 사용자로 `/erp/admin/users` 직접 진입 → 접근 거부 화면 + 홈 버튼 동작 확인
- [ ] 관리자로 동일 경로 진입 → 정상 화면 확인
- [ ] 미인증 상태로 진입 → `/auth/login` 리다이렉트 확인

---

#### Task 015: 사용자 관리 화면 구현 (F005)

**목표**: 관리자가 전체 사용자를 조회하고 활성 상태·관리자 권한을 변경할 수 있게 한다.

**관련 파일**
- `app/erp/admin/users/page.tsx` (신규)
- `components/erp/admin/user-table.tsx` (신규)
- `lib/erp/actions.ts`
- `components/ui/{table,data-table,switch,badge,avatar,alert-dialog}.tsx` (기존 재사용)

**구현 체크리스트**
- [ ] 사용자 목록 테이블 구현 — 컬럼: 아바타 / 이메일 / 이름 / 역할(`Badge`) / 활성 여부(`Switch`) / 가입일.
- [ ] 이메일·이름 검색 필터와 페이지네이션을 적용한다 (`components/ui/pagination.tsx`).
- [ ] 활성/비활성 토글 Server Action — `Switch` 변경 시 `profiles.is_active` 갱신.
- [ ] 관리자 권한 부여/회수 Server Action — `profiles.role` 갱신.
- [ ] **자기 자신의 관리자 권한 회수 방지** 및 **마지막 관리자 강등 방지** 가드를 넣는다 (시스템 잠김 방지).
- [ ] 권한 변경 등 파괴적 동작은 `AlertDialog`로 확인 절차를 둔다.
- [ ] 성공/실패 피드백은 기존 `components/ui/sonner.tsx`(Toaster)로 표시한다.
- [ ] 변경 후 `revalidatePath()`로 목록을 갱신한다.

**수락 기준**
- 관리자가 다른 사용자를 admin으로 승격/강등할 수 있다.
- 비활성 처리된 사용자는 ERP 진입이 차단된다.
- 마지막 관리자를 강등하려 하면 차단 메시지가 표시된다.

**테스트 체크리스트 (Playwright MCP)**
- [ ] 목록 로딩 및 검색 필터 동작 확인
- [ ] 활성 토글 off → 새로고침 후 상태 유지 확인
- [ ] 해당 사용자로 로그인 시 차단되는지 확인
- [ ] 자기 자신 강등 시도 → 차단 메시지 확인
- [ ] 일반 사용자 세션에서 동일 Server Action 직접 호출 시 거부되는지 확인 (엣지 케이스)

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
- Phase 2-A(Task 008~010)와 Phase 2-B(Task 011~013) — 인증 정비와 스키마 구축은 서로 독립
- Task 015 / 016 / 017 — 세 관리자 화면은 Task 013·014 완료 후 서로 독립
- Task 019 / 020 — 두 시드 작업은 서로 독립

---

## 진행 현황

| Phase | Task 범위 | 상태 |
|---|---|---|
| Phase 0 — 전제 확인 ✅ | Task 001 | ☑ 완료 |
| **Phase 1 — ERP 메인 화면 뼈대** | Task 002~007 | ▶ 진행 중 (Task 002 완료, **최우선**) |
| Phase 2-A — 인증 완성 / 공통 UI | Task 008~010 | ☐ 대기 |
| Phase 2-B — 데이터 모델 | Task 011~013 | ☐ 대기 |
| Phase 2-C — 관리자 CRUD | Task 014~017 | ☐ 대기 |
| Phase 2-D — 접근 제어 / 메뉴 등록 | Task 018~021 | ☐ 대기 |
| Phase 2-E — 통합 검증 | Task 022 | ☐ 대기 |
