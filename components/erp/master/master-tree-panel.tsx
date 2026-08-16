"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { TreeView, type TreeDataItem } from "@/components/ui/tree-view";

export type MasterTreeNode = {
  id: string;
  name: string;
  isActive: boolean;
  children?: MasterTreeNode[];
};

type MasterTreePanelProps = {
  nodes: MasterTreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  ariaLabel?: string;
};

function flattenById(
  nodes: MasterTreeNode[],
  map: Map<string, MasterTreeNode>,
): Map<string, MasterTreeNode> {
  for (const node of nodes) {
    map.set(node.id, node);
    if (node.children) flattenById(node.children, map);
  }
  return map;
}

function nodeMatches(node: MasterTreeNode, query: string): boolean {
  return node.name.toLowerCase().includes(query);
}

// 검색어와 일치하는 노드는 하위를 그대로 유지해 계속 탐색할 수 있게 하고,
// 일치하지 않는 조상은 일치하는 자손이 있을 때만(그 자손까지만 필터링해)
// 남겨 트리의 위치 맥락을 잃지 않게 한다.
function filterTree(nodes: MasterTreeNode[], query: string): MasterTreeNode[] {
  if (!query) return nodes;
  const result: MasterTreeNode[] = [];
  for (const node of nodes) {
    if (nodeMatches(node, query)) {
      result.push(node);
      continue;
    }
    if (node.children && node.children.length > 0) {
      const filteredChildren = filterTree(node.children, query);
      if (filteredChildren.length > 0) {
        result.push({ ...node, children: filteredChildren });
      }
    }
  }
  return result;
}

function toTreeItems(
  nodes: MasterTreeNode[],
  onSelect: (id: string) => void,
): TreeDataItem[] {
  return nodes.map((node) => {
    const hasChildren = !!node.children && node.children.length > 0;
    return {
      id: node.id,
      name: node.name,
      onClick: () => onSelect(node.id),
      // TreeItem은 `children` 키의 존재 여부(빈 배열도 truthy)로 그룹/리프를
      // 가르므로, 자식이 없으면 반드시 undefined를 넘겨 리프로 렌더링되게 한다.
      children: hasChildren
        ? toTreeItems(node.children as MasterTreeNode[], onSelect)
        : undefined,
    };
  });
}

// components/ui/tree-view.tsx의 그룹 노드는 Radix Accordion(<button>) 기반이라
// 그 안에 버튼/체크박스 등 인터랙티브 요소를 중첩하면 무효 HTML + hydration
// 에러가 난다(ROADMAP_MVP Task 017에서 실제 발생한 회귀). 이 트리는 renderItem
// 안에 텍스트와 뱃지만 렌더링해 선택 기능만 담당하게 한다.
//
// 선택 상태(selectedId)는 이 컴포넌트가 URL과 직접 동기화하지 않는다 — 화면마다
// 쿼리 키 이름이 다르므로(?companyId=, ?brandId= 등) 그 책임은 이 컴포넌트를
// 조합하는 화면(예: company-manager.tsx)에 맡기고, 이 컴포넌트는 selectedId/
// onSelect만 받는 순수 컨트롤드 컴포넌트로 유지해 5개 화면에서 그대로 재사용한다.
//
// 클릭으로 선택할 때는 TreeView 내부 상태와 이 selectedId prop이 같은 클릭
// 핸들러 체인 안에서 함께 갱신되어 항상 일치한다. 다만 트리를 통하지 않고
// selectedId가 바뀌는 경우(예: 브라우저 뒤로가기로 인한 소프트 내비게이션)는
// TreeView가 마운트 시점에만 initialSelectedItemId를 반영하므로 하이라이트가
// 즉시 갱신되지 않을 수 있다 — 이는 "트리 자체는 리렌더/리마운트되지 않는다"는
// 요구사항과 상충되므로(리마운트를 강제하면 접힘 상태가 초기화된다) 의도적으로
// 감수한 트레이드오프다. 새로고침/딥링크(하드 진입)에서는 마운트 시점 값이라
// 정상 동작한다.
export function MasterTreePanel({
  nodes,
  selectedId,
  onSelect,
  searchPlaceholder = "이름으로 검색",
  emptyMessage = "등록된 항목이 없습니다.",
  ariaLabel = "마스터 트리",
}: MasterTreePanelProps) {
  const [search, setSearch] = useState("");

  const byId = useMemo(() => flattenById(nodes, new Map()), [nodes]);

  const query = search.trim().toLowerCase();
  const filteredNodes = useMemo(() => filterTree(nodes, query), [nodes, query]);

  const items = useMemo(
    () => toTreeItems(filteredNodes, onSelect),
    [filteredNodes, onSelect],
  );

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={searchPlaceholder}
          className="pl-8"
          aria-label={searchPlaceholder}
        />
      </div>

      {nodes.length === 0 ? (
        <Empty className="flex-1 border-0 p-4">
          <EmptyHeader>
            <EmptyDescription>{emptyMessage}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : items.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">
          검색 결과가 없습니다.
        </p>
      ) : (
        <TreeView
          // components/ui/tree-view.tsx의 TreeNode는 펼침 상태(value)를
          // `useState(expandedItemIds.includes(item.id) ? [item.id] : [])`로
          // "마운트 시 1회"만 초기화하고 이후 expandedItemIds prop 변화를
          // 반영하는 동기화 로직이 없다(제어 컴포넌트가 아님). 그래서 검색어를
          // 입력해도 이미 접힌 채로 마운트돼 있던 조상 노드는 그대로 접힌
          // 채로 남는다 — search 값으로 key를 줘서 검색어가 바뀔 때마다 트리
          // 전체를 리마운트시켜, 새로 계산된 expandedItemIds(조상 자동 확장)가
          // 각 노드의 초기 상태에 반영되게 한다.
          key={query}
          data={items}
          expandAll={query.length > 0}
          initialSelectedItemId={selectedId ?? undefined}
          aria-label={ariaLabel}
          renderItem={({ item }) => {
            const node = byId.get(item.id);
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
      )}
    </div>
  );
}
