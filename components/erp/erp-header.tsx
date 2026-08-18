import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { Home } from "lucide-react";

import { AuthButton } from "@/components/auth-button";
import { Button } from "@/components/ui/button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { ErpCommandPalette } from "@/components/erp/erp-command-palette";
import { OrgChartPopupTrigger } from "@/components/erp/org/org-chart-popup";
import type { MenuNode } from "@/lib/erp/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { hasEnvVars } from "@/lib/utils";

// app/page.tsx 헤더와 동일한 계정 영역(AuthButton → 로그인 상태면 AuthMenu
// 드롭다운)을 그대로 재사용한다. app/erp/layout.tsx가 미인증 사용자를 이미
// /auth/login으로 리다이렉트하므로 여기서는 항상 로그인된 AuthMenu가 렌더링된다.
//
// 마케팅 홈(app/page.tsx)과 달리 ERP 셸은 레일/트리/본문이 풀블리드(w-full)로
// 배치되므로, 헤더도 max-w-5xl로 오므라들지 않고 풀와이드로 맞춘다(그렇지 않으면
// 헤더만 가운데로 좁아지고 바로 아래 레일은 화면 맨 왼쪽에 붙는 어긋난 레이아웃이
// 된다). 좌우 패딩은 본문 페이지들이 공통으로 쓰는 px-6과 맞춘다.
//
// 타이틀 텍스트는 /erp로 이동한다 — 이전에는 별도 로고 아이콘이 타이틀 옆에
// 있었지만 목적지가 완전히 같아 중복이었고, 좌측은 이제 공개 웹사이트 메인(/)
// 으로 가는 홈 아이콘 하나만 남긴다.
//
// 타이틀은 좌/우 영역 폭과 무관하게 항상 헤더 정중앙에 오도록 absolute로
// 배치한다(좌측 햄버거 유무, 우측 계정 영역 폭이 로그인 상태에 따라 달라지므로
// flex justify-between로는 중앙 정렬이 보장되지 않음).
export function ErpHeader({
  dict,
  mobileNav,
  categories,
}: {
  dict: Dictionary;
  /** 모바일(md 미만)에서 좌측에 노출되는 햄버거 트리거 + Sheet */
  mobileNav?: ReactNode;
  /** 커맨드 팔레트(⌘K) 검색 대상. 비어 있으면(메뉴 조회 실패 등) 팔레트를 숨긴다. */
  categories: MenuNode[];
}) {
  return (
    <header className="flex h-16 w-full shrink-0 items-center border-b border-b-foreground/10 px-4 md:px-6">
      <div className="relative flex h-full w-full items-center">
        <div className="flex flex-1 items-center gap-1">
          {/* 업무 중 공개 웹사이트 메인(/)으로 돌아갈 방법이 없었다 —
              헤더 맨 왼쪽에 홈 아이콘을 둔다. */}
          <Button
            asChild
            size="icon"
            variant="ghost"
            className="shrink-0"
            aria-label={dict.erp.header.homeAriaLabel}
          >
            <Link href="/">
              <Home className="size-5" />
            </Link>
          </Button>
          <div className="md:hidden">{mobileNav}</div>
        </div>
        <Link
          href="/erp"
          className="absolute inset-y-0 left-1/2 flex -translate-x-1/2 items-center text-lg font-semibold tracking-tight"
        >
          ERP v0.1
        </Link>
        <div className="flex flex-1 items-center justify-end gap-2">
          {/* hasEnvVars가 false면 Supabase 연동 자체가 없는 튜토리얼 모드이므로
              조직도/메뉴 데이터를 불러올 수 없다 — EnvVarWarning과 같은 조건으로 숨긴다. */}
          {hasEnvVars ? (
            <ErpCommandPalette categories={categories} dict={dict} />
          ) : null}
          {hasEnvVars ? <OrgChartPopupTrigger dict={dict} /> : null}
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
