import type { Dictionary } from "@/lib/i18n/dictionaries/types";

type AuthErrorCode = keyof Dictionary["authError"]["codes"];

/**
 * `missing_token`/`missing_code`는 Supabase가 아닌 이 프로젝트의 라우트 핸들러
 * (`app/auth/confirm/route.ts`, `app/auth/callback/route.ts`)가 자체 발급하는 sentinel 코드다.
 * 실제 문구는 `dict.authError.codes`(4개 언어)에서 관리한다.
 */
function isKnownAuthErrorCode(
  code: string,
  dict: Dictionary,
): code is AuthErrorCode {
  return code in dict.authError.codes;
}

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

export function getAuthErrorMessage(error: unknown, dict: Dictionary): string {
  const code = getErrorCode(error);
  if (code && isKnownAuthErrorCode(code, dict)) {
    return dict.authError.codes[code];
  }
  return dict.authError.codes.default;
}

/** 쿼리 파라미터로 전달된 에러 코드를 다국어 문구로 변환한다 (`app/auth/error/page.tsx` 전용). */
export function getAuthErrorMessageByCode(
  code: string | undefined,
  dict: Dictionary,
): string {
  if (code && isKnownAuthErrorCode(code, dict)) {
    return dict.authError.codes[code];
  }
  return dict.authError.codes.default;
}
