"use client";

import { LineChart } from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  LabelList,
  Line,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartPillLabel } from "./chart-pill-label";
import { companies, monthlyRevenueByCompany } from "./dashboard-data";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

// 매출 막대 위에 법인별 실적 합계(=그룹 전체 매출)를 그대로 노출하기 위한
// 라벨. 스택의 맨 위 법인(Bar)에 붙여, 각 세그먼트 값이 아니라 해당 월의
// 그룹 전체 매출(payload.revenue)을 읽어 표시한다.
function TotalRevenueLabel(props: {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  payload?: { revenue?: number };
}) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const total = props.payload?.revenue;
  if (total == null) return null;

  return (
    <text
      x={x + width / 2}
      y={y - 6}
      textAnchor="middle"
      className="hidden fill-foreground text-[10px] sm:block"
    >
      {total}
    </text>
  );
}

export function RevenueProfitChart({ dict }: { dict: Dictionary }) {
  const t = dict.erpHome.revenueProfit;

  const chartConfig = {
    profit: { label: t.profitLabel, color: "hsl(var(--foreground))" },
    ...Object.fromEntries(
      companies.map((company) => [
        company.name,
        { label: company.name, color: company.color },
      ]),
    ),
  } satisfies ChartConfig;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChart className="size-4 text-muted-foreground" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ComposedChart data={monthlyRevenueByCompany}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            {companies.map((company, index) => {
              const isTop = index === companies.length - 1;
              return (
                <Bar
                  key={company.name}
                  dataKey={company.name}
                  stackId="revenue"
                  fill={company.color}
                  radius={isTop ? [4, 4, 0, 0] : 0}
                  barSize={20}
                >
                  {isTop ? <LabelList content={TotalRevenueLabel} /> : null}
                </Bar>
              );
            })}
            <Line
              type="monotone"
              dataKey="profit"
              stroke="var(--color-profit)"
              strokeWidth={2}
              dot={{ r: 3 }}
            >
              <LabelList
                dataKey="profit"
                content={(props) => <ChartPillLabel {...props} hideBelowSm />}
              />
            </Line>
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
