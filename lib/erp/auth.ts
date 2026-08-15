import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { ErpUser, UserRole } from "./types";

const ADMIN_ROLES: readonly UserRole[] = ["admin", "superadmin"];

/** DB의 public.is_admin()(role in ('admin','superadmin'))과 동일한 판정을 앱 레벨에서 미러링한다. */
export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/**
 * 현재 로그인 사용자를 확인하고 profiles에서 role/is_active를 조회한다.
 * 미인증이거나 profiles 행이 없으면 /auth/login으로 리다이렉트한다.
 * is_active=false인 계정은 인증(세션)은 유효해도 ERP 진입을 차단한다.
 *
 * cookies()를 사용하므로 이 함수를 호출하는 컴포넌트는 반드시 <Suspense> 경계
 * 안에 있어야 한다 (cacheComponents: true, CLAUDE.md 참고).
 */
export async function getCurrentErpUser(): Promise<ErpUser> {
  const supabase = await createClient();
  const { data: claims, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claims?.claims) {
    redirect("/auth/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, name, role, is_active")
    .eq("id", claims.claims.sub)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile || !profile.is_active) {
    redirect("/auth/login");
  }

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role as UserRole,
    isActive: profile.is_active,
  };
}

/**
 * 관리자 전용 화면/액션의 진입 가드. admin이 아니면 접근 거부 화면(/erp/forbidden)으로 보낸다.
 */
export async function requireAdmin(): Promise<ErpUser> {
  const user = await getCurrentErpUser();

  if (!isAdminRole(user.role)) {
    redirect("/erp/forbidden");
  }

  return user;
}

/**
 * 사용자가 특정 메뉴에 접근 가능한지 판정한다.
 * 관리자(admin/superadmin)는 무조건 true, 그 외에는 user_menu_permissions에
 * 명시적으로 부여된 경우에만 true.
 */
export async function canAccessMenu(
  userId: string,
  menuId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (profile && isAdminRole(profile.role as UserRole)) {
    return true;
  }

  const { data: permission, error: permissionError } = await supabase
    .from("user_menu_permissions")
    .select("id")
    .eq("user_id", userId)
    .eq("menu_id", menuId)
    .maybeSingle();

  if (permissionError) {
    throw permissionError;
  }

  return permission !== null;
}
