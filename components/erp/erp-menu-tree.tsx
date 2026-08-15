"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FolderTree } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { TreeView } from "@/components/ui/tree-view";
import { getActiveMenuId, menuNodeToTreeItem } from "@/lib/erp/menu-tree";
import type { MenuNode } from "@/lib/erp/types";

// 데스크탑/태블릿(md 이상)에서 상시 노출되는 좌측 트리.
// 선택된 대분류(`?cat=`)의 하위 노드만 보여준다. 모바일 전용 통합 트리는
// ErpMobileNav를 참고.
//
// `categories`는 서버(app/erp/layout.tsx)에서 `getVisibleMenuTree(userId)`로
// 조회한 실 데이터를 그대로 내려받는다(Task 018 — 1차 방어: 노출 필터링).
export function ErpMenuTree({ categories }: { categories: MenuNode[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("cat");

  if (!categoryId) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        상단에서 대분류를 선택하세요.
      </p>
    );
  }

  const category = categories.find((node) => node.id === categoryId);

  if (!category) {
    return (
      <p className="p-4 text-sm text-muted-foreground">
        존재하지 않는 대분류입니다.
      </p>
    );
  }

  if (category.children.length === 0) {
    return (
      <Empty className="flex-1 border-0 p-4">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <FolderTree />
          </EmptyMedia>
          <EmptyDescription>하위 메뉴가 없습니다.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const items = category.children.map((node) =>
    menuNodeToTreeItem(node, categoryId, (menuId, topId) =>
      router.push(`/erp/menu/${menuId}?cat=${topId}`),
    ),
  );

  return (
    <TreeView
      // pathname이 바뀔 때마다(뒤로가기·새로고침·직접 진입 포함) 펼침/선택
      // 상태를 새로 계산하도록 강제 재마운트한다 (TreeView는 마운트 시점에만
      // initialSelectedItemId를 반영하고 이후 prop 변화에 반응하지 않음).
      key={pathname}
      data={items}
      initialSelectedItemId={getActiveMenuId(pathname)}
      aria-label="메뉴 트리"
    />
  );
}
