import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";

// app/erp/layout.tsx(ErpShell) 안에서 렌더링되므로 Header/Menubar/Footer는
// 그대로 유지된 채 콘텐츠 영역만 이 화면으로 대체된다.
export default function ErpNotFound() {
  return (
    <Empty className="flex-1 border-0">
      <EmptyHeader>
        <h1 className="text-lg font-medium tracking-tight">
          메뉴를 찾을 수 없습니다
        </h1>
        <EmptyDescription>
          요청하신 메뉴가 존재하지 않거나 삭제되었습니다.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/erp">ERP 메인 화면으로 이동</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
