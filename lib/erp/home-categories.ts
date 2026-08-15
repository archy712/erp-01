import {
  BarChart3,
  Calculator,
  ClipboardList,
  Contact,
  Handshake,
  LayoutGrid,
  LineChart,
  type LucideIcon,
  Newspaper,
  PackageSearch,
  Ship,
  ShoppingCart,
  Target,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";

/**
 * 로그인 전 메인 화면(app/page.tsx)에 소개할 ERP 대분류 카테고리 아이콘.
 * `menus` 테이블(level=1)에는 아이콘/설명 컬럼이 없으므로
 * components/erp/erp-menubar.tsx의 CATEGORY_ICONS와 같은 방식으로 코드에서
 * 이름 기반 정적 매핑을 유지한다. 순서는 실 DB의 sort_order(0~14)와 동일하며,
 * 다국어 텍스트는 lib/i18n/dictionaries/*.ts의 home.categories 배열이 같은
 * 순서로 대응한다.
 */
export const HOME_CATEGORY_ICONS: LucideIcon[] = [
  LayoutGrid, // 마스터 관리
  LineChart, // 경영정보
  Users, // 인사급여
  Calculator, // 웹회계
  ClipboardList, // 기획
  PackageSearch, // 소싱
  Truck, // 물류
  Handshake, // 협력사
  TrendingUp, // 영업
  BarChart3, // 영업관리
  Target, // 영업기획
  Contact, // 고객관리
  ShoppingCart, // 웹POS
  Ship, // C&F
  Newspaper, // 게시판
];
