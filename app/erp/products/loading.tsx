import { ErpListPageSkeleton } from "@/components/erp/erp-list-page-skeleton";

// Next 16 loading.js 컨벤션: /erp/products/* 세그먼트로 이동할 때(특히 아직
// prefetch되지 않은 최초 진입) 즉시 노출되는 route-level fallback이다. 목록
// 화면(app/erp/products/page.tsx)이 대표 형태라 필터바 포함 스켈레톤을 쓴다 —
// 목적지가 등록/수정 폼(products/new, products/[productId])이어도 그 페이지의
// 안쪽 Suspense fallback이 폼 형태로 곧바로 교체하므로 완벽히 일치하지 않아도
// 된다.
export default function ProductsSegmentLoading() {
  return <ErpListPageSkeleton showFilters columnCount={9} />;
}
