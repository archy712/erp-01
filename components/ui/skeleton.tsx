import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      // pulse(opacity 깜빡임) 대신 shimmer(좌→우로 훑는 그라디언트 스윕)를
      // 사용한다. --skeleton은 app/globals.css에서 --background/--accent와
      // 명확히 구분되도록 조정한 전용 색상 토큰이고, .skeleton-shimmer는
      // 같은 파일의 @keyframes skeleton-shimmer로 애니메이션을 정의한다
      // (prefers-reduced-motion에서는 자동으로 정적 색상으로 대체됨).
      className={cn("skeleton-shimmer rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
