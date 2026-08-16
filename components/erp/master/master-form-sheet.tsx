"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { isValidCode } from "@/lib/erp/master/code";
import {
  MASTER_ENTITIES,
  type MasterEntityKey,
} from "@/lib/erp/master/entities";
import {
  createMasterAction,
  updateMasterAction,
  type MasterEntityInput,
} from "@/lib/erp/master/actions";
import { ColorSwatchInput, isValidHex } from "./color-swatch-input";

export type MasterFormRecord = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  note: string | null;
  /** brandColor 전용 — `#` 없는 6자리 HEX. */
  rgbHex?: string;
};

export type MasterFormReadOnlyField = { label: string; value: string };

type MasterFormSheetSharedProps = {
  entity: MasterEntityKey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 상위 등 읽기 전용으로 보여줄 값들(예: "소속 브랜드": "브랜드1"). */
  readOnlyFields?: MasterFormReadOnlyField[];
  /** 등록 시 함께 저장할 부모 FK 등(예: { companyId }). MasterEntityInput의 서브셋. */
  parentInput?: Partial<MasterEntityInput>;
  /** 등록 모드의 정렬순서 초기 제안값(형제 개수 등). 기본값 0. */
  defaultSortOrder?: number;
};

type MasterFormSheetProps = MasterFormSheetSharedProps &
  (
    | { mode: "create"; record?: undefined; onDelete?: undefined }
    | { mode: "edit"; record: MasterFormRecord; onDelete?: () => void }
  );

function codeExample(entity: MasterEntityKey): string {
  const meta = MASTER_ENTITIES[entity];
  return `${meta.label} 코드 형식이 올바르지 않습니다.`;
}

// Sheet/SheetContent는 Radix Presence로 닫힘 애니메이션을 관리하므로 항상
// 마운트해두고, 실제 폼 필드(useState를 가진 부분)만 open일 때만 렌더링한다.
// 이렇게 하면 열릴 때마다 이 컴포넌트가 새로 마운트되며 현재 props 기준으로
// 상태가 초기화되므로, "열릴 때마다 초기값을 다시 계산"하는 데 useEffect +
// setState가 필요 없다(react-hooks/set-state-in-effect 회피). Task 016
// MenuFormDialog와 동일한 해법.
export function MasterFormSheet({
  entity,
  open,
  onOpenChange,
  ...rest
}: MasterFormSheetProps) {
  const meta = MASTER_ENTITIES[entity];
  const isEdit = rest.mode === "edit";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>
            {isEdit ? `${meta.label} 수정` : `${meta.label} 등록`}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "정보를 수정한 뒤 저장하세요."
              : "코드는 저장 시 자동으로 채번됩니다."}
          </SheetDescription>
        </SheetHeader>
        {open ? (
          <MasterFormFields
            entity={entity}
            onOpenChange={onOpenChange}
            {...rest}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

type MasterFormFieldsProps = Omit<MasterFormSheetSharedProps, "open"> &
  (
    | { mode: "create"; record?: undefined; onDelete?: undefined }
    | { mode: "edit"; record: MasterFormRecord; onDelete?: () => void }
  );

function MasterFormFields({
  entity,
  mode,
  record,
  readOnlyFields = [],
  parentInput,
  defaultSortOrder,
  onDelete,
  onOpenChange,
}: MasterFormFieldsProps) {
  const meta = MASTER_ENTITIES[entity];
  const isColorEntity = entity === "brandColor";

  const [code, setCode] = useState(mode === "edit" ? record.code : "");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [name, setName] = useState(mode === "edit" ? record.name : "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState(
    mode === "edit" ? record.sortOrder : (defaultSortOrder ?? 0),
  );
  const [isActive, setIsActive] = useState(
    mode === "edit" ? record.isActive : true,
  );
  const [note, setNote] = useState(mode === "edit" ? (record.note ?? "") : "");
  const [rgbHex, setRgbHex] = useState(
    mode === "edit" ? (record.rgbHex ?? "") : "",
  );
  const [colorError, setColorError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("명칭을 입력해주세요.");
      return;
    }
    setNameError(null);

    let normalizedCode: string | undefined;
    if (mode === "edit") {
      normalizedCode = code.trim().toUpperCase();
      if (!isValidCode(entity, normalizedCode)) {
        setCodeError(codeExample(entity));
        return;
      }
      setCodeError(null);
    }

    if (isColorEntity) {
      if (!isValidHex(rgbHex)) {
        setColorError("6자리 16진수 값을 입력해주세요. (예: FF5733)");
        return;
      }
      setColorError(null);
    }

    const input: Partial<MasterEntityInput> = {
      name: trimmedName,
      sortOrder,
      isActive,
      note: note.trim() ? note.trim() : null,
      ...(mode === "edit" ? { code: normalizedCode } : {}),
      ...(isColorEntity ? { rgbHex } : {}),
      ...(mode === "create" ? parentInput : {}),
    };

    startTransition(async () => {
      const result =
        mode === "edit"
          ? await updateMasterAction(entity, record.id, input)
          : await createMasterAction(entity, input as MasterEntityInput);

      if (!result.success) {
        // 코드 unique 위반 등 코드 관련 서버 에러는 코드 필드 인라인 에러로 보여준다(이중 방어).
        if (mode === "edit" && result.message.includes("코드")) {
          setCodeError(result.message);
        } else {
          toast.error(result.message);
        }
        return;
      }

      const generatedCode = "code" in result ? result.code : undefined;
      toast.success(
        mode === "edit"
          ? `${meta.label} 정보를 수정했습니다.`
          : generatedCode
            ? `${meta.label}을(를) 등록했습니다. (코드: ${generatedCode})`
            : `${meta.label}을(를) 등록했습니다.`,
      );
      onOpenChange(false);
    });
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
        {readOnlyFields.map((field) => (
          <div key={field.label} className="flex flex-col gap-1.5">
            <Label>{field.label}</Label>
            <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {field.value}
            </p>
          </div>
        ))}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="master-code">코드</Label>
          {mode === "edit" ? (
            <>
              <Input
                id="master-code"
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
          <Label htmlFor="master-name">명칭</Label>
          <Input
            id="master-name"
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

        {isColorEntity ? (
          <ColorSwatchInput
            value={rgbHex}
            onChange={(hex) => {
              setRgbHex(hex);
              if (colorError) setColorError(null);
            }}
            error={colorError}
          />
        ) : null}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="master-sort-order">정렬순서</Label>
          <Input
            id="master-sort-order"
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor="master-is-active">사용여부</Label>
          <Switch
            id="master-is-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="master-note">비고</Label>
          <Textarea
            id="master-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <SheetFooter className="flex-row items-center justify-between border-t">
        {mode === "edit" && onDelete ? (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
            disabled={isPending}
          >
            삭제
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {mode === "edit" ? "저장" : "등록"}
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}
