import { Suspense } from "react";

import { requireAdmin } from "@/lib/erp/auth";

export default function ErpMasterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <ErpMasterGuard>{children}</ErpMasterGuard>
    </Suspense>
  );
}

// requireAdmin()이 cookies()를 사용하는 createClient()에 의존하므로
// Suspense 경계 안에서만 호출한다 (cacheComponents: true, CLAUDE.md 참고).
// app/erp/admin/layout.tsx와 동일한 가드 패턴이다.
//
// 이 세그먼트(app/erp/master/*) 전체에 requireAdmin()을 한 번만 걸어, 기준정보
// 5개 화면(법인/브랜드 구조/상품 분류/컬러/사이즈)에 user_menu_permissions
// 부여 여부와 무관한 역할 하드 게이트(PRD 3.1)를 일괄 적용한다. admin이 아니면
// requireAdmin() 내부에서 /erp/forbidden으로 리다이렉트된다 — superadmin도
// isAdminRole()이 role in ('admin','superadmin')로 판정하므로 통과한다.
async function ErpMasterGuard({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return <>{children}</>;
}
