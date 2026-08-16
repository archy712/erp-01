import { Suspense } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";

// Task 034에서 실제 브랜드 구조 관리 화면(법인 > 브랜드 > [소브랜드|라인]
// 탭 구조)으로 교체된다. 현재는 app/erp/master/layout.tsx의 requireAdmin()
// 하드 게이트를 검증하기 위한 최소 스텁이다.
export default function MasterBrandsPage() {
  return (
    <Suspense fallback={null}>
      <MasterBrandsContent />
    </Suspense>
  );
}

async function MasterBrandsContent() {
  const path = getMenuPathForRoute("/erp/master/brands");
  const breadcrumb = path?.slice(0, -1);
  const title = path?.at(-1) ?? "브랜드 구조 관리";

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title={title} />
      <div className="flex flex-1 flex-col gap-2 p-6">
        <p className="text-sm text-muted-foreground">
          Task 034에서 실제 브랜드 구조 관리 화면이 구현됩니다.
        </p>
      </div>
    </div>
  );
}
