import { Suspense } from "react";

import { ChangePasswordForm } from "@/components/erp/change-password-form";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={null}>
      <ChangePasswordContent />
    </Suspense>
  );
}

async function ChangePasswordContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex flex-1 flex-col p-6">
      <div className="w-full max-w-sm">
        <ChangePasswordForm dict={dict} />
      </div>
    </div>
  );
}
