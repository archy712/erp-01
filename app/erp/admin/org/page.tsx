import { Construction } from "lucide-react";
import { Suspense } from "react";

import { PageHeader } from "@/components/erp/page-header";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { getMenuPathForRoute } from "@/lib/erp/menu-routes";

export default function AdminOrgPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrgContent />
    </Suspense>
  );
}

// app/erp/admin/layout.tsx의 requireAdmin() 가드를 그대로 상속받으므로 이
// 페이지에는 별도 접근 제어 코드가 없다. 실제 트리/리더 패널은 Task 053에서
// 채운다.
async function AdminOrgContent() {
  const breadcrumb = getMenuPathForRoute("/erp/admin/org")?.slice(0, -1);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title="조직도 관리" />
      <Empty className="flex-1 border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Construction />
          </EmptyMedia>
          <EmptyDescription>Task 053에서 구현됩니다.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
