import { notFound } from "next/navigation";
import { Suspense } from "react";

import { ProductForm } from "@/components/erp/products/product-form";
import { ErpFormPageSkeleton } from "@/components/erp/erp-form-page-skeleton";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";
import {
  getBrandColorTypes,
  getBrandColors,
  getBrandGenderSizeTypes,
  getBrandGenderSizes,
  getBrandLines,
  getBrands,
  getCompanies,
  getItemTypes,
  getItems,
  getProductById,
  getSmallBrands,
  getSubItemScope,
  getSubItems,
} from "@/lib/erp/master/queries";

type ProductPageParams = Promise<{ productId: string }>;

// app/erp/products/page.tsx와 동일하게 requireAdmin() 없이 로그인 사용자
// 전체에 개방된다(PRD 1.2/3.1, Task 023 ③).
export default function EditProductPage({
  params,
}: {
  params: ProductPageParams;
}) {
  return (
    <Suspense
      fallback={
        <ErpFormPageSkeleton showPageHeader showSectionNav fieldCount={5} />
      }
    >
      <EditProductContent params={params} />
    </Suspense>
  );
}

// 아래 조회는 전부 cookies()를 쓰는 createClient()에 의존하므로 Suspense
// 경계 안에서 호출한다.
//
// 다른 5개 마스터 화면(신규 등록)과 달리 여기서는 전부 activeOnly를 주지
// 않는다(=비활성 포함 전체 조회) — 상품이 참조하는 분류/속성 항목이 등록
// 이후 비활성화됐을 수도 있는데, 그 경우에도 수정 폼이 기존 선택값을 정상
// 복원해야 한다(활성 항목만 걸러 조회하면 그 값이 옵션 목록에서 사라져 마치
// "선택 안 됨"처럼 보이게 된다). 사용자가 폼에서 실제로 값을 바꾸는 순간부터는
// components/erp/products/product-form.tsx가 Server Action(product-scope-actions.ts,
// activeOnly: true)으로 새로 조회한다.
async function EditProductContent({ params }: { params: ProductPageParams }) {
  const { productId } = await params;

  const product = await getProductById(productId);
  if (!product) notFound();

  const scope = await getSubItemScope(product.subItemId);
  if (!scope) notFound();

  const [
    companies,
    brands,
    smallBrands,
    itemTypes,
    items,
    subItems,
    brandLines,
    colorTypes,
    colors,
    sizeTypes,
    sizes,
  ] = await Promise.all([
    getCompanies(),
    getBrands(scope.companyId),
    getSmallBrands(scope.brandId),
    getItemTypes(scope.smallBrandId),
    getItems(scope.itemTypeId),
    getSubItems(scope.itemId),
    getBrandLines(scope.brandId),
    getBrandColorTypes(scope.brandId),
    getBrandColors(product.brandColorTypeId),
    getBrandGenderSizeTypes(scope.brandId, product.gender),
    getBrandGenderSizes(product.brandGenderSizeTypeId),
  ]);

  const path = getMenuPathForRoute("/erp/products");
  const breadcrumb = path ? [...path.slice(0, -1), "상품 수정"] : undefined;

  return (
    <ProductForm
      key={product.id}
      mode="edit"
      breadcrumb={breadcrumb}
      companies={companies}
      initial={{
        product,
        scope,
        brands,
        smallBrands,
        itemTypes,
        items,
        subItems,
        brandLines,
        colorTypes,
        colors,
        sizeTypes,
        sizes,
      }}
    />
  );
}
