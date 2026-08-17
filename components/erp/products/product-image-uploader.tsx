"use client";

import { ImageOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { FileDropzone } from "@/components/ui/file-dropzone";
import { Label } from "@/components/ui/label";
import {
  PRODUCT_IMAGE_DIMENSION_ERROR,
  PRODUCT_IMAGE_MAX_BYTES,
  PRODUCT_IMAGE_MIN_DIMENSION,
  PRODUCT_IMAGE_SIZE_ERROR,
  PRODUCT_IMAGE_TYPE_ERROR,
  isProductImageAllowedType,
} from "@/lib/erp/master/product-image";

type ProductImageUploaderProps = {
  /** 생성 폼은 저장 전 클라이언트에서 미리 발급한 id, 수정 폼은 실제 상품 id. */
  productId: string;
  imageUrl: string | null;
  onUploaded: (result: { imageUrl: string; thumbnailUrl: string }) => void;
};

function readImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      reject(new Error("이미지를 읽을 수 없습니다."));
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  });
}

// PRD 7.6.2 "상품 이미지" 필드 — file-dropzone(기존 컴포넌트)을 그대로
// 재사용해 원본을 업로드하면 app/api/products/[productId]/image/route.ts가
// 서버(Route Handler, Task 023② 확정)에서 썸네일을 자동 생성하므로 관리자가
// 썸네일을 별도로 올릴 필요가 없다. 미리보기는 이 컴포넌트가 직접 큰
// 정사각 박스로 그리고, file-dropzone 자체의 첨부파일 목록 UI는 쓰지 않는다
// (files prop을 항상 []로 컨트롤드 유지 — 한 번에 한 장만 다루는 단일
// 이미지 업로더라 목록 UI가 필요 없음).
export function ProductImageUploader({
  productId,
  imageUrl,
  onUploaded,
}: ProductImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  async function handleFilesChange(files: File[]) {
    if (files.length === 0) return;
    if (files.length > 1) {
      toast.error("한 번에 하나의 이미지만 업로드할 수 있습니다.");
      return;
    }
    const file = files[0];

    if (!isProductImageAllowedType(file.type)) {
      toast.error(PRODUCT_IMAGE_TYPE_ERROR);
      return;
    }
    if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
      toast.error(PRODUCT_IMAGE_SIZE_ERROR);
      return;
    }

    try {
      const { width, height } = await readImageDimensions(file);
      if (
        width < PRODUCT_IMAGE_MIN_DIMENSION ||
        height < PRODUCT_IMAGE_MIN_DIMENSION
      ) {
        toast.error(PRODUCT_IMAGE_DIMENSION_ERROR);
        return;
      }
    } catch {
      toast.error("이미지 파일을 읽을 수 없습니다.");
      return;
    }

    setIsUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(`/api/products/${productId}/image`, {
        method: "POST",
        body,
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message ?? "이미지 업로드에 실패했습니다.");
        return;
      }
      onUploaded(result);
      toast.success("이미지를 업로드했습니다.");
    } catch {
      toast.error("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <Label>상품 이미지</Label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {imageUrl ? (
          <div className="relative size-48 shrink-0 overflow-hidden rounded-md border">
            <Image
              src={imageUrl}
              alt="상품 이미지"
              fill
              sizes="192px"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex size-48 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
            <ImageOff className="size-8" />
          </div>
        )}
        <div className="flex-1">
          <FileDropzone
            files={[]}
            onChange={handleFilesChange}
            accept="image/jpeg,image/png,image/webp"
          />
          {isUploading ? (
            <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              업로드 중...
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
