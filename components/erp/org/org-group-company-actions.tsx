"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  clearCompanyGroupAction,
  getCompaniesForOrgAction,
  getOrgCompaniesAction,
  getOrgCompanyDetailAction,
  getOrgGroupDetailAction,
  getUnmappedDivisionsAction,
  moveOrgGroupCompanyAction,
  setCompanyGroupAction,
  setDivisionCompanyAction,
  updateOrgGroupAction,
  type OrgCompanyDetail,
  type OrgCompanyOption,
  type OrgGroupDetail,
} from "@/lib/erp/org/actions";
import type {
  UnassignedCompany,
  UnmappedDivision,
} from "@/lib/erp/org/queries";
import type { OrgTreeNode } from "@/lib/erp/org/types";
import type { UserRole } from "@/lib/erp/types";

/**
 * 그룹사(싱글턴)/법인 노드 선택 시의 편집 버튼 묶음(Task 055 → PRD_ORG_COMPANY_MERGE.md로 축소).
 * 법인(companies) 자체의 등록/수정/삭제 UI는 여기 없다 — 기준정보 관리
 * (`/erp/master/companies`)가 유일한 창구이고, 이 컴포넌트는 "이미 있는
 * 법인을 그룹사에 배정"만 담당한다. "division"(부문) 노드에서는 "소속 법인
 * 변경" 버튼 하나만 내보낸다 — 부문 자체(organizations)의 이름 편집 UI는
 * 이번 범위 밖이다. 부문 노드의 다른 편집 어포던스(부서 등록 등)는 Task 056이
 * 별도 컴포넌트로 추가한다.
 */
export function OrgGroupCompanyActions({
  node,
  currentUserRole,
}: {
  node: OrgTreeNode;
  currentUserRole: UserRole;
}) {
  const [groupEditOpen, setGroupEditOpen] = useState(false);
  const [companyAssignOpen, setCompanyAssignOpen] = useState(false);
  const [companyDetailOpen, setCompanyDetailOpen] = useState(false);
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
      const result = await moveOrgGroupCompanyAction(node.id, direction);
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
              onClick={() => setCompanyAssignOpen(true)}
            >
              법인 배정
            </Button>
          </>
        ) : null}

        {node.level === "company" ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCompanyDetailOpen(true)}
            >
              그룹사 배정 변경
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
        <CompanyAssignDialog
          orgGroupId={node.id}
          orgGroupName={node.name}
          open={companyAssignOpen}
          onOpenChange={setCompanyAssignOpen}
        />
      ) : null}

      {node.level === "company" ? (
        <CompanyDetailDialog
          companyId={node.id}
          open={companyDetailOpen}
          onOpenChange={setCompanyDetailOpen}
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

// --- 법인 배정 (그룹사 노드에서: 미배정 법인을 이 그룹사에 배정) ---

function CompanyAssignDialog({
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
          <DialogTitle>법인 배정</DialogTitle>
          <DialogDescription>
            {`이미 등록된 법인 중 아직 어떤 그룹사에도 배정되지 않은 법인을 '${orgGroupName}'에 배정합니다.`}
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <CompanyAssignLoader
            orgGroupId={orgGroupId}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CompanyAssignLoader({
  orgGroupId,
  onOpenChange,
}: {
  orgGroupId: string;
  onOpenChange: (open: boolean) => void;
}) {
  const [companies, setCompanies] = useState<UnassignedCompany[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getCompaniesForOrgAction()
      .then((result) => {
        if (cancelled) return;
        setCompanies(result);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [orgGroupId]);

  if (loadFailed) {
    return (
      <p className="py-6 text-sm text-destructive">
        법인 목록을 불러오지 못했습니다.
      </p>
    );
  }

  if (!companies) {
    return <p className="py-6 text-sm text-muted-foreground">불러오는 중...</p>;
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col gap-4 py-2">
        <p className="text-sm text-muted-foreground">
          배정할 수 있는 법인이 없습니다. 새 법인은 기준정보 관리 &gt; 법인
          관리에서 등록해 주세요.
        </p>
        <Link
          href="/erp/master/companies"
          className="text-sm font-medium underline underline-offset-4"
        >
          기준정보 관리 &gt; 법인 관리로 이동
        </Link>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            닫기
          </Button>
        </DialogFooter>
      </div>
    );
  }

  return (
    <CompanyAssignForm
      orgGroupId={orgGroupId}
      companies={companies}
      onOpenChange={onOpenChange}
    />
  );
}

function CompanyAssignForm({
  orgGroupId,
  companies,
  onOpenChange,
}: {
  orgGroupId: string;
  companies: UnassignedCompany[];
  onOpenChange: (open: boolean) => void;
}) {
  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!companyId) {
      toast.error("배정할 법인을 선택해 주세요.");
      return;
    }
    startTransition(async () => {
      const result = await setCompanyGroupAction(companyId, orgGroupId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("법인을 배정했습니다.");
      onOpenChange(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-company-assign-target">배정할 법인</Label>
          <NativeSelect
            id="org-company-assign-target"
            className="w-full"
            value={companyId}
            onChange={(event) => setCompanyId(event.target.value)}
          >
            {companies.map((company) => (
              <NativeSelectOption key={company.id} value={company.id}>
                {company.code} · {company.name}
                {company.isActive ? "" : " (비활성)"}
              </NativeSelectOption>
            ))}
          </NativeSelect>
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
          배정
        </Button>
      </DialogFooter>
    </>
  );
}

// --- 법인 상세(읽기 전용) + 그룹사 배정 해제 ---

function CompanyDetailDialog({
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
          <DialogTitle>법인 정보</DialogTitle>
          <DialogDescription>
            법인 자체의 코드/명칭/사용여부/비고는 기준정보 관리에서 수정합니다.
            여기서는 그룹사 배정만 변경할 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <CompanyDetailLoader
            companyId={companyId}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function CompanyDetailLoader({
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

  return <CompanyDetailView detail={detail} onOpenChange={onOpenChange} />;
}

function CompanyDetailView({
  detail,
  onOpenChange,
}: {
  detail: OrgCompanyDetail;
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();

  function handleUnassign() {
    startTransition(async () => {
      const result = await clearCompanyGroupAction(detail.id);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("그룹사 배정을 해제했습니다.");
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
          <Label>법인명</Label>
          <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {detail.name}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>사용여부</Label>
          <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
            {detail.isActive ? "사용" : "미사용"}
          </p>
        </div>

        {detail.note ? (
          <div className="flex flex-col gap-1.5">
            <Label>비고</Label>
            <p className="rounded-md border bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
              {detail.note}
            </p>
          </div>
        ) : null}

        <Link
          href="/erp/master/companies"
          className="text-sm font-medium underline underline-offset-4"
        >
          기준정보 관리에서 수정
        </Link>

        <div className="flex flex-col gap-1.5 rounded-md border p-3">
          <Label>소속 그룹사</Label>
          <p className="text-sm text-muted-foreground">{detail.orgGroupName}</p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="mt-2 w-fit"
            onClick={handleUnassign}
            disabled={isPending}
          >
            그룹사 배정 해제
          </Button>
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
