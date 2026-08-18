import { Suspense } from "react";

import { OrgChartView } from "@/components/erp/org/org-chart-view";
import { MasterDetailSkeleton } from "@/components/erp/master/master-detail-skeleton";
import { getCurrentErpUser } from "@/lib/erp/auth";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";
import {
  getOrgChartMembers,
  getOrgLeaders,
  getOrgTree,
} from "@/lib/erp/org/queries";
import { createClient } from "@/lib/supabase/server";

export default function AdminOrgPage() {
  return (
    <Suspense fallback={<MasterDetailSkeleton />}>
      <AdminOrgContent />
    </Suspense>
  );
}

// app/erp/admin/layout.tsx의 requireAdmin() 가드를 그대로 상속받으므로 이
// 페이지에는 별도 접근 제어 코드가 없다. 아래 조회 함수들은 전부 cookies()를
// 쓰는 createClient()에 의존하므로(cacheComponents: true) Suspense 경계
// 안에서만 호출한다.
//
// getOrgTree()/getOrgChartMembers()/getCurrentErpUser()는 서로 의존관계가
// 없어 병렬로 조회하고, getOrgLeaders()는 리더 이름을 members 배열과 앱에서
// 매칭해야 해서 members 조회가 끝난 뒤에만 호출할 수 있다(lib/erp/org/queries.ts
// 주석 참고) — 그래도 각 함수는 정확히 1회씩만 호출된다.
//
// currentUserOrganizationId는 DB 함수 current_organization_id()(관리자
// 본인 소속 팀의 부문 id, 없으면 null)를 그대로 내려준다 — 편집 버튼 노출
// 여부를 클라이언트에서 "이 부문이 내 부문인가"로 판정하기 위함(Task 055/056).
// 최종 판정은 항상 서버 액션 + RLS가 한다(이 값은 UX 힌트일 뿐).
async function AdminOrgContent() {
  const supabase = await createClient();

  const [{ tree }, members, currentUser] = await Promise.all([
    getOrgTree(),
    getOrgChartMembers(),
    getCurrentErpUser(),
  ]);
  const leaders = await getOrgLeaders(members);

  const { data: currentUserOrganizationId } = await supabase.rpc(
    "current_organization_id",
  );

  const breadcrumb = getMenuPathForRoute("/erp/admin/org")?.slice(0, -1);

  return (
    <OrgChartView
      breadcrumb={breadcrumb}
      tree={tree}
      leaders={Array.from(leaders.values())}
      members={members}
      currentUserRole={currentUser.role}
      currentUserOrganizationId={currentUserOrganizationId ?? null}
    />
  );
}
