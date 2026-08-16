import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { AuthMenu } from "./auth-menu";

export async function AuthButton() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const supabase = await createClient();

  // You can also use getUser() which will be slower.
  const { data } = await supabase.auth.getClaims();

  const claims = data?.claims;

  if (!claims) {
    return (
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

  // 로그인 시각(last_sign_in_at)은 JWT 클레임에 없어 getUser()로 별도 조회한다.
  const [{ data: userData }, { data: profile }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("profiles").select("name").eq("id", claims.sub).maybeSingle(),
  ]);

  return (
    <AuthMenu
      email={claims.email ?? ""}
      name={profile?.name ?? claims.email ?? ""}
      loginAt={userData.user?.last_sign_in_at ?? null}
      locale={locale}
      dict={dict}
    />
  );
}
