import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// 설정 화면(components/profile-form.tsx, components/erp/change-password-form.tsx,
// app/erp/settings/{language,theme,notifications}/page.tsx의 인라인 Card)과
// 상품 등록/수정 폼(components/erp/products/product-form.tsx)이 공유하는
// "가운데 정렬 카드형" 로딩 스켈레톤.
//
// 설정 화면은 app/erp/settings/layout.tsx가 이미 좌측 네비/여백을 감싸고
// 있어 페이지 콘텐츠 자체는 PageHeader 없이 카드가 곧바로 타이틀을 갖지만,
// 상품 폼은 자체 PageHeader + 섹션 앵커 칩 내비를 먼저 그린 뒤 카드 없이
// 필드가 바로 나열되므로(product-form.tsx), 두 형태를 showPageHeader/
// showSectionNav로 토글한다.
export function ErpFormPageSkeleton({
  /** 상품 등록/수정 폼처럼 자체 PageHeader(브레드크럼+타이틀 바)를 먼저
   * 그리는 화면이면 true. 설정 화면은 카드 자체가 타이틀을 가지므로 기본값
   * false. */
  showPageHeader = false,
  /** 상품 폼처럼 PageHeader 아래 섹션 앵커 칩 내비(분류/속성/이미지/일반/
   * 공통)가 있는 화면이면 true. showPageHeader가 false면 무시된다. */
  showSectionNav = false,
  /** 카드(또는 섹션 콘텐츠) 폭 제한 클래스. 설정 화면 각 page.tsx가 쓰는
   * 값과 동일한 기본값을 둔다. */
  maxWidthClassName = "w-full max-w-md md:max-w-2xl lg:max-w-3xl",
  /** 라벨+입력 필드 자리 개수. */
  fieldCount = 4,
}: {
  showPageHeader?: boolean;
  showSectionNav?: boolean;
  maxWidthClassName?: string;
  fieldCount?: number;
}) {
  const fields = (
    <div className="space-y-4">
      {Array.from({ length: fieldCount }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );

  if (showPageHeader) {
    return (
      <div className="flex flex-1 flex-col">
        {/* components/erp/page-header.tsx와 동일한 px-6 py-4 + border-b */}
        <div className="flex flex-col gap-1 border-b px-6 py-4">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-5 w-28" />
        </div>

        {showSectionNav ? (
          // product-form.tsx의 섹션 앵커 칩 내비 자리(분류/속성/이미지/일반/공통 5개)
          <div className="overflow-x-auto border-b px-4 py-2 sm:px-6">
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-6 w-16 rounded-full" />
              ))}
            </div>
          </div>
        ) : null}

        <div className="p-4 sm:p-6">{fields}</div>
      </div>
    );
  }

  // 설정 화면과 동일하게 카드 자체가 타이틀/설명을 갖고 있어 PageHeader 없이
  // 곧바로 카드만 렌더링한다.
  return (
    <div className={cn(maxWidthClassName)}>
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>{fields}</CardContent>
      </Card>
    </div>
  );
}
