"use client";

import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Switch } from "@/components/ui/switch";
import { TreeView, type TreeDataItem } from "@/components/ui/tree-view";
import {
  deleteMenuAction,
  moveMenuAction,
  setMenuActiveAction,
  type ActionResult,
} from "@/lib/erp/actions";
import { buildMenuTree, getMenuBreadcrumb } from "@/lib/erp/menu-tree";
import type { MenuFlat, MenuLevel, MenuNode } from "@/lib/erp/types";
import { MenuFormDialog } from "./menu-form-dialog";

const LEVEL_LABEL: Record<MenuLevel, string> = {
  1: "대분류",
  2: "중분류",
  3: "소분류",
};

const MAX_MENU_LEVEL = 3;

type MenuManagerProps = {
  menus: MenuFlat[];
};

function toTreeItems(
  nodes: MenuNode[],
  onSelect: (id: string) => void,
): TreeDataItem[] {
  return nodes.map((node) => ({
    id: node.id,
    name: node.name,
    onClick: () => onSelect(node.id),
    children:
      node.children.length > 0
        ? toTreeItems(node.children, onSelect)
        : undefined,
  }));
}

export function MenuManager({ menus }: MenuManagerProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const byId = useMemo(() => new Map(menus.map((m) => [m.id, m])), [menus]);
  const tree = useMemo(() => buildMenuTree(menus), [menus]);
  const treeData = useMemo(() => toTreeItems(tree, setSelectedId), [tree]);

  const selected = selectedId ? (byId.get(selectedId) ?? null) : null;

  const breadcrumb = useMemo(() => {
    if (!selected) return [];
    const path = getMenuBreadcrumb(tree, selected.id);
    return path ? path.map((node) => node.name) : [];
  }, [tree, selected]);

  const siblings = useMemo(() => {
    if (!selected) return [];
    return menus
      .filter((m) => m.parentId === selected.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [menus, selected]);
  const siblingIndex = selected
    ? siblings.findIndex((s) => s.id === selected.id)
    : -1;

  function runAction(
    id: string,
    run: () => Promise<ActionResult>,
    successMessage: string,
    onSuccess?: () => void,
  ) {
    setPendingId(id);
    startTransition(async () => {
      const result = await run();
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(successMessage);
        onSuccess?.();
      }
      setPendingId(null);
    });
  }

  const isSelectedPending = selected ? pendingId === selected.id : false;

  return (
    <div className="flex flex-1 gap-4 p-6">
      <div className="flex w-72 shrink-0 flex-col gap-3 rounded-md border p-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">메뉴 트리</h2>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus />
            메뉴 등록
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {treeData.length > 0 ? (
            <TreeView
              data={treeData}
              renderItem={({ item }) => {
                const node = byId.get(item.id);
                return (
                  <div className="flex flex-1 items-center gap-2 overflow-hidden">
                    <span className="truncate text-sm">{item.name}</span>
                    {node && !node.isActive ? (
                      <Badge variant="outline" className="shrink-0 text-[10px]">
                        비활성
                      </Badge>
                    ) : null}
                  </div>
                );
              }}
            />
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              등록된 메뉴가 없습니다.
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 rounded-md border p-4">
        {selected ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {breadcrumb.join(" > ")}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <h2 className="text-lg font-medium tracking-tight">
                  {selected.name}
                </h2>
                <Badge variant="secondary">{LEVEL_LABEL[selected.level]}</Badge>
                {!selected.isActive ? (
                  <Badge variant="outline">비활성</Badge>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isSelectedPending || siblingIndex <= 0}
                onClick={() =>
                  runAction(
                    selected.id,
                    () => moveMenuAction(selected.id, "up"),
                    "정렬순서를 위로 이동했습니다.",
                  )
                }
              >
                <ArrowUp />
                위로
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={
                  isSelectedPending || siblingIndex >= siblings.length - 1
                }
                onClick={() =>
                  runAction(
                    selected.id,
                    () => moveMenuAction(selected.id, "down"),
                    "정렬순서를 아래로 이동했습니다.",
                  )
                }
              >
                <ArrowDown />
                아래로
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                수정
              </Button>
              {selected.level < MAX_MENU_LEVEL ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus />
                  하위 메뉴 추가
                </Button>
              ) : null}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isSelectedPending}
                  >
                    삭제
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>메뉴를 삭제할까요?</AlertDialogTitle>
                    <AlertDialogDescription>
                      &ldquo;{selected.name}&rdquo; 메뉴를 삭제합니다. 하위
                      메뉴가 있다면 함께 삭제되고, 이 메뉴들에 부여된 사용자
                      권한도 모두 사라집니다. 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        runAction(
                          selected.id,
                          () => deleteMenuAction(selected.id),
                          "메뉴를 삭제했습니다.",
                          () => setSelectedId(null),
                        )
                      }
                    >
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span className="text-sm">사용 여부</span>
              <Switch
                checked={selected.isActive}
                disabled={isSelectedPending}
                onCheckedChange={(checked) =>
                  runAction(
                    selected.id,
                    () => setMenuActiveAction(selected.id, checked),
                    checked
                      ? "메뉴를 활성화했습니다."
                      : "메뉴를 비활성화했습니다.",
                  )
                }
                aria-label={selected.isActive ? "비활성화" : "활성화"}
              />
            </div>
          </div>
        ) : (
          <Empty className="flex-1 border-0">
            <EmptyHeader>
              <EmptyDescription>
                좌측 트리에서 메뉴를 선택하면 상세 정보와 편집 도구가
                표시됩니다.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <MenuFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        menus={menus}
        defaultParentId={
          selected && selected.level < MAX_MENU_LEVEL ? selected.id : null
        }
      />
      {selected ? (
        <MenuFormDialog
          mode="edit"
          open={editOpen}
          onOpenChange={setEditOpen}
          menus={menus}
          menu={selected}
        />
      ) : null}
    </div>
  );
}
