import { InboxIcon } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { GallerySection } from "@/components/gallery/section";

export function LayoutSection() {
  return (
    <div className="flex flex-col gap-4">
      <GallerySection title="Separator" description="구분선">
        <div className="flex w-full flex-col gap-4">
          <p className="text-sm text-muted-foreground">위 콘텐츠</p>
          <Separator />
          <p className="text-sm text-muted-foreground">아래 콘텐츠</p>
        </div>
      </GallerySection>

      <GallerySection
        title="Aspect Ratio"
        description="비율을 고정한 미디어 영역"
      >
        <div className="w-64">
          <AspectRatio ratio={16 / 9} className="rounded-md bg-muted">
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              16 / 9
            </div>
          </AspectRatio>
        </div>
      </GallerySection>

      <GallerySection
        title="Resizable"
        description="드래그로 크기를 조절하는 패널"
      >
        <ResizablePanelGroup
          orientation="horizontal"
          className="h-40 w-full rounded-md border"
        >
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              패널 1
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              패널 2
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </GallerySection>

      <GallerySection title="Scroll Area" description="커스텀 스크롤바 영역">
        <ScrollArea className="h-32 w-full rounded-md border p-4">
          {Array.from({ length: 15 }).map((_, i) => (
            <p key={i} className="text-sm text-muted-foreground">
              스크롤 항목 {i + 1}
            </p>
          ))}
        </ScrollArea>
      </GallerySection>

      <GallerySection title="Collapsible" description="내용을 접고 펼치기">
        <Collapsible className="w-full max-w-sm">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              더 보기
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
            숨겨져 있던 콘텐츠가 펼쳐집니다.
          </CollapsibleContent>
        </Collapsible>
      </GallerySection>

      <GallerySection title="Accordion" description="여러 섹션을 접고 펼치기">
        <Accordion type="single" collapsible className="w-full max-w-sm">
          <AccordionItem value="item-1">
            <AccordionTrigger>이 스타터킷은 무엇인가요?</AccordionTrigger>
            <AccordionContent>
              Next.js 16과 Supabase Auth 기반의 스타터킷입니다.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>다크모드를 지원하나요?</AccordionTrigger>
            <AccordionContent>
              네, next-themes 기반 다크모드를 기본 지원합니다.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </GallerySection>

      <GallerySection title="Item" description="아이콘·설명이 있는 리스트 항목">
        <ItemGroup className="w-full max-w-md gap-2">
          <Item variant="outline">
            <ItemMedia variant="icon">
              <InboxIcon className="size-4" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>받은 편지함</ItemTitle>
              <ItemDescription>새 메시지 3개</ItemDescription>
            </ItemContent>
          </Item>
          <ItemSeparator />
          <Item variant="outline">
            <ItemMedia variant="icon">
              <InboxIcon className="size-4" />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>보관함</ItemTitle>
              <ItemDescription>128개 항목</ItemDescription>
            </ItemContent>
          </Item>
        </ItemGroup>
      </GallerySection>

      <GallerySection title="Empty" description="빈 상태 안내">
        <Empty className="w-full border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <InboxIcon className="size-6" />
            </EmptyMedia>
            <EmptyTitle>아직 데이터가 없습니다</EmptyTitle>
            <EmptyDescription>
              새 항목을 추가하면 여기에 표시됩니다.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm">새로 만들기</Button>
          </EmptyContent>
        </Empty>
      </GallerySection>
    </div>
  );
}
