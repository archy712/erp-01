import type { TreeDataItem } from "@/components/ui/tree-view";

import { getMenuIcon } from "./menu-icons";
import type { MenuFlat, MenuNode } from "./types";

function compareMenuNodes(a: MenuNode, b: MenuNode): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name, "ko");
}

function sortTreeRecursively(nodes: MenuNode[]): void {
  nodes.sort(compareMenuNodes);
  for (const node of nodes) {
    sortTreeRecursively(node.children);
  }
}

/**
 * 평면 메뉴 배열을 대/중/소분류 트리로 변환한다.
 * children이 없는 노드는 자연히 리프로 취급되므로, 하위 없이 등록된
 * 대분류(예: "경영정보")도 별도 처리 없이 리프 노드로 동작한다.
 */
export function buildMenuTree(rows: MenuFlat[]): MenuNode[] {
  const nodeById = new Map<string, MenuNode>();

  for (const row of rows) {
    nodeById.set(row.id, { ...row, children: [] });
  }

  const roots: MenuNode[] = [];

  for (const row of rows) {
    const node = nodeById.get(row.id)!;
    const parent = row.parentId ? nodeById.get(row.parentId) : undefined;

    if (parent) {
      parent.children.push(node);
    } else {
      // parentId가 없거나(대분류) 참조하는 부모가 데이터에 없는 경우
      // 메뉴가 트리에서 누락되지 않도록 루트로 취급한다.
      roots.push(node);
    }
  }

  sortTreeRecursively(roots);

  return roots;
}

/**
 * MenuNode 트리를 TreeView(components/ui/tree-view.tsx)가 요구하는
 * TreeDataItem 형태로 변환한다. 하위가 없는 노드(리프)는 클릭 시 바로 해당
 * 메뉴 화면으로 이동하고, 하위가 있는 노드는 TreeView가 자동으로 펼침
 * 가능한 그룹으로 렌더링한다(children 유무만으로 판단하므로 "중분류
 * 자체가 리프인 경우"도 별도 분기 없이 처리됨).
 */
export function menuNodeToTreeItem(
  node: MenuNode,
  topCategoryId: string,
  onSelectLeaf: (menuId: string, topCategoryId: string) => void,
): TreeDataItem {
  if (node.children.length === 0) {
    return {
      id: node.id,
      name: node.name,
      icon: getMenuIcon(node.name, false),
      onClick: () => onSelectLeaf(node.id, topCategoryId),
    };
  }

  return {
    id: node.id,
    name: node.name,
    icon: getMenuIcon(node.name, true),
    children: node.children.map((child) =>
      menuNodeToTreeItem(child, topCategoryId, onSelectLeaf),
    ),
  };
}

/**
 * 좌측 트리에서 활성(선택) 표시할 menuId를 판별한다.
 * pathname이 `/erp/menu/[menuId]`이면 그 menuId를 쓰고, 관리자 화면
 * (`/erp/admin/*`)처럼 menuId가 URL 경로에 없는 곳으로 리다이렉트된 경우에는
 * `?menu=` 쿼리(app/erp/menu/[menuId]/page.tsx가 관리자 라우트로 리다이렉트할
 * 때 함께 붙여준다)를 대신 사용한다.
 */
export function getActiveMenuId(
  pathname: string,
  searchParams?: URLSearchParams | null,
): string | undefined {
  const fromPath = pathname.match(/^\/erp\/menu\/([^/]+)/)?.[1];
  return fromPath ?? searchParams?.get("menu") ?? undefined;
}

/**
 * 루트부터 id로 지정한 노드까지의 경로(대분류 → ... → 자기 자신)를 반환한다.
 * 대상이 없으면 undefined. `lib/erp/queries.ts`의 동명 함수(`getMenuBreadcrumb`)는
 * 이것과 별개로 DB에서 직접 breadcrumb을 조회하는 서버 전용 버전이고, 이 함수는
 * 클라이언트에서 이미 받아온 트리(`MenuNode[]`)에 대해 동작하는 순수 함수다.
 */
export function getMenuBreadcrumb(
  nodes: MenuNode[],
  id: string,
): MenuNode[] | undefined {
  for (const node of nodes) {
    if (node.id === id) return [node];
    const childPath = getMenuBreadcrumb(node.children, id);
    if (childPath) return [node, ...childPath];
  }
  return undefined;
}
