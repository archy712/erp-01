import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HOME_CATEGORY_ICONS } from "@/lib/erp/home-categories";
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

  const categories = dict.home.categories.map((category, i) => ({
    ...category,
    icon: HOME_CATEGORY_ICONS[i],
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex min-h-16 w-full flex-wrap items-center justify-center gap-y-2 border-b border-b-foreground/10 py-2">
        <div className="flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-5">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold tracking-tight"
          >
            ERP v0.1
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            <LanguageSwitcher locale={locale} />
            <ThemeSwitcher />
            {!hasEnvVars ? (
              <EnvVarWarning dict={dict} />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        <div className="flex w-full max-w-6xl flex-col gap-16 px-5 py-16">
          <section className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold lg:text-4xl">
              {dict.home.heading}
            </h1>
            <p className="text-muted-foreground">{dict.home.description}</p>
            <Button asChild size="lg">
              <Link href="/auth/login">
                {dict.home.loginCta}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </section>

          <section className="flex flex-col gap-6">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-bold">
                {dict.home.categoriesHeading}
              </h2>
              <p className="text-muted-foreground">
                {dict.home.categoriesDescription}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.title}>
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <category.icon className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <CardTitle className="text-base">
                        {category.title}
                      </CardTitle>
                      <CardDescription>{category.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
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
          {dict.home.footer.developedBy}{" "}
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
