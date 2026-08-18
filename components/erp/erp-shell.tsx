import { Suspense, type ReactNode } from "react";

import { ErpFooter } from "./erp-footer";
import { ErpHeader } from "./erp-header";
import { ErpRouteProgress } from "./erp-route-progress";
import { ErpTreePanel } from "./erp-tree-panel";
import type { MenuNode } from "@/lib/erp/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

type ErpShellProps = {
  dict: Dictionary;
  /** 헤더의 커맨드 팔레트(⌘K) 검색 대상 — rail/tree/mobileNav와 같은 데이터 소스(getVisibleMenuTree). */
  categories: MenuNode[];
  /** 데스크탑/태블릿(md 이상)에서 노출되는 좌측 대분류 아이콘 레일 */
  rail?: ReactNode;
  /** 모바일(md 미만)에서 레일 대신 노출되는 햄버거 트리거 + Sheet */
  mobileNav?: ReactNode;
  /** 데스크탑/태블릿(md 이상)에서 레일 옆에 노출되는 중/소분류 트리 패널 */
  tree?: ReactNode;
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
// - lg(1024px) 이상: 레일 폭 w-20, 트리 패널 폭 w-64
// - md(768px)~lg: 레일 폭 w-16, 트리 패널 폭 w-48로 축소
// - md 미만: 레일/트리 패널을 모두 숨기고 헤더 좌측의 mobileNav(햄버거+Sheet,
//   대/중/소분류 통합 트리)만 노출 — 모바일은 이 구조 변경 이전부터 이미
//   통합 트리였다.
//
// 트리 패널은 ErpTreePanel로 감싸 접기/펼치기 토글을 붙인다 — 데이터 테이블이
// 많은 업무 화면에서 좌측 내비 폭(레일+트리 최대 320px)을 접어 본문 폭을
// 넓히고 싶은 요구를 반영했다. 레일은 항상 펼쳐진 채로 유지한다(1차 내비게이션
// 수단이므로 VS Code Activity Bar처럼 접지 않는다).
//
// breadcrumb 표시는 더 이상 이 컴포넌트가 슬롯으로 받지 않는다 — 레이아웃
// 레벨(app/erp/layout.tsx)에서는 페이지별 실제 경로를 알 수 없어 항상 빈
// 슬롯이었다. 대신 각 페이지가 자신의 콘텐츠 상단에서 PageHeader를 직접
// 렌더링한다(components/erp/page-header.tsx).
export function ErpShell({
  dict,
  categories,
  rail,
  mobileNav,
  tree,
  children,
}: ErpShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      {/* usePathname()/useSearchParams()를 쓰므로 자체 Suspense 경계가
          필요하다(rail/tree/mobileNav와 동일한 이유, CLAUDE.md 참고). */}
      <Suspense fallback={null}>
        <ErpRouteProgress />
      </Suspense>
      <ErpHeader dict={dict} mobileNav={mobileNav} categories={categories} />

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden shrink-0 md:flex">
          <div className="flex w-16 shrink-0 flex-col overflow-y-auto border-r lg:w-20">
            {rail ?? (
              <p className="p-2 text-center text-xs text-muted-foreground">
                레일 (Task 004에서 구현 예정)
              </p>
            )}
          </div>
          <ErpTreePanel dict={dict}>
            {tree ?? (
              <p className="p-4 text-sm text-muted-foreground">
                좌측 트리 영역 (Task 005에서 구현 예정)
              </p>
            )}
          </ErpTreePanel>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="flex flex-1 flex-col">{children}</div>
        </main>
      </div>

      <ErpFooter dict={dict} />
    </div>
  );
}
