import { Suspense } from "react";

import { AccessDenied } from "@/components/erp/access-denied";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

// requireAdmin()이 관리자가 아닌 사용자를 이 화면으로 리다이렉트한다.
// app/erp/layout.tsx(ErpShell) 안에서 렌더링되므로 Header/Menubar/Footer는 유지된다.
export default function ErpForbiddenPage() {
  return (
    <Suspense fallback={null}>
      <ErpForbiddenContent />
    </Suspense>
  );
}

// getLocale()이 cookies()를 사용하므로 Suspense 경계 안에서만 호출한다.
async function ErpForbiddenContent() {
  const dict = getDictionary(await getLocale());
  return <AccessDenied dict={dict} />;
}
