import { DashboardSkeleton } from "@/components/erp/dashboard/dashboard-skeleton";

// Next 16 loading.js 컨벤션: app/erp/page.tsx가 스트리밍되는 동안 이
// 파일이 prefetch되어 즉시 노출되는 route-level fallback으로 자동
// 사용된다(별도 Suspense로 감쌀 필요 없음 — layout.js와 page.js 사이에
// Next.js가 자동으로 Suspense 경계를 만든다). 실제 콘텐츠가 준비되면
// 자동으로 교체된다. 스켈레톤 마크업은 app/erp/page.tsx의 Suspense
// fallback과 동일한 컴포넌트(components/erp/dashboard/dashboard-skeleton.tsx)를
// 재사용해 두 경로(사전 로딩 fallback / 스트리밍 중 fallback)의 모양이
// 어긋나지 않게 한다.
export default function ErpHomeLoading() {
  return <DashboardSkeleton />;
}
