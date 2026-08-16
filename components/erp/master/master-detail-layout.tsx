"use client";

import { PanelLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type MasterDetailLayoutProps = {
  /** 좌측 트리 영역 제목 + 모바일 드로어 트리거 버튼 라벨. */
  treeTitle: string;
  /** components/erp/master/master-tree-panel.tsx의 MasterTreePanel을 그대로 넣는다. */
  tree: ReactNode;
  content: ReactNode;
  /** lg 미만에서 트리를 담는 Sheet의 열림 상태 — 화면(호출부)이 소유해, 트리 onSelect에서 직접 닫을 수 있게 한다. */
  mobileTreeOpen: boolean;
  onMobileTreeOpenChange: (open: boolean) => void;
  className?: string;
};

// PRD_MASTER.md 6.3절 와이어프레임의 좌우 2분할 셸. ERP 셸(app/erp/layout.tsx)의
// 좌측 메뉴 트리와는 별개의 2차 트리이므로, 데스크탑에서 3분할(ERP 트리 + 마스터
// 트리 + 목록)이 되어도 좁아지지 않도록 마스터 트리는 w-56로 고정하고 각 영역이
// 독립 스크롤(overflow-y-auto)되게 한다.
//
// lg 미만에서는 좌측 트리를 상시 표시하지 않고 Sheet(드로어)로 접어, 우측 목록이
// 가로 스크롤되지 않게 한다. 열림 상태는 이 컴포넌트가 아니라 호출부가 소유한다
// — 트리에서 노드를 선택하면 곧바로 드로어를 닫는 것까지가 자연스러운 흐름인데,
// 이 컴포넌트는 tree를 이미 렌더링된 ReactNode로만 받아 클릭을 가로챌 수 없기
// 때문이다(선택 로직은 MasterTreePanel을 조합하는 화면이 갖고 있다).
export function MasterDetailLayout({
  treeTitle,
  tree,
  content,
  mobileTreeOpen,
  onMobileTreeOpenChange,
  className,
}: MasterDetailLayoutProps) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col lg:flex-row", className)}>
      <div className="flex items-center gap-2 border-b p-3 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onMobileTreeOpenChange(true)}
        >
          <PanelLeft />
          {treeTitle}
        </Button>
      </div>

      <aside className="hidden w-56 shrink-0 flex-col overflow-y-auto border-r lg:flex">
        <div className="shrink-0 border-b px-3 py-2 text-sm font-medium">
          {treeTitle}
        </div>
        <div className="flex-1 overflow-y-auto p-2">{tree}</div>
      </aside>

      <Sheet open={mobileTreeOpen} onOpenChange={onMobileTreeOpenChange}>
        <SheetContent side="left" className="w-72 gap-0 p-0 sm:max-w-xs">
          <SheetHeader className="border-b">
            <SheetTitle>{treeTitle}</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-2">{tree}</div>
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1 overflow-y-auto">{content}</div>
    </div>
  );
}
