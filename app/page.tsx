import { Suspense } from "react";
import Link from "next/link";

import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { hasEnvVars } from "@/lib/utils";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const footerLinks = [
    { label: dict.home.footer.about, href: "/about" },
    { label: dict.home.footer.techStack, href: "/tech-stack" },
    { label: dict.home.footer.componentGallery, href: "/gallery" },
    { label: dict.home.footer.iconGallery, href: "/icons" },
    { label: dict.home.footer.chartGallery, href: "/charts" },
    { label: dict.home.footer.avatarGallery, href: "/avatars" },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 w-full items-center justify-center border-b border-b-foreground/10">
        <div className="flex w-full max-w-5xl items-center justify-between px-5">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            next.js starter-kit v3
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher locale={locale} />
            <ThemeSwitcher />
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center">
        <div className="flex w-full max-w-5xl flex-col items-center px-5 py-16 text-center">
          <h1 className="text-3xl font-bold lg:text-4xl">
            {dict.home.heading}
          </h1>
        </div>
      </main>

      <footer className="flex w-full flex-col items-center gap-4 border-t py-8 text-center text-sm text-muted-foreground">
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p>
          Developed by{" "}
          <a
            href="mailto:archy712@gmail.com"
            className="font-medium underline-offset-4 hover:underline"
          >
            archy712@gmail.com
          </a>
        </p>
      </footer>
    </div>
  );
}
