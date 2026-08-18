import { Suspense } from "react";

import { ProductForm } from "@/components/erp/products/product-form";
import { ErpFormPageSkeleton } from "@/components/erp/erp-form-page-skeleton";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";
import { getCompanies } from "@/lib/erp/master/queries";

// app/erp/products/page.tsx와 동일하게 requireAdmin() 없이 로그인 사용자
// 전체에 개방된다(PRD 1.2/3.1, Task 023 ③).
export default function NewProductPage() {
  return (
    <Suspense
      fallback={
        <ErpFormPageSkeleton showPageHeader showSectionNav fieldCount={5} />
      }
    >
      <NewProductContent />
    </Suspense>
  );
}

// getCompanies가 cookies()를 쓰는 createClient()에 의존하므로 Suspense 경계
// 안에서 호출한다. 신규 등록이라 activeOnly: true(비활성 법인은 캐스케이드
// 시작점으로 노출하지 않음, PRD 6.3).
async function NewProductContent() {
  const companies = await getCompanies({ activeOnly: true });

  const path = getMenuPathForRoute("/erp/products");
  const breadcrumb = path ? [...path.slice(0, -1), "상품등록"] : undefined;

  return (
    <ProductForm mode="create" breadcrumb={breadcrumb} companies={companies} />
  );
}
