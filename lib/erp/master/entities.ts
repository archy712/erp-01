import type { MasterCodeEntity } from "./code";

// 기준정보 관리 5개 화면(PRD_MASTER.md 4.2절)이 다루는 11종 엔티티. 상품(product)은
// 별도 화면(app/erp/products/*, Task 038~040)이라 이 레지스트리 대상이 아니다.
//
// route 값은 Task 031에서 실제로 스캐폴딩된 app/erp/master/* 라우트(companies/
// brands/item-categories/colors/sizes)와 정확히 일치해야 한다 — actions.ts의
// createMasterAction/updateMasterAction/... 이 저장 후 이 route로 revalidatePath()를
// 호출하므로, 문자열이 실제 페이지 경로와 어긋나면 캐시 무효화가 조용히 실패한다.
export type MasterEntityKey = Exclude<MasterCodeEntity, "product">;

export type MasterEntityMeta = {
  label: string;
  table: string;
  codeSpec: MasterEntityKey;
  parent: MasterEntityKey | null;
  route: string;
};

export const MASTER_ENTITIES: Record<MasterEntityKey, MasterEntityMeta> = {
  company: {
    label: "법인",
    table: "companies",
    codeSpec: "company",
    parent: null,
    route: "/erp/master/companies",
  },
  brand: {
    label: "브랜드",
    table: "brands",
    codeSpec: "brand",
    parent: "company",
    route: "/erp/master/brands",
  },
  smallBrand: {
    label: "소브랜드",
    table: "small_brands",
    codeSpec: "smallBrand",
    parent: "brand",
    route: "/erp/master/brands",
  },
  brandLine: {
    label: "라인",
    table: "brand_lines",
    codeSpec: "brandLine",
    parent: "brand",
    route: "/erp/master/brands",
  },
  itemType: {
    label: "아이템타입",
    table: "item_types",
    codeSpec: "itemType",
    parent: "smallBrand",
    route: "/erp/master/item-categories",
  },
  item: {
    label: "아이템",
    table: "items",
    codeSpec: "item",
    parent: "itemType",
    route: "/erp/master/item-categories",
  },
  subItem: {
    label: "서브아이템",
    table: "sub_items",
    codeSpec: "subItem",
    parent: "item",
    route: "/erp/master/item-categories",
  },
  brandColorType: {
    label: "컬러타입",
    table: "brand_color_types",
    codeSpec: "brandColorType",
    parent: "brand",
    route: "/erp/master/colors",
  },
  brandColor: {
    label: "컬러",
    table: "brand_colors",
    codeSpec: "brandColor",
    parent: "brandColorType",
    route: "/erp/master/colors",
  },
  brandGenderSizeType: {
    label: "사이즈타입",
    table: "brand_gender_size_types",
    codeSpec: "brandGenderSizeType",
    parent: "brand",
    route: "/erp/master/sizes",
  },
  brandGenderSize: {
    label: "사이즈",
    table: "brand_gender_sizes",
    codeSpec: "brandGenderSize",
    parent: "brandGenderSizeType",
    route: "/erp/master/sizes",
  },
};
