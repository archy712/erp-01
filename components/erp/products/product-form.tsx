"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/erp/page-header";
import {
  ScopeSelector,
  type ScopeSelectorLevel,
} from "@/components/erp/master/scope-selector";
import { ProductImageUploader } from "@/components/erp/products/product-image-uploader";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  createMasterAction,
  deleteMasterAction,
  updateMasterAction,
  type MasterEntityInput,
} from "@/lib/erp/master/actions";
import { isValidCode } from "@/lib/erp/master/code";
import { GENDERS, type GenderValue } from "@/lib/erp/master/gender";
import {
  getBrandColorOptionsAction,
  getBrandColorTypeOptionsAction,
  getBrandGenderSizeOptionsAction,
  getBrandGenderSizeTypeOptionsAction,
  getBrandLineOptionsAction,
  getBrandOptionsAction,
  getItemOptionsAction,
  getItemTypeOptionsAction,
  getSmallBrandOptionsAction,
  getSubItemOptionsAction,
} from "@/lib/erp/master/product-scope-actions";
import type { ProductDetail, SubItemScope } from "@/lib/erp/master/queries";
import type {
  Brand,
  BrandColor,
  BrandColorType,
  BrandGenderSize,
  BrandGenderSizeType,
  BrandLine,
  Company,
  Item,
  ItemType,
  SalesStatus,
  SmallBrand,
  SubItem,
} from "@/lib/erp/master/types";

export type ProductFormInitialData = {
  product: ProductDetail;
  scope: SubItemScope;
  brands: Brand[];
  smallBrands: SmallBrand[];
  itemTypes: ItemType[];
  items: Item[];
  subItems: SubItem[];
  brandLines: BrandLine[];
  colorTypes: BrandColorType[];
  colors: BrandColor[];
  sizeTypes: BrandGenderSizeType[];
  sizes: BrandGenderSize[];
};

type ProductFormProps = {
  breadcrumb?: string[];
  companies: Company[];
} & ({ mode: "create" } | { mode: "edit"; initial: ProductFormInitialData });

const SALES_STATUS_OPTIONS: { value: SalesStatus; label: string }[] = [
  { value: "on_sale", label: "판매중" },
  { value: "sold_out", label: "품절" },
  { value: "discontinued", label: "단종" },
];

// PRD 7.6.2의 6단 분류 캐스케이드(법인→...→서브아이템)는 다른 5개 마스터
// 화면(Task 032~037)과 달리 URL 쿼리 → 서버 컴포넌트 재조회 패턴을 쓰지
// 않는다 — 이 폼은 화면 전체가 하나의 useState 묶음(이미지·일반 속성 등
// 다른 필드까지)이라, 캐스케이드 한 단계가 바뀔 때마다 페이지를 다시
// 내비게이션하면 나머지 입력값이 함께 날아간다. 대신
// lib/erp/master/product-scope-actions.ts의 Server Action으로 하위 옵션만
// 그때그때 가져온다. 라인/컬러타입/사이즈타입은 분류 축이 아니라 브랜드에만
// 스코프되므로 브랜드가 확정되는 시점(handleBrandChange)에 함께 가져온다.
export function ProductForm(props: ProductFormProps) {
  const { breadcrumb, companies } = props;
  const isEdit = props.mode === "edit";
  const initial = props.mode === "edit" ? props.initial : null;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // 이미지 업로드(Task 040)는 상품이 저장되기 전에도 Storage 경로가
  // 필요하므로(등록 폼에서 저장 전에 미리 올려볼 수 있어야 함), 등록 모드는
  // 마운트 시 id를 미리 발급해 Storage 폴더와 최종 insert 양쪽에 동일하게
  // 쓴다(createMasterAction의 input.id, lib/erp/master/actions.ts 참고).
  // 수정 모드는 이미 있는 상품 id를 그대로 쓴다.
  const [productId] = useState(
    () => initial?.product.id ?? crypto.randomUUID(),
  );
  const [imageUrl, setImageUrl] = useState(initial?.product.imageUrl ?? null);
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initial?.product.thumbnailUrl ?? null,
  );
  const [deleteOpen, setDeleteOpen] = useState(false);

  // --- 분류 캐스케이드(6단) ---
  const [companyId, setCompanyId] = useState(initial?.scope.companyId ?? "");
  const [brandId, setBrandId] = useState(initial?.scope.brandId ?? "");
  const [smallBrandId, setSmallBrandId] = useState(
    initial?.scope.smallBrandId ?? "",
  );
  const [itemTypeId, setItemTypeId] = useState(initial?.scope.itemTypeId ?? "");
  const [itemId, setItemId] = useState(initial?.scope.itemId ?? "");
  const [subItemId, setSubItemId] = useState(initial?.scope.subItemId ?? "");

  const [brandOptions, setBrandOptions] = useState<Brand[]>(
    initial?.brands ?? [],
  );
  const [smallBrandOptions, setSmallBrandOptions] = useState<SmallBrand[]>(
    initial?.smallBrands ?? [],
  );
  const [itemTypeOptions, setItemTypeOptions] = useState<ItemType[]>(
    initial?.itemTypes ?? [],
  );
  const [itemOptions, setItemOptions] = useState<Item[]>(initial?.items ?? []);
  const [subItemOptions, setSubItemOptions] = useState<SubItem[]>(
    initial?.subItems ?? [],
  );

  // --- 속성(라인/컬러/성별/사이즈) — 전부 브랜드 하위 ---
  const [brandLineId, setBrandLineId] = useState(
    initial?.product.brandLineId ?? "",
  );
  const [brandLineOptions, setBrandLineOptions] = useState<BrandLine[]>(
    initial?.brandLines ?? [],
  );

  const [brandColorTypeId, setBrandColorTypeId] = useState(
    initial?.product.brandColorTypeId ?? "",
  );
  const [colorTypeOptions, setColorTypeOptions] = useState<BrandColorType[]>(
    initial?.colorTypes ?? [],
  );
  const [brandColorId, setBrandColorId] = useState(
    initial?.product.brandColorId ?? "",
  );
  const [colorOptions, setColorOptions] = useState<BrandColor[]>(
    initial?.colors ?? [],
  );

  const [gender, setGender] = useState<GenderValue>(
    initial?.product.gender ?? "male",
  );
  const [brandGenderSizeTypeId, setBrandGenderSizeTypeId] = useState(
    initial?.product.brandGenderSizeTypeId ?? "",
  );
  const [sizeTypeOptions, setSizeTypeOptions] = useState<BrandGenderSizeType[]>(
    initial?.sizeTypes ?? [],
  );
  const [brandGenderSizeId, setBrandGenderSizeId] = useState(
    initial?.product.brandGenderSizeId ?? "",
  );
  const [sizeOptions, setSizeOptions] = useState<BrandGenderSize[]>(
    initial?.sizes ?? [],
  );

  // --- 일반 속성 ---
  const [season, setSeason] = useState(initial?.product.season ?? "");
  const [releaseYear, setReleaseYear] = useState(
    initial?.product.releaseYear != null
      ? String(initial.product.releaseYear)
      : "",
  );
  const [material, setMaterial] = useState(initial?.product.material ?? "");
  const [costPrice, setCostPrice] = useState(
    initial?.product.costPrice != null ? String(initial.product.costPrice) : "",
  );
  const [salePrice, setSalePrice] = useState(
    initial?.product.salePrice != null ? String(initial.product.salePrice) : "",
  );
  const [salesStatus, setSalesStatus] = useState<SalesStatus | "">(
    initial?.product.salesStatus ?? "",
  );

  // --- 공통 속성 ---
  const [code, setCode] = useState(initial?.product.code ?? "");
  const [name, setName] = useState(initial?.product.name ?? "");
  const [sortOrder, setSortOrder] = useState(initial?.product.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(initial?.product.isActive ?? true);
  const [note, setNote] = useState(initial?.product.note ?? "");

  // --- 인라인 에러 ---
  const [nameError, setNameError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [classificationError, setClassificationError] = useState<string | null>(
    null,
  );
  const [lineError, setLineError] = useState<string | null>(null);
  const [colorError, setColorError] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const [numberError, setNumberError] = useState<string | null>(null);

  function resetAttributeScope() {
    setBrandLineId("");
    setBrandLineOptions([]);
    setBrandColorTypeId("");
    setColorTypeOptions([]);
    setBrandColorId("");
    setColorOptions([]);
    setBrandGenderSizeTypeId("");
    setSizeTypeOptions([]);
    setBrandGenderSizeId("");
    setSizeOptions([]);
  }

  async function handleCompanyChange(id: string) {
    setCompanyId(id);
    setBrandId("");
    setSmallBrandId("");
    setItemTypeId("");
    setItemId("");
    setSubItemId("");
    setBrandOptions([]);
    setSmallBrandOptions([]);
    setItemTypeOptions([]);
    setItemOptions([]);
    setSubItemOptions([]);
    resetAttributeScope();
    try {
      setBrandOptions(await getBrandOptionsAction(id));
    } catch {
      toast.error("브랜드 목록을 불러오지 못했습니다.");
    }
  }

  async function handleBrandChange(id: string) {
    setBrandId(id);
    setSmallBrandId("");
    setItemTypeId("");
    setItemId("");
    setSubItemId("");
    setSmallBrandOptions([]);
    setItemTypeOptions([]);
    setItemOptions([]);
    setSubItemOptions([]);
    resetAttributeScope();
    try {
      const [smallBrands, lines, colorTypes, sizeTypes] = await Promise.all([
        getSmallBrandOptionsAction(id),
        getBrandLineOptionsAction(id),
        getBrandColorTypeOptionsAction(id),
        getBrandGenderSizeTypeOptionsAction(id, gender),
      ]);
      setSmallBrandOptions(smallBrands);
      setBrandLineOptions(lines);
      setColorTypeOptions(colorTypes);
      setSizeTypeOptions(sizeTypes);
    } catch {
      toast.error("브랜드 하위 옵션을 불러오지 못했습니다.");
    }
  }

  async function handleSmallBrandChange(id: string) {
    setSmallBrandId(id);
    setItemTypeId("");
    setItemId("");
    setSubItemId("");
    setItemOptions([]);
    setSubItemOptions([]);
    try {
      setItemTypeOptions(await getItemTypeOptionsAction(id));
    } catch {
      toast.error("아이템타입 목록을 불러오지 못했습니다.");
    }
  }

  async function handleItemTypeChange(id: string) {
    setItemTypeId(id);
    setItemId("");
    setSubItemId("");
    setSubItemOptions([]);
    try {
      setItemOptions(await getItemOptionsAction(id));
    } catch {
      toast.error("아이템 목록을 불러오지 못했습니다.");
    }
  }

  async function handleItemChange(id: string) {
    setItemId(id);
    setSubItemId("");
    try {
      setSubItemOptions(await getSubItemOptionsAction(id));
    } catch {
      toast.error("서브아이템 목록을 불러오지 못했습니다.");
    }
  }

  function handleSubItemChange(id: string) {
    setSubItemId(id);
    if (classificationError) setClassificationError(null);
  }

  async function handleColorTypeChange(id: string) {
    setBrandColorTypeId(id);
    setBrandColorId("");
    try {
      setColorOptions(await getBrandColorOptionsAction(id));
    } catch {
      toast.error("컬러 목록을 불러오지 못했습니다.");
    }
  }

  async function handleGenderChange(value: string) {
    const next = value as GenderValue;
    setGender(next);
    setBrandGenderSizeTypeId("");
    setBrandGenderSizeId("");
    setSizeOptions([]);
    if (!brandId) {
      setSizeTypeOptions([]);
      return;
    }
    try {
      setSizeTypeOptions(
        await getBrandGenderSizeTypeOptionsAction(brandId, next),
      );
    } catch {
      toast.error("사이즈타입 목록을 불러오지 못했습니다.");
    }
  }

  async function handleSizeTypeChange(id: string) {
    setBrandGenderSizeTypeId(id);
    setBrandGenderSizeId("");
    try {
      setSizeOptions(await getBrandGenderSizeOptionsAction(id));
    } catch {
      toast.error("사이즈 목록을 불러오지 못했습니다.");
    }
  }

  function handleSubmit() {
    let hasError = false;

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("상품명을 입력해주세요.");
      hasError = true;
    } else {
      setNameError(null);
    }

    // 라인/컬러/사이즈 드롭다운은 항상 현재 브랜드로 스코프된 목록에서만
    // 채워지고(브랜드가 바뀌면 resetAttributeScope()가 즉시 값을 비운다),
    // 브랜드가 바뀌기 전에는 선택 자체가 불가능하므로 "같은 브랜드인지"는
    // 구조적으로 이미 보장된다. 여기서는 필수 항목 누락만 확인하고, 실제
    // 교차 브랜드 방어는 서버 액션(assertProductBrandConsistency)과 DB
    // 트리거(check_product_brand_consistency)가 담당한다.
    if (!subItemId) {
      setClassificationError("법인부터 서브아이템까지 전부 선택해주세요.");
      hasError = true;
    } else {
      setClassificationError(null);
    }

    if (!brandLineId) {
      setLineError("라인을 선택해주세요.");
      hasError = true;
    } else {
      setLineError(null);
    }

    if (!brandColorId) {
      setColorError("컬러를 선택해주세요.");
      hasError = true;
    } else {
      setColorError(null);
    }

    if (!brandGenderSizeId) {
      setSizeError("사이즈를 선택해주세요.");
      hasError = true;
    } else {
      setSizeError(null);
    }

    let normalizedCode: string | undefined;
    if (isEdit) {
      normalizedCode = code.trim().toUpperCase();
      if (!isValidCode("product", normalizedCode)) {
        setCodeError("상품 코드 형식이 올바르지 않습니다. (예: PM100000001)");
        hasError = true;
      } else {
        setCodeError(null);
      }
    }

    const parsedReleaseYear = releaseYear.trim() ? Number(releaseYear) : null;
    const parsedCostPrice = costPrice.trim() ? Number(costPrice) : null;
    const parsedSalePrice = salePrice.trim() ? Number(salePrice) : null;
    if (
      (releaseYear.trim() && Number.isNaN(parsedReleaseYear)) ||
      (costPrice.trim() && Number.isNaN(parsedCostPrice)) ||
      (salePrice.trim() && Number.isNaN(parsedSalePrice))
    ) {
      setNumberError("출시연도/원가/판매가는 숫자로 입력해주세요.");
      hasError = true;
    } else {
      setNumberError(null);
    }

    if (hasError) return;

    const input: Partial<MasterEntityInput> = {
      name: trimmedName,
      sortOrder,
      isActive,
      note: note.trim() ? note.trim() : null,
      subItemId,
      brandLineId,
      brandColorId,
      brandGenderSizeId,
      gender,
      imageUrl,
      thumbnailUrl,
      season: season.trim() ? season.trim() : null,
      releaseYear: parsedReleaseYear,
      material: material.trim() ? material.trim() : null,
      costPrice: parsedCostPrice,
      salePrice: parsedSalePrice,
      salesStatus: salesStatus === "" ? null : salesStatus,
      ...(isEdit ? { code: normalizedCode } : { id: productId }),
    };

    startTransition(async () => {
      const result =
        isEdit && initial
          ? await updateMasterAction("product", initial.product.id, input)
          : await createMasterAction("product", input as MasterEntityInput);

      if (!result.success) {
        if (isEdit && result.message.includes("코드")) {
          setCodeError(result.message);
        } else {
          toast.error(result.message);
        }
        return;
      }

      const generatedCode = "code" in result ? result.code : undefined;
      toast.success(
        isEdit
          ? "상품 정보를 수정했습니다."
          : generatedCode
            ? `상품을 등록했습니다. (코드: ${generatedCode})`
            : "상품을 등록했습니다.",
      );
      router.push("/erp/products");
    });
  }

  // deleteMasterAction("product", ...)이 DB 행 삭제 후 Storage의 원본/썸네일도
  // 함께 정리한다(Task 040, lib/erp/master/actions.ts의 removeProductImageFiles).
  function handleDelete(event: { preventDefault: () => void }) {
    event.preventDefault();
    if (!initial) return;
    startTransition(async () => {
      const result = await deleteMasterAction("product", initial.product.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("상품을 삭제했습니다.");
      router.push("/erp/products");
    });
  }

  const classificationLevels: ScopeSelectorLevel[] = [
    {
      key: "company",
      label: "법인",
      value: companyId,
      onChange: handleCompanyChange,
      options: companies.map((c) => ({ id: c.id, name: c.name })),
    },
    {
      key: "brand",
      label: "브랜드",
      value: brandId,
      onChange: handleBrandChange,
      options: brandOptions.map((b) => ({ id: b.id, name: b.name })),
      disabled: !companyId,
    },
    {
      key: "smallBrand",
      label: "소브랜드",
      value: smallBrandId,
      onChange: handleSmallBrandChange,
      options: smallBrandOptions.map((sb) => ({ id: sb.id, name: sb.name })),
      disabled: !brandId,
    },
    {
      key: "itemType",
      label: "아이템타입",
      value: itemTypeId,
      onChange: handleItemTypeChange,
      options: itemTypeOptions.map((it) => ({ id: it.id, name: it.name })),
      disabled: !smallBrandId,
    },
    {
      key: "item",
      label: "아이템",
      value: itemId,
      onChange: handleItemChange,
      options: itemOptions.map((i) => ({ id: i.id, name: i.name })),
      disabled: !itemTypeId,
    },
    {
      key: "subItem",
      label: "서브아이템",
      value: subItemId,
      onChange: handleSubItemChange,
      options: subItemOptions.map((si) => ({ id: si.id, name: si.name })),
      disabled: !itemId,
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader
        breadcrumb={breadcrumb}
        title={isEdit ? "상품 수정" : "상품 등록"}
      />

      <div className="flex flex-1 flex-col gap-8 overflow-y-auto p-4 sm:p-6">
        <section className="flex flex-col gap-4">
          <h2 className="text-sm font-medium">분류</h2>
          <ScopeSelector levels={classificationLevels} />
          {classificationError ? (
            <p className="text-sm text-destructive">{classificationError}</p>
          ) : null}
        </section>

        <section className="flex flex-col gap-4 border-t pt-6">
          <h2 className="text-sm font-medium">속성</h2>

          <ScopeSelector
            levels={[
              {
                key: "brandLine",
                label: "라인",
                value: brandLineId,
                onChange: (id) => {
                  setBrandLineId(id);
                  if (lineError) setLineError(null);
                },
                options: brandLineOptions.map((l) => ({
                  id: l.id,
                  name: l.name,
                })),
                disabled: !brandId,
              },
            ]}
          />
          {lineError ? (
            <p className="text-sm text-destructive">{lineError}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex flex-col gap-1.5 sm:w-52">
              <Label htmlFor="product-color-type">컬러타입</Label>
              <Select
                value={brandColorTypeId}
                onValueChange={handleColorTypeChange}
                disabled={!brandId || colorTypeOptions.length === 0}
              >
                <SelectTrigger id="product-color-type" className="w-full">
                  <SelectValue placeholder="컬러타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {colorTypeOptions.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      {ct.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:w-52">
              <Label htmlFor="product-color">컬러</Label>
              <Select
                value={brandColorId}
                onValueChange={(id) => {
                  setBrandColorId(id);
                  if (colorError) setColorError(null);
                }}
                disabled={!brandColorTypeId || colorOptions.length === 0}
              >
                <SelectTrigger id="product-color" className="w-full">
                  <SelectValue placeholder="컬러 선택" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="size-3 shrink-0 rounded-full border"
                          style={{ backgroundColor: `#${c.rgbHex}` }}
                          aria-hidden="true"
                        />
                        {c.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {colorError ? (
            <p className="text-sm text-destructive">{colorError}</p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="flex flex-col gap-1.5 sm:w-40">
              <Label htmlFor="product-gender">성별</Label>
              <Select value={gender} onValueChange={handleGenderChange}>
                <SelectTrigger id="product-gender" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      {g.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:w-52">
              <Label htmlFor="product-size-type">사이즈타입</Label>
              <Select
                value={brandGenderSizeTypeId}
                onValueChange={handleSizeTypeChange}
                disabled={!brandId || sizeTypeOptions.length === 0}
              >
                <SelectTrigger id="product-size-type" className="w-full">
                  <SelectValue placeholder="사이즈타입 선택" />
                </SelectTrigger>
                <SelectContent>
                  {sizeTypeOptions.map((st) => (
                    <SelectItem key={st.id} value={st.id}>
                      {st.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:w-40">
              <Label htmlFor="product-size">사이즈</Label>
              <Select
                value={brandGenderSizeId}
                onValueChange={(id) => {
                  setBrandGenderSizeId(id);
                  if (sizeError) setSizeError(null);
                }}
                disabled={!brandGenderSizeTypeId || sizeOptions.length === 0}
              >
                <SelectTrigger id="product-size" className="w-full">
                  <SelectValue placeholder="사이즈 선택" />
                </SelectTrigger>
                <SelectContent>
                  {sizeOptions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {sizeError ? (
            <p className="text-sm text-destructive">{sizeError}</p>
          ) : null}
        </section>

        <section className="flex flex-col gap-4 border-t pt-6">
          <h2 className="text-sm font-medium">이미지</h2>
          <ProductImageUploader
            productId={productId}
            imageUrl={imageUrl}
            onUploaded={(result) => {
              setImageUrl(result.imageUrl);
              setThumbnailUrl(result.thumbnailUrl);
            }}
          />
        </section>

        <section className="flex flex-col gap-4 border-t pt-6">
          <h2 className="text-sm font-medium">일반</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-season">시즌</Label>
              <Input
                id="product-season"
                value={season}
                onChange={(event) => setSeason(event.target.value)}
                placeholder="예: 26SS"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-release-year">출시연도</Label>
              <Input
                id="product-release-year"
                inputMode="numeric"
                value={releaseYear}
                onChange={(event) => setReleaseYear(event.target.value)}
                placeholder="예: 2026"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-material">소재</Label>
              <Input
                id="product-material"
                value={material}
                onChange={(event) => setMaterial(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-cost-price">원가</Label>
              <Input
                id="product-cost-price"
                inputMode="decimal"
                value={costPrice}
                onChange={(event) => setCostPrice(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-sale-price">판매가</Label>
              <Input
                id="product-sale-price"
                inputMode="decimal"
                value={salePrice}
                onChange={(event) => setSalePrice(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-sales-status">판매상태</Label>
              <Select
                value={salesStatus === "" ? "__none__" : salesStatus}
                onValueChange={(value) =>
                  setSalesStatus(
                    value === "__none__" ? "" : (value as SalesStatus),
                  )
                }
              >
                <SelectTrigger id="product-sales-status" className="w-full">
                  <SelectValue placeholder="선택 안 함" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">선택 안 함</SelectItem>
                  {SALES_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {numberError ? (
            <p className="text-sm text-destructive">{numberError}</p>
          ) : null}
        </section>

        <section className="flex flex-col gap-4 border-t pt-6">
          <h2 className="text-sm font-medium">공통</h2>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-code">상품코드</Label>
            {isEdit ? (
              <>
                <Input
                  id="product-code"
                  value={code}
                  onChange={(event) => {
                    setCode(event.target.value.toUpperCase());
                    if (codeError) setCodeError(null);
                  }}
                  aria-invalid={codeError ? true : undefined}
                />
                {codeError ? (
                  <p className="text-sm text-destructive">{codeError}</p>
                ) : null}
              </>
            ) : (
              <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                저장 시 자동으로 채번됩니다.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-name">상품명</Label>
            <Input
              id="product-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (nameError) setNameError(null);
              }}
              aria-invalid={nameError ? true : undefined}
            />
            {nameError ? (
              <p className="text-sm text-destructive">{nameError}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5 sm:w-40">
            <Label htmlFor="product-sort-order">정렬순서</Label>
            <Input
              id="product-sort-order"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value))}
            />
          </div>

          <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:w-80">
            <Label htmlFor="product-is-active">사용여부</Label>
            <Switch
              id="product-is-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-note">비고</Label>
            <Textarea
              id="product-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
            />
          </div>
        </section>
      </div>

      <div className="flex items-center justify-between gap-2 border-t px-4 py-4 sm:px-6">
        {isEdit ? (
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" disabled={isPending}>
                삭제
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>상품 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  &apos;{name}&apos;을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수
                  없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/erp/products">취소</Link>
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isEdit ? "저장" : "등록"}
          </Button>
        </div>
      </div>
    </div>
  );
}
