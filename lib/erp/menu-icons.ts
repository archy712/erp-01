import {
  BarChart3,
  Boxes,
  Building2,
  Calculator,
  ClipboardList,
  Contact,
  Database,
  FileEdit,
  FileText,
  Folder,
  Handshake,
  LayoutGrid,
  LineChart,
  type LucideIcon,
  Menu,
  Newspaper,
  Package,
  PackageSearch,
  Palette,
  Ruler,
  Settings,
  Shield,
  Ship,
  ShoppingCart,
  Tag,
  Tags,
  Target,
  TrendingUp,
  Truck,
  Users,
  Wallet2,
} from "lucide-react";

/**
 * 메뉴명 → 아이콘 매핑의 단일 소스. `menus` 테이블에는 아이콘 컬럼이 없으므로
 * 대/중/소분류 이름을 보고 코드에서 아이콘을 고른다. 상단 Menubar
 * (components/erp/erp-menubar.tsx), 좌측 트리·모바일 내비게이션
 * (lib/erp/menu-tree.ts), 관리자 메뉴 관리 트리(admin/menu-manager.tsx),
 * 로그인 전 홈(lib/erp/home-categories.ts)이 모두 이 파일을 공유한다.
 *
 * 1) EXACT_NAME_ICONS: 현재 DB에 있는 이름과 정확히 일치할 때 쓰는 아이콘.
 * 2) KEYWORD_ICONS: 관리자가 새 메뉴를 추가해 이름이 여기 없어도, 이름에
 *    포함된 업무 키워드로 그럴듯한 아이콘을 고르는 폴백.
 * 3) 그래도 못 찾으면 하위 메뉴 유무로 Folder/FileText 중 선택.
 */
const EXACT_NAME_ICONS: Record<string, LucideIcon> = {
  // 대분류(level 1)
  "마스터 관리": LayoutGrid,
  경영정보: LineChart,
  인사급여: Users,
  웹회계: Calculator,
  기획: ClipboardList,
  소싱: PackageSearch,
  물류: Truck,
  협력사: Handshake,
  영업: TrendingUp,
  영업관리: BarChart3,
  영업기획: Target,
  고객관리: Contact,
  웹POS: ShoppingCart,
  "C&F": Ship,
  게시판: Newspaper,

  // 중분류(level 2)
  "기본 관리": Settings,
  "기준정보 관리": Database,
  "상품 관리": Package,

  // 소분류(level 3)
  "사용자 관리": Users,
  "메뉴 관리": Menu,
  "사용자 권한 관리": Shield,
  "법인 관리": Building2,
  "브랜드 관리": Tags,
  "소브랜드 관리": Tag,
  "상품 정보 현황": FileText,
  "상품 정보 일괄 수정": FileEdit,
  "아이템/서브아이템 관리": Boxes,
  "상품 컬러 관리": Palette,
  "상품 사이즈 관리": Ruler,
};

/** 위 정확 일치 표에 없는 이름을 위한 키워드 기반 폴백. 위에서부터 순서대로
 * 검사해 이름에 해당 단어가 포함되면 그 아이콘을 쓴다. */
const KEYWORD_ICONS: readonly [string, LucideIcon][] = [
  ["권한", Shield],
  ["사용자", Users],
  ["회원", Users],
  ["법인", Building2],
  ["브랜드", Tags],
  ["컬러", Palette],
  ["색상", Palette],
  ["사이즈", Ruler],
  ["아이템", Boxes],
  ["재고", Boxes],
  ["주문", ShoppingCart],
  ["결제", Wallet2],
  ["정산", Calculator],
  ["회계", Calculator],
  ["매출", LineChart],
  ["고객", Contact],
  ["게시", Newspaper],
  ["공지", Newspaper],
  ["메뉴", Menu],
  ["물류", Truck],
  ["배송", Truck],
  ["협력사", Handshake],
  ["거래처", Handshake],
  ["영업", TrendingUp],
  ["상품", Package],
  ["품목", Package],
  ["설정", Settings],
  ["관리", Settings],
];

/** 순서가 고정된 대분류 15종. `lib/erp/home-categories.ts`가 DB sort_order와
 * 같은 순서로 아이콘 배열을 만드는 데 쓴다. */
export const TOP_CATEGORY_NAMES = [
  "마스터 관리",
  "경영정보",
  "인사급여",
  "웹회계",
  "기획",
  "소싱",
  "물류",
  "협력사",
  "영업",
  "영업관리",
  "영업기획",
  "고객관리",
  "웹POS",
  "C&F",
  "게시판",
] as const;

export function getMenuIcon(name: string, hasChildren: boolean): LucideIcon {
  const exact = EXACT_NAME_ICONS[name];
  if (exact) return exact;

  const keyword = KEYWORD_ICONS.find(([word]) => name.includes(word));
  if (keyword) return keyword[1];

  return hasChildren ? Folder : FileText;
}
