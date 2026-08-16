import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { AccessDenied } from "@/components/erp/access-denied";
import { MenuPlaceholder } from "@/components/erp/menu-placeholder";
import { canAccessMenu, getCurrentErpUser } from "@/lib/erp/auth";
import { getRouteForMenuPath } from "@/lib/erp/menu-routes";
import { getMenuBreadcrumb } from "@/lib/erp/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

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

// 마스터 관리 > 기본 관리 하위 3종(사용자/메뉴/권한 관리, Task 015~017)과
// 마스터 관리 > 기준정보 관리 하위 5종 + 상품 관리(Task 031~)는 이름 경로가
// lib/erp/menu-routes.ts에 매칭되면 공용 플레이스홀더 대신 실제 화면으로
// 리다이렉트된다. 나머지 메뉴는 그대로 플레이스홀더로 렌더링된다.
//
// Task 018 2차 방어: Menubar/트리(1차 방어, app/erp/layout.tsx)가 권한 없는
// 메뉴를 노출하지 않더라도, URL 직접 입력으로 우회할 수 있으므로 여기서
// getCurrentErpUser() + canAccessMenu()로 반드시 재검증한다. 순서는
// "존재 여부 → 접근 권한 → 라우트 매핑" — 존재하지 않는 menuId는 권한
// 유무와 무관하게 notFound()가 우선이고(엣지 케이스 구분), 접근 권한이
// 없으면 라우트 매핑보다 먼저 AccessDenied로 막는다. 기준정보 5종은 여기를
// 통과해도 매핑된 라우트(app/erp/master/*)에 도달한 뒤 requireAdmin() 하드
// 게이트를 다시 거친다(Task 031) — user_menu_permissions로 canAccessMenu를
// 통과했더라도 admin/superadmin이 아니면 그 안에서 다시 막힌다.
async function ErpMenuContent({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const { menuId } = await params;

  const path = await getMenuBreadcrumb(menuId);

  if (!path) {
    notFound();
  }

  // getCurrentErpUser()는 react cache()로 감싸져 있어, 같은 요청 안에서
  // app/erp/layout.tsx가 이미 호출한 결과를 그대로 재사용한다(중복 조회 없음).
  const user = await getCurrentErpUser();
  const dict = getDictionary(await getLocale());

  if (!(await canAccessMenu(user.id, menuId))) {
    return <AccessDenied dict={dict} />;
  }

  const mappedRoute = getRouteForMenuPath(path.map((node) => node.name));
  if (mappedRoute) {
    // `cat`/`menu` 쿼리를 붙이지 않으면 좌측 레일/트리가 활성 상태를 잃는다.
    // ErpCategoryRail은 `?cat=`(대분류, path[0])을, ErpMenuTree/ErpMobileNav는
    // `?menu=`(소분류, getActiveMenuId의 fallback — 매핑된 라우트는
    // `/erp/menu/[menuId]` 형태가 아니라 pathname만으로는 menuId를 알 수 없음)를
    // 단일 소스로 사용한다.
    redirect(`${mappedRoute}?cat=${path[0].id}&menu=${menuId}`);
  }

  const current = path[path.length - 1];

  return (
    <MenuPlaceholder
      title={current.name}
      breadcrumb={path.slice(0, -1).map((node) => node.name)}
      dict={dict}
    />
  );
}
