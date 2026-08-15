import { Suspense } from "react";

import { UserTable } from "@/components/erp/admin/user-table";
import { getCurrentErpUser } from "@/lib/erp/auth";
import { getUsers } from "@/lib/erp/queries";

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
// 자기 자신 강등 방지 등 화면 로직에 현재 사용자 id가 필요해 별도로 다시 조회한다
// (권한 조회 중복 캐싱은 Task 018에서 React.cache로 정리 예정).
async function AdminUsersContent() {
  const [currentUser, users] = await Promise.all([
    getCurrentErpUser(),
    getUsers(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 pt-6">
        <h1 className="text-lg font-medium tracking-tight">사용자 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          전체 사용자를 조회하고 활성 상태·관리자 권한을 관리합니다.
        </p>
      </div>
      <UserTable users={users} currentUserId={currentUser.id} />
    </div>
  );
}
