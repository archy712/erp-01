"use client";

import { useState, useTransition } from "react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAvatarEmoji } from "@/lib/erp/avatar-options";
import { clearOrgLeaderAction } from "@/lib/erp/org/actions";
import { ORG_LEVELS } from "@/lib/erp/org/levels";
import type {
  OrgLeader,
  OrgLevel,
  OrgMember,
  OrgTreeNode,
} from "@/lib/erp/org/types";
import type { UserRole } from "@/lib/erp/types";
import { OrgLeaderDialog } from "./org-leader-dialog";

/**
 * "지정"/"변경"/"해제" 버튼 노출 여부를 판정한다(Task 057). 최종 판정은 서버
 * 액션의 requireAdmin()/requireSuperadmin() + RLS가 담당하므로, 여기서는
 * 어긋나면 서버가 42501로 거부할 UX 힌트일 뿐이다.
 * - "superadmin"(그룹사/법인/부문): superadmin만.
 * - "adminScoped"(부서/팀): superadmin은 항상, admin은 자기 소속 부문(부서/팀의
 *   조상 부문)과 일치할 때만.
 */
function canEditLeader(
  node: OrgTreeNode,
  currentUserRole: UserRole,
  currentUserOrganizationId: string | null,
  ancestorDivisionId: string | null,
): boolean {
  const editableBy = ORG_LEVELS[node.level].leaderEditableBy;
  if (editableBy === "none") return false;
  if (editableBy === "superadmin") return currentUserRole === "superadmin";
  return (
    currentUserRole === "superadmin" ||
    currentUserOrganizationId === ancestorDivisionId
  );
}

export function OrgLeaderPanel({
  node,
  leader,
  members,
  currentUserRole,
  currentUserOrganizationId,
  ancestorDivisionId,
}: {
  node: OrgTreeNode;
  leader: OrgLeader | null;
  members: OrgMember[];
  currentUserRole: UserRole;
  currentUserOrganizationId: string | null;
  ancestorDivisionId: string | null;
}) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultTitle = ORG_LEVELS[node.level].defaultLeaderTitle;
  // member는 트리 노드로 펼치지 않으므로 이 컴포넌트가 실제로 이 레벨을
  // 받을 일은 없지만, 방어적으로 리더 개념이 없는 레벨은 렌더링하지 않는다.
  if (!defaultTitle) return null;

  const canEdit = canEditLeader(
    node,
    currentUserRole,
    currentUserOrganizationId,
    ancestorDivisionId,
  );

  function handleClear(event: { preventDefault: () => void }) {
    // AlertDialogAction은 클릭 시 기본적으로 다이얼로그를 닫는다 — 서버 응답을
    // 기다렸다가 실패 시 열린 채로 토스트만 보여주려면 preventDefault로 그
    // 기본 닫힘을 막아야 한다(components/erp/master/master-delete-dialog.tsx와
    // 동일 패턴).
    event.preventDefault();
    startTransition(async () => {
      const result = await clearOrgLeaderAction({
        level: node.level as Exclude<OrgLevel, "member">,
        targetId: node.id,
      });
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("리더를 해제했습니다.");
      setClearDialogOpen(false);
    });
  }

  return (
    <>
      <Card>
        <CardContent className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {leader ? getAvatarEmoji(leader.avatarKey) : "?"}
              </AvatarFallback>
            </Avatar>
            {leader ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {leader.profileName ?? "이름 없음"}
                </p>
                <p className="text-xs text-muted-foreground">{leader.title}</p>
              </div>
            ) : (
              <div className="min-w-0">
                <p className="text-sm font-medium text-muted-foreground">
                  미지정
                </p>
                <p className="text-xs text-muted-foreground">{defaultTitle}</p>
              </div>
            )}
          </div>

          {canEdit ? (
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAssignDialogOpen(true)}
              >
                {leader ? "변경" : "지정"}
              </Button>
              {leader ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setClearDialogOpen(true)}
                >
                  해제
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <OrgLeaderDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        node={node}
        leader={leader}
        members={members}
        defaultTitle={defaultTitle}
      />

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>리더 해제</AlertDialogTitle>
            <AlertDialogDescription>
              {leader?.profileName ?? "현재 리더"}님을 {node.name}의 리더에서
              해제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} disabled={isPending}>
              해제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
