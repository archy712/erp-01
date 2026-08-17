"use client";

import { useEffect, useState, useTransition } from "react";
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
} from "@/components/ui/alert-dialog";
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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { isValidOrgCode } from "@/lib/erp/org/code";
import {
  createOrgCompanyAction,
  deleteOrgCompanyAction,
  getOrgCompaniesAction,
  getOrgCompanyDetailAction,
  getOrgGroupDetailAction,
  getUnmappedDivisionsAction,
  moveOrgCompanyAction,
  setDivisionCompanyAction,
  updateOrgCompanyAction,
  updateOrgGroupAction,
  type OrgCompanyDetail,
  type OrgCompanyOption,
  type OrgGroupDetail,
} from "@/lib/erp/org/actions";
import type { UnmappedDivision } from "@/lib/erp/org/queries";
import type { OrgTreeNode } from "@/lib/erp/org/types";
import type { UserRole } from "@/lib/erp/types";

// deleteOrgCompanyAction(lib/erp/org/actions.ts)은 FK restrict(23503) 위반 시
// 이 문구를 그대로 반환한다(master-delete-dialog.tsx와 동일한 메시지 기반 분기 관례).
const RESTRICT_MESSAGE_HINT = "하위 데이터가 있어 삭제할 수 없습니다";

/**
 * 그룹사(싱글턴)/법인 노드 선택 시의 편집 버튼 묶음(Task 055).
 * "division"(부문) 노드에서는 "소속 법인 변경" 버튼 하나만 내보낸다 —
 * 부문 자체(organizations)의 이름 편집 UI는 이번 범위 밖이다.
 * 부문 노드의 다른 편집 어포던스(부서 등록 등)는 Task 056이 별도 컴포넌트로 추가한다.
 */
export function OrgGroupCompanyActions({
  node,
  currentUserRole,
}: {
  node: OrgTreeNode;
  currentUserRole: UserRole;
}) {
  const [groupEditOpen, setGroupEditOpen] = useState(false);
  const [companyCreateOpen, setCompanyCreateOpen] = useState(false);
  const [companyEditOpen, setCompanyEditOpen] = useState(false);
  const [companyDeleteOpen, setCompanyDeleteOpen] = useState(false);
  const [mappingOpen, setMappingOpen] = useState(false);
  const [isMovePending, startMoveTransition] = useTransition();

  if (
    node.level !== "group" &&
    node.level !== "company" &&
    node.level !== "division"
  ) {
    return null;
  }

  // 버튼 노출 자체는 UX 편의일 뿐 실제 권한 판정은 Server Action 진입부의
  // requireSuperadmin()과 RLS가 최종 담당한다(PRD_ORG.md 3.1절).
  if (currentUserRole !== "superadmin") {
    return null;
  }

  function handleMove(direction: "up" | "down") {
    startMoveTransition(async () => {
      const result = await moveOrgCompanyAction(node.id, direction);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("정렬순서를 변경했습니다.");
    });
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {node.level === "group" ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setGroupEditOpen(true)}
            >
              그룹사 수정
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCompanyCreateOpen(true)}
            >
              + 법인 등록
            </Button>
          </>
        ) : null}

        {node.level === "company" ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCompanyEditOpen(true)}
            >
              법인 수정
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setCompanyDeleteOpen(true)}
            >
              법인 삭제
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMove("up")}
              disabled={isMovePending}
              aria-label="위로 이동"
            >
              ▲
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleMove("down")}
              disabled={isMovePending}
              aria-label="아래로 이동"
            >
              ▼
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMappingOpen(true)}
            >
              부문 연결 관리
            </Button>
          </>
        ) : null}

        {node.level === "division" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setMappingOpen(true)}
          >
            소속 법인 변경
          </Button>
        ) : null}
      </div>

      {node.level === "group" ? (
        <OrgGroupEditDialog
          groupId={node.id}
          open={groupEditOpen}
          onOpenChange={setGroupEditOpen}
        />
      ) : null}

      {node.level === "group" ? (
        <OrgCompanyCreateDialog
          orgGroupId={node.id}
          orgGroupName={node.name}
          open={companyCreateOpen}
          onOpenChange={setCompanyCreateOpen}
        />
      ) : null}

      {node.level === "company" ? (
        <OrgCompanyEditDialog
          companyId={node.id}
          open={companyEditOpen}
          onOpenChange={setCompanyEditOpen}
        />
      ) : null}

      {node.level === "company" ? (
        <OrgCompanyDeleteDialog
          companyId={node.id}
          companyName={node.name}
          open={companyDeleteOpen}
          onOpenChange={setCompanyDeleteOpen}
        />
      ) : null}

      {node.level === "company" || node.level === "division" ? (
        <OrgDivisionMappingDialog
          node={node}
          open={mappingOpen}
          onOpenChange={setMappingOpen}
        />
      ) : null}
    </>
  );
}

// --- 그룹사 수정 ---

function OrgGroupEditDialog({
  groupId,
  open,
  onOpenChange,
}: {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>그룹사 수정</DialogTitle>
          <DialogDescription>
            그룹사명/사용여부/비고를 수정합니다. 등록·삭제는 지원하지 않습니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <OrgGroupEditLoader groupId={groupId} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// 다이얼로그가 열릴 때만 마운트되며(부모의 open 게이팅), code/note를 포함한
// 상세는 OrgTreeNode에 없어 서버 왕복이 불가피하다 — 로딩이 끝난 뒤에만
// 실제 폼(OrgGroupEditForm)을 마운트해, 그 폼의 useState 초기값은 항상
// prop(detail)에서 동기적으로 계산된다(master-form-sheet.tsx와 동일한
// "열릴 때 다시 마운트" 규약 — 로딩 대기만 한 단계 앞에 추가된 형태).
function OrgGroupEditLoader({
  groupId,
  onOpenChange,
}: {
  groupId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [detail, setDetail] = useState<OrgGroupDetail | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOrgGroupDetailAction()
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setLoadFailed(true);
          return;
        }
        setDetail(result);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [groupId]);

  if (loadFailed) {
    return (
      <p className="py-6 text-sm text-destructive">
        그룹사 정보를 불러오지 못했습니다.
      </p>
    );
  }

  if (!detail) {
    return <p className="py-6 text-sm text-muted-foreground">불러오는 중...</p>;
  }

  return <OrgGroupEditForm detail={detail} onOpenChange={onOpenChange} />;
}

function OrgGroupEditForm({
  detail,
  onOpenChange,
}: {
  detail: OrgGroupDetail;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState(detail.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(detail.isActive);
  const [note, setNote] = useState(detail.note ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("그룹사명을 입력해 주세요.");
      return;
    }
    setNameError(null);

    startTransition(async () => {
      const result = await updateOrgGroupAction(detail.id, {
        name: trimmedName,
        isActive,
        note: note.trim() ? note.trim() : null,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("그룹사 정보를 수정했습니다.");
      onOpenChange(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <Label>코드</Label>
          <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {detail.code}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-group-name">그룹사명</Label>
          <Input
            id="org-group-name"
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

        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor="org-group-active">사용여부</Label>
          <Switch
            id="org-group-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-group-note">비고</Label>
          <Textarea
            id="org-group-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          취소
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          저장
        </Button>
      </DialogFooter>
    </>
  );
}

// --- 법인 등록 ---

function OrgCompanyCreateDialog({
  orgGroupId,
  orgGroupName,
  open,
  onOpenChange,
}: {
  orgGroupId: string;
  orgGroupName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>법인 등록</DialogTitle>
          <DialogDescription>
            코드는 저장 시 자동으로 채번됩니다. (OC####)
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <OrgCompanyCreateFields
            orgGroupId={orgGroupId}
            orgGroupName={orgGroupName}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function OrgCompanyCreateFields({
  orgGroupId,
  orgGroupName,
  onOpenChange,
}: {
  orgGroupId: string;
  orgGroupName: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [note, setNote] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("법인명을 입력해 주세요.");
      return;
    }
    setNameError(null);

    startTransition(async () => {
      const result = await createOrgCompanyAction({
        orgGroupId,
        name: trimmedName,
        sortOrder,
        isActive,
        note: note.trim() ? note.trim() : null,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(
        result.code
          ? `법인을 등록했습니다. (코드: ${result.code})`
          : "법인을 등록했습니다.",
      );
      onOpenChange(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <Label>코드</Label>
          <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            자동 생성(OC####)
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-company-name">법인명</Label>
          <Input
            id="org-company-name"
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
          <Label>상위 그룹사</Label>
          <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {orgGroupName}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-company-sort-order">정렬순서</Label>
          <Input
            id="org-company-sort-order"
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor="org-company-active">사용여부</Label>
          <Switch
            id="org-company-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-company-note">비고</Label>
          <Textarea
            id="org-company-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          취소
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          등록
        </Button>
      </DialogFooter>
    </>
  );
}

// --- 법인 수정 ---

function OrgCompanyEditDialog({
  companyId,
  open,
  onOpenChange,
}: {
  companyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>법인 수정</DialogTitle>
          <DialogDescription>정보를 수정한 뒤 저장하세요.</DialogDescription>
        </DialogHeader>
        {open ? (
          <OrgCompanyEditLoader
            companyId={companyId}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function OrgCompanyEditLoader({
  companyId,
  onOpenChange,
}: {
  companyId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [detail, setDetail] = useState<OrgCompanyDetail | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getOrgCompanyDetailAction(companyId)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setLoadFailed(true);
          return;
        }
        setDetail(result);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  if (loadFailed) {
    return (
      <p className="py-6 text-sm text-destructive">
        법인 정보를 불러오지 못했습니다.
      </p>
    );
  }

  if (!detail) {
    return <p className="py-6 text-sm text-muted-foreground">불러오는 중...</p>;
  }

  return <OrgCompanyEditForm detail={detail} onOpenChange={onOpenChange} />;
}

function OrgCompanyEditForm({
  detail,
  onOpenChange,
}: {
  detail: OrgCompanyDetail;
  onOpenChange: (open: boolean) => void;
}) {
  const [code, setCode] = useState(detail.code);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [name, setName] = useState(detail.name);
  const [nameError, setNameError] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState(detail.sortOrder);
  const [isActive, setIsActive] = useState(detail.isActive);
  const [note, setNote] = useState(detail.note ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("법인명을 입력해 주세요.");
      return;
    }
    setNameError(null);

    const normalizedCode = code.trim().toUpperCase();
    if (!isValidOrgCode("orgCompany", normalizedCode)) {
      setCodeError("법인 코드 형식이 올바르지 않습니다. (예: OC0001)");
      return;
    }
    setCodeError(null);

    startTransition(async () => {
      const result = await updateOrgCompanyAction(detail.id, {
        code: normalizedCode,
        name: trimmedName,
        sortOrder,
        isActive,
        note: note.trim() ? note.trim() : null,
      });
      if (!result.success) {
        // 코드 unique 위반 등 코드 관련 서버 에러는 코드 필드 인라인 에러로 보여준다
        // (master-form-sheet.tsx와 동일한 이중 방어 관례).
        if (result.message.includes("코드")) {
          setCodeError(result.message);
        } else {
          toast.error(result.message);
        }
        return;
      }
      toast.success("법인 정보를 수정했습니다.");
      onOpenChange(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-company-code">코드</Label>
          <Input
            id="org-company-code"
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
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-company-edit-name">법인명</Label>
          <Input
            id="org-company-edit-name"
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
          <Label>상위 그룹사</Label>
          <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {detail.orgGroupName}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-company-edit-sort-order">정렬순서</Label>
          <Input
            id="org-company-edit-sort-order"
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <Label htmlFor="org-company-edit-active">사용여부</Label>
          <Switch
            id="org-company-edit-active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-company-edit-note">비고</Label>
          <Textarea
            id="org-company-edit-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
          />
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          취소
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          저장
        </Button>
      </DialogFooter>
    </>
  );
}

// --- 법인 삭제 ---

function OrgCompanyDeleteDialog({
  companyId,
  companyName,
  open,
  onOpenChange,
}: {
  companyId: string;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [blocked, setBlocked] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) setBlocked(false);
    onOpenChange(next);
  }

  function handleDelete(event: { preventDefault: () => void }) {
    // AlertDialogAction은 Radix Dialog.Close와 동일하게 클릭 시 기본적으로
    // 다이얼로그를 닫는다 — 삭제 실패(하위 부문 매핑 존재) 시 "사용여부 끄기"
    // 안내로 전환하려면 preventDefault()로 그 기본 닫힘을 막아야 한다
    // (master-delete-dialog.tsx와 동일한 관례).
    event.preventDefault();
    startTransition(async () => {
      const result = await deleteOrgCompanyAction(companyId);
      if (!result.success) {
        if (result.message.includes(RESTRICT_MESSAGE_HINT)) {
          setBlocked(true);
        } else {
          toast.error(result.message);
        }
        return;
      }
      toast.success("법인을 삭제했습니다.");
      handleOpenChange(false);
    });
  }

  function handleDeactivate() {
    startTransition(async () => {
      const result = await updateOrgCompanyAction(companyId, {
        isActive: false,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("사용여부를 껐습니다.");
      handleOpenChange(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? "삭제할 수 없습니다" : "법인 삭제"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? "하위 데이터가 있어 삭제할 수 없습니다. 대신 사용여부를 꺼주세요."
              : `'${companyName}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {blocked ? (
            <>
              <AlertDialogCancel disabled={isPending}>닫기</AlertDialogCancel>
              <Button onClick={handleDeactivate} disabled={isPending}>
                사용여부 끄기
              </Button>
            </>
          ) : (
            <>
              <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isPending}>
                삭제
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// --- 법인 ↔ 부문 매핑 ---

function OrgDivisionMappingDialog({
  node,
  open,
  onOpenChange,
}: {
  node: OrgTreeNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isCompanyMode = node.level === "company";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isCompanyMode ? "부문 연결 관리" : "소속 법인 변경"}
          </DialogTitle>
          <DialogDescription>
            {isCompanyMode
              ? `'${node.name}' 법인에 부문을 연결하거나, 이미 연결된 부문을 다른 법인으로 이동합니다.`
              : `'${node.name}' 부문이 소속될 법인을 선택하세요.`}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <OrgDivisionMappingLoader node={node} onOpenChange={onOpenChange} />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function OrgDivisionMappingLoader({
  node,
  onOpenChange,
}: {
  node: OrgTreeNode;
  onOpenChange: (open: boolean) => void;
}) {
  const [companies, setCompanies] = useState<OrgCompanyOption[] | null>(null);
  const [unmapped, setUnmapped] = useState<UnmappedDivision[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getOrgCompaniesAction(),
      node.level === "company"
        ? getUnmappedDivisionsAction()
        : Promise.resolve<UnmappedDivision[]>([]),
    ])
      .then(([companyList, unmappedList]) => {
        if (cancelled) return;
        setCompanies(companyList);
        setUnmapped(unmappedList);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [node.id, node.level]);

  if (loadFailed) {
    return (
      <p className="py-6 text-sm text-destructive">
        법인/부문 정보를 불러오지 못했습니다.
      </p>
    );
  }

  if (!companies || !unmapped) {
    return <p className="py-6 text-sm text-muted-foreground">불러오는 중...</p>;
  }

  if (node.level === "division") {
    return (
      <OrgDivisionMoveForm
        divisionId={node.id}
        divisionName={node.name}
        companies={companies}
        onOpenChange={onOpenChange}
      />
    );
  }

  return (
    <OrgCompanyDivisionsForm
      companyId={node.id}
      divisions={node.children}
      companies={companies}
      unmapped={unmapped}
      onOpenChange={onOpenChange}
    />
  );
}

/** 부문 노드에서 "소속 법인 변경"을 눌렀을 때의 단일 이동 폼. */
function OrgDivisionMoveForm({
  divisionId,
  divisionName,
  companies,
  onOpenChange,
}: {
  divisionId: string;
  divisionName: string;
  companies: OrgCompanyOption[];
  onOpenChange: (open: boolean) => void;
}) {
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!companyId) {
      toast.error("이동할 법인을 선택해 주세요.");
      return;
    }
    startTransition(async () => {
      const result = await setDivisionCompanyAction(divisionId, companyId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(`'${divisionName}' 부문의 소속 법인을 변경했습니다.`);
      onOpenChange(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-division-target-company">소속 법인</Label>
          <NativeSelect
            id="org-division-target-company"
            className="w-full"
            value={companyId}
            onChange={(event) => setCompanyId(event.target.value)}
            disabled={companies.length === 0}
          >
            {companies.map((company) => (
              <NativeSelectOption key={company.id} value={company.id}>
                {company.name}
                {company.isActive ? "" : " (비활성)"}
              </NativeSelectOption>
            ))}
          </NativeSelect>
          {companies.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              등록된 법인이 없습니다. 먼저 법인을 등록해 주세요.
            </p>
          ) : null}
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          취소
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || companies.length === 0}
        >
          저장
        </Button>
      </DialogFooter>
    </>
  );
}

/**
 * 법인 노드에서 "부문 연결 관리"를 눌렀을 때의 폼. (a) 미매핑 부문 추가,
 * (b) 이 법인 소속 부문을 다른 법인으로 이동을 모두 다룬다. 액션 성공 시
 * 다이얼로그를 닫는다 — 목록(node.children/unmapped)은 다이얼로그가 열릴
 * 때 한 번만 조회한 스냅샷이라, 닫지 않고 계속 보여주면 서버 상태와
 * 어긋날 수 있어서다(재조회는 revalidatePath 후 다음번 open에서 새로 받는다).
 */
function OrgCompanyDivisionsForm({
  companyId,
  divisions,
  companies,
  unmapped,
  onOpenChange,
}: {
  companyId: string;
  divisions: OrgTreeNode[];
  companies: OrgCompanyOption[];
  unmapped: UnmappedDivision[];
  onOpenChange: (open: boolean) => void;
}) {
  const [addDivisionId, setAddDivisionId] = useState(unmapped[0]?.id ?? "");
  const [moveTargets, setMoveTargets] = useState<Record<string, string>>(() =>
    Object.fromEntries(divisions.map((division) => [division.id, ""])),
  );
  const [isPending, startTransition] = useTransition();

  const otherCompanies = companies.filter(
    (company) => company.id !== companyId,
  );

  function handleAdd() {
    if (!addDivisionId) {
      toast.error("추가할 부문을 선택해 주세요.");
      return;
    }
    startTransition(async () => {
      const result = await setDivisionCompanyAction(addDivisionId, companyId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("부문을 연결했습니다.");
      onOpenChange(false);
    });
  }

  function handleMove(divisionId: string) {
    const targetCompanyId = moveTargets[divisionId];
    if (!targetCompanyId) {
      toast.error("이동할 법인을 선택해 주세요.");
      return;
    }
    startTransition(async () => {
      const result = await setDivisionCompanyAction(
        divisionId,
        targetCompanyId,
      );
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("부문의 소속 법인을 변경했습니다.");
      onOpenChange(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-6 py-2">
        <div className="flex flex-col gap-2">
          <Label>새 부문 추가</Label>
          {unmapped.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              추가할 수 있는 부문이 없습니다.
            </p>
          ) : (
            <div className="flex gap-2">
              <NativeSelect
                className="w-full"
                value={addDivisionId}
                onChange={(event) => setAddDivisionId(event.target.value)}
                aria-label="추가할 부문"
              >
                {unmapped.map((division) => (
                  <NativeSelectOption key={division.id} value={division.id}>
                    {division.name}
                    {division.isActive ? "" : " (비활성)"}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Button
                type="button"
                variant="outline"
                onClick={handleAdd}
                disabled={isPending}
              >
                추가
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Label>소속 부문 목록</Label>
          {divisions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              연결된 부문이 없습니다.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {divisions.map((division) => (
                <div
                  key={division.id}
                  className="flex flex-col gap-2 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <p className="text-sm font-medium">
                    {division.name}
                    {!division.isActive ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        (비활성)
                      </span>
                    ) : null}
                  </p>
                  <div className="flex gap-2">
                    <NativeSelect
                      className="w-full sm:w-44"
                      value={moveTargets[division.id] ?? ""}
                      onChange={(event) =>
                        setMoveTargets((prev) => ({
                          ...prev,
                          [division.id]: event.target.value,
                        }))
                      }
                      disabled={otherCompanies.length === 0}
                      aria-label={`${division.name} 이동할 법인`}
                    >
                      <NativeSelectOption value="">
                        다른 법인으로 이동...
                      </NativeSelectOption>
                      {otherCompanies.map((company) => (
                        <NativeSelectOption key={company.id} value={company.id}>
                          {company.name}
                          {company.isActive ? "" : " (비활성)"}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleMove(division.id)}
                      disabled={isPending || !moveTargets[division.id]}
                    >
                      이동
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={isPending}
        >
          닫기
        </Button>
      </DialogFooter>
    </>
  );
}
