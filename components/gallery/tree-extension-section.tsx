"use client";

import { FileIcon, FolderIcon, FolderOpenIcon } from "lucide-react";

import { TreeView, type TreeDataItem } from "@/components/ui/tree-view";
import { GallerySection } from "@/components/gallery/section";

const treeData: TreeDataItem[] = [
  {
    id: "app",
    name: "app",
    icon: FolderIcon,
    openIcon: FolderOpenIcon,
    children: [
      {
        id: "gallery",
        name: "gallery",
        icon: FolderIcon,
        openIcon: FolderOpenIcon,
        children: [{ id: "gallery-page", name: "page.tsx", icon: FileIcon }],
      },
      { id: "layout", name: "layout.tsx", icon: FileIcon },
      { id: "page", name: "page.tsx", icon: FileIcon },
    ],
  },
  {
    id: "components",
    name: "components",
    icon: FolderIcon,
    openIcon: FolderOpenIcon,
    children: [
      { id: "ui", name: "ui/", icon: FolderIcon, disabled: true },
      {
        id: "gallery-dir",
        name: "gallery/",
        icon: FolderIcon,
        draggable: true,
      },
    ],
  },
];

export function TreeExtensionSection() {
  return (
    <>
      <p className="text-sm text-muted-foreground">
        아래 컴포넌트는 shadcn/ui 공식 레지스트리가 아니라{" "}
        <a
          href="https://github.com/mrlightful/shadcn-tree-view"
          target="_blank"
          rel="noreferrer"
          className="font-medium underline underline-offset-4"
        >
          mrlightful/shadcn-tree-view
        </a>{" "}
        커뮤니티 레지스트리에서 shadcn CLI로 설치한 확장 컴포넌트입니다 (
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          npx shadcn add &quot;https://mrlightful.com/registry/tree-view&quot;
        </code>
        ).
      </p>

      <GallerySection
        title="Tree View"
        description="파일 탐색기 같은 계층형 목록을 펼치고 접을 수 있는 컴포넌트"
      >
        <TreeView
          data={treeData}
          className="w-full max-w-sm"
          defaultNodeIcon={FolderIcon}
          defaultLeafIcon={FileIcon}
        />
      </GallerySection>
    </>
  );
}
