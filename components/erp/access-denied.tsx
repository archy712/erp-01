import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";

// app/erp/layout.tsx(ErpShell) 안에서 렌더링되므로 Header/Menubar/Footer는
// 그대로 유지된 채 콘텐츠 영역만 이 화면으로 대체된다.
export function AccessDenied() {
  return (
    <Empty className="flex-1 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldAlert />
        </EmptyMedia>
        <h1 className="text-lg font-medium tracking-tight">
          접근 권한이 없습니다
        </h1>
        <EmptyDescription>
          이 화면에 접근할 수 있는 권한이 없습니다. 필요한 경우 관리자에게
          문의하세요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/erp">홈으로 돌아가기</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
