"use client";

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
import { dailyCustomerMetrics } from "./dashboard-data";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

export function CustomerMetricsChart({ dict }: { dict: Dictionary }) {
  const t = dict.erpHome.customerMetrics;

  const chartConfig = {
    count: { label: t.countLabel, color: "hsl(var(--chart-3))" },
    avgPrice: { label: t.priceLabel, color: "hsl(var(--chart-4))" },
  } satisfies ChartConfig;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>{t.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-72 w-full">
          <ComposedChart
            data={dailyCustomerMetrics}
            margin={{ top: 24, right: 8 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              yAxisId="count"
              domain={[0, (max: number) => Math.ceil((max * 1.4) / 100) * 100]}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <YAxis
              yAxisId="price"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(value: number) => `₩${value / 1000}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar
              yAxisId="count"
              dataKey="count"
              fill="var(--color-count)"
              radius={4}
              barSize={24}
            >
              <LabelList
                dataKey="count"
                position="insideTop"
                offset={8}
                className="fill-primary-foreground"
                fontSize={10}
              />
            </Bar>
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="avgPrice"
              stroke="var(--color-avgPrice)"
              strokeWidth={2}
              dot={{ r: 3 }}
            >
              <LabelList
                dataKey="avgPrice"
                content={(props) => (
                  <ChartPillLabel
                    {...props}
                    liftY={20}
                    hideBelowSm
                    valueFormatter={(value) =>
                      `₩${Math.round(Number(value) / 1000)}k`
                    }
                  />
                )}
              />
            </Line>
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
