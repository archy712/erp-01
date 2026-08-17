/**
 * 마스터 관리 > 기본 관리 하위 3개 소분류(Task 015~017)와 마스터 관리 >
 * 기준정보 관리 하위 5개 소분류 + 상품 관리(Task 031~)는 공용 MenuPlaceholder가
 * 아니라 실제 화면으로 연결된다. 메뉴 이름 경로("대>중>소")를 키로 매칭하므로,
 * Mock 데이터 시절부터 실 DB(Task 019 이후, ID가 UUID로 바뀜) 전환을 거치는
 * 동안에도 매핑이 깨지지 않는다.
 *
 * 이름은 원래 "관리자 전용" 화면만 담아 ADMIN_MENU_ROUTES였지만, Task 031에서
 * 하드 게이트가 걸리지 않는 상품 관리(`/erp/products`)까지 추가되어 더 이상
 * "관리자 전용"만 담는 매핑이 아니다 — 그래서 MENU_ROUTES로 개명했다. 실제
 * 접근 통제는 각 라우트가 속한 세그먼트(`app/erp/master/layout.tsx`의
 * `requireAdmin()` 또는 `app/erp/menu/[menuId]/page.tsx`의 `canAccessMenu()`)가
 * 담당하며, 이 파일은 순수하게 메뉴 이름 ↔ 라우트 매핑만 갖는다.
 */
const MENU_ROUTES: Record<string, string> = {
  "마스터 관리>기본 관리>사용자 관리": "/erp/admin/users",
  "마스터 관리>기본 관리>메뉴 관리": "/erp/admin/menus",
  "마스터 관리>기본 관리>사용자 권한 관리": "/erp/admin/permissions",
  "마스터 관리>기본 관리>조직도 관리": "/erp/admin/org",
  "마스터 관리>기준정보 관리>법인 관리": "/erp/master/companies",
  "마스터 관리>기준정보 관리>브랜드 관리": "/erp/master/brands",
  "마스터 관리>기준정보 관리>상품 분류 관리": "/erp/master/item-categories",
  "마스터 관리>기준정보 관리>컬러 관리": "/erp/master/colors",
  "마스터 관리>기준정보 관리>사이즈 관리": "/erp/master/sizes",
  "마스터 관리>상품 관리>상품 관리": "/erp/products",
};

/** breadcrumb(대→중→소 이름 경로)에 대응하는 실제 라우트가 있으면 반환한다. */
export function getRouteForMenuPath(names: string[]): string | undefined {
  return MENU_ROUTES[names.join(">")];
}

/**
 * 실제 라우트(예: "/erp/admin/users", "/erp/master/companies")에 대응하는
 * 메뉴 이름 경로(대→중→소)를 반환한다. PageHeader의 브레드크럼은 실제 menus
 * 테이블을 다시 조회하지 않고 이 정적 매핑을 그대로 재사용한다 — 어차피
 * 메뉴명 자체는 다국어화 범위 밖이라(menu-placeholder.tsx 참고) DB 왕복
 * 없이도 항상 최신 표시 이름과 같다.
 */
export function getMenuPathForRoute(route: string): string[] | undefined {
  const entry = Object.entries(MENU_ROUTES).find(
    ([, mappedRoute]) => mappedRoute === route,
  );
  return entry?.[0].split(">");
}
