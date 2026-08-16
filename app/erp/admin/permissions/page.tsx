import { Suspense } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { PermissionEditor } from "@/components/erp/admin/permission-editor";
import { getMenuPathForAdminRoute } from "@/lib/erp/menu-routes";
import { getAllMenus, getUsers } from "@/lib/erp/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function AdminPermissionsPage() {
  return (
    <Suspense fallback={null}>
      <AdminPermissionsContent />
    </Suspense>
  );
}

// getUsers()/getAllMenus()가 cookies()를 쓰는 createClient()에 의존하므로
// Suspense 경계 안에서만 호출한다 (cacheComponents: true, CLAUDE.md 참고).
// 권한 대상 메뉴는 활성 메뉴만 노출한다 — 비활성 메뉴는 getVisibleMenuTree()가
// 관리자/일반 사용자 구분 없이 항상 제외하므로, 여기서 권한을 부여해도 실제
// 내비게이션에는 아무 효과가 없어 혼란만 준다.
async function AdminPermissionsContent() {
  const [users, activeMenus, locale] = await Promise.all([
    getUsers(),
    getAllMenus({ activeOnly: true }),
    getLocale(),
  ]);
  const dict = getDictionary(locale);
  const breadcrumb = getMenuPathForAdminRoute("/erp/admin/permissions")?.slice(
    0,
    -1,
  );

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        breadcrumb={breadcrumb}
        title={dict.admin.permissions.pageTitle}
        description={dict.admin.permissions.pageDescription}
      />
      <PermissionEditor users={users} activeMenus={activeMenus} dict={dict} />
    </div>
  );
}
