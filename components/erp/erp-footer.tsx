import type { Dictionary } from "@/lib/i18n/dictionaries/types";

// 이전에는 app/page.tsx의 마케팅 푸터(갤러리 링크 6개 + 이메일)를 그대로
// 복제해 모든 업무 화면 하단에 항상 노출했다. 로그인 후 업무 중인 화면에서는
// 컴포넌트/아이콘/차트 갤러리 링크가 작업과 무관하고, h-screen 셸 구조상
// 이 영역이 항상 고정 높이를 차지해 데이터 테이블·폼이 많은 ERP 화면의 실제
// 작업 가능 높이를 매번 줄였다. 저작권/버전 정도만 담은 한 줄짜리 유틸리티
// 바로 축소한다 — 마케팅 푸터 원본은 app/page.tsx에 그대로 남아 있다.
export function ErpFooter({ dict }: { dict: Dictionary }) {
  const copyright = dict.erp.footer.copyright.replace(
    "{year}",
    String(new Date().getFullYear()),
  );

  return (
    <footer className="flex h-10 w-full shrink-0 items-center justify-center border-t px-4 text-xs text-muted-foreground">
      <p>
        {copyright} ·{" "}
        <a
          href="mailto:archy712@gmail.com"
          className="underline-offset-4 hover:text-foreground hover:underline"
        >
          archy712@gmail.com
        </a>
      </p>
    </footer>
  );
}
