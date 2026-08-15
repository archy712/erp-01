"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth/get-auth-error-message";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Separator } from "@/components/ui/separator";
import { GoogleAuthButton } from "@/components/google-auth-button";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  dict,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { dict: Dictionary }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/erp");
    } catch (error: unknown) {
      setError(getAuthErrorMessage(error, dict));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{dict.login.title}</CardTitle>
          <CardDescription>{dict.login.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{dict.login.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 items-center gap-x-2 gap-y-2">
                {/* Tab 순서상 비밀번호 입력이 이 링크보다 먼저 오도록, DOM 순서(Label →
                    Input → Link)와 시각적 위치(Label/Link 한 줄, Input 아래)를 grid
                    배치 유틸리티로 분리했다. */}
                <Label htmlFor="password" className="col-start-1 row-start-1">
                  {dict.login.passwordLabel}
                </Label>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-2 row-start-2"
                  showLabel={dict.common.showPassword}
                  hideLabel={dict.common.hidePassword}
                />
                <Link
                  href="/auth/forgot-password"
                  className="col-start-2 row-start-1 justify-self-end text-sm underline-offset-4 hover:underline"
                >
                  {dict.login.forgotPassword}
                </Link>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? dict.login.loggingIn : dict.login.loginButton}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {dict.login.noAccount}{" "}
              <Link
                href="/auth/sign-up"
                className="underline underline-offset-4"
              >
                {dict.common.signUp}
              </Link>
            </div>
          </form>
          <div className="my-6 flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">
              {dict.login.orSeparator}
            </span>
            <Separator className="flex-1" />
          </div>
          <GoogleAuthButton dict={dict} />
        </CardContent>
      </Card>
    </div>
  );
}
