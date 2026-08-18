"use client";

import { usePathname } from "next/navigation";

import { FooterCopyright, FooterLinkNav } from "@/components/site-footer";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { cn } from "@/lib/utils";

// 이전에는 app/page.tsx의 마케팅 푸터(갤러리 링크 6개 + 이메일)를 그대로
// 복제해 모든 업무 화면 하단에 항상 노출했다. 로그인 후 업무 중인 화면에서는
// 컴포넌트/아이콘/차트 갤러리 링크가 작업과 무관하고, h-screen 셸 구조상
// 이 영역이 항상 고정 높이를 차지해 데이터 테이블·폼이 많은 ERP 화면의 실제
// 작업 가능 높이를 매번 줄였다. 그래서 저작권/버전 정도만 담은 한 줄짜리
// 유틸리티 바로 축소했다 — 대시보드 메인 화면(/erp)에서만 예외적으로 홈
// 화면과 같은 링크 모음을 이 바 안에 함께 보여준다(마케팅 푸터 원본은
// app/page.tsx의 SiteFooter에 그대로 남아 있다).
export function ErpFooter({ dict }: { dict: Dictionary }) {
  const pathname = usePathname();
  const isDashboardHome = pathname === "/erp";

  return (
    <footer
      className={cn(
        "flex w-full shrink-0 flex-col items-center justify-center gap-2 border-t px-4 text-xs text-muted-foreground",
        isDashboardHome ? "py-3" : "h-10",
      )}
    >
      {isDashboardHome && <FooterLinkNav dict={dict} />}
      <FooterCopyright dict={dict} />
    </footer>
  );
}
