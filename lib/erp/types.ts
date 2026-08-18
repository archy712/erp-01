export type MenuLevel = 1 | 2 | 3; // 1=대분류 2=중분류 3=소분류

export type MenuFlat = {
  id: string;
  parentId: string | null;
  level: MenuLevel;
  name: string;
  sortOrder: number;
  isActive: boolean;
  /** 관리자가 직접 고른 lucide-react 아이콘 이름. null이면 이름 기반
   * 자동 추천(getMenuIcon)을 쓴다(lib/erp/menu-icons.ts). */
  icon: string | null;
};

export type MenuNode = MenuFlat & {
  children: MenuNode[];
};

// profiles.role 체크 제약과 동일한 3단계. admin/superadmin 모두 ERP 관점에서는
// "관리자"로 취급한다(lib/erp/auth.ts의 isAdminRole 참고, docs/roadmap/ROADMAP_MVP.md Task 011).
export type UserRole = "user" | "admin" | "superadmin";

export type ErpUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  isActive: boolean;
};
