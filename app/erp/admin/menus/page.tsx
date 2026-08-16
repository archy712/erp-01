import { Suspense } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { MenuManager } from "@/components/erp/admin/menu-manager";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";
import { getAllMenus } from "@/lib/erp/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function AdminMenusPage() {
  return (
    <Suspense fallback={null}>
      <AdminMenusContent />
    </Suspense>
  );
}

// getAllMenus()가 cookies()를 쓰는 createClient()에 의존하므로 Suspense 경계
// 안에서만 호출한다 (cacheComponents: true, CLAUDE.md 참고). 관리 화면이므로
// activeOnly 옵션 없이 비활성 메뉴도 함께 조회한다.
async function AdminMenusContent() {
  const [menus, locale] = await Promise.all([getAllMenus(), getLocale()]);
  const dict = getDictionary(locale);
  const breadcrumb = getMenuPathForRoute("/erp/admin/menus")?.slice(0, -1);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        breadcrumb={breadcrumb}
        title={dict.admin.menus.pageTitle}
        description={dict.admin.menus.pageDescription}
      />
      <MenuManager menus={menus} dict={dict} />
    </div>
  );
}
