"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { PageHeader } from "@/components/erp/page-header";
import type { Company } from "@/lib/erp/master/types";
import { MasterDeleteDialog } from "./master-delete-dialog";
import { MasterFormSheet, type MasterFormRecord } from "./master-form-sheet";
import { MasterListTable } from "./master-list-table";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function toFormRecord(company: Company): MasterFormRecord {
  return {
    id: company.id,
    code: company.code,
    name: company.name,
    sortOrder: company.sortOrder,
    isActive: company.isActive,
    note: company.note,
  };
}

// 법인 관리(PRD 7.1) — 5개 화면 중 유일하게 좌측 트리가 없는 단일 목록형이라
// MasterDetailLayout/MasterTreePanel은 쓰지 않고 MasterListTable +
// MasterFormSheet + MasterDeleteDialog만 조합한다.
export function CompanyManager({
  companies,
  breadcrumb,
}: {
  companies: Company[];
  breadcrumb?: string[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState<Company | null>(null);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        breadcrumb={breadcrumb}
        title="법인 관리"
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus />
            법인 등록
          </Button>
        }
      />

      <MasterListTable
        entity="company"
        rows={companies}
        onRowClick={(row) => setEditing(row)}
        searchPlaceholder="법인코드/법인명 검색"
        emptyMessage="등록된 법인이 없습니다."
        extraColumns={[
          {
            accessorKey: "createdAt",
            header: ({ column }) => (
              <DataTableColumnHeader column={column} title="등록일" />
            ),
            cell: ({ row }) => (
              <span className="text-sm text-muted-foreground">
                {formatDate(row.original.createdAt)}
              </span>
            ),
          },
        ]}
      />

      <MasterFormSheet
        entity="company"
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultSortOrder={companies.length}
      />

      {editing ? (
        <MasterFormSheet
          entity="company"
          mode="edit"
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          record={toFormRecord(editing)}
          onDelete={() => setDeleting(editing)}
        />
      ) : null}

      <MasterDeleteDialog
        entity="company"
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        record={deleting}
        onDeleted={() => {
          setDeleting(null);
          setEditing(null);
        }}
      />
    </div>
  );
}
