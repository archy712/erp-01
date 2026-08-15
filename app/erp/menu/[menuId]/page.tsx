import { Suspense } from "react";

// Task 006에서 MenuPlaceholder(F010) 및 실제 메뉴 조회로 대체 예정.
export default function ErpMenuPage({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  return (
    <Suspense fallback={null}>
      <ErpMenuContent params={params} />
    </Suspense>
  );
}

async function ErpMenuContent({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const { menuId } = await params;

  return (
    <div className="flex flex-1 items-center justify-center p-10">
      <h1 className="text-2xl font-semibold">메뉴: {menuId}</h1>
    </div>
  );
}
