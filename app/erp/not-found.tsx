import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

// app/erp/layout.tsx(ErpShell) 안에서 렌더링되므로 Header/Menubar/Footer는
// 그대로 유지된 채 콘텐츠 영역만 이 화면으로 대체된다.
export default function ErpNotFound() {
  return (
    <Suspense fallback={null}>
      <ErpNotFoundContent />
    </Suspense>
  );
}

// getLocale()이 cookies()를 사용하므로 Suspense 경계 안에서만 호출한다.
async function ErpNotFoundContent() {
  const dict = getDictionary(await getLocale());

  return (
    <Empty className="flex-1 border-0">
      <EmptyHeader>
        <h1 className="text-lg font-medium tracking-tight">
          {dict.erp.notFound.title}
        </h1>
        <EmptyDescription>{dict.erp.notFound.description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/erp">{dict.erp.notFound.backToErpHome}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
