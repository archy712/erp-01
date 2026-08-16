"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { moveMasterEntityAction } from "@/lib/erp/master/actions";
import type { MasterEntityKey } from "@/lib/erp/master/entities";

type SortOrderCellProps = {
  entity: MasterEntityKey;
  id: string;
  disableUp?: boolean;
  disableDown?: boolean;
};

// 형제(같은 부모 스코프를 공유하는) 항목 간 sort_order를 교환한다.
// lib/erp/master/actions.ts의 moveMasterEntityAction — Task 016 moveMenuAction의
// "인접 형제와 값 스왑" 방식을 마스터 엔티티 11종용으로 일반화한 것 — 을 그대로 호출한다.
export function SortOrderCell({
  entity,
  id,
  disableUp,
  disableDown,
}: SortOrderCellProps) {
  const [isPending, startTransition] = useTransition();

  function move(direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveMasterEntityAction(entity, id, direction);
      if (!result.success) {
        toast.error(result.message);
      }
    });
  }

  return (
    // 이 셀은 MasterListTable의 행 클릭(상세 패널 오픈)과 같은 영역에 렌더링되므로,
    // 버튼 클릭이 행 클릭으로 버블링되지 않게 막는다.
    <div
      className="flex items-center gap-1"
      onClick={(event) => event.stopPropagation()}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isPending || disableUp}
        onClick={() => move("up")}
        aria-label="위로 이동"
      >
        <ArrowUp className="size-3.5" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={isPending || disableDown}
        onClick={() => move("down")}
        aria-label="아래로 이동"
      >
        <ArrowDown className="size-3.5" />
      </Button>
    </div>
  );
}
