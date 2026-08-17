"use client";

import { Building2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { MasterDetailLayout } from "@/components/erp/master/master-detail-layout";
import {
  MasterTreePanel,
  type MasterTreeNode,
} from "@/components/erp/master/master-tree-panel";
import { Badge } from "@/components/ui/badge";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { ORG_LEVELS } from "@/lib/erp/org/levels";
import { buildOrgNodeKey, flattenOrgTreeByKey } from "@/lib/erp/org/node-key";
import type { OrgLeader, OrgMember, OrgTreeNode } from "@/lib/erp/org/types";
import { OrgChildrenPanel } from "./org-children-panel";
import { OrgLeaderPanel } from "./org-leader-panel";

function toMasterTreeNodes(nodes: OrgTreeNode[]): MasterTreeNode[] {
  return nodes.map((node) => ({
    id: buildOrgNodeKey(node.level, node.id),
    name: node.name,
    isActive: node.isActive,
    children:
      node.children.length > 0 ? toMasterTreeNodes(node.children) : undefined,
  }));
}

// 관리 화면(Task 053, /erp/admin/org) 셸. app/erp/admin/layout.tsx의
// requireAdmin() 가드를 상속받으므로 이 컴포넌트는 별도 권한 체크를 하지
// 않는다 — 이 Task는 조회만 다루고, 편집(등록/수정/삭제/소속 변경/리더
// 지정)은 Task 055~057에서 이 화면에 얹는다.
export function OrgChartView({
  breadcrumb,
  tree,
  leaders,
  members,
}: {
  breadcrumb?: string[];
  tree: OrgTreeNode[];
  leaders: OrgLeader[];
  members: OrgMember[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileTreeOpen, setMobileTreeOpen] = useState(false);

  const nodesByKey = useMemo(() => flattenOrgTreeByKey(tree), [tree]);
  const masterTreeNodes = useMemo(() => toMasterTreeNodes(tree), [tree]);
  const leaderByKey = useMemo(() => {
    const map = new Map<string, OrgLeader>();
    for (const leader of leaders) {
      map.set(buildOrgNodeKey(leader.level, leader.targetId), leader);
    }
    return map;
  }, [leaders]);

  function handleSelect(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("node", key);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setMobileTreeOpen(false);
  }

  // 그룹사(트리 루트)가 없으면(Task 046 이전 상태) 트리 자체를 렌더링할
  // 것이 없다 — 빈 상태 안내만 보여준다.
  const rootKey = tree[0] ? buildOrgNodeKey(tree[0].level, tree[0].id) : null;
  if (!rootKey) {
    return (
      <div className="flex flex-1 flex-col">
        <PageHeader breadcrumb={breadcrumb} title="조직도 관리" />
        <Empty className="flex-1 border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Building2 />
            </EmptyMedia>
            <EmptyDescription>
              등록된 그룹사 정보가 없습니다. 그룹사 데이터가 등록되면 조직도가
              표시됩니다.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  // 딥링크(?node=team:<uuid>)로 들어왔을 때만 그 값을 쓰고, 없거나 트리에
  // 없는 값이면 그룹사 노드를 기본 선택한다(초기 진입 시 법인까지 펼친
  // 상태로 시작한다는 요구사항 — TreeView는 initialSelectedItemId로 선택된
  // 노드까지의 경로를 자동으로 펼친다).
  const requestedKey = searchParams.get("node");
  const selectedKey =
    requestedKey && nodesByKey.has(requestedKey) ? requestedKey : rootKey;
  const selectedNode = nodesByKey.get(selectedKey) ?? null;
  if (!selectedNode) return null;

  const leader = leaderByKey.get(selectedKey) ?? null;

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader breadcrumb={breadcrumb} title="조직도 관리" />
      <MasterDetailLayout
        treeTitle="조직도"
        mobileTreeOpen={mobileTreeOpen}
        onMobileTreeOpenChange={setMobileTreeOpen}
        tree={
          <MasterTreePanel
            nodes={masterTreeNodes}
            selectedId={selectedKey}
            onSelect={handleSelect}
            searchPlaceholder="조직명 검색"
            emptyMessage="등록된 조직이 없습니다."
            ariaLabel="조직도 트리"
          />
        }
        content={
          <div className="flex flex-1 flex-col gap-6 p-4 sm:p-6">
            <div>
              <p className="text-xs text-muted-foreground">
                {ORG_LEVELS[selectedNode.level].label}
              </p>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium">{selectedNode.name}</h2>
                {!selectedNode.isActive ? (
                  <Badge variant="outline">비활성</Badge>
                ) : null}
              </div>
            </div>

            <OrgLeaderPanel level={selectedNode.level} leader={leader} />

            <OrgChildrenPanel
              node={selectedNode}
              leaderByKey={leaderByKey}
              members={members}
              onSelectChild={handleSelect}
            />
          </div>
        }
      />
    </div>
  );
}
