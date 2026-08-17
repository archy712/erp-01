import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";
import type { UserRole } from "../types";
import { buildOrgTree } from "./tree";
import type { OrgLeader, OrgLevel, OrgMember, OrgTreeNode } from "./types";

// 이 파일의 모든 함수는 cookies()를 쓰는 createClient()에 의존하므로,
// 호출하는 컴포넌트는 반드시 <Suspense> 경계 안에 있어야 한다
// (lib/erp/queries.ts / lib/erp/master/queries.ts와 동일 관례).
//
// 관리 화면(Task 053)과 헤더 팝업(Task 054) 둘 다 이 조회 함수들만
// 호출한다 — 각자 조인을 새로 짜지 않는다(PRD_ORG.md 6.3.2절).

export type OrgTreeResult = {
  tree: OrgTreeNode[];
  // org_company_divisions에 아직 연결되지 않은 organizations 수. 0보다 크면
  // 그 부문(과 하위 팀/구성원 전부)이 트리에서 누락된다는 뜻이라 개발 중
  // 콘솔 경고로만 알리고 화면은 그대로 렌더링한다(Task 046 적용 후에는 0이어야 함).
  orphanDivisionCount: number;
  // org_group_companies에 아직 연결되지 않은 companies 수. 기준정보 관리에서
  // 법인만 만들고 그룹사 배정을 아직 안 한 정상적인 중간 상태이므로 화면은
  // 그대로 렌더링하고 콘솔 경고만 남긴다(PRD_ORG_COMPANY_MERGE.md — orphanDivisionCount와
  // 동일한 패턴, 이번 통합으로 새로 생기는 고아 유형).
  unassignedCompanyCount: number;
};

/**
 * 그룹사(싱글턴) → 법인 → 부문 → 부서(선택) → 팀까지 가변 깊이 트리를
 * 조립한다. 구성원은 포함하지 않는다(PRD_ORG.md 6.3절 — getOrgChartMembers() 참고).
 */
export async function getOrgTree(): Promise<OrgTreeResult> {
  const supabase = await createClient();

  const [
    { data: group, error: groupError },
    { data: groupCompanies, error: groupCompaniesError },
    { data: companyRows, error: companyRowsError },
    { data: divisions, error: divisionsError },
    { data: organizations, error: organizationsError },
    { data: sections, error: sectionsError },
    { data: sectionTeams, error: sectionTeamsError },
    { data: departments, error: departmentsError },
  ] = await Promise.all([
    supabase.from("org_groups").select("id, name, is_active").maybeSingle(),
    supabase
      .from("org_group_companies")
      .select("org_group_id, company_id, sort_order"),
    supabase.from("companies").select("id, name, is_active"),
    supabase
      .from("org_company_divisions")
      .select("organization_id, company_id, sort_order"),
    supabase.from("organizations").select("id, name, archived_at"),
    supabase
      .from("org_sections")
      .select("id, organization_id, name, is_active, sort_order"),
    supabase
      .from("org_section_teams")
      .select("section_id, department_id, sort_order"),
    supabase
      .from("departments")
      .select("id, name, organization_id, archived_at"),
  ]);

  if (groupError) throw groupError;
  if (groupCompaniesError) throw groupCompaniesError;
  if (companyRowsError) throw companyRowsError;
  if (divisionsError) throw divisionsError;
  if (organizationsError) throw organizationsError;
  if (sectionsError) throw sectionsError;
  if (sectionTeamsError) throw sectionTeamsError;
  if (departmentsError) throw departmentsError;

  const mappedOrganizationIds = new Set(
    divisions.map((division) => division.organization_id),
  );
  const orphanDivisionCount = organizations.filter(
    (organization) => !mappedOrganizationIds.has(organization.id),
  ).length;
  if (orphanDivisionCount > 0) {
    console.warn(
      `[org] ${orphanDivisionCount}개 부문이 어떤 법인에도 연결되지 않아 조직도 트리에서 누락됩니다.`,
    );
  }

  const assignedCompanyIds = new Set(
    groupCompanies.map((row) => row.company_id),
  );
  const unassignedCompanyCount = companyRows.filter(
    (company) => !assignedCompanyIds.has(company.id),
  ).length;
  if (unassignedCompanyCount > 0) {
    console.warn(
      `[org] ${unassignedCompanyCount}개 법인이 어떤 그룹사에도 배정되지 않아 조직도 트리에서 누락됩니다.`,
    );
  }

  const companyById = new Map(
    companyRows.map((company) => [company.id, company]),
  );
  const companies = groupCompanies
    .map((row) => {
      const company = companyById.get(row.company_id);
      if (!company) return null;
      return {
        id: company.id,
        orgGroupId: row.org_group_id,
        name: company.name,
        isActive: company.is_active,
        sortOrder: row.sort_order,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const tree = buildOrgTree({
    group: group
      ? { id: group.id, name: group.name, isActive: group.is_active }
      : null,
    companies,
    divisions: divisions.map((division) => ({
      organizationId: division.organization_id,
      companyId: division.company_id,
      sortOrder: division.sort_order,
    })),
    organizations: organizations.map((organization) => ({
      id: organization.id,
      name: organization.name,
      isActive: organization.archived_at === null,
    })),
    sections: sections.map((section) => ({
      id: section.id,
      organizationId: section.organization_id,
      name: section.name,
      isActive: section.is_active,
      sortOrder: section.sort_order,
    })),
    sectionTeams: sectionTeams.map((row) => ({
      sectionId: row.section_id,
      departmentId: row.department_id,
      sortOrder: row.sort_order,
    })),
    departments: departments.map((department) => ({
      id: department.id,
      organizationId: department.organization_id,
      name: department.name,
      isActive: department.archived_at === null,
    })),
  });

  return { tree, orphanDivisionCount, unassignedCompanyCount };
}

/** org_unit_leaders 1행에서 값이 채워진 FK 하나를 골라 레벨/대상 id로 정규화한다(CHECK로 정확히 1개만 보장됨). */
function resolveLeaderTarget(
  row: Tables<"org_unit_leaders">,
): { level: OrgLevel; targetId: string } | null {
  if (row.org_group_id) return { level: "group", targetId: row.org_group_id };
  if (row.company_id) return { level: "company", targetId: row.company_id };
  if (row.organization_id)
    return { level: "division", targetId: row.organization_id };
  if (row.org_section_id)
    return { level: "section", targetId: row.org_section_id };
  if (row.department_id) return { level: "team", targetId: row.department_id };
  return null;
}

/**
 * org_unit_leaders를 한 번에 조회해 `Map<"level:targetId", OrgLeader>`로 반환한다.
 * 리더 이름/아바타는 `profiles`를 직접 조인하지 않고 이미 조회해 둔
 * `members`(getOrgChartMembers() 결과)와 앱에서 매칭한다 — 일반 사용자
 * 세션에서는 profiles 조인이 RLS에 막혀 이름이 null이 되므로, 호출부가
 * 이미 가진 members 배열을 파라미터로 받아 중복 RPC 호출도 피한다.
 */
export async function getOrgLeaders(
  members: OrgMember[],
): Promise<Map<string, OrgLeader>> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("org_unit_leaders").select("*");
  if (error) throw error;

  const memberById = new Map(members.map((member) => [member.id, member]));
  const leaders = new Map<string, OrgLeader>();

  for (const row of data) {
    const target = resolveLeaderTarget(row);
    if (!target) continue;

    const member = memberById.get(row.profile_id);
    leaders.set(`${target.level}:${target.targetId}`, {
      id: row.id,
      level: target.level,
      targetId: target.targetId,
      profileId: row.profile_id,
      profileName: member?.name ?? null,
      avatarKey: member?.avatarKey ?? "fox",
      title: row.title,
    });
  }

  return leaders;
}

/** public.get_org_chart_members() RPC 결과를 앱 타입으로 매핑한다(profiles RLS를 우회하는 유일한 경로). */
export async function getOrgChartMembers(): Promise<OrgMember[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_org_chart_members");
  if (error) throw error;

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    departmentId: row.department_id,
    avatarKey: row.avatar_key,
    role: row.role as UserRole,
    isActive: row.is_active,
  }));
}

/** 이미 조회한 members 배열을 팀 id로 필터링한다(RPC를 팀별로 반복 호출하지 않는다). */
export function getMembersByDepartment(
  members: OrgMember[],
  departmentId: string,
): OrgMember[] {
  return members.filter((member) => member.departmentId === departmentId);
}

export type UnmappedDivision = { id: string; name: string; isActive: boolean };

/** org_company_divisions에 아직 연결되지 않은 부문 목록(Task 055의 법인↔부문 매핑 관리 UI용). */
export async function getUnmappedDivisions(): Promise<UnmappedDivision[]> {
  const supabase = await createClient();

  const [
    { data: organizations, error: organizationsError },
    { data: divisions, error: divisionsError },
  ] = await Promise.all([
    supabase.from("organizations").select("id, name, archived_at"),
    supabase.from("org_company_divisions").select("organization_id"),
  ]);
  if (organizationsError) throw organizationsError;
  if (divisionsError) throw divisionsError;

  const mappedIds = new Set(
    divisions.map((division) => division.organization_id),
  );

  return organizations
    .filter((organization) => !mappedIds.has(organization.id))
    .map((organization) => ({
      id: organization.id,
      name: organization.name,
      isActive: organization.archived_at === null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export type UnassignedCompany = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};

/**
 * org_group_companies에 아직 연결되지 않은 법인(companies) 목록
 * (그룹사 배정 다이얼로그의 후보 목록용). 법인은 Master 도메인(companies)
 * 소유이므로 lib/erp/master/**의 getCompanies()를 재사용하지 않고 이
 * 파일에서 직접 조회한다 — Master 쪽 조회는 select("*") + Master 정렬
 * 규칙이라 조직도가 필요로 하는 "그룹사 미배정 여부" 필터와 어긋난다.
 */
export async function getUnassignedCompanies(): Promise<UnassignedCompany[]> {
  const supabase = await createClient();

  const [
    { data: companies, error: companiesError },
    { data: groupCompanies, error: groupCompaniesError },
  ] = await Promise.all([
    supabase.from("companies").select("id, code, name, is_active"),
    supabase.from("org_group_companies").select("company_id"),
  ]);
  if (companiesError) throw companiesError;
  if (groupCompaniesError) throw groupCompaniesError;

  const assignedIds = new Set(groupCompanies.map((row) => row.company_id));

  return companies
    .filter((company) => !assignedIds.has(company.id))
    .map((company) => ({
      id: company.id,
      code: company.code,
      name: company.name,
      isActive: company.is_active,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

export type UnmappedTeam = { id: string; name: string; isActive: boolean };

/** 특정 부문 안에서 아직 어떤 부서에도 매핑되지 않은 팀 목록(Task 056의 부서-팀 소속 관리 UI용). */
export async function getUnmappedTeamsInDivision(
  organizationId: string,
): Promise<UnmappedTeam[]> {
  const supabase = await createClient();

  const { data: departments, error: departmentsError } = await supabase
    .from("departments")
    .select("id, name, archived_at")
    .eq("organization_id", organizationId);
  if (departmentsError) throw departmentsError;
  if (departments.length === 0) return [];

  const { data: sectionTeams, error: sectionTeamsError } = await supabase
    .from("org_section_teams")
    .select("department_id")
    .in(
      "department_id",
      departments.map((department) => department.id),
    );
  if (sectionTeamsError) throw sectionTeamsError;

  const mappedIds = new Set(sectionTeams.map((row) => row.department_id));

  return departments
    .filter((department) => !mappedIds.has(department.id))
    .map((department) => ({
      id: department.id,
      name: department.name,
      isActive: department.archived_at === null,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}
