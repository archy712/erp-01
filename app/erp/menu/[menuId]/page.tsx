import { notFound } from "next/navigation";
import { Suspense } from "react";

import { MenuPlaceholder } from "@/components/erp/menu-placeholder";
import { buildMenuTree, getMenuBreadcrumb } from "@/lib/erp/menu-tree";
import { MOCK_MENUS } from "@/lib/erp/mock-menus";

export default function ErpMenuPage({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ErpMenuContent params={params} />
    </Suspense>
  );
}

// 마스터 관리 > 기본 관리 하위 3종(사용자/메뉴/권한 관리)도 실제 관리자
// 화면(Task 014~017)이 생기기 전까지는 다른 메뉴와 동일하게 플레이스홀더로
// 렌더링된다.
async function ErpMenuContent({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const { menuId } = await params;

  const tree = buildMenuTree(MOCK_MENUS);
  const path = getMenuBreadcrumb(tree, menuId);

  if (!path) {
    notFound();
  }

  const current = path[path.length - 1];

  return (
    <MenuPlaceholder
      title={current.name}
      breadcrumb={path.map((node) => node.name)}
    />
  );
}
