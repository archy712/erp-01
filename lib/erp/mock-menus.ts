import type { MenuFlat } from "./types";

// Phase 1 레이아웃/내비게이션 검증용 하드코딩 데이터.
// `menus` 테이블이 생성되기 전까지 사용하며, Task 021에서 완전히 제거되고
// 실 DB 조회(`lib/erp/queries.ts`)로 대체된다.
export const MOCK_MENUS: MenuFlat[] = [
  // 마스터 관리 > 기본 관리 (MVP 핵심 — Task 014~017에서 실제 관리자 화면으로 연결)
  {
    id: "master",
    parentId: null,
    level: 1,
    name: "마스터 관리",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "master-basic",
    parentId: "master",
    level: 2,
    name: "기본 관리",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "master-basic-users",
    parentId: "master-basic",
    level: 3,
    name: "사용자 관리",
    sortOrder: 0,
    isActive: true,
  },
  {
    id: "master-basic-menus",
    parentId: "master-basic",
    level: 3,
    name: "메뉴 관리",
    sortOrder: 1,
    isActive: true,
  },
  {
    id: "master-basic-permissions",
    parentId: "master-basic",
    level: 3,
    name: "사용자 권한 관리",
    sortOrder: 2,
    isActive: true,
  },

  // 대분류 단독 노드 — 하위 없이도 리프로 정상 동작하는지 검증하는 케이스
  {
    id: "management-info",
    parentId: null,
    level: 1,
    name: "경영정보",
    sortOrder: 1,
    isActive: true,
  },
];
