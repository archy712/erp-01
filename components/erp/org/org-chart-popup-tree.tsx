"use client";

import { useMemo, useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TreeView, type TreeDataItem } from "@/components/ui/tree-view";
import { getAvatarEmoji } from "@/lib/erp/avatar-options";
import { ORG_LEVELS } from "@/lib/erp/org/levels";
import { buildOrgNodeKey, flattenOrgTreeByKey } from "@/lib/erp/org/node-key";
import type { OrgLeader, OrgMember, OrgTreeNode } from "@/lib/erp/org/types";
import { OrgMemberList } from "./org-member-list";

function toTreeItems(nodes: OrgTreeNode[]): TreeDataItem[] {
  return nodes.map((node) => {
    const hasChildren = node.children.length > 0;
    return {
      id: buildOrgNodeKey(node.level, node.id),
      name: node.name,
      // TreeItem은 `children` 키의 존재 여부(빈 배열도 truthy)로 그룹/리프를
      // 가르므로, 자식이 없으면 반드시 undefined를 넘겨야 한다
      // (components/erp/master/master-tree-panel.tsx와 동일 규약).
      children: hasChildren ? toTreeItems(node.children) : undefined,
    };
  });
}

// 관리 화면(org-chart-view.tsx + org-leader-panel.tsx + org-children-panel.tsx)의
// 트리/패널을 재사용하지 않고 조회 전용으로 단순하게 새로 만든다 — 편집 슬롯을
// 조건부로 숨기는 방식보다 이쪽이 더 단순하다는 게 이 팝업의 설계 원칙이다
// (Task 054). 등록/수정/삭제/리더 지정 버튼은 이 파일 어디에도 없다.
export function OrgChartPopupTree({
  tree,
  leaders,
  members,
}: {
  tree: OrgTreeNode[];
  leaders: OrgLeader[];
  members: OrgMember[];
}) {
  const nodesByKey = useMemo(() => flattenOrgTreeByKey(tree), [tree]);
  const leaderByKey = useMemo(() => {
    const map = new Map<string, OrgLeader>();
    for (const leader of leaders) {
      map.set(buildOrgNodeKey(leader.level, leader.targetId), leader);
    }
    return map;
  }, [leaders]);
  const treeItems = useMemo(() => toTreeItems(tree), [tree]);

  const rootKey = tree[0] ? buildOrgNodeKey(tree[0].level, tree[0].id) : null;
  // 이 컴포넌트는 팝업이 열려 데이터가 준비된 뒤에만 마운트되므로(부모의
  // org-chart-popup.tsx 참고), 마운트 시점 값으로 useState를 바로 초기화해도
  // "다시 열 때마다 새 데이터로 리셋"이 자연히 보장된다 — useEffect가 필요 없다.
  const [selectedKey, setSelectedKey] = useState<string | null>(rootKey);

  const selectedNode = selectedKey
    ? (nodesByKey.get(selectedKey) ?? null)
    : null;
  const leader = selectedKey ? (leaderByKey.get(selectedKey) ?? null) : null;

  return (
    <div className="grid max-h-[70vh] grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="overflow-y-auto rounded-lg border">
        <TreeView
          data={treeItems}
          initialSelectedItemId={rootKey ?? undefined}
          onSelectChange={(item) => setSelectedKey(item?.id ?? null)}
          aria-label="조직도"
          renderItem={({ item }) => {
            const node = nodesByKey.get(item.id);
            return (
              <div className="flex flex-1 items-center gap-2 overflow-hidden">
                <span className="truncate text-sm">{item.name}</span>
                {node && !node.isActive ? (
                  <Badge variant="outline" className="shrink-0 text-[10px]">
                    비활성
                  </Badge>
                ) : null}
              </div>
            );
          }}
        />
      </div>

      <div className="overflow-y-auto rounded-lg border p-4">
        {selectedNode ? (
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {ORG_LEVELS[selectedNode.level].label}
              </p>
              <h3 className="text-base font-medium">{selectedNode.name}</h3>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
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
                  <p className="text-xs text-muted-foreground">
                    {leader.title}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  리더가 지정되지 않았습니다.
                </p>
              )}
            </div>

            {selectedNode.level === "team" ? (
              <OrgMemberList
                members={members.filter(
                  (member) => member.departmentId === selectedNode.id,
                )}
              />
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            좌측에서 조직을 선택하세요.
          </p>
        )}
      </div>
    </div>
  );
}
