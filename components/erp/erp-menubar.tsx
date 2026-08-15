"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Folder, LayoutGrid, LineChart, type LucideIcon } from "lucide-react";

import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import type { MenuNode } from "@/lib/erp/types";
import { cn } from "@/lib/utils";

// 메뉴명 → 아이콘 매핑. `menus` 스키마에 아이콘 컬럼이 없으므로 코드 측에서
// 이름 기반으로 매핑하고, 매핑이 없는 신규/Placeholder 대분류는 기본 아이콘을 쓴다.
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "마스터 관리": LayoutGrid,
  경영정보: LineChart,
};
const DEFAULT_CATEGORY_ICON: LucideIcon = Folder;

// 상단 대분류 Menubar. 선택 상태는 로컬 state가 아니라 URL 쿼리(`?cat=`)를
// 단일 소스로 사용하므로, 새로고침/딥링크에도 선택이 그대로 유지된다.
// 하위 노드가 없는 대분류(예: "경영정보")는 트리를 거치지 않고 바로
// 플레이스홀더 화면(`/erp/menu/[menuId]`)으로 이동한다.
//
// `categories`는 서버(app/erp/layout.tsx)에서 `getVisibleMenuTree(userId)`로
// 조회한 실 데이터를 그대로 내려받는다(Task 018 — 1차 방어: 노출 필터링).
export function ErpMenubar({ categories }: { categories: MenuNode[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeCategoryId = searchParams.get("cat");

  return (
    <Menubar className="h-9 shrink-0 border-none bg-transparent p-0 shadow-none">
      {categories.map((category) => {
        const Icon = CATEGORY_ICONS[category.name] ?? DEFAULT_CATEGORY_ICON;
        const isLeafCategory = category.children.length === 0;
        const href = isLeafCategory
          ? `/erp/menu/${category.id}?cat=${category.id}`
          : `/erp?cat=${category.id}`;
        const isActive = activeCategoryId === category.id;

        return (
          <MenubarMenu key={category.id} value={category.id}>
            {/*
              MenubarTrigger는 원래 하위 MenubarContent를 여는 용도라, 내부
              onKeyDown이 Enter/Space에서 preventDefault()를 호출해 순수
              내비게이션 링크로만 쓰면 키보드 활성화가 막힌다. 여기서 명시적
              onKeyDown으로 라우팅을 먼저 처리해 Radix 내부 핸들러를 무력화한다
              (composeEventHandlers는 이 핸들러가 먼저 실행되고, 여기서
              preventDefault()하면 Radix의 내부 토글 핸들러는 실행되지 않는다).
            */}
            <MenubarTrigger
              asChild
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  router.push(href);
                }
              }}
            >
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-1.5 whitespace-nowrap",
                  isActive && "bg-accent text-accent-foreground",
                )}
                aria-current={isActive ? "true" : undefined}
              >
                <Icon className="size-4 text-muted-foreground" />
                {category.name}
              </Link>
            </MenubarTrigger>
          </MenubarMenu>
        );
      })}
    </Menubar>
  );
}
