import type { OrgLevel } from "./types";

// PRD_ORG.md 3.1절 권한표를 코드로 옮긴 3단계.
// - "superadmin": is_superadmin()만 허용(스코프 규칙이 없는 최상위 레벨).
// - "adminScoped": is_admin()이면서 current_organization_id() 스코프가
//   일치해야 허용(기존 departments_update_admin 정책과 동일한 규칙).
// - "none": 이번 범위에서 해당 동작 자체가 없음(예: 부문/팀 노드 자체 CRUD).
export type OrgEditableBy = "superadmin" | "adminScoped" | "none";

export type OrgLevelMeta = {
  level: OrgLevel;
  label: string;
  // 리더 지정 폼에서 제안되는 기본 직책명(자유 입력, Task 043 ⑤ 확정값).
  // 구성원(member)은 리더 개념이 없어 null.
  defaultLeaderTitle: string | null;
  // 이 레벨 노드 자체(등록/수정/삭제)를 편집할 수 있는 권한. 부문/팀은
  // 기존 테이블 자체의 CRUD를 이번 범위에서 제공하지 않아 "none"이다
  // (PRD_ORG.md 2장 — organizations/departments 자체 CRUD 제외).
  editableBy: OrgEditableBy;
  // 이 레벨 노드의 리더(org_unit_leaders)를 지정/해제할 수 있는 권한.
  // 노드 CRUD 권한과 값이 다를 수 있어(부문은 CRUD 없이도 리더 지정은 가능)
  // 별도 필드로 둔다.
  leaderEditableBy: OrgEditableBy;
  // true면 이 레벨의 노드가 0건이어도 정상 상태다(PRD_ORG.md 5.4절 —
  // 부서는 팀 단위로 선택적인 레벨). 다른 레벨은 이 플래그를 두지 않는다.
  isOptional?: true;
};

export const ORG_LEVELS: Record<OrgLevel, OrgLevelMeta> = {
  group: {
    level: "group",
    label: "그룹사",
    defaultLeaderTitle: "회장님",
    editableBy: "superadmin",
    leaderEditableBy: "superadmin",
  },
  company: {
    level: "company",
    label: "법인",
    defaultLeaderTitle: "대표이사",
    editableBy: "superadmin",
    leaderEditableBy: "superadmin",
  },
  division: {
    level: "division",
    label: "부문",
    defaultLeaderTitle: "부문장",
    editableBy: "none",
    leaderEditableBy: "superadmin",
  },
  section: {
    level: "section",
    label: "부서",
    defaultLeaderTitle: "부서장",
    editableBy: "adminScoped",
    leaderEditableBy: "adminScoped",
    isOptional: true,
  },
  team: {
    level: "team",
    label: "팀",
    defaultLeaderTitle: "팀장",
    editableBy: "none",
    leaderEditableBy: "adminScoped",
  },
  member: {
    level: "member",
    label: "구성원",
    defaultLeaderTitle: null,
    editableBy: "none",
    leaderEditableBy: "none",
  },
};
