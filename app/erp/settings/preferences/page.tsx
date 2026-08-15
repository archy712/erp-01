import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function SettingsPreferencesPage() {
  return (
    <Suspense fallback={null}>
      <SettingsPreferencesContent />
    </Suspense>
  );
}

async function SettingsPreferencesContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict.erp.settings.navPreferences}
          </CardTitle>
          <CardDescription>
            {dict.erp.settings.preferencesDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Label>{dict.erp.settings.themeLabel}</Label>
            <ThemeSwitcher />
          </div>
          <div className="flex items-center justify-between">
            <Label>{dict.erp.settings.languageLabel}</Label>
            <LanguageSwitcher locale={locale} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
