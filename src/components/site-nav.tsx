"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/", label: "Ranking" },
  { href: "/map", label: "Map" },
] as const;

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Pages"
      className="inline-flex h-10 shrink-0 items-center gap-0.5 rounded-lg border border-hairline bg-panel p-[3px] sm:h-[34px]"
    >
      {TABS.map((tab) => {
        const active = isActive(pathname, tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-full items-center rounded-md px-3 text-[13.5px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:px-2.5",
              active ? "bg-accent/8 font-semibold text-accent" : "text-muted hover:bg-soft hover:text-main",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
