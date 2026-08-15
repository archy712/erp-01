import { Suspense } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

export default function SettingsNotificationsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsNotificationsContent />
    </Suspense>
  );
}

function getNotificationRows(dict: Dictionary) {
  return [
    {
      id: "email",
      label: dict.erp.settings.notificationsEmailLabel,
      defaultChecked: true,
    },
    {
      id: "in-app",
      label: dict.erp.settings.notificationsInAppLabel,
      defaultChecked: true,
    },
    {
      id: "marketing",
      label: dict.erp.settings.notificationsMarketingLabel,
      defaultChecked: false,
    },
  ];
}

async function SettingsNotificationsContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const rows = getNotificationRows(dict);

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict.erp.settings.navNotifications}
          </CardTitle>
          <CardDescription>
            {dict.erp.settings.notificationsDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center justify-between">
              <Label htmlFor={row.id}>{row.label}</Label>
              <Switch
                id={row.id}
                disabled
                defaultChecked={row.defaultChecked}
              />
            </div>
          ))}
          <div>
            <Badge variant="secondary">{dict.erp.placeholder.badge}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
