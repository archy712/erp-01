import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

export function EnvVarWarning({ dict }: { dict?: Dictionary }) {
  return (
    <div className="flex items-center gap-4">
      <Badge variant={"outline"} className="font-normal">
        Supabase environment variables required
      </Badge>
      <div className="flex gap-2">
        <Button size="sm" variant={"outline"} disabled>
          {dict?.common.signIn ?? "Sign in"}
        </Button>
        <Button size="sm" variant={"default"} disabled>
          {dict?.common.signUp ?? "Sign up"}
        </Button>
      </div>
    </div>
  );
}
