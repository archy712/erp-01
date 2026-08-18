import { Fragment, Suspense } from "react";
import Link from "next/link";
import { ArrowRight, Languages, Moon, Smartphone } from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { LanguageSwitcher } from "@/components/language-switcher";
import { SiteFooter } from "@/components/site-footer";
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

  const featureIcons = [Languages, Smartphone, Moon];
  const features = dict.home.features.map((feature, i) => ({
    ...feature,
    icon: featureIcons[i],
  }));

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* 헤더 바 없이, 언어/테마 전환과 계정 메뉴만 우측 상단에 작게 배치한다.
          로그아웃 상태에서는 히어로 섹션의 로그인/회원가입 버튼이 그 역할을
          대신하므로 여기서는 AuthButton을 렌더링하지 않는다. */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 sm:top-6 sm:right-6">
        {!isLoggedIn && <LanguageSwitcher locale={locale} />}
        {!isLoggedIn && <ThemeSwitcher />}
        {!hasEnvVars && <EnvVarWarning dict={dict} />}
        {hasEnvVars && isLoggedIn && (
          <Suspense>
            <AuthButton />
          </Suspense>
        )}
      </div>

      <main className="flex flex-1 flex-col items-center">
        <div className="flex w-full max-w-6xl flex-col gap-24 px-5 pt-24 pb-16 sm:pt-32">
          <section className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
            <h1 className="text-4xl font-bold lg:text-5xl">
              {dict.home.heading.split("\n").map((line, i, lines) => (
                <Fragment key={line}>
                  {line}
                  {i < lines.length - 1 && <br />}
                </Fragment>
              ))}
            </h1>
            <p className="text-balance text-muted-foreground">
              {dict.home.description}
            </p>
            {isLoggedIn ? (
              <Button asChild size="lg">
                <Link href="/erp">
                  {dict.home.dashboardCta}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <Button asChild size="lg">
                    <Link href="/auth/login">{dict.common.signIn}</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link href="/auth/sign-up">{dict.common.signUp}</Link>
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {dict.home.loginNote}
                </p>
              </>
            )}
          </section>

          <section className="flex flex-col gap-10">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
              <h2 className="text-2xl font-bold">
                {dict.home.categoriesHeading}
              </h2>
              <p className="text-muted-foreground">
                {dict.home.categoriesDescription}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="p-6">
                  <CardHeader className="gap-3 p-0">
                    <feature.icon className="size-6" />
                    <CardTitle className="text-base">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter dict={dict} />
    </div>
  );
}
