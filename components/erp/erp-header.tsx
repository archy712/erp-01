import { Suspense } from "react";
import Link from "next/link";

import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { hasEnvVars } from "@/lib/utils";

// `app/page.tsx` Header 마크업을 그대로 복제한 것 (Task 001 결정).
// 디자인을 변경하지 않는다 — 원본을 수정해야 하면 여기가 아니라 app/page.tsx를 고친다.
export function ErpHeader({
  locale,
  dict,
}: {
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <header className="flex h-16 w-full items-center justify-center border-b border-b-foreground/10">
      <div className="flex w-full max-w-5xl items-center justify-between px-5">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          ERP v0.1
        </Link>
        <div className="flex items-center gap-3">
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
  );
}
