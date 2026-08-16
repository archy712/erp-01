"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "erp-tree-collapsed";
// 같은 탭 안에서 토글했을 때도 useSyncExternalStore가 다시 구독을 평가하도록
// 알리는 커스텀 이벤트. 브라우저 네이티브 "storage" 이벤트는 다른 탭에서
// 변경했을 때만 발생하고 이 탭 자신의 변경에는 발생하지 않는다.
const CHANGE_EVENT = "erp-tree-collapsed-change";

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function getServerSnapshot() {
  return false;
}

function setCollapsed(next: boolean) {
  window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// 중/소분류 트리 패널을 감싸 접기/펼치기 토글을 붙인다. 레일(대분류)은
// 1차 내비게이션이라 항상 펼쳐두지만, 트리 패널은 데이터 테이블/폼이 많은
// 화면에서 본문 폭을 넓히려는 요구가 있어 사용자가 직접 접을 수 있게 한다.
// 선택 상태는 localStorage에 저장해 새로고침/재방문에도 유지한다.
//
// useState + useEffect로 마운트 후 localStorage를 읽는 대신
// useSyncExternalStore를 쓴다 — 서버 스냅샷(false)과 클라이언트 스냅샷이
// 다를 수 있는 외부 저장소를 다루는 정확한 방법이며, effect 안에서 setState를
// 호출해 렌더링을 한 번 더 유발하는 것(react-hooks/set-state-in-effect)도
// 피할 수 있다.
//
// 접힌 상태는 폭 0이 아니라 얇은 스트립(토글 버튼만 남긴 폭)으로 유지한다 —
// 폭을 완전히 0으로 접으면 다시 펼 수 있는 단서가 화면에서 사라지기 때문.
export function ErpTreePanel({
  dict,
  children,
}: {
  dict: Dictionary;
  children: ReactNode;
}) {
  const collapsed = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return (
    <div
      className={cn(
        "flex shrink-0 flex-col overflow-hidden border-r",
        collapsed ? "w-10" : "w-48 lg:w-64",
      )}
    >
      <div className="flex shrink-0 justify-end border-b p-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={
            collapsed
              ? dict.erp.tree.expandAriaLabel
              : dict.erp.tree.collapseAriaLabel
          }
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </Button>
      </div>
      {!collapsed ? (
        <div className="flex-1 overflow-y-auto">{children}</div>
      ) : null}
    </div>
  );
}
