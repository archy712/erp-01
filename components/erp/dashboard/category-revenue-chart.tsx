"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { categoryRevenue } from "./dashboard-data";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

const total = categoryRevenue.reduce((sum, entry) => sum + entry.revenue, 0);
const maxRevenue = Math.max(...categoryRevenue.map((entry) => entry.revenue));

function RankedBarLabel(props: {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  index?: number;
  data: { revenue: number; percent: number }[];
}) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const height = Number(props.height ?? 0);
  const entry = props.data[props.index ?? 0];
  if (!entry) return null;

  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      dy={4}
      textAnchor="start"
      className="fill-foreground text-xs font-medium"
    >
      {entry.revenue}
      <tspan className="fill-muted-foreground">
        {" "}
        ({entry.percent.toFixed(1)}%)
      </tspan>
    </text>
  );
}

export function CategoryRevenueChart({ dict }: { dict: Dictionary }) {
  const t = dict.erpHome.categoryRevenue;

  const categoryLabels: Record<
    (typeof categoryRevenue)[number]["category"],
    string
  > = {
    apparel: t.apparel,
    beauty: t.beauty,
    electronics: t.electronics,
    food: t.food,
    lifestyle: t.lifestyle,
  };

  const chartConfig = {
    revenue: { label: t.title, color: "hsl(var(--chart-5))" },
  } satisfies ChartConfig;

  // 매출 비중이 클수록 진하게, 작을수록 옅게 — 같은 색상(chart-5)의 명도만
  // 매출 점유율에 비례해 조절해 "차지하는 %가 클수록 진한 색"을 표현한다.
  const data = categoryRevenue.map((entry) => ({
    label: categoryLabels[entry.category],
    revenue: entry.revenue,
    percent: (entry.revenue / total) * 100,
    opacity: 0.35 + 0.65 * (entry.revenue / maxRevenue),
  }));

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 8, right: 48 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              domain={[0, (max: number) => Math.ceil(max * 1.25)]}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              width={64}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="revenue" radius={4} barSize={18}>
              {data.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={`hsl(var(--chart-5) / ${entry.opacity})`}
                />
              ))}
              <LabelList
                dataKey="revenue"
                content={(props) => <RankedBarLabel {...props} data={data} />}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
