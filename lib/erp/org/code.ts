// PRD_ORG.md 6.1절 표를 그대로 옮긴 접두사/자릿수 메타. organizations(부문)/
// departments(팀)는 code 컬럼이 원래 없고 이번에도 추가하지 않으므로
// (PRD_ORG.md 6.1절) 이 파일은 신규 2개 테이블(그룹사/부서)만 다룬다.
// 법인 코드는 Master 도메인의 `C####`(lib/erp/master/code.ts)가 유일하다 —
// PRD_ORG_COMPANY_MERGE.md로 org_companies(`OC####`)를 폐기하면서 이 파일의
// orgCompany 스펙도 함께 제거했다.
export type OrgCodeEntity = "orgGroup" | "orgSection";

export type OrgCodeSpec = {
  prefix: string;
  digits: number;
};

export const ORG_CODE_SPECS: Record<OrgCodeEntity, OrgCodeSpec> = {
  orgGroup: { prefix: "GRP", digits: 4 },
  orgSection: { prefix: "OS", digits: 4 },
};

// public.next_master_code(p_entity)는 snake_case 인자를 받는다 — 위 camelCase
// 엔티티 키와는 별개 문자열이다(lib/erp/master/actions.ts의 DB_CODE_ENTITY와
// 동일한 관례). org 도메인은 이 매핑을 code.ts에 두어 Task 050의 데이터
// 액세스 계층과 Task 044 시점의 타입 작업이 같은 상수를 공유하게 한다.
export const ORG_CODE_DB_ENTITY: Record<OrgCodeEntity, string> = {
  orgGroup: "org_group",
  orgSection: "org_section",
};

/** 관리자가 코드를 직접 수정할 때의 클라이언트 1차 검증용. 서버 측 unique 제약이 최종 검증이다. */
export function isValidOrgCode(entity: OrgCodeEntity, code: string): boolean {
  const spec = ORG_CODE_SPECS[entity];
  return new RegExp(`^${spec.prefix}\\d{${spec.digits}}$`).test(code);
}
