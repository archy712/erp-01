"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import {
  getCurrentErpUser,
  requireAdmin,
  requireSuperadmin,
} from "@/lib/erp/auth";
import type { ActionResult } from "@/lib/erp/actions";
import type { Database } from "@/lib/supabase/database.types";
import type { ErpUser } from "@/lib/erp/types";
import { ORG_CODE_DB_ENTITY } from "./code";
import {
  getOrgChartMembers,
  getOrgLeaders,
  getOrgTree,
  getUnassignedCompanies,
  getUnmappedDivisions,
  getUnmappedTeamsInDivision,
  type UnassignedCompany,
  type UnmappedDivision,
  type UnmappedTeam,
} from "./queries";
import type { OrgLeader, OrgLevel, OrgMember, OrgTreeNode } from "./types";

// 조직도 관리 화면(Task 053) 전용 Server Action 규약.
//
// 편집 액션은 전부 첫 줄에서 requireAdmin() 또는 requireSuperadmin()을
// 호출한다(app/erp/admin/layout.tsx의 라우트 가드와 별개의 액션 레벨 이중
// 방어, lib/erp/actions.ts의 기존 규약을 그대로 계승). 그룹사/법인 CRUD와
// 부문·법인·그룹사 리더 지정은 superadmin 전용, 부서 CRUD와 부서·팀 리더
// 지정은 admin(부문 스코프)까지 허용한다(PRD_ORG.md 3.1절).

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;
type TableName = keyof Database["public"]["Tables"];
type PostgrestErrorLike = { code?: string; message: string };

// Supabase 생성 타입은 update()/insert()에 정확한 컬럼 집합만 허용하는
// RejectExcessProperties를 강제해, "부분 필드만 채운 Record<string, unknown>"이나
// "레벨에 따라 컬럼명이 바뀌는 동적 키" 같은 이 파일의 패턴과 근본적으로 맞지
// 않는다(lib/erp/master/actions.ts의 LooseMasterTable과 동일한 이유). 컬럼
// 매핑의 정확성은 각 함수가 스스로 보장하므로, DB 왕복 지점만 이 느슨한
// 타입으로 캐스팅한다.
type LooseTable = {
  insert: (
    row: Record<string, unknown>,
  ) => Promise<{ error: PostgrestErrorLike | null }>;
  update: (row: Record<string, unknown>) => {
    eq: (
      column: string,
      value: string,
    ) => Promise<{ error: PostgrestErrorLike | null }>;
  };
};

function looseTable(
  supabase: SupabaseServerClient,
  table: TableName,
): LooseTable {
  return supabase.from(table) as unknown as LooseTable;
}

/**
 * admin(비superadmin)이 다른 부문 데이터를 건드리지 못하도록 앱 레벨에서
 * 1차 확인한다(최종 판정은 RLS). superadmin은 항상 통과.
 */
async function assertDivisionScope(
  supabase: SupabaseServerClient,
  user: ErpUser,
  organizationId: string,
): Promise<string | null> {
  if (user.role === "superadmin") return null;

  const { data: currentOrganizationId, error } = await supabase.rpc(
    "current_organization_id",
  );
  if (error) throw error;

  if (currentOrganizationId !== organizationId) {
    return "권한이 없습니다.";
  }
  return null;
}

// --- 그룹사 ---

/** 그룹사는 싱글턴이라 등록/삭제 액션을 두지 않는다 — 이름/비고/사용여부 수정만 제공(PRD_ORG.md 6.2절). */
export async function updateOrgGroupAction(
  id: string,
  input: { name?: string; note?: string | null; isActive?: boolean },
): Promise<ActionResult> {
  await requireSuperadmin();

  const row: Record<string, unknown> = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      return { success: false, message: "이름을 입력해 주세요." };
    }
    row.name = name;
  }
  if (input.note !== undefined) row.note = input.note;
  if (input.isActive !== undefined) row.is_active = input.isActive;

  const supabase = await createClient();
  const { error } = await looseTable(supabase, "org_groups")
    .update(row)
    .eq("id", id);
  if (error) {
    return { success: false, message: "수정에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true };
}

// --- 법인 ↔ 그룹사 배정 ---
//
// 법인(companies) 자체의 등록/수정/삭제는 이 파일에 없다 — Master 도메인
// (lib/erp/master/actions.ts의 createMasterAction("company", …) 등)이
// 유일한 창구다(PRD_ORG_COMPANY_MERGE.md 3장). 조직도는 "이미 있는 법인을
// 그룹사에 배정"만 담당한다 — 부문(organizations)을 법인에 매핑할 때와
// 완전히 같은 패턴을 그룹사↔법인에 적용한 것이다.

/**
 * 법인을 그룹사에 배정(또는 재배정)한다. company_id가 org_group_companies에서
 * 완전한 unique 제약이라 upsert(onConflict: "company_id")로 "법인은 그룹사
 * 1곳에만 소속" 제약을 그대로 활용한다(setDivisionCompanyAction과 동일 패턴).
 */
export async function setCompanyGroupAction(
  companyId: string,
  orgGroupId: string,
): Promise<ActionResult> {
  await requireSuperadmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("org_group_companies")
    .upsert(
      { company_id: companyId, org_group_id: orgGroupId },
      { onConflict: "company_id" },
    );

  if (error) {
    return { success: false, message: "그룹사 배정에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true };
}

/**
 * 그룹사 배정을 해제한다. 하위에 매핑된 부문이 있으면(org_company_divisions)
 * 해제 시 그 부문 전체가 트리에서 사라지므로, 앱 레벨에서 먼저 막고 안내한다
 * (DB는 FK restrict가 아니라 매핑 테이블 자체가 별개라 이 가드가 없으면 조용히
 * 성공해버린다).
 */
export async function clearCompanyGroupAction(
  companyId: string,
): Promise<ActionResult> {
  await requireSuperadmin();

  const supabase = await createClient();

  const { count, error: countError } = await supabase
    .from("org_company_divisions")
    .select("organization_id", { count: "exact", head: true })
    .eq("company_id", companyId);
  if (countError) {
    return { success: false, message: "부문 연결 확인에 실패했습니다." };
  }
  if (count && count > 0) {
    return {
      success: false,
      message: `이 법인에 연결된 부문 ${count}개가 있어 그룹사 배정을 해제할 수 없습니다.`,
    };
  }

  const { error } = await supabase
    .from("org_group_companies")
    .delete()
    .eq("company_id", companyId);

  if (error) {
    return { success: false, message: "그룹사 배정 해제에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true };
}

/** 그룹사 배정 다이얼로그의 후보 목록(getUnassignedCompanies() 래퍼, getUnmappedDivisionsAction과 동일 패턴). */
export async function getCompaniesForOrgAction(): Promise<UnassignedCompany[]> {
  return getUnassignedCompanies();
}

/** 같은 그룹사(싱글턴이라 사실상 전체) 안에서 법인끼리 정렬순서를 한 칸 바꾼다. */
export async function moveOrgGroupCompanyAction(
  companyId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  await requireSuperadmin();

  const supabase = await createClient();

  const { data: target, error: targetError } = await supabase
    .from("org_group_companies")
    .select("id, sort_order, org_group_id")
    .eq("company_id", companyId)
    .maybeSingle();
  if (targetError || !target) {
    return { success: false, message: "대상을 찾을 수 없습니다." };
  }

  const { data: siblings, error: siblingsError } = await supabase
    .from("org_group_companies")
    .select("id, sort_order")
    .eq("org_group_id", target.org_group_id)
    .order("sort_order", { ascending: true });
  if (siblingsError || !siblings) {
    return { success: false, message: "형제 항목 조회에 실패했습니다." };
  }

  const index = siblings.findIndex((sibling) => sibling.id === target.id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) {
    return { success: false, message: "더 이상 이동할 수 없습니다." };
  }

  const current = siblings[index];
  const swapTarget = siblings[swapIndex];

  const [{ error: currentError }, { error: swapError }] = await Promise.all([
    supabase
      .from("org_group_companies")
      .update({ sort_order: swapTarget.sort_order })
      .eq("id", current.id),
    supabase
      .from("org_group_companies")
      .update({ sort_order: current.sort_order })
      .eq("id", swapTarget.id),
  ]);
  if (currentError || swapError) {
    return { success: false, message: "정렬순서 변경에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true };
}

// --- 법인 ↔ 부문 매핑 ---

/**
 * 부문을 법인에 연결(또는 재연결)한다. organization_id가 org_company_divisions에서
 * 유일해 upsert(onConflict: "organization_id")로 "부문당 1곳만 소속" 제약을
 * 그대로 활용한다(부분 unique 인덱스가 아니라 완전한 unique 제약이라 upsert가 안전하다).
 */
export async function setDivisionCompanyAction(
  organizationId: string,
  companyId: string,
): Promise<ActionResult> {
  await requireSuperadmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("org_company_divisions")
    .upsert(
      { organization_id: organizationId, company_id: companyId },
      { onConflict: "organization_id" },
    );

  if (error) {
    return { success: false, message: "법인 연결에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true };
}

// --- 부서 ---

export type OrgSectionInput = {
  organizationId: string;
  name: string;
  sortOrder?: number;
  isActive?: boolean;
  note?: string | null;
};

export async function createOrgSectionAction(
  input: OrgSectionInput,
): Promise<ActionResult & { code?: string }> {
  const user = await requireAdmin();

  const name = input.name.trim();
  if (!name) {
    return { success: false, message: "이름을 입력해 주세요." };
  }

  const supabase = await createClient();

  const scopeError = await assertDivisionScope(
    supabase,
    user,
    input.organizationId,
  );
  if (scopeError) {
    return { success: false, message: scopeError };
  }

  const { data: code, error: codeError } = await supabase.rpc(
    "next_master_code",
    { p_entity: ORG_CODE_DB_ENTITY.orgSection },
  );
  if (codeError || !code) {
    return { success: false, message: "코드 채번에 실패했습니다." };
  }

  const { error } = await supabase.from("org_sections").insert({
    code,
    name,
    organization_id: input.organizationId,
    sort_order: input.sortOrder ?? 0,
    is_active: input.isActive ?? true,
    note: input.note ?? null,
  });

  if (error) {
    if (error.code === "42501") {
      return { success: false, message: "권한이 없습니다." };
    }
    return { success: false, message: "등록에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true, code: code as string };
}

export async function updateOrgSectionAction(
  id: string,
  input: Partial<Omit<OrgSectionInput, "organizationId"> & { code: string }>,
): Promise<ActionResult> {
  const user = await requireAdmin();

  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("org_sections")
    .select("organization_id")
    .eq("id", id)
    .maybeSingle();
  if (existingError || !existing) {
    return { success: false, message: "대상을 찾을 수 없습니다." };
  }

  const scopeError = await assertDivisionScope(
    supabase,
    user,
    existing.organization_id,
  );
  if (scopeError) {
    return { success: false, message: scopeError };
  }

  const row: Record<string, unknown> = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (!name) {
      return { success: false, message: "이름을 입력해 주세요." };
    }
    row.name = name;
  }
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.isActive !== undefined) row.is_active = input.isActive;
  if (input.note !== undefined) row.note = input.note;
  if (input.code !== undefined) row.code = input.code;

  const { error } = await looseTable(supabase, "org_sections")
    .update(row)
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { success: false, message: "이미 사용 중인 코드입니다." };
    }
    return { success: false, message: "수정에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true };
}

/** org_sections 삭제 시 org_section_teams는 cascade로 함께 삭제된다(팀은 부문 직속으로 자연히 복귀). */
export async function deleteOrgSectionAction(
  id: string,
): Promise<ActionResult> {
  const user = await requireAdmin();

  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("org_sections")
    .select("organization_id")
    .eq("id", id)
    .maybeSingle();
  if (existingError || !existing) {
    return { success: false, message: "대상을 찾을 수 없습니다." };
  }

  const scopeError = await assertDivisionScope(
    supabase,
    user,
    existing.organization_id,
  );
  if (scopeError) {
    return { success: false, message: scopeError };
  }

  const { error } = await supabase.from("org_sections").delete().eq("id", id);
  if (error) {
    return { success: false, message: "삭제에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true };
}

// --- 부서 ↔ 팀 매핑 ---

/**
 * 팀을 부서에 배정(또는 다른 부서로 이관)한다. department_id가
 * org_section_teams에서 유일해 upsert(onConflict: "department_id")로
 * "팀은 부서 1곳에만 소속" 제약을 그대로 활용한다. 부서-팀의 소속 부문이
 * 다르면 DB 트리거(check_org_section_team_consistency, P0001)가 막는다.
 */
export async function assignTeamToSectionAction(
  departmentId: string,
  sectionId: string,
): Promise<ActionResult> {
  const user = await requireAdmin();

  const supabase = await createClient();

  const { data: section, error: sectionError } = await supabase
    .from("org_sections")
    .select("organization_id")
    .eq("id", sectionId)
    .maybeSingle();
  if (sectionError || !section) {
    return { success: false, message: "대상 부서를 찾을 수 없습니다." };
  }

  const scopeError = await assertDivisionScope(
    supabase,
    user,
    section.organization_id,
  );
  if (scopeError) {
    return { success: false, message: scopeError };
  }

  const { error } = await supabase
    .from("org_section_teams")
    .upsert(
      { department_id: departmentId, section_id: sectionId },
      { onConflict: "department_id" },
    );

  if (error) {
    if (error.code === "P0001") {
      return { success: false, message: error.message };
    }
    return { success: false, message: "부서 배정에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true };
}

/** 부서-팀 매핑을 삭제한다(=팀이 부문 직속으로 되돌아간다). departments 자체는 변경되지 않는다. */
export async function removeTeamFromSectionAction(
  departmentId: string,
): Promise<ActionResult> {
  const user = await requireAdmin();

  const supabase = await createClient();

  const { data: mapping, error: mappingError } = await supabase
    .from("org_section_teams")
    .select("id, org_sections(organization_id)")
    .eq("department_id", departmentId)
    .maybeSingle();
  const organizationId = mapping?.org_sections?.organization_id;
  if (mappingError || !mapping || !organizationId) {
    return { success: false, message: "부서 소속 정보를 찾을 수 없습니다." };
  }

  const scopeError = await assertDivisionScope(supabase, user, organizationId);
  if (scopeError) {
    return { success: false, message: scopeError };
  }

  const { error } = await supabase
    .from("org_section_teams")
    .delete()
    .eq("id", mapping.id);
  if (error) {
    return { success: false, message: "부서 소속 해제에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true };
}

// --- 리더(org_unit_leaders) ---
//
// 5개 partial unique index(org_unit_leaders_group_uk 등, WHERE 절 포함)는
// PostgREST의 upsert(onConflict: 컬럼명)가 매칭할 수 있는 "완전한" unique
// 제약이 아니다(ON CONFLICT 대상이 WHERE 절까지 일치해야 함) — 그래서 다른
// 매핑 액션과 달리 select 후 존재 여부로 분기하는 수동 upsert 패턴을 쓴다.

const LEADER_TARGET_COLUMN: Record<Exclude<OrgLevel, "member">, string> = {
  group: "org_group_id",
  company: "company_id",
  division: "organization_id",
  section: "org_section_id",
  team: "department_id",
};

async function findLeaderRowId(
  supabase: SupabaseServerClient,
  level: Exclude<OrgLevel, "member">,
  targetId: string,
): Promise<string | null> {
  const column = LEADER_TARGET_COLUMN[level];
  const { data, error } = await supabase
    .from("org_unit_leaders")
    .select("id")
    .eq(column, targetId)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}

export type SetOrgLeaderInput = {
  level: Exclude<OrgLevel, "member">;
  targetId: string;
  profileId: string;
  title: string;
};

/**
 * 리더를 지정(이미 있으면 교체)한다. team/section은 requireAdmin() 후
 * DB RLS가 스코프(current_organization_id() 일치)까지 최종 판정하므로
 * 여기서는 앱 레벨 스코프 재확인을 하지 않는다. 그 외 3개 레벨은
 * superadmin 전용(PRD_ORG.md 3.1절).
 */
export async function setOrgLeaderAction(
  input: SetOrgLeaderInput,
): Promise<ActionResult> {
  if (input.level === "team" || input.level === "section") {
    await requireAdmin();
  } else {
    await requireSuperadmin();
  }

  const title = input.title.trim();
  if (!title) {
    return { success: false, message: "직책명을 입력해 주세요." };
  }

  const supabase = await createClient();
  const column = LEADER_TARGET_COLUMN[input.level];
  const existingId = await findLeaderRowId(
    supabase,
    input.level,
    input.targetId,
  );

  const { error } = existingId
    ? await supabase
        .from("org_unit_leaders")
        .update({ profile_id: input.profileId, title })
        .eq("id", existingId)
    : await looseTable(supabase, "org_unit_leaders").insert({
        [column]: input.targetId,
        profile_id: input.profileId,
        title,
      });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        message: "해당 조직에는 이미 리더가 지정되어 있습니다.",
      };
    }
    if (error.code === "42501") {
      return { success: false, message: "권한이 없습니다." };
    }
    return { success: false, message: "리더 지정에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true };
}

export async function clearOrgLeaderAction(input: {
  level: Exclude<OrgLevel, "member">;
  targetId: string;
}): Promise<ActionResult> {
  if (input.level === "team" || input.level === "section") {
    await requireAdmin();
  } else {
    await requireSuperadmin();
  }

  const supabase = await createClient();
  const column = LEADER_TARGET_COLUMN[input.level];
  const { error } = await supabase
    .from("org_unit_leaders")
    .delete()
    .eq(column, input.targetId);

  if (error) {
    if (error.code === "42501") {
      return { success: false, message: "권한이 없습니다." };
    }
    return { success: false, message: "리더 해제에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true };
}

// --- 헤더 팝업(Task 054) 전용 읽기 전용 액션 ---

export type OrgChartPopupData = {
  tree: OrgTreeNode[];
  leaders: OrgLeader[];
  members: OrgMember[];
};

/**
 * 헤더 팝업 전용 읽기 전용 액션. role 가드를 두지 않는다 — RLS/RPC가 이미
 * 로그인 사용자 전체를 허용하므로 인증 여부 외 추가 체크가 불필요하다
 * (PRD_ORG.md 8.4절). 조회만 하므로 revalidatePath도 호출하지 않는다.
 */
export async function getOrgChartPopupDataAction(): Promise<OrgChartPopupData> {
  await getCurrentErpUser();

  const [{ tree }, members] = await Promise.all([
    getOrgTree(),
    getOrgChartMembers(),
  ]);
  const leaders = await getOrgLeaders(members);

  return { tree, leaders: Array.from(leaders.values()), members };
}

// --- 그룹사/법인 편집 다이얼로그(Task 055) 전용 읽기 액션 ---
//
// org_groups/org_companies의 SELECT RLS는 로그인 사용자 전체를 허용한다
// (PRD_ORG.md 4.4절 — Master 도메인과 분리된 신규 테이블이라 role 스코프
// 규칙이 없다). 이름/사용여부/정렬순서는 이미 getOrgTree()의 OrgTreeNode가
// 담고 있어 화면 쪽에서 다시 조회할 필요가 없고, 여기서는 그 안에 없는
// code/note, 그리고 매핑 다이얼로그의 선택지(전체 법인 목록·미매핑 부문
// 목록)만 얇게 조회한다. 편집 버튼 자체는 superadmin에게만 보이므로
// (OrgGroupCompanyActions) 여기서는 getCurrentErpUser()로 인증만 재확인한다.

export type OrgGroupDetail = {
  id: string;
  code: string;
  name: string;
  note: string | null;
  isActive: boolean;
};

/** 그룹사 수정 다이얼로그가 필요로 하는 code/note까지 포함한 상세 조회(싱글턴이라 인자 없음). */
export async function getOrgGroupDetailAction(): Promise<OrgGroupDetail | null> {
  await getCurrentErpUser();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("org_groups")
    .select("id, code, name, note, is_active")
    .maybeSingle();
  if (error || !data) return null;

  return {
    id: data.id,
    code: data.code,
    name: data.name,
    note: data.note,
    isActive: data.is_active,
  };
}

export type OrgCompanyDetail = {
  id: string;
  code: string;
  name: string;
  note: string | null;
  isActive: boolean;
  sortOrder: number;
  orgGroupId: string;
  orgGroupName: string;
};

/**
 * 법인 노드 패널이 읽기 전용으로 표시할 code/note(+상위 그룹사명)까지 포함한
 * 상세 조회. 법인 자체는 companies(Master 도메인) 소유이므로 code/note/is_active는
 * 거기서, 그룹사 소속은 org_group_companies에서 각각 가져와 합친다. 이 법인이
 * 아직 어떤 그룹사에도 배정되지 않았으면 null을 반환한다(그룹사 노드가 없는
 * 법인은 이 화면에 진입할 방법이 없으므로 정상적으로 발생하지 않는다).
 */
export async function getOrgCompanyDetailAction(
  id: string,
): Promise<OrgCompanyDetail | null> {
  await getCurrentErpUser();

  const supabase = await createClient();

  const [
    { data: company, error: companyError },
    { data: mapping, error: mappingError },
  ] = await Promise.all([
    supabase
      .from("companies")
      .select("id, code, name, note, is_active")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("org_group_companies")
      .select("sort_order, org_group_id, org_groups(name)")
      .eq("company_id", id)
      .maybeSingle(),
  ]);
  if (companyError || !company || mappingError || !mapping) return null;

  return {
    id: company.id,
    code: company.code,
    name: company.name,
    note: company.note,
    isActive: company.is_active,
    sortOrder: mapping.sort_order,
    orgGroupId: mapping.org_group_id,
    orgGroupName: mapping.org_groups?.name ?? "",
  };
}

export type OrgCompanyOption = {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
};

/** 부문↔법인 매핑 다이얼로그의 "소속 법인" 선택지용 전체 법인 목록(그룹사에 배정된 법인만). */
export async function getOrgCompaniesAction(): Promise<OrgCompanyOption[]> {
  await getCurrentErpUser();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("org_group_companies")
    .select("sort_order, companies(id, name, code, is_active)")
    .order("sort_order", { ascending: true });
  if (error || !data) return [];

  return data
    .map((row) => row.companies)
    .filter((company): company is NonNullable<typeof company> => !!company)
    .map((company) => ({
      id: company.id,
      name: company.name,
      code: company.code,
      isActive: company.is_active,
    }));
}

/**
 * getUnmappedDivisions()(lib/erp/org/queries.ts, 서버 컴포넌트 전용 조회 함수)를
 * 클라이언트 다이얼로그에서 직접 호출할 수 있도록 감싼 얇은 래퍼. 조회 전용이라
 * role 가드를 두지 않는다(원 함수와 동일한 관례, PRD_ORG.md 8.4절 getOrgChartPopupDataAction과 동일).
 */
export async function getUnmappedDivisionsAction(): Promise<
  UnmappedDivision[]
> {
  return getUnmappedDivisions();
}

// --- 부서 등록/수정/삭제 다이얼로그, 팀 소속 관리 다이얼로그(Task 056) 전용 ---
//
// 아래 3개 조회 액션은 다이얼로그를 열기 직전에 최신 데이터를 가져오는
// 용도라 requireAdmin()만 확인한다. 부문 스코프 위반 여부는 실제 변경을
// 일으키는 액션(createOrgSectionAction 등)이 항상 assertDivisionScope()로
// 최종 방어하므로, 읽기 전용 조회 시점에는 재확인하지 않는다(RLS도 이중 방어선).

export async function getUnmappedTeamsInDivisionAction(
  organizationId: string,
): Promise<UnmappedTeam[]> {
  await requireAdmin();
  return getUnmappedTeamsInDivision(organizationId);
}

export type OrgSectionDetail = {
  id: string;
  code: string;
  note: string | null;
  organizationId: string;
};

/** 부서 수정 다이얼로그가 열리기 전에 code/note/organizationId를 채운다(OrgTreeNode에는 없는 필드). */
export async function getOrgSectionDetailAction(
  id: string,
): Promise<OrgSectionDetail | null> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("org_sections")
    .select("id, code, note, organization_id")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;

  return {
    id: data.id,
    code: data.code,
    note: data.note,
    organizationId: data.organization_id,
  };
}

export type SectionMappedTeam = { departmentId: string; name: string };

/**
 * 부서에 매핑된 팀 목록(이름 포함)을 반환한다. 부서 삭제 확인 다이얼로그의
 * "소속 팀 N개가 부문 직속으로 바뀝니다" 안내와 팀 소속 관리 다이얼로그의
 * "배정된 팀" 목록이 이 액션 하나를 공유한다.
 */
export async function getSectionTeamsAction(
  sectionId: string,
): Promise<SectionMappedTeam[]> {
  await requireAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("org_section_teams")
    .select("department_id, departments(name)")
    .eq("section_id", sectionId);
  if (error || !data) return [];

  return data
    .map((row) => ({
      departmentId: row.department_id,
      name: row.departments?.name ?? "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

/** 같은 부문 안에서 부서끼리 정렬순서를 한 칸 바꾼다(moveOrgCompanyAction과 동일 패턴). */
export async function moveOrgSectionAction(
  id: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const user = await requireAdmin();

  const supabase = await createClient();

  const { data: target, error: targetError } = await supabase
    .from("org_sections")
    .select("id, sort_order, organization_id")
    .eq("id", id)
    .maybeSingle();
  if (targetError || !target) {
    return { success: false, message: "대상을 찾을 수 없습니다." };
  }

  const scopeError = await assertDivisionScope(
    supabase,
    user,
    target.organization_id,
  );
  if (scopeError) {
    return { success: false, message: scopeError };
  }

  const { data: siblings, error: siblingsError } = await supabase
    .from("org_sections")
    .select("id, sort_order")
    .eq("organization_id", target.organization_id)
    .order("sort_order", { ascending: true });
  if (siblingsError || !siblings) {
    return { success: false, message: "형제 항목 조회에 실패했습니다." };
  }

  const index = siblings.findIndex((sibling) => sibling.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapIndex < 0 || swapIndex >= siblings.length) {
    return { success: false, message: "더 이상 이동할 수 없습니다." };
  }

  const current = siblings[index];
  const swapTarget = siblings[swapIndex];

  const [{ error: currentError }, { error: swapError }] = await Promise.all([
    supabase
      .from("org_sections")
      .update({ sort_order: swapTarget.sort_order })
      .eq("id", current.id),
    supabase
      .from("org_sections")
      .update({ sort_order: current.sort_order })
      .eq("id", swapTarget.id),
  ]);
  if (currentError || swapError) {
    return { success: false, message: "정렬순서 변경에 실패했습니다." };
  }

  revalidatePath("/erp/admin/org");
  return { success: true };
}
