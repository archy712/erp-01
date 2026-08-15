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
  getRoleLabel,
  isAdminRole,
} from "@/lib/erp/role-labels";
import type { UserRole } from "@/lib/erp/types";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

type UserTableProps = {
  users: ErpUserListItem[];
  currentUserId: string;
  dict: Dictionary;
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

export function UserTable({ users, currentUserId, dict }: UserTableProps) {
  const t = dict.admin.users;
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

  const handleActiveToggle = useCallback(
    (user: ErpUserListItem, next: boolean) => {
      setPendingId(user.id);
      startTransition(async () => {
        const result = await setUserActiveAction(user.id, next);
        if (!result.success) {
          toast.error(result.message);
        } else {
          toast.success(next ? t.activateToast : t.deactivateToast);
        }
        setPendingId(null);
      });
    },
    [t],
  );

  const handleRoleChange = useCallback(
    (user: ErpUserListItem, makeAdmin: boolean) => {
      setPendingId(user.id);
      startTransition(async () => {
        const result = await setUserAdminRoleAction(user.id, makeAdmin);
        if (!result.success) {
          toast.error(result.message);
        } else {
          toast.success(makeAdmin ? t.promoteToast : t.demoteToast);
        }
        setPendingId(null);
      });
    },
    [t],
  );

  const columns = useMemo<ColumnDef<ErpUserListItem>[]>(
    () => [
      {
        id: "avatar",
        header: t.columnAvatar,
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
        header: t.columnEmail,
        cell: ({ row }) => row.original.email ?? "-",
      },
      {
        accessorKey: "name",
        header: t.columnName,
        cell: ({ row }) => row.original.name ?? "-",
      },
      {
        accessorKey: "role",
        header: t.columnRole,
        cell: ({ row }) => {
          const role = row.original.role as UserRole;
          return (
            <Badge variant={ROLE_BADGE_VARIANT[role]}>
              {getRoleLabel(role, dict)}
            </Badge>
          );
        },
      },
      {
        id: "adminToggle",
        header: t.columnAdminToggle,
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
              <span className="text-xs text-muted-foreground">
                {t.superAdminLabel}
              </span>
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
                  title={disableDemote ? t.selfDemoteBlocked : undefined}
                >
                  {currentlyAdmin ? t.demoteButton : t.promoteButton}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {currentlyAdmin
                      ? t.demoteConfirmTitle
                      : t.promoteConfirmTitle}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {(currentlyAdmin
                      ? t.demoteConfirmDescription
                      : t.promoteConfirmDescription
                    ).replace("{email}", user.email ?? "")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleRoleChange(user, !currentlyAdmin)}
                  >
                    {t.confirm}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        },
      },
      {
        id: "isActive",
        header: t.columnIsActive,
        cell: ({ row }) => {
          const user = row.original;
          const isRowPending = pendingId === user.id;
          return (
            <Switch
              checked={user.is_active}
              disabled={isRowPending}
              onCheckedChange={(checked) => handleActiveToggle(user, checked)}
              aria-label={
                user.is_active ? t.deactivateAriaLabel : t.activateAriaLabel
              }
            />
          );
        },
      },
      {
        accessorKey: "created_at",
        header: t.columnCreatedAt,
        cell: ({ row }) => formatDate(row.original.created_at),
      },
    ],
    [currentUserId, pendingId, t, dict, handleActiveToggle, handleRoleChange],
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
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full sm:max-w-xs"
        />
        <span className="text-sm whitespace-nowrap text-muted-foreground">
          {t.totalCount.replace("{count}", String(filtered.length))}
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
                  {t.noResults}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {table.getPageCount() === 0
            ? t.noPages
            : t.pageIndicator
                .replace("{current}", String(pagination.pageIndex + 1))
                .replace("{total}", String(table.getPageCount()))}
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
