import { Fragment, type ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// 화면마다 제각각이던 페이지 헤더(관리자 화면은 px-6 pt-6 + h1을 각자
// 인라인으로 반복 구현, 설정 화면은 아예 타이틀 없이 카드로 바로 진입, 일반
// 업무 메뉴는 MenuPlaceholder 안에서만 자체 브레드크럼을 그렸다)를 하나로
// 통일한다. ErpShell에 있던 breadcrumb 슬롯은 실제로는 어디서도 채워진 적이
// 없던 죽은 prop이었는데(각 페이지가 아니라 레이아웃 레벨에 있어 페이지별
// 경로를 알 수 없었다), 그 대신 각 페이지 콘텐츠 상단에서 이 컴포넌트를
// 직접 렌더링해 실제 경로를 채운다.
//
// `title`이 없으면(설정 화면처럼 하위 카드가 이미 자체 타이틀을 갖고 있는
// 경우) 브레드크럼만 있는 얇은 바만 렌더링해 타이틀이 중복되지 않게 한다.
//
// breadcrumb 항목은 라벨 문자열뿐이라(개별 세그먼트로 이동할 URL이 없음)
// 전부 비클릭 텍스트로 렌더링한다 — 마지막 항목만 BreadcrumbPage(현재 위치),
// 나머지는 일반 텍스트다. 클릭 가능한 조상 이동이 필요한 화면(조직도 상세의
// 선택 경로 등)은 이 컴포넌트 대신 자체적으로 Breadcrumb/BreadcrumbLink를
// 조합해 쓴다(components/erp/org/org-chart-view.tsx 참고).
export function PageHeader({
  breadcrumb,
  title,
  description,
  actions,
}: {
  breadcrumb?: string[];
  title?: string;
  description?: string;
  actions?: ReactNode;
}) {
  const hasBreadcrumb = breadcrumb && breadcrumb.length > 0;

  return (
    <div className="flex flex-col gap-1 border-b px-6 py-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {hasBreadcrumb ? (
          <Breadcrumb>
            <BreadcrumbList className="flex-nowrap gap-1 text-xs sm:gap-1">
              {breadcrumb.map((segment, index) => {
                const isLast = index === breadcrumb.length - 1;
                return (
                  <Fragment key={segment}>
                    {index > 0 ? (
                      <BreadcrumbSeparator className="[&>svg]:size-3" />
                    ) : null}
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage className="truncate text-xs font-normal text-muted-foreground">
                          {segment}
                        </BreadcrumbPage>
                      ) : (
                        <span className="truncate">{segment}</span>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        ) : null}
        {title ? (
          <h1
            className={
              hasBreadcrumb
                ? "mt-1 text-lg font-medium tracking-tight"
                : "text-lg font-medium tracking-tight"
            }
          >
            {title}
          </h1>
        ) : null}
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
