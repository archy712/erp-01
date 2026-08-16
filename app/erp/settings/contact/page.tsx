import { redirect } from "next/navigation";

// 연락처 정보 화면은 프로필 화면으로 통합됐다(components/profile-form.tsx).
export default function SettingsContactRedirectPage() {
  redirect("/erp/settings/profile");
}
