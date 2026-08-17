import { NextResponse } from "next/server";
import sharp from "sharp";

import { getCurrentErpUser } from "@/lib/erp/auth";
import {
  PRODUCT_IMAGE_DIMENSION_ERROR,
  PRODUCT_IMAGE_EXTENSION_BY_TYPE,
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_MIN_DIMENSION,
  PRODUCT_IMAGE_SIZE_ERROR,
  PRODUCT_IMAGE_TYPE_ERROR,
  isProductImageAllowedType,
} from "@/lib/erp/master/product-image";
import { createClient } from "@/lib/supabase/server";

// sharp는 네이티브 바인딩이 필요해 Edge 런타임에서 동작하지 않는다(Task 023②
// "Route Handler 리사이즈" 확정 결과, 2026-08-16) — Route Handler는 별도
// 설정이 없으면 기본이 이미 Node.js 런타임이라 그대로 충족된다. `export const
// runtime = "nodejs"`를 명시하면 `next.config.ts`의 `cacheComponents: true`와
// 충돌해 빌드가 실패하므로(Next 16 Route Segment Config 제약) 여기서는 쓰지 않는다.

const BUCKET = "product-images";
const THUMBNAIL_DIMENSION = 300;
const MAX_ORIGINAL_DIMENSION = 2000;

// 상품 CRUD 권한은 로그인 사용자 전체 개방이라(Task 023③) 여기서도 관리자
// 제한 없이 로그인 여부만 확인한다 — lib/erp/master/actions.ts의
// guardEntity("product")와 동일한 기준.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  await getCurrentErpUser();
  const { productId } = await params;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { message: "이미지 파일이 없습니다." },
      { status: 400 },
    );
  }
  if (!isProductImageAllowedType(file.type)) {
    return NextResponse.json(
      { message: PRODUCT_IMAGE_TYPE_ERROR },
      { status: 400 },
    );
  }
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return NextResponse.json(
      { message: PRODUCT_IMAGE_SIZE_ERROR },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const metadata = await sharp(buffer)
    .metadata()
    .catch(() => null);
  if (
    !metadata?.width ||
    !metadata.height ||
    metadata.width < PRODUCT_IMAGE_MIN_DIMENSION ||
    metadata.height < PRODUCT_IMAGE_MIN_DIMENSION
  ) {
    return NextResponse.json(
      { message: PRODUCT_IMAGE_DIMENSION_ERROR },
      { status: 400 },
    );
  }

  const ext = PRODUCT_IMAGE_EXTENSION_BY_TYPE[file.type];
  const folder = `products/${productId}`;
  const supabase = await createClient();

  // 교체 업로드 시 이전 원본/썸네일이 orphan으로 남지 않도록, 새로 올리기 전에
  // 이 상품 폴더를 통째로 비운다(확장자가 바뀌는 교체까지 커버하기 위해
  // 같은 경로에 upsert하는 것만으로는 부족함).
  const { data: existingFiles } = await supabase.storage
    .from(BUCKET)
    .list(folder);
  if (existingFiles && existingFiles.length > 0) {
    await supabase.storage
      .from(BUCKET)
      .remove(existingFiles.map((f) => `${folder}/${f.name}`));
  }

  // 원본은 EXIF 방향만 정규화하고 과도하게 큰 업로드만 축소한다(쇼핑몰
  // 노출용 원본 자체를 손상시키지 않기 위해 withoutEnlargement).
  // 썸네일은 목록 컬럼(PRD 7.6.1)용으로 정사각形 크롭한다.
  const [originalBuffer, thumbnailBuffer] = await Promise.all([
    sharp(buffer)
      .rotate()
      .resize(MAX_ORIGINAL_DIMENSION, MAX_ORIGINAL_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer(),
    sharp(buffer)
      .rotate()
      .resize(THUMBNAIL_DIMENSION, THUMBNAIL_DIMENSION, { fit: "cover" })
      .toBuffer(),
  ]);

  const originalPath = `${folder}/original.${ext}`;
  const thumbnailPath = `${folder}/thumb.${ext}`;

  const [originalUpload, thumbnailUpload] = await Promise.all([
    supabase.storage.from(BUCKET).upload(originalPath, originalBuffer, {
      contentType: file.type,
      upsert: true,
    }),
    supabase.storage.from(BUCKET).upload(thumbnailPath, thumbnailBuffer, {
      contentType: file.type,
      upsert: true,
    }),
  ]);

  if (originalUpload.error || thumbnailUpload.error) {
    return NextResponse.json(
      { message: "이미지 업로드에 실패했습니다." },
      { status: 500 },
    );
  }

  const imageUrl = supabase.storage.from(BUCKET).getPublicUrl(originalPath)
    .data.publicUrl;
  const thumbnailUrl = supabase.storage.from(BUCKET).getPublicUrl(thumbnailPath)
    .data.publicUrl;

  return NextResponse.json({ imageUrl, thumbnailUrl });
}
