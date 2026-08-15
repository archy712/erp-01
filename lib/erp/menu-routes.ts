/**
 * 마스터 관리 > 기본 관리 하위 3개 소분류는 공용 MenuPlaceholder가 아니라
 * 실제 관리자 화면(Task 015~017)으로 연결된다. 메뉴 이름 경로("대>중>소")를
 * 키로 매칭하므로, 메뉴 데이터 소스가 Mock(`lib/erp/mock-menus.ts`)에서
 * 실 DB(Task 019 이후, ID가 UUID로 바뀜)로 전환되어도 매핑이 깨지지 않는다.
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
