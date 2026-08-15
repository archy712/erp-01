"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GallerySection } from "@/components/gallery/section";

const invoices = [
  { invoice: "INV001", status: "완료", method: "카드", amount: "₩250,000" },
  { invoice: "INV002", status: "대기", method: "계좌이체", amount: "₩150,000" },
  { invoice: "INV003", status: "미결제", method: "카드", amount: "₩350,000" },
];

const chartData = [
  { month: "1월", visitors: 186 },
  { month: "2월", visitors: 305 },
  { month: "3월", visitors: 237 },
  { month: "4월", visitors: 273 },
  { month: "5월", visitors: 209 },
  { month: "6월", visitors: 314 },
];

const chartConfig = {
  visitors: {
    label: "방문자",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function DataDisplaySection() {
  return (
    <div className="flex flex-col gap-4">
      <GallerySection title="Table" description="정형 데이터 표시">
        <Table>
          <TableCaption>최근 발행된 인보이스 목록입니다.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>인보이스</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>결제수단</TableHead>
              <TableHead className="text-right">금액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.invoice}>
                <TableCell>{invoice.invoice}</TableCell>
                <TableCell>{invoice.status}</TableCell>
                <TableCell>{invoice.method}</TableCell>
                <TableCell className="text-right">{invoice.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </GallerySection>

      <GallerySection title="Avatar" description="사용자 아바타">
        <Avatar>
          <AvatarFallback>SK</AvatarFallback>
        </Avatar>
        <Avatar size="lg">
          <AvatarFallback>V3</AvatarFallback>
          <AvatarBadge />
        </Avatar>
        <AvatarGroup>
          <Avatar>
            <AvatarFallback>A</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>B</AvatarFallback>
          </Avatar>
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
      </GallerySection>

      <GallerySection title="Chart" description="recharts 기반 차트">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="visitors" fill="var(--color-visitors)" radius={4} />
          </BarChart>
        </ChartContainer>
      </GallerySection>

      <GallerySection title="Carousel" description="좌우로 넘기는 콘텐츠">
        <Carousel className="w-full max-w-xs">
          <CarouselContent>
            {Array.from({ length: 5 }).map((_, i) => (
              <CarouselItem key={i}>
                <div className="flex h-32 items-center justify-center rounded-md border text-2xl font-semibold">
                  {i + 1}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </GallerySection>
    </div>
  );
}
