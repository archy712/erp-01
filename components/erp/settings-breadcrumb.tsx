"use client";

import { usePathname } from "next/navigation";

import { PageHeader } from "@/components/erp/page-header";

// 설정 화면 각각(프로필/보안/알림/언어/테마)은 자체 카드 안에
// 이미 자체 타이틀(CardTitle)을 갖고 있어, PageHeader의 title까지 중복으로
// 넣으면 같은 이름이 두 번 보인다. 그래서 여기서는 브레드크럼 한 줄만
// 렌더링해 "설정 > 현재 섹션" 경로만 보여준다. 활성 섹션은 pathname으로
// 판별해야 해서(레이아웃은 서버 컴포넌트라 usePathname을 못 씀) 별도
// 클라이언트 컴포넌트로 분리했다 — SettingsNav가 이미 쓰는 것과 같은 items
// 배열을 그대로 재사용한다.
export function SettingsBreadcrumb({
  items,
  rootLabel,
}: {
  items: { href: string; label: string }[];
  rootLabel: string;
}) {
  const pathname = usePathname();
  const active = items.find((item) => item.href === pathname);

  return (
    <PageHeader breadcrumb={active ? [rootLabel, active.label] : [rootLabel]} />
  );
}
