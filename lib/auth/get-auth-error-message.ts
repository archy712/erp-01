/**
 * Supabase Auth 에러(코드 기반)를 한국어 안내 문구로 변환한다.
 * `missing_token`/`missing_code`는 Supabase가 아닌 이 프로젝트의 라우트 핸들러
 * (`app/auth/confirm/route.ts`, `app/auth/callback/route.ts`)가 자체 발급하는 sentinel 코드다.
 */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
  email_not_confirmed:
    "이메일 인증이 완료되지 않았습니다. 받은 편지함을 확인해주세요.",
  user_already_exists: "이미 가입된 이메일입니다.",
  email_exists: "이미 가입된 이메일입니다.",
  identity_already_exists: "이미 가입된 이메일입니다.",
  weak_password: "비밀번호가 너무 약합니다. 더 안전한 비밀번호를 사용해주세요.",
  same_password: "새 비밀번호가 기존 비밀번호와 동일합니다.",
  user_banned: "차단된 계정입니다. 관리자에게 문의해주세요.",
  session_expired: "세션이 만료되었습니다. 다시 로그인해주세요.",
  otp_expired: "인증 링크가 만료되었습니다. 다시 시도해주세요.",
  over_email_send_rate_limit:
    "이메일 발송 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  over_request_rate_limit: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  validation_failed: "입력값을 확인해주세요.",
  email_address_invalid: "올바른 이메일 형식이 아닙니다.",
  signup_disabled: "현재 회원가입이 비활성화되어 있습니다.",
  missing_token:
    "인증 링크가 만료되었거나 유효하지 않습니다. 다시 시도해주세요.",
  missing_code: "인증 코드가 없습니다. 다시 시도해주세요.",
};

function getErrorCode(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
  ) {
    return (error as { code: string }).code;
  }
  return undefined;
}

export function getAuthErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }
  return "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

/** 쿼리 파라미터로 전달된 에러 코드를 한국어 문구로 변환한다 (`app/auth/error/page.tsx` 전용). */
export function getAuthErrorMessageByCode(code: string | undefined): string {
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }
  return "요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}
