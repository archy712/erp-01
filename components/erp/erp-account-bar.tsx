import Link from "next/link";
import { Settings } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

// app/erp/layout.tsx의 getCurrentErpUser()가 미인증 사용자를 이미 /auth/login으로
// 리다이렉트한 뒤에만 렌더링되므로, 로그인 여부 분기 없이 이메일이 항상 있다고 가정한다.
export async function ErpAccountBar({ dict }: { dict: Dictionary }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <Button
        asChild
        size="icon"
        variant="ghost"
        className="shrink-0"
        aria-label={dict.common.settings}
      >
        <Link href="/erp/settings">
          <Settings className="size-4" />
        </Link>
      </Button>
      <span className="min-w-0 truncate text-sm text-muted-foreground">
        {data?.claims?.email}
      </span>
    </div>
  );
}
