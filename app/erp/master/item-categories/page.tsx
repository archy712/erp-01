import { Suspense } from "react";

import { ItemCategoryManager } from "@/components/erp/master/item-category-manager";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";
import {
  getBrands,
  getCompanies,
  getItems,
  getItemTypes,
  getSmallBrands,
  getSmallBrandScope,
  getSubItems,
} from "@/lib/erp/master/queries";
import type { Item, ItemType, SubItem } from "@/lib/erp/master/types";

type ItemCategoriesPageSearchParams = Promise<{
  companyId?: string;
  brandId?: string;
  smallBrandId?: string;
  itemTypeId?: string;
  itemId?: string;
}>;

export default function MasterItemCategoriesPage({
  searchParams,
}: {
  searchParams: ItemCategoriesPageSearchParams;
}) {
  return (
    <Suspense fallback={null}>
      <MasterItemCategoriesContent searchParams={searchParams} />
    </Suspense>
  );
}

// 아래 조회 함수들이 전부 cookies()를 쓰는 createClient()에 의존하므로
// (cacheComponents: true) Suspense 경계 안에서만 호출한다. 상위
// app/erp/master/layout.tsx의 requireAdmin() 하드 게이트를 이미 통과한 뒤
// 렌더링된다.
//
// ScopeSelector(법인/브랜드/소브랜드)는 "신규 하위 등록 시 상위 선택"과 같은
// 성격이라 PRD 6.3 정책대로 activeOnly:true로 조회한다(비활성 소브랜드는
// 스코프 드롭다운에서 제외). 반면 좌측 아이템타입/아이템/서브아이템 트리는
// brand-structure-manager의 법인/브랜드 트리와 동일하게 비활성 항목도
// "비활성" 배지와 함께 그대로 노출한다(기존 하위 데이터는 계속 조회 가능해야
// 하므로 activeOnly를 넘기지 않는다).
async function MasterItemCategoriesContent({
  searchParams,
}: {
  searchParams: ItemCategoriesPageSearchParams;
}) {
  const params = await searchParams;

  // 딥링크(예: ?smallBrandId=..&itemTypeId=..)로 companyId/brandId 없이 진입할
  // 수 있으므로, smallBrandId가 있으면 그 소브랜드 자체에서 상위 브랜드/법인을
  // 먼저 역추적해둔다(brands/page.tsx가 brandId만으로 companyId를 역추적하는
  // 것과 동일한 목적 — 거기는 브랜드 전체 목록을 이미 들고 있어 별도 조회가
  // 필요 없었지만, 여기는 소브랜드가 브랜드에 종속돼 있어 getSmallBrandScope로
  // 한 번에 가져온다).
  const smallBrandScope = params.smallBrandId
    ? await getSmallBrandScope(params.smallBrandId)
    : null;

  const companies = await getCompanies({ activeOnly: true });
  const resolvedCompanyId = smallBrandScope?.companyId ?? params.companyId;
  const validCompanyId =
    resolvedCompanyId && companies.some((c) => c.id === resolvedCompanyId)
      ? resolvedCompanyId
      : null;

  const brands = validCompanyId
    ? await getBrands(validCompanyId, { activeOnly: true })
    : [];
  const resolvedBrandId = smallBrandScope?.brandId ?? params.brandId;
  const validBrandId =
    resolvedBrandId && brands.some((b) => b.id === resolvedBrandId)
      ? resolvedBrandId
      : null;

  const smallBrands = validBrandId
    ? await getSmallBrands(validBrandId, { activeOnly: true })
    : [];
  const selectedSmallBrand =
    params.smallBrandId &&
    smallBrands.some((sb) => sb.id === params.smallBrandId)
      ? (smallBrands.find((sb) => sb.id === params.smallBrandId) ?? null)
      : null;

  // 아이템타입 → (각 아이템타입의) 아이템 → (각 아이템의) 서브아이템을 순차
  // 캐스케이드로 전부 가져와 좌측 3단 트리를 한 번에 그린다. 형제 레벨끼리는
  // Promise.all로 병렬 조회한다(brand-structure-manager의 소브랜드/라인
  // 병렬 조회와 동일한 패턴을 한 단 더 깊이 확장).
  const itemTypes = selectedSmallBrand
    ? await getItemTypes(selectedSmallBrand.id)
    : [];

  const items: Item[] = itemTypes.length
    ? (await Promise.all(itemTypes.map((it) => getItems(it.id)))).flat()
    : [];

  const subItems: SubItem[] = items.length
    ? (await Promise.all(items.map((item) => getSubItems(item.id)))).flat()
    : [];

  const validItemTypeId =
    params.itemTypeId &&
    itemTypes.some((it: ItemType) => it.id === params.itemTypeId)
      ? params.itemTypeId
      : null;
  const validItemId =
    params.itemId &&
    items.some(
      (item) =>
        item.id === params.itemId && item.itemTypeId === validItemTypeId,
    )
      ? params.itemId
      : null;

  const breadcrumb = getMenuPathForRoute("/erp/master/item-categories")?.slice(
    0,
    -1,
  );

  return (
    <ItemCategoryManager
      breadcrumb={breadcrumb}
      companies={companies}
      brands={brands}
      smallBrands={smallBrands}
      itemTypes={itemTypes}
      items={items}
      subItems={subItems}
      selectedCompanyId={validCompanyId}
      selectedBrandId={validBrandId}
      selectedSmallBrand={selectedSmallBrand}
      selectedItemTypeId={validItemTypeId}
      selectedItemId={validItemId}
    />
  );
}
