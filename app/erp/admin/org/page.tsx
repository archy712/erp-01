import { Suspense } from "react";

import { OrgChartView } from "@/components/erp/org/org-chart-view";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";
import {
  getOrgChartMembers,
  getOrgLeaders,
  getOrgTree,
} from "@/lib/erp/org/queries";

export default function AdminOrgPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrgContent />
    </Suspense>
  );
}

// app/erp/admin/layout.tsx의 requireAdmin() 가드를 그대로 상속받으므로 이
// 페이지에는 별도 접근 제어 코드가 없다. 아래 조회 함수들은 전부 cookies()를
// 쓰는 createClient()에 의존하므로(cacheComponents: true) Suspense 경계
// 안에서만 호출한다.
//
// getOrgTree()/getOrgChartMembers()는 서로 의존관계가 없어 병렬로 조회하고,
// getOrgLeaders()는 리더 이름을 members 배열과 앱에서 매칭해야 해서
// members 조회가 끝난 뒤에만 호출할 수 있다(lib/erp/org/queries.ts 주석
// 참고) — 그래도 세 함수 각각은 정확히 1회씩만 호출된다.
async function AdminOrgContent() {
  const [{ tree }, members] = await Promise.all([
    getOrgTree(),
    getOrgChartMembers(),
  ]);
  const leaders = await getOrgLeaders(members);

  const breadcrumb = getMenuPathForRoute("/erp/admin/org")?.slice(0, -1);

  return (
    <OrgChartView
      breadcrumb={breadcrumb}
      tree={tree}
      leaders={Array.from(leaders.values())}
      members={members}
    />
  );
}
