import { Suspense } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";

// Task 037에서 실제 사이즈 관리 화면(브랜드 > 성별 탭 > 사이즈타입 >
// 사이즈)으로 교체된다. 현재는 app/erp/master/layout.tsx의 requireAdmin()
// 하드 게이트를 검증하기 위한 최소 스텁이다.
export default function MasterSizesPage() {
  return (
    <Suspense fallback={null}>
      <MasterSizesContent />
    </Suspense>
  );
}

async function MasterSizesContent() {
  const path = getMenuPathForRoute("/erp/master/sizes");
  const breadcrumb = path?.slice(0, -1);
  const title = path?.at(-1) ?? "사이즈 관리";

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title={title} />
      <div className="flex flex-1 flex-col gap-2 p-6">
        <p className="text-sm text-muted-foreground">
          Task 037에서 실제 사이즈 관리 화면이 구현됩니다.
        </p>
      </div>
    </div>
  );
}
