"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Home,
  Languages,
  type LucideIcon,
  Palette,
  Search,
  Shield,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { resolveMenuIcon } from "@/lib/erp/menu-icons";
import { flattenMenuLeaves } from "@/lib/erp/menu-tree";
import type { MenuNode } from "@/lib/erp/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

type QuickAction = {
  href: string;
  label: string;
  icon: LucideIcon;
};

// ⌘K/Ctrl+K로 여는 전역 이동 팔레트. 좌측 레일/트리가 이미 노출 필터링해
// 받은 categories(app/erp/layout.tsx의 getVisibleMenuTree 결과)를 그대로
// 재사용하므로, 이 컴포넌트가 접근 가능한 메뉴 범위를 별도로 다시 계산하지
// 않는다 — 트리에 보이는 메뉴만 검색 결과에도 나온다. 선택 시 이동 경로는
// ErpMenuTree의 리프 클릭과 동일하게 `/erp/menu/[menuId]?cat=[topId]`로
// 통일해, 실 화면 매핑(lib/erp/menu-routes.ts)·권한 재검증(canAccessMenu)을
// 중복 구현하지 않고 그대로 탄다.
export function ErpCommandPalette({
  categories,
  dict,
}: {
  categories: MenuNode[];
  dict: Dictionary;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // 브라우저 기본 동작(Chrome 주소창 포커스 등)과 겹치는 단축키라 preventDefault로
  // 가로챈다. cleanup에서 리스너를 반드시 제거해 컴포넌트가 여러 번
  // 마운트/언마운트되어도 중복 등록되지 않게 한다.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const leaves = useMemo(() => flattenMenuLeaves(categories), [categories]);

  const quickActions: QuickAction[] = [
    { href: "/erp", label: dict.erpHome.title, icon: Home },
    {
      href: "/erp/settings/profile",
      label: dict.erp.settings.navProfile,
      icon: UserRound,
    },
    {
      href: "/erp/settings/security",
      label: dict.erp.settings.navSecurity,
      icon: Shield,
    },
    {
      href: "/erp/settings/notifications",
      label: dict.erp.settings.navNotifications,
      icon: Bell,
    },
    {
      href: "/erp/settings/language",
      label: dict.erp.settings.navLanguage,
      icon: Languages,
    },
    {
      href: "/erp/settings/theme",
      label: dict.erp.settings.navTheme,
      icon: Palette,
    },
  ];

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={dict.erp.commandPalette.triggerAriaLabel}
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={dict.erp.commandPalette.placeholder}
        description={dict.erp.commandPalette.placeholder}
      >
        <CommandInput placeholder={dict.erp.commandPalette.placeholder} />
        <CommandList>
          <CommandEmpty>{dict.erp.commandPalette.emptyMessage}</CommandEmpty>

          <CommandGroup heading={dict.erp.commandPalette.quickActionsGroup}>
            {quickActions.map((action) => (
              <CommandItem
                key={action.href}
                value={action.label}
                onSelect={() => navigate(action.href)}
              >
                <action.icon />
                {action.label}
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {categories.map((category) => {
            const items = leaves.filter(
              (leaf) => leaf.topCategoryId === category.id,
            );
            if (items.length === 0) return null;

            return (
              <CommandGroup key={category.id} heading={category.name}>
                {items.map((leaf) => {
                  const Icon = resolveMenuIcon(leaf.icon, leaf.name, false);
                  const searchValue = [...leaf.breadcrumb, leaf.name].join(" ");
                  return (
                    <CommandItem
                      key={leaf.id}
                      value={searchValue}
                      onSelect={() =>
                        navigate(
                          `/erp/menu/${leaf.id}?cat=${leaf.topCategoryId}`,
                        )
                      }
                    >
                      <Icon />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate">{leaf.name}</span>
                        {leaf.breadcrumb.length > 0 ? (
                          <span className="truncate text-xs text-muted-foreground">
                            {leaf.breadcrumb.join(" > ")}
                          </span>
                        ) : null}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
