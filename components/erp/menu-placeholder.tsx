import { Construction } from "lucide-react";

import { PageHeader } from "@/components/erp/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

type MenuPlaceholderProps = {
  title: string;
  breadcrumb?: string[];
  dict: Dictionary;
};

// 마스터 관리 > 기본 관리(사용자/메뉴/권한 관리)를 제외한 모든 업무 메뉴가
// 공통으로 사용하는 빈 화면. 실제 CRUD/조회 로직은 이번 MVP 범위 밖이며,
// "해당 화면으로 들어갈 수 있다"까지만 보장한다(PRD 3절 참고).
// `title`/`breadcrumb`는 실 메뉴명(`menus.name`)이라 한국어 단일 값 그대로
// 유지한다(Task 010 — 메뉴명 자체는 다국어화 범위 제외). 그 외 안내 문구만
// 4개 언어 사전을 통해 번역한다.
//
// 경로/타이틀은 공용 PageHeader로 렌더링해 관리자·설정 화면과 같은 시각
// 언어를 쓴다(이전에는 이 컴포넌트만 독자적으로 브레드크럼 텍스트를 그렸다).
// Empty는 "실제 기능 없음" 안내 본문만 담당한다.
export function MenuPlaceholder({
  title,
  breadcrumb,
  dict,
}: MenuPlaceholderProps) {
  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title={title} />
      <Empty className="flex-1 border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Construction />
          </EmptyMedia>
          <EmptyDescription>
            {dict.erp.placeholder.description}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Badge variant="secondary">{dict.erp.placeholder.badge}</Badge>
        </EmptyContent>
      </Empty>
    </div>
  );
}
