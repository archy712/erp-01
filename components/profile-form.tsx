"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { AVATAR_OPTIONS, getAvatarEmoji } from "@/lib/erp/avatar-options";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { DepartmentOption } from "@/lib/erp/queries";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import type { Tables } from "@/lib/supabase/database.types";

const NO_DEPARTMENT = "none";
const PHONE_PATTERN = /^\d{3}-\d{4}-\d{4}$/;

type Profile = Pick<
  Tables<"profiles">,
  | "id"
  | "email"
  | "name"
  | "department_id"
  | "phone_number"
  | "avatar_key"
  | "bio"
>;

export function ProfileForm({
  profile,
  departments,
  dict,
  className,
  ...props
}: {
  profile: Profile;
  departments: DepartmentOption[];
  dict: Dictionary;
} & React.ComponentPropsWithoutRef<"div">) {
  const [name, setName] = useState(profile.name ?? "");
  const [departmentId, setDepartmentId] = useState(
    profile.department_id ?? NO_DEPARTMENT,
  );
  const [phone, setPhone] = useState(profile.phone_number ?? "");
  const [avatarKey, setAvatarKey] = useState(profile.avatar_key);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedPhone = phone.trim();
    if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) {
      setError(dict.profile.phoneInvalid);
      return;
    }

    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name: name.trim() || null,
          department_id: departmentId === NO_DEPARTMENT ? null : departmentId,
          phone_number: trimmedPhone || null,
          avatar_key: avatarKey,
          bio: bio.trim() || null,
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
            <div className="grid gap-6 sm:grid-cols-2">
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
              <div className="grid gap-2">
                <Label htmlFor="department">
                  {dict.profile.departmentLabel}
                </Label>
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger id="department" className="w-full">
                    <SelectValue
                      placeholder={dict.profile.departmentPlaceholder}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_DEPARTMENT}>
                      {dict.profile.departmentPlaceholder}
                    </SelectItem>
                    {departments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">{dict.profile.phoneLabel}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder={dict.profile.phonePlaceholder}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label>{dict.profile.avatarLabel}</Label>
                <Dialog
                  open={avatarDialogOpen}
                  onOpenChange={setAvatarDialogOpen}
                >
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="flex items-center gap-3 rounded-md border border-input px-3 py-2 text-left text-sm shadow-xs transition-colors hover:bg-accent"
                    >
                      <Avatar className="size-9 text-xl">
                        <AvatarFallback className="text-xl">
                          {getAvatarEmoji(avatarKey)}
                        </AvatarFallback>
                      </Avatar>
                      {dict.profile.avatarChangeButton}
                    </button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {dict.profile.avatarDialogTitle}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-6 gap-3">
                      {AVATAR_OPTIONS.map((option) => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setAvatarKey(option.key)}
                          aria-label={option.key}
                        >
                          <Avatar
                            className={cn(
                              "size-12 text-2xl",
                              option.key === avatarKey &&
                                "ring-2 ring-foreground ring-offset-2 ring-offset-background",
                            )}
                          >
                            <AvatarFallback className="text-2xl">
                              {option.emoji}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid gap-2 sm:col-span-2">
                <Label htmlFor="bio">{dict.profile.bioLabel}</Label>
                <Textarea
                  id="bio"
                  maxLength={500}
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
              {error && (
                <p className="text-sm text-red-500 sm:col-span-2">{error}</p>
              )}
              {success && (
                <p className="text-sm text-green-600 sm:col-span-2">
                  {dict.profile.saveSuccess}
                </p>
              )}
              <Button
                type="submit"
                className="w-full sm:col-span-2"
                disabled={isLoading}
              >
                {isLoading ? dict.profile.saving : dict.profile.saveButton}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
