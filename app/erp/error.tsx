"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { ErpErrorEmpty } from "@/components/erp/erp-error-empty";

// app/erp/layout.tsx(ErpShell) 안에서 렌더링되므로 Header/Menubar/Footer는
// 그대로 유지된 채 콘텐츠 영역만 이 화면으로 대체된다.
// Next.js 규약상 error 바운더리는 Client Component여야 한다.
//
// 주의: error.js는 같은 세그먼트의 layout.js가 던진 에러는 잡지 못한다
// (Next.js 공식 문서). app/erp/layout.tsx의 getVisibleMenuTree() 실패는
// 이 컴포넌트가 아니라 layout.tsx 자체의 try/catch + ErpErrorEmpty로 처리된다.
// 이 컴포넌트는 그 아래 nested layout/page(예: menu/[menuId], admin/*)의
// 조회 실패를 잡는다.
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

  return (
    <ErpErrorEmpty
      description="화면을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요."
      retry={
        <>
          <Button onClick={reset}>다시 시도</Button>
          <Button variant="outline" asChild>
            <Link href="/erp">ERP 메인 화면으로 이동</Link>
          </Button>
        </>
      }
    />
  );
}
