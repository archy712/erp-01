import { Suspense } from "react";

import { ChangePasswordForm } from "@/components/erp/change-password-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function SettingsSecurityPage() {
  return (
    <Suspense fallback={null}>
      <SettingsSecurityContent />
    </Suspense>
  );
}

async function SettingsSecurityContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const upcoming = [
    {
      title: dict.erp.settings.sessionsTitle,
      description: dict.erp.settings.sessionsDescription,
    },
    {
      title: dict.erp.settings.mfaTitle,
      description: dict.erp.settings.mfaDescription,
    },
    {
      title: dict.erp.settings.connectionsTitle,
      description: dict.erp.settings.connectionsDescription,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl">
        <ChangePasswordForm dict={dict} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{dict.erp.placeholder.badge}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
