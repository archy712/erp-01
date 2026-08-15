"use client";

import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { GallerySection } from "@/components/gallery/section";

export function FeedbackSection() {
  return (
    <div className="flex flex-col gap-4">
      <GallerySection title="Alert" description="정보 및 경고 메시지">
        <div className="flex w-full flex-col gap-4">
          <Alert>
            <InfoIcon className="size-4" />
            <AlertTitle>안내</AlertTitle>
            <AlertDescription>일반적인 안내 메시지입니다.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            <TriangleAlertIcon className="size-4" />
            <AlertTitle>오류</AlertTitle>
            <AlertDescription>
              문제가 발생했을 때 표시되는 메시지입니다.
            </AlertDescription>
          </Alert>
        </div>
      </GallerySection>

      <GallerySection title="Progress" description="작업 진행률 표시">
        <Progress value={66} className="w-full max-w-sm" />
      </GallerySection>

      <GallerySection title="Skeleton" description="로딩 중 자리표시자">
        <div className="flex items-center gap-4">
          <Skeleton className="size-12 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </GallerySection>

      <GallerySection title="Spinner" description="로딩 스피너">
        <Spinner className="size-6" />
        <Button disabled>
          <Spinner />
          불러오는 중
        </Button>
      </GallerySection>

      <GallerySection
        title="Sonner (Toast)"
        description="화면 우측 하단 알림 토스트"
      >
        <Button
          variant="outline"
          onClick={() =>
            toast("이벤트가 생성되었습니다", {
              description: "2026년 8월 15일 오후 3시",
              action: {
                label: "실행 취소",
                onClick: () => toast.dismiss(),
              },
            })
          }
        >
          토스트 표시
        </Button>
      </GallerySection>
    </div>
  );
}
