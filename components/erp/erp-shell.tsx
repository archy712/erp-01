import type { ReactNode } from "react";

import { ErpFooter } from "./erp-footer";
import { ErpHeader } from "./erp-header";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

type ErpShellProps = {
  dict: Dictionary;
  /** 데스크탑/태블릿(md 이상)에서 노출되는 좌측 대분류 아이콘 레일 */
  rail?: ReactNode;
  /** 모바일(md 미만)에서 레일 대신 노출되는 햄버거 트리거 + Sheet */
  mobileNav?: ReactNode;
  /** 데스크탑/태블릿(md 이상)에서 레일 옆에 노출되는 중/소분류 트리 패널 */
  tree?: ReactNode;
  /** 대분류 > 중분류 > 소분류 경로 표시 슬롯 (Task 006 이후 페이지에서 채움) */
  breadcrumb?: ReactNode;
  children: ReactNode;
};

// 기존 Header/Footer(Phase 0, 변경 금지) 사이에 좌측 대분류 레일 + 중/소분류
// 트리 패널 + 우측 콘텐츠 3단 구조를 배치한다. 이전에는 대분류(상단 Menubar)와
// 중/소분류(좌측 트리)가 서로 다른 영역에 떨어져 있어, 대분류를 클릭해야만
// 화면이 이동하며 좌측 트리가 뒤늦게 채워지는 부자연스러운 흐름이었다.
// 지금은 둘 다 좌측 세로축 안에 나란히 배치해(레일→인접 패널) 같은 시야에서
// 바로 이어지도록 했다(Linear/VS Code Activity Bar 패턴). h-screen +
// overflow-hidden으로 셸 자체는 뷰포트에 고정하고, 트리/콘텐츠 영역만 각자
// 독립적으로 스크롤되도록 한다.
//
// 반응형 브레이크포인트(Tailwind 기본값 기준):
// - lg(1024px) 이상: 트리 패널 폭 w-64
// - md(768px)~lg: 트리 패널 폭 w-48로 축소, 레일은 그대로 노출
// - md 미만: 레일/트리 패널을 모두 숨기고 mobileNav(햄버거+Sheet, 대/중/소분류
//   통합 트리)만 노출 — 모바일은 이 구조 변경 이전부터 이미 통합 트리였다.
export function ErpShell({
  dict,
  rail,
  mobileNav,
  tree,
  breadcrumb,
  children,
}: ErpShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <ErpHeader dict={dict} />

      <div className="flex h-12 w-full shrink-0 items-center gap-2 border-b px-4 md:hidden">
        {mobileNav ?? (
          <span className="text-sm text-muted-foreground">
            모바일 메뉴 (Task 005에서 구현 예정)
          </span>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden shrink-0 md:flex">
          <div className="flex w-14 shrink-0 flex-col overflow-y-auto border-r lg:w-16">
            {rail ?? (
              <p className="p-2 text-center text-xs text-muted-foreground">
                레일 (Task 004에서 구현 예정)
              </p>
            )}
          </div>
          <div className="w-48 shrink-0 overflow-y-auto border-r lg:w-64">
            {tree ?? (
              <p className="p-4 text-sm text-muted-foreground">
                좌측 트리 영역 (Task 005에서 구현 예정)
              </p>
            )}
          </div>
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
