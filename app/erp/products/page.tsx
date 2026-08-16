import { Suspense } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";

// Task 038에서 실제 상품 목록 화면(썸네일/검색/필터)으로 교체된다. 현재는
// 라우트 매핑(lib/erp/menu-routes.ts)과 접근 제어 회귀를 검증하기 위한 최소
// 스텁이다.
//
// 이 라우트는 app/erp/master/ 세그먼트 밖에 있어 requireAdmin() 하드 게이트가
// 걸리지 않는다 — 상품 관리는 PRD 1.2/3.1에 따라 기존 user_menu_permissions
// 기반 접근만 적용되는 것이 확정 사항이다(app/erp/menu/[menuId]/page.tsx의
// canAccessMenu()가 이미 이 경로 도달 전에 권한을 검증했다).
export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsContent />
    </Suspense>
  );
}

async function ProductsContent() {
  const path = getMenuPathForRoute("/erp/products");
  const breadcrumb = path?.slice(0, -1);
  const title = path?.at(-1) ?? "상품 관리";

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title={title} />
      <div className="flex flex-1 flex-col gap-2 p-6">
        <p className="text-sm text-muted-foreground">
          Task 038에서 실제 상품 목록 화면이 구현됩니다.
        </p>
      </div>
    </div>
  );
}
