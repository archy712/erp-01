// 성별은 DB 테이블이 아니라 앱 상수 3종으로 취급한다 (PRD_MASTER.md 7.5절 — CRUD 화면 없음).
export type GenderValue = "male" | "female" | "unisex";

export type Gender = {
  code: string;
  value: GenderValue;
  label: string;
};

export const GENDERS: readonly Gender[] = [
  { code: "GE1001", value: "male", label: "남성" },
  { code: "GE1002", value: "female", label: "여성" },
  { code: "GE1003", value: "unisex", label: "혼용" },
];

export function getGenderLabel(value: GenderValue): string {
  return GENDERS.find((gender) => gender.value === value)!.label;
}

export function isGenderValue(value: string): value is GenderValue {
  return GENDERS.some((gender) => gender.value === value);
}
