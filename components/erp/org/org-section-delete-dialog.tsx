"use client";

import { useTransition } from "react";
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
import { deleteOrgSectionAction } from "@/lib/erp/org/actions";

type OrgSectionDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sectionId: string;
  sectionName: string;
  /** 부서 삭제 전 조회한 소속 팀 수(getSectionTeamsAction). 마스터 도메인의
   * "하위 있으면 삭제 불가"와 반대로, 여기는 항상 삭제 가능하고 영향만 안내한다. */
  mappedTeamCount: number;
};

export function OrgSectionDeleteDialog({
  open,
  onOpenChange,
  sectionId,
  sectionName,
  mappedTeamCount,
}: OrgSectionDeleteDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(event: { preventDefault: () => void }) {
    // AlertDialogAction은 클릭 시 기본적으로 다이얼로그를 닫으므로, 삭제
    // 실패 시(네트워크 오류 등) 다이얼로그를 유지하려면 기본 닫힘을 막는다
    // (components/erp/master/master-delete-dialog.tsx와 동일 패턴).
    event.preventDefault();
    startTransition(async () => {
      const result = await deleteOrgSectionAction(sectionId);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success(
        mappedTeamCount > 0
          ? `"${sectionName}" 부서를 삭제했습니다. 소속 팀 ${mappedTeamCount}개가 부문 직속으로 전환되었습니다.`
          : `"${sectionName}" 부서를 삭제했습니다.`,
      );
      onOpenChange(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>부서 삭제</AlertDialogTitle>
          <AlertDialogDescription>
            {mappedTeamCount > 0
              ? `"${sectionName}" 부서를 삭제하면 소속 팀 ${mappedTeamCount}개가 부문 직속으로 바뀝니다. 계속하시겠습니까?`
              : `"${sectionName}" 부서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>취소</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            삭제
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
