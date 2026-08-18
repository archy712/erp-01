import { MasterDetailSkeleton } from "@/components/erp/master/master-detail-skeleton";

// Next 16 loading.js 컨벤션: /erp/master/* 세그먼트로 이동할 때(특히 아직
// prefetch되지 않은 최초 진입) 즉시 노출되는 route-level fallback이다.
// master 하위 5개 화면 중 4개(브랜드/컬러/상품분류/사이즈 관리)가 트리-상세형이라
// 이 스켈레톤을 대표로 쓴다 — 목적지가 목록형(법인 관리)이어도
// app/erp/master/companies/page.tsx의 안쪽 Suspense fallback이 정확한 형태로
// 곧바로 교체하므로 완벽히 일치하지 않아도 된다.
export default function MasterSegmentLoading() {
  return <MasterDetailSkeleton />;
}
