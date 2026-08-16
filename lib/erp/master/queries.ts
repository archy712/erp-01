import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import type { GenderValue } from "./gender";
import type {
  Brand,
  BrandColor,
  BrandColorType,
  BrandGenderSize,
  BrandGenderSizeType,
  BrandLine,
  Company,
  Item,
  ItemType,
  MasterCommonFields,
  SalesStatus,
  SmallBrand,
  SubItem,
} from "./types";

// 이 파일의 모든 함수는 cookies()를 쓰는 createClient()에 의존하므로,
// 호출하는 컴포넌트는 반드시 <Suspense> 경계 안에 있어야 한다(lib/erp/queries.ts와 동일 관례).

type ActiveOnlyOption = { activeOnly?: boolean };

function toCommonFields(row: {
  id: string;
  code: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}): MasterCommonFields {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
  };
}

export async function getCompanies(
  options?: ActiveOnlyOption,
): Promise<Company[]> {
  const supabase = await createClient();

  let query = supabase.from("companies").select("*");
  query = query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map(toCommonFields);
}

export async function getBrands(
  companyId?: string,
  options?: ActiveOnlyOption,
): Promise<Brand[]> {
  const supabase = await createClient();

  let query = supabase.from("brands").select("*");
  query = query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (companyId) {
    query = query.eq("company_id", companyId);
  }
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({
    ...toCommonFields(row),
    companyId: row.company_id,
  }));
}

export async function getSmallBrands(
  brandId: string,
  options?: ActiveOnlyOption,
): Promise<SmallBrand[]> {
  const supabase = await createClient();

  let query = supabase.from("small_brands").select("*").eq("brand_id", brandId);
  query = query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({ ...toCommonFields(row), brandId: row.brand_id }));
}

export async function getBrandLines(
  brandId: string,
  options?: ActiveOnlyOption,
): Promise<BrandLine[]> {
  const supabase = await createClient();

  let query = supabase.from("brand_lines").select("*").eq("brand_id", brandId);
  query = query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({ ...toCommonFields(row), brandId: row.brand_id }));
}

export async function getItemTypes(
  smallBrandId: string,
  options?: ActiveOnlyOption,
): Promise<ItemType[]> {
  const supabase = await createClient();

  let query = supabase
    .from("item_types")
    .select("*")
    .eq("small_brand_id", smallBrandId);
  query = query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({
    ...toCommonFields(row),
    smallBrandId: row.small_brand_id,
  }));
}

export async function getItems(
  itemTypeId: string,
  options?: ActiveOnlyOption,
): Promise<Item[]> {
  const supabase = await createClient();

  let query = supabase.from("items").select("*").eq("item_type_id", itemTypeId);
  query = query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({
    ...toCommonFields(row),
    itemTypeId: row.item_type_id,
  }));
}

export async function getSubItems(
  itemId: string,
  options?: ActiveOnlyOption,
): Promise<SubItem[]> {
  const supabase = await createClient();

  let query = supabase.from("sub_items").select("*").eq("item_id", itemId);
  query = query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({ ...toCommonFields(row), itemId: row.item_id }));
}

export async function getBrandColorTypes(
  brandId: string,
  options?: ActiveOnlyOption,
): Promise<BrandColorType[]> {
  const supabase = await createClient();

  let query = supabase
    .from("brand_color_types")
    .select("*")
    .eq("brand_id", brandId);
  query = query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({ ...toCommonFields(row), brandId: row.brand_id }));
}

export async function getBrandColors(
  colorTypeId: string,
  options?: ActiveOnlyOption,
): Promise<BrandColor[]> {
  const supabase = await createClient();

  let query = supabase
    .from("brand_colors")
    .select("*")
    .eq("brand_color_type_id", colorTypeId);
  query = query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({
    ...toCommonFields(row),
    brandColorTypeId: row.brand_color_type_id,
    rgbHex: row.rgb_hex,
  }));
}

export async function getBrandGenderSizeTypes(
  brandId: string,
  gender: GenderValue,
  options?: ActiveOnlyOption,
): Promise<BrandGenderSizeType[]> {
  const supabase = await createClient();

  let query = supabase
    .from("brand_gender_size_types")
    .select("*")
    .eq("brand_id", brandId)
    .eq("gender", gender);
  query = query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({
    ...toCommonFields(row),
    brandId: row.brand_id,
    gender: row.gender as GenderValue,
  }));
}

export async function getBrandGenderSizes(
  sizeTypeId: string,
  options?: ActiveOnlyOption,
): Promise<BrandGenderSize[]> {
  const supabase = await createClient();

  let query = supabase
    .from("brand_gender_sizes")
    .select("*")
    .eq("brand_gender_size_type_id", sizeTypeId);
  query = query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;
  if (error) throw error;

  return data.map((row) => ({
    ...toCommonFields(row),
    brandGenderSizeTypeId: row.brand_gender_size_type_id,
  }));
}

/** ilike 검색어에서 와일드카드(%, _)와 백슬래시를 이스케이프한다. */
function toIlikePattern(term: string): string {
  const escaped = term.replace(/[\\%_]/g, (char) => `\\${char}`);
  return `%${escaped}%`;
}

export type ProductFilters = {
  /** 상품코드/상품명 부분 일치 검색 */
  search?: string;
  brandId?: string;
  subItemId?: string;
  gender?: GenderValue;
  isActive?: boolean;
  /** 1부터 시작 */
  page?: number;
  pageSize?: number;
};

export type ProductListItem = {
  id: string;
  code: string;
  name: string;
  thumbnailUrl: string | null;
  brandLineName: string;
  brandColorName: string;
  gender: GenderValue;
  brandGenderSizeName: string;
  isActive: boolean;
};

export type ProductListResult = {
  items: ProductListItem[];
  total: number;
};

const DEFAULT_PRODUCT_PAGE_SIZE = 20;

/** 상품 목록 화면(PRD 7.6.1)용 조회. brand_line은 not null FK라 !inner로 걸어도 행 누락이 없다. */
export async function getProducts(
  filters?: ProductFilters,
): Promise<ProductListResult> {
  const supabase = await createClient();

  const page = filters?.page && filters.page > 0 ? filters.page : 1;
  const pageSize =
    filters?.pageSize && filters.pageSize > 0
      ? filters.pageSize
      : DEFAULT_PRODUCT_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select(
      "id, code, name, thumbnail_url, gender, is_active, brand_lines!inner(name, brand_id), brand_colors(name), brand_gender_sizes(name)",
      { count: "exact" },
    );

  if (filters?.search) {
    const pattern = toIlikePattern(filters.search);
    query = query.or(`code.ilike.${pattern},name.ilike.${pattern}`);
  }
  if (filters?.brandId) {
    query = query.eq("brand_lines.brand_id", filters.brandId);
  }
  if (filters?.subItemId) {
    query = query.eq("sub_item_id", filters.subItemId);
  }
  if (filters?.gender) {
    query = query.eq("gender", filters.gender);
  }
  if (filters?.isActive !== undefined) {
    query = query.eq("is_active", filters.isActive);
  }

  query = query
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true })
    .range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  const items = data.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    thumbnailUrl: row.thumbnail_url,
    brandLineName: row.brand_lines.name,
    brandColorName: row.brand_colors?.name ?? "",
    gender: row.gender as GenderValue,
    brandGenderSizeName: row.brand_gender_sizes?.name ?? "",
    isActive: row.is_active,
  }));

  return { items, total: count ?? items.length };
}

export type ProductDetail = {
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
  subItemId: string;
  subItemName: string;
  brandLineId: string;
  brandLineName: string;
  brandColorId: string;
  brandColorName: string;
  brandColorRgbHex: string;
  brandGenderSizeId: string;
  brandGenderSizeName: string;
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

/** 상품 상세/수정 폼(PRD 7.6.2)용 — 라인/컬러/사이즈/서브아이템 이름을 임베디드 select로 함께 가져온다. */
export async function getProductById(
  productId: string,
): Promise<ProductDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `*,
      sub_items(name),
      brand_lines!inner(name),
      brand_colors!inner(name, rgb_hex),
      brand_gender_sizes!inner(name)`,
    )
    .eq("id", productId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    code: data.code,
    name: data.name,
    sortOrder: data.sort_order,
    isActive: data.is_active,
    note: data.note,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by,
    updatedBy: data.updated_by,
    subItemId: data.sub_item_id,
    subItemName: data.sub_items?.name ?? "",
    brandLineId: data.brand_line_id,
    brandLineName: data.brand_lines.name,
    brandColorId: data.brand_color_id,
    brandColorName: data.brand_colors.name,
    brandColorRgbHex: data.brand_colors.rgb_hex,
    brandGenderSizeId: data.brand_gender_size_id,
    brandGenderSizeName: data.brand_gender_sizes.name,
    gender: data.gender as GenderValue,
    imageUrl: data.image_url,
    thumbnailUrl: data.thumbnail_url,
    season: data.season,
    releaseYear: data.release_year,
    material: data.material,
    costPrice: data.cost_price,
    salePrice: data.sale_price,
    salesStatus: data.sales_status as SalesStatus | null,
  };
}

type SubItemBrandChain = Tables<"sub_items"> & {
  items:
    | (Tables<"items"> & {
        item_types:
          | (Tables<"item_types"> & {
              small_brands: Pick<Tables<"small_brands">, "brand_id"> | null;
            })
          | null;
      })
    | null;
};

/**
 * 서브아이템의 소속 브랜드를 5단 역추적으로 반환한다
 * (sub_item → item → item_type → small_brand → brand).
 * Task 039의 교차 브랜드 검증(라인/컬러/사이즈 선택 제한)이 이 함수에 의존한다.
 * DB의 public.check_product_brand_consistency() 트리거와 같은 경로를 앱 레벨에서도 미러링한다.
 */
export async function getBrandIdOfSubItem(
  subItemId: string,
): Promise<string | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sub_items")
    .select("*, items(*, item_types(*, small_brands(brand_id)))")
    .eq("id", subItemId)
    .maybeSingle();

  if (error) throw error;

  const chain = data as SubItemBrandChain | null;
  return chain?.items?.item_types?.small_brands?.brand_id ?? null;
}
