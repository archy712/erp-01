import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import type { UserRole } from "./types";

// 서버 전용 코드(next/headers 등)를 전혀 임포트하지 않는 순수 모듈이라
// 클라이언트 컴포넌트에서도 안전하게 가져올 수 있다. lib/erp/auth.ts가
// isAdminRole()을 이 파일에서 재수출해 서버 쪽 호출부(queries.ts 등)의
// 기존 `import { isAdminRole } from "./auth"`는 그대로 유지된다.

const ADMIN_ROLES: readonly UserRole[] = ["admin", "superadmin"];

/** DB의 public.is_admin()(role in ('admin','superadmin'))과 동일한 판정을 앱 레벨에서 미러링한다. */
export function isAdminRole(role: UserRole): boolean {
  return ADMIN_ROLES.includes(role);
}

/** 역할 배지/셀렉트 등에 쓰는 다국어 라벨. dict.roles(4개 언어)를 그대로 매핑한다. */
export function getRoleLabel(role: UserRole, dict: Dictionary): string {
  return dict.roles[role];
}

export const ROLE_BADGE_VARIANT: Record<
  UserRole,
  "outline" | "secondary" | "default"
> = {
  user: "outline",
  admin: "secondary",
  superadmin: "default",
};
