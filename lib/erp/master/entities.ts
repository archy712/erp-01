import type { MasterCodeEntity } from "./code";

// 기준정보 관리 5개 화면(PRD_MASTER.md 4.2절)이 다루는 11종 엔티티. 상품(product)은
// 별도 화면(app/erp/products/*, Task 038~040)이라 이 레지스트리 대상이 아니다.
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
    route: "/erp/master/brand-structure",
  },
  smallBrand: {
    label: "소브랜드",
    table: "small_brands",
    codeSpec: "smallBrand",
    parent: "brand",
    route: "/erp/master/brand-structure",
  },
  brandLine: {
    label: "라인",
    table: "brand_lines",
    codeSpec: "brandLine",
    parent: "brand",
    route: "/erp/master/brand-structure",
  },
  itemType: {
    label: "아이템타입",
    table: "item_types",
    codeSpec: "itemType",
    parent: "smallBrand",
    route: "/erp/master/product-classification",
  },
  item: {
    label: "아이템",
    table: "items",
    codeSpec: "item",
    parent: "itemType",
    route: "/erp/master/product-classification",
  },
  subItem: {
    label: "서브아이템",
    table: "sub_items",
    codeSpec: "subItem",
    parent: "item",
    route: "/erp/master/product-classification",
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
