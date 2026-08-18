import { ErpFormPageSkeleton } from "@/components/erp/erp-form-page-skeleton";

// Next 16 loading.js 컨벤션: /erp/settings/* 세그먼트로 이동할 때(특히 아직
// prefetch되지 않은 최초 진입) 즉시 노출되는 route-level fallback이다. 이
// 세그먼트는 app/erp/settings/layout.tsx(좌측 SettingsNav + 브레드크럼)까지
// 함께 렌더링을 기다리므로, 하위 5개 화면이 공통으로 쓰는 가운데 정렬 카드형
// 스켈레톤을 대표로 노출한다 — 실제 목적지 페이지의 안쪽 Suspense fallback이
// 화면별 필드 개수로 곧바로 교체하므로 완벽히 일치하지 않아도 된다.
export default function SettingsSegmentLoading() {
  return <ErpFormPageSkeleton />;
}
