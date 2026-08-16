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
import { Button } from "@/components/ui/button";
import {
  deleteMasterAction,
  setMasterActiveAction,
} from "@/lib/erp/master/actions";
import {
  MASTER_ENTITIES,
  type MasterEntityKey,
} from "@/lib/erp/master/entities";

// deleteMasterAction(lib/erp/master/actions.ts)은 FK restrict(23503) 위반 시
// 이 문구를 그대로 반환한다. ActionResult가 별도 에러 코드를 노출하지 않아
// "사용여부 끄기" 대체 액션을 보여주려면 메시지 내용으로 분기할 수밖에 없다.
const RESTRICT_MESSAGE_HINT = "하위 데이터가 있어 삭제할 수 없습니다";

type MasterDeleteDialogRecord = { id: string; name: string; isActive: boolean };

type MasterDeleteDialogProps = {
  entity: MasterEntityKey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: MasterDeleteDialogRecord | null;
  onDeleted?: () => void;
};

export function MasterDeleteDialog({
  entity,
  open,
  onOpenChange,
  record,
  onDeleted,
}: MasterDeleteDialogProps) {
  const meta = MASTER_ENTITIES[entity];
  const [blocked, setBlocked] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleOpenChange(next: boolean) {
    if (!next) setBlocked(false);
    onOpenChange(next);
  }

  function handleDelete(event: { preventDefault: () => void }) {
    // AlertDialogAction은 Radix Dialog.Close와 동일하게 클릭 시 기본적으로
    // 다이얼로그를 닫는다 — 삭제 실패(하위 참조 존재) 시 "사용여부 끄기" 안내로
    // 전환하려면 preventDefault()로 그 기본 닫힘을 막아야 한다.
    event.preventDefault();
    if (!record) return;
    startTransition(async () => {
      const result = await deleteMasterAction(entity, record.id);
      if (!result.success) {
        if (result.message.includes(RESTRICT_MESSAGE_HINT)) {
          setBlocked(true);
        } else {
          toast.error(result.message);
        }
        return;
      }
      toast.success(`${meta.label}을(를) 삭제했습니다.`);
      onDeleted?.();
      handleOpenChange(false);
    });
  }

  function handleDeactivate() {
    if (!record) return;
    startTransition(async () => {
      const result = await setMasterActiveAction(entity, record.id, false);
      if (!result.success) {
        toast.error(result.message);
        return;
      }
      toast.success("사용여부를 껐습니다.");
      onDeleted?.();
      handleOpenChange(false);
    });
  }

  if (!record) return null;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {blocked ? "삭제할 수 없습니다" : `${meta.label} 삭제`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {blocked
              ? "하위/참조 데이터가 있어 삭제할 수 없습니다. 대신 사용여부를 꺼주세요."
              : `'${record.name}'을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {blocked ? (
            <>
              <AlertDialogCancel disabled={isPending}>닫기</AlertDialogCancel>
              <Button
                onClick={handleDeactivate}
                disabled={isPending || !record.isActive}
              >
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
