import { Suspense } from "react";
import Link from "next/link";

import { EnvVarWarning } from "@/components/env-var-warning";
import { ErpAccountBar } from "./erp-account-bar";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { hasEnvVars } from "@/lib/utils";

// app/page.tsx 헤더를 그대로 복제하던 규칙(Task 001)의 의도적 예외. ERP 헤더는
// app/erp/layout.tsx가 미인증 사용자를 미리 리다이렉트하는 로그인 후 컨텍스트에서만
// 렌더링되므로, 마케팅 홈과 달리 로그인 버튼이 필요 없고 테마/언어 전환도
// /erp/settings/preferences로 옮겼다. 계정 영역은 설정 아이콘 버튼 + 이메일
// 텍스트만 남긴다.
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
          <div className="min-w-0">
            <Suspense>
              <ErpAccountBar dict={dict} />
            </Suspense>
          </div>
        )}
      </div>
    </header>
  );
}
