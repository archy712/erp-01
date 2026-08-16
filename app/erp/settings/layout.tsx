import { Suspense } from "react";

import { SettingsBreadcrumb } from "@/components/erp/settings-breadcrumb";
import { SettingsNav } from "@/components/erp/settings-nav";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <SettingsLayoutContent>{children}</SettingsLayoutContent>
    </Suspense>
  );
}

async function SettingsLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const items = [
    { href: "/erp/settings/profile", label: dict.erp.settings.navProfile },
    {
      href: "/erp/settings/preferences",
      label: dict.erp.settings.navPreferences,
    },
    { href: "/erp/settings/security", label: dict.erp.settings.navSecurity },
    {
      href: "/erp/settings/notifications",
      label: dict.erp.settings.navNotifications,
    },
    { href: "/erp/settings/language", label: dict.erp.settings.navLanguage },
    { href: "/erp/settings/theme", label: dict.erp.settings.navTheme },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <Suspense fallback={null}>
        <SettingsBreadcrumb
          items={items}
          rootLabel={dict.erp.settings.rootLabel}
        />
      </Suspense>
      <div className="flex flex-1 flex-col gap-6 p-6 sm:flex-row">
        <SettingsNav items={items} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
