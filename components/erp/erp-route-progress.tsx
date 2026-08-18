"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const NAVIGATION_START_EVENT = "erp:navigation-start";

let historyPatched = false;

function wrapHistoryMethod(method: "pushState" | "replaceState") {
  const original = window.history[method].bind(window.history);
  window.history[method] = function (
    data: unknown,
    unused: string,
    url?: string | URL | null,
  ) {
    // Next 라우터 자체가 useInsertionEffect 안에서 pushState/replaceState를
    // 호출한다(app-router.js) — 그 호출 스택 안에서 곧바로 dispatchEvent →
    // setVisible(state 업데이트)까지 동기로 이어지면 "useInsertionEffect must
    // not schedule updates" 에러가 난다. 마이크로태스크로 한 틱 미뤄서
    // insertionEffect 실행이 끝난 뒤에 이벤트가 발생하도록 한다(사용자 체감
    // 지연은 없음).
    queueMicrotask(() => {
      window.dispatchEvent(new Event(NAVIGATION_START_EVENT));
    });
    return original(data, unused, url);
  };
}

// Next.js 자체도 app-router.js에서 history.pushState/replaceState를 감싸
// "외부에서 발생한 history 변경을 라우터 상태에 반영"하는데, 우리는 그 패치를
// 대체하지 않고 한 겹 더 감싸기만 한다 — 호출 시점에 window.history[method]에
// 실제로 할당돼 있는 함수(설치 순서와 무관하게 항상 최신)를 그대로 델리게이트
// 하므로, Next의 패치가 우리보다 먼저 설치되든 나중에 설치되든 이벤트는 항상
// 발생한다. <Link> 클릭이든 ErpMenuTree의 router.push()든 서버 액션의
// redirect()든, 클라이언트 내비게이션은 전부 결국 Next 라우터가 히스토리를
// 갱신하는 이 지점(HistoryUpdater, app-router.js)을 지나가므로, 개별 <Link>
// 안에서만 동작하는 useLinkStatus(erp-category-rail.tsx에서 사용 중)로는
// 커버할 수 없는 "화면 어디서 어떤 방식으로 내비게이션이 트리거됐는지"와
// 무관하게 반응하는 유일한 지점이다.
function patchHistoryOnce() {
  if (historyPatched) return;
  historyPatched = true;
  wrapHistoryMethod("pushState");
  wrapHistoryMethod("replaceState");
}

const TRICKLE_TARGET = 80;
const TRICKLE_INTERVAL_MS = 200;
const COMPLETE_HOLD_MS = 200;

// pathname/searchParams(React 값)와 window.location(브라우저 즉시값) 양쪽에서
// 똑같은 포맷의 키를 만들어야 "같은 URL로의 내비게이션"을 정확히 비교할 수
// 있다 — search는 선행 "?" 없이 받는다(URLSearchParams.toString()과 동일).
function buildKey(pathname: string, search: string): string {
  return search ? `${pathname}?${search}` : pathname;
}

function currentLocationKey(): string {
  return buildKey(
    window.location.pathname,
    window.location.search.replace(/^\?/, ""),
  );
}

// 전역 상단 로딩 프로그레스 바(GitHub/YouTube 스타일). 개별 화면의 스켈레톤
// 모양과 무관하게 "클릭이 즉시 반응했다"는 확신을 주는 것이 목적이라, 위치와
// 색이 항상 동일한 얇은 바 하나로 충분하다. 내비게이션 시작은
// history.pushState/replaceState 패치로, 완료는 usePathname/useSearchParams가
// 실제로 바뀌는 시점으로 감지한다(그 사이에 실제 데이터 로딩이 얼마나
// 걸리는지는 알 수 없으므로 80%까지만 서서히 채우다가, 완료 시점에 100%로
// 스냅한 뒤 짧게 유지하고 사라진다 — nprogress류 라이브러리의 표준 트릭).
export function ErpRouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const trickleRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentKeyRef = useRef(buildKey(pathname, searchParams.toString()));

  useEffect(() => {
    patchHistoryOnce();
  }, []);

  useEffect(() => {
    function completeImmediately() {
      if (trickleRef.current) {
        clearInterval(trickleRef.current);
        trickleRef.current = null;
      }
      setVisible(true);
      setProgress(100);
      hideRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, COMPLETE_HOLD_MS);
    }

    function handleNavigationStart() {
      if (hideRef.current) {
        clearTimeout(hideRef.current);
        hideRef.current = null;
      }

      // pushState/replaceState가 지금 보고 있는 URL과 똑같은 곳으로 호출된
      // 경우(예: 현재 카테고리를 다시 클릭) pathname/searchParams가 실제로는
      // 바뀌지 않으므로, 아래 "완료 감지" effect가 영원히 발동하지 않는다 —
      // 바가 트리클된 채로 멈춰 남는 버그였다. 이 시점의 window.location은
      // pushState 호출이 이미 반영된 뒤라 최신 URL을 담고 있으므로, 여기서
      // 직접 비교해 같은 URL이면 곧바로 완료 처리한다.
      if (currentLocationKey() === currentKeyRef.current) {
        completeImmediately();
        return;
      }

      if (trickleRef.current) clearInterval(trickleRef.current);

      setVisible(true);
      setProgress((current) => (current <= 0 ? 12 : current));
      trickleRef.current = setInterval(() => {
        setProgress((current) =>
          current < TRICKLE_TARGET
            ? current + (TRICKLE_TARGET - current) * 0.15
            : current,
        );
      }, TRICKLE_INTERVAL_MS);
    }

    window.addEventListener(NAVIGATION_START_EVENT, handleNavigationStart);
    return () => {
      window.removeEventListener(NAVIGATION_START_EVENT, handleNavigationStart);
    };
  }, []);

  // pathname/searchParams가 실제로 바뀐 시점 = 새 라우트가 커밋된 시점이므로,
  // 여기서 100%로 스냅하고 짧게 유지한 뒤 사라진다.
  useEffect(() => {
    const key = buildKey(pathname, searchParams.toString());
    if (currentKeyRef.current === key) return;
    currentKeyRef.current = key;

    if (trickleRef.current) {
      clearInterval(trickleRef.current);
      trickleRef.current = null;
    }
    setProgress(100);
    hideRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, COMPLETE_HOLD_MS);
  }, [pathname, searchParams]);

  useEffect(() => {
    return () => {
      if (trickleRef.current) clearInterval(trickleRef.current);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5"
    >
      <div
        className="h-full bg-primary transition-[width,opacity] duration-200 ease-out"
        style={{ width: `${progress}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}
