import { Fragment } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Dictionary } from "@/lib/i18n/dictionaries/types";

const GITHUB_REPO = "https://github.com/archy712/erp-01/blob/main";

function getFooterLinks(dict: Dictionary) {
  return [
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
}

export function FooterLinkNav({
  dict,
  className,
}: {
  dict: Dictionary;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-2 gap-y-2",
        className,
      )}
    >
      {getFooterLinks(dict).map((link, i) => (
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
  );
}

export function FooterCopyright({
  dict,
  className,
}: {
  dict: Dictionary;
  className?: string;
}) {
  const copyright = dict.erp.footer.copyright.replace(
    "{year}",
    String(new Date().getFullYear()),
  );

  return (
    <p className={className}>
      {copyright} ·{" "}
      <a
        href="mailto:archy712@gmail.com"
        className="underline-offset-4 hover:text-foreground hover:underline"
      >
        archy712@gmail.com
      </a>
    </p>
  );
}

export function SiteFooter({
  dict,
  className,
}: {
  dict: Dictionary;
  className?: string;
}) {
  return (
    <footer
      className={cn(
        "flex w-full flex-col items-center gap-4 border-t py-8 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      <FooterLinkNav dict={dict} />
      <FooterCopyright dict={dict} />
    </footer>
  );
}
