"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TreeView } from "@/components/ui/tree-view";
import {
  buildMenuTree,
  getActiveMenuId,
  menuNodeToTreeItem,
} from "@/lib/erp/menu-tree";
import { MOCK_MENUS } from "@/lib/erp/mock-menus";

// 모바일(md 미만) 전용 내비게이션. 상단 Menubar 대신 햄버거 버튼으로 여는
// Sheet 안에 대분류~소분류 전체 트리를 하나로 통합해서 보여준다.
// 소분류(리프) 선택 시에는 Sheet가 자동으로 닫히고, 하위가 있는 대분류/중분류를
// 펼치는 동작은 Sheet를 닫지 않는다(탐색을 이어갈 수 있어야 하므로).
export function ErpMobileNav() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const categories = buildMenuTree(MOCK_MENUS);
  const items = categories.map((node) =>
    menuNodeToTreeItem(node, node.id, (menuId, topId) => {
      router.push(`/erp/menu/${menuId}?cat=${topId}`);
      setOpen(false);
    }),
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="메뉴 열기">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 sm:max-w-72">
        <SheetHeader className="border-b">
          <SheetTitle>ERP 메뉴</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          <TreeView
            key={pathname}
            data={items}
            initialSelectedItemId={getActiveMenuId(pathname)}
            aria-label="전체 메뉴 트리"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
