import { ErpListPageSkeleton } from "@/components/erp/erp-list-page-skeleton";

// Next 16 loading.js 컨벤션: /erp/admin/* 세그먼트로 이동할 때(특히 아직
// prefetch되지 않은 최초 진입) 즉시 노출되는 route-level fallback이다.
// admin 하위 라우트(사용자/메뉴/권한/조직도 관리) 중 목록형(사용자 관리)이
// 대표 형태라 이 스켈레톤을 쓴다 — 실제 목적지가 트리·콤보박스 기반 화면(메뉴/
// 권한 관리)이거나 트리-상세형(조직도)이어도, 그 페이지의 안쪽 Suspense
// fallback(app/erp/admin/{menus,permissions,org}/page.tsx)이 정확한 형태로
// 곧바로 교체하므로 완벽히 일치하지 않아도 된다.
export default function AdminSegmentLoading() {
  return <ErpListPageSkeleton />;
}
