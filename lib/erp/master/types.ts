import type { GenderValue } from "./gender";

// DB 타입(Tables<"...">, Task 029에서 생성)이 아니라 화면이 소비하는 camelCase 뷰 타입.
export type MasterCommonFields = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
};

export type Company = MasterCommonFields;

export type Brand = MasterCommonFields & { companyId: string };

export type SmallBrand = MasterCommonFields & { brandId: string };

export type BrandLine = MasterCommonFields & { brandId: string };

export type ItemType = MasterCommonFields & { smallBrandId: string };

export type Item = MasterCommonFields & { itemTypeId: string };

export type SubItem = MasterCommonFields & { itemId: string };

export type BrandColorType = MasterCommonFields & { brandId: string };

export type BrandColor = MasterCommonFields & {
  brandColorTypeId: string;
  rgbHex: string;
};

export type BrandGenderSizeType = MasterCommonFields & {
  brandId: string;
  gender: GenderValue;
};

export type BrandGenderSize = MasterCommonFields & {
  brandGenderSizeTypeId: string;
};

export type SalesStatus = "on_sale" | "sold_out" | "discontinued";

// Task 028에서 products 스키마가 확정된 뒤 Task 029에서 추가.
export type Product = MasterCommonFields & {
  subItemId: string;
  brandLineId: string;
  brandColorId: string;
  brandGenderSizeId: string;
  gender: GenderValue;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  season: string | null;
  releaseYear: number | null;
  material: string | null;
  costPrice: number | null;
  salePrice: number | null;
  salesStatus: SalesStatus | null;
};
