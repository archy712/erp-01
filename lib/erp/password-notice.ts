// 배너 닫기 상태를 브라우저에만 저장한다(서버/DB에 must_change_password류 플래그가
// 없음 — 의도적 MVP 범위). 비밀번호 변경에 성공했을 때도 같은 키를 세팅해 배너를
// 다시 띄우지 않는다.
export const PASSWORD_NOTICE_DISMISSED_KEY = "erp:password-notice-dismissed";

// localStorage.setItem()은 이벤트를 발생시킨 탭 자신에게는 "storage" 이벤트를
// 보내지 않으므로, 같은 탭 안에서 배너를 즉시 반응시키려면 커스텀 이벤트가 필요하다.
const PASSWORD_NOTICE_EVENT = "erp:password-notice-change";

export function dismissPasswordNotice() {
  window.localStorage.setItem(PASSWORD_NOTICE_DISMISSED_KEY, "1");
  window.dispatchEvent(new Event(PASSWORD_NOTICE_EVENT));
}

export function isPasswordNoticeDismissed(): boolean {
  return window.localStorage.getItem(PASSWORD_NOTICE_DISMISSED_KEY) === "1";
}

export function subscribePasswordNotice(callback: () => void): () => void {
  window.addEventListener(PASSWORD_NOTICE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PASSWORD_NOTICE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
