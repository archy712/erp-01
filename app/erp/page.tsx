import { Suspense } from "react";

import { TrendingUp, Users, Wallet } from "lucide-react";

import { ErpHomeChart } from "@/components/erp/erp-home-chart";
import { PasswordChangeBanner } from "@/components/erp/password-change-banner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

// 레이아웃 확인용 더미 수치. 실제 데이터 연동은 이번 MVP 범위 밖이다
// (PRD 9절 비범위 — 대시보드 차트/통계 위젯의 실 데이터 연동).
function getDummyStats(dict: Dictionary) {
  return [
    { label: dict.erpHome.statRevenue, value: "₩128,400,000", icon: Wallet },
    { label: dict.erpHome.statActiveUsers, value: "342", icon: Users },
    { label: dict.erpHome.statGrowthRate, value: "+12.4%", icon: TrendingUp },
  ];
}

// 로그인 후 진입하는 ERP 메인 화면. 상단 Menubar/좌측 트리에서 메뉴를
// 선택하기 전 보여줄 간단한 환영 대시보드로, 여기 표시된 수치는 전부
// 레이아웃 확인용 샘플 데이터다.
export default function ErpHomePage() {
  return (
    <Suspense fallback={null}>
      <ErpHomeContent />
    </Suspense>
  );
}

async function ErpHomeContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const dummyStats = getDummyStats(dict);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <PasswordChangeBanner dict={dict} />

      <div>
        <h1 className="text-2xl font-semibold">{dict.erpHome.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {dict.erpHome.description}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline">{dict.erpHome.sampleDataBadge}</Badge>
        <span className="text-xs text-muted-foreground">
          {dict.erpHome.sampleDataNote}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {dummyStats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <CardTitle className="text-2xl">{value}</CardTitle>
            </CardContent>
          </Card>
        ))}
      </div>

      <ErpHomeChart dict={dict} />
    </div>
  );
}
