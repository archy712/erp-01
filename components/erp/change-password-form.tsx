"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getAuthErrorMessage } from "@/lib/auth/get-auth-error-message";
import { dismissPasswordNotice } from "@/lib/erp/password-notice";
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

export function ChangePasswordForm({
  className,
  dict,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { dict: Dictionary }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError(dict.erp.changePassword.passwordMismatch);
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      dismissPasswordNotice();
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
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
            {dict.erp.changePassword.title}
          </CardTitle>
          <CardDescription>
            {dict.erp.changePassword.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">
                  {dict.erp.changePassword.newPasswordLabel}
                </Label>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  showLabel={dict.common.showPassword}
                  hideLabel={dict.common.hidePassword}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">
                  {dict.erp.changePassword.confirmPasswordLabel}
                </Label>
                <PasswordInput
                  id="confirm-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  showLabel={dict.common.showPassword}
                  hideLabel={dict.common.hidePassword}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && (
                <p className="text-sm text-green-600">
                  {dict.erp.changePassword.successMessage}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? dict.erp.changePassword.saving
                  : dict.erp.changePassword.saveButton}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
