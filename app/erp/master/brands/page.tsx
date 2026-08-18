import { Suspense } from "react";

import { BrandStructureManager } from "@/components/erp/master/brand-structure-manager";
import { MasterDetailSkeleton } from "@/components/erp/master/master-detail-skeleton";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";
import {
  getBrandLines,
  getBrands,
  getCompanies,
  getSmallBrands,
} from "@/lib/erp/master/queries";

type BrandsPageSearchParams = Promise<{
  companyId?: string;
  brandId?: string;
  tab?: string;
}>;

export default function MasterBrandsPage({
  searchParams,
}: {
  searchParams: BrandsPageSearchParams;
}) {
  return (
    <Suspense fallback={<MasterDetailSkeleton />}>
      <MasterBrandsContent searchParams={searchParams} />
    </Suspense>
  );
}

// getCompanies/getBrands/getSmallBrands/getBrandLines가 cookies()를 쓰는
// createClient()에 의존하므로(cacheComponents: true) Suspense 경계 안에서만
// 호출한다. 상위 app/erp/master/layout.tsx의 requireAdmin() 하드 게이트를 이미
// 통과한 뒤 렌더링된다.
//
// 트리(법인→브랜드)는 전체 목록을 그대로 넘긴다 — 비활성 법인/브랜드도
// "비활성" 배지와 함께 좌측 트리에 계속 노출해야 하므로(PRD 6.3) activeOnly를
// 넘기지 않는다. 이 화면에는 "소속 법인/브랜드"를 고르는 드롭다운이 없고
// 좌측 트리 선택값을 읽기 전용으로만 보여주므로, activeOnly:true가 필요한
// 지점(하위 신규 등록 폼의 소속 드롭다운) 자체가 이 화면에는 없다 —
// 그 정책은 상품 폼(Task 039)에서 지켜져야 한다.
async function MasterBrandsContent({
  searchParams,
}: {
  searchParams: BrandsPageSearchParams;
}) {
  const params = await searchParams;
  const [companies, brands] = await Promise.all([getCompanies(), getBrands()]);

  const selectedBrand = params.brandId
    ? (brands.find((brand) => brand.id === params.brandId) ?? null)
    : null;
  const selectedCompanyId = selectedBrand
    ? selectedBrand.companyId
    : (params.companyId ?? null);
  const validCompanyId =
    selectedCompanyId && companies.some((c) => c.id === selectedCompanyId)
      ? selectedCompanyId
      : null;

  const [smallBrands, brandLines] = selectedBrand
    ? await Promise.all([
        getSmallBrands(selectedBrand.id),
        getBrandLines(selectedBrand.id),
      ])
    : [[], []];

  const activeTab =
    params.tab === "brand_lines" ? "brand_lines" : "small_brands";
  const breadcrumb = getMenuPathForRoute("/erp/master/brands")?.slice(0, -1);

  return (
    <BrandStructureManager
      breadcrumb={breadcrumb}
      companies={companies}
      brands={brands}
      selectedCompanyId={validCompanyId}
      selectedBrand={selectedBrand}
      smallBrands={smallBrands}
      brandLines={brandLines}
      activeTab={activeTab}
    />
  );
}
