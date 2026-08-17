import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getAvatarEmoji } from "@/lib/erp/avatar-options";
import { ORG_LEVELS } from "@/lib/erp/org/levels";
import type { OrgLeader, OrgLevel } from "@/lib/erp/org/types";

// 선택된 노드의 리더(org_unit_leaders) 표시 전용. 지정/해제 버튼은
// Task 057에서 이 컴포넌트에 추가한다 — 이 Task(053)는 조회만 담당한다.
export function OrgLeaderPanel({
  level,
  leader,
}: {
  level: OrgLevel;
  leader: OrgLeader | null;
}) {
  const defaultTitle = ORG_LEVELS[level].defaultLeaderTitle;
  // member는 트리 노드로 펼치지 않으므로 이 컴포넌트가 실제로 이 레벨을
  // 받을 일은 없지만, 방어적으로 리더 개념이 없는 레벨은 렌더링하지 않는다.
  if (!defaultTitle) return null;

  return (
    <Card>
      <CardContent className="flex items-center gap-3">
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
            <p className="text-sm font-medium text-muted-foreground">미지정</p>
            <p className="text-xs text-muted-foreground">{defaultTitle}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
