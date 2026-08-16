"use client";

import { ChevronRight, MousePointerClick, Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import type { MasterEntityInput } from "@/lib/erp/master/actions";
import type {
  Brand,
  Company,
  Item,
  ItemType,
  SmallBrand,
  SubItem,
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

// 소브랜드 > 아이템타입 > 아이템 > 서브아이템의 4단 순차 체인 중, 뒤 3단(아이템타입/
// 아이템/서브아이템)만 이 화면이 CRUD로 관리한다. 소브랜드까지는 ScopeSelector로
// "시작점"만 좁히는 역할이라 이 유니언에 포함하지 않는다(brand-structure-manager의
// ManagedChildEntity와 동일한 설계).
type ManagedEntity = "itemType" | "item" | "subItem";

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

export function ItemCategoryManager({
  breadcrumb,
  companies,
  brands,
  smallBrands,
  itemTypes,
  items,
  subItems,
  selectedCompanyId,
  selectedBrandId,
  selectedSmallBrand,
  selectedItemTypeId,
  selectedItemId,
}: {
  breadcrumb?: string[];
  companies: Company[];
  /** 선택된 법인 소속 브랜드만(ScopeSelector 옵션). */
  brands: Brand[];
  /** 선택된 브랜드 소속 소브랜드만(ScopeSelector 옵션, activeOnly). */
  smallBrands: SmallBrand[];
  /** 선택된 소브랜드 소속 아이템타입 전체(비활성 포함 — 좌측 트리용). */
  itemTypes: ItemType[];
  /** 위 아이템타입들의 하위 아이템 전체(평탄화). */
  items: Item[];
  /** 위 아이템들의 하위 서브아이템 전체(평탄화). */
  subItems: SubItem[];
  selectedCompanyId: string | null;
  selectedBrandId: string | null;
  selectedSmallBrand: SmallBrand | null;
  selectedItemTypeId: string | null;
  selectedItemId: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [deleting, setDeleting] = useState<DeletingState | null>(null);

  const itemTypeById = useMemo(
    () => new Map(itemTypes.map((it) => [it.id, it])),
    [itemTypes],
  );
  const itemById = useMemo(
    () => new Map(items.map((it) => [it.id, it])),
    [items],
  );
  const subItemById = useMemo(
    () => new Map(subItems.map((it) => [it.id, it])),
    [subItems],
  );

  const selectedItemType = selectedItemTypeId
    ? (itemTypeById.get(selectedItemTypeId) ?? null)
    : null;
  const selectedItem = selectedItemId
    ? (itemById.get(selectedItemId) ?? null)
    : null;

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // 상위 스코프(법인/브랜드/소브랜드) 변경 시 하위 선택(아이템타입/아이템)까지
  // 함께 초기화한다 — "이전 소브랜드의 아이템타입이 남지 않는다"는 수락 기준.
  function handleCompanyChange(id: string) {
    navigate({
      companyId: id,
      brandId: null,
      smallBrandId: null,
      itemTypeId: null,
      itemId: null,
    });
  }

  function handleBrandChange(id: string) {
    navigate({
      brandId: id,
      smallBrandId: null,
      itemTypeId: null,
      itemId: null,
    });
  }

  function handleSmallBrandChange(id: string) {
    navigate({ smallBrandId: id, itemTypeId: null, itemId: null });
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
    {
      key: "smallBrand",
      label: "소브랜드",
      value: selectedSmallBrand?.id ?? null,
      onChange: handleSmallBrandChange,
      options: smallBrands.map((sb) => ({ id: sb.id, name: sb.name })),
      disabled: !selectedBrandId,
    },
  ];

  const treeNodes = useMemo<MasterTreeNode[]>(
    () =>
      itemTypes.map((itemType) => ({
        id: itemType.id,
        name: itemType.name,
        isActive: itemType.isActive,
        children: items
          .filter((item) => item.itemTypeId === itemType.id)
          .map((item) => ({
            id: item.id,
            name: item.name,
            isActive: item.isActive,
            children: subItems
              .filter((subItem) => subItem.itemId === item.id)
              .map((subItem) => ({
                id: subItem.id,
                name: subItem.name,
                isActive: subItem.isActive,
              })),
          })),
      })),
    [itemTypes, items, subItems],
  );

  // 트리는 아이템타입→아이템→서브아이템 3단을 모두 보여주지만(요구사항), URL
  // 선택 상태는 itemId까지만 관리한다(서브아이템은 우측 목록의 "행"으로만
  // 존재). 서브아이템 리프를 클릭하면 그 부모 아이템을 선택한 것과 동일하게
  // 처리해, 우측에 형제 서브아이템 목록(클릭한 항목 포함)이 뜨게 한다.
  function handleTreeSelect(id: string) {
    if (itemTypeById.has(id)) {
      navigate({ itemTypeId: id, itemId: null });
    } else if (itemById.has(id)) {
      const item = itemById.get(id)!;
      navigate({ itemTypeId: item.itemTypeId, itemId: id });
    } else if (subItemById.has(id)) {
      const subItem = subItemById.get(id)!;
      const parentItem = itemById.get(subItem.itemId);
      if (!parentItem) return;
      navigate({ itemTypeId: parentItem.itemTypeId, itemId: parentItem.id });
    } else {
      return;
    }
    setMobileTreeOpen(false);
  }

  const itemsOfSelectedItemType = useMemo(
    () =>
      selectedItemTypeId
        ? items.filter((item) => item.itemTypeId === selectedItemTypeId)
        : [],
    [items, selectedItemTypeId],
  );

  const subItemsOfSelectedItem = useMemo(
    () =>
      selectedItemId
        ? subItems.filter((subItem) => subItem.itemId === selectedItemId)
        : [],
    [subItems, selectedItemId],
  );

  const createContext: CreateContext | null = selectedItem
    ? {
        entity: "subItem",
        parentInput: { itemId: selectedItem.id },
        readOnlyFields: [{ label: "소속 아이템", value: selectedItem.name }],
        defaultSortOrder: subItemsOfSelectedItem.length,
        buttonLabel: "서브아이템 등록",
      }
    : selectedItemType
      ? {
          entity: "item",
          parentInput: { itemTypeId: selectedItemType.id },
          readOnlyFields: [
            { label: "소속 아이템타입", value: selectedItemType.name },
          ],
          defaultSortOrder: itemsOfSelectedItemType.length,
          buttonLabel: "아이템 등록",
        }
      : selectedSmallBrand
        ? {
            entity: "itemType",
            parentInput: { smallBrandId: selectedSmallBrand.id },
            readOnlyFields: [
              { label: "소속 소브랜드", value: selectedSmallBrand.name },
            ],
            defaultSortOrder: itemTypes.length,
            buttonLabel: "아이템타입 등록",
          }
        : null;

  function handleEditItemType(row: ItemType) {
    setEditing({
      entity: "itemType",
      record: toFormRecord(row),
      readOnlyFields: [
        { label: "소속 소브랜드", value: selectedSmallBrand?.name ?? "" },
      ],
    });
  }

  function handleEditItem(row: Item) {
    setEditing({
      entity: "item",
      record: toFormRecord(row),
      readOnlyFields: [
        { label: "소속 아이템타입", value: selectedItemType?.name ?? "" },
      ],
    });
  }

  function handleEditSubItem(row: SubItem) {
    setEditing({
      entity: "subItem",
      record: toFormRecord(row),
      readOnlyFields: [
        { label: "소속 아이템", value: selectedItem?.name ?? "" },
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

  // "현재 위치" 브레드크럼(요구사항) — 트리 선택 깊이만큼만 세그먼트를 쌓는다.
  const positionSegments = [
    selectedSmallBrand?.name,
    selectedItemType?.name,
    selectedItem?.name,
  ].filter((segment): segment is string => !!segment);

  const contentTitle = selectedItem
    ? "서브아이템 관리"
    : selectedItemType
      ? "아이템 관리"
      : "아이템타입 관리";

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title="상품 분류 관리" />

      <div className="border-b px-4 py-4 sm:px-6">
        <ScopeSelector levels={scopeLevels} />
      </div>

      {!selectedSmallBrand ? (
        <Empty className="flex-1 border-0 p-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MousePointerClick />
            </EmptyMedia>
            <EmptyDescription>
              법인 → 브랜드 → 소브랜드를 순서대로 선택하면
              아이템타입/아이템/서브아이템을 관리할 수 있습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <MasterDetailLayout
          treeTitle="아이템타입 / 아이템 / 서브아이템"
          mobileTreeOpen={mobileTreeOpen}
          onMobileTreeOpenChange={setMobileTreeOpen}
          tree={
            <MasterTreePanel
              nodes={treeNodes}
              selectedId={selectedItemId ?? selectedItemTypeId}
              onSelect={handleTreeSelect}
              searchPlaceholder="아이템타입/아이템/서브아이템 검색"
              emptyMessage="등록된 아이템타입이 없습니다."
              ariaLabel="아이템타입/아이템/서브아이템 트리"
            />
          }
          content={
            <div className="flex flex-1 flex-col">
              <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  {positionSegments.length > 0 ? (
                    // 최대 3단(소브랜드>아이템타입>아이템)까지 쌓이는 브레드크럼이라
                    // 좁은 화면에서는 한 줄에 다 안 들어갈 수 있다 — flex-wrap으로
                    // 줄바꿈시켜, 우측 등록 버튼(위 컨테이너가 sm 미만에서는
                    // flex-col이라 버튼이 다음 줄로 내려간다) 위에 겹치지 않게 한다.
                    <nav
                      aria-label="현재 위치"
                      className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-muted-foreground"
                    >
                      {positionSegments.map((segment, index) => (
                        <span key={segment} className="flex items-center gap-1">
                          {index > 0 ? (
                            <ChevronRight className="size-3 shrink-0" />
                          ) : null}
                          <span className="truncate">{segment}</span>
                        </span>
                      ))}
                    </nav>
                  ) : null}
                  <h2 className="text-sm font-medium">{contentTitle}</h2>
                </div>
                {createContext ? (
                  <Button
                    size="sm"
                    className="self-start sm:self-auto"
                    onClick={() => setCreateOpen(true)}
                  >
                    <Plus />
                    {createContext.buttonLabel}
                  </Button>
                ) : null}
              </div>

              {selectedItem ? (
                <MasterListTable
                  entity="subItem"
                  rows={subItemsOfSelectedItem}
                  onRowClick={handleEditSubItem}
                  searchPlaceholder="서브아이템코드/서브아이템명 검색"
                  emptyMessage="등록된 서브아이템이 없습니다."
                />
              ) : selectedItemType ? (
                <MasterListTable
                  entity="item"
                  rows={itemsOfSelectedItemType}
                  onRowClick={handleEditItem}
                  searchPlaceholder="아이템코드/아이템명 검색"
                  emptyMessage="등록된 아이템이 없습니다."
                />
              ) : (
                <MasterListTable
                  entity="itemType"
                  rows={itemTypes}
                  onRowClick={handleEditItemType}
                  searchPlaceholder="아이템타입코드/아이템타입명 검색"
                  emptyMessage="등록된 아이템타입이 없습니다."
                />
              )}
            </div>
          }
        />
      )}

      {createContext ? (
        <MasterFormSheet
          key={`create-${createContext.entity}-${
            selectedItem?.id ?? selectedItemType?.id ?? selectedSmallBrand?.id
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
        entity={deleting?.entity ?? "itemType"}
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
