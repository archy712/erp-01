import { Suspense } from "react";
import Link from "next/link";

import { AvatarGallery } from "@/components/avatars/avatar-gallery";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function AvatarsGalleryPage() {
  return (
    <Suspense fallback={null}>
      <AvatarsGalleryContent />
    </Suspense>
  );
}

async function AvatarsGalleryContent() {
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
              {dict.avatars.headerTitle}
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
            <h1 className="text-3xl font-bold">{dict.avatars.heading}</h1>
            <p className="text-muted-foreground">{dict.avatars.description}</p>
          </div>

          <AvatarGallery />
        </div>
      </main>
    </div>
  );
}
