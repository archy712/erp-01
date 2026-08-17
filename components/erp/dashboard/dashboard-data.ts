// 경영정보 대시보드 전용 더미 데이터. 실제 매출/재고 데이터 연동은 이번
// MVP 범위 밖이며(PRD 9절 비범위), 여기 있는 수치는 전부 레이아웃 확인용
// 샘플이다. KPI 카드 값들은 아래 원본 데이터셋(월별 매출/손익, 일별
// 객수·객단가)에서 계산해 서로 앞뒤가 맞도록 구성했다.

/** 최근 12개월 매출·손익 (단위: 백만원) */
const monthlyFinance = [
  { month: "1", revenue: 812, profit: 122 },
  { month: "2", revenue: 894, profit: 148 },
  { month: "3", revenue: 856, profit: 129 },
  { month: "4", revenue: 941, profit: 168 },
  { month: "5", revenue: 1023, profit: 189 },
  { month: "6", revenue: 978, profit: 156 },
  { month: "7", revenue: 1056, profit: 201 },
  { month: "8", revenue: 1104, profit: 214 },
  { month: "9", revenue: 1042, profit: 178 },
  { month: "10", revenue: 1187, profit: 233 },
  { month: "11", revenue: 1256, profit: 251 },
  { month: "12", revenue: 1284, profit: 268 },
] as const;

/** 최근 7일 객수(건)·객단가(원). day는 오늘(D-0) 기준 상대 표기 */
export const dailyCustomerMetrics = [
  { day: "D-6", count: 412, avgPrice: 38200 },
  { day: "D-5", count: 389, avgPrice: 39750 },
  { day: "D-4", count: 445, avgPrice: 37600 },
  { day: "D-3", count: 468, avgPrice: 41200 },
  { day: "D-2", count: 501, avgPrice: 40100 },
  { day: "D-1", count: 476, avgPrice: 42300 },
  { day: "D-0", count: 512, avgPrice: 43850 },
] as const;

/** 이번 달 브랜드별 매출 (단위: 백만원, 내림차순) */
export const brandRevenue = [
  { brand: "Brand A", revenue: 320 },
  { brand: "Brand B", revenue: 260 },
  { brand: "Brand C", revenue: 210 },
  { brand: "Brand D", revenue: 180 },
  { brand: "Brand E", revenue: 160 },
  { brand: "Brand F", revenue: 154 },
] as const;

/** 이번 달 판매 채널별 매출 (단위: 백만원) */
export const channelRevenueRaw = [
  { channel: "online", revenue: 706 },
  { channel: "offline", revenue: 449 },
  { channel: "partner", revenue: 129 },
] as const;

/** 이번 달 카테고리별 매출 TOP 5 (단위: 백만원, 내림차순) */
export const categoryRevenue = [
  { category: "apparel", revenue: 386 },
  { category: "beauty", revenue: 298 },
  { category: "electronics", revenue: 254 },
  { category: "food", revenue: 198 },
  { category: "lifestyle", revenue: 148 },
] as const;

/** 목표 매출 (실적은 아래 실데이터에서 파생) */
const MONTHLY_TARGET_REVENUE_M = 1200; // 백만원

const today = dailyCustomerMetrics[dailyCustomerMetrics.length - 1];
const yesterday = dailyCustomerMetrics[dailyCustomerMetrics.length - 2];
const thisMonth = monthlyFinance[monthlyFinance.length - 1];
const lastMonth = monthlyFinance[monthlyFinance.length - 2];

const todayRevenue = today.count * today.avgPrice;
const yesterdayRevenue = yesterday.count * yesterday.avgPrice;

function percentChange(current: number, previous: number) {
  return ((current - previous) / previous) * 100;
}

function formatSignedPercent(value: number) {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function formatKRW(value: number) {
  return `₩${Math.round(value).toLocaleString("ko-KR")}`;
}

// KPI 카드/게이지에 억 단위 금액을 그대로 찍으면(예: ₩1,284,000,000) 카드
// 폭을 넘겨 잘리므로, 1만원 이상은 만원/억원 단위로 축약해 표시한다.
export function formatCompactKRW(won: number) {
  if (won >= 100_000_000) {
    const eok = won / 100_000_000;
    return `${eok.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}억원`;
  }
  if (won >= 10_000) {
    return `${Math.round(won / 10_000).toLocaleString("ko-KR")}만원`;
  }
  return formatKRW(won);
}

/** KPI 카드 6종에 필요한 계산된 값 모음 */
export const dashboardKpi = {
  revenueToday: formatCompactKRW(todayRevenue),
  revenueTodayChange: formatSignedPercent(
    percentChange(todayRevenue, yesterdayRevenue),
  ),
  revenueMonth: formatCompactKRW(thisMonth.revenue * 1_000_000),
  revenueMonthChange: formatSignedPercent(
    percentChange(thisMonth.revenue, lastMonth.revenue),
  ),
  customerCount: today.count.toLocaleString("ko-KR"),
  customerCountChange: formatSignedPercent(
    percentChange(today.count, yesterday.count),
  ),
  customerPrice: formatKRW(today.avgPrice),
  customerPriceChange: formatSignedPercent(
    percentChange(today.avgPrice, yesterday.avgPrice),
  ),
  operatingMargin: `${((thisMonth.profit / thisMonth.revenue) * 100).toFixed(1)}%`,
  monthlyAchievementRate: `${((thisMonth.revenue / MONTHLY_TARGET_REVENUE_M) * 100).toFixed(1)}%`,
};

/** 그룹사 전체 이번 달 예상 매출 목표 달성률 게이지에 필요한 값 */
export const groupAchievement = {
  rate: Math.round((thisMonth.revenue / MONTHLY_TARGET_REVENUE_M) * 1000) / 10,
  actual: formatCompactKRW(thisMonth.revenue * 1_000_000),
  target: formatCompactKRW(MONTHLY_TARGET_REVENUE_M * 1_000_000),
};

// 실제 companies 테이블에 등록된 법인명(M2/M2 Safety/MIDER/Mynafit/Mordisk/Miretti)을
// 그대로 쓰되, weight(그룹 매출 내 비중)·actualThisMonth(이번 달 실적, 단위: 백만원)는
// 레이아웃 확인용 더미 값이다. weight 합은 1, actualThisMonth 합은 thisMonth.revenue와
// 일치하도록 구성해 그룹 합계와 법인별 합계가 서로 어긋나지 않게 했다. color는 법인별
// 매출 달성률·매출 구성비·월별 매출 스택 차트 3곳에서 동일 법인은 항상 같은 색으로
// 표시되게 하는 공용 팔레트다.
export const companies = [
  {
    name: "M2",
    weight: 0.3,
    actualThisMonth: 414,
    color: "hsl(var(--chart-1))",
  },
  {
    name: "M2 Safety",
    weight: 0.1,
    actualThisMonth: 110,
    color: "hsl(var(--chart-2))",
  },
  {
    name: "MIDER",
    weight: 0.2,
    actualThisMonth: 259,
    color: "hsl(var(--chart-3))",
  },
  {
    name: "Mynafit",
    weight: 0.15,
    actualThisMonth: 153,
    color: "hsl(var(--chart-4))",
  },
  {
    name: "Mordisk",
    weight: 0.15,
    actualThisMonth: 216,
    color: "hsl(var(--chart-5))",
  },
  {
    name: "Miretti",
    weight: 0.1,
    actualThisMonth: 132,
    color: "hsl(var(--chart-6))",
  },
] as const;

/** 법인별 예상 매출 달성률 차트에 필요한 값 (달성률 내림차순) */
export const companyAchievement = companies
  .map((company) => {
    const target = Math.round(company.weight * MONTHLY_TARGET_REVENUE_M);
    return {
      name: company.name,
      color: company.color,
      rate: Math.round((company.actualThisMonth / target) * 1000) / 10,
      actual: formatCompactKRW(company.actualThisMonth * 1_000_000),
      target: formatCompactKRW(target * 1_000_000),
    };
  })
  .sort((a, b) => b.rate - a.rate);

/** 법인별 매출 구성비 차트에 필요한 값 (그룹 전체 매출 대비 비중, 내림차순) */
export const companyRevenueComposition = companies
  .map((company) => ({
    name: company.name,
    color: company.color,
    revenue: company.actualThisMonth,
    percent:
      Math.round((company.actualThisMonth / thisMonth.revenue) * 1000) / 10,
  }))
  .sort((a, b) => b.revenue - a.revenue);

/** 매출·손익 추이 차트의 월별 매출을 법인별로 나눈 값 (합계는 monthlyFinance.revenue와 일치) */
export const monthlyRevenueByCompany = monthlyFinance.map((entry) => {
  const shares = companies.map((company) =>
    Math.round(entry.revenue * company.weight),
  );
  const roundingDiff = entry.revenue - shares.reduce((sum, v) => sum + v, 0);
  shares[0] += roundingDiff; // 반올림 오차는 비중이 가장 큰 법인(M2)에 합산

  return {
    month: entry.month,
    revenue: entry.revenue,
    profit: entry.profit,
    ...Object.fromEntries(companies.map((c, i) => [c.name, shares[i]])),
  };
});

/** 최근 7일 일별 매출 (단위: 백만원, 객수 × 객단가에서 파생) */
export const weeklyRevenue = dailyCustomerMetrics.map(
  ({ day, count, avgPrice }) => ({
    day,
    revenue: Math.round(((count * avgPrice) / 1_000_000) * 10) / 10,
  }),
);
