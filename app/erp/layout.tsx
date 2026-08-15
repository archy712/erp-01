import { Suspense } from "react";

import { ErpMenuTree } from "@/components/erp/erp-menu-tree";
import { ErpMenubar } from "@/components/erp/erp-menubar";
import { ErpMobileNav } from "@/components/erp/erp-mobile-nav";
import { ErpShell } from "@/components/erp/erp-shell";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function ErpLayout({ children }: { children: React.ReactNode }) {
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
    <ErpShell
      locale={locale}
      dict={dict}
      // ErpMenubar/ErpMenuTree/ErpMobileNav는 useSearchParams()·usePathname()을
      // 사용하는 클라이언트 컴포넌트라 각자 자체 Suspense 경계가 필요하다.
      menubar={
        <Suspense fallback={null}>
          <ErpMenubar />
        </Suspense>
      }
      mobileNav={
        <Suspense fallback={null}>
          <ErpMobileNav />
        </Suspense>
      }
      tree={
        <Suspense fallback={null}>
          <ErpMenuTree />
        </Suspense>
      }
    >
      {children}
    </ErpShell>
  );
}
