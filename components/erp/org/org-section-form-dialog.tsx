"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { isValidOrgCode } from "@/lib/erp/org/code";
import {
  createOrgSectionAction,
  updateOrgSectionAction,
} from "@/lib/erp/org/actions";

export type OrgSectionFormRecord = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  note: string | null;
};

type OrgSectionFormDialogSharedProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 상위 부문(읽기 전용 표시용). 등록 시 이 부문 밑에 생성된다. */
  organizationId: string;
  organizationName: string;
};

type OrgSectionFormDialogProps = OrgSectionFormDialogSharedProps &
  (
    | { mode: "create"; record?: undefined }
    | { mode: "edit"; record: OrgSectionFormRecord }
  );

// components/erp/master/master-form-sheet.tsx와 동일한 이유로 Dialog/DialogContent는
// 항상 마운트해두고, useState를 가진 필드 서브컴포넌트만 open일 때 마운트한다 —
// "열릴 때마다 초기값을 다시 계산"하는 데 useEffect+setState가 필요 없어진다
// (react-hooks/set-state-in-effect 회피, ROADMAP_ORG.md Task 055/056 공통 규약).
export function OrgSectionFormDialog({
  open,
  onOpenChange,
  organizationId,
  organizationName,
  ...rest
}: OrgSectionFormDialogProps) {
  const isEdit = rest.mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "부서 수정" : "부서 등록"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "부서 정보를 수정한 뒤 저장하세요."
              : "코드는 저장 시 자동으로 채번됩니다. (형식: OS####)"}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <OrgSectionFormFields
            organizationId={organizationId}
            organizationName={organizationName}
            onOpenChange={onOpenChange}
            {...rest}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

type OrgSectionFormFieldsProps = Omit<OrgSectionFormDialogSharedProps, "open"> &
  (
    | { mode: "create"; record?: undefined }
    | { mode: "edit"; record: OrgSectionFormRecord }
  );

function OrgSectionFormFields({
  organizationId,
  organizationName,
  mode,
  record,
  onOpenChange,
}: OrgSectionFormFieldsProps) {
  const [code, setCode] = useState(mode === "edit" ? record.code : "");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [name, setName] = useState(mode === "edit" ? record.name : "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState(
    mode === "edit" ? record.sortOrder : 0,
  );
  const [isActive, setIsActive] = useState(
    mode === "edit" ? record.isActive : true,
  );
  const [note, setNote] = useState(mode === "edit" ? (record.note ?? "") : "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("부서명을 입력해 주세요.");
      return;
    }
    setNameError(null);

    let normalizedCode: string | undefined;
    if (mode === "edit") {
      normalizedCode = code.trim().toUpperCase();
      if (!isValidOrgCode("orgSection", normalizedCode)) {
        setCodeError("코드 형식이 올바르지 않습니다. (예: OS0001)");
        return;
      }
      setCodeError(null);
    }

    const trimmedNote = note.trim() ? note.trim() : null;

    startTransition(async () => {
      const result =
        mode === "edit"
          ? await updateOrgSectionAction(record.id, {
              name: trimmedName,
              sortOrder,
              isActive,
              note: trimmedNote,
              code: normalizedCode!,
            })
          : await createOrgSectionAction({
              organizationId,
              name: trimmedName,
              sortOrder,
              isActive,
              note: trimmedNote,
            });

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
          ? "부서 정보를 수정했습니다."
          : generatedCode
            ? `부서를 등록했습니다. (코드: ${generatedCode})`
            : "부서를 등록했습니다.",
      );
      onOpenChange(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label>상위 부문</Label>
          <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {organizationName}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-section-code">코드</Label>
          {mode === "edit" ? (
            <>
              <Input
                id="org-section-code"
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
              저장 시 자동으로 채번됩니다. (형식: OS####)
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-section-name">부서명</Label>
          <Input
            id="org-section-name"
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

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-section-sort-order">정렬순서</Label>
          <Input
            id="org-section-sort-order"
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor="org-section-is-active">사용여부</Label>
          <Switch
            id="org-section-is-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-section-note">비고</Label>
          <Textarea
            id="org-section-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
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
      </DialogFooter>
    </>
  );
}
