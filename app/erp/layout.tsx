import { Suspense } from "react";

import { ErpShell } from "@/components/erp/erp-shell";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function ErpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <ErpLayoutContent>{children}</ErpLayoutContent>
    </Suspense>
  );
}

// getLocale()이 cookies()/headers()를 사용하므로 Suspense 경계 안에서만 호출한다.
async function ErpLayoutContent({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <ErpShell locale={locale} dict={dict}>
      {children}
    </ErpShell>
  );
}
