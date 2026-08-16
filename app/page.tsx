import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Boxes, Languages, Moon, Smartphone } from "lucide-react";

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
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { createClient } from "@/lib/supabase/server";
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

  let isLoggedIn = false;
  if (hasEnvVars) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    isLoggedIn = Boolean(data?.claims);
  }

  const footerLinks = [
    { label: dict.home.footer.about, href: "/about" },
    { label: dict.home.footer.techStack, href: "/tech-stack" },
    { label: dict.home.footer.componentGallery, href: "/gallery" },
    { label: dict.home.footer.iconGallery, href: "/icons" },
    { label: dict.home.footer.chartGallery, href: "/charts" },
    { label: dict.home.footer.avatarGallery, href: "/avatars" },
  ];

  const featureIcons = [Languages, Smartphone, Moon];
  const features = dict.home.features.map((feature, i) => ({
    ...feature,
    icon: featureIcons[i],
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex min-h-16 w-full items-center justify-center border-b border-b-foreground/10 py-2">
        {/* ERP 헤더(components/erp/erp-header.tsx)와 동일하게 타이틀을 항상
            정중앙에 둔다. 다만 로그아웃 상태에서는 우측(언어/테마/로그인/
            회원가입)이 좁은 화면에서 줄바꿈될 수 있어, absolute 대신
            1fr/auto/1fr 3열 grid를 쓴다 — 각 열이 독립된 공간을 차지하므로
            우측 열이 여러 줄로 늘어나도 중앙 타이틀과 겹치지 않는다. */}
        <div className="grid w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-x-4 gap-y-2 px-5">
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="shrink-0 justify-self-start"
            aria-label={dict.home.logoAriaLabel}
          >
            <Link href="/">
              <Boxes className="size-5" />
            </Link>
          </Button>
          <Link
            href="/"
            className="shrink-0 justify-self-center text-lg font-semibold tracking-tight"
          >
            ERP v0.1
          </Link>
          <div className="flex flex-wrap items-center justify-end gap-2 justify-self-end sm:gap-3">
            {!isLoggedIn && <LanguageSwitcher locale={locale} />}
            {!isLoggedIn && <ThemeSwitcher />}
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
              <Link href={isLoggedIn ? "/erp" : "/auth/login"}>
                {isLoggedIn ? dict.home.dashboardCta : dict.home.loginCta}
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
            <div className="grid gap-4 sm:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title}>
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <feature.icon className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <CardTitle className="text-base">
                        {feature.title}
                      </CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
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
