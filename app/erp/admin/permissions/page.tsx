// Task 017에서 실제 사용자 권한 관리 화면(사용자 선택 + 체크박스 트리)으로
// 교체된다. 현재는 app/erp/admin/layout.tsx의 관리자 가드를 검증하기 위한
// 최소 스텁이다.
export default function AdminPermissionsPage() {
  return (
    <div className="flex flex-1 flex-col gap-2 p-6">
      <h1 className="text-lg font-medium tracking-tight">사용자 권한 관리</h1>
      <p className="text-sm text-muted-foreground">
        Task 017에서 실제 사용자 권한 관리 화면이 구현됩니다.
      </p>
    </div>
  );
}
