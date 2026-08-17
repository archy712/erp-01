"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { setMasterActiveAction } from "@/lib/erp/master/actions";
import { getGenderLabel } from "@/lib/erp/master/gender";
import type { ProductListItem } from "@/lib/erp/master/queries";

type ProductTableProps = {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
};

// 검색·필터·페이지네이션 전부 서버 사이드(getProducts)로 처리되므로(PRD
// 7.6.1), MasterListTable(Task 032)과 달리 클라이언트에서 재필터링/재정렬하지
// 않고 서버가 이미 페이지네이션한 items를 그대로 렌더링만 한다. 행 클릭과
// 페이지 이동은 URL(page 쿼리) 변경 → 서버 컴포넌트 재조회로 이어진다.
export function ProductTable({
  items,
  total,
  page,
  pageSize,
}: ProductTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const goToPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(nextPage));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const goToDetail = useCallback(
    (id: string) => {
      router.push(`/erp/products/${id}`);
    },
    [router],
  );

  const handleActiveToggle = useCallback(
    (item: ProductListItem, next: boolean) => {
      setPendingId(item.id);
      startTransition(async () => {
        const result = await setMasterActiveAction("product", item.id, next);
        if (!result.success) {
          toast.error(result.message);
        } else {
          toast.success(
            next ? "사용으로 전환했습니다." : "미사용으로 전환했습니다.",
          );
        }
        setPendingId(null);
      });
    },
    [],
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <p className="text-sm text-muted-foreground">총 {total}건</p>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>썸네일</TableHead>
              <TableHead>상품코드</TableHead>
              <TableHead>상품명</TableHead>
              <TableHead>라인</TableHead>
              <TableHead>컬러</TableHead>
              <TableHead>성별</TableHead>
              <TableHead>사이즈</TableHead>
              <TableHead>사용여부</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length ? (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  tabIndex={0}
                  role="button"
                  className="cursor-pointer outline-hidden focus-visible:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  onClick={() => goToDetail(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      goToDetail(item.id);
                    }
                  }}
                >
                  <TableCell>
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.name}
                        width={40}
                        height={40}
                        className="size-10 rounded-md border object-cover"
                      />
                    ) : (
                      <div className="flex size-10 items-center justify-center rounded-md border bg-muted text-muted-foreground">
                        <ImageOff className="size-4" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {item.code}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="truncate">{item.name}</span>
                      {!item.isActive ? (
                        <Badge
                          variant="outline"
                          className="shrink-0 text-[10px]"
                        >
                          비활성
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{item.brandLineName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {item.brandColorRgbHex ? (
                        <span
                          className="size-4 shrink-0 rounded-full border"
                          style={{
                            backgroundColor: `#${item.brandColorRgbHex}`,
                          }}
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className="truncate">{item.brandColorName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getGenderLabel(item.gender)}</TableCell>
                  <TableCell>{item.brandGenderSizeName}</TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Switch
                      checked={item.isActive}
                      disabled={pendingId === item.id}
                      onCheckedChange={(checked) =>
                        handleActiveToggle(item, checked)
                      }
                      aria-label={item.isActive ? "사용 중지" : "사용 시작"}
                    />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  등록된 상품이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {page} / {pageCount} 페이지
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (page > 1) goToPage(page - 1);
                }}
                className={
                  page <= 1 ? "pointer-events-none opacity-50" : undefined
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  if (page < pageCount) goToPage(page + 1);
                }}
                className={
                  page >= pageCount
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
