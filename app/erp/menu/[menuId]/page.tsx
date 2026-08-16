import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

import { AccessDenied } from "@/components/erp/access-denied";
import { MenuPlaceholder } from "@/components/erp/menu-placeholder";
import { canAccessMenu, getCurrentErpUser } from "@/lib/erp/auth";
import { getAdminRouteForMenuPath } from "@/lib/erp/menu-routes";
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

// 마스터 관리 > 기본 관리 하위 3종(사용자/메뉴/권한 관리)은 이름 경로가
// lib/erp/menu-routes.ts에 매칭되면 공용 플레이스홀더 대신 실제 관리자
// 화면(Task 015~017)으로 리다이렉트된다. 나머지 메뉴는 그대로 플레이스홀더로
// 렌더링된다.
//
// Task 018 2차 방어: Menubar/트리(1차 방어, app/erp/layout.tsx)가 권한 없는
// 메뉴를 노출하지 않더라도, URL 직접 입력으로 우회할 수 있으므로 여기서
// getCurrentErpUser() + canAccessMenu()로 반드시 재검증한다. 순서는
// "존재 여부 → 접근 권한 → 관리자 화면 매핑" — 존재하지 않는 menuId는
// 권한 유무와 무관하게 notFound()가 우선이고(엣지 케이스 구분), 접근 권한이
// 없으면 관리자 라우트 매핑보다 먼저 AccessDenied로 막는다(관리자 화면
// 3종도 canAccessMenu를 통과해야만 도달 가능 — 관리자는 canAccessMenu가
// 항상 true를 반환하므로 실질적인 제약은 없다).
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

  const adminRoute = getAdminRouteForMenuPath(path.map((node) => node.name));
  if (adminRoute) {
    // `cat`/`menu` 쿼리를 붙이지 않으면 좌측 레일/트리가 활성 상태를 잃는다.
    // ErpCategoryRail은 `?cat=`(대분류, path[0])을, ErpMenuTree/ErpMobileNav는
    // `?menu=`(소분류, getActiveMenuId의 fallback — 관리자 라우트는
    // `/erp/menu/[menuId]` 형태가 아니라 pathname만으로는 menuId를 알 수 없음)를
    // 단일 소스로 사용한다.
    redirect(`${adminRoute}?cat=${path[0].id}&menu=${menuId}`);
  }

  const current = path[path.length - 1];

  return (
    <MenuPlaceholder
      title={current.name}
      breadcrumb={path.map((node) => node.name)}
      dict={dict}
    />
  );
}
