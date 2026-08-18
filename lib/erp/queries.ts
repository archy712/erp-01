import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import { isAdminRole } from "./auth";
import { buildMenuTree } from "./menu-tree";
import type { MenuFlat, MenuLevel, MenuNode, UserRole } from "./types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

function toMenuFlat(row: Tables<"menus">): MenuFlat {
  return {
    id: row.id,
    parentId: row.parent_id,
    level: row.level as MenuLevel,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    icon: row.icon,
  };
}

async function fetchUserRole(
  supabase: SupabaseServerClient,
  userId: string,
): Promise<UserRole> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.role as UserRole | undefined) ?? "user";
}

/** 전체 메뉴를 평면 배열로 조회한다. `activeOnly`가 true면 is_active=true인 것만 반환한다(기본: 전체). */
export async function getAllMenus(options?: {
  activeOnly?: boolean;
}): Promise<MenuFlat[]> {
  const supabase = await createClient();

  let query = supabase
    .from("menus")
    .select("*")
    .order("sort_order", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data.map(toMenuFlat);
}

/**
 * 사용자가 실제로 볼 수 있는 메뉴 트리를 반환한다 (PRD 4.2).
 * 관리자는 활성 메뉴 전체 트리를, 일반 사용자는 권한이 부여된 메뉴 +
 * 그 조상 노드(경로 노출용)만 포함한 트리를 받는다. 비활성 메뉴(is_active=false)는
 * 관리자/일반 사용자 구분 없이 항상 제외한다 — 활성 관리는 Task 016 메뉴 관리 화면의 몫이다.
 *
 * `knownRole`을 넘기면(예: 이미 getCurrentErpUser()를 호출한 caller) profiles 재조회를 생략한다.
 */
export async function getVisibleMenuTree(
  userId: string,
  knownRole?: UserRole,
): Promise<MenuNode[]> {
  const supabase = await createClient();
  const role = knownRole ?? (await fetchUserRole(supabase, userId));

  const activeMenus = await getAllMenus({ activeOnly: true });

  if (isAdminRole(role)) {
    return buildMenuTree(activeMenus);
  }

  const { data: permissions, error } = await supabase
    .from("user_menu_permissions")
    .select("menu_id")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  const byId = new Map(activeMenus.map((menu) => [menu.id, menu]));
  const visibleIds = new Set<string>();

  for (const { menu_id: menuId } of permissions ?? []) {
    let current = byId.get(menuId);
    while (current && !visibleIds.has(current.id)) {
      visibleIds.add(current.id);
      current = current.parentId ? byId.get(current.parentId) : undefined;
    }
  }

  const visibleMenus = activeMenus.filter((menu) => visibleIds.has(menu.id));
  return buildMenuTree(visibleMenus);
}

export async function getMenuById(menuId: string): Promise<MenuFlat | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("menus")
    .select("*")
    .eq("id", menuId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? toMenuFlat(data) : null;
}

/** 루트(대분류)부터 대상 메뉴까지의 경로를 반환한다. 대상이 없으면 null. */
export async function getMenuBreadcrumb(
  menuId: string,
): Promise<MenuFlat[] | null> {
  const menus = await getAllMenus();
  const byId = new Map(menus.map((menu) => [menu.id, menu]));
  const target = byId.get(menuId);

  if (!target) {
    return null;
  }

  const path: MenuFlat[] = [];
  let current: MenuFlat | undefined = target;

  while (current) {
    path.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  return path;
}

export type ErpUserListItem = Pick<
  Tables<"profiles">,
  "id" | "email" | "name" | "role" | "is_active" | "avatar_key" | "created_at"
>;

/** 관리자 "사용자 관리" 화면(Task 015)용 전체 사용자 목록. */
export async function getUsers(): Promise<ErpUserListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, role, is_active, avatar_key, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export type DepartmentOption = Pick<Tables<"departments">, "id" | "name">;

/** 프로필 수정 화면의 부서 선택 목록용. 보관(archived_at)되지 않은 부서만 반환한다. */
export async function getDepartments(): Promise<DepartmentOption[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("departments")
    .select("id, name")
    .is("archived_at", null)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

/** 특정 사용자에게 명시적으로 부여된 메뉴 목록(Task 017 사용자 권한 관리 화면용). */
export async function getUserPermissions(userId: string): Promise<MenuFlat[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_menu_permissions")
    .select("menus(*)")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map((row) => row.menus)
    .filter((menu): menu is Tables<"menus"> => menu !== null)
    .map(toMenuFlat);
}
