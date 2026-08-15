import Link from "next/link";

import type { Dictionary } from "@/lib/i18n/dictionaries/types";

// `app/page.tsx` Footer 마크업을 그대로 복제한 것 (Task 001 결정).
// 디자인을 변경하지 않는다 — 원본을 수정해야 하면 여기가 아니라 app/page.tsx를 고친다.
export function ErpFooter({ dict }: { dict: Dictionary }) {
  const footerLinks = [
    { label: dict.home.footer.about, href: "/about" },
    { label: dict.home.footer.techStack, href: "/tech-stack" },
    { label: dict.home.footer.componentGallery, href: "/gallery" },
    { label: dict.home.footer.iconGallery, href: "/icons" },
    { label: dict.home.footer.chartGallery, href: "/charts" },
    { label: dict.home.footer.avatarGallery, href: "/avatars" },
  ];

  return (
    <footer className="flex w-full flex-col items-center gap-4 border-t py-8 text-center text-sm text-muted-foreground">
      <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {footerLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <p>
        {dict.home.footer.developedBy}{" "}
        <a
          href="mailto:archy712@gmail.com"
          className="font-medium underline-offset-4 hover:underline"
        >
          archy712@gmail.com
        </a>
      </p>
    </footer>
  );
}
