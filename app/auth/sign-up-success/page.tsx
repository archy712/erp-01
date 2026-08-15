import { Suspense } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getLocale } from "@/lib/i18n/get-locale";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignUpSuccessContent />
    </Suspense>
  );
}

async function SignUpSuccessContent() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {dict.signUpSuccess.title}
              </CardTitle>
              <CardDescription>
                {dict.signUpSuccess.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {dict.signUpSuccess.message}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
