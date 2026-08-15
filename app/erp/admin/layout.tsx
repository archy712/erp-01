import { Suspense } from "react";

import { requireAdmin } from "@/lib/erp/auth";

export default function ErpAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <ErpAdminGuard>{children}</ErpAdminGuard>
    </Suspense>
  );
}

// requireAdmin()이 cookies()를 사용하는 createClient()에 의존하므로
// Suspense 경계 안에서만 호출한다 (cacheComponents: true, CLAUDE.md 참고).
// 관리자가 아니면 requireAdmin() 내부에서 /erp/forbidden으로 리다이렉트된다.
async function ErpAdminGuard({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return <>{children}</>;
}
