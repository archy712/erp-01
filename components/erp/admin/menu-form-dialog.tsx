"use client";

import { createElement, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createMenuAction,
  updateMenuAction,
  type MenuFormInput,
} from "@/lib/erp/actions";
import { getMenuIcon } from "@/lib/erp/menu-icons";
import { buildMenuTree, getMenuBreadcrumb } from "@/lib/erp/menu-tree";
import type { MenuFlat, MenuLevel } from "@/lib/erp/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

const ROOT_VALUE = "__root__";
const MAX_MENU_LEVEL = 3;

type MenuFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menus: MenuFlat[];
  dict: Dictionary;
} & (
  | { mode: "create"; menu?: undefined; defaultParentId?: string | null }
  | { mode: "edit"; menu: MenuFlat; defaultParentId?: undefined }
);

function pathLabel(menus: MenuFlat[], id: string): string {
  const tree = buildMenuTree(menus);
  const path = getMenuBreadcrumb(tree, id);
  return path ? path.map((node) => node.name).join(" > ") : "";
}

// getMenuIcon()은 이름에 따라 매번 다른(그러나 항상 기존에 정의된 고정된)
// lucide 아이콘 컴포넌트를 돌려준다. JSX(`<Icon/>`)로 쓰면 "렌더마다 새
// 컴포넌트를 만드는 패턴"으로 오인해 react-hooks/static-components 규칙에
// 걸리므로, createElement로 직접 엘리먼트를 만들어 그 정적 분석을 우회한다.
function MenuIconPreview({
  name,
  hasChildren,
}: {
  name: string;
  hasChildren: boolean;
}) {
  return createElement(getMenuIcon(name, hasChildren), {
    className: "size-4 text-muted-foreground",
    "aria-hidden": true,
  });
}

// Dialog/DialogContent는 Radix Presence로 닫힘 애니메이션을 관리하므로 항상
// 마운트해두고, 실제 폼 필드(내부 상태를 가진 부분)만 open일 때만 렌더링한다.
// 이렇게 하면 열릴 때마다 이 컴포넌트가 새로 마운트되며 현재 props 기준으로
// 상태가 초기화되므로, "열릴 때마다 초기값을 다시 계산"하는 데 useEffect +
// setState가 필요 없다(React Compiler의 set-state-in-effect 규칙 위반 회피).
export function MenuFormDialog({
  open,
  onOpenChange,
  dict,
  ...rest
}: MenuFormDialogProps) {
  const t = dict.admin.menus;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {rest.mode === "edit" ? t.editTitle : t.createTitle}
          </DialogTitle>
          <DialogDescription>
            {rest.mode === "edit" ? t.editDescription : t.createDescription}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <MenuFormFields {...rest} dict={dict} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type MenuFormFieldsProps = {
  menus: MenuFlat[];
  dict: Dictionary;
  onOpenChange: (open: boolean) => void;
} & (
  | { mode: "create"; menu?: undefined; defaultParentId?: string | null }
  | { mode: "edit"; menu: MenuFlat; defaultParentId?: undefined }
);

function MenuFormFields({
  menus,
  dict,
  mode,
  menu,
  defaultParentId,
  onOpenChange,
}: MenuFormFieldsProps) {
  const t = dict.admin.menus;
  const levelLabel: Record<MenuLevel, string> = {
    1: t.level1,
    2: t.level2,
    3: t.level3,
  };

  const initialParentId =
    mode === "edit" ? menu.parentId : (defaultParentId ?? null);

  const [parentId, setParentId] = useState<string | null>(initialParentId);
  const [name, setName] = useState(mode === "edit" ? menu.name : "");
  const [sortOrder, setSortOrder] = useState(() =>
    mode === "edit"
      ? menu.sortOrder
      : menus.filter((m) => m.parentId === initialParentId).length,
  );
  const [isActive, setIsActive] = useState(
    mode === "edit" ? menu.isActive : true,
  );
  const [nameError, setNameError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parentOptions = useMemo(
    () => menus.filter((m) => m.level < MAX_MENU_LEVEL),
    [menus],
  );

  const level: MenuLevel = useMemo(() => {
    if (!parentId) return 1;
    const parent = menus.find((m) => m.id === parentId);
    return parent ? ((parent.level + 1) as MenuLevel) : 1;
  }, [parentId, menus]);

  // getMenuIcon()이 EXACT_NAME_ICONS/KEYWORD_ICONS로 못 찾으면 하위 메뉴
  // 유무로 Folder/FileText를 가른다(lib/erp/menu-icons.ts) — 등록 모드는
  // 아직 하위 메뉴가 없으므로 항상 false, 수정 모드는 실제 자식 존재 여부를
  // 그대로 반영해 실제 렌더링 결과와 미리보기가 어긋나지 않게 한다.
  const hasChildren =
    mode === "edit" && menus.some((m) => m.parentId === menu.id);

  function handleParentChange(value: string) {
    const nextParentId = value === ROOT_VALUE ? null : value;
    setParentId(nextParentId);
    // 상위 메뉴가 바뀌면 형제 수 기준으로 정렬순서를 다시 제안한다.
    setSortOrder(menus.filter((m) => m.parentId === nextParentId).length);
  }

  function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError(t.nameRequired);
      return;
    }
    setNameError(null);

    const input: MenuFormInput = {
      parentId,
      name: trimmedName,
      sortOrder,
      isActive,
    };

    startTransition(async () => {
      const result =
        mode === "edit"
          ? await updateMenuAction(menu.id, {
              name: input.name,
              sortOrder: input.sortOrder,
              isActive: input.isActive,
            })
          : await createMenuAction(input);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(mode === "edit" ? t.editToast : t.createToast);
      onOpenChange(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="menu-parent">{t.parentLabel}</Label>
          {mode === "edit" ? (
            <p
              id="menu-parent"
              className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
            >
              {menu.parentId ? pathLabel(menus, menu.parentId) : t.noneRoot}
            </p>
          ) : (
            <Select
              value={parentId ?? ROOT_VALUE}
              onValueChange={handleParentChange}
            >
              <SelectTrigger id="menu-parent" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ROOT_VALUE}>{t.noneRoot}</SelectItem>
                {parentOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {pathLabel(menus, option.id)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          {t.levelLabel}:{" "}
          <span className="font-medium text-foreground">
            {levelLabel[level]}
          </span>
        </p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="menu-name">{t.nameLabel}</Label>
          <div className="flex items-center gap-2">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/50">
              <MenuIconPreview name={name.trim()} hasChildren={hasChildren} />
            </span>
            <Input
              id="menu-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (nameError) setNameError(null);
              }}
              aria-invalid={nameError ? true : undefined}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground">{t.iconPreviewLabel}</p>
          {nameError ? (
            <p className="text-sm text-destructive">{nameError}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="menu-sort-order">{t.sortOrderLabel}</Label>
          <Input
            id="menu-sort-order"
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor="menu-is-active">{t.useStatusLabel}</Label>
          <Switch
            id="menu-is-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          {t.cancelBtn}
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {mode === "edit" ? t.submitEdit : t.submitCreate}
        </Button>
      </DialogFooter>
    </>
  );
}
