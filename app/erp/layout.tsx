import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { ErpErrorEmpty } from "@/components/erp/erp-error-empty";
import { ErpMenuTree } from "@/components/erp/erp-menu-tree";
import { ErpMenubar } from "@/components/erp/erp-menubar";
import { ErpMobileNav } from "@/components/erp/erp-mobile-nav";
import { ErpShell } from "@/components/erp/erp-shell";
import { ErpShellSkeleton } from "@/components/erp/erp-shell-skeleton";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { getCurrentErpUser } from "@/lib/erp/auth";
import { getVisibleMenuTree } from "@/lib/erp/queries";
import type { MenuNode } from "@/lib/erp/types";

export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ErpShellSkeleton />}>
      <ErpLayoutContent>{children}</ErpLayoutContent>
    </Suspense>
  );
}

// getLocale()/getCurrentErpUser()가 cookies()를 사용하므로 Suspense 경계 안에서만 호출한다.
async function ErpLayoutContent({ children }: { children: React.ReactNode }) {
  // 모든 /erp/* 경로의 공통 진입점 재검증(이중 방어, CLAUDE.md 패턴). proxy.ts는
  // 세션 존재 여부만 확인하므로, is_active=false로 비활성화된 계정은 세션이
  // 유효해도 여기서 /auth/login으로 다시 리다이렉트된다. 특정 메뉴 단위 접근
  // 제어(개별 화면 재검증)는 menu/[menuId]/page.tsx에서 canAccessMenu()로 처리한다.
  const user = await getCurrentErpUser();

  const locale = await getLocale();
  const dict = getDictionary(locale);

  // ERP 셸 전역에서 단 한 번만 조회해 Menubar/트리/모바일 내비 3곳에 그대로
  // 내려준다 (Task 018 — 1차 방어: 노출 필터링). 관리자는 활성 메뉴 전체,
  // 일반 사용자는 부여된 메뉴 + 조상 노드만 포함된 트리를 받는다.
  //
  // Next.js는 error.js가 같은 세그먼트의 layout.js가 던진 에러를 잡지 못한다
  // (공식 문서 "error.js does not wrap the layout.js ... above it in the same
  // segment"). 이 조회는 layout.tsx 자신(app/erp/error.tsx와 같은 세그먼트)
  // 안에서 실행되므로, 실패 시 app/erp/error.tsx가 아니라 여기서 직접
  // ErpErrorEmpty로 폴백해야 Header/Footer가 유지된 채 에러 화면이 뜬다.
  let categories: MenuNode[];
  try {
    categories = await getVisibleMenuTree(user.id, user.role);
  } catch (error) {
    console.error(error);
    return (
      <ErpShell
        dict={dict}
        menubar={
          <span className="text-sm text-muted-foreground">
            {dict.erp.layout.menuLoadError}
          </span>
        }
        tree={
          <p className="p-4 text-sm text-muted-foreground">
            {dict.erp.layout.menuLoadError}
          </p>
        }
      >
        <ErpErrorEmpty
          title={dict.erp.error.title}
          description={dict.erp.error.layoutDescription}
          retry={
            <Button asChild>
              <Link href="/erp">{dict.erp.error.retry}</Link>
            </Button>
          }
        />
      </ErpShell>
    );
  }

  return (
    <ErpShell
      dict={dict}
      // ErpMenubar/ErpMenuTree/ErpMobileNav는 useSearchParams()·usePathname()을
      // 사용하는 클라이언트 컴포넌트라 각자 자체 Suspense 경계가 필요하다.
      menubar={
        <Suspense fallback={null}>
          <ErpMenubar categories={categories} />
        </Suspense>
      }
      mobileNav={
        <Suspense fallback={null}>
          <ErpMobileNav categories={categories} dict={dict} />
        </Suspense>
      }
      tree={
        <Suspense fallback={null}>
          <ErpMenuTree categories={categories} dict={dict} />
        </Suspense>
      }
    >
      {children}
    </ErpShell>
  );
}
