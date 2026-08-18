import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// app/erp/page.tsx의 ErpHomeContent 실제 레이아웃(PageHeader → KPI 카드 6개
// → 3열 그리드 차트 3개 → 전체폭 차트 → 2열 그리드 차트 2개짜리 그리드 2개
// → 전체폭 차트)과 그리드 구성·차트별 높이(h-44/h-72/h-80)를 그대로 맞춘
// 대시보드 로딩 스켈레톤. app/erp/loading.tsx(라우트 진입 시 prefetch되어
// 즉시 노출되는 fallback)와 app/erp/page.tsx의 Suspense fallback 양쪽에서
// 공유해서 쓴다 — 실제 콘텐츠가 스트리밍되어 들어올 때 레이아웃 시프트를
// 최소화하는 것이 목적이므로, 카드 개수/그리드 컬럼/차트 높이 클래스는
// 각 dashboard/*.tsx 컴포넌트와 항상 동기화해서 유지해야 한다.
//
// PasswordChangeBanner와 샘플 데이터 뱃지 줄은 조건부로 보이거나(비밀번호
// 변경 배너) 높이가 작아 시프트 영향이 미미해서 스켈레톤에서는 생략했다.
export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      {/* components/erp/page-header.tsx와 동일한 px-6 py-4 + border-b */}
      <div className="flex flex-col gap-1 border-b px-6 py-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-1 h-4 w-64" />
      </div>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* KpiSummary: grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <KpiCardSkeleton key={index} />
          ))}
        </div>

        {/* GroupAchievementGauge / CompanyAchievementChart / CompanyRevenueCompositionChart */}
        <div className="grid gap-4 lg:grid-cols-3">
          <ChartCardSkeleton chartHeightClassName="h-44" />
          <ChartCardSkeleton chartHeightClassName="h-72" />
          <ChartCardSkeleton chartHeightClassName="h-72" />
        </div>

        {/* RevenueProfitChart */}
        <ChartCardSkeleton chartHeightClassName="h-80" />

        {/* CustomerMetricsChart / BrandRevenueChart */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCardSkeleton chartHeightClassName="h-72" />
          <ChartCardSkeleton chartHeightClassName="h-72" />
        </div>

        {/* ChannelRevenueChart / CategoryRevenueChart */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCardSkeleton chartHeightClassName="h-72" />
          <ChartCardSkeleton chartHeightClassName="h-72" />
        </div>

        {/* WeeklyRevenueChart */}
        <ChartCardSkeleton chartHeightClassName="h-72" />
      </div>
    </div>
  );
}

// components/erp/dashboard/kpi-summary.tsx의 Card 한 장(라벨+아이콘 헤더,
// 값+증감 문구 콘텐츠)과 동일한 padding/gap 구조를 갖는 자리표시 카드.
function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="size-4 shrink-0 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  );
}

// dashboard/*.tsx의 Card(아이콘+타이틀, 설명 헤더 / ChartContainer 콘텐츠)와
// 동일한 구조. `chartHeightClassName`으로 각 차트의 ChartContainer 높이
// 클래스(h-44/h-72/h-80)를 그대로 전달받아 레이아웃 시프트를 없앤다.
function ChartCardSkeleton({
  chartHeightClassName,
}: {
  chartHeightClassName: string;
}) {
  return (
    <Card className="min-w-0">
      <CardHeader className="space-y-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </CardHeader>
      <CardContent>
        <Skeleton className={cn("w-full", chartHeightClassName)} />
      </CardContent>
    </Card>
  );
}
