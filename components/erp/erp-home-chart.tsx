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

// 레이아웃 확인용 더미 데이터. 실제 매출 데이터 연동은 이번 MVP 범위 밖이다
// (PRD 9절 비범위 — 대시보드 차트 위젯의 실 데이터 연동).
const monthlyDummyRevenue = [
  { month: "1월", revenue: 82 },
  { month: "2월", revenue: 94 },
  { month: "3월", revenue: 88 },
  { month: "4월", revenue: 101 },
  { month: "5월", revenue: 115 },
  { month: "6월", revenue: 128 },
];

const chartConfig = {
  revenue: { label: "매출(백만원)", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export function ErpHomeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>월별 매출 추이</CardTitle>
        <CardDescription>
          샘플 데이터입니다 — 실제 데이터 연동은 MVP 범위 밖입니다.
        </CardDescription>
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
