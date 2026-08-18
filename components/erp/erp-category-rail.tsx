"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { ErpLinkPendingIndicator } from "@/components/erp/erp-link-pending-indicator";
import { resolveMenuIcon } from "@/lib/erp/menu-icons";
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
// 아이콘 아래 라벨을 항상 표시한다(이전에는 hover 툴팁으로만 이름을 알 수
// 있어 처음 쓰는 사용자가 아이콘만 보고 대분류를 구분하기 어려웠다). 동시에
// components/erp/settings-nav.tsx와 동일한 hover/active 색상 규칙(hover:bg-accent,
// 활성 시 bg-accent + font-medium)을 써서 ERP 안의 좌측 내비게이션들이 서로
// 다른 시각 언어를 쓰지 않도록 맞췄다.
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
        const Icon = resolveMenuIcon(
          category.icon,
          category.name,
          category.children.length > 0,
        );
        const isLeafCategory = category.children.length === 0;
        const href = isLeafCategory
          ? `/erp/menu/${category.id}?cat=${category.id}`
          : `/erp?cat=${category.id}`;
        const isActive = activeCategoryId === category.id;

        return (
          <Link
            key={category.id}
            href={href}
            aria-current={isActive ? "true" : undefined}
            className={cn(
              "relative flex w-full shrink-0 flex-col items-center gap-0.5 rounded-md px-1 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive && "bg-accent font-medium text-accent-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" />
            <span className="line-clamp-2 text-center text-[10px] leading-tight break-keep">
              {category.name}
            </span>
            {/* 클릭~내비게이션 완료 사이 pending 힌트. absolute라 아이콘/라벨
                레이아웃에 영향을 주지 않는다(레일이 flex-col items-center라
                인라인으로 넣으면 라벨 중앙 정렬이 흔들릴 수 있어 코너에 배치). */}
            <ErpLinkPendingIndicator className="absolute top-1.5 right-2" />
          </Link>
        );
      })}
    </nav>
  );
}
