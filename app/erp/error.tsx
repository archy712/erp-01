"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ErpErrorEmpty } from "@/components/erp/erp-error-empty";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";

// app/erp/layout.tsx(ErpShell) 안에서 렌더링되므로 Header/Menubar/Footer는
// 그대로 유지된 채 콘텐츠 영역만 이 화면으로 대체된다.
// Next.js 규약상 error 바운더리는 Client Component여야 한다.
//
// 주의: error.js는 같은 세그먼트의 layout.js가 던진 에러는 잡지 못한다
// (Next.js 공식 문서). app/erp/layout.tsx의 getVisibleMenuTree() 실패는
// 이 컴포넌트가 아니라 layout.tsx 자체의 try/catch + ErpErrorEmpty로 처리된다.
// 이 컴포넌트는 그 아래 nested layout/page(예: menu/[menuId], admin/*)의
// 조회 실패를 잡는다.
//
// Client 경계라 cookies()/getLocale()을 서버처럼 쓸 수 없다. `locale` 쿠키는
// httpOnly가 아니므로 document.cookie로 직접 읽는다(getDictionary는 순수
// 함수라 클라이언트에서도 안전하게 호출 가능). error 바운더리는 SSR 결과와
// 대조되는 하이드레이션 대상이 아니라 에러 발생 시 클라이언트에서 새로
// 렌더링되므로 하이드레이션 불일치 우려는 없다.
function getClientLocale() {
  if (typeof document === "undefined") return DEFAULT_LOCALE;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`),
  );
  const value = match ? decodeURIComponent(match[1]) : undefined;
  return value && isLocale(value) ? value : DEFAULT_LOCALE;
}

export default function ErpError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const dict = getDictionary(getClientLocale());

  return (
    <ErpErrorEmpty
      title={dict.erp.error.title}
      description={dict.erp.error.pageDescription}
      retry={
        <>
          <Button onClick={reset}>{dict.erp.error.retry}</Button>
          <Button variant="outline" asChild>
            <Link href="/erp">{dict.erp.error.backToErpHome}</Link>
          </Button>
        </>
      }
    />
  );
}
