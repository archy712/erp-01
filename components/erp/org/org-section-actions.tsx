"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  getOrgSectionDetailAction,
  getSectionTeamsAction,
  getUnmappedTeamsInDivisionAction,
  moveOrgSectionAction,
  type SectionMappedTeam,
} from "@/lib/erp/org/actions";
import type { UnmappedTeam } from "@/lib/erp/org/queries";
import type { OrgTreeNode } from "@/lib/erp/org/types";
import type { UserRole } from "@/lib/erp/types";
import { OrgSectionDeleteDialog } from "./org-section-delete-dialog";
import {
  OrgSectionFormDialog,
  type OrgSectionFormRecord,
} from "./org-section-form-dialog";
import { OrgSectionTeamDialog } from "./org-section-team-dialog";

// 부문/부서/팀 노드에서만 렌더링한다 — 그 외 레벨(그룹사/법인/구성원)은 이
// 컴포넌트가 다룰 편집 대상이 없다(그쪽은 Task 055가 별도 슬롯에 얹는다).
//
// 버튼 노출(canEdit)은 UX 편의일 뿐이고, 실제 차단은 Server Action 가드
// (requireAdmin() + assertDivisionScope())와 RLS가 최종 방어선이다 — 여기서
// admin의 스코프를 currentUserOrganizationId === ancestorDivisionId로 판정하는
// 이유도 그 서버 판정(current_organization_id())을 화면에서 미리 흉내 낸 것뿐이다.
export function OrgSectionActions({
  node,
  currentUserRole,
  currentUserOrganizationId,
  ancestorDivisionId,
  selectedPath,
}: {
  node: OrgTreeNode;
  currentUserRole: UserRole;
  currentUserOrganizationId: string | null;
  ancestorDivisionId: string | null;
  selectedPath?: OrgTreeNode[];
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<OrgSectionFormRecord | null>(
    null,
  );

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTeamCount, setDeleteTeamCount] = useState(0);

  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamDialogData, setTeamDialogData] = useState<{
    unmapped: UnmappedTeam[];
    mapped: SectionMappedTeam[];
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const canEdit =
    currentUserRole === "superadmin" ||
    (currentUserRole === "admin" &&
      currentUserOrganizationId !== null &&
      currentUserOrganizationId === ancestorDivisionId);

  if (node.level === "team") {
    const sectionAncestor =
      selectedPath?.find((ancestor) => ancestor.level === "section") ?? null;
    return (
      <p className="text-sm text-muted-foreground">
        소속 부서: {sectionAncestor ? sectionAncestor.name : "없음(부문 직속)"}
      </p>
    );
  }

  if (node.level !== "division" && node.level !== "section") {
    return null;
  }

  if (!canEdit) return null;

  if (node.level === "division") {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" onClick={() => setFormOpen(true)}>
            + 부서 등록
          </Button>
        </div>
        <OrgSectionFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          mode="create"
          organizationId={node.id}
          organizationName={node.name}
        />
      </>
    );
  }

  // node.level === "section" — 상위 부문 정보는 selectedPath(루트→선택 경로)에서
  // division 레벨 조상을 찾아 얻는다(OrgTreeNode 자체에는 부모 참조가 없다).
  const divisionAncestor =
    selectedPath?.find((ancestor) => ancestor.level === "division") ?? null;
  const siblingSections = (divisionAncestor?.children ?? [])
    .filter((child) => child.level === "section" && child.id !== node.id)
    .map((child) => ({ id: child.id, name: child.name }));

  function openEditDialog() {
    startTransition(async () => {
      const detail = await getOrgSectionDetailAction(node.id);
      if (!detail) {
        toast.error("부서 정보를 불러오지 못했습니다.");
        return;
      }
      setEditRecord({
        id: node.id,
        code: detail.code,
        name: node.name,
        sortOrder: node.sortOrder,
        isActive: node.isActive,
        note: detail.note,
      });
      setFormOpen(true);
    });
  }

  function openDeleteDialog() {
    startTransition(async () => {
      const teams = await getSectionTeamsAction(node.id);
      setDeleteTeamCount(teams.length);
      setDeleteOpen(true);
    });
  }

  function openTeamDialog() {
    if (!ancestorDivisionId) return;
    startTransition(async () => {
      const [unmapped, mapped] = await Promise.all([
        getUnmappedTeamsInDivisionAction(ancestorDivisionId),
        getSectionTeamsAction(node.id),
      ]);
      setTeamDialogData({ unmapped, mapped });
      setTeamDialogOpen(true);
    });
  }

  function handleMove(direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveOrgSectionAction(node.id, direction);
      if (!result.success) {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={openEditDialog}
        >
          부서 수정
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={openDeleteDialog}
        >
          부서 삭제
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          aria-label="정렬순서 위로 이동"
          onClick={() => handleMove("up")}
        >
          ▲
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          aria-label="정렬순서 아래로 이동"
          onClick={() => handleMove("down")}
        >
          ▼
        </Button>
        <Button size="sm" disabled={isPending} onClick={openTeamDialog}>
          팀 소속 관리
        </Button>
      </div>

      {editRecord ? (
        <OrgSectionFormDialog
          open={formOpen}
          onOpenChange={(next) => {
            setFormOpen(next);
            if (!next) setEditRecord(null);
          }}
          mode="edit"
          record={editRecord}
          organizationId={divisionAncestor?.id ?? ancestorDivisionId ?? ""}
          organizationName={divisionAncestor?.name ?? ""}
        />
      ) : null}

      <OrgSectionDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        sectionId={node.id}
        sectionName={node.name}
        mappedTeamCount={deleteTeamCount}
      />

      {teamDialogData && ancestorDivisionId ? (
        <OrgSectionTeamDialog
          open={teamDialogOpen}
          onOpenChange={setTeamDialogOpen}
          sectionId={node.id}
          sectionName={node.name}
          organizationId={ancestorDivisionId}
          siblingSections={siblingSections}
          initialUnmappedTeams={teamDialogData.unmapped}
          initialMappedTeams={teamDialogData.mapped}
        />
      ) : null}
    </>
  );
}
