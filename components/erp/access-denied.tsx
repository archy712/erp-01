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
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

// app/erp/layout.tsx(ErpShell) 안에서 렌더링되므로 Header/Menubar/Footer는
// 그대로 유지된 채 콘텐츠 영역만 이 화면으로 대체된다.
export function AccessDenied({ dict }: { dict: Dictionary }) {
  return (
    <Empty className="flex-1 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldAlert />
        </EmptyMedia>
        <h1 className="text-lg font-medium tracking-tight">
          {dict.erp.accessDenied.title}
        </h1>
        <EmptyDescription>{dict.erp.accessDenied.description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild>
          <Link href="/erp">{dict.erp.accessDenied.backToHome}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
