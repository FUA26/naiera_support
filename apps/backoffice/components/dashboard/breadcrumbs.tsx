"use client";

import { generateBreadcrumbs } from "@/lib/dashboard/breadcrumb-utils";
import { ChevronRight } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

export function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  // Hide if only Dashboard
  if (breadcrumbs.length === 1) {
    return null;
  }

  return (
    <nav className="flex items-center text-sm text-muted-foreground">
      {breadcrumbs.map((crumb, index) => (
        <Fragment key={index}>
          {index > 0 && (
            <HugeiconsIcon icon={ChevronRight} className="mx-2 h-4 w-4" strokeWidth={2} />
          )}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
