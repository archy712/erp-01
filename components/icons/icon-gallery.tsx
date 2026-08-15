"use client";

import { useMemo, useState } from "react";
import { icons, SearchIcon } from "lucide-react";
import { toast } from "sonner";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  categorizeIconName,
  ICON_CATEGORIES,
} from "@/components/icons/icon-categories";

const ICON_NAMES = Object.keys(icons).sort();

const ICON_NAMES_BY_CATEGORY = ICON_NAMES.reduce<Record<string, string[]>>(
  (map, name) => {
    const key = categorizeIconName(name);
    map[key] ??= [];
    map[key].push(name);
    return map;
  },
  {},
);

export function IconGallery() {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return ICON_CATEGORIES.map((category) => ({
      key: category.key,
      label: category.label,
      icons: (ICON_NAMES_BY_CATEGORY[category.key] ?? []).filter(
        (name) => !keyword || name.toLowerCase().includes(keyword),
      ),
    })).filter((group) => group.icons.length > 0);
  }, [query]);

  const totalFiltered = useMemo(
    () => groups.reduce((sum, group) => sum + group.icons.length, 0),
    [groups],
  );

  const handleCopy = async (name: string) => {
    const snippet = `import { ${name} } from "lucide-react";`;
    try {
      await navigator?.clipboard?.writeText(snippet);
      toast(`${name} import 구문이 복사되었습니다`);
    } catch {
      toast.error("클립보드 복사에 실패했습니다");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <InputGroup className="max-w-sm">
        <InputGroupAddon>
          <SearchIcon className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          placeholder="아이콘 이름으로 검색 (예: arrow, user, file)"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </InputGroup>

      <p className="text-sm text-muted-foreground">
        전체 {ICON_NAMES.length.toLocaleString()}개 중{" "}
        {totalFiltered.toLocaleString()}개 표시 · 클릭하면 import 구문이
        복사됩니다
      </p>

      {groups.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <a
              key={group.key}
              href={`#icon-category-${group.key}`}
              className="rounded-full border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {group.label}{" "}
              <span className="text-muted-foreground/70">
                {group.icons.length}
              </span>
            </a>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-8">
        {groups.map((group) => (
          <section
            key={group.key}
            id={`icon-category-${group.key}`}
            className="flex scroll-mt-20 flex-col gap-3"
          >
            <div className="flex items-baseline gap-2">
              <h3 className="text-sm font-semibold">{group.label}</h3>
              <span className="text-xs text-muted-foreground">
                {group.icons.length.toLocaleString()}개
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {group.icons.map((name) => {
                const Icon = icons[name as keyof typeof icons];
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => handleCopy(name)}
                    title={name}
                    className="flex flex-col items-center gap-2 rounded-lg border bg-card p-3 text-card-foreground transition-colors hover:border-primary hover:bg-accent"
                  >
                    <Icon className="size-5" />
                    <span className="w-full truncate text-center text-[10px] text-muted-foreground">
                      {name}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {groups.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          &quot;{query}&quot;와 일치하는 아이콘이 없습니다.
        </p>
      )}
    </div>
  );
}
