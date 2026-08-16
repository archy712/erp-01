"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getMenuIcon } from "@/lib/erp/menu-icons";
import type { MenuNode } from "@/lib/erp/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { cn } from "@/lib/utils";

// 좌측 대분류 아이콘 레일. 기존 상단 Menubar(components/erp/erp-menubar.tsx,
// 삭제됨)를 대체한다 — 대분류 선택과 중/소분류 트리가 서로 다른 영역(상단 바
// vs 좌측 트리)에 떨어져 있던 것을, 같은 세로축 안에서 레일→인접 트리 패널로
// 이어지도록 재배치했다. 선택 상태는 로컬 state가 아니라 URL 쿼리(`?cat=`)를
// 단일 소스로 사용하므로, 새로고침/딥링크에도 선택이 그대로 유지된다. 하위
// 노드가 없는 대분류는 트리를 거치지 않고 바로 플레이스홀더 화면
// (`/erp/menu/[menuId]`)으로 이동한다.
//
// `categories`는 서버(app/erp/layout.tsx)에서 `getVisibleMenuTree(userId)`로
// 조회한 실 데이터를 그대로 내려받는다(Task 018 — 1차 방어: 노출 필터링).
export function ErpCategoryRail({
  categories,
  dict,
}: {
  categories: MenuNode[];
  dict: Dictionary;
}) {
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("cat");

  return (
    <nav
      aria-label={dict.erp.rail.ariaLabel}
      className="flex flex-col items-center gap-1 overflow-y-auto p-2"
    >
      {categories.map((category) => {
        const Icon = getMenuIcon(category.name, category.children.length > 0);
        const isLeafCategory = category.children.length === 0;
        const href = isLeafCategory
          ? `/erp/menu/${category.id}?cat=${category.id}`
          : `/erp?cat=${category.id}`;
        const isActive = activeCategoryId === category.id;

        return (
          <Tooltip key={category.id}>
            <TooltipTrigger asChild>
              <Link
                href={href}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground",
                )}
              >
                <Icon className="size-5" />
                <span className="sr-only">{category.name}</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              {category.name}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </nav>
  );
}
