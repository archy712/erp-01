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
