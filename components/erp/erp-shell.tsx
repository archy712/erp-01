import type { ReactNode } from "react";

import { ErpFooter } from "./erp-footer";
import { ErpHeader } from "./erp-header";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

type ErpShellProps = {
  locale: Locale;
  dict: Dictionary;
  /** Task 004에서 실제 대분류 Menubar로 채워짐 */
  menubar?: ReactNode;
  /** Task 005에서 실제 중/소분류 트리로 채워짐 (데스크탑 전용, 모바일 Drawer는 Task 005) */
  tree?: ReactNode;
  /** 대분류 > 중분류 > 소분류 경로 표시 슬롯 (Task 006 이후 페이지에서 채움) */
  breadcrumb?: ReactNode;
  children: ReactNode;
};

// 기존 Header/Footer(Phase 0, 변경 금지) 사이에 Menubar + 좌측 트리 + 우측 콘텐츠
// 3단 구조를 배치한다. h-screen + overflow-hidden으로 셸 자체는 뷰포트에 고정하고,
// 트리/콘텐츠 영역만 각자 독립적으로 스크롤되도록 한다.
export function ErpShell({
  locale,
  dict,
  menubar,
  tree,
  breadcrumb,
  children,
}: ErpShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ErpHeader locale={locale} />

      <div className="flex h-12 w-full shrink-0 items-center overflow-x-auto border-b px-4">
        {menubar ?? (
          <span className="text-sm text-muted-foreground">
            상단 Menubar 영역 (Task 004에서 구현 예정)
          </span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r lg:block">
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
