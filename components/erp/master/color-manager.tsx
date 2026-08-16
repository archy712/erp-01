"use client";

import { LayoutGrid, MousePointerClick, Plus, Table2 } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { MasterEntityInput } from "@/lib/erp/master/actions";
import type {
  Brand,
  BrandColor,
  BrandColorType,
  Company,
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
import { ScopeSelector, type ScopeSelectorLevel } from "./scope-selector";

// 컬러타입은 컬러의 유일한 상위 레벨(브랜드 > 컬러타입 > 컬러 3단 중 가운데
// 단)이라 아이템 분류 관리(3단, itemType/item/subItem)와 달리 트리가 아니라
// 평평한 목록이다 — MasterTreePanel에 children 없는 노드만 넘겨 재사용한다.
type ManagedEntity = "brandColorType" | "brandColor";

type ViewMode = "grid" | "table";

type EditingState = {
  entity: ManagedEntity;
  record: MasterFormRecord;
  readOnlyFields: MasterFormReadOnlyField[];
};

type DeletingState = {
  entity: ManagedEntity;
  record: { id: string; name: string; isActive: boolean };
};

type CreateContext = {
  entity: ManagedEntity;
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

export function ColorManager({
  breadcrumb,
  companies,
  brands,
  colorTypes,
  colors,
  selectedCompanyId,
  selectedBrandId,
  selectedColorType,
}: {
  breadcrumb?: string[];
  companies: Company[];
  /** 선택된 법인 소속 브랜드만(ScopeSelector 옵션, activeOnly). */
  brands: Brand[];
  /** 선택된 브랜드 소속 컬러타입 전체(비활성 포함 — 좌측 목록용). */
  colorTypes: BrandColorType[];
  /** 선택된 컬러타입 소속 컬러 전체(비활성 포함). */
  colors: BrandColor[];
  selectedCompanyId: string | null;
  selectedBrandId: string | null;
  selectedColorType: BrandColorType | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [deleting, setDeleting] = useState<DeletingState | null>(null);
  // 정렬순서·비고 편집은 테이블이, 색상 비교는 그리드가 편하므로 두 표시
  // 방식을 토글로 제공한다(PRD 7.4). URL 상태로 관리하지 않는 단순 표시
  // 설정이라 로컬 state로 충분하다.
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const selectedBrand = useMemo(
    () => brands.find((b) => b.id === selectedBrandId) ?? null,
    [brands, selectedBrandId],
  );

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // 상위 스코프(법인/브랜드) 변경 시 하위 선택(컬러타입)까지 함께 초기화한다
  // — "이전 브랜드의 컬러타입이 남지 않는다"는 다른 화면들과 동일한 규칙.
  function handleCompanyChange(id: string) {
    navigate({ companyId: id, brandId: null, colorTypeId: null });
  }

  function handleBrandChange(id: string) {
    navigate({ brandId: id, colorTypeId: null });
  }

  const scopeLevels: ScopeSelectorLevel[] = [
    {
      key: "company",
      label: "법인",
      value: selectedCompanyId,
      onChange: handleCompanyChange,
      options: companies.map((c) => ({ id: c.id, name: c.name })),
    },
    {
      key: "brand",
      label: "브랜드",
      value: selectedBrandId,
      onChange: handleBrandChange,
      options: brands.map((b) => ({ id: b.id, name: b.name })),
      disabled: !selectedCompanyId,
    },
  ];

  const treeNodes = useMemo<MasterTreeNode[]>(
    () =>
      colorTypes.map((colorType) => ({
        id: colorType.id,
        name: colorType.name,
        isActive: colorType.isActive,
      })),
    [colorTypes],
  );

  function handleTreeSelect(id: string) {
    navigate({ colorTypeId: id });
    setMobileTreeOpen(false);
  }

  const createContext: CreateContext | null = selectedColorType
    ? {
        entity: "brandColor",
        parentInput: { brandColorTypeId: selectedColorType.id },
        readOnlyFields: [
          { label: "소속 컬러타입", value: selectedColorType.name },
        ],
        defaultSortOrder: colors.length,
        buttonLabel: "컬러 등록",
      }
    : selectedBrand
      ? {
          entity: "brandColorType",
          parentInput: { brandId: selectedBrand.id },
          readOnlyFields: [{ label: "소속 브랜드", value: selectedBrand.name }],
          defaultSortOrder: colorTypes.length,
          buttonLabel: "컬러타입 등록",
        }
      : null;

  function handleEditColorType(row: BrandColorType) {
    setEditing({
      entity: "brandColorType",
      record: toFormRecord(row),
      readOnlyFields: [
        { label: "소속 브랜드", value: selectedBrand?.name ?? "" },
      ],
    });
  }

  function handleEditColor(row: BrandColor) {
    setEditing({
      entity: "brandColor",
      record: { ...toFormRecord(row), rgbHex: row.rgbHex },
      readOnlyFields: [
        { label: "소속 컬러타입", value: selectedColorType?.name ?? "" },
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

  const contentTitle = selectedColorType ? "컬러 관리" : "컬러타입 관리";

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title="컬러 관리" />

      <div className="border-b px-4 py-4 sm:px-6">
        <ScopeSelector levels={scopeLevels} />
      </div>

      {!selectedBrand ? (
        <Empty className="flex-1 border-0 p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MousePointerClick />
            </EmptyMedia>
            <EmptyDescription>
              법인 → 브랜드를 순서대로 선택하면 컬러타입/컬러를 관리할 수
              있습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <MasterDetailLayout
          treeTitle="컬러타입"
          mobileTreeOpen={mobileTreeOpen}
          onMobileTreeOpenChange={setMobileTreeOpen}
          tree={
            <MasterTreePanel
              nodes={treeNodes}
              selectedId={selectedColorType?.id ?? null}
              onSelect={handleTreeSelect}
              searchPlaceholder="컬러타입명 검색"
              emptyMessage="등록된 컬러타입이 없습니다."
              ariaLabel="컬러타입 목록"
            />
          }
          content={
            <div className="flex flex-1 flex-col">
              <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <p className="truncate text-xs text-muted-foreground">
                    {selectedBrand.name}
                    {selectedColorType ? ` / ${selectedColorType.name}` : ""}
                  </p>
                  <h2 className="text-sm font-medium">{contentTitle}</h2>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {selectedColorType ? (
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      value={viewMode}
                      onValueChange={(value) => {
                        if (value) setViewMode(value as ViewMode);
                      }}
                      aria-label="컬러 표시 방식"
                    >
                      <ToggleGroupItem value="grid" aria-label="그리드로 보기">
                        <LayoutGrid />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="table" aria-label="테이블로 보기">
                        <Table2 />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  ) : null}
                  {createContext ? (
                    <Button size="sm" onClick={() => setCreateOpen(true)}>
                      <Plus />
                      {createContext.buttonLabel}
                    </Button>
                  ) : null}
                </div>
              </div>

              {selectedColorType ? (
                viewMode === "grid" ? (
                  <ColorGrid
                    colors={colors}
                    onCardClick={handleEditColor}
                    emptyMessage="등록된 컬러가 없습니다."
                  />
                ) : (
                  <MasterListTable
                    entity="brandColor"
                    rows={colors}
                    onRowClick={handleEditColor}
                    searchPlaceholder="컬러코드/컬러명 검색"
                    emptyMessage="등록된 컬러가 없습니다."
                  />
                )
              ) : (
                <MasterListTable
                  entity="brandColorType"
                  rows={colorTypes}
                  onRowClick={handleEditColorType}
                  searchPlaceholder="컬러타입코드/컬러타입명 검색"
                  emptyMessage="등록된 컬러타입이 없습니다."
                />
              )}
            </div>
          }
        />
      )}

      {createContext ? (
        <MasterFormSheet
          key={`create-${createContext.entity}-${
            selectedColorType?.id ?? selectedBrand?.id
          }`}
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
        entity={deleting?.entity ?? "brandColorType"}
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

// PRD 7.4 — 다른 화면과 달리 컬러는 테이블이 아니라 색상 스와치가 보이는
// 카드/그리드로 표현한다. MasterListTable의 행 클릭 패턴(키보드 접근성 포함)을
// 카드에도 동일하게 적용한다.
function ColorGrid({
  colors,
  onCardClick,
  emptyMessage,
}: {
  colors: BrandColor[];
  onCardClick: (color: BrandColor) => void;
  emptyMessage: string;
}) {
  if (colors.length === 0) {
    return (
      <Empty className="flex-1 border-0 p-6">
        <EmptyHeader>
          <EmptyDescription>{emptyMessage}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6">
      <p className="mb-3 text-sm text-muted-foreground">총 {colors.length}건</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {colors.map((color) => (
          <div
            key={color.id}
            role="button"
            tabIndex={0}
            onClick={() => onCardClick(color)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onCardClick(color);
              }
            }}
            className="flex cursor-pointer flex-col gap-2 rounded-lg border p-3 outline-hidden transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            {/*
             * 스와치는 사용자 데이터 색상 그 자체를 보여줘야 하므로 인라인
             * style을 쓴다 — Tailwind 임의값 클래스(`bg-[#...]`)는 동적 값에서
             * 동작하지 않고, CSS 변수 토큰으로는 표현할 수 없는 값이다
             * (color-swatch-input.tsx와 동일한 "하드코딩 색상 금지" 규칙의
             * 예외 지점). 밝은 색상(예: FFFFFF)이 라이트 테마 배경에 묻히지
             * 않도록 border 토큰을 항상 함께 적용한다.
             */}
            <span
              className="aspect-square w-full rounded-md border"
              style={{ backgroundColor: `#${color.rgbHex}` }}
              aria-hidden="true"
            />
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium">{color.name}</span>
              {!color.isActive ? (
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  비활성
                </Badge>
              ) : null}
            </div>
            <span className="truncate font-mono text-xs text-muted-foreground">
              {color.code}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
