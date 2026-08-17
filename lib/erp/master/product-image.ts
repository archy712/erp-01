// 상품 이미지 업로드(Task 040, PRD 7.6.2)의 제약값. 클라이언트 1차 검증
// (product-image-uploader.tsx)과 서버 최종 검증(app/api/products/[productId]/image/route.ts)이
// 같은 값을 참조해야 검증 기준이 어긋나지 않으므로 이 파일 하나로 공유한다.
// 서버 전용 모듈을 import하지 않는 순수 상수라 양쪽에서 그대로 쓸 수 있다.

export const PRODUCT_IMAGE_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type ProductImageAllowedType =
  (typeof PRODUCT_IMAGE_ALLOWED_TYPES)[number];

export const PRODUCT_IMAGE_EXTENSION_BY_TYPE: Record<
  ProductImageAllowedType,
  string
> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isProductImageAllowedType(
  type: string,
): type is ProductImageAllowedType {
  return (PRODUCT_IMAGE_ALLOWED_TYPES as readonly string[]).includes(type);
}

export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_MIN_DIMENSION = 300;

export const PRODUCT_IMAGE_TYPE_ERROR =
  "jpg/jpeg/png/webp 형식의 이미지만 업로드할 수 있습니다.";
export const PRODUCT_IMAGE_SIZE_ERROR = "이미지 용량은 5MB를 넘을 수 없습니다.";
export const PRODUCT_IMAGE_DIMENSION_ERROR = `이미지 해상도는 최소 ${PRODUCT_IMAGE_MIN_DIMENSION}x${PRODUCT_IMAGE_MIN_DIMENSION} 이상이어야 합니다.`;
