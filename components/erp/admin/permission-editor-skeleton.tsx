import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// 트리 행 스켈레톤이 전부 같은 너비면 어색해 보여서, 실제 메뉴명 길이 편차를
// 흉내내도록 폭을 몇 가지로 순환시킨다.
const TREE_ROW_WIDTHS = ["w-3/5", "w-1/2", "w-2/3", "w-1/3", "w-3/4"];

// components/erp/admin/permission-editor.tsx는 목록형이 아니라 사용자 검색
// Combobox + 저장 버튼 줄, 그 아래 체크박스 트리(들여쓰기 재귀 렌더러)로
// 구성된 화면이다(app/erp/admin/permissions/page.tsx가 PageHeader를 별도로
// 렌더링한 뒤 그 아래에 PermissionEditor 전체를 배치). "flex flex-1
// flex-col gap-4 p-6"와 트리 박스의 "rounded-md border" 형태를 그대로
// 맞춘 로딩 스켈레톤이다.
export function PermissionEditorSkeleton() {
  return (
    <div className="flex flex-1 flex-col">
      {/* components/erp/page-header.tsx와 동일한 px-6 py-4 + border-b */}
      <div className="flex flex-col gap-1 border-b px-6 py-4">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full sm:w-80" />
          </div>
          <Skeleton className="h-9 w-full sm:w-24" />
        </div>

        <div className="flex-1 space-y-1 rounded-md border p-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-2 py-1.5 pr-2 pl-2"
              style={index % 3 === 2 ? { paddingLeft: "2.75rem" } : undefined}
            >
              <Skeleton className="size-4 shrink-0 rounded-sm" />
              <Skeleton
                className={cn(
                  "h-4",
                  TREE_ROW_WIDTHS[index % TREE_ROW_WIDTHS.length],
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
