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
          size="icon"
          aria-label={dict.erp.header.orgChartTriggerAriaLabel}
        >
          {/* 헤더 타이틀이 폭과 무관하게 항상 절대좌표 중앙에 고정되는 구조라(erp-header.tsx),
              어떤 breakpoint에서 텍스트 라벨을 보여줘도 특정 폭 구간에서 다시 겹칠 수 있다
              (Task 059 검증에서 768~900px 겹침 발견 → lg:inline으로 시도했으나 1024px 근방에서
              재발 확인). 대신 같은 헤더의 "설정" 버튼(auth-menu.tsx)과 동일하게 아이콘 전용
              버튼으로 통일해 겹침 가능성 자체를 제거한다. */}
          <Network className="size-4" />
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
