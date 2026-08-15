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
import { monthlyFinance } from "./dashboard-data";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

export function RevenueProfitChart({ dict }: { dict: Dictionary }) {
  const t = dict.erpHome.revenueProfit;

  const chartConfig = {
    revenue: { label: t.revenueLabel, color: "hsl(var(--chart-1))" },
    profit: { label: t.profitLabel, color: "hsl(var(--chart-2))" },
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
          <ComposedChart data={monthlyFinance}>
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
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={4}
              barSize={20}
            >
              <LabelList
                dataKey="revenue"
                position="top"
                className="hidden fill-foreground sm:block"
                fontSize={10}
              />
            </Bar>
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
