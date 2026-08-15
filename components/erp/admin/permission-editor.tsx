"use client";

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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Label } from "@/components/ui/label";
import {
  getUserMenuPermissionIdsAction,
  setUserMenuPermissionsAction,
} from "@/lib/erp/actions";
import { buildMenuTree } from "@/lib/erp/menu-tree";
import type { ErpUserListItem } from "@/lib/erp/queries";
import {
  ROLE_BADGE_VARIANT,
  getRoleLabel,
  isAdminRole,
} from "@/lib/erp/role-labels";
import type { MenuFlat, MenuNode, UserRole } from "@/lib/erp/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

type PermissionEditorProps = {
  users: ErpUserListItem[];
  activeMenus: MenuFlat[];
  dict: Dictionary;
};

function collectIds(node: MenuNode): string[] {
  return [node.id, ...node.children.flatMap(collectIds)];
}

function checkStateOf(
  node: MenuNode,
  checked: Set<string>,
): boolean | "indeterminate" {
  const ids = collectIds(node);
  const checkedCount = ids.filter((id) => checked.has(id)).length;
  if (checkedCount === 0) return false;
  if (checkedCount === ids.length) return true;
  return "indeterminate";
}

function toggleNode(
  node: MenuNode,
  checked: Set<string>,
  nextChecked: boolean,
): Set<string> {
  const next = new Set(checked);
  for (const id of collectIds(node)) {
    if (nextChecked) next.add(id);
    else next.delete(id);
  }
  return next;
}

function userLabel(user: ErpUserListItem, noNameLabel: string): string {
  return `${user.name ?? noNameLabel} · ${user.email ?? ""}`;
}

type PermissionTreeRowsProps = {
  nodes: MenuNode[];
  depth: number;
  checkedIds: Set<string>;
  onToggle: (node: MenuNode, nextChecked: boolean) => void;
};

// components/ui/tree-view.tsx는 그룹 노드를 Radix Accordion(<button>)로 렌더링해,
// 그 안에 체크박스(Radix Checkbox도 <button>)를 두면 <button> 안에 <button>이
// 중첩되는 무효 HTML(hydration 에러)이 발생한다(Playwright로 재현 확인). 이
// 화면은 항상 전체 트리를 펼쳐서 보여주므로 접기/펼치기 자체가 필요 없어,
// TreeView 대신 들여쓰기 기반의 단순 재귀 렌더러로 직접 구현했다.
function PermissionTreeRows({
  nodes,
  depth,
  checkedIds,
  onToggle,
}: PermissionTreeRowsProps) {
  return (
    <>
      {nodes.map((node) => {
        const state = checkStateOf(node, checkedIds);
        return (
          <div key={node.id}>
            <label
              className="flex cursor-pointer items-center gap-2 rounded-md py-1.5 pr-2 hover:bg-accent/50"
              style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
            >
              <Checkbox
                checked={state}
                onCheckedChange={(next) => onToggle(node, next === true)}
              />
              <span className="truncate text-sm">{node.name}</span>
            </label>
            {node.children.length > 0 ? (
              <PermissionTreeRows
                nodes={node.children}
                depth={depth + 1}
                checkedIds={checkedIds}
                onToggle={onToggle}
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export function PermissionEditor({
  users,
  activeMenus,
  dict,
}: PermissionEditorProps) {
  const t = dict.admin.permissions;
  const [selectedUser, setSelectedUser] = useState<ErpUserListItem | null>(
    null,
  );
  // undefined = 확인 다이얼로그 닫힘, 그 외(null 포함)는 전환하려는 대상 사용자.
  const [pendingUser, setPendingUser] = useState<
    ErpUserListItem | null | undefined
  >(undefined);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(false);
  const [isPending, startTransition] = useTransition();

  const tree = useMemo(() => buildMenuTree(activeMenus), [activeMenus]);

  const isDirty = useMemo(() => {
    if (checkedIds.size !== savedIds.size) return true;
    for (const id of checkedIds) {
      if (!savedIds.has(id)) return true;
    }
    return false;
  }, [checkedIds, savedIds]);

  const selectedIsAdmin = selectedUser
    ? isAdminRole(selectedUser.role as UserRole)
    : false;

  function applySelection(user: ErpUserListItem | null) {
    setSelectedUser(user);
    setCheckedIds(new Set());
    setSavedIds(new Set());

    if (!user || isAdminRole(user.role as UserRole)) {
      return;
    }

    setIsLoadingPermissions(true);
    startTransition(async () => {
      try {
        const ids = await getUserMenuPermissionIdsAction(user.id);
        setCheckedIds(new Set(ids));
        setSavedIds(new Set(ids));
      } catch {
        toast.error(t.loadFailedToast);
      } finally {
        setIsLoadingPermissions(false);
      }
    });
  }

  function handleUserChange(next: ErpUserListItem | null) {
    if (isDirty) {
      setPendingUser(next);
      return;
    }
    applySelection(next);
  }

  function handleSave() {
    if (!selectedUser) return;

    startTransition(async () => {
      const result = await setUserMenuPermissionsAction(
        selectedUser.id,
        Array.from(checkedIds),
      );

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      setSavedIds(new Set(checkedIds));
      toast.success(t.saveSuccessToast);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <Label htmlFor="permission-user-search">{t.userLabel}</Label>
          <Combobox
            items={users}
            value={selectedUser}
            onValueChange={handleUserChange}
            itemToStringLabel={(user) => userLabel(user, t.noNameLabel)}
            isItemEqualToValue={(a, b) => a.id === b.id}
          >
            <ComboboxInput
              id="permission-user-search"
              placeholder={t.searchPlaceholder}
              className="w-full sm:w-80"
            />
            <ComboboxContent>
              <ComboboxEmpty>{t.noSearchResults}</ComboboxEmpty>
              <ComboboxList>
                {(user: ErpUserListItem) => (
                  <ComboboxItem key={user.id} value={user}>
                    <div className="flex min-w-0 flex-col">
                      <span className="flex items-center gap-1.5 truncate">
                        {user.name ?? t.noNameLabel}
                        <Badge
                          variant={ROLE_BADGE_VARIANT[user.role as UserRole]}
                          className="text-[10px]"
                        >
                          {getRoleLabel(user.role as UserRole, dict)}
                        </Badge>
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>

        <Button
          onClick={handleSave}
          disabled={!selectedUser || selectedIsAdmin || !isDirty || isPending}
          className="w-full shrink-0 sm:w-auto"
        >
          {t.saveButton}
        </Button>
      </div>

      {!selectedUser ? (
        <Empty className="flex-1 border-0">
          <EmptyHeader>
            <EmptyDescription>{t.noUserSelectedDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : selectedIsAdmin ? (
        <Empty className="flex-1 border-0">
          <EmptyHeader>
            <EmptyDescription>
              {t.adminNoPermissionDescription}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : isLoadingPermissions ? (
        <p className="p-4 text-sm text-muted-foreground">{t.loading}</p>
      ) : tree.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">{t.noMenus}</p>
      ) : (
        <div className="flex-1 overflow-y-auto rounded-md border p-2">
          <PermissionTreeRows
            nodes={tree}
            depth={0}
            checkedIds={checkedIds}
            onToggle={(node, nextChecked) =>
              setCheckedIds((prev) => toggleNode(node, prev, nextChecked))
            }
          />
        </div>
      )}

      <AlertDialog
        open={pendingUser !== undefined}
        onOpenChange={(open) => {
          if (!open) setPendingUser(undefined);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.unsavedTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.unsavedDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingUser(undefined)}>
              {t.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                applySelection(pendingUser ?? null);
                setPendingUser(undefined);
              }}
            >
              {t.switchConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
