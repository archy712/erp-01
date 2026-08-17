import type { OrgLevel, OrgTreeNode } from "./types";

// 트리 노드 id는 그룹사/법인/부문/부서/팀 5개 테이블의 uuid를 섞어 쓰므로,
// 화면(선택 상태·URL 쿼리)에서는 레벨을 접두사로 붙인 문자열 키로만
// 다룬다(PRD_ORG.md 6.3.1 — Task 053). 관리 화면과 헤더 팝업(Task 054)이
// 이 포맷을 공유한다. 서버 전용 코드를 임포트하지 않는 순수 모듈이라
// Client Component에서도 그대로 import 가능하다.
export function buildOrgNodeKey(level: OrgLevel, id: string): string {
  return `${level}:${id}`;
}

export function parseOrgNodeKey(
  key: string,
): { level: OrgLevel; id: string } | null {
  const separatorIndex = key.indexOf(":");
  if (separatorIndex === -1) return null;
  const id = key.slice(separatorIndex + 1);
  if (!id) return null;
  return { level: key.slice(0, separatorIndex) as OrgLevel, id };
}

/** 트리를 `"level:id"` 키로 평탄화한다 — 선택된 키로 노드를 즉시 찾기 위함. */
export function flattenOrgTreeByKey(
  nodes: OrgTreeNode[],
  map: Map<string, OrgTreeNode> = new Map(),
): Map<string, OrgTreeNode> {
  for (const node of nodes) {
    map.set(buildOrgNodeKey(node.level, node.id), node);
    if (node.children.length > 0) flattenOrgTreeByKey(node.children, map);
  }
  return map;
}
