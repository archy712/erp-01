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
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function SettingsLanguagePage() {
  return (
    <Suspense fallback={null}>
      <SettingsLanguageContent />
    </Suspense>
  );
}

async function SettingsLanguageContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict.erp.settings.navLanguage}
          </CardTitle>
          <CardDescription>
            {dict.erp.settings.languageDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>{dict.erp.settings.languageLabel}</Label>
            <LanguageSwitcher locale={locale} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
