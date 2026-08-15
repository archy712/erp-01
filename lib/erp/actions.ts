"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./auth";
import { getUserPermissions } from "./queries";
import type { MenuLevel } from "./types";

// 관리자 전용 Server Action 공용 규약.
//
// 이 파일의 모든 액션은 **첫 줄에서 requireAdmin()을 호출**해야 한다.
// 레이아웃 가드(app/erp/admin/layout.tsx, Task 014)와는 별개의 액션 레벨
// 이중 방어로, 가드를 우회한 직접 호출(엣지 케이스)도 차단하기 위함이다.

export type ActionResult =
  { success: true } | { success: false; message: string };

/** 사용자 활성/비활성 상태를 변경한다 (관리자 전용). 비활성화된 사용자는 getCurrentErpUser()에서 즉시 로그인 차단된다. */
export async function setUserActiveAction(
  userId: string,
  isActive: boolean,
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId);

  if (error) {
    return { success: false, message: "활성 상태 변경에 실패했습니다." };
  }

  revalidatePath("/erp/admin/users");
  return { success: true };
}

/**
 * 사용자의 관리자 권한을 부여/회수한다 (관리자 전용). user ↔ admin 전환만 다루며,
 * superadmin 승격/강등은 이 화면 범위 밖이다(DB 트리거가 admin이 아닌 상태에서
 * superadmin으로의 직접 승격 자체를 막는다).
 *
 * 자기 자신의 관리자 권한 회수는 여기서 직접 차단한다. 마지막 남은 관리자(admin+
 * superadmin 합산 1명) 강등은 DB 트리거(prevent_unauthorized_role_change)가 막으며,
 * 그 한국어 에러 메시지를 그대로 사용자에게 전달한다.
 */
export async function setUserAdminRoleAction(
  userId: string,
  makeAdmin: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  if (!makeAdmin && userId === admin.id) {
    return {
      success: false,
      message: "자기 자신의 관리자 권한은 회수할 수 없습니다.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: makeAdmin ? "admin" : "user" })
    .eq("id", userId);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/erp/admin/users");
  return { success: true };
}

export type MenuFormInput = {
  parentId: string | null;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

const MAX_MENU_LEVEL = 3;

/**
 * 메뉴를 등록한다 (관리자 전용). `parentId`가 null이면 대분류(level 1)로
 * 등록되고, 그렇지 않으면 상위 메뉴의 level+1로 자동 계산된다. 상위 메뉴가
 * 이미 3단계(소분류)면 등록을 거부한다.
 */
export async function createMenuAction(
  input: MenuFormInput,
): Promise<ActionResult> {
  await requireAdmin();

  const name = input.name.trim();
  if (!name) {
    return { success: false, message: "메뉴명을 입력해주세요." };
  }

  const supabase = await createClient();

  let level: MenuLevel = 1;
  if (input.parentId) {
    const { data: parent, error: parentError } = await supabase
      .from("menus")
      .select("level")
      .eq("id", input.parentId)
      .maybeSingle();

    if (parentError || !parent) {
      return { success: false, message: "상위 메뉴를 찾을 수 없습니다." };
    }
    if (parent.level >= MAX_MENU_LEVEL) {
      return {
        success: false,
        message: "메뉴는 최대 3단계(소분류)까지만 등록할 수 있습니다.",
      };
    }
    level = (parent.level + 1) as MenuLevel;
  }

  const { error } = await supabase.from("menus").insert({
    parent_id: input.parentId,
    level,
    name,
    sort_order: input.sortOrder,
    is_active: input.isActive,
  });

  if (error) {
    return { success: false, message: "메뉴 등록에 실패했습니다." };
  }

  revalidatePath("/erp", "layout");
  return { success: true };
}

/**
 * 메뉴를 수정한다 (관리자 전용). 이름/정렬순서/사용여부만 다루며, 상위 메뉴
 * 재배치(re-parenting)는 하위 노드의 level을 재귀적으로 재계산해야 해 이
 * 화면 범위 밖이다 — 메뉴를 옮기려면 삭제 후 재등록한다.
 */
export async function updateMenuAction(
  menuId: string,
  input: Pick<MenuFormInput, "name" | "sortOrder" | "isActive">,
): Promise<ActionResult> {
  await requireAdmin();

  const name = input.name.trim();
  if (!name) {
    return { success: false, message: "메뉴명을 입력해주세요." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("menus")
    .update({ name, sort_order: input.sortOrder, is_active: input.isActive })
    .eq("id", menuId);

  if (error) {
    return { success: false, message: "메뉴 수정에 실패했습니다." };
  }

  revalidatePath("/erp", "layout");
  return { success: true };
}

/** 메뉴 사용 여부를 변경한다 (관리자 전용). 비활성 메뉴는 내비게이션에서 제외된다. */
export async function setMenuActiveAction(
  menuId: string,
  isActive: boolean,
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("menus")
    .update({ is_active: isActive })
    .eq("id", menuId);

  if (error) {
    return { success: false, message: "사용 여부 변경에 실패했습니다." };
  }

  revalidatePath("/erp", "layout");
  return { success: true };
}

/**
 * 메뉴를 삭제한다 (관리자 전용). `menus.parent_id`/`user_menu_permissions.menu_id`
 * 모두 `on delete cascade`라 하위 메뉴와 부여된 권한이 함께 삭제된다(Task 012).
 */
export async function deleteMenuAction(menuId: string): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("menus").delete().eq("id", menuId);

  if (error) {
    return { success: false, message: "메뉴 삭제에 실패했습니다." };
  }

  revalidatePath("/erp", "layout");
  return { success: true };
}

/**
 * 같은 부모를 공유하는 형제 메뉴끼리 정렬순서를 한 칸 바꾼다 (관리자 전용).
 * `menus.sort_order`에는 유니크 제약이 없어(인덱스만 존재) 두 행을 병렬로
 * 갱신해도 충돌하지 않는다.
 */
export async function moveMenuAction(
  menuId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();

  const { data: target, error: targetError } = await supabase
    .from("menus")
    .select("id, parent_id, sort_order")
    .eq("id", menuId)
    .maybeSingle();

  if (targetError || !target) {
    return { success: false, message: "메뉴를 찾을 수 없습니다." };
  }

  const siblingsQuery = supabase
    .from("menus")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  const { data: siblings, error: siblingsError } = target.parent_id
    ? await siblingsQuery.eq("parent_id", target.parent_id)
    : await siblingsQuery.is("parent_id", null);

  if (siblingsError || !siblings) {
    return { success: false, message: "형제 메뉴 조회에 실패했습니다." };
  }

  const index = siblings.findIndex((sibling) => sibling.id === menuId);
  const swapIndex = direction === "up" ? index - 1 : index + 1;

  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) {
    return { success: false, message: "더 이상 이동할 수 없습니다." };
  }

  const current = siblings[index];
  const swapTarget = siblings[swapIndex];

  const [{ error: currentError }, { error: swapError }] = await Promise.all([
    supabase
      .from("menus")
      .update({ sort_order: swapTarget.sort_order })
      .eq("id", current.id),
    supabase
      .from("menus")
      .update({ sort_order: current.sort_order })
      .eq("id", swapTarget.id),
  ]);

  if (currentError || swapError) {
    return { success: false, message: "정렬 순서 변경에 실패했습니다." };
  }

  revalidatePath("/erp", "layout");
  return { success: true };
}

/**
 * 특정 사용자에게 현재 부여된 메뉴 id 목록을 조회한다 (관리자 전용).
 * `lib/erp/queries.ts`는 "use server" 액션 파일이 아니라 서버 컴포넌트 전용이라
 * 클라이언트 컴포넌트(사용자 선택 시 실시간 조회)에서 직접 호출할 수 없으므로,
 * 이 파일에 얇은 클라이언트 호출용 래퍼로 둔다.
 */
export async function getUserMenuPermissionIdsAction(
  userId: string,
): Promise<string[]> {
  await requireAdmin();

  const permissions = await getUserPermissions(userId);
  return permissions.map((menu) => menu.id);
}

/**
 * 특정 사용자에게 부여된 메뉴 권한을 통째로 교체한다 (관리자 전용).
 * `menuIds`가 최종 상태이며, 기존 권한과 비교한 추가분 insert/제거분 delete를
 * `public.set_user_menu_permissions()` RPC 한 번의 호출로 원자적으로 처리한다
 * (postgres 함수 실행 전체가 하나의 트랜잭션이라 부분 반영이 없다).
 * RPC 내부에서도 `is_admin()`을 재확인하므로 이 액션의 `requireAdmin()`과 이중 방어된다.
 */
export async function setUserMenuPermissionsAction(
  userId: string,
  menuIds: string[],
): Promise<ActionResult> {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_user_menu_permissions", {
    p_user_id: userId,
    p_menu_ids: menuIds,
  });

  if (error) {
    return { success: false, message: "권한 저장에 실패했습니다." };
  }

  revalidatePath("/erp", "layout");
  return { success: true };
}
