"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { GallerySection } from "@/components/gallery/section";

const monthlyData = [
  { month: "1월", visitors: 186, signups: 80 },
  { month: "2월", visitors: 305, signups: 120 },
  { month: "3월", visitors: 237, signups: 98 },
  { month: "4월", visitors: 273, signups: 140 },
  { month: "5월", visitors: 209, signups: 110 },
  { month: "6월", visitors: 314, signups: 168 },
];

const trafficChartConfig = {
  visitors: { label: "방문자", color: "hsl(var(--chart-1))" },
  signups: { label: "가입자", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

const deviceData = [
  { device: "desktop", value: 4250, fill: "var(--color-desktop)" },
  { device: "mobile", value: 3120, fill: "var(--color-mobile)" },
  { device: "tablet", value: 980, fill: "var(--color-tablet)" },
];

const deviceChartConfig = {
  value: { label: "세션 수" },
  desktop: { label: "데스크톱", color: "hsl(var(--chart-1))" },
  mobile: { label: "모바일", color: "hsl(var(--chart-2))" },
  tablet: { label: "태블릿", color: "hsl(var(--chart-3))" },
} satisfies ChartConfig;

const skillData = [
  { skill: "기획", score: 86 },
  { skill: "개발", score: 92 },
  { skill: "디자인", score: 74 },
  { skill: "커뮤니케이션", score: 88 },
  { skill: "테스트", score: 80 },
];

const skillChartConfig = {
  score: { label: "역량 점수", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const satisfactionData = [
  { name: "매우 만족", value: 42, fill: "hsl(var(--chart-1))" },
  { name: "만족", value: 33, fill: "hsl(var(--chart-2))" },
  { name: "보통", value: 15, fill: "hsl(var(--chart-3))" },
  { name: "불만족", value: 10, fill: "hsl(var(--chart-4))" },
];

const satisfactionChartConfig = {
  value: { label: "응답 비율" },
  "매우 만족": { label: "매우 만족", color: "hsl(var(--chart-1))" },
  만족: { label: "만족", color: "hsl(var(--chart-2))" },
  보통: { label: "보통", color: "hsl(var(--chart-3))" },
  불만족: { label: "불만족", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig;

// 서버/클라이언트 렌더링 결과가 같아야 hydration 불일치가 발생하지 않으므로
// Math.random() 대신 인덱스 기반의 결정론적 의사 난수를 사용합니다.
function pseudoRandom(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

const scatterData = Array.from({ length: 24 }).map((_, i) => ({
  price: 10 + i * 3 + Math.round(pseudoRandom(i) * 20),
  rating: 3 + pseudoRandom(i + 100) * 2,
}));

const scatterChartConfig = {
  rating: { label: "평점", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

const CATEGORIES = [
  { key: "trend", label: "추세 & 시계열", count: 3 },
  { key: "proportion", label: "비율 & 구성비", count: 3 },
  { key: "comparison", label: "비교 & 상관관계", count: 2 },
];

export function ChartGallery() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <a
            key={category.key}
            href={`#chart-category-${category.key}`}
            className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
          >
            {category.label}{" "}
            <span className="text-muted-foreground/70">{category.count}</span>
          </a>
        ))}
      </div>

      <section
        id="chart-category-trend"
        className="flex scroll-mt-20 flex-col gap-4"
      >
        <h3 className="text-sm font-semibold text-muted-foreground">
          추세 & 시계열
        </h3>
        <GallerySection
          title="Bar Chart"
          description="월별 방문자 · 가입자 비교"
          contentClassName="h-72 w-full"
        >
          <ChartContainer config={trafficChartConfig} className="h-full w-full">
            <BarChart data={monthlyData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="visitors" fill="var(--color-visitors)" radius={4} />
              <Bar dataKey="signups" fill="var(--color-signups)" radius={4} />
            </BarChart>
          </ChartContainer>
        </GallerySection>

        <GallerySection
          title="Line Chart"
          description="추세를 선으로 표현"
          contentClassName="h-72 w-full"
        >
          <ChartContainer config={trafficChartConfig} className="h-full w-full">
            <ComposedChart data={monthlyData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="visitors"
                stroke="var(--color-visitors)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="signups"
                stroke="var(--color-signups)"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </ComposedChart>
          </ChartContainer>
        </GallerySection>

        <GallerySection
          title="Area Chart"
          description="누적 영역으로 방문자 추이 표현"
          contentClassName="h-72 w-full"
        >
          <ChartContainer config={trafficChartConfig} className="h-full w-full">
            <AreaChart data={monthlyData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                type="monotone"
                dataKey="signups"
                stackId="1"
                fill="var(--color-signups)"
                fillOpacity={0.4}
                stroke="var(--color-signups)"
              />
              <Area
                type="monotone"
                dataKey="visitors"
                stackId="1"
                fill="var(--color-visitors)"
                fillOpacity={0.4}
                stroke="var(--color-visitors)"
              />
            </AreaChart>
          </ChartContainer>
        </GallerySection>
      </section>

      <section
        id="chart-category-proportion"
        className="flex scroll-mt-20 flex-col gap-4"
      >
        <h3 className="text-sm font-semibold text-muted-foreground">
          비율 & 구성비
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <GallerySection
            title="Pie Chart"
            description="기기별 세션 비중"
            contentClassName="h-72 w-full"
          >
            <ChartContainer
              config={deviceChartConfig}
              className="h-full w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel nameKey="device" />}
                />
                <Pie data={deviceData} dataKey="value" nameKey="device" label />
              </PieChart>
            </ChartContainer>
          </GallerySection>

          <GallerySection
            title="Donut Chart"
            description="만족도 응답 비율"
            contentClassName="h-72 w-full"
          >
            <ChartContainer
              config={satisfactionChartConfig}
              className="h-full w-full"
            >
              <PieChart>
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel nameKey="name" />}
                />
                <Pie
                  data={satisfactionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </GallerySection>

          <GallerySection
            title="Radial Bar Chart"
            description="기기별 세션 수를 방사형 막대로 표현"
            contentClassName="h-72 w-full"
          >
            <ChartContainer
              config={deviceChartConfig}
              className="h-full w-full"
            >
              <RadialBarChart
                data={deviceData}
                innerRadius="30%"
                outerRadius="100%"
              >
                <ChartTooltip
                  content={<ChartTooltipContent hideLabel nameKey="device" />}
                />
                <RadialBar dataKey="value" background cornerRadius={6} />
                <ChartLegend
                  content={<ChartLegendContent nameKey="device" />}
                />
              </RadialBarChart>
            </ChartContainer>
          </GallerySection>
        </div>
      </section>

      <section
        id="chart-category-comparison"
        className="flex scroll-mt-20 flex-col gap-4"
      >
        <h3 className="text-sm font-semibold text-muted-foreground">
          비교 & 상관관계
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <GallerySection
            title="Radar Chart"
            description="역량 항목별 점수"
            contentClassName="h-72 w-full"
          >
            <ChartContainer config={skillChartConfig} className="h-full w-full">
              <RadarChart data={skillData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Radar
                  dataKey="score"
                  fill="var(--color-score)"
                  fillOpacity={0.5}
                  stroke="var(--color-score)"
                />
              </RadarChart>
            </ChartContainer>
          </GallerySection>

          <GallerySection
            title="Scatter Chart"
            description="가격과 평점의 상관관계"
            contentClassName="h-72 w-full"
          >
            <ChartContainer
              config={scatterChartConfig}
              className="h-full w-full"
            >
              <ScatterChart>
                <CartesianGrid />
                <XAxis
                  type="number"
                  dataKey="price"
                  name="가격"
                  tickLine={false}
                  axisLine={false}
                  unit="천원"
                />
                <YAxis
                  type="number"
                  dataKey="rating"
                  name="평점"
                  tickLine={false}
                  axisLine={false}
                  width={32}
                />
                <ZAxis range={[60, 60]} />
                <ChartTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={<ChartTooltipContent />}
                />
                <Scatter data={scatterData} fill="var(--color-rating)" />
              </ScatterChart>
            </ChartContainer>
          </GallerySection>
        </div>
      </section>
    </div>
  );
}
