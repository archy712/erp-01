import { Suspense } from "react";

import { ColorManager } from "@/components/erp/master/color-manager";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";
import {
  getBrandColors,
  getBrandColorTypes,
  getBrands,
  getCompanies,
} from "@/lib/erp/master/queries";

type ColorsPageSearchParams = Promise<{
  companyId?: string;
  brandId?: string;
  colorTypeId?: string;
}>;

export default function MasterColorsPage({
  searchParams,
}: {
  searchParams: ColorsPageSearchParams;
}) {
  return (
    <Suspense fallback={null}>
      <MasterColorsContent searchParams={searchParams} />
    </Suspense>
  );
}

// getCompanies/getBrands/getBrandColorTypes/getBrandColors가 cookies()를 쓰는
// createClient()에 의존하므로(cacheComponents: true) Suspense 경계 안에서만
// 호출한다. 상위 app/erp/master/layout.tsx의 requireAdmin() 하드 게이트를 이미
// 통과한 뒤 렌더링된다.
//
// 상단 ScopeSelector(법인/브랜드)는 "신규 하위 등록 시 상위 선택"과 동일한
// 성격이라 PRD 6.3 정책대로 activeOnly:true로 조회한다(비활성 브랜드는
// 드롭다운에서 제외). 반면 좌측 컬러타입 목록은 brand-structure-manager의
// 법인/브랜드 트리와 동일하게 비활성 항목도 "비활성" 배지와 함께 그대로
// 노출한다(기존 하위 데이터는 계속 조회 가능해야 하므로 activeOnly를 넘기지
// 않는다).
async function MasterColorsContent({
  searchParams,
}: {
  searchParams: ColorsPageSearchParams;
}) {
  const params = await searchParams;

  const companies = await getCompanies({ activeOnly: true });
  const validCompanyId =
    params.companyId && companies.some((c) => c.id === params.companyId)
      ? params.companyId
      : null;

  const brands = validCompanyId
    ? await getBrands(validCompanyId, { activeOnly: true })
    : [];
  const validBrandId =
    params.brandId && brands.some((b) => b.id === params.brandId)
      ? params.brandId
      : null;

  const colorTypes = validBrandId ? await getBrandColorTypes(validBrandId) : [];
  const selectedColorType =
    params.colorTypeId && colorTypes.some((ct) => ct.id === params.colorTypeId)
      ? (colorTypes.find((ct) => ct.id === params.colorTypeId) ?? null)
      : null;

  const colors = selectedColorType
    ? await getBrandColors(selectedColorType.id)
    : [];

  const breadcrumb = getMenuPathForRoute("/erp/master/colors")?.slice(0, -1);

  return (
    <ColorManager
      breadcrumb={breadcrumb}
      companies={companies}
      brands={brands}
      colorTypes={colorTypes}
      colors={colors}
      selectedCompanyId={validCompanyId}
      selectedBrandId={validBrandId}
      selectedColorType={selectedColorType}
    />
  );
}
