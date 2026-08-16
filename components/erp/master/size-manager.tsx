"use client";

import { MousePointerClick, Plus } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MasterEntityInput } from "@/lib/erp/master/actions";
import {
  GENDERS,
  getGenderLabel,
  type GenderValue,
} from "@/lib/erp/master/gender";
import type {
  Brand,
  BrandGenderSize,
  BrandGenderSizeType,
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

// 성별은 lib/erp/master/gender.ts의 GENDERS 상수 3종을 고정 탭으로 그대로
// map한 것이다 — DB 테이블도, 등록/수정/삭제 UI도 존재하지 않는다(PRD 7.5
// 명시 제약). 사이즈타입/사이즈 2종만 관리 대상이다.
type ManagedEntity = "brandGenderSizeType" | "brandGenderSize";

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

export function SizeManager({
  breadcrumb,
  companies,
  brands,
  sizeTypes,
  sizes,
  selectedCompanyId,
  selectedBrandId,
  gender,
  selectedSizeType,
}: {
  breadcrumb?: string[];
  companies: Company[];
  /** 선택된 법인 소속 브랜드만(ScopeSelector 옵션, activeOnly). */
  brands: Brand[];
  /** 선택된 브랜드+성별 소속 사이즈타입 전체(비활성 포함 — 좌측 목록용). */
  sizeTypes: BrandGenderSizeType[];
  /** 선택된 사이즈타입 소속 사이즈 전체(비활성 포함). */
  sizes: BrandGenderSize[];
  selectedCompanyId: string | null;
  selectedBrandId: string | null;
  /** 현재 활성 성별 탭 — URL 쿼리 `gender`에서 검증된 값(기본값 male). */
  gender: GenderValue;
  selectedSizeType: BrandGenderSizeType | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [deleting, setDeleting] = useState<DeletingState | null>(null);

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

  // 상위 스코프(법인/브랜드) 변경 시 하위 선택(사이즈타입)까지 함께
  // 초기화한다 — "이전 브랜드의 사이즈타입이 남지 않는다"는 다른 화면들과
  // 동일한 규칙. 성별 탭은 브랜드와 독립적인 축이라 그대로 유지한다.
  function handleCompanyChange(id: string) {
    navigate({ companyId: id, brandId: null, sizeTypeId: null });
  }

  function handleBrandChange(id: string) {
    navigate({ brandId: id, sizeTypeId: null });
  }

  // 성별 탭 전환 시 브랜드 선택은 유지하고 사이즈타입 목록만 갱신한다(PRD 7.5).
  // 이전 탭에서 선택돼 있던 사이즈타입은 다른 성별 스코프에 속하므로 초기화한다.
  function handleGenderChange(value: string) {
    navigate({ gender: value, sizeTypeId: null });
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
      sizeTypes.map((sizeType) => ({
        id: sizeType.id,
        name: sizeType.name,
        isActive: sizeType.isActive,
      })),
    [sizeTypes],
  );

  function handleTreeSelect(id: string) {
    navigate({ sizeTypeId: id });
    setMobileTreeOpen(false);
  }

  const genderLabel = getGenderLabel(gender);

  const createContext: CreateContext | null = selectedSizeType
    ? {
        entity: "brandGenderSize",
        parentInput: { brandGenderSizeTypeId: selectedSizeType.id },
        readOnlyFields: [
          { label: "소속 사이즈타입", value: selectedSizeType.name },
        ],
        defaultSortOrder: sizes.length,
        buttonLabel: "사이즈 등록",
      }
    : selectedBrand
      ? {
          entity: "brandGenderSizeType",
          // gender는 사용자가 입력하는 필드가 아니라 현재 탭 값을 그대로
          // 강제 주입한다(PRD 7.5 제약 — DB 체크 제약과 앱 상수가 항상
          // 일치해야 하므로 문자열을 직접 입력할 여지를 두지 않는다).
          parentInput: { brandId: selectedBrand.id, gender },
          readOnlyFields: [
            { label: "소속 브랜드", value: selectedBrand.name },
            { label: "성별", value: genderLabel },
          ],
          defaultSortOrder: sizeTypes.length,
          buttonLabel: "사이즈타입 등록",
        }
      : null;

  function handleEditSizeType(row: BrandGenderSizeType) {
    setEditing({
      entity: "brandGenderSizeType",
      record: toFormRecord(row),
      readOnlyFields: [
        { label: "소속 브랜드", value: selectedBrand?.name ?? "" },
        { label: "성별", value: getGenderLabel(row.gender) },
      ],
    });
  }

  function handleEditSize(row: BrandGenderSize) {
    setEditing({
      entity: "brandGenderSize",
      record: toFormRecord(row),
      readOnlyFields: [
        { label: "소속 사이즈타입", value: selectedSizeType?.name ?? "" },
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

  const contentTitle = selectedSizeType ? "사이즈 관리" : "사이즈타입 관리";

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title="사이즈 관리" />

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
              법인 → 브랜드를 순서대로 선택하면 사이즈타입/사이즈를 관리할 수
              있습니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {/*
           * 성별은 CRUD 없는 고정 상수 탭이다(PRD 7.5) — GENDERS를 그대로
           * map하며, 등록/수정/삭제 버튼은 어디에도 두지 않는다. 탭 전환은
           * URL 쿼리(gender)를 바꿔 사이즈타입 목록(트리)만 서버에서
           * 다시 조회하고, 브랜드 선택은 유지된다.
           */}
          <div className="border-b px-4 py-2 sm:px-6">
            <Tabs value={gender} onValueChange={handleGenderChange}>
              <TabsList>
                {GENDERS.map((g) => (
                  <TabsTrigger key={g.value} value={g.value}>
                    {g.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          <MasterDetailLayout
            treeTitle="사이즈타입"
            mobileTreeOpen={mobileTreeOpen}
            onMobileTreeOpenChange={setMobileTreeOpen}
            tree={
              <MasterTreePanel
                nodes={treeNodes}
                selectedId={selectedSizeType?.id ?? null}
                onSelect={handleTreeSelect}
                searchPlaceholder="사이즈타입명 검색"
                emptyMessage="등록된 사이즈타입이 없습니다."
                ariaLabel="사이즈타입 목록"
              />
            }
            content={
              <div className="flex flex-1 flex-col">
                <div className="flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <p className="truncate text-xs text-muted-foreground">
                      {selectedBrand.name} / {genderLabel}
                      {selectedSizeType ? ` / ${selectedSizeType.name}` : ""}
                    </p>
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

                {selectedSizeType ? (
                  <MasterListTable
                    entity="brandGenderSize"
                    rows={sizes}
                    onRowClick={handleEditSize}
                    searchPlaceholder="사이즈코드/사이즈명 검색"
                    emptyMessage="등록된 사이즈가 없습니다."
                  />
                ) : (
                  <MasterListTable
                    entity="brandGenderSizeType"
                    rows={sizeTypes}
                    onRowClick={handleEditSizeType}
                    searchPlaceholder="사이즈타입코드/사이즈타입명 검색"
                    emptyMessage="등록된 사이즈타입이 없습니다."
                  />
                )}
              </div>
            }
          />
        </>
      )}

      {createContext ? (
        <MasterFormSheet
          key={`create-${createContext.entity}-${gender}-${
            selectedSizeType?.id ?? selectedBrand?.id
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
        entity={deleting?.entity ?? "brandGenderSizeType"}
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
