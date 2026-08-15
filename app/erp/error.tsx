"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";

// app/erp/layout.tsx(ErpShell) 안에서 렌더링되므로 Header/Menubar/Footer는
// 그대로 유지된 채 콘텐츠 영역만 이 화면으로 대체된다.
// Next.js 규약상 error 바운더리는 Client Component여야 한다.
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
    <Empty className="flex-1 border-0">
      <EmptyHeader>
        <h1 className="text-lg font-medium tracking-tight">
          문제가 발생했습니다
        </h1>
        <EmptyDescription>
          화면을 불러오는 중 오류가 발생했습니다. 다시 시도해 주세요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button onClick={reset}>다시 시도</Button>
          <Button variant="outline" asChild>
            <Link href="/erp">ERP 메인 화면으로 이동</Link>
          </Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
