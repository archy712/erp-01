import { Suspense } from "react";

import { UpdatePasswordForm } from "@/components/update-password-form";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <UpdatePasswordPageContent />
    </Suspense>
  );
}

async function UpdatePasswordPageContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <UpdatePasswordForm dict={dict} />
      </div>
    </div>
  );
}
