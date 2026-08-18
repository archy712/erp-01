import { Suspense } from "react";

import { CompanyManager } from "@/components/erp/master/company-manager";
import { ErpListPageSkeleton } from "@/components/erp/erp-list-page-skeleton";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";
import { getCompanies } from "@/lib/erp/master/queries";

export default function MasterCompaniesPage() {
  return (
    <Suspense
      fallback={<ErpListPageSkeleton showHeaderAction columnCount={6} />}
    >
      <MasterCompaniesContent />
    </Suspense>
  );
}

// getCompanies()가 cookies()를 쓰는 createClient()에 의존하므로(cacheComponents:
// true) Suspense 경계 안에서만 호출한다. 상위 app/erp/master/layout.tsx의
// requireAdmin() 하드 게이트를 이미 통과한 뒤 렌더링된다.
async function MasterCompaniesContent() {
  const companies = await getCompanies();
  const breadcrumb = getMenuPathForRoute("/erp/master/companies")?.slice(0, -1);

  return <CompanyManager companies={companies} breadcrumb={breadcrumb} />;
}
