"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { TreeView } from "@/components/ui/tree-view";
import {
  buildMenuTree,
  getActiveMenuId,
  menuNodeToTreeItem,
} from "@/lib/erp/menu-tree";
import { MOCK_MENUS } from "@/lib/erp/mock-menus";

// 데스크탑/태블릿(md 이상)에서 상시 노출되는 좌측 트리.
// 선택된 대분류(`?cat=`)의 하위 노드만 보여준다. 모바일 전용 통합 트리는
// ErpMobileNav를 참고.
export function ErpMenuTree() {
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

  const categories = buildMenuTree(MOCK_MENUS);
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
      <p className="p-4 text-sm text-muted-foreground">하위 메뉴가 없습니다.</p>
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
