import { Suspense } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { UserTable } from "@/components/erp/admin/user-table";
import { getCurrentErpUser } from "@/lib/erp/auth";
import { getMenuPathForAdminRoute } from "@/lib/erp/menu-routes";
import { getUsers } from "@/lib/erp/queries";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function AdminUsersPage() {
  return (
    <Suspense fallback={null}>
      <AdminUsersContent />
    </Suspense>
  );
}

// getCurrentErpUser()/getUsers()가 cookies()를 쓰는 createClient()에 의존하므로
// Suspense 경계 안에서만 호출한다 (cacheComponents: true, CLAUDE.md 참고).
// app/erp/admin/layout.tsx의 requireAdmin() 가드를 이미 통과한 뒤 렌더링되지만,
// 자기 자신 강등 방지 등 화면 로직에 현재 사용자 id가 필요해 별도로 다시 조회한다.
// getCurrentErpUser()는 react의 cache()로 감싸져 있어(lib/erp/auth.ts, Task 018),
// requireAdmin() 내부 호출과 이 호출이 같은 요청 안에서 실제로는 한 번만 실행된다.
async function AdminUsersContent() {
  const [currentUser, users, locale] = await Promise.all([
    getCurrentErpUser(),
    getUsers(),
    getLocale(),
  ]);
  const dict = getDictionary(locale);
  const breadcrumb = getMenuPathForAdminRoute("/erp/admin/users")?.slice(0, -1);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        breadcrumb={breadcrumb}
        title={dict.admin.users.pageTitle}
        description={dict.admin.users.pageDescription}
      />
      <UserTable users={users} currentUserId={currentUser.id} dict={dict} />
    </div>
  );
}
