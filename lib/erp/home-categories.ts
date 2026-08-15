import { getMenuIcon, TOP_CATEGORY_NAMES } from "./menu-icons";

/**
 * 로그인 전 메인 화면(app/page.tsx)에 소개할 ERP 대분류 카테고리 아이콘.
 * 순서는 실 DB의 sort_order(0~14)와 동일하며, 다국어 텍스트는
 * lib/i18n/dictionaries/*.ts의 home.categories 배열이 같은 순서로 대응한다.
 * 아이콘 자체는 lib/erp/menu-icons.ts의 이름 기반 매핑을 그대로 재사용해
 * 로그인 후 메뉴(Menubar/트리)와 아이콘이 어긋나지 않게 한다.
 */
export const HOME_CATEGORY_ICONS = TOP_CATEGORY_NAMES.map((name) =>
  getMenuIcon(name, false),
);
