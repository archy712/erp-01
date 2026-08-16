import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { Boxes } from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { EnvVarWarning } from "@/components/env-var-warning";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { hasEnvVars } from "@/lib/utils";

// app/page.tsx 헤더와 동일한 계정 영역(AuthButton → 로그인 상태면 AuthMenu
// 드롭다운)을 그대로 재사용한다. app/erp/layout.tsx가 미인증 사용자를 이미
// /auth/login으로 리다이렉트하므로 여기서는 항상 로그인된 AuthMenu가 렌더링된다.
//
// 타이틀은 좌/우 영역 폭과 무관하게 항상 헤더 정중앙에 오도록 absolute로
// 배치한다(좌측 햄버거 유무, 우측 계정 영역 폭이 로그인 상태에 따라 달라지므로
// flex justify-between로는 중앙 정렬이 보장되지 않음).
export function ErpHeader({
  dict,
  mobileNav,
}: {
  dict: Dictionary;
  /** 모바일(md 미만)에서 좌측에 노출되는 햄버거 트리거 + Sheet */
  mobileNav?: ReactNode;
}) {
  return (
    <header className="flex h-16 w-full items-center justify-center border-b border-b-foreground/10">
      <div className="relative flex h-full w-full max-w-5xl items-center px-5">
        <div className="flex flex-1 items-center">
          <div className="md:hidden">{mobileNav}</div>
          {/* md 이상에서는 햄버거 대신 로고 아이콘을 노출한다 —
              다른 메뉴 아이콘과 동일한 lucide-react 톤을 유지한다. */}
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="hidden shrink-0 md:flex"
            aria-label={dict.erp.header.logoAriaLabel}
          >
            <Link href="/erp">
              <Boxes className="size-5" />
            </Link>
          </Button>
        </div>
        <Link
          href="/"
          className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center text-lg font-semibold tracking-tight"
        >
          ERP v0.1
        </Link>
        <div className="flex flex-1 items-center justify-end">
          {!hasEnvVars ? (
            <EnvVarWarning dict={dict} />
          ) : (
            <Suspense>
              <AuthButton />
            </Suspense>
          )}
        </div>
      </div>
    </header>
  );
}
