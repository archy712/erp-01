import { Suspense } from "react";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

const TECH_STACK = [
  {
    category: "프레임워크 & 언어",
    items: [
      {
        name: "Next.js 16",
        description:
          'App Router와 Cache Components("use cache") 기반의 최신 아키텍처',
      },
      {
        name: "React 19",
        description: "최신 React 기능을 기반으로 한 UI 구성",
      },
      { name: "TypeScript", description: "프로젝트 전반의 정적 타입 안전성" },
    ],
  },
  {
    category: "백엔드 & 인증",
    items: [
      {
        name: "Supabase Auth",
        description:
          "@supabase/ssr 기반 쿠키 세션 인증, 이메일/비밀번호 + Google OAuth 지원",
      },
      {
        name: "Zod + React Hook Form",
        description: "타입 안전한 스키마 검증과 폼 상태 관리",
      },
    ],
  },
  {
    category: "스타일링 & UI",
    items: [
      {
        name: "Tailwind CSS v4",
        description: "유틸리티 퍼스트 CSS 프레임워크",
      },
      {
        name: "shadcn/ui",
        description: "new-york 스타일의 Radix UI 기반 컴포넌트 모음",
      },
      { name: "next-themes", description: "라이트 · 다크 · 시스템 테마 전환" },
      { name: "lucide-react", description: "1,700개 이상의 아이콘 세트" },
      {
        name: "recharts",
        description: "막대 · 선 · 영역 · 파이 · 레이더 등 차트 시각화",
      },
      { name: "dnd-kit", description: "드래그 앤 드롭 기반 Kanban Board" },
      { name: "Tiptap", description: "리치 텍스트 에디터" },
      {
        name: "TanStack Table",
        description: "정렬 · 페이지네이션을 지원하는 데이터 테이블",
      },
    ],
  },
  {
    category: "개발 도구",
    items: [
      {
        name: "ESLint + Prettier",
        description: "코드 품질 검사와 포맷팅 자동화",
      },
      {
        name: "Husky + lint-staged",
        description: "커밋 전 자동 검사(pre-commit)",
      },
      {
        name: "commitlint",
        description: "이모지 + 컨벤셔널 커밋 메시지 규칙 검증",
      },
    ],
  },
];

// 아직 프로젝트에 도입되지 않았지만 향후 준비할 예정인 기술 스택입니다.
const PLANNED_TECH_STACK = {
  category: "배포 & CI/CD",
  description:
    "아직 이 스타터킷에 포함되어 있지 않지만, 앞으로 도입할 예정입니다.",
  items: [
    {
      name: "GitHub Actions",
      description: "PR 검증 · 테스트 · 배포 파이프라인을 자동화하는 CI/CD",
    },
    {
      name: "Vercel",
      description: "Next.js 프로덕션 배포와 프리뷰 환경 호스팅",
    },
  ],
};

export default function TechStackPage() {
  return (
    <Suspense fallback={null}>
      <TechStackContent />
    </Suspense>
  );
}

async function TechStackContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex min-h-16 w-full flex-wrap items-center justify-center gap-y-2 border-b border-b-foreground/10 py-2">
        <div className="flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <Link
              href="/"
              className="shrink-0 text-sm underline-offset-4 hover:underline"
            >
              {dict.common.backToHome}
            </Link>
            <span className="truncate text-lg font-semibold tracking-tight">
              {dict.techStack.headerTitle}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher locale={locale} />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        <div className="flex w-full max-w-5xl flex-col gap-12 px-5 py-16">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{dict.techStack.heading}</h1>
            <p className="text-muted-foreground">
              {dict.techStack.description}
            </p>
          </div>

          {TECH_STACK.map((group) => (
            <section key={group.category} className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold">{group.category}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <Card key={item.name}>
                    <CardHeader>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </section>
          ))}

          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                {PLANNED_TECH_STACK.category}
              </h2>
              <Badge variant="outline">예정</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {PLANNED_TECH_STACK.description}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PLANNED_TECH_STACK.items.map((item) => (
                <Card
                  key={item.name}
                  className="border-dashed text-muted-foreground"
                >
                  <CardHeader>
                    <CardTitle className="text-base font-medium">
                      {item.name}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
