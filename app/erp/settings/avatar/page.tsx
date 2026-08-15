import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

// 실제 아바타 이미지 에셋이 없어 이모지로 대체한 샘플 세트. 저장 로직은 아직
// 없으므로 클릭 핸들러를 달지 않고, 현재 avatar_key만 읽어와 하이라이트만 한다.
const AVATAR_OPTIONS = [
  { key: "fox", emoji: "🦊" },
  { key: "cat", emoji: "🐱" },
  { key: "bear", emoji: "🐻" },
  { key: "panda", emoji: "🐼" },
  { key: "owl", emoji: "🦉" },
  { key: "koala", emoji: "🐨" },
  { key: "rabbit", emoji: "🐰" },
  { key: "tiger", emoji: "🐯" },
];

export default function SettingsAvatarPage() {
  return (
    <Suspense fallback={null}>
      <SettingsAvatarContent />
    </Suspense>
  );
}

async function SettingsAvatarContent() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();

  const [{ data: profile }, locale] = await Promise.all([
    claims?.claims
      ? supabase
          .from("profiles")
          .select("avatar_key")
          .eq("id", claims.claims.sub)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    getLocale(),
  ]);

  const dict = getDictionary(locale);
  const currentAvatarKey = profile?.avatar_key ?? "fox";

  return (
    <div className="w-full max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {dict.erp.settings.navAvatar}
          </CardTitle>
          <CardDescription>
            {dict.erp.settings.avatarDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-4 gap-3">
            {AVATAR_OPTIONS.map((option) => (
              <Avatar
                key={option.key}
                className={cn(
                  "size-14 text-2xl",
                  option.key === currentAvatarKey &&
                    "ring-2 ring-primary ring-offset-2 ring-offset-background",
                )}
              >
                <AvatarFallback className="text-2xl">
                  {option.emoji}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <div>
            <Badge variant="secondary">{dict.erp.placeholder.badge}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
