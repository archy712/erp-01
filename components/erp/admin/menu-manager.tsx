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
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { MenuFormDialog } from "./menu-form-dialog";

const MAX_MENU_LEVEL = 3;

type MenuManagerProps = {
  menus: MenuFlat[];
  dict: Dictionary;
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

export function MenuManager({ menus, dict }: MenuManagerProps) {
  const t = dict.admin.menus;
  const levelLabel: Record<MenuLevel, string> = {
    1: t.level1,
    2: t.level2,
    3: t.level3,
  };

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
    <div className="flex flex-1 flex-col gap-4 p-6 lg:flex-row">
      <div className="flex w-full shrink-0 flex-col gap-3 rounded-md border p-3 lg:w-72">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">{t.treeTitle}</h2>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus />
            {t.addButton}
          </Button>
        </div>
        <div className="max-h-64 flex-1 overflow-y-auto lg:max-h-none">
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
                        {t.inactiveBadge}
                      </Badge>
                    ) : null}
                  </div>
                );
              }}
            />
          ) : (
            <p className="p-4 text-sm text-muted-foreground">{t.noMenus}</p>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1 rounded-md border p-4">
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
                <Badge variant="secondary">{levelLabel[selected.level]}</Badge>
                {!selected.isActive ? (
                  <Badge variant="outline">{t.inactiveBadge}</Badge>
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
                    t.moveUpToast,
                  )
                }
              >
                <ArrowUp />
                {t.moveUp}
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
                    t.moveDownToast,
                  )
                }
              >
                <ArrowDown />
                {t.moveDown}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                {t.edit}
              </Button>
              {selected.level < MAX_MENU_LEVEL ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus />
                  {t.addChild}
                </Button>
              ) : null}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isSelectedPending}
                  >
                    {t.delete}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t.deleteConfirmTitle}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t.deleteConfirmDescription.replace(
                        "{name}",
                        selected.name,
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() =>
                        runAction(
                          selected.id,
                          () => deleteMenuAction(selected.id),
                          t.deleteToast,
                          () => setSelectedId(null),
                        )
                      }
                    >
                      {t.delete}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <div className="flex items-center justify-between rounded-md border px-3 py-2">
              <span className="text-sm">{t.useStatus}</span>
              <Switch
                checked={selected.isActive}
                disabled={isSelectedPending}
                onCheckedChange={(checked) =>
                  runAction(
                    selected.id,
                    () => setMenuActiveAction(selected.id, checked),
                    checked ? t.activateToast : t.deactivateToast,
                  )
                }
                aria-label={
                  selected.isActive
                    ? dict.admin.users.deactivateAriaLabel
                    : dict.admin.users.activateAriaLabel
                }
              />
            </div>
          </div>
        ) : (
          <Empty className="flex-1 border-0">
            <EmptyHeader>
              <EmptyDescription>{t.emptyStateDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      <MenuFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        menus={menus}
        dict={dict}
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
          dict={dict}
          menu={selected}
        />
      ) : null}
    </div>
  );
}
