import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// 트리 행 스켈레톤이 전부 같은 너비면 어색해 보여서, 실제 메뉴명 길이 편차를
// 흉내내도록 폭을 몇 가지로 순환시킨다.
const TREE_ROW_WIDTHS = ["w-full", "w-5/6", "w-2/3", "w-4/5", "w-3/5"];

// components/erp/admin/menu-manager.tsx는 목록형이 아니라 좌측 메뉴 트리
// (w-72 카드) + 우측 상세 카드(선택된 메뉴 정보·이동/추가/삭제 버튼)로 구성된
// 2분할 화면이다(app/erp/admin/menus/page.tsx가 PageHeader를 별도로 렌더링한
// 뒤 그 아래에 MenuManager 전체를 배치). "flex flex-1 flex-col gap-4 p-6
// lg:flex-row"와 각 패널의 "rounded-md border" 형태를 그대로 맞춘 로딩
// 스켈레톤이다.
export function MenuManagerSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      {/* components/erp/page-header.tsx와 동일한 px-6 py-4 + border-b */}
      <div className="flex flex-col gap-1 border-b px-6 py-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6 lg:flex-row">
        {/* 좌측 메뉴 트리 카드 */}
        <div className="flex w-full shrink-0 flex-col gap-3 rounded-md border p-3 lg:w-72">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton
                key={index}
                className={cn(
                  "h-6",
                  TREE_ROW_WIDTHS[index % TREE_ROW_WIDTHS.length],
                )}
              />
            ))}
          </div>
        </div>

        {/* 우측 선택된 메뉴 상세 카드 */}
        <div className="min-w-0 flex-1 rounded-md border p-4">
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-8 w-20" />
              ))}
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-9 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
