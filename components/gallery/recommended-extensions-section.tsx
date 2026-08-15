"use client";

import * as React from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { FileDropzone } from "@/components/ui/file-dropzone";
import {
  KanbanBoard,
  type KanbanCard as KanbanCardType,
  type KanbanColumn,
} from "@/components/ui/kanban-board";
import { MultiSelect } from "@/components/ui/multi-select";
import { Rating } from "@/components/ui/rating";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { GallerySection } from "@/components/gallery/section";
import { TreeExtensionSection } from "@/components/gallery/tree-extension-section";

interface Payment {
  id: string;
  amount: number;
  status: "pending" | "processing" | "success" | "failed";
  email: string;
}

const paymentsData: Payment[] = [
  { id: "1", amount: 100000, status: "success", email: "kim@example.com" },
  { id: "2", amount: 25000, status: "processing", email: "lee@example.com" },
  { id: "3", amount: 480000, status: "success", email: "park@example.com" },
  { id: "4", amount: 12000, status: "failed", email: "choi@example.com" },
  { id: "5", amount: 68000, status: "pending", email: "jung@example.com" },
];

const statusLabel: Record<Payment["status"], string> = {
  pending: "대기",
  processing: "처리 중",
  success: "완료",
  failed: "실패",
};

const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "email",
    header: "이메일",
  },
  {
    accessorKey: "status",
    header: "상태",
    cell: ({ row }) => (
      <Badge variant="outline">
        {statusLabel[row.getValue<Payment["status"]>("status")]}
      </Badge>
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        className="-ml-3"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        금액
        <ArrowUpDown className="size-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">
        ₩{row.getValue<number>("amount").toLocaleString()}
      </div>
    ),
  },
];

const skillOptions = [
  { label: "React", value: "react" },
  { label: "Next.js", value: "nextjs" },
  { label: "TypeScript", value: "typescript" },
  { label: "Tailwind CSS", value: "tailwind" },
  { label: "Supabase", value: "supabase" },
];

const KANBAN_CARDS: Record<string, KanbanCardType> = {
  "task-1": { id: "task-1", title: "로그인 페이지 디자인" },
  "task-2": { id: "task-2", title: "API 명세 작성" },
  "task-3": { id: "task-3", title: "다크모드 버그 수정" },
  "task-4": { id: "task-4", title: "갤러리 페이지 배포" },
  "task-5": { id: "task-5", title: "코드 리뷰" },
};

const INITIAL_KANBAN_COLUMNS: KanbanColumn[] = [
  { id: "todo", title: "할 일", cardIds: ["task-1", "task-2"] },
  { id: "doing", title: "진행 중", cardIds: ["task-3"] },
  { id: "done", title: "완료", cardIds: ["task-4", "task-5"] },
];

export function RecommendedExtensionsSection() {
  const [skills, setSkills] = React.useState<string[]>(["react", "nextjs"]);
  const [rating, setRating] = React.useState(4);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>();
  const [files, setFiles] = React.useState<File[]>([]);
  const [kanbanColumns, setKanbanColumns] = React.useState(
    INITIAL_KANBAN_COLUMNS,
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        아래는 shadcn/ui 공식 갤러리에는 없지만 실무에서 자주 필요한 확장
        컴포넌트를 이 프로젝트에 맞게 직접 구현하거나 조합해 추가한 예시입니다.
      </p>

      <TreeExtensionSection />

      <GallerySection
        title="Data Table (TanStack Table)"
        description="정렬·페이지네이션을 지원하는 데이터 테이블. shadcn Table + @tanstack/react-table 조합으로 구현했습니다."
        contentClassName="w-full"
      >
        <DataTable columns={paymentColumns} data={paymentsData} />
      </GallerySection>

      <GallerySection
        title="Multi Select"
        description="여러 값을 태그로 선택하는 콤보박스. Command + Popover + Badge 조합으로 구현했습니다."
      >
        <div className="w-full max-w-sm">
          <MultiSelect
            options={skillOptions}
            selected={skills}
            onChange={setSkills}
            placeholder="기술 스택 선택"
          />
        </div>
      </GallerySection>

      <GallerySection title="Rating" description="별점 입력 컴포넌트">
        <Rating value={rating} onChange={setRating} />
        <span className="text-sm text-muted-foreground">{rating} / 5</span>
      </GallerySection>

      <GallerySection
        title="Date Range Picker"
        description="예약·통계 대시보드의 기간 필터에 자주 쓰이며, 이미 설치된 Calendar(mode=range) + Popover 조합으로 새 의존성 없이 구현했습니다."
      >
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </GallerySection>

      <GallerySection
        title="Rich Text Editor (Tiptap)"
        description="게시글·댓글 등 서식이 필요한 입력에 필요하지만 shadcn/ui 코어에는 없습니다. @tiptap/react + @tiptap/starter-kit으로 구현했습니다."
        contentClassName="w-full"
      >
        <RichTextEditor />
      </GallerySection>

      <GallerySection
        title="File Dropzone / Uploader"
        description="드래그 앤 드롭으로 파일을 업로드하는 영역. 별도 라이브러리 없이 네이티브 Drag & Drop API와 Attachment 컴포넌트로 구현했습니다."
        contentClassName="w-full"
      >
        <FileDropzone files={files} onChange={setFiles} />
      </GallerySection>

      <GallerySection
        title="Kanban Board (dnd-kit)"
        description="작업 관리형 화면에서 자주 필요하며 Card + @dnd-kit/core + @dnd-kit/sortable로 구현했습니다. 카드를 드래그해 컬럼 간 이동·정렬할 수 있습니다."
        contentClassName="w-full"
      >
        <KanbanBoard
          columns={kanbanColumns}
          cards={KANBAN_CARDS}
          onColumnsChange={setKanbanColumns}
        />
      </GallerySection>
    </div>
  );
}
