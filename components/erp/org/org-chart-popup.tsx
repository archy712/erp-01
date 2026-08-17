"use client";

import { useState } from "react";
import { Network } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getOrgChartPopupDataAction,
  type OrgChartPopupData,
} from "@/lib/erp/org/actions";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { OrgChartPopupTree } from "./org-chart-popup-tree";

// role과 무관하게 헤더에 항상 노출되는 조직도 조회 버튼(Task 054). 관리
// 화면(/erp/admin/org)이 admin 전용이라, 일반 사용자(role='user')가 조직도를
// 볼 수 있는 유일한 경로가 이 팝업이다.
//
// getOrgChartPopupDataAction()을 호출하는 유일한 지점 — 헤더는 /erp/* 모든
// 페이지에서 렌더링되므로, 팝업을 실제로 열 때만 지연 로딩해 불필요한 요청을
// 피한다. 한 번 불러온 뒤에는 재요청하지 않고 재사용한다(다이얼로그를 닫았다
// 다시 열어도 이 컴포넌트 자체는 언마운트되지 않아 state가 유지된다).
export function OrgChartPopupTrigger({ dict }: { dict: Dictionary }) {
  const [data, setData] = useState<OrgChartPopupData | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleOpenChange(open: boolean) {
    if (!open || data || loading) return;
    setLoading(true);
    try {
      const result = await getOrgChartPopupDataAction();
      setData(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={dict.erp.header.orgChartTriggerAriaLabel}
        >
          <Network className="size-4" />
          {dict.erp.header.orgChartTriggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{dict.erp.header.orgChartTriggerLabel}</DialogTitle>
        </DialogHeader>

        {loading || !data ? (
          <div className="flex flex-col gap-2 py-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-5/6" />
            <Skeleton className="h-8 w-4/6" />
            <Skeleton className="h-8 w-3/6" />
          </div>
        ) : data.tree.length === 0 ? (
          <Empty className="border-0 p-6">
            <EmptyHeader>
              <EmptyDescription>등록된 조직 정보가 없습니다.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <OrgChartPopupTree
            tree={data.tree}
            leaders={data.leaders}
            members={data.members}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
