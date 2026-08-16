import { Suspense } from "react";
import Link from "next/link";

import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { hasEnvVars } from "@/lib/utils";

// app/page.tsx 헤더와 동일한 계정 영역(AuthButton → 로그인 상태면 AuthMenu
// 드롭다운)을 그대로 재사용한다. app/erp/layout.tsx가 미인증 사용자를 이미
// /auth/login으로 리다이렉트하므로 여기서는 항상 로그인된 AuthMenu가 렌더링된다.
export function ErpHeader({ dict }: { dict: Dictionary }) {
  return (
    <header className="flex h-16 w-full items-center justify-center border-b border-b-foreground/10">
      <div className="flex w-full max-w-5xl items-center justify-between gap-3 px-5">
        <Link
          href="/"
          className="shrink-0 text-lg font-semibold tracking-tight"
        >
          ERP v0.1
        </Link>
        {!hasEnvVars ? (
          <EnvVarWarning dict={dict} />
        ) : (
          <Suspense>
            <AuthButton />
          </Suspense>
        )}
      </div>
    </header>
  );
}
