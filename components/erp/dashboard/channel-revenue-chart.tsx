"use client";

import { Pie, PieChart } from "recharts";

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
import { channelRevenueRaw } from "./dashboard-data";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

const RADIAN = Math.PI / 180;

// 도넛 바깥에 라벨을 두면 카드 폭이 좁을 때 잘리므로, 링 중간 반지름에
// 흰색 텍스트로 비중(%)을 직접 그려 넣는다.
function DonutPercentLabel(props: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}) {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
  } = props;
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="middle"
      className="fill-white text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function ChannelRevenueChart({ dict }: { dict: Dictionary }) {
  const t = dict.erpHome.channelRevenue;

  const chartConfig = {
    value: { label: t.title },
    online: { label: t.online, color: "hsl(var(--chart-1))" },
    offline: { label: t.offline, color: "hsl(var(--chart-2))" },
    partner: { label: t.partner, color: "hsl(var(--chart-3))" },
  } satisfies ChartConfig;

  const data = channelRevenueRaw.map((entry) => ({
    channel: entry.channel,
    value: entry.revenue,
    fill: `var(--color-${entry.channel})`,
  }));

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent hideLabel nameKey="channel" />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="channel"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
              label={DonutPercentLabel}
              labelLine={false}
            />
            <ChartLegend content={<ChartLegendContent nameKey="channel" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
