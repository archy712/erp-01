"use client";

import { Target } from "lucide-react";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { groupAchievement } from "./dashboard-data";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

export function GroupAchievementGauge({ dict }: { dict: Dictionary }) {
  const t = dict.erpHome.groupAchievement;

  const chartConfig = {
    value: { label: t.title, color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="size-4 text-muted-foreground" />
          {t.title}
        </CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-2">
        <ChartContainer config={chartConfig} className="mx-auto h-44 w-44">
          <RadialBarChart
            data={[
              {
                value: Math.min(groupAchievement.rate, 100),
                fill: "var(--color-value)",
              },
            ]}
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
              {groupAchievement.rate}%
            </text>
          </RadialBarChart>
        </ChartContainer>
        <p className="text-xs text-muted-foreground">
          {t.detail
            .replace("{actual}", groupAchievement.actual)
            .replace("{target}", groupAchievement.target)}
        </p>
      </CardContent>
    </Card>
  );
}
