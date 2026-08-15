import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      {dict.common.greeting.replace("{email}", user.email ?? "")}
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/protected/profile">{dict.common.profile}</Link>
      </Button>
      <LogoutButton label={dict.common.signOut} />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">{dict.common.signIn}</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">{dict.common.signUp}</Link>
      </Button>
    </div>
  );
}
