import { redirect } from "next/navigation";

// 아바타 선택 화면은 프로필 화면으로 통합됐다(components/profile-form.tsx).
export default function SettingsAvatarRedirectPage() {
  redirect("/erp/settings/profile");
}
