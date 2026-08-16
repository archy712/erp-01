import { redirect } from "next/navigation";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import { getDepartments } from "@/lib/erp/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { DEFAULT_AVATAR_KEY } from "@/lib/erp/avatar-options";

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

  const [{ data: profile, error: profileError }, departments, locale] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, email, name, department_id, phone_number, avatar_key, bio")
        .eq("id", userId)
        .maybeSingle(),
      getDepartments(),
      getLocale(),
    ]);

  if (profileError) {
    throw profileError;
  }

  const dict = getDictionary(locale);

  return (
    <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl">
      <ProfileForm
        dict={dict}
        departments={departments}
        profile={
          profile ?? {
            id: userId,
            email: data.claims.email ?? null,
            name: null,
            department_id: null,
            phone_number: null,
            avatar_key: DEFAULT_AVATAR_KEY,
            bio: null,
          }
        }
      />
    </div>
  );
}
