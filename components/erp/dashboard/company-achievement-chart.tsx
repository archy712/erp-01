"use client";

import { Building2 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
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
import { companyAchievement } from "./dashboard-data";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

const maxRate = Math.max(...companyAchievement.map((entry) => entry.rate));
const data = companyAchievement;

function RankedBarLabel(props: {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  index?: number;
}) {
  const x = Number(props.x ?? 0);
  const y = Number(props.y ?? 0);
  const width = Number(props.width ?? 0);
  const height = Number(props.height ?? 0);
  const entry = data[props.index ?? 0];
  if (!entry) return null;

  return (
    <text
      x={x + width + 6}
      y={y + height / 2}
      dy={4}
      textAnchor="start"
      className="fill-foreground text-xs font-medium"
    >
      {entry.rate}%
    </text>
  );
}

export function CompanyAchievementChart({ dict }: { dict: Dictionary }) {
  const t = dict.erpHome.companyAchievement;

  const chartConfig = {
    rate: { label: t.valueLabel },
  } satisfies ChartConfig;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="size-4 text-muted-foreground" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 8, right: 40 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              domain={[0, Math.max(120, Math.ceil((maxRate * 1.15) / 10) * 10)]}
              tickLine={false}
              axisLine={false}
              unit="%"
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={76}
            />
            <ReferenceLine
              x={100}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="rate" radius={4} barSize={18}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
              <LabelList dataKey="rate" content={RankedBarLabel} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
