"use client";

import { useLinkStatus } from "next/link";

import { cn } from "@/lib/utils";

// Next 16 useLinkStatus 훅으로 `<Link>` 클릭~내비게이션 완료 사이의 pending
// 상태를 표시하는 작은 점 힌트. useLinkStatus는 반드시 Link의 자손
// 컴포넌트에서 호출해야 해서(문서: use-link-status.md) 별도 Client
// Component로 분리했다 — 부모(예: ErpCategoryRail)는 이 컴포넌트를 각
// `<Link>`의 자식으로 심기만 하면 된다.
//
// 항상 렌더링되는 고정 크기 요소의 opacity/visibility만 토글해서(문서
// 권장 패턴) layout shift 없이 표시한다. 실제 페이드인 + 회전 스피너
// 애니메이션은 app/globals.css의 `.erp-link-hint`/`.is-pending` 규칙과
// `erp-link-hint-fade-in`/`erp-link-hint-spin` 키프레임에 정의되어 있다.
// 내비게이션이 실제로 느릴 때만(100ms 지연 후) 보이도록 해서, 빠른 전환에서
// 불필요하게 깜빡이지 않게 한다.
export function ErpLinkPendingIndicator({ className }: { className?: string }) {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-hidden="true"
      className={cn("erp-link-hint", pending && "is-pending", className)}
    />
  );
}
