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
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";
import {
  assignTeamToSectionAction,
  getSectionTeamsAction,
  getUnmappedTeamsInDivisionAction,
  removeTeamFromSectionAction,
  type SectionMappedTeam,
} from "@/lib/erp/org/actions";
import type { UnmappedTeam } from "@/lib/erp/org/queries";

export type OrgSectionTeamDialogSibling = { id: string; name: string };

type OrgSectionTeamDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionName: string;
  /** getUnmappedTeamsInDivisionAction 호출에 쓰는 부문 id(=ancestorDivisionId). */
  organizationId: string;
  /** 같은 부문의 다른 부서들 — "다른 부서로 이동" select 후보(다른 부문 부서는 애초에 넘어오지 않는다). */
  siblingSections: OrgSectionTeamDialogSibling[];
  /** 다이얼로그를 열기 직전(버튼 onClick)에 미리 가져온 초기 데이터. */
  initialUnmappedTeams: UnmappedTeam[];
  initialMappedTeams: SectionMappedTeam[];
};

// Dialog/DialogContent는 항상 마운트해두고, useState를 가진 본문은 open일 때만
// 마운트한다(org-section-form-dialog.tsx와 동일 규약). 목록 데이터는 열기 직전
// 버튼 핸들러에서 미리 fetch해 props로 넘어오므로, 마운트 시점의 useState 초기값도
// 그 props를 그대로 쓸 뿐 useEffect로 다시 계산하지 않는다 — 이후 배정/해제/이동
// 액션이 성공할 때마다 같은 조회 액션을 다시 호출해 로컬 상태를 갱신한다(이건
// "props로부터 초기화"가 아니라 사용자 액션 결과에 대한 일반적인 상태 갱신이다).
export function OrgSectionTeamDialog({
  open,
  onOpenChange,
  sectionId,
  sectionName,
  organizationId,
  siblingSections,
  initialUnmappedTeams,
  initialMappedTeams,
}: OrgSectionTeamDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{sectionName} — 팀 소속 관리</DialogTitle>
          <DialogDescription>
            이 부문 안에서 아직 부서가 없는 팀을 추가하거나, 소속 팀을 부문
            직속으로 되돌리거나 다른 부서로 옮길 수 있습니다.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <OrgSectionTeamDialogBody
            sectionId={sectionId}
            organizationId={organizationId}
            siblingSections={siblingSections}
            initialUnmappedTeams={initialUnmappedTeams}
            initialMappedTeams={initialMappedTeams}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function OrgSectionTeamDialogBody({
  sectionId,
  organizationId,
  siblingSections,
  initialUnmappedTeams,
  initialMappedTeams,
  onOpenChange,
}: Omit<OrgSectionTeamDialogProps, "open" | "sectionName">) {
  const [unmappedTeams, setUnmappedTeams] = useState(initialUnmappedTeams);
  const [mappedTeams, setMappedTeams] = useState(initialMappedTeams);
  const [moveTargets, setMoveTargets] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  function refetch() {
    startTransition(async () => {
      const [unmapped, mapped] = await Promise.all([
        getUnmappedTeamsInDivisionAction(organizationId),
        getSectionTeamsAction(sectionId),
      ]);
      setUnmappedTeams(unmapped);
      setMappedTeams(mapped);
    });
  }

  function handleAssign(departmentId: string) {
    startTransition(async () => {
      const result = await assignTeamToSectionAction(departmentId, sectionId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("팀을 부서에 배정했습니다.");
      refetch();
    });
  }

  function handleRemove(departmentId: string) {
    startTransition(async () => {
      const result = await removeTeamFromSectionAction(departmentId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("팀을 부문 직속으로 되돌렸습니다.");
      refetch();
    });
  }

  function handleMove(departmentId: string) {
    const targetSectionId = moveTargets[departmentId];
    if (!targetSectionId) return;
    startTransition(async () => {
      const result = await assignTeamToSectionAction(
        departmentId,
        targetSectionId,
      );
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("팀을 다른 부서로 이동했습니다.");
      setMoveTargets((prev) => {
        const next = { ...prev };
        delete next[departmentId];
        return next;
      });
      refetch();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">
          배정된 팀 ({mappedTeams.length}개)
        </p>
        {mappedTeams.length === 0 ? (
          <p className="text-sm text-muted-foreground">배정된 팀이 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {mappedTeams.map((team) => (
              <li
                key={team.departmentId}
                className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm">
                  {team.name}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => handleRemove(team.departmentId)}
                >
                  부문 직속으로 되돌리기
                </Button>
                {siblingSections.length > 0 ? (
                  <>
                    <NativeSelect
                      size="sm"
                      aria-label="다른 부서로 이동"
                      value={moveTargets[team.departmentId] ?? ""}
                      onChange={(event) =>
                        setMoveTargets((prev) => ({
                          ...prev,
                          [team.departmentId]: event.target.value,
                        }))
                      }
                    >
                      <NativeSelectOption value="">
                        다른 부서로 이동...
                      </NativeSelectOption>
                      {siblingSections.map((sibling) => (
                        <NativeSelectOption key={sibling.id} value={sibling.id}>
                          {sibling.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                    <Button
                      size="sm"
                      disabled={isPending || !moveTargets[team.departmentId]}
                      onClick={() => handleMove(team.departmentId)}
                    >
                      이동
                    </Button>
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">
          부문 직속 팀 중 추가 ({unmappedTeams.length}개)
        </p>
        {unmappedTeams.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            추가할 수 있는 팀이 없습니다.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {unmappedTeams.map((team) => (
              <li
                key={team.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-sm">
                  {team.name}
                </span>
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={() => handleAssign(team.id)}
                >
                  추가
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DialogFooter>
        <Button
          variant="outline"
          disabled={isPending}
          onClick={() => onOpenChange(false)}
        >
          닫기
        </Button>
      </DialogFooter>
    </div>
  );
}
