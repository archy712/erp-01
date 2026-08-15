"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useState, useTransition } from "react";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { setUserActiveAction, setUserAdminRoleAction } from "@/lib/erp/actions";
import type { ErpUserListItem } from "@/lib/erp/queries";
import {
  ROLE_BADGE_VARIANT,
  ROLE_LABEL,
  isAdminRole,
} from "@/lib/erp/role-labels";
import type { UserRole } from "@/lib/erp/types";

type UserTableProps = {
  users: ErpUserListItem[];
  currentUserId: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function initialsOf(name: string | null, email: string | null): string {
  const source = name ?? email ?? "?";
  return source.slice(0, 1).toUpperCase();
}

export function UserTable({ users, currentUserId }: UserTableProps) {
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (user) =>
        (user.email ?? "").toLowerCase().includes(q) ||
        (user.name ?? "").toLowerCase().includes(q),
    );
  }, [users, search]);

  // 검색어가 바뀌면 결과 수가 달라지므로 첫 페이지로 되돌린다.
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [search]);

  function handleActiveToggle(user: ErpUserListItem, next: boolean) {
    setPendingId(user.id);
    startTransition(async () => {
      const result = await setUserActiveAction(user.id, next);
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(
          next ? "사용자를 활성화했습니다." : "사용자를 비활성화했습니다.",
        );
      }
      setPendingId(null);
    });
  }

  function handleRoleChange(user: ErpUserListItem, makeAdmin: boolean) {
    setPendingId(user.id);
    startTransition(async () => {
      const result = await setUserAdminRoleAction(user.id, makeAdmin);
      if (!result.success) {
        toast.error(result.message);
      } else {
        toast.success(
          makeAdmin ? "관리자로 지정했습니다." : "관리자 권한을 회수했습니다.",
        );
      }
      setPendingId(null);
    });
  }

  const columns = useMemo<ColumnDef<ErpUserListItem>[]>(
    () => [
      {
        id: "avatar",
        header: "아바타",
        cell: ({ row }) => (
          <Avatar size="sm">
            <AvatarFallback>
              {initialsOf(row.original.name, row.original.email)}
            </AvatarFallback>
          </Avatar>
        ),
      },
      {
        accessorKey: "email",
        header: "이메일",
        cell: ({ row }) => row.original.email ?? "-",
      },
      {
        accessorKey: "name",
        header: "이름",
        cell: ({ row }) => row.original.name ?? "-",
      },
      {
        accessorKey: "role",
        header: "역할",
        cell: ({ row }) => {
          const role = row.original.role as UserRole;
          return (
            <Badge variant={ROLE_BADGE_VARIANT[role]}>{ROLE_LABEL[role]}</Badge>
          );
        },
      },
      {
        id: "adminToggle",
        header: "관리자 지정",
        cell: ({ row }) => {
          const user = row.original;
          const role = user.role as UserRole;
          const currentlyAdmin = isAdminRole(role);
          const isSelf = user.id === currentUserId;
          const isRowPending = pendingId === user.id;

          // superadmin 승격/강등은 이 화면 범위 밖(DB 트리거가 admin이 아닌 상태에서
          // superadmin 직접 승격을 막고, 강등은 별도 관리 정책이 필요) — 배지만 표시.
          if (role === "superadmin") {
            return (
              <span className="text-xs text-muted-foreground">최고 관리자</span>
            );
          }

          const disableDemote = isSelf && currentlyAdmin;

          return (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={currentlyAdmin ? "destructive" : "secondary"}
                  size="sm"
                  disabled={isRowPending || disableDemote}
                  title={
                    disableDemote
                      ? "자기 자신의 관리자 권한은 회수할 수 없습니다."
                      : undefined
                  }
                >
                  {currentlyAdmin ? "관리자 해제" : "관리자 지정"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {currentlyAdmin
                      ? "관리자 권한을 회수할까요?"
                      : "관리자로 지정할까요?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {currentlyAdmin
                      ? `${user.email} 사용자의 관리자 권한을 회수합니다. 이 사용자는 더 이상 관리자 화면에 접근할 수 없습니다.`
                      : `${user.email} 사용자에게 관리자 권한을 부여합니다. 모든 메뉴에 접근할 수 있게 됩니다.`}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleRoleChange(user, !currentlyAdmin)}
                  >
                    확인
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        },
      },
      {
        id: "isActive",
        header: "활성 여부",
        cell: ({ row }) => {
          const user = row.original;
          const isRowPending = pendingId === user.id;
          return (
            <Switch
              checked={user.is_active}
              disabled={isRowPending}
              onCheckedChange={(checked) => handleActiveToggle(user, checked)}
              aria-label={user.is_active ? "비활성화" : "활성화"}
            />
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "가입일",
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    [currentUserId, pendingId],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <div className="flex items-center justify-between gap-2">
        <Input
          placeholder="이메일 또는 이름으로 검색"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-xs"
        />
        <span className="text-sm text-muted-foreground">
          총 {filtered.length}명
        </span>
      </div>

      <div className="overflow-hidden rounded-md border">
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
                <TableRow key={row.id}>
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
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {table.getPageCount() === 0
            ? "0 / 0 페이지"
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
