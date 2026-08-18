import { Fragment } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

const GITHUB_REPO = "https://github.com/archy712/erp-01/blob/main";

export function SiteFooter({
  dict,
  className,
}: {
  dict: Dictionary;
  className?: string;
}) {
  const footerLinks = [
    {
      label: dict.home.footer.projectIntro,
      href: `${GITHUB_REPO}/README.md`,
      external: true,
    },
    {
      label: dict.home.footer.requirements,
      href: `${GITHUB_REPO}/docs/prd/PRD_MASTER.md`,
      external: true,
    },
    {
      label: dict.home.footer.mvpTask,
      href: `${GITHUB_REPO}/docs/prd/PRD_MVP.md`,
      external: true,
    },
    { label: dict.home.footer.componentGallery, href: "/gallery" },
    { label: dict.home.footer.iconGallery, href: "/icons" },
    { label: dict.home.footer.techStack, href: "/tech-stack" },
  ];

  return (
    <footer
      className={cn(
        "flex w-full flex-col items-center gap-4 border-t py-8 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
        {footerLinks.map((link, i) => (
          <Fragment key={link.href}>
            {i > 0 && <span aria-hidden="true">|</span>}
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="underline-offset-4 hover:text-foreground hover:underline"
              >
                {link.label}
              </Link>
            )}
          </Fragment>
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
