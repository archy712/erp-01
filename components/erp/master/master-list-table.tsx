"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import type { MasterEntityKey } from "@/lib/erp/master/entities";
import { SortOrderCell } from "./sort-order-cell";

// 5개 화면(Task 033~037)이 공유하는 목록 행의 최소 형태. 화면별 타입(Company,
// Brand 등, lib/erp/master/types.ts)은 이미 이 형태를 구조적으로 만족한다.
export type MasterListRow = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  note: string | null;
};

type MasterListTableProps<T extends MasterListRow> = {
  /** Switch/SortOrderCell이 호출할 서버 액션의 대상 엔티티. */
  entity: MasterEntityKey;
  /** sort_order 오름차순으로 이미 정렬된 "형제" 전체 목록. SortOrderCell의 위/아래 비활성 판정 기준이 된다(검색으로 필터링되기 전 순서). */
  rows: T[];
  onRowClick: (row: T) => void;
  /** 코드/명칭/사용여부/정렬순서/비고 다음에 이어붙일 화면별 추가 컬럼(예: 법인 관리의 "등록일"). */
  extraColumns?: ColumnDef<T>[];
  searchPlaceholder?: string;
  emptyMessage?: string;
};

export function MasterListTable<T extends MasterListRow>({
  entity,
  rows,
  onRowClick,
  extraColumns,
  searchPlaceholder = "코드/명칭 검색",
  emptyMessage = "등록된 항목이 없습니다.",
}: MasterListTableProps<T>) {
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  // SortOrderCell의 위/아래 비활성화는 검색 필터와 무관하게 "형제 전체 안에서의
  // 위치"를 기준으로 판정해야 한다(검색 중에도 실제 이동 대상은 전체 형제이므로).
  const orderIndex = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach((row, index) => map.set(row.id, index));
    return map;
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (row) =>
        row.code.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q),
    );
  }, [rows, search]);

  // 검색어가 바뀌면 결과 수가 달라지므로 첫 페이지로 되돌린다(user-table.tsx와 동일 패턴).
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search]);

  const handleActiveToggle = useCallback(
    (row: T, next: boolean) => {
      setPendingId(row.id);
      startTransition(async () => {
        const result = await setMasterActiveAction(entity, row.id, next);
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
    [entity],
  );

  const columns = useMemo<ColumnDef<T>[]>(() => {
    const base: ColumnDef<T>[] = [
      {
        accessorKey: "code",
        header: "코드",
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.code}</span>
        ),
      },
      {
        accessorKey: "name",
        header: "명칭",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="truncate">{row.original.name}</span>
            {!row.original.isActive ? (
              <Badge variant="outline" className="shrink-0 text-[10px]">
                비활성
              </Badge>
            ) : null}
          </div>
        ),
      },
      {
        id: "isActive",
        header: "사용여부",
        cell: ({ row }) => (
          <div onClick={(event) => event.stopPropagation()}>
            <Switch
              checked={row.original.isActive}
              disabled={pendingId === row.original.id}
              onCheckedChange={(checked) =>
                handleActiveToggle(row.original, checked)
              }
              aria-label={row.original.isActive ? "사용 중지" : "사용 시작"}
            />
          </div>
        ),
      },
      {
        id: "sortOrder",
        header: "정렬순서",
        cell: ({ row }) => {
          const index = orderIndex.get(row.original.id) ?? 0;
          return (
            <SortOrderCell
              entity={entity}
              id={row.original.id}
              disableUp={index <= 0}
              disableDown={index >= rows.length - 1}
            />
          );
        },
      },
      {
        accessorKey: "note",
        header: "비고",
        cell: ({ row }) => (
          <span className="truncate text-sm text-muted-foreground">
            {row.original.note ?? "-"}
          </span>
        ),
      },
    ];
    return extraColumns ? [...base, ...extraColumns] : base;
  }, [
    entity,
    orderIndex,
    rows.length,
    pendingId,
    extraColumns,
    handleActiveToggle,
  ]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full sm:max-w-xs"
        />
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          총 {filtered.length}건
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  tabIndex={0}
                  role="button"
                  className="cursor-pointer outline-hidden focus-visible:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  onClick={() => onRowClick(row.original)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onRowClick(row.original);
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {table.getPageCount() === 0
            ? "페이지 없음"
            : `${pagination.pageIndex + 1} / ${table.getPageCount()} 페이지`}
        </p>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  table.previousPage();
                }}
                className={
                  !table.getCanPreviousPage()
                    ? "pointer-events-none opacity-50"
                    : undefined
                }
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  table.nextPage();
                }}
                className={
                  !table.getCanNextPage()
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
