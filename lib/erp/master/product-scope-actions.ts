"use server";

import type { GenderValue } from "./gender";
import {
  getBrandColorTypes,
  getBrandColors,
  getBrandGenderSizeTypes,
  getBrandGenderSizes,
  getBrandLines,
  getBrands,
  getItemTypes,
  getItems,
  getSmallBrands,
  getSubItems,
} from "./queries";

// 상품 등록/수정 폼(Task 039)은 다른 5개 마스터 화면(Task 032~037)처럼 URL
// 쿼리 변경 → 서버 컴포넌트 재조회로 캐스케이드를 그리지 않는다 — 폼 자체가
// useState로 여러 필드를 한 번에 소유한 단일 페이지라, 필드 하나 바뀔 때마다
// 페이지 전체를 다시 내비게이션하면 나머지 입력값이 함께 날아간다. 대신 각
// 단계가 바뀔 때 이 Server Action들을 호출해 하위 옵션만 그때그때 가져온다.
//
// lib/erp/master/queries.ts의 조회 함수를 그대로 감싼 것뿐이며(로직 중복 없음),
// 전부 activeOnly: true로 고정한다 — 사용자가 여기서 어떤 값을 고르든 그것은
// 항상 "새로 선택"하는 행위이므로(신규 등록이든 수정 중 변경이든) PRD 6.3의
// "비활성 항목은 신규 등록에 노출하지 않는다" 규칙을 그대로 따른다. 반대로
// 수정 폼 진입 시 기존 값을 복원하는 초기 데이터는(비활성으로 바뀐 값이라도
// 화면에서 사라지면 안 되므로) app/erp/products/[productId]/page.tsx가 이
// 파일을 거치지 않고 activeOnly 없이 직접 조회한다.

export async function getBrandOptionsAction(companyId: string) {
  return getBrands(companyId, { activeOnly: true });
}

export async function getSmallBrandOptionsAction(brandId: string) {
  return getSmallBrands(brandId, { activeOnly: true });
}

export async function getItemTypeOptionsAction(smallBrandId: string) {
  return getItemTypes(smallBrandId, { activeOnly: true });
}

export async function getItemOptionsAction(itemTypeId: string) {
  return getItems(itemTypeId, { activeOnly: true });
}

export async function getSubItemOptionsAction(itemId: string) {
  return getSubItems(itemId, { activeOnly: true });
}

export async function getBrandLineOptionsAction(brandId: string) {
  return getBrandLines(brandId, { activeOnly: true });
}

export async function getBrandColorTypeOptionsAction(brandId: string) {
  return getBrandColorTypes(brandId, { activeOnly: true });
}

export async function getBrandColorOptionsAction(brandColorTypeId: string) {
  return getBrandColors(brandColorTypeId, { activeOnly: true });
}

export async function getBrandGenderSizeTypeOptionsAction(
  brandId: string,
  gender: GenderValue,
) {
  return getBrandGenderSizeTypes(brandId, gender, { activeOnly: true });
}

export async function getBrandGenderSizeOptionsAction(
  brandGenderSizeTypeId: string,
) {
  return getBrandGenderSizes(brandGenderSizeTypeId, { activeOnly: true });
}
