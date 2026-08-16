// PRD_MASTER.md 6.1절 표를 그대로 옮긴 접두사/자릿수 메타.
export type MasterCodeEntity =
  | "company"
  | "brand"
  | "smallBrand"
  | "brandLine"
  | "itemType"
  | "item"
  | "subItem"
  | "brandColorType"
  | "brandColor"
  | "brandGenderSizeType"
  | "brandGenderSize"
  | "product";

export type MasterCodeSpec = {
  prefix: string;
  digits: number;
};

// 성별(GE, 4자리)은 gender.ts의 GENDERS 3건으로 고정되어 채번 대상이 아니므로 여기 포함하지 않는다.
export const CODE_SPECS: Record<MasterCodeEntity, MasterCodeSpec> = {
  company: { prefix: "C", digits: 4 },
  brand: { prefix: "B", digits: 4 },
  smallBrand: { prefix: "SB", digits: 4 },
  brandLine: { prefix: "BL", digits: 4 },
  itemType: { prefix: "LC", digits: 4 },
  item: { prefix: "MC", digits: 4 },
  subItem: { prefix: "SC", digits: 4 },
  brandColorType: { prefix: "BCT", digits: 4 },
  brandColor: { prefix: "BC", digits: 7 },
  brandGenderSizeType: { prefix: "BGST", digits: 4 },
  brandGenderSize: { prefix: "BGS", digits: 4 },
  product: { prefix: "PM", digits: 9 },
};

/** 관리자가 코드를 직접 수정할 때의 클라이언트 1차 검증용. 서버 측 unique 제약이 최종 검증이다. */
export function isValidCode(entity: MasterCodeEntity, code: string): boolean {
  const spec = CODE_SPECS[entity];
  return new RegExp(`^${spec.prefix}\\d{${spec.digits}}$`).test(code);
}
