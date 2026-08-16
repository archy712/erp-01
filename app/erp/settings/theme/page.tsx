import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function SettingsThemePage() {
  return (
    <Suspense fallback={null}>
      <SettingsThemeContent />
    </Suspense>
  );
}

async function SettingsThemeContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="w-full max-w-md md:max-w-xl lg:max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict.erp.settings.navTheme}
          </CardTitle>
          <CardDescription>
            {dict.erp.settings.themeDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>{dict.erp.settings.themeLabel}</Label>
            <ThemeSwitcher />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
