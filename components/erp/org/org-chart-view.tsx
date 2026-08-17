"use client";

import { Building2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useMemo, useState } from "react";

import { PageHeader } from "@/components/erp/page-header";
import { MasterDetailLayout } from "@/components/erp/master/master-detail-layout";
import {
  MasterTreePanel,
  type MasterTreeNode,
} from "@/components/erp/master/master-tree-panel";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty";
import { ORG_LEVELS } from "@/lib/erp/org/levels";
import {
  buildOrgNodeKey,
  findOrgNodePath,
  flattenOrgTreeByKey,
} from "@/lib/erp/org/node-key";
import type { OrgLeader, OrgMember, OrgTreeNode } from "@/lib/erp/org/types";
import type { UserRole } from "@/lib/erp/types";
import { OrgChildrenPanel } from "./org-children-panel";
import { OrgGroupCompanyActions } from "./org-group-company-actions";
import { OrgLeaderPanel } from "./org-leader-panel";
import { OrgSectionActions } from "./org-section-actions";

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
  currentUserRole,
  currentUserOrganizationId,
}: {
  breadcrumb?: string[];
  tree: OrgTreeNode[];
  leaders: OrgLeader[];
  members: OrgMember[];
  /** 편집 버튼 노출 판정용(Task 055~057). 최종 차단은 항상 Server Action + RLS. */
  currentUserRole: UserRole;
  /** DB current_organization_id() 그대로 — 관리자 본인 소속 팀의 부문 id, 없으면 null. */
  currentUserOrganizationId: string | null;
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

  // 그룹사(트리 루트)가 없으면(Task 046 이전 상태) 트리 자체를 렌더링할
  // 것이 없다 — 빈 상태 안내만 보여준다.
  const rootKey = tree[0] ? buildOrgNodeKey(tree[0].level, tree[0].id) : null;

  // 딥링크(?node=team:<uuid>)로 들어왔을 때만 그 값을 쓰고, 없거나 트리에
  // 없는 값이면 그룹사 노드를 기본 선택한다(초기 진입 시 법인까지 펼친
  // 상태로 시작한다는 요구사항 — TreeView는 initialSelectedItemId로 선택된
  // 노드까지의 경로를 자동으로 펼친다).
  const requestedKey = searchParams.get("node");
  const selectedKey =
    requestedKey && nodesByKey.has(requestedKey) ? requestedKey : rootKey;

  // 선택 노드의 루트→자신 경로. "이 팀/부서가 어느 부문 소속인가"가 필요한
  // Task 056(부서 CRUD 스코프 판정, 팀의 소속 부서 표시)/057(리더 지정 스코프
  // 판정)이 `selectedPath.find((n) => n.level === "division")` 형태로 쓴다.
  const selectedPath = useMemo(
    () => (selectedKey ? findOrgNodePath(tree, selectedKey) : []),
    [tree, selectedKey],
  );

  function handleSelect(key: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("node", key);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setMobileTreeOpen(false);
  }

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

  const selectedNode = selectedKey
    ? (nodesByKey.get(selectedKey) ?? null)
    : null;
  if (!selectedNode || !selectedKey) return null;

  const leader = leaderByKey.get(selectedKey) ?? null;
  // 선택 노드 자신이 부문이면 자기 자신의 id, 부서/팀이면 그 상위 부문의
  // id, 그룹사/법인이면 null(부문 조상이 없음) — Task 056/057이 그대로 쓴다.
  const ancestorDivisionId =
    selectedPath.find((node) => node.level === "division")?.id ?? null;

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
              {/* 조상 경로(그룹사→...→선택 노드 바로 위)를 클릭 가능한
                  브레드크럼으로 보여준다 — 선택 노드 자신의 이름은 아래 h2가
                  이미 표시하므로 여기서는 중복하지 않고, 대신 마지막 세그먼트로
                  현재 레벨 라벨("부문" 등)을 붙여 기존에 있던 정보를 그대로
                  유지한다. */}
              <Breadcrumb>
                <BreadcrumbList className="gap-1 text-xs sm:gap-1">
                  {selectedPath.slice(0, -1).map((node) => {
                    const key = buildOrgNodeKey(node.level, node.id);
                    return (
                      <Fragment key={key}>
                        <BreadcrumbItem>
                          <BreadcrumbLink asChild>
                            <button
                              type="button"
                              onClick={() => handleSelect(key)}
                            >
                              {node.name}
                            </button>
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator className="[&>svg]:size-3" />
                      </Fragment>
                    );
                  })}
                  <BreadcrumbItem>
                    <span className="truncate">
                      {ORG_LEVELS[selectedNode.level].label}
                    </span>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium">{selectedNode.name}</h2>
                {!selectedNode.isActive ? (
                  <Badge variant="outline">비활성</Badge>
                ) : null}
              </div>
            </div>

            <OrgGroupCompanyActions
              node={selectedNode}
              currentUserRole={currentUserRole}
            />

            <OrgLeaderPanel
              node={selectedNode}
              leader={leader}
              members={members}
              currentUserRole={currentUserRole}
              currentUserOrganizationId={currentUserOrganizationId}
              ancestorDivisionId={ancestorDivisionId}
            />

            <OrgSectionActions
              node={selectedNode}
              currentUserRole={currentUserRole}
              currentUserOrganizationId={currentUserOrganizationId}
              ancestorDivisionId={ancestorDivisionId}
              selectedPath={selectedPath}
            />

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
