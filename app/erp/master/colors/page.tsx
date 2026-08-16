import { Suspense } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";

// Task 036에서 실제 컬러 관리 화면(브랜드 > 컬러타입 > 컬러, HEX 스와치
// 입력 포함)으로 교체된다. 현재는 app/erp/master/layout.tsx의 requireAdmin()
// 하드 게이트를 검증하기 위한 최소 스텁이다.
export default function MasterColorsPage() {
  return (
    <Suspense fallback={null}>
      <MasterColorsContent />
    </Suspense>
  );
}

async function MasterColorsContent() {
  const path = getMenuPathForRoute("/erp/master/colors");
  const breadcrumb = path?.slice(0, -1);
  const title = path?.at(-1) ?? "컬러 관리";

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title={title} />
      <div className="flex flex-1 flex-col gap-2 p-6">
        <p className="text-sm text-muted-foreground">
          Task 036에서 실제 컬러 관리 화면이 구현됩니다.
        </p>
      </div>
    </div>
  );
}
