import { Suspense } from "react";

import { PermissionEditor } from "@/components/erp/admin/permission-editor";
import { getAllMenus, getUsers } from "@/lib/erp/queries";

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
  const [users, activeMenus] = await Promise.all([
    getUsers(),
    getAllMenus({ activeOnly: true }),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 pt-6">
        <h1 className="text-lg font-medium tracking-tight">사용자 권한 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          사용자를 선택해 접근 가능한 메뉴를 임의 레벨에서 부여·회수합니다.
        </p>
      </div>
      <PermissionEditor users={users} activeMenus={activeMenus} />
    </div>
  );
}
