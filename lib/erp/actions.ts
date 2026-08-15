"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "./auth";

// 관리자 전용 Server Action 공용 규약.
//
// 이 파일의 모든 액션은 **첫 줄에서 requireAdmin()을 호출**해야 한다.
// 레이아웃 가드(app/erp/admin/layout.tsx, Task 014)와는 별개의 액션 레벨
// 이중 방어로, 가드를 우회한 직접 호출(엣지 케이스)도 차단하기 위함이다.
// (메뉴 CRUD — Task 016, 권한 부여/회수 — Task 017은 각 Task에서 이 파일에 채운다.)

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
