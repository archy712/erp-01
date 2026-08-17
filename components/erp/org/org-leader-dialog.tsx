"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
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
import { setOrgLeaderAction } from "@/lib/erp/org/actions";
import { ROLE_BADGE_VARIANT } from "@/lib/erp/role-labels";
import type {
  OrgLeader,
  OrgLevel,
  OrgMember,
  OrgTreeNode,
} from "@/lib/erp/org/types";
import type { UserRole } from "@/lib/erp/types";
import { cn } from "@/lib/utils";

// 조직도 관리 화면은 다국어(dict) 대상이 아니라 한국어 고정이므로(CLAUDE.md
// 컨벤션), lib/erp/role-labels.ts의 getRoleLabel(dict) 대신 여기서만 쓰는
// 한국어 라벨을 직접 둔다.
const ROLE_LABEL_KO: Record<UserRole, string> = {
  user: "일반 사용자",
  admin: "관리자",
  superadmin: "최고 관리자",
};

/**
 * 팀 리더 지정 시엔 그 팀 소속 구성원을, 부서 리더 지정 시엔 그 부서에 배정된
 * 팀들(선택된 부서 노드의 children이 곧 그 팀들이다 — tree.ts의 buildSectionNode
 * 참고)의 소속 구성원을 "같은 조직"으로 우선 노출한다(Task 057). 그 외 레벨은
 * 우선 노출 기준이 없어 빈 집합을 반환한다.
 */
function getPriorityDepartmentIds(node: OrgTreeNode): Set<string> {
  if (node.level === "team") return new Set([node.id]);
  if (node.level === "section") {
    return new Set(node.children.map((child) => child.id));
  }
  return new Set();
}

function sortMembersByPriority(
  members: OrgMember[],
  priorityDepartmentIds: Set<string>,
): OrgMember[] {
  return members
    .filter((member) => member.isActive)
    .slice()
    .sort((a, b) => {
      const aPriority = a.departmentId
        ? priorityDepartmentIds.has(a.departmentId)
        : false;
      const bPriority = b.departmentId
        ? priorityDepartmentIds.has(b.departmentId)
        : false;
      if (aPriority !== bPriority) return aPriority ? -1 : 1;
      return (a.name ?? "").localeCompare(b.name ?? "", "ko");
    });
}

type OrgLeaderDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  node: OrgTreeNode;
  leader: OrgLeader | null;
  members: OrgMember[];
  defaultTitle: string;
};

// Dialog는 Radix Presence로 닫힘 애니메이션을 관리하므로 항상 마운트해두고,
// 실제 폼 필드(useState 보유)만 open일 때만 렌더링한다 — 열릴 때마다 이
// 컴포넌트가 새로 마운트되며 현재 props 기준으로 초기값이 계산되므로
// useEffect + setState 없이 "열릴 때마다 초기값 재계산"이 해결된다
// (components/erp/master/master-form-sheet.tsx와 동일 패턴).
export function OrgLeaderDialog({
  open,
  onOpenChange,
  node,
  leader,
  members,
  defaultTitle,
}: OrgLeaderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{leader ? "리더 변경" : "리더 지정"}</DialogTitle>
          <DialogDescription>
            {node.name}의 리더로 지정할 구성원과 직책명을 입력하세요.
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <OrgLeaderDialogFields
            node={node}
            leader={leader}
            members={members}
            defaultTitle={defaultTitle}
            onOpenChange={onOpenChange}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function OrgLeaderDialogFields({
  node,
  leader,
  members,
  defaultTitle,
  onOpenChange,
}: Omit<OrgLeaderDialogProps, "open">) {
  const priorityDepartmentIds = getPriorityDepartmentIds(node);
  const sortedMembers = sortMembersByPriority(members, priorityDepartmentIds);
  const initialMember =
    (leader && members.find((member) => member.id === leader.profileId)) ??
    null;

  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(
    initialMember,
  );
  const [title, setTitle] = useState(leader?.title ?? defaultTitle);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit() {
    if (!selectedMember) {
      setMemberError("리더로 지정할 구성원을 선택해 주세요.");
      return;
    }
    setMemberError(null);

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError("직책명을 입력해 주세요.");
      return;
    }
    setTitleError(null);

    startTransition(async () => {
      const result = await setOrgLeaderAction({
        level: node.level as Exclude<OrgLevel, "member">,
        targetId: node.id,
        profileId: selectedMember.id,
        title: trimmedTitle,
      });

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(leader ? "리더를 변경했습니다." : "리더를 지정했습니다.");
      onOpenChange(false);
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 py-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-leader-member">구성원</Label>
          <Command
            id="org-leader-member"
            className="rounded-md border"
            defaultValue={initialMember?.id}
            aria-invalid={memberError ? true : undefined}
          >
            <CommandInput placeholder="이름으로 검색" />
            <CommandList>
              <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
              <CommandGroup>
                {sortedMembers.map((member) => {
                  const isSelected = selectedMember?.id === member.id;
                  return (
                    <CommandItem
                      key={member.id}
                      value={member.id}
                      keywords={[member.name ?? "이름 없음"]}
                      onSelect={() => {
                        setSelectedMember(member);
                        if (memberError) setMemberError(null);
                      }}
                      className={cn(
                        isSelected && "bg-accent text-accent-foreground",
                      )}
                    >
                      <Check
                        className={cn(
                          "size-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <div className="flex min-w-0 flex-col">
                        <span className="flex items-center gap-1.5 truncate">
                          {member.name ?? "이름 없음"}
                          <Badge
                            variant={ROLE_BADGE_VARIANT[member.role]}
                            className="text-[10px]"
                          >
                            {ROLE_LABEL_KO[member.role]}
                          </Badge>
                          {member.departmentId &&
                          priorityDepartmentIds.has(member.departmentId) ? (
                            <Badge variant="outline" className="text-[10px]">
                              같은 조직
                            </Badge>
                          ) : null}
                        </span>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
          {memberError ? (
            <p className="text-sm text-destructive">{memberError}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-leader-title">직책명</Label>
          <Input
            id="org-leader-title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (titleError) setTitleError(null);
            }}
            aria-invalid={titleError ? true : undefined}
          />
          {titleError ? (
            <p className="text-sm text-destructive">{titleError}</p>
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
        <Button type="button" onClick={handleSubmit} disabled={isPending}>
          저장
        </Button>
      </DialogFooter>
    </>
  );
}
