import { Skeleton } from "@/components/ui/skeleton";

// components/erp/menu-placeholder.tsx(브레드크럼+타이틀 PageHeader + 가운데
// Empty 안내 카드)와 동일한 자리를 차지하는 로딩 스켈레톤.
// app/erp/menu/[menuId]/page.tsx 전용.
export function MenuPlaceholderSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      {/* components/erp/page-header.tsx와 동일한 px-6 py-4 + border-b */}
      <div className="flex flex-col gap-1 border-b px-6 py-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Empty 컴포넌트 중앙 정렬 아이콘+설명+뱃지 자리 */}
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <Skeleton className="size-10 rounded-full" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  );
}
