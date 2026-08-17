"use client";

import { MousePointerClick, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MasterEntityInput } from "@/lib/erp/master/actions";
import type {
  Brand,
  BrandLine,
  Company,
  SmallBrand,
} from "@/lib/erp/master/types";
import { MasterDeleteDialog } from "./master-delete-dialog";
import { MasterDetailLayout } from "./master-detail-layout";
import {
  MasterFormSheet,
  type MasterFormReadOnlyField,
  type MasterFormRecord,
} from "./master-form-sheet";
import { MasterListTable } from "./master-list-table";
import { MasterTreePanel, type MasterTreeNode } from "./master-tree-panel";

type BrandTab = "small_brands" | "brand_lines";

// 소브랜드/라인은 브랜드의 형제 자식(PRD 4.2 각주) — 좌측 트리는 법인→브랜드
// 2단계까지만 표시하고, 소브랜드/라인은 트리를 더 펼치지 않고 우측 탭으로만
// 분리한다. 그래야 "소브랜드가 라인의 상위가 아니다"라는 사실이 트리 깊이가
// 아니라 탭 UI로 명확히 드러난다.
type ManagedChildEntity = "brand" | "smallBrand" | "brandLine";

type EditingState = {
  entity: ManagedChildEntity;
  record: MasterFormRecord;
  readOnlyFields: MasterFormReadOnlyField[];
};

type DeletingState = {
  entity: ManagedChildEntity;
  record: { id: string; name: string; isActive: boolean };
};

type CreateContext = {
  entity: ManagedChildEntity;
  parentInput: Partial<MasterEntityInput>;
  readOnlyFields: MasterFormReadOnlyField[];
  defaultSortOrder: number;
  buttonLabel: string;
};

function toFormRecord(row: {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  note: string | null;
}): MasterFormRecord {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    note: row.note,
  };
}

export function BrandStructureManager({
  breadcrumb,
  companies,
  brands,
  selectedCompanyId,
  selectedBrand,
  smallBrands,
  brandLines,
  activeTab,
}: {
  breadcrumb?: string[];
  companies: Company[];
  brands: Brand[];
  selectedCompanyId: string | null;
  selectedBrand: Brand | null;
  smallBrands: SmallBrand[];
  brandLines: BrandLine[];
  activeTab: BrandTab;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [deleting, setDeleting] = useState<DeletingState | null>(null);

  const companyById = useMemo(
    () => new Map(companies.map((company) => [company.id, company])),
    [companies],
  );
  const brandById = useMemo(
    () => new Map(brands.map((brand) => [brand.id, brand])),
    [brands],
  );

  const treeNodes = useMemo<MasterTreeNode[]>(
    () =>
      companies.map((company) => ({
        id: company.id,
        name: company.name,
        isActive: company.isActive,
        children: brands
          .filter((brand) => brand.companyId === company.id)
          .map((brand) => ({
            id: brand.id,
            name: brand.name,
            isActive: brand.isActive,
          })),
      })),
    [companies, brands],
  );

  const brandsOfSelectedCompany = useMemo(
    () =>
      selectedCompanyId
        ? brands.filter((brand) => brand.companyId === selectedCompanyId)
        : [],
    [brands, selectedCompanyId],
  );

  const selectedCompanyName = selectedCompanyId
    ? (companyById.get(selectedCompanyId)?.name ?? "")
    : "";

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleTreeSelect(id: string) {
    const brand = brandById.get(id);
    if (brand) {
      navigate({
        companyId: brand.companyId,
        brandId: brand.id,
        tab: searchParams.get("tab") ?? "small_brands",
      });
    } else if (companyById.has(id)) {
      navigate({ companyId: id, brandId: null, tab: null });
    } else {
      return;
    }
    setMobileTreeOpen(false);
  }

  function handleTabChange(tab: BrandTab) {
    navigate({ tab });
  }

  const createContext: CreateContext | null = selectedBrand
    ? {
        entity: activeTab === "small_brands" ? "smallBrand" : "brandLine",
        parentInput: { brandId: selectedBrand.id },
        readOnlyFields: [{ label: "소속 브랜드", value: selectedBrand.name }],
        defaultSortOrder:
          activeTab === "small_brands" ? smallBrands.length : brandLines.length,
        buttonLabel:
          activeTab === "small_brands" ? "소브랜드 등록" : "라인 등록",
      }
    : selectedCompanyId
      ? {
          entity: "brand",
          parentInput: { companyId: selectedCompanyId },
          readOnlyFields: [{ label: "소속 법인", value: selectedCompanyName }],
          defaultSortOrder: brandsOfSelectedCompany.length,
          buttonLabel: "브랜드 등록",
        }
      : null;

  function handleEditBrand(row: Brand) {
    setEditing({
      entity: "brand",
      record: toFormRecord(row),
      readOnlyFields: [{ label: "소속 법인", value: selectedCompanyName }],
    });
  }

  function handleEditSmallBrand(row: SmallBrand) {
    setEditing({
      entity: "smallBrand",
      record: toFormRecord(row),
      readOnlyFields: [
        { label: "소속 브랜드", value: selectedBrand?.name ?? "" },
      ],
    });
  }

  function handleEditBrandLine(row: BrandLine) {
    setEditing({
      entity: "brandLine",
      record: toFormRecord(row),
      readOnlyFields: [
        { label: "소속 브랜드", value: selectedBrand?.name ?? "" },
      ],
    });
  }

  function handleDeleteRequested() {
    if (!editing) return;
    setDeleting({
      entity: editing.entity,
      record: {
        id: editing.record.id,
        name: editing.record.name,
        isActive: editing.record.isActive,
      },
    });
  }

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title="브랜드 관리" />

      <MasterDetailLayout
        treeTitle="법인 / 브랜드"
        mobileTreeOpen={mobileTreeOpen}
        onMobileTreeOpenChange={setMobileTreeOpen}
        tree={
          <MasterTreePanel
            nodes={treeNodes}
            selectedId={selectedBrand?.id ?? selectedCompanyId}
            onSelect={handleTreeSelect}
            searchPlaceholder="법인명/브랜드명 검색"
            emptyMessage="등록된 법인이 없습니다."
            ariaLabel="법인/브랜드 트리"
          />
        }
        content={
          <div className="flex flex-1 flex-col">
            {!selectedCompanyId ? (
              <Empty className="flex-1 border-0 p-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <MousePointerClick />
                  </EmptyMedia>
                  <EmptyDescription>
                    왼쪽 트리에서 법인 또는 브랜드를 선택하세요.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : !selectedBrand ? (
              <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between gap-2 border-b px-4 py-3 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      {selectedCompanyName}
                    </p>
                    <h2 className="text-sm font-medium">브랜드 목록</h2>
                  </div>
                  {createContext ? (
                    <Button size="sm" onClick={() => setCreateOpen(true)}>
                      <Plus />
                      {createContext.buttonLabel}
                    </Button>
                  ) : null}
                </div>
                <MasterListTable
                  entity="brand"
                  rows={brandsOfSelectedCompany}
                  onRowClick={handleEditBrand}
                  searchPlaceholder="브랜드코드/브랜드명 검색"
                  emptyMessage="등록된 브랜드가 없습니다."
                />
              </div>
            ) : (
              <div className="flex flex-1 flex-col">
                <div className="flex items-center justify-between gap-2 border-b px-4 py-3 sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      {selectedCompanyName} / {selectedBrand.name}
                    </p>
                    <h2 className="text-sm font-medium">
                      {activeTab === "small_brands"
                        ? "소브랜드 관리"
                        : "라인 관리"}
                    </h2>
                  </div>
                  {createContext ? (
                    <Button size="sm" onClick={() => setCreateOpen(true)}>
                      <Plus />
                      {createContext.buttonLabel}
                    </Button>
                  ) : null}
                </div>
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => handleTabChange(value as BrandTab)}
                  className="flex flex-1 flex-col gap-0"
                >
                  <div className="border-b px-4 py-2 sm:px-6">
                    <TabsList>
                      <TabsTrigger value="small_brands" className="gap-1.5">
                        소브랜드
                        <Badge variant="secondary" className="text-[10px]">
                          {smallBrands.length}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="brand_lines" className="gap-1.5">
                        라인
                        <Badge variant="secondary" className="text-[10px]">
                          {brandLines.length}
                        </Badge>
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  <TabsContent
                    value="small_brands"
                    className="mt-0 flex flex-1 flex-col"
                  >
                    <MasterListTable
                      entity="smallBrand"
                      rows={smallBrands}
                      onRowClick={handleEditSmallBrand}
                      searchPlaceholder="소브랜드코드/소브랜드명 검색"
                      emptyMessage="등록된 소브랜드가 없습니다."
                    />
                  </TabsContent>
                  <TabsContent
                    value="brand_lines"
                    className="mt-0 flex flex-1 flex-col"
                  >
                    <MasterListTable
                      entity="brandLine"
                      rows={brandLines}
                      onRowClick={handleEditBrandLine}
                      searchPlaceholder="라인코드/라인명 검색"
                      emptyMessage="등록된 라인이 없습니다."
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        }
      />

      {createContext ? (
        <MasterFormSheet
          key={`create-${createContext.entity}-${selectedBrand?.id ?? selectedCompanyId}`}
          entity={createContext.entity}
          mode="create"
          open={createOpen}
          onOpenChange={setCreateOpen}
          readOnlyFields={createContext.readOnlyFields}
          parentInput={createContext.parentInput}
          defaultSortOrder={createContext.defaultSortOrder}
        />
      ) : null}

      {editing ? (
        <MasterFormSheet
          entity={editing.entity}
          mode="edit"
          open={!!editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
          record={editing.record}
          readOnlyFields={editing.readOnlyFields}
          onDelete={handleDeleteRequested}
        />
      ) : null}

      <MasterDeleteDialog
        entity={deleting?.entity ?? "brand"}
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        record={deleting?.record ?? null}
        onDeleted={() => {
          setDeleting(null);
          setEditing(null);
        }}
      />
    </div>
  );
}
