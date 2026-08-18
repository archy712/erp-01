"use client";

import { createElement, useMemo, useState } from "react";
import { icons, SearchIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { resolveMenuIcon } from "@/lib/erp/menu-icons";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { cn } from "@/lib/utils";

const ALL_ICON_NAMES = Object.keys(icons).sort();

// resolveMenuIcon()이 돌려주는 아이콘 컴포넌트를 JSX(`<Icon/>`)로 그리면
// "렌더마다 새 컴포넌트를 만드는 패턴"으로 오인해 react-hooks/static-components
// 규칙에 걸린다(components/erp/admin/menu-form-dialog.tsx와 동일한 이유).
// createElement로 직접 엘리먼트를 만들어 그 정적 분석을 우회한다.
function renderIcon(
  icon: string | null,
  name: string,
  hasChildren: boolean,
  className: string,
) {
  return createElement(resolveMenuIcon(icon, name, hasChildren), {
    className,
    "aria-hidden": true,
  });
}

type MenuIconPickerProps = {
  value: string | null;
  onChange: (icon: string | null) => void;
  name: string;
  hasChildren: boolean;
  dict: Dictionary;
};

// 메뉴 등록/수정 폼의 아이콘 미리보기를 클릭하면 열리는 선택기. 이름 기반
// 자동 추천(getMenuIcon)을 기본값으로 보여주되, 검색해서 lucide-react
// 아이콘 중 아무거나 직접 고를 수도 있다 — 고른 값은 menus.icon에 저장되고
// (lib/erp/actions.ts), 이후 resolveMenuIcon()이 이름 기반 추천보다
// 우선한다.
export function MenuIconPicker({
  value,
  onChange,
  name,
  hasChildren,
  dict,
}: MenuIconPickerProps) {
  const t = dict.admin.menus;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return keyword
      ? ALL_ICON_NAMES.filter((iconName) =>
          iconName.toLowerCase().includes(keyword),
        )
      : ALL_ICON_NAMES;
  }, [query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/50 transition-colors hover:border-primary"
          aria-label={t.iconPickerTrigger}
        >
          {renderIcon(value, name, hasChildren, "size-4 text-muted-foreground")}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-3" align="start">
        <div className="flex flex-col gap-3">
          <InputGroup>
            <InputGroupAddon>
              <SearchIcon className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={t.iconSearchPlaceholder}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoFocus
            />
          </InputGroup>

          <button
            type="button"
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            className={cn(
              "flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors hover:border-primary",
              value === null
                ? "border-primary bg-accent"
                : "text-muted-foreground",
            )}
          >
            {renderIcon(null, name, hasChildren, "size-4 shrink-0")}
            {t.iconAutoOption}
          </button>

          <div className="grid max-h-64 grid-cols-6 gap-1 overflow-y-auto">
            {results.map((iconName) => {
              const selected = value === iconName;
              return (
                <button
                  key={iconName}
                  type="button"
                  title={iconName}
                  aria-label={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex size-9 items-center justify-center rounded-md border transition-colors hover:border-primary hover:bg-accent",
                    selected
                      ? "border-primary bg-accent"
                      : "border-transparent",
                  )}
                >
                  {renderIcon(iconName, name, hasChildren, "size-4")}
                </button>
              );
            })}
            {results.length === 0 ? (
              <p className="col-span-6 py-4 text-center text-sm text-muted-foreground">
                {t.iconSearchEmpty}
              </p>
            ) : null}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
