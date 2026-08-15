"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  ListOrderedIcon,
  StrikethroughIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";

interface RichTextEditorProps {
  content?: string;
  onChange?: (html: string) => void;
  className?: string;
}

export function RichTextEditor({
  content = "<p>여기에 내용을 입력하세요.</p>",
  onChange,
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-32 px-3 py-2 text-sm focus:outline-none",
          "[&_p]:mb-2 [&_p:last-child]:mb-0",
          "[&_strong]:font-bold [&_em]:italic [&_s]:line-through",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
        ),
      },
    },
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className={cn("w-full rounded-md border", className)}>
      <div className="flex items-center gap-1 border-b p-1">
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="굵게"
        >
          <BoldIcon className="size-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="기울임"
        >
          <ItalicIcon className="size-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          aria-label="취소선"
        >
          <StrikethroughIcon className="size-4" />
        </Toggle>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
          aria-label="글머리 기호 목록"
        >
          <ListIcon className="size-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
          aria-label="번호 목록"
        >
          <ListOrderedIcon className="size-4" />
        </Toggle>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
