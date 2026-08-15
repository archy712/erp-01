import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function SettingsProfilePage() {
  return (
    <Suspense fallback={null}>
      <SettingsProfileContent />
    </Suspense>
  );
}

async function SettingsProfileContent() {
  const supabase = await createClient();
  const { data, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !data?.claims) {
    redirect("/auth/login");
  }

  const userId = data.claims.sub;

  const [{ data: profile, error: profileError }, locale] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, name")
      .eq("id", userId)
      .maybeSingle(),
    getLocale(),
  ]);

  if (profileError) {
    throw profileError;
  }

  const dict = getDictionary(locale);

  return (
    <div className="w-full max-w-md">
      <ProfileForm
        dict={dict}
        profile={
          profile ?? {
            id: userId,
            email: data.claims.email ?? null,
            name: null,
          }
        }
      />
    </div>
  );
}
