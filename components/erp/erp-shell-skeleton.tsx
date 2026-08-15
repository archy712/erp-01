import { Skeleton } from "@/components/ui/skeleton";

// getCurrentErpUser()/getVisibleMenuTree()/getLocale() 조회가 끝날 때까지
// app/erp/layout.tsx의 Suspense fallback으로 노출되는 ERP 셸 스켈레톤.
// 빈 화면(fallback=null) 대신 Header/Menubar/좌측 트리/Footer의 대략적인
// 형태만 스케치한다 — ErpShell의 실제 마크업(h-16 헤더, h-12 메뉴바,
// w-48/lg:w-64 트리)과 높이를 맞춰 레이아웃 시프트를 줄인다 (Task 021).
export function ErpShellSkeleton() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <header className="flex h-16 w-full shrink-0 items-center justify-center border-b border-b-foreground/10">
        <div className="flex w-full max-w-5xl items-center justify-between px-5">
          <Skeleton className="h-5 w-40" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </header>

      <div className="flex h-12 w-full shrink-0 items-center gap-2 border-b px-4">
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-md" />
        <Skeleton className="h-6 w-24 rounded-md" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-48 shrink-0 space-y-2 overflow-y-auto border-r p-4 md:block lg:w-64">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-5/6" />
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-3 overflow-y-auto p-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>

      <footer className="flex w-full shrink-0 flex-col items-center gap-3 border-t py-8">
        <Skeleton className="h-4 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-40" />
      </footer>
    </div>
  );
}
