// Task 016에서 실제 메뉴 관리 화면(트리 편집/등록/수정/삭제/정렬)으로
// 교체된다. 현재는 app/erp/admin/layout.tsx의 관리자 가드를 검증하기 위한
// 최소 스텁이다.
export default function AdminMenusPage() {
  return (
    <div className="flex flex-1 flex-col gap-2 p-6">
      <h1 className="text-lg font-medium tracking-tight">메뉴 관리</h1>
      <p className="text-sm text-muted-foreground">
        Task 016에서 실제 메뉴 관리 화면이 구현됩니다.
      </p>
    </div>
  );
}
