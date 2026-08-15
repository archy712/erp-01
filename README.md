<h1 align="center">Next.js Starter Kit 3</h1>

<p align="center">
  Next.js 16 + Supabase Auth로 인증까지 준비된 상태에서 바로 개발을 시작할 수 있는 스타터킷입니다.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo-pages"><strong>Demo Pages</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#scripts"><strong>Scripts</strong></a> ·
  <a href="#documentation"><strong>Documentation</strong></a>
</p>
<br/>

## Features

- **Next.js 16 App Router** — Cache Components(`"use cache"`)를 활성화한 최신 아키텍처, `middleware.ts` 대신 `proxy.ts` 사용
- **Supabase Auth** — `@supabase/ssr` 기반 쿠키 세션으로 Client/Server Component, Route Handler, `proxy.ts` 전반에서 인증 상태 공유. 이메일/비밀번호 인증과 Google OAuth 로그인 지원
- **Tailwind CSS v4 + shadcn/ui** — `new-york` 스타일 컴포넌트와 `next-themes` 기반 라이트/다크/시스템 테마 전환
- **다국어 지원** — 한국어/영어/일본어/중국어 4개 언어, 쿠키 또는 브라우저의 `Accept-Language`로 기본 언어 자동 감지
- **컴포넌트 갤러리** — shadcn/ui 공식 컴포넌트와 Date Range Picker, Kanban Board, Rich Text Editor 등 직접 구현한 확장 컴포넌트, lucide-react 아이콘 검색, Avatar·Chart 활용 예시를 각각 갤러리 페이지로 제공
- **개발 도구 자동화** — ESLint, Prettier, Husky, lint-staged, commitlint로 커밋 전 검사(포맷팅, 타입체크, 커밋 메시지 컨벤션)를 자동화

## Demo Pages

| 경로            | 설명                                           |
| --------------- | ---------------------------------------------- |
| `/`             | 홈                                             |
| `/about`        | 스타터킷 소개                                  |
| `/tech-stack`   | 기술 스택 소개                                 |
| `/gallery`      | shadcn/ui 공식 컴포넌트 + 확장 컴포넌트 갤러리 |
| `/icons`        | lucide-react 아이콘 검색 & import 구문 복사    |
| `/avatars`      | Avatar 컴포넌트 활용 예시                      |
| `/charts`       | recharts 기반 Chart 컴포넌트 활용 예시         |
| `/protected/**` | 로그인이 필요한 프로필 등 인증 영역            |

## Getting Started

1. [Supabase 대시보드](https://database.new)에서 프로젝트를 생성합니다.

2. 저장소를 클론하고 의존성을 설치합니다.

   ```bash
   git clone https://github.com/archy712/nextjs-starterkit-03.git
   cd nextjs-starterkit-03
   npm install
   ```

3. 프로젝트 루트에 `.env.local`을 만들고 아래 두 값을 채웁니다. 둘 다 [Supabase 프로젝트의 API 설정](https://supabase.com/dashboard/project/_?showConnect=true)에서 확인할 수 있습니다.

   ```env
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[INSERT SUPABASE PROJECT API PUBLISHABLE OR ANON KEY]
   ```

   > [!NOTE]
   > `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`는 Supabase의 새 **publishable** 키 형식을 가리킵니다. 전환 기간 동안에는 기존 **anon** 키도 그대로 사용할 수 있습니다. Supabase 대시보드에 `NEXT_PUBLIC_SUPABASE_ANON_KEY`로 표시되어 있다면 그 값을 사용하면 됩니다.

   두 환경변수가 없으면 `hasEnvVars`(`lib/utils.ts`)가 `false`가 되어 UI가 튜토리얼/경고 모드로 폴백합니다.

4. 개발 서버를 실행합니다.

   ```bash
   npm run dev
   ```

   [localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

5. 다른 shadcn/ui 스타일을 쓰고 싶다면 `components.json`을 삭제한 뒤 [shadcn/ui를 다시 설치](https://ui.shadcn.com/docs/installation/next)하세요.

> Supabase를 로컬에서도 실행하려면 [Local Development 문서](https://supabase.com/docs/guides/getting-started/local-development)를 참고하세요.

## Scripts

```bash
npm run dev           # 개발 서버 (HTTP 헤더 크기 제한을 32768로 늘려서 실행)
npm run build         # 프로덕션 빌드
npm run start         # 프로덕션 서버 실행
npm run lint          # ESLint 검사
npm run lint:fix      # ESLint 자동 수정
npm run typecheck     # tsc --noEmit
npm run format        # Prettier로 전체 포맷 적용
npm run format:check  # Prettier 포맷 검사만 (CI용)
npm run check-all     # typecheck + lint + format:check 순차 실행
```

## Documentation

- [`CLAUDE.md`](./CLAUDE.md) — 이 저장소의 아키텍처, 관례, Claude Code 커스텀 설정 가이드
- [`docs/guides/`](./docs/guides) — 컴포넌트 패턴, React Hook Form, Next.js 16, 프로젝트 구조, 스타일링 가이드
