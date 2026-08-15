"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { TriangleAlert, X } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  dismissPasswordNotice,
  isPasswordNoticeDismissed,
  subscribePasswordNotice,
} from "@/lib/erp/password-notice";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

// localStorage 값은 서버에서 알 수 없으므로 useSyncExternalStore로 읽어, 서버
// 스냅샷(항상 dismissed=true)과 클라이언트 스냅샷을 React가 안전하게 동기화하도록
// 한다(useEffect + setState로 직접 구현하면 set-state-in-effect 규칙에 걸림).
export function PasswordChangeBanner({ dict }: { dict: Dictionary }) {
  const dismissed = useSyncExternalStore(
    subscribePasswordNotice,
    isPasswordNoticeDismissed,
    () => true,
  );

  if (dismissed) {
    return null;
  }

  return (
    <Alert>
      <TriangleAlert />
      <AlertTitle>{dict.erp.passwordNotice.title}</AlertTitle>
      <AlertDescription>
        <p>{dict.erp.passwordNotice.description}</p>
        <Button asChild size="sm" variant="outline" className="mt-1">
          <Link href="/erp/change-password">{dict.erp.passwordNotice.cta}</Link>
        </Button>
      </AlertDescription>
      <Button
        type="button"
        size="icon-xs"
        variant="ghost"
        className="absolute top-3 right-3"
        aria-label={dict.erp.passwordNotice.dismissAriaLabel}
        onClick={() => dismissPasswordNotice()}
      >
        <X />
      </Button>
    </Alert>
  );
}
