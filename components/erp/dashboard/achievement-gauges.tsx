"use client";

import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { achievementGauges } from "./dashboard-data";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

function Gauge({
  label,
  rate,
  detail,
  color,
}: {
  label: string;
  rate: number;
  detail: string;
  color: string;
}) {
  const chartConfig = {
    value: { label, color },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-col items-center gap-2">
      <ChartContainer config={chartConfig} className="mx-auto h-44 w-44">
        <RadialBarChart
          data={[{ value: Math.min(rate, 100), fill: "var(--color-value)" }]}
          innerRadius="70%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <RadialBar dataKey="value" background cornerRadius={12} />
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-2xl font-bold"
          >
            {rate}%
          </text>
        </RadialBarChart>
      </ChartContainer>
      <div className="text-center">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

export function AchievementGauges({ dict }: { dict: Dictionary }) {
  const t = dict.erpHome.achievement;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 sm:grid-cols-2">
        <Gauge
          label={t.dailyLabel}
          rate={achievementGauges.daily.rate}
          detail={t.detail
            .replace("{actual}", achievementGauges.daily.actual)
            .replace("{target}", achievementGauges.daily.target)}
          color="hsl(var(--chart-1))"
        />
        <Gauge
          label={t.monthlyLabel}
          rate={achievementGauges.monthly.rate}
          detail={t.detail
            .replace("{actual}", achievementGauges.monthly.actual)
            .replace("{target}", achievementGauges.monthly.target)}
          color="hsl(var(--chart-2))"
        />
      </CardContent>
    </Card>
  );
}
