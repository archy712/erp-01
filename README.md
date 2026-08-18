<h1 align="center">ERP v0.1</h1>

<p align="center">
  Next.js 16 + Supabase Auth 기반 스타터킷(Next.js Starter Kit 3) 위에,<br />
  3단 메뉴 내비게이션 · 역할 기반 권한 · 조직도 · 마스터/상품 관리를 갖춘 사내 ERP를 구축한 저장소입니다.
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
- **ERP 업무 영역(`/erp`)** — 로그인 후 진입하는 실제 업무 화면. 상단 카테고리 레일 + 좌측 트리 + 우측 콘텐츠의 3단 내비게이션(리사이즈 가능한 트리-상세 패널 포함), 전역 커맨드 팔레트(⌘K), `user`/`admin`/`superadmin` 역할 기반 접근 제어와 사용자별 메뉴 권한 부여
- **조직도 관리** — 그룹사 → 법인 → 부문 → (부서) → 팀 → 구성원 구조의 조직도를 관리자 화면에서 CRUD하고, 헤더의 "조직도" 버튼으로 역할과 무관하게 누구나 팝업으로 조회 가능
- **마스터/상품 관리** — 법인·브랜드·상품 분류·컬러·사이즈 5종 기준정보 CRUD와, 5개 탭으로 구성된 상품 등록/수정 폼(이미지 업로드 포함) 및 정렬 가능한 컬럼 헤더·다중선택 일괄 처리를 갖춘 상품 목록
- **관리자 전용 CRUD** — 사용자 관리(활성/비활성, 역할 변경)·메뉴 관리(대/중/소분류 등록·정렬)·사용자별 메뉴 권한 부여 화면
- **경영정보 대시보드** — 매출/손익/객수 등을 카드+recharts 차트로 보여주는 `/erp` 메인 화면(더미 데이터), `loading.tsx`/`useLinkStatus` 기반 즉시 로딩 피드백으로 메뉴 이동 시 화면이 멈춘 듯 보이는 현상을 방지
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

로그인이 필요한 ERP 영역(`/erp/**`)은 별도 표로 정리했습니다.

| 경로                          | 설명                                                     | 접근 권한              |
| ----------------------------- | -------------------------------------------------------- | ---------------------- |
| `/erp`                        | ERP 메인 대시보드 (더미 데이터 기반 경영정보 차트)       | 로그인 사용자          |
| `/erp/menu/[menuId]`          | 메뉴 트리에서 선택한 화면 (권한 있는 메뉴만 노출)        | 해당 메뉴 권한 보유자  |
| `/erp/admin/users`            | 사용자 관리 (활성/비활성, 역할 변경)                     | `admin` · `superadmin` |
| `/erp/admin/menus`            | 메뉴 관리 (대/중/소분류 등록·정렬·사용여부)              | `admin` · `superadmin` |
| `/erp/admin/permissions`      | 사용자별 메뉴 권한 부여/회수                             | `admin` · `superadmin` |
| `/erp/admin/org`              | 조직도 관리 (그룹사·법인·부문·부서·팀·구성원, 리더 지정) | `admin` · `superadmin` |
| `/erp/master/companies`       | 법인 관리                                                | 메뉴 권한 보유자       |
| `/erp/master/brands`          | 브랜드 관리                                              | 메뉴 권한 보유자       |
| `/erp/master/item-categories` | 상품 분류 관리                                           | 메뉴 권한 보유자       |
| `/erp/master/colors`          | 컬러 관리                                                | 메뉴 권한 보유자       |
| `/erp/master/sizes`           | 사이즈 관리                                              | 메뉴 권한 보유자       |
| `/erp/products`               | 상품 목록 (검색/필터/정렬, 다중선택 일괄 처리)           | 메뉴 권한 보유자       |
| `/erp/products/new`, `/[id]`  | 상품 등록/수정 (5개 탭 폼, 이미지 업로드)                | 메뉴 권한 보유자       |
| `/erp/settings/**`            | 프로필·비밀번호·언어·테마 등 계정 설정                   | 로그인 사용자          |

헤더의 "조직도" 버튼(⌘K 커맨드 팔레트 옆)은 위 표와 별개로, 로그인만 하면 역할과 무관하게 누구나 조직도를 팝업으로 조회할 수 있습니다.

## Getting Started

1. [Supabase 대시보드](https://database.new)에서 프로젝트를 생성합니다.

2. 저장소를 클론하고 의존성을 설치합니다.

   ```bash
   git clone https://github.com/archy712/erp-01.git
   cd erp-01
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
- [`docs/prd/`](./docs/prd) — 기능별 PRD (`PRD_MVP.md`: ERP 뼈대·인증·메뉴/권한, `PRD_MASTER.md`: 마스터 관리/기준정보·상품 관리, `PRD_ORG.md`: 조직도 관리, `PRD_ORG_COMPANY_MERGE.md`: 법인 테이블 통합)
- [`docs/roadmap/`](./docs/roadmap) — 기능별 구현 로드맵, 전부 완료 (`ROADMAP_MVP.md`, `ROADMAP_MASTER.md`, `ROADMAP_ORG.md`, `ROADMAP_ORG_COMPANY_MERGE.md`)
