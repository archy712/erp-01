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
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UpdatePasswordForm({
  className,
  dict,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { dict: Dictionary }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });
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
          <CardTitle className="text-2xl">
            {dict.updatePassword.title}
          </CardTitle>
          <CardDescription>{dict.updatePassword.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">
                  {dict.updatePassword.newPasswordLabel}
                </Label>
                <PasswordInput
                  id="password"
                  placeholder={dict.updatePassword.newPasswordLabel}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showLabel={dict.common.showPassword}
                  hideLabel={dict.common.hidePassword}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? dict.updatePassword.saving
                  : dict.updatePassword.saveButton}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
