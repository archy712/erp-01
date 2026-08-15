import type { ReactNode } from "react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
} from "@/components/ui/empty";

// app/erp/error.tsx(Client 에러 바운더리)와 app/erp/layout.tsx(서버 컴포넌트,
// 레이아웃 자체의 데이터 조회 실패용) 양쪽에서 같은 시각적 형태를 쓰기 위해
// 뽑아낸 순수 프레젠테이션 컴포넌트. Next.js에서 error.tsx는 같은 세그먼트의
// layout.tsx가 던진 에러는 잡지 못하므로(공식 문서: "error.js does not wrap
// the layout.js ... above it in the same segment"), 레이아웃 자체 조회
// 실패(getVisibleMenuTree 등)는 이 컴포넌트를 layout.tsx에서 직접 렌더링해
// 처리하고, 그 외 하위 페이지의 조회 실패는 기존 app/erp/error.tsx가 잡는다.
export function ErpErrorEmpty({
  title,
  description,
  retry,
}: {
  title: string;
  description: string;
  retry: ReactNode;
}) {
  return (
    <Empty className="flex-1 border-0">
      <EmptyHeader>
        <h1 className="text-lg font-medium tracking-tight">{title}</h1>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">{retry}</div>
      </EmptyContent>
    </Empty>
  );
}
