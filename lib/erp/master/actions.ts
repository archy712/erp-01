"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { getCurrentErpUser, requireAdmin } from "@/lib/erp/auth";
import type { ActionResult } from "@/lib/erp/actions";
import type { Database } from "@/lib/supabase/database.types";
import type { MasterCodeEntity } from "./code";
import { MASTER_ENTITIES, type MasterEntityKey } from "./entities";
import type { GenderValue } from "./gender";
import type { SalesStatus } from "./types";

// 마스터/상품 공용 Server Action 규약.
//
// 12종 엔티티(기준정보 11 + 상품 1)를 엔티티 키로 분기하는 공용 액션 4개로 구현한다
// (엔티티마다 복제하면 48개가 됨 — ROADMAP_MASTER.md Task 029). 기준정보 11종은
// 첫 줄에서 requireAdmin()을 호출하고, 상품은 Task 023 ③ 확정 결과(로그인 사용자
// 전체 개방)에 따라 로그인 확인만 한다. next_master_code() DB 함수도 이 결정에 맞춰
// product 엔티티에 한해 관리자 제한을 완화해뒀다(Task 027 원안 보정, Task 029에서 발견).

type TableName = keyof Database["public"]["Tables"];
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type PostgrestErrorLike = { code?: string; message: string };

// Supabase 생성 타입은 테이블별로 Row/Insert/Update 모양이 전부 다르기 때문에,
// "런타임에 결정되는 테이블명 하나로 12개 테이블을 분기하는 공용 액션"이라는
// 이 파일의 설계 자체와 정적 타입付け가 근본적으로 맞지 않는다. 컬럼 매핑의
// 정확성은 buildEntityFields()가 엔티티별로 보장하므로, DB 왕복 지점만 이 느슨한
// 타입으로 캐스팅해 나머지 코드는 평소처럼 타입 체크를 받는다.
type LooseMasterTable = {
  insert: (
    row: Record<string, unknown>,
  ) => Promise<{ error: PostgrestErrorLike | null }>;
  update: (row: Record<string, unknown>) => {
    eq: (
      column: string,
      value: string,
    ) => Promise<{ error: PostgrestErrorLike | null }>;
  };
  delete: () => {
    eq: (
      column: string,
      value: string,
    ) => Promise<{ error: PostgrestErrorLike | null }>;
  };
};

function getMasterTable(
  supabase: SupabaseServerClient,
  entity: MasterCodeEntity,
): LooseMasterTable {
  return supabase.from(MASTER_TABLES[entity]) as unknown as LooseMasterTable;
}

const MASTER_TABLES: Record<MasterCodeEntity, TableName> = {
  company: "companies",
  brand: "brands",
  smallBrand: "small_brands",
  brandLine: "brand_lines",
  itemType: "item_types",
  item: "items",
  subItem: "sub_items",
  brandColorType: "brand_color_types",
  brandColor: "brand_colors",
  brandGenderSizeType: "brand_gender_size_types",
  brandGenderSize: "brand_gender_sizes",
  product: "products",
};

/** next_master_code(p_entity)는 snake_case 인자를 받는다 — code.ts의 camelCase 엔티티 키와는 별개 문자열이다. */
const DB_CODE_ENTITY: Record<MasterCodeEntity, string> = {
  company: "company",
  brand: "brand",
  smallBrand: "small_brand",
  brandLine: "brand_line",
  itemType: "item_type",
  item: "item",
  subItem: "sub_item",
  brandColorType: "brand_color_type",
  brandColor: "brand_color",
  brandGenderSizeType: "brand_gender_size_type",
  brandGenderSize: "brand_gender_size",
  product: "product",
};

export type MasterEntityInput = {
  name: string;
  sortOrder?: number;
  isActive?: boolean;
  note?: string | null;
  /** 등록 시에는 무시된다(자동 채번). 수정 시에만 관리자가 직접 코드를 바꿀 수 있다(PRD 6.1). */
  code?: string;
  // 분류/속성 축 부모 FK — 대상 엔티티에 해당하는 필드만 사용된다.
  companyId?: string;
  brandId?: string;
  smallBrandId?: string;
  itemTypeId?: string;
  itemId?: string;
  brandColorTypeId?: string;
  brandGenderSizeTypeId?: string;
  gender?: GenderValue;
  rgbHex?: string;
  // 상품(product) 전용 필드
  subItemId?: string;
  brandLineId?: string;
  brandColorId?: string;
  brandGenderSizeId?: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  season?: string | null;
  releaseYear?: number | null;
  material?: string | null;
  costPrice?: number | null;
  salePrice?: number | null;
  salesStatus?: SalesStatus | null;
};

/** 엔티티별 부모 FK/전용 필드를 snake_case DB 컬럼으로 변환한다. 공통 필드(code/name/sort_order 등)는 호출부에서 별도 처리. */
function buildEntityFields(
  entity: MasterCodeEntity,
  input: MasterEntityInput,
): Record<string, unknown> {
  switch (entity) {
    case "company":
      return {};
    case "brand":
      return { company_id: input.companyId };
    case "smallBrand":
    case "brandLine":
    case "brandColorType":
      return { brand_id: input.brandId };
    case "itemType":
      return { small_brand_id: input.smallBrandId };
    case "item":
      return { item_type_id: input.itemTypeId };
    case "subItem":
      return { item_id: input.itemId };
    case "brandColor":
      return {
        brand_color_type_id: input.brandColorTypeId,
        rgb_hex: input.rgbHex,
      };
    case "brandGenderSizeType":
      return { brand_id: input.brandId, gender: input.gender };
    case "brandGenderSize":
      return { brand_gender_size_type_id: input.brandGenderSizeTypeId };
    case "product":
      return {
        sub_item_id: input.subItemId,
        brand_line_id: input.brandLineId,
        brand_color_id: input.brandColorId,
        brand_gender_size_id: input.brandGenderSizeId,
        gender: input.gender,
        image_url: input.imageUrl,
        thumbnail_url: input.thumbnailUrl,
        season: input.season,
        release_year: input.releaseYear,
        material: input.material,
        cost_price: input.costPrice,
        sale_price: input.salePrice,
        sales_status: input.salesStatus,
      };
  }
}

/** 기준정보 11종은 관리자 전용, 상품은 로그인 사용자 전체 개방(Task 023 ③). */
async function guardEntity(entity: MasterCodeEntity): Promise<void> {
  if (entity === "product") {
    await getCurrentErpUser();
    return;
  }
  await requireAdmin();
}

function routeForEntity(entity: MasterCodeEntity): string {
  if (entity === "product") {
    return "/erp/products";
  }
  return MASTER_ENTITIES[entity as MasterEntityKey].route;
}

export async function createMasterAction(
  entity: MasterCodeEntity,
  input: MasterEntityInput,
): Promise<ActionResult & { code?: string }> {
  await guardEntity(entity);

  const name = input.name.trim();
  if (!name) {
    return { success: false, message: "이름을 입력해 주세요." };
  }

  const supabase = await createClient();

  const { data: code, error: codeError } = await supabase.rpc(
    "next_master_code",
    { p_entity: DB_CODE_ENTITY[entity] },
  );
  if (codeError || !code) {
    return { success: false, message: "코드 채번에 실패했습니다." };
  }

  const row = {
    code,
    name,
    sort_order: input.sortOrder ?? 0,
    is_active: input.isActive ?? true,
    note: input.note ?? null,
    ...buildEntityFields(entity, input),
  };

  const { error } = await getMasterTable(supabase, entity).insert(row);

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "이미 사용 중인 코드입니다." };
    }
    if (error.code === "23503") {
      return {
        success: false,
        message: "참조한 상위 데이터가 존재하지 않습니다.",
      };
    }
    return { success: false, message: "등록에 실패했습니다." };
  }

  revalidatePath(routeForEntity(entity));
  // MasterFormSheet(components/erp/master/*)가 등록 직후 자동 채번된 코드를
  // 토스트로 보여주기 위해(PRD 6.3 "저장 결과 표시") code를 함께 반환한다.
  return { success: true, code: code as string };
}

export async function updateMasterAction(
  entity: MasterCodeEntity,
  id: string,
  input: Partial<MasterEntityInput>,
): Promise<ActionResult> {
  await guardEntity(entity);

  const supabase = await createClient();

  const row: Record<string, unknown> = buildEntityFields(
    entity,
    input as MasterEntityInput,
  );
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      return { success: false, message: "이름을 입력해 주세요." };
    }
    row.name = name;
  }
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.isActive !== undefined) row.is_active = input.isActive;
  if (input.note !== undefined) row.note = input.note;
  if (input.code !== undefined) row.code = input.code;

  const { error } = await getMasterTable(supabase, entity)
    .update(row)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "이미 사용 중인 코드입니다." };
    }
    if (error.code === "23503") {
      return {
        success: false,
        message: "참조한 상위 데이터가 존재하지 않습니다.",
      };
    }
    return { success: false, message: "수정에 실패했습니다." };
  }

  revalidatePath(routeForEntity(entity));
  return { success: true };
}

/** 하위 참조가 있으면 FK restrict(23503)로 막힌다 — PRD 6.3: "사용여부 끄기"만 안내. */
export async function deleteMasterAction(
  entity: MasterCodeEntity,
  id: string,
): Promise<ActionResult> {
  await guardEntity(entity);

  const supabase = await createClient();
  const { error } = await getMasterTable(supabase, entity)
    .delete()
    .eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        success: false,
        message: "하위 데이터가 있어 삭제할 수 없습니다. 사용여부를 끄세요.",
      };
    }
    return { success: false, message: "삭제에 실패했습니다." };
  }

  revalidatePath(routeForEntity(entity));
  return { success: true };
}

export async function setMasterActiveAction(
  entity: MasterCodeEntity,
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  await guardEntity(entity);

  const supabase = await createClient();
  const { error } = await getMasterTable(supabase, entity)
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    return { success: false, message: "사용여부 변경에 실패했습니다." };
  }

  revalidatePath(routeForEntity(entity));
  return { success: true };
}

// --- 정렬순서 이동(SortOrderCell, components/erp/master/sort-order-cell.tsx 전용) ---
//
// lib/erp/actions.ts의 moveMenuAction(Task 016)과 동일한 "같은 부모의 형제만
// 조회 후 인접 형제와 sort_order를 교환"하는 방식을, 마스터 엔티티 11종(상품
// 제외 — 상품은 이 화면 대상이 아니다)에 일반화했다. 엔티티마다 "형제"를
// 가르는 컬럼 조합이 다르므로(예: 사이즈타입은 brand_id뿐 아니라 gender까지
// 같아야 형제) 단일 parent_id가 아니라 컬럼 목록으로 스코프를 정의한다.
const MASTER_SCOPE_COLUMNS: Record<MasterEntityKey, string[]> = {
  company: [],
  brand: ["company_id"],
  smallBrand: ["brand_id"],
  brandLine: ["brand_id"],
  itemType: ["small_brand_id"],
  item: ["item_type_id"],
  subItem: ["item_id"],
  brandColorType: ["brand_id"],
  brandColor: ["brand_color_type_id"],
  brandGenderSizeType: ["brand_id", "gender"],
  brandGenderSize: ["brand_gender_size_type_id"],
};

type LooseSelectResult = {
  data: Array<Record<string, unknown>> | null;
  error: PostgrestErrorLike | null;
};

// Supabase의 PostgrestFilterBuilder는 실제로는 thenable(PromiseLike)이지만,
// 이 파일 전반과 같은 이유(런타임에 결정되는 테이블명 하나로 11개 테이블을
// 분기)로 정적 타입과 근본적으로 맞지 않아 느슨한 타입으로 캐스팅한다.
type LooseSelectQuery = {
  eq: (column: string, value: unknown) => LooseSelectQuery;
  order: (column: string, opts: { ascending: boolean }) => LooseSelectQuery;
} & PromiseLike<LooseSelectResult>;

function selectMasterRows(
  supabase: SupabaseServerClient,
  entity: MasterEntityKey,
  columns: string,
): LooseSelectQuery {
  return supabase
    .from(MASTER_TABLES[entity])
    .select(columns) as unknown as LooseSelectQuery;
}

export async function moveMasterEntityAction(
  entity: MasterEntityKey,
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const scopeColumns = MASTER_SCOPE_COLUMNS[entity];
  const columns = ["id", "sort_order", ...scopeColumns].join(", ");

  const { data: targetRows, error: targetError } = await selectMasterRows(
    supabase,
    entity,
    columns,
  ).eq("id", id);

  const target = targetRows?.[0];
  if (targetError || !target) {
    return { success: false, message: "대상을 찾을 수 없습니다." };
  }

  let siblingsQuery = selectMasterRows(supabase, entity, columns).order(
    "sort_order",
    { ascending: true },
  );
  for (const column of scopeColumns) {
    siblingsQuery = siblingsQuery.eq(column, target[column]);
  }

  const { data: siblings, error: siblingsError } = await siblingsQuery;
  if (siblingsError || !siblings) {
    return { success: false, message: "형제 항목 조회에 실패했습니다." };
  }

  const index = siblings.findIndex((sibling) => sibling.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) {
    return { success: false, message: "더 이상 이동할 수 없습니다." };
  }

  const current = siblings[index];
  const swapTarget = siblings[swapIndex];

  const [{ error: currentError }, { error: swapError }] = await Promise.all([
    getMasterTable(supabase, entity)
      .update({ sort_order: swapTarget.sort_order })
      .eq("id", current.id as string),
    getMasterTable(supabase, entity)
      .update({ sort_order: current.sort_order })
      .eq("id", swapTarget.id as string),
  ]);

  if (currentError || swapError) {
    return { success: false, message: "정렬순서 변경에 실패했습니다." };
  }

  revalidatePath(MASTER_ENTITIES[entity].route);
  return { success: true };
}
