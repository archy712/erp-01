import type { OrgTreeNode } from "./types";

// getOrgTree()(queries.ts)가 6개 테이블(org_groups/org_companies/
// org_company_divisions/organizations/org_sections/org_section_teams/
// departments)에서 조회한 평면 행을 이 형태로 정규화해 넘긴다. 이 파일은
// DB를 전혀 모르는 순수 함수만 둔다(단위 테스트 용이성 — PRD_ORG.md 4.2절).
export type OrgTreeGroupRow = {
  id: string;
  name: string;
  isActive: boolean;
};

export type OrgTreeCompanyRow = {
  id: string;
  orgGroupId: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
};

// org_company_divisions 1행. 부문 자체의 이름/활성여부는 organizations에서
// 온다(이 행은 "법인 ↔ 부문" 연결과 정렬순서만 담당).
export type OrgTreeDivisionRow = {
  organizationId: string;
  orgCompanyId: string;
  sortOrder: number;
};

export type OrgTreeOrganizationRow = {
  id: string;
  name: string;
  isActive: boolean;
};

export type OrgTreeSectionRow = {
  id: string;
  organizationId: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
};

// org_section_teams 1행. "이 팀이 어느 부서 소속인가" 매핑만 담당하고,
// 팀 자체의 이름/활성여부는 departments에서 온다.
export type OrgTreeSectionTeamRow = {
  sectionId: string;
  departmentId: string;
  sortOrder: number;
};

export type OrgTreeDepartmentRow = {
  id: string;
  organizationId: string;
  name: string;
  isActive: boolean;
};

export type OrgTreeSource = {
  // 그룹사는 싱글턴이라 아직 없으면(마이그레이션 직후 등) null — 이 경우
  // buildOrgTree는 빈 트리를 반환한다.
  group: OrgTreeGroupRow | null;
  companies: OrgTreeCompanyRow[];
  divisions: OrgTreeDivisionRow[];
  organizations: OrgTreeOrganizationRow[];
  sections: OrgTreeSectionRow[];
  sectionTeams: OrgTreeSectionTeamRow[];
  departments: OrgTreeDepartmentRow[];
};

function groupBy<T, K>(rows: T[], key: (row: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const row of rows) {
    const k = key(row);
    const bucket = map.get(k);
    if (bucket) {
      bucket.push(row);
    } else {
      map.set(k, [row]);
    }
  }
  return map;
}

function compareByName(a: { name: string }, b: { name: string }): number {
  return a.name.localeCompare(b.name, "ko");
}

/**
 * 평면 행 배열을 그룹사(루트, 항상 1건 이하) → 법인 → 부문 → 부서(선택) →
 * 팀 순서의 가변 깊이 트리로 조립한다(PRD_ORG.md 4.2절). 구성원은 트리
 * 노드로 펼치지 않는다(PRD_ORG.md 6.3절 — getOrgTree()/getOrgChartMembers()가
 * 별도로 담당).
 *
 * 부문 노드의 자식 조립 규칙이 이 함수의 핵심이다: 그 부문 소속 부서 전부를
 * 자식으로 두고, 그 부문 소속 팀 중 org_section_teams에 매핑이 **없는**
 * 것만 부문의 직접 자식으로 추가한다. 매핑된 팀은 그 부서의 자식으로만
 * 나타나 부문에 중복 노출되지 않는다.
 */
export function buildOrgTree(source: OrgTreeSource): OrgTreeNode[] {
  if (!source.group) return [];

  const organizationsById = new Map(
    source.organizations.map((organization) => [organization.id, organization]),
  );
  const departmentsById = new Map(
    source.departments.map((department) => [department.id, department]),
  );
  const sectionIdByDepartmentId = new Map(
    source.sectionTeams.map((row) => [row.departmentId, row.sectionId]),
  );
  const sectionTeamsBySectionId = groupBy(
    source.sectionTeams,
    (row) => row.sectionId,
  );
  const sectionsByOrganizationId = groupBy(
    source.sections,
    (section) => section.organizationId,
  );
  const departmentsByOrganizationId = groupBy(
    source.departments,
    (department) => department.organizationId,
  );
  const divisionsByCompanyId = groupBy(
    source.divisions,
    (division) => division.orgCompanyId,
  );

  function buildTeamNode(
    department: OrgTreeDepartmentRow,
    sortIndex: number,
  ): OrgTreeNode {
    return {
      id: department.id,
      level: "team",
      name: department.name,
      isActive: department.isActive,
      sortOrder: sortIndex,
      children: [],
    };
  }

  function buildSectionNode(
    section: OrgTreeSectionRow,
    sortIndex: number,
  ): OrgTreeNode {
    const teamRows = (sectionTeamsBySectionId.get(section.id) ?? [])
      .slice()
      .sort((a, b) => {
        const orderDiff = a.sortOrder - b.sortOrder;
        if (orderDiff !== 0) return orderDiff;
        const nameA = departmentsById.get(a.departmentId)?.name ?? "";
        const nameB = departmentsById.get(b.departmentId)?.name ?? "";
        return nameA.localeCompare(nameB, "ko");
      });

    const children = teamRows
      .map((row) => departmentsById.get(row.departmentId))
      .filter((department): department is OrgTreeDepartmentRow => !!department)
      .map((department, index) => buildTeamNode(department, index));

    return {
      id: section.id,
      level: "section",
      name: section.name,
      isActive: section.isActive,
      sortOrder: sortIndex,
      children,
    };
  }

  function buildDivisionNode(
    division: OrgTreeDivisionRow,
    sortIndex: number,
  ): OrgTreeNode | null {
    const organization = organizationsById.get(division.organizationId);
    if (!organization) return null;

    const sectionRows = (sectionsByOrganizationId.get(organization.id) ?? [])
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder || compareByName(a, b));
    const sectionNodes = sectionRows.map((section, index) =>
      buildSectionNode(section, index),
    );

    const directTeamRows = (
      departmentsByOrganizationId.get(organization.id) ?? []
    )
      .filter((department) => !sectionIdByDepartmentId.has(department.id))
      .slice()
      .sort(compareByName);
    const directTeamNodes = directTeamRows.map((department, index) =>
      buildTeamNode(department, index),
    );

    return {
      id: organization.id,
      level: "division",
      name: organization.name,
      isActive: organization.isActive,
      sortOrder: sortIndex,
      children: [...sectionNodes, ...directTeamNodes],
    };
  }

  function buildCompanyNode(
    company: OrgTreeCompanyRow,
    sortIndex: number,
  ): OrgTreeNode {
    const divisionRows = (divisionsByCompanyId.get(company.id) ?? [])
      .slice()
      .sort((a, b) => {
        const orderDiff = a.sortOrder - b.sortOrder;
        if (orderDiff !== 0) return orderDiff;
        const nameA = organizationsById.get(a.organizationId)?.name ?? "";
        const nameB = organizationsById.get(b.organizationId)?.name ?? "";
        return nameA.localeCompare(nameB, "ko");
      });

    const children = divisionRows
      .map((division, index) => buildDivisionNode(division, index))
      .filter((node): node is OrgTreeNode => node !== null);

    return {
      id: company.id,
      level: "company",
      name: company.name,
      isActive: company.isActive,
      sortOrder: sortIndex,
      children,
    };
  }

  const companyRows = source.companies
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || compareByName(a, b));
  const companyNodes = companyRows.map((company, index) =>
    buildCompanyNode(company, index),
  );

  const groupNode: OrgTreeNode = {
    id: source.group.id,
    level: "group",
    name: source.group.name,
    isActive: source.group.isActive,
    sortOrder: 0,
    children: companyNodes,
  };

  return [groupNode];
}
