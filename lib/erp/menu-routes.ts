/**
 * 마스터 관리 > 기본 관리 하위 3개 소분류는 공용 MenuPlaceholder가 아니라
 * 실제 관리자 화면(Task 015~017)으로 연결된다. 메뉴 이름 경로("대>중>소")를
 * 키로 매칭하므로, Mock 데이터 시절부터 실 DB(Task 019 이후, ID가 UUID로
 * 바뀜) 전환을 거치는 동안에도 매핑이 깨지지 않는다.
 */
const ADMIN_MENU_ROUTES: Record<string, string> = {
  "마스터 관리>기본 관리>사용자 관리": "/erp/admin/users",
  "마스터 관리>기본 관리>메뉴 관리": "/erp/admin/menus",
  "마스터 관리>기본 관리>사용자 권한 관리": "/erp/admin/permissions",
};

/** breadcrumb(대→중→소 이름 경로)에 대응하는 관리자 라우트가 있으면 반환한다. */
export function getAdminRouteForMenuPath(names: string[]): string | undefined {
  return ADMIN_MENU_ROUTES[names.join(">")];
}

/**
 * 관리자 라우트(예: "/erp/admin/users")에 대응하는 메뉴 이름 경로(대→중→소)를
 * 반환한다. PageHeader의 브레드크럼은 실제 menus 테이블을 다시 조회하지 않고
 * 이 정적 매핑을 그대로 재사용한다 — 어차피 메뉴명 자체는 다국어화 범위 밖이라
 * (menu-placeholder.tsx 참고) DB 왕복 없이도 항상 최신 표시 이름과 같다.
 */
export function getMenuPathForAdminRoute(route: string): string[] | undefined {
  const entry = Object.entries(ADMIN_MENU_ROUTES).find(
    ([, adminRoute]) => adminRoute === route,
  );
  return entry?.[0].split(">");
}
