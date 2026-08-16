import { Suspense } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";

// Task 033에서 실제 법인 관리 화면(단일 목록형 CRUD)으로 교체된다. 현재는
// app/erp/master/layout.tsx의 requireAdmin() 하드 게이트를 검증하기 위한
// 최소 스텁이다(app/erp/admin/menus 스텁, Task 014 선례와 동일한 목적).
export default function MasterCompaniesPage() {
  return (
    <Suspense fallback={null}>
      <MasterCompaniesContent />
    </Suspense>
  );
}

// getMenuPathForRoute()는 DB 조회 없는 정적 매핑이지만, 페이지 자체는 상위
// app/erp/master/layout.tsx의 requireAdmin()이 cookies()를 쓰는 createClient()에
// 의존하므로(cacheComponents: true) 이 콘텐츠도 Suspense 경계 안에서 렌더링한다.
async function MasterCompaniesContent() {
  const path = getMenuPathForRoute("/erp/master/companies");
  const breadcrumb = path?.slice(0, -1);
  const title = path?.at(-1) ?? "법인 관리";

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title={title} />
      <div className="flex flex-1 flex-col gap-2 p-6">
        <p className="text-sm text-muted-foreground">
          Task 033에서 실제 법인 관리 화면이 구현됩니다.
        </p>
      </div>
    </div>
  );
}
