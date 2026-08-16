"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Bell,
  Laptop,
  Languages,
  type LucideIcon,
  LogOut,
  Moon,
  Settings,
  Shield,
  SlidersHorizontal,
  Sun,
  UserRound,
} from "lucide-react";
import { useTheme } from "next-themes";

import { setLocaleCookie } from "@/lib/i18n/actions";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

export function AuthMenu({
  email,
  name,
  loginAt,
  locale,
  dict,
}: {
  email: string;
  name: string;
  loginAt: string | null;
  locale: Locale;
  dict: Dictionary;
}) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleLocaleChange = (value: string) => {
    const nextLocale = value as Locale;
    if (nextLocale === locale) return;

    startTransition(async () => {
      await setLocaleCookie(nextLocale);
      router.refresh();
    });
  };

  const loginTimeLabel = loginAt
    ? format(new Date(loginAt), "yyyy-MM-dd HH:mm")
    : "";

  const ThemeIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Laptop;

  const settingsItems: { href: string; icon: LucideIcon; label: string }[] = [
    {
      href: "/erp/settings/profile",
      icon: UserRound,
      label: dict.erp.settings.navProfile,
    },
    {
      href: "/erp/settings/preferences",
      icon: SlidersHorizontal,
      label: dict.erp.settings.navPreferences,
    },
    {
      href: "/erp/settings/security",
      icon: Shield,
      label: dict.erp.settings.navSecurity,
    },
    {
      href: "/erp/settings/notifications",
      icon: Bell,
      label: dict.erp.settings.navNotifications,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {loginTimeLabel && (
        <span className="hidden max-w-[40vw] truncate text-sm text-muted-foreground sm:inline">
          {dict.common.userGreeting
            .replace("{name}", name)
            .replace("{time}", loginTimeLabel)}
        </span>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            <Settings className="size-4" />
            <span className="sr-only">{dict.common.settings}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="font-normal text-muted-foreground">
            {email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {settingsItems.map(({ href, icon: Icon, label }) => (
            <DropdownMenuItem key={href} asChild>
              <Link href={href}>
                <Icon />
                {label}
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isPending}>
              <Languages />
              {dict.common.language}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={locale}
                onValueChange={handleLocaleChange}
              >
                {LOCALES.map((value) => (
                  <DropdownMenuRadioItem key={value} value={value}>
                    {LOCALE_LABELS[value]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <ThemeIcon />
              {dict.common.theme}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem className="flex gap-2" value="light">
                  <Sun className="size-4 text-muted-foreground" />
                  <span>Light</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem className="flex gap-2" value="dark">
                  <Moon className="size-4 text-muted-foreground" />
                  <span>Dark</span>
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem className="flex gap-2" value="system">
                  <Laptop className="size-4 text-muted-foreground" />
                  <span>System</span>
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOut />
            {dict.common.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
