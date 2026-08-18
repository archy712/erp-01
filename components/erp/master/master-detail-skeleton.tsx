import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// 트리 행 스켈레톤이 전부 같은 너비면 어색해 보여서, 실제 명칭 길이 편차를
// 흉내내도록 폭을 몇 가지로 순환시킨다.
const TREE_ROW_WIDTHS = ["w-full", "w-5/6", "w-2/3", "w-4/5", "w-3/5"];

// components/erp/master/master-detail-layout.tsx(좌측 트리 + 우측 상세) 2분할
// 화면 4종(브랜드/컬러/상품분류/사이즈 관리, components/erp/master/*-manager.tsx)과
// 조직도 관리(components/erp/org/org-chart-view.tsx)가 공유하는 로딩
// 스켈레톤이다. 이 5개 화면 모두 자체적으로 PageHeader를 먼저 렌더링한 뒤
// MasterDetailLayout을 배치하므로, 이 스켈레톤도 PageHeader 형태를 포함한다.
//
// MasterDetailLayout은 lg 미만에서 트리를 Sheet(드로어)로 접고 react-resizable-panels로
// 드래그 리사이즈를 지원하지만, 둘 다 클라이언트에서만 계산 가능한 동작이라
// 로딩 상태에서는 흉내내지 않는다 — lg 이상에서만 좌우 2분할을 CSS만으로
// 단순하게 그리고, lg 미만에서는 우측 콘텐츠만 보여준다(실제 화면도 lg
// 미만에서는 트리가 기본적으로 숨겨진 Sheet라 콘텐츠만 보이는 것과 동일).
export function MasterDetailSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      {/* components/erp/page-header.tsx와 동일한 px-6 py-4 + border-b */}
      <div className="flex flex-col gap-1 border-b px-6 py-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* MasterDetailLayout의 lg 미만 드로어 트리거 버튼 자리 */}
      <div className="flex items-center gap-2 border-b p-3 lg:hidden">
        <Skeleton className="h-8 w-28" />
      </div>

      <div className="flex min-h-0 flex-1">
        {/* 좌측 트리 패널(기본 20% 폭, border-r) */}
        <div className="hidden w-1/5 min-w-48 flex-col border-r lg:flex">
          <div className="shrink-0 border-b px-3 py-2">
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex-1 space-y-2 p-2">
            <Skeleton className="h-8 w-full" />
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

        {/* 우측 상세 콘텐츠 — 선택 노드 브레드크럼/타이틀 + 카드형 폼 자리 */}
        <div className="min-w-0 flex-1 space-y-6 p-4 sm:p-6">
          <div className="space-y-2">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-3 rounded-md border p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div className="space-y-3 rounded-md border p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
