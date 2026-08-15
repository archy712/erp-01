import {
  Percent,
  Receipt,
  Target,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dashboardKpi } from "./dashboard-data";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

// "{value}" 자리표시자를 기준으로 템플릿을 앞/뒤로 나눠, 증감값만 색상을
// 입힌 뱃지로 렌더링할 수 있게 한다.
function ChangeLine({ template, value }: { template: string; value: string }) {
  const [before, after] = template.split("{value}");
  const isPositive = value.startsWith("+");

  return (
    <p className="mt-1 text-xs text-muted-foreground">
      {before}
      <span
        className={cn(
          "font-medium",
          isPositive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400",
        )}
      >
        {value}
      </span>
      {after}
    </p>
  );
}

export function KpiSummary({ dict }: { dict: Dictionary }) {
  const kpi = dict.erpHome.kpi;

  const cards = [
    {
      label: kpi.revenueToday,
      value: dashboardKpi.revenueToday,
      changeTemplate: kpi.vsYesterday,
      changeValue: dashboardKpi.revenueTodayChange,
      icon: Wallet,
    },
    {
      label: kpi.revenueMonth,
      value: dashboardKpi.revenueMonth,
      changeTemplate: kpi.vsLastMonth,
      changeValue: dashboardKpi.revenueMonthChange,
      icon: TrendingUp,
    },
    {
      label: kpi.customerCount,
      value: dashboardKpi.customerCount,
      changeTemplate: kpi.vsYesterday,
      changeValue: dashboardKpi.customerCountChange,
      icon: Users,
    },
    {
      label: kpi.customerPrice,
      value: dashboardKpi.customerPrice,
      changeTemplate: kpi.vsYesterday,
      changeValue: dashboardKpi.customerPriceChange,
      icon: Receipt,
    },
    {
      label: kpi.achievementRate,
      value: dashboardKpi.monthlyAchievementRate,
      changeTemplate: null,
      changeValue: null,
      icon: Target,
    },
    {
      label: kpi.operatingMargin,
      value: dashboardKpi.operatingMargin,
      changeTemplate: null,
      changeValue: null,
      icon: Percent,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(
        ({ label, value, changeTemplate, changeValue, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className="size-4 shrink-0 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl">{value}</CardTitle>
              {changeTemplate && changeValue ? (
                <ChangeLine template={changeTemplate} value={changeValue} />
              ) : null}
            </CardContent>
          </Card>
        ),
      )}
    </div>
  );
}
