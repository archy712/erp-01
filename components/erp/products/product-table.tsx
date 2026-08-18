"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronsUpDown,
  ImageOff,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  bulkDeleteMasterAction,
  bulkSetMasterActiveAction,
  setMasterActiveAction,
} from "@/lib/erp/master/actions";
import { getGenderLabel } from "@/lib/erp/master/gender";
import type {
  ProductListItem,
  ProductSortField,
} from "@/lib/erp/master/queries";

type ProductTableProps = {
  items: ProductListItem[];
  total: number;
  page: number;
  pageSize: number;
  sortBy?: ProductSortField;
  sortDir?: "asc" | "desc";
};

type SortableHeadProps = {
  field: ProductSortField;
  sortBy?: ProductSortField;
  sortDir?: "asc" | "desc";
  onSort: (field: ProductSortField) => void;
  children: ReactNode;
  className?: string;
};

// 상품 목록은 서버 사이드 정렬(getProducts의 sortBy/sortDir)이라 클릭 시 URL의
// sortBy/sortDir을 바꿔 서버 컴포넌트를 재조회한다 — MasterListTable/UserTable의
// 클라이언트 사이드 react-table 정렬과는 다른 방식이다.
function SortableHead({
  field,
  sortBy,
  sortDir,
  onSort,
  children,
  className,
}: SortableHeadProps) {
  const active = sortBy === field;
  return (
    <TableHead className={className}>
      <button
        type="button"
        className="-ml-2 inline-flex items-center gap-1.5 rounded px-2 py-1 text-left font-medium hover:bg-accent"
        onClick={() => onSort(field)}
      >
        <span>{children}</span>
        {active && sortDir === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : active && sortDir === "desc" ? (
          <ArrowDown className="size-3.5" />
        ) : (
          <ChevronsUpDown className="size-3.5 text-muted-foreground/50" />
        )}
      </button>
    </TableHead>
  );
}

// 검색·필터·페이지네이션 전부 서버 사이드(getProducts)로 처리되므로(PRD
// 7.6.1), MasterListTable(Task 032)과 달리 클라이언트에서 재필터링/재정렬하지
// 않고 서버가 이미 페이지네이션한 items를 그대로 렌더링만 한다. 행 클릭과
// 페이지 이동은 URL(page 쿼리) 변경 → 서버 컴포넌트 재조회로 이어진다.
export function ProductTable({
  items,
  total,
  page,
  pageSize,
  sortBy,
  sortDir,
}: ProductTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPending, startBulkTransition] = useTransition();
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // 페이지/필터가 바뀌거나 일괄작업 후 목록이 새로 내려오면(=items 참조가
  // 바뀌면) 더 이상 화면에 없는 행이 선택 상태로 남지 않도록 선택을 비운다.
  // 렌더링 중 state를 조정하는 React 공식 패턴(effect 없이 prop 변경 감지)이다.
  const [itemsSnapshot, setItemsSnapshot] = useState(items);
  if (items !== itemsSnapshot) {
    setItemsSnapshot(items);
    setSelectedIds(new Set());
  }

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  const selectedIdList = useMemo(() => [...selectedIds], [selectedIds]);

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

  // 같은 컬럼을 다시 클릭하면 오름차순 ↔ 내림차순을 토글하고, 다른 컬럼을
  // 클릭하면 오름차순부터 시작한다. 정렬 결과 자체(=몇 건인지)는 바뀌지
  // 않지만 사용자가 보던 순서가 바뀌므로 첫 페이지로 되돌린다.
  const handleSort = useCallback(
    (field: ProductSortField) => {
      const params = new URLSearchParams(searchParams.toString());
      const nextDir = sortBy === field && sortDir === "asc" ? "desc" : "asc";
      params.set("sortBy", field);
      params.set("sortDir", nextDir);
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, sortBy, sortDir],
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

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  }

  function toggleOne(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function handleBulkActive(next: boolean) {
    startBulkTransition(async () => {
      const result = await bulkSetMasterActiveAction(
        "product",
        selectedIdList,
        next,
      );
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(
        next
          ? `${selectedIdList.length}건을 사용으로 전환했습니다.`
          : `${selectedIdList.length}건을 미사용으로 전환했습니다.`,
      );
    });
  }

  function handleBulkDelete(event: { preventDefault: () => void }) {
    event.preventDefault();
    startBulkTransition(async () => {
      const result = await bulkDeleteMasterAction("product", selectedIdList);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(`${selectedIdList.length}건을 삭제했습니다.`);
      setBulkDeleteOpen(false);
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      {selectedIds.size > 0 ? (
        <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 px-3 py-2">
          <p className="text-sm font-medium">{selectedIds.size}개 선택됨</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={bulkPending}
            onClick={() => setSelectedIds(new Set())}
          >
            선택 해제
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={bulkPending}
                className="ml-auto"
              >
                일괄작업
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleBulkActive(true)}>
                사용으로 전환
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleBulkActive(false)}>
                미사용으로 전환
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setBulkDeleteOpen(true)}
              >
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">총 {total}건</p>
      )}

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={someSelected ? "indeterminate" : allSelected}
                  onCheckedChange={toggleAll}
                  disabled={items.length === 0 || bulkPending}
                  aria-label="전체 선택"
                />
              </TableHead>
              <TableHead>썸네일</TableHead>
              <SortableHead
                field="code"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
              >
                상품코드
              </SortableHead>
              <SortableHead
                field="name"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
              >
                상품명
              </SortableHead>
              <TableHead>라인</TableHead>
              <TableHead>컬러</TableHead>
              <SortableHead
                field="gender"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
              >
                성별
              </SortableHead>
              <TableHead>사이즈</TableHead>
              <SortableHead
                field="isActive"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
              >
                사용여부
              </SortableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length ? (
              items.map((item) => (
                <TableRow
                  key={item.id}
                  tabIndex={0}
                  role="button"
                  data-state={selectedIds.has(item.id) ? "selected" : undefined}
                  className="cursor-pointer outline-hidden focus-visible:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  onClick={() => goToDetail(item.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      goToDetail(item.id);
                    }
                  }}
                >
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={(checked) =>
                        toggleOne(item.id, checked === true)
                      }
                      disabled={bulkPending}
                      aria-label={
                        selectedIds.has(item.id)
                          ? `${item.name} 선택 해제`
                          : `${item.name} 선택`
                      }
                    />
                  </TableCell>
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
                <TableCell colSpan={9} className="h-24 text-center">
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

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상품 일괄 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              선택한 {selectedIdList.length}개 상품을 삭제하시겠습니까? 이
              작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkPending}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkPending}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
