import { Suspense } from "react";

import { ErpMenuTree } from "@/components/erp/erp-menu-tree";
import { ErpMenubar } from "@/components/erp/erp-menubar";
import { ErpMobileNav } from "@/components/erp/erp-mobile-nav";
import { ErpShell } from "@/components/erp/erp-shell";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getCurrentErpUser } from "@/lib/erp/auth";

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ErpLayoutContent>{children}</ErpLayoutContent>
    </Suspense>
  );
}

// getLocale()/getCurrentErpUser()가 cookies()를 사용하므로 Suspense 경계 안에서만 호출한다.
async function ErpLayoutContent({ children }: { children: React.ReactNode }) {
  // 모든 /erp/* 경로의 공통 진입점 재검증(이중 방어, CLAUDE.md 패턴). proxy.ts는
  // 세션 존재 여부만 확인하므로, is_active=false로 비활성화된 계정은 세션이
  // 유효해도 여기서 /auth/login으로 다시 리다이렉트된다. 특정 메뉴 단위 접근
  // 제어(getVisibleMenuTree/canAccessMenu)는 Task 018에서 추가된다.
  await getCurrentErpUser();

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
