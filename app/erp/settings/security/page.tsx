import { Suspense } from "react";

import { ChangePasswordForm } from "@/components/erp/change-password-form";
import { ErpFormPageSkeleton } from "@/components/erp/erp-form-page-skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

// 비밀번호 변경 카드(ErpFormPageSkeleton)뿐 아니라 그 아래 "준비 중" 카드
// 3개(세션/2단계 인증/연결된 계정) 그리드까지 함께 자리를 잡아둔다 — 화면
// 전용 조합이라 별도 공유 컴포넌트로 빼지 않고 이 파일에서만 조립한다.
function SettingsSecuritySkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <ErpFormPageSkeleton fieldCount={2} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-5 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function SettingsSecurityPage() {
  return (
    <Suspense fallback={<SettingsSecuritySkeleton />}>
      <SettingsSecurityContent />
    </Suspense>
  );
}

async function SettingsSecurityContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const upcoming = [
    {
      title: dict.erp.settings.sessionsTitle,
      description: dict.erp.settings.sessionsDescription,
    },
    {
      title: dict.erp.settings.mfaTitle,
      description: dict.erp.settings.mfaDescription,
    },
    {
      title: dict.erp.settings.connectionsTitle,
      description: dict.erp.settings.connectionsDescription,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl">
        <ChangePasswordForm dict={dict} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {upcoming.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle className="text-base">{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Badge variant="secondary">{dict.erp.placeholder.badge}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
