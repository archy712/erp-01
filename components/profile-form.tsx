"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Tables } from "@/lib/supabase/database.types";

type Profile = Pick<Tables<"profiles">, "id" | "email" | "name">;

export function ProfileForm({
  profile,
  dict,
  className,
  ...props
}: {
  profile: Profile;
  dict: Dictionary;
} & React.ComponentPropsWithoutRef<"div">) {
  const [name, setName] = useState(profile.name ?? "");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: name.trim() || null,
        })
        .eq("id", profile.id);
      if (error) throw error;
      setSuccess(true);
      router.refresh();
    } catch (error: unknown) {
      setError(
        error instanceof Error ? error.message : dict.profile.errorFallback,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{dict.profile.title}</CardTitle>
          <CardDescription>{dict.profile.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">{dict.profile.emailLabel}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email ?? ""}
                  disabled
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">{dict.profile.nameLabel}</Label>
                <Input
                  id="name"
                  type="text"
                  maxLength={50}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && (
                <p className="text-sm text-green-600">
                  {dict.profile.saveSuccess}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? dict.profile.saving : dict.profile.saveButton}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
