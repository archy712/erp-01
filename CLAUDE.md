# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js 16 (App Router) + Supabase Auth 스타터 킷입니다. `@supabase/ssr`로 쿠키 기반 세션을 Client Component, Server Component, Route Handler, `proxy.ts` 전반에서 공유합니다. shadcn/ui 컴포넌트·아이콘·아바타·차트 갤러리(`/gallery`, `/icons`, `/avatars`, `/charts`)와 소개/기술 스택 페이지(`/about`, `/tech-stack`), 4개 언어(ko/en/ja/zh) 다국어 지원을 포함합니다.

## 명령어

```bash
npm run dev           # 개발 서버 (HTTP 헤더 크기 제한을 32768로 늘려서 실행)
npm run build         # 프로덕션 빌드
npm run start         # 프로덕션 서버 실행
npm run lint          # ESLint 검사 (eslint-config-next의 core-web-vitals + typescript)
npm run lint:fix      # ESLint 자동 수정
npm run typecheck     # tsc --noEmit (전용 테스트 스크립트는 없음)
npm run format        # Prettier로 전체 포맷 적용 (prettier-plugin-tailwindcss로 className 정렬)
npm run format:check  # Prettier 포맷 검사만 (CI용)
npm run check-all     # typecheck + lint + format:check 순차 실행
```

- 환경변수는 `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 두 개만 필요합니다. 값이 없으면 `lib/utils.ts`의 `hasEnvVars`가 `false`가 되어 UI가 튜토리얼/경고 모드로 폴백합니다(`components/env-var-warning.tsx`, `lib/supabase/proxy.ts`).

### 커밋 전 자동 검사 (husky + lint-staged + commitlint)

- git 저장소이며 `npm install` 시 `prepare` 스크립트로 husky가 훅을 활성화합니다.
- `pre-commit`: `lint-staged`가 스테이징된 파일에 `eslint --fix` → `prettier --write`를 적용하고(설정: `lint-staged.config.mjs`), `*.ts`/`*.tsx`가 포함되면 프로젝트 전체 기준 `tsc --noEmit`을 1회 실행합니다.
- `commit-msg`: `commitlint`가 `.claude/commands/git/commit.md`의 "이모지 + 컨벤셔널 커밋" 포맷(`✨ feat: ...` 등)을 검증합니다(설정: `commitlint.config.mjs`). 이모지 없이 `type: subject` 형태로만 써도 통과합니다. **타입은 반드시 commit.md의 8개 공식 타입(feat/fix/docs/style/refactor/perf/test/chore, +ci/build/revert)만 유효**하며 emoji-map의 다른 라벨(init, hotfix 등)은 타입으로 쓸 수 없습니다.
- Prettier 설정(`prettier.config.mjs`)은 이 프로젝트 코드 스타일(더블쿼트, 세미콜론, trailing comma)과 맞는 기본값을 그대로 쓰고, `prettier-plugin-tailwindcss`만 추가해 className을 Tailwind 권장 순서로 자동 정렬합니다. `eslint.config.mjs`는 배열 마지막에 `eslint-config-prettier`를 붙여 포맷 관련 규칙과 ESLint 규칙이 충돌하지 않게 합니다.

## 아키텍처

### 디렉토리 구조 — `src/` 없음

`app/`, `components/`, `lib/`는 모두 프로젝트 **루트**에 위치합니다 (`src/` 디렉토리 사용 안 함). 경로 별칭 `@/*`는 `tsconfig.json`에서 `./*`(루트)로 매핑됩니다. `docs/guides/`에 아키텍처/스타일/폼 처리에 대한 상세 가이드 5종이 있으니 관련 작업 전에 참고하세요.

### Supabase 클라이언트 3종 — 컨텍스트별로 반드시 구분해서 사용

- `lib/supabase/client.ts` — `createBrowserClient`, Client Component(`"use client"`)에서만 사용.
- `lib/supabase/server.ts` — `createServerClient` + `next/headers`의 `cookies()`, Server Component/Route Handler에서 `await createClient()`로 사용. **전역 변수에 저장하지 말고 매 요청마다 새로 생성**할 것 (Fluid compute 대응, 코드 주석에 명시됨).
- `lib/supabase/proxy.ts` — `updateSession()`, `proxy.ts`(구 middleware) 전용. 요청 쿠키를 읽고 세션을 갱신한 뒤 응답 쿠키에 다시 써야 하므로, 이 함수의 쿠키 처리 로직은 함부로 바꾸지 말 것(주석에 이유가 상세히 적혀 있음).
- 세션 확인은 `supabase.auth.getUser()`가 아니라 **`supabase.auth.getClaims()`**를 사용하는 것이 이 코드베이스의 관례입니다(더 빠름). `data?.claims`가 사용자 정보를 담고 있습니다.

### 인증 라우팅 흐름

1. 루트의 `proxy.ts`가 모든 요청(정적 파일 제외)에서 `updateSession()`을 호출합니다.
2. `updateSession()`(`lib/supabase/proxy.ts`)은 `/`, `/login*`, `/auth/*`와 로그인 없이 열람 가능한 공개 페이지(`/gallery`, `/icons`, `/avatars`, `/charts`, `/about`, `/tech-stack`)를 제외한 경로에서 세션이 없으면 `/auth/login`으로 리다이렉트합니다. 새 공개 페이지를 추가하면 이 allow-list에도 등록해야 합니다.
3. `app/auth/*`에 로그인/회원가입/비밀번호 재설정/이메일 확인(`confirm/route.ts`) 페이지가 있고, `app/protected/*`가 인증이 필요한 영역입니다. 개별 서버 컴포넌트(`app/protected/page.tsx` 등)도 `getClaims()`로 재확인 후 `redirect("/auth/login")` 하는 이중 방어 패턴을 씁니다.
4. 로그인/회원가입 폼(`components/*-form.tsx`)은 Server Action이 아니라 **Client Component에서 `supabase.auth.*`를 직접 호출**하는 패턴입니다(`login-form.tsx`, `profile-form.tsx` 참고).

### DB 타입

`lib/supabase/database.types.ts`는 Supabase에서 생성된 타입입니다(`mcp__supabase__generate_typescript_types`로 재생성). 컴포넌트에서는 `Tables<"테이블명">` 헬퍼로 필요한 컬럼만 `Pick`해서 씁니다(`components/profile-form.tsx` 참고). 스키마를 변경했다면 이 파일을 재생성해야 합니다.

### Next.js 16 관련 특이사항

- `middleware.ts`가 아니라 **`proxy.ts`**를 사용합니다(Next 16에서 이름이 바뀜, `export function proxy`).
- `next.config.ts`에 `cacheComponents: true`가 설정되어 있어 Cache Components(`"use cache"` 지시어 기반 캐싱) 모델이 활성화되어 있습니다. 데이터 페칭 코드를 작성할 때 이 캐싱 모델을 염두에 두세요.
- `cookies()`, `headers()`, `params`, `searchParams` 등 request-time API는 전부 비동기이며 동기 접근은 지원되지 않습니다. 또한 `cacheComponents: true`(Partial Prerendering)에서는 이런 API를 쓰는 컴포넌트를 **반드시 `<Suspense>`로 감싸야** 합니다. 감싸지 않으면 dev 오버레이가 `blocking-route` 계열 에러를 띄웁니다. 이 저장소는 페이지를 얇은 `export default function Page()`(내부는 `<Suspense fallback={null}><XxxContent /></Suspense>`)와, 실제 로직을 담은 `async function XxxContent()`로 나누는 패턴을 씁니다(`app/page.tsx`, `app/about/page.tsx`, `app/gallery/page.tsx` 등 참고). `getLocale()` 호출(아래 다국어 지원 참고)과 `AuthButton`이 대표적인 예입니다.

### 다국어 지원 (i18n)

라우팅 기반 i18n 라이브러리(next-intl 등) 없이 `lib/i18n/`에 쿠키 + `Accept-Language` 기반으로 직접 구현했습니다(`/[locale]/...` 세그먼트 없이 기존 라우트 구조를 그대로 유지).

- `lib/i18n/get-locale.ts`의 `getLocale()`이 쿠키(`locale`)를 우선 확인하고, 없으면 `Accept-Language` 헤더로 브라우저/시스템 기본 언어를 판별합니다(지원 언어 `ko`/`en`/`ja`/`zh`, 기본값 `ko`). `cookies()`/`headers()`를 쓰므로 반드시 Suspense 경계 안에서 호출해야 합니다.
- `lib/i18n/dictionaries/{ko,en,ja,zh}.ts`가 번역 문자열을 담고 `getDictionary(locale)`로 조회합니다. 새 문자열을 추가하면 `lib/i18n/dictionaries/types.ts`의 `Dictionary` 타입과 4개 언어 파일을 모두 갱신해야 합니다.
- 언어 변경은 `lib/i18n/actions.ts`의 Server Action `setLocaleCookie()`가 쿠키를 갱신하고, `components/language-switcher.tsx`(Client Component)가 이를 호출한 뒤 `router.refresh()`로 서버 컴포넌트를 다시 렌더링합니다.
- 현재 `/`, `/about`, `/gallery`, `/icons`, `/avatars`, `/charts`, `/tech-stack`의 헤더와 핵심 문구만 번역되어 있고, 각 갤러리 내부의 세부 데모 콘텐츠는 한국어로 남아 있습니다.

### 갤러리 페이지

`/gallery`(shadcn/ui 공식+확장 컴포넌트), `/icons`(lucide-react 전체 아이콘 검색), `/avatars`, `/charts`(recharts 기반)는 모두 로그인 없이 접근 가능한 데모 페이지입니다. `/about`(스타터킷 소개), `/tech-stack`(기술 스택 소개)도 같은 패턴의 마케팅성 페이지입니다.

- 아이콘 갤러리는 `components/icons/icon-categories.ts`의 `categorizeIconName()`으로 ~1,700개 아이콘을 화살표/사용자/파일 등 카테고리로 분류합니다. lucide-react가 런타임 카테고리 메타데이터를 제공하지 않아 자체 구현한 것으로, PascalCase 아이콘 이름을 단어 단위로 쪼갠 뒤 정확히 일치하는 키워드만 매칭합니다(부분 문자열 매칭이 아님 — 예: `Search`가 `ear`를 포함한다고 오분류되는 걸 방지).
- 아이콘·아바타·차트 갤러리는 상단에 카테고리별 칩 내비게이션(앵커 스크롤)을 공통 UI 패턴으로 씁니다. `components/gallery/section.tsx`의 `GallerySection`은 선택적 `id` prop을 받아 `scroll-mt-20`과 함께 앵커 대상이 될 수 있습니다.

### 스타일링

- Tailwind CSS v4 + shadcn/ui(`new-york` 스타일, `components.json` 참고)이지만, 색상 테마는 v4의 `@theme`/oklch 방식이 아니라 **`tailwind.config.ts` + `@config` 지시어(`app/globals.css`)로 v3 방식 HSL CSS 변수**(`--background`, `--primary` 등)를 계속 사용하는 하이브리드 구성입니다. 새 색상 토큰을 추가할 때는 `app/globals.css`의 `:root`/`.dark`와 `tailwind.config.ts`의 `theme.extend.colors`를 함께 수정해야 합니다.
- 다크모드는 `next-themes`의 `ThemeProvider`를 `app/layout.tsx`에서 직접 사용합니다(별도 provider 래퍼 컴포넌트 없음).
- 클래스 조합은 `lib/utils.ts`의 `cn()`(clsx + tailwind-merge)을 사용합니다.

### 컴포넌트 조직

`src/` 없이 `components/` 루트에 페이지별 컴포넌트를 평평하게 배치합니다. `components/ui/`는 대부분 shadcn/ui가 생성한 프리미티브(추가는 `npx shadcn@latest add`)이지만, `date-range-picker.tsx`·`file-dropzone.tsx`·`kanban-board.tsx`·`rich-text-editor.tsx`처럼 shadcn 공식 레지스트리에 없어 직접 구현해 같은 위치에 둔 확장 컴포넌트도 섞여 있습니다. `components/tutorial/`은 스타터킷 온보딩 전용, `components/gallery/`·`components/icons/`·`components/avatars/`·`components/charts/`는 각 갤러리 페이지 전용 컴포넌트입니다. 파일명은 전부 kebab-case, 컴포넌트명은 PascalCase입니다.

## Claude Code 커스텀 설정

- `.claude/agents/`에 이 저장소 전용 서브에이전트가 정의되어 있습니다: `dev/nextjs-supabase-developer`(Next.js+Supabase 기능 구현), `dev/ui-markup-specialist`(정적 마크업/스타일링), `dev/nextjs-app-developer`(라우팅/레이아웃 구조), `dev/code-reviewer`, `dev/development-planner`(ROADMAP.md), `docs/prd-generator`, `docs/prd-validator` 등.
- `.claude/commands/git/`에 `commit`, `pr`, `merge`, `branch`, `update-roadmap` 슬래시 커맨드가 정의되어 있습니다.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
