"use client";

import { useMemo, useState, useTransition } from "react";
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
import { buildMenuTree, getMenuBreadcrumb } from "@/lib/erp/menu-tree";
import type { MenuFlat, MenuLevel } from "@/lib/erp/types";

const LEVEL_LABEL: Record<MenuLevel, string> = {
  1: "대분류",
  2: "중분류",
  3: "소분류",
};

const ROOT_VALUE = "__root__";
const MAX_MENU_LEVEL = 3;

type MenuFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  menus: MenuFlat[];
} & (
  | { mode: "create"; menu?: undefined; defaultParentId?: string | null }
  | { mode: "edit"; menu: MenuFlat; defaultParentId?: undefined }
);

function pathLabel(menus: MenuFlat[], id: string): string {
  const tree = buildMenuTree(menus);
  const path = getMenuBreadcrumb(tree, id);
  return path ? path.map((node) => node.name).join(" > ") : "";
}

// Dialog/DialogContent는 Radix Presence로 닫힘 애니메이션을 관리하므로 항상
// 마운트해두고, 실제 폼 필드(내부 상태를 가진 부분)만 open일 때만 렌더링한다.
// 이렇게 하면 열릴 때마다 이 컴포넌트가 새로 마운트되며 현재 props 기준으로
// 상태가 초기화되므로, "열릴 때마다 초기값을 다시 계산"하는 데 useEffect +
// setState가 필요 없다(React Compiler의 set-state-in-effect 규칙 위반 회피).
export function MenuFormDialog({
  open,
  onOpenChange,
  ...rest
}: MenuFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {rest.mode === "edit" ? "메뉴 수정" : "메뉴 등록"}
          </DialogTitle>
          <DialogDescription>
            {rest.mode === "edit"
              ? "메뉴명·정렬순서·사용여부를 수정합니다. 상위 메뉴는 변경할 수 없습니다."
              : "상위 메뉴를 비워두면 대분류로 등록됩니다."}
          </DialogDescription>
        </DialogHeader>
        {open ? <MenuFormFields {...rest} onOpenChange={onOpenChange} /> : null}
      </DialogContent>
    </Dialog>
  );
}

type MenuFormFieldsProps = {
  menus: MenuFlat[];
  onOpenChange: (open: boolean) => void;
} & (
  | { mode: "create"; menu?: undefined; defaultParentId?: string | null }
  | { mode: "edit"; menu: MenuFlat; defaultParentId?: undefined }
);

function MenuFormFields({
  menus,
  mode,
  menu,
  defaultParentId,
  onOpenChange,
}: MenuFormFieldsProps) {
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

  function handleParentChange(value: string) {
    const nextParentId = value === ROOT_VALUE ? null : value;
    setParentId(nextParentId);
    // 상위 메뉴가 바뀌면 형제 수 기준으로 정렬순서를 다시 제안한다.
    setSortOrder(menus.filter((m) => m.parentId === nextParentId).length);
  }

  function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("메뉴명을 입력해주세요.");
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

      toast.success(
        mode === "edit" ? "메뉴를 수정했습니다." : "메뉴를 등록했습니다.",
      );
      onOpenChange(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="menu-parent">상위 메뉴</Label>
          {mode === "edit" ? (
            <p
              id="menu-parent"
              className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground"
            >
              {menu.parentId
                ? pathLabel(menus, menu.parentId)
                : "없음 (대분류)"}
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
                <SelectItem value={ROOT_VALUE}>없음 (대분류)</SelectItem>
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
          레벨:{" "}
          <span className="font-medium text-foreground">
            {LEVEL_LABEL[level]}
          </span>
        </p>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="menu-name">메뉴명</Label>
          <Input
            id="menu-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (nameError) setNameError(null);
            }}
            aria-invalid={nameError ? true : undefined}
          />
          {nameError ? (
            <p className="text-sm text-destructive">{nameError}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="menu-sort-order">정렬순서</Label>
          <Input
            id="menu-sort-order"
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor="menu-is-active">사용 여부</Label>
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
          취소
        </Button>
        <Button onClick={handleSubmit} disabled={isPending}>
          {mode === "edit" ? "수정" : "등록"}
        </Button>
      </DialogFooter>
    </>
  );
}
