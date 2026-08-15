import { cookies, headers } from "next/headers";

import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";

function matchAcceptLanguage(header: string | null): Locale {
  if (!header) return DEFAULT_LOCALE;

  const preferred = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const lang of preferred) {
    const base = lang.split("-")[0];
    if (base && isLocale(base)) return base;
  }

  return DEFAULT_LOCALE;
}

// 쿠키에 저장된 선택값이 있으면 그대로 쓰고, 없으면 브라우저가 보낸
// Accept-Language 헤더로 시스템/브라우저 기본 언어를 추정합니다.
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;

  const headerList = await headers();
  return matchAcceptLanguage(headerList.get("accept-language"));
}
