import { Construction } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";

type MenuPlaceholderProps = {
  title: string;
  breadcrumb?: string[];
};

// 마스터 관리 > 기본 관리(사용자/메뉴/권한 관리)를 제외한 모든 업무 메뉴가
// 공통으로 사용하는 빈 화면. 실제 CRUD/조회 로직은 이번 MVP 범위 밖이며,
// "해당 화면으로 들어갈 수 있다"까지만 보장한다(PRD 3절 참고).
export function MenuPlaceholder({ title, breadcrumb }: MenuPlaceholderProps) {
  return (
    <Empty className="flex-1 border-0">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Construction />
        </EmptyMedia>
        {breadcrumb && breadcrumb.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {breadcrumb.join(" > ")}
          </p>
        ) : null}
        <h1 className="text-lg font-medium tracking-tight">{title}</h1>
        <EmptyDescription>
          이 화면은 MVP 이후 단계에서 실제 기능이 구현될 예정입니다.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Badge variant="secondary">추후 구현 예정</Badge>
      </EmptyContent>
    </Empty>
  );
}
