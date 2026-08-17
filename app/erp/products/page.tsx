import { Suspense } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { ProductFilters } from "@/components/erp/products/product-filters";
import { ProductTable } from "@/components/erp/products/product-table";
import { isGenderValue } from "@/lib/erp/master/gender";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";
import {
  DEFAULT_PRODUCT_PAGE_SIZE,
  getBrands,
  getProducts,
  getSubItemFilterOptions,
} from "@/lib/erp/master/queries";

// 이 라우트는 app/erp/master/ 세그먼트 밖에 있어 requireAdmin() 하드 게이트가
// 걸리지 않는다 — 상품 관리는 기존 user_menu_permissions + canAccessMenu()
// 경로만 적용되는 것이 확정 사항이다(PRD 1.2/3.1, Task 023 ③).
type ProductsPageSearchParams = Promise<{
  search?: string;
  brandId?: string;
  subItemId?: string;
  gender?: string;
  isActive?: string;
  page?: string;
}>;

export default function ProductsPage({
  searchParams,
}: {
  searchParams: ProductsPageSearchParams;
}) {
  return (
    <Suspense fallback={null}>
      <ProductsContent searchParams={searchParams} />
    </Suspense>
  );
}

// getProducts/getBrands/getSubItemFilterOptions가 cookies()를 쓰는
// createClient()에 의존하므로(cacheComponents: true) Suspense 경계 안에서만
// 호출한다.
async function ProductsContent({
  searchParams,
}: {
  searchParams: ProductsPageSearchParams;
}) {
  const params = await searchParams;

  const pageNumber = params.page ? Number(params.page) : 1;
  const page = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const gender =
    params.gender && isGenderValue(params.gender) ? params.gender : undefined;
  const isActive =
    params.isActive === "true"
      ? true
      : params.isActive === "false"
        ? false
        : undefined;

  const [brands, subItems, result] = await Promise.all([
    getBrands(),
    getSubItemFilterOptions(),
    getProducts({
      search: params.search || undefined,
      brandId: params.brandId || undefined,
      subItemId: params.subItemId || undefined,
      gender,
      isActive,
      page,
      pageSize: DEFAULT_PRODUCT_PAGE_SIZE,
    }),
  ]);

  const path = getMenuPathForRoute("/erp/products");
  const breadcrumb = path?.slice(0, -1);
  const title = path?.at(-1) ?? "상품 관리";

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title={title} />
      <ProductFilters
        brands={brands}
        subItems={subItems}
        filters={{
          search: params.search ?? "",
          brandId: params.brandId ?? "",
          subItemId: params.subItemId ?? "",
          gender: params.gender ?? "",
          isActive: params.isActive ?? "",
        }}
      />
      <ProductTable
        items={result.items}
        total={result.total}
        page={page}
        pageSize={DEFAULT_PRODUCT_PAGE_SIZE}
      />
    </div>
  );
}
