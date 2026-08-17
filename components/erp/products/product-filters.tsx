"use client";

import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { GENDERS } from "@/lib/erp/master/gender";
import type { SubItemFilterOption } from "@/lib/erp/master/queries";
import type { Brand } from "@/lib/erp/master/types";

export type ProductListFilters = {
  search: string;
  brandId: string;
  subItemId: string;
  gender: string;
  isActive: string;
};

type ProductFiltersProps = {
  brands: Brand[];
  subItems: SubItemFilterOption[];
  filters: ProductListFilters;
};

// PRD 7.6.1 목업(검색 + 브랜드/서브아이템/성별/사용여부 4개 독립 드롭다운)을
// 그대로 따른다 — 브랜드→서브아이템 캐스케이드가 아니라 각자 독립적인 필터라
// ScopeSelector(Task 034~037의 계층 캐스케이드 전용)를 재사용하지 않고, "전체"
// 옵션이 필요해 Radix Select 대신 네이티브 <select> 기반 NativeSelect를 쓴다.
export function ProductFilters({
  brands,
  subItems,
  filters,
}: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(filters.search);

  function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (!value) params.delete(key);
      else params.set(key, value);
    }
    // 필터가 바뀌면 결과 집합이 달라지므로 항상 첫 페이지로 되돌린다.
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  // 검색어는 키 입력마다 URL을 바꾸면 매 keystroke가 서버 재조회를 유발하므로
  // 400ms 디바운스 후에만 반영한다(다른 필터는 선택 즉시 반영).
  useEffect(() => {
    if (search === filters.search) return;
    const timer = setTimeout(() => {
      navigate({ search: search.trim() || null });
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:px-6">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="상품코드/상품명 검색"
            className="pl-8"
            aria-label="상품 검색"
          />
        </div>
        <NativeSelect
          className="w-full sm:w-40"
          value={filters.brandId}
          onChange={(event) =>
            navigate({ brandId: event.target.value || null })
          }
          aria-label="브랜드 필터"
        >
          <NativeSelectOption value="">브랜드 전체</NativeSelectOption>
          {brands.map((brand) => (
            <NativeSelectOption key={brand.id} value={brand.id}>
              {brand.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          className="w-full sm:w-40"
          value={filters.subItemId}
          onChange={(event) =>
            navigate({ subItemId: event.target.value || null })
          }
          aria-label="서브아이템 필터"
        >
          <NativeSelectOption value="">서브아이템 전체</NativeSelectOption>
          {subItems.map((subItem) => (
            <NativeSelectOption key={subItem.id} value={subItem.id}>
              {subItem.name}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          className="w-full sm:w-32"
          value={filters.gender}
          onChange={(event) => navigate({ gender: event.target.value || null })}
          aria-label="성별 필터"
        >
          <NativeSelectOption value="">성별 전체</NativeSelectOption>
          {GENDERS.map((gender) => (
            <NativeSelectOption key={gender.value} value={gender.value}>
              {gender.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          className="w-full sm:w-32"
          value={filters.isActive}
          onChange={(event) =>
            navigate({ isActive: event.target.value || null })
          }
          aria-label="사용여부 필터"
        >
          <NativeSelectOption value="">사용여부 전체</NativeSelectOption>
          <NativeSelectOption value="true">사용</NativeSelectOption>
          <NativeSelectOption value="false">미사용</NativeSelectOption>
        </NativeSelect>
      </div>

      <Button asChild size="sm" className="self-start sm:self-auto">
        <Link href="/erp/products/new">
          <Plus />
          상품등록
        </Link>
      </Button>
    </div>
  );
}
