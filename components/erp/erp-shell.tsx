import type { ReactNode } from "react";

import { ErpFooter } from "./erp-footer";
import { ErpHeader } from "./erp-header";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

type ErpShellProps = {
  dict: Dictionary;
  /** 데스크탑/태블릿(md 이상)에서 노출되는 대분류 Menubar */
  menubar?: ReactNode;
  /** 모바일(md 미만)에서 Menubar 대신 노출되는 햄버거 트리거 + Sheet */
  mobileNav?: ReactNode;
  /** 데스크탑/태블릿(md 이상)에서 노출되는 좌측 중/소분류 트리 */
  tree?: ReactNode;
  /** 대분류 > 중분류 > 소분류 경로 표시 슬롯 (Task 006 이후 페이지에서 채움) */
  breadcrumb?: ReactNode;
  children: ReactNode;
};

// 기존 Header/Footer(Phase 0, 변경 금지) 사이에 Menubar + 좌측 트리 + 우측 콘텐츠
// 3단 구조를 배치한다. h-screen + overflow-hidden으로 셸 자체는 뷰포트에 고정하고,
// 트리/콘텐츠 영역만 각자 독립적으로 스크롤되도록 한다.
//
// 반응형 브레이크포인트(Tailwind 기본값 기준):
// - lg(1024px) 이상: 좌측 트리 폭 w-64
// - md(768px)~lg: 좌측 트리 폭 w-48로 축소, Menubar는 그대로 노출
// - md 미만: Menubar/좌측 트리를 모두 숨기고 mobileNav(햄버거+Sheet)만 노출
export function ErpShell({
  dict,
  menubar,
  mobileNav,
  tree,
  breadcrumb,
  children,
}: ErpShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ErpHeader dict={dict} />

      <div className="flex h-12 w-full shrink-0 items-center gap-2 overflow-x-auto border-b px-4">
        <div className="flex md:hidden">
          {mobileNav ?? (
            <span className="text-sm text-muted-foreground">
              모바일 메뉴 (Task 005에서 구현 예정)
            </span>
          )}
        </div>
        <div className="hidden md:flex">
          {menubar ?? (
            <span className="text-sm text-muted-foreground">
              상단 Menubar 영역 (Task 004에서 구현 예정)
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-48 shrink-0 overflow-y-auto border-r md:block lg:w-64">
          {tree ?? (
            <p className="p-4 text-sm text-muted-foreground">
              좌측 트리 영역 (Task 005에서 구현 예정)
            </p>
          )}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          {breadcrumb ? (
            <div className="border-b px-4 py-2 text-sm text-muted-foreground">
              {breadcrumb}
            </div>
          ) : null}
          <div className="flex flex-1 flex-col">{children}</div>
        </main>
      </div>

      <ErpFooter dict={dict} />
    </div>
  );
}
