import { Suspense } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { AchievementGauges } from "@/components/erp/dashboard/achievement-gauges";
import { BrandRevenueChart } from "@/components/erp/dashboard/brand-revenue-chart";
import { CategoryRevenueChart } from "@/components/erp/dashboard/category-revenue-chart";
import { ChannelRevenueChart } from "@/components/erp/dashboard/channel-revenue-chart";
import { CustomerMetricsChart } from "@/components/erp/dashboard/customer-metrics-chart";
import { KpiSummary } from "@/components/erp/dashboard/kpi-summary";
import { RevenueProfitChart } from "@/components/erp/dashboard/revenue-profit-chart";
import { WeeklyRevenueChart } from "@/components/erp/dashboard/weekly-revenue-chart";
import { PasswordChangeBanner } from "@/components/erp/password-change-banner";
import { Badge } from "@/components/ui/badge";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

// 로그인 후 진입하는 ERP 메인 화면. 매출/손익/객수/객단가/브랜드·채널·카테고리별
// 매출 등 경영정보 대시보드를 카드+차트 형태로 보여준다. 여기 표시된 모든
// 수치는 레이아웃 확인용 더미 데이터이며(components/erp/dashboard/dashboard-data.ts),
// 실제 데이터 연동은 이번 MVP 범위 밖이다(PRD 9절 비범위).
export default function ErpHomePage() {
  return (
    <Suspense fallback={null}>
      <ErpHomeContent />
    </Suspense>
  );
}

async function ErpHomeContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        title={dict.erpHome.title}
        description={dict.erpHome.description}
      />

      <div className="flex flex-1 flex-col gap-6 p-6">
        <PasswordChangeBanner dict={dict} />

        <div className="flex items-center gap-2">
          <Badge variant="outline">{dict.erpHome.sampleDataBadge}</Badge>
          <span className="text-xs text-muted-foreground">
            {dict.erpHome.sampleDataNote}
          </span>
        </div>

        <KpiSummary dict={dict} />

        <RevenueProfitChart dict={dict} />

        <div className="grid gap-4 lg:grid-cols-2">
          <AchievementGauges dict={dict} />
          <CustomerMetricsChart dict={dict} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BrandRevenueChart dict={dict} />
          <ChannelRevenueChart dict={dict} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <CategoryRevenueChart dict={dict} />
          <WeeklyRevenueChart dict={dict} />
        </div>
      </div>
    </div>
  );
}
