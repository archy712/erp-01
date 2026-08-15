"use client";

import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

// 레이아웃 확인용 더미 데이터. 실제 매출 데이터 연동은 이번 MVP 범위 밖이다
// (PRD 9절 비범위 — 대시보드 차트 위젯의 실 데이터 연동). 월 순서만 의미가
// 있어 월 이름 자체는 다국어 처리 없이 숫자로 표기한다.
const monthlyDummyRevenue = [
  { month: "1", revenue: 82 },
  { month: "2", revenue: 94 },
  { month: "3", revenue: 88 },
  { month: "4", revenue: 101 },
  { month: "5", revenue: 115 },
  { month: "6", revenue: 128 },
];

export function ErpHomeChart({ dict }: { dict: Dictionary }) {
  const chartConfig = {
    revenue: {
      label: dict.erpHome.chartRevenueLabel,
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{dict.erpHome.chartTitle}</CardTitle>
        <CardDescription>{dict.erpHome.chartDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <LineChart data={monthlyDummyRevenue}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
