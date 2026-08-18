import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 목록/테이블형 화면(components/erp/page-header.tsx의 PageHeader + 검색바 +
// 데이터 테이블 + 페이지네이션) 공통 로딩 스켈레톤. UserTable/MasterListTable/
// ProductTable이 실제로 공유하는 "검색 Input + 총 건수 → overflow rounded-md
// border 테이블 → 페이지네이션" 구조와 padding(p-4 sm:p-6)을 그대로 맞춰,
// 데이터가 스트리밍되어 들어올 때 레이아웃 시프트를 최소화한다.
//
// 실제 화면마다 PageHeader를 page.tsx가 직접 렌더링하기도 하고(admin/users,
// admin/menus, admin/permissions, products) 목록 컴포넌트 자신이 렌더링하기도
// 하지만(components/erp/master/company-manager.tsx), 두 경우 모두 최종
// 화면에서 차지하는 자리는 동일하므로 이 스켈레톤은 PageHeader 형태를 항상
// 포함한다.
export function ErpListPageSkeleton({
  /** 상품 목록(components/erp/products/product-filters.tsx)처럼 검색바 위에
   * 브랜드/성별 등 드롭다운 필터 줄이 추가로 있는 화면이면 true. */
  showFilters = false,
  /** 법인 관리(company-manager.tsx)처럼 PageHeader 우측에 "등록" 버튼이 있는
   * 화면이면 true. */
  showHeaderAction = false,
  /** 테이블 헤더/행의 컬럼 개수(기본 5 — 코드/명칭/사용여부/정렬순서/비고). */
  columnCount = 5,
  /** 스켈레톤 행 개수. */
  rowCount = 6,
}: {
  showFilters?: boolean;
  showHeaderAction?: boolean;
  columnCount?: number;
  rowCount?: number;
}) {
  return (
    <div className="flex flex-1 flex-col">
      {/* components/erp/page-header.tsx와 동일한 px-6 py-4 + border-b */}
      <div className="flex flex-col gap-1 border-b px-6 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-5 w-40" />
        </div>
        {showHeaderAction ? <Skeleton className="h-8 w-24 shrink-0" /> : null}
      </div>

      {showFilters ? (
        <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:px-6">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <Skeleton className="h-9 w-full sm:w-56" />
            <Skeleton className="h-9 w-full sm:w-40" />
            <Skeleton className="h-9 w-full sm:w-40" />
            <Skeleton className="h-9 w-full sm:w-32" />
            <Skeleton className="h-9 w-full sm:w-32" />
          </div>
          <Skeleton className="h-8 w-24 self-start sm:self-auto" />
        </div>
      ) : null}

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-9 w-full sm:max-w-xs" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {Array.from({ length: columnCount }).map((_, index) => (
                  <TableHead key={index}>
                    <Skeleton className="h-4 w-16" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: columnCount }).map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full max-w-32" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}
