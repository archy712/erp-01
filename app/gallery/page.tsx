import { Suspense } from "react";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { AiElementsSection } from "@/components/gallery/ai-elements-section";
import { ButtonsSection } from "@/components/gallery/buttons-section";
import { DataDisplaySection } from "@/components/gallery/data-display-section";
import { FeedbackSection } from "@/components/gallery/feedback-section";
import { FormsSection } from "@/components/gallery/forms-section";
import { LayoutSection } from "@/components/gallery/layout-section";
import { NavigationSection } from "@/components/gallery/navigation-section";
import { OverlaysSection } from "@/components/gallery/overlays-section";
import { RecommendedExtensionsSection } from "@/components/gallery/recommended-extensions-section";

const CATEGORIES = [
  { value: "buttons", label: "버튼 & 배지", content: <ButtonsSection /> },
  { value: "forms", label: "폼 입력", content: <FormsSection /> },
  { value: "overlays", label: "오버레이 & 메뉴", content: <OverlaysSection /> },
  { value: "navigation", label: "내비게이션", content: <NavigationSection /> },
  { value: "layout", label: "레이아웃", content: <LayoutSection /> },
  { value: "feedback", label: "피드백", content: <FeedbackSection /> },
  { value: "data", label: "데이터 표시", content: <DataDisplaySection /> },
  { value: "ai", label: "AI 채팅 요소", content: <AiElementsSection /> },
  {
    value: "recommended",
    label: "추가 확장 컴포넌트",
    content: <RecommendedExtensionsSection />,
  },
];

export default function GalleryPage() {
  return (
    <Suspense fallback={null}>
      <GalleryContent />
    </Suspense>
  );
}

async function GalleryContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 w-full items-center justify-center border-b border-b-foreground/10">
        <div className="flex w-full max-w-5xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm underline-offset-4 hover:underline"
            >
              {dict.common.backToHome}
            </Link>
            <span className="text-lg font-semibold tracking-tight">
              {dict.gallery.headerTitle}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        <div className="flex w-full max-w-5xl flex-col gap-8 px-5 py-16">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{dict.gallery.heading}</h1>
            <p className="text-muted-foreground">{dict.gallery.description}</p>
          </div>

          <Tabs defaultValue="buttons">
            <TabsList className="flex h-auto flex-wrap justify-start gap-1">
              {CATEGORIES.map((category) => (
                <TabsTrigger key={category.value} value={category.value}>
                  {category.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {CATEGORIES.map((category) => (
              <TabsContent
                key={category.value}
                value={category.value}
                className="mt-6"
              >
                {category.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
