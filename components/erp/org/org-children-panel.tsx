import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { buildOrgNodeKey } from "@/lib/erp/org/node-key";
import type { OrgLeader, OrgMember, OrgTreeNode } from "@/lib/erp/org/types";
import { OrgMemberList } from "./org-member-list";

/** 팀 카드는 소속 인원수, 그 외 카드는 직접 하위 개수를 부제로 보여준다. */
function childSubtitle(child: OrgTreeNode, members: OrgMember[]): string {
  if (child.level === "team") {
    const count = members.filter(
      (member) => member.departmentId === child.id,
    ).length;
    return `구성원 ${count}명`;
  }
  return `하위 ${child.children.length}개`;
}

// 그룹사/법인/부문/부서 노드면 하위 조직 카드 목록을, 팀 노드면
// get_org_chart_members() 결과로 만든 구성원 목록을 보여준다(PRD_ORG.md
// 6.3.1절). 카드를 클릭하면 그 자식 노드를 선택 상태로 옮겨(트리 탐색의
// 지름길) 우측 패널이 갱신되게 한다.
export function OrgChildrenPanel({
  node,
  leaderByKey,
  members,
  onSelectChild,
}: {
  node: OrgTreeNode;
  leaderByKey: Map<string, OrgLeader>;
  members: OrgMember[];
  onSelectChild: (key: string) => void;
}) {
  if (node.level === "team") {
    const teamMembers = members.filter(
      (member) => member.departmentId === node.id,
    );
    return <OrgMemberList members={teamMembers} />;
  }

  if (node.children.length === 0) {
    return (
      <Empty className="border-0 p-6">
        <EmptyHeader>
          <EmptyDescription>등록된 하위 조직이 없습니다.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {node.children.map((child) => {
        const key = buildOrgNodeKey(child.level, child.id);
        const leader = leaderByKey.get(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectChild(key)}
            className="flex flex-col gap-1 rounded-lg border p-3 text-left outline-hidden transition-colors hover:bg-accent/50 focus-visible:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center gap-1.5">
              <span className="truncate text-sm font-medium">{child.name}</span>
              {!child.isActive ? (
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  비활성
                </Badge>
              ) : null}
            </div>
            <span className="text-xs text-muted-foreground">
              {childSubtitle(child, members)}
            </span>
            <span className="text-xs text-muted-foreground">
              리더: {leader?.profileName ?? "미지정"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
