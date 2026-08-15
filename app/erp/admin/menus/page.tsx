import { Suspense } from "react";

import { MenuManager } from "@/components/erp/admin/menu-manager";
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 pt-6">
        <h1 className="text-lg font-medium tracking-tight">
          {dict.admin.menus.pageTitle}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.admin.menus.pageDescription}
        </p>
      </div>
      <MenuManager menus={menus} dict={dict} />
    </div>
  );
}
