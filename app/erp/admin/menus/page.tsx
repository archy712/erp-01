import { Suspense } from "react";

import { MenuManager } from "@/components/erp/admin/menu-manager";
import { getAllMenus } from "@/lib/erp/queries";

export default function AdminMenusPage() {
  return (
    <Suspense fallback={null}>
      <AdminMenusContent />
    </Suspense>
  );
}

// getAllMenus()가 cookies()를 쓰는 createClient()에 의존하므로 Suspense 경계
// 안에서만 호출한다 (cacheComponents: true, CLAUDE.md 참고). 관리 화면이므로
// activeOnly 옵션 없이 비활성 메뉴도 함께 조회한다.
async function AdminMenusContent() {
  const menus = await getAllMenus();

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-6 pt-6">
        <h1 className="text-lg font-medium tracking-tight">메뉴 관리</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          대/중/소분류 메뉴 트리를 등록·수정·삭제·정렬합니다.
        </p>
      </div>
      <MenuManager menus={menus} />
    </div>
  );
}
