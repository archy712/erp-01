import type { UserRole } from "../types";

// 그룹사(org_groups) → 법인(companies, Master 도메인 공유 — PRD_ORG_COMPANY_MERGE.md)
// → 부문(organizations, 기존 재해석) → 부서(org_sections, 신규·선택적) →
// 팀(departments, 기존) → 구성원(profiles, 기존) 6단계를 화면이 소비하는
// 단일 뷰로 통일한 레벨 키다(PRD_ORG.md 4.1절). "member"는 트리 노드로
// 펼치지 않고 팀 선택 시 우측 목록으로만 쓰이지만(PRD_ORG.md 6.3절),
// OrgMember 타입과 짝을 맞추기 위해 열거값에는 포함한다.
export type OrgLevel =
  "group" | "company" | "division" | "section" | "team" | "member";

// organizations(부문)/departments(팀)는 sort_order 컬럼이 없어, 조회 시
// 이름 정렬 결과의 인덱스를 그대로 sortOrder로 채운다(PRD_ORG.md 6.5절) —
// 트리 렌더링 쪽은 레벨 구분 없이 이 필드 하나로만 정렬하면 된다.
export type OrgTreeNode = {
  id: string;
  level: OrgLevel;
  name: string;
  isActive: boolean;
  sortOrder: number;
  children: OrgTreeNode[];
};

// org_unit_leaders 1행의 뷰 타입. targetId는 5개 FK 컬럼
// (org_group_id/company_id/organization_id/org_section_id/department_id)
// 중 값이 있는 컬럼 하나를 level에 맞게 꺼낸 것이다(PRD_ORG.md 5.6절).
export type OrgLeader = {
  id: string;
  level: OrgLevel;
  targetId: string;
  profileId: string;
  profileName: string | null;
  avatarKey: string;
  title: string;
};

// public.get_org_chart_members() RPC(PRD_ORG.md 3.2절)의 반환 컬럼과 1:1
// 대응한다. profiles 테이블을 직접 조회하지 않고 이 RPC만 거치므로, 여기
// 없는 컬럼(phone_number/bio/email 등)은 조직도 어디에서도 노출되지 않는다.
export type OrgMember = {
  id: string;
  name: string | null;
  departmentId: string | null;
  avatarKey: string;
  role: UserRole;
  isActive: boolean;
};
