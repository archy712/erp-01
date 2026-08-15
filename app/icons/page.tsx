import { Suspense } from "react";
import Link from "next/link";

import { IconGallery } from "@/components/icons/icon-gallery";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function IconsGalleryPage() {
  return (
    <Suspense fallback={null}>
      <IconsGalleryContent />
    </Suspense>
  );
}

async function IconsGalleryContent() {
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
              {dict.icons.headerTitle}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher locale={locale} />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        <div className="flex w-full max-w-5xl flex-col gap-8 px-5 py-16">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">{dict.icons.heading}</h1>
            <p className="text-muted-foreground">{dict.icons.description}</p>
          </div>

          <IconGallery />
        </div>
      </main>
    </div>
  );
}
