import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { getAvatarEmoji } from "@/lib/erp/avatar-options";
import { ROLE_BADGE_VARIANT } from "@/lib/erp/role-labels";
import type { OrgMember } from "@/lib/erp/org/types";
import type { UserRole } from "@/lib/erp/types";

// 관리 화면 콘텐츠는 한국어 단일 값이 기존 관례라 dict를 받지 않고
// lib/i18n/dictionaries/ko.ts의 roles 값을 그대로 옮겨 쓴다.
const ROLE_LABEL_KO: Record<UserRole, string> = {
  user: "일반 사용자",
  admin: "관리자",
  superadmin: "최고 관리자",
};

// public.get_org_chart_members() RPC(6개 컬럼)만 소비한다 —
// phone_number/bio/email은 애초에 이 타입에 없어 표시할 수 없다
// (PRD_ORG.md 6.3절 / 3.2절).
export function OrgMemberList({ members }: { members: OrgMember[] }) {
  if (members.length === 0) {
    return (
      <Empty className="border-0 p-6">
        <EmptyHeader>
          <EmptyDescription>소속된 구성원이 없습니다.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center gap-3 rounded-lg border p-3"
        >
          <Avatar size="sm">
            <AvatarFallback>{getAvatarEmoji(member.avatarKey)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 truncate text-sm">
            {member.name ?? "이름 없음"}
          </span>
          <Badge variant={ROLE_BADGE_VARIANT[member.role]}>
            {ROLE_LABEL_KO[member.role]}
          </Badge>
          {!member.isActive ? (
            <Badge variant="outline" className="shrink-0 text-[10px]">
              비활성
            </Badge>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
