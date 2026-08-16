import { Suspense } from "react";

import { SizeManager } from "@/components/erp/master/size-manager";
import {
  GENDERS,
  isGenderValue,
  type GenderValue,
} from "@/lib/erp/master/gender";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";
import {
  getBrandGenderSizes,
  getBrandGenderSizeTypes,
  getBrands,
  getCompanies,
} from "@/lib/erp/master/queries";

type SizesPageSearchParams = Promise<{
  companyId?: string;
  brandId?: string;
  gender?: string;
  sizeTypeId?: string;
}>;

export default function MasterSizesPage({
  searchParams,
}: {
  searchParams: SizesPageSearchParams;
}) {
  return (
    <Suspense fallback={null}>
      <MasterSizesContent searchParams={searchParams} />
    </Suspense>
  );
}

// getCompanies/getBrands/getBrandGenderSizeTypes/getBrandGenderSizes가
// cookies()를 쓰는 createClient()에 의존하므로(cacheComponents: true) Suspense
// 경계 안에서만 호출한다. 상위 app/erp/master/layout.tsx의 requireAdmin()
// 하드 게이트를 이미 통과한 뒤 렌더링된다.
//
// 성별은 테이블이 아니라 앱 상수 3종(lib/erp/master/gender.ts)이므로 여기서는
// DB 조회 없이 isGenderValue()로 쿼리스트링 값만 검증한다. 유효하지 않거나
// 없으면 첫 번째 성별(남성)로 기본값을 둔다 — 브랜드를 고르는 순간 항상 어떤
// 탭이든 활성 상태여야 하므로.
async function MasterSizesContent({
  searchParams,
}: {
  searchParams: SizesPageSearchParams;
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

  const gender: GenderValue =
    params.gender && isGenderValue(params.gender)
      ? params.gender
      : GENDERS[0].value;

  const sizeTypes = validBrandId
    ? await getBrandGenderSizeTypes(validBrandId, gender)
    : [];
  const selectedSizeType =
    params.sizeTypeId && sizeTypes.some((st) => st.id === params.sizeTypeId)
      ? (sizeTypes.find((st) => st.id === params.sizeTypeId) ?? null)
      : null;

  const sizes = selectedSizeType
    ? await getBrandGenderSizes(selectedSizeType.id)
    : [];

  const breadcrumb = getMenuPathForRoute("/erp/master/sizes")?.slice(0, -1);

  return (
    <SizeManager
      breadcrumb={breadcrumb}
      companies={companies}
      brands={brands}
      sizeTypes={sizeTypes}
      sizes={sizes}
      selectedCompanyId={validCompanyId}
      selectedBrandId={validBrandId}
      gender={gender}
      selectedSizeType={selectedSizeType}
    />
  );
}
