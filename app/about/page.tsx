import { Suspense } from "react";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import {
  ArrowRight,
  BarChart3Icon,
  LanguagesIcon,
  LayoutGridIcon,
  MonitorSmartphoneIcon,
  PaletteIcon,
  RouteIcon,
  ShieldCheckIcon,
  SmileIcon,
  SunMoonIcon,
  UserCircleIcon,
  WrenchIcon,
} from "lucide-react";

const FEATURE_ICONS = [
  RouteIcon,
  ShieldCheckIcon,
  PaletteIcon,
  WrenchIcon,
  MonitorSmartphoneIcon,
  LanguagesIcon,
  SunMoonIcon,
];

const GALLERY_ICONS = [
  LayoutGridIcon,
  SmileIcon,
  UserCircleIcon,
  BarChart3Icon,
];
const GALLERY_HREFS = ["/gallery", "/icons", "/avatars", "/charts"];

export default function AboutPage() {
  return (
    <Suspense fallback={null}>
      <AboutContent />
    </Suspense>
  );
}

async function AboutContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const features = dict.about.features.map((feature, i) => ({
    ...feature,
    icon: FEATURE_ICONS[i],
  }));

  const galleries = dict.about.galleries.map((gallery, i) => ({
    ...gallery,
    icon: GALLERY_ICONS[i],
    href: GALLERY_HREFS[i],
  }));

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
              {dict.about.headerTitle}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <LanguageSwitcher locale={locale} />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center">
        <div className="flex w-full max-w-5xl flex-col gap-20 px-5 py-16">
          <section className="flex flex-col gap-8">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
              <Badge variant="outline" className="w-fit">
                {dict.about.badge}
              </Badge>
              <h1 className="text-3xl !leading-tight font-bold lg:text-4xl">
                {dict.about.heroTitle}
              </h1>
              <p className="text-muted-foreground">
                {dict.about.heroDescription}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
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

          <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">
                {dict.about.galleriesHeading}
              </h2>
              <p className="text-muted-foreground">
                {dict.about.galleriesDescription}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {galleries.map((gallery) => (
                <Card key={gallery.href} className="flex flex-col">
                  <CardHeader className="flex flex-1 flex-row items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <gallery.icon className="size-5 text-muted-foreground" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <CardTitle className="text-lg">{gallery.title}</CardTitle>
                      <CardDescription>{gallery.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardFooter>
                    <Button asChild variant="outline">
                      <Link href={gallery.href}>
                        {gallery.cta}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
