"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Languages,
  Laptop,
  type LucideIcon,
  Moon,
  Shield,
  SlidersHorizontal,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

type SettingsNavItem = {
  href: string;
  label: string;
};

// Server Component(app/erp/settings/layout.tsx)는 함수(아이콘 컴포넌트)를
// prop으로 그대로 넘길 수 없으므로(RSC 직렬화 제약), href → 아이콘 매핑을
// 이 Client Component 안에서 직접 관리한다. "/erp/settings/theme"는
// 현재 테마에 따라 아이콘이 바뀌므로(AuthMenu의 테마 서브메뉴 아이콘과 동일
// 규칙) 이 표에 넣지 않고 렌더링 시 별도 계산한다.
const NAV_ICONS: Record<string, LucideIcon> = {
  "/erp/settings/profile": UserRound,
  "/erp/settings/preferences": SlidersHorizontal,
  "/erp/settings/security": Shield,
  "/erp/settings/notifications": Bell,
  "/erp/settings/language": Languages,
};

const emptySubscribe = () => () => {};

// next-themes의 theme 값은 클라이언트에서만 확정되므로, 마운트 전에는
// 항상 Laptop(system 기본값)을 렌더링해 하이드레이션 불일치를 피한다
// (components/theme-switcher.tsx와 동일한 패턴).
const useIsClient = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

export function SettingsNav({ items }: { items: SettingsNavItem[] }) {
  const pathname = usePathname();
  const isClient = useIsClient();
  const { theme } = useTheme();

  const themeIcon =
    isClient && theme === "light"
      ? Sun
      : isClient && theme === "dark"
        ? Moon
        : Laptop;

  return (
    <nav className="flex shrink-0 gap-1 overflow-x-auto sm:w-48 sm:flex-col sm:overflow-visible">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon =
          item.href === "/erp/settings/theme"
            ? themeIcon
            : NAV_ICONS[item.href];
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
