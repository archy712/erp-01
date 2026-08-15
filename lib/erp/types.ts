export type MenuLevel = 1 | 2 | 3; // 1=대분류 2=중분류 3=소분류

export type MenuFlat = {
  id: string;
  parentId: string | null;
  level: MenuLevel;
  name: string;
  sortOrder: number;
  isActive: boolean;
};

export type MenuNode = MenuFlat & {
  children: MenuNode[];
};

export type UserRole = "admin" | "user";

export type ErpUser = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
};
