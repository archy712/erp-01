import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function SettingsContactPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContactContent />
    </Suspense>
  );
}

async function SettingsContactContent() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  const [{ data: profile }, locale] = await Promise.all([
    claims?.claims
      ? supabase
          .from("profiles")
          .select("phone_number, bio")
          .eq("id", claims.claims.sub)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    getLocale(),
  ]);

  const dict = getDictionary(locale);

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict.erp.settings.navContact}
          </CardTitle>
          <CardDescription>
            {dict.erp.settings.contactDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="grid gap-2">
            <Label htmlFor="phone">{dict.erp.settings.contactPhoneLabel}</Label>
            <Input id="phone" disabled value={profile?.phone_number ?? ""} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="bio">{dict.erp.settings.contactBioLabel}</Label>
            <Textarea id="bio" disabled value={profile?.bio ?? ""} rows={4} />
          </div>
          <div>
            <Badge variant="secondary">{dict.erp.placeholder.badge}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
