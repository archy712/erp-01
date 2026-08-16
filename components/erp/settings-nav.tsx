"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  type LucideIcon,
  Shield,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";

import { cn } from "@/lib/utils";

type SettingsNavItem = {
  href: string;
  label: string;
};

// Server Component(app/erp/settings/layout.tsx)는 함수(아이콘 컴포넌트)를
// prop으로 그대로 넘길 수 없으므로(RSC 직렬화 제약), href → 아이콘 매핑을
// 이 Client Component 안에서 직접 관리한다.
const NAV_ICONS: Record<string, LucideIcon> = {
  "/erp/settings/profile": UserRound,
  "/erp/settings/preferences": SlidersHorizontal,
  "/erp/settings/security": Shield,
  "/erp/settings/notifications": Bell,
};

export function SettingsNav({ items }: { items: SettingsNavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 gap-1 overflow-x-auto sm:w-48 sm:flex-col sm:overflow-visible">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = NAV_ICONS[item.href];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-accent hover:text-accent-foreground",
              active
                ? "bg-accent font-medium text-accent-foreground"
                : "text-muted-foreground",
            )}
          >
            {Icon ? <Icon className="size-4 shrink-0" /> : null}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
