import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthErrorMessageByCode } from "@/lib/auth/get-auth-error-message";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";
import { Suspense } from "react";

async function ErrorContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <p className="text-sm text-muted-foreground">
      {getAuthErrorMessageByCode(params?.error, dict)}
    </p>
  );
}

async function ErrorPageTitle() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return <CardTitle className="text-2xl">{dict.authError.pageTitle}</CardTitle>;
}

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <Suspense fallback={null}>
                <ErrorPageTitle />
              </Suspense>
            </CardHeader>
            <CardContent>
              <Suspense fallback={null}>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
