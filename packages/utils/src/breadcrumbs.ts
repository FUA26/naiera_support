export interface BreadcrumbItem {
  label: string;
  href: string | null;
  icon?: React.ComponentType<{ className?: string }>;
}

export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0 || segments[0] === "dashboard") {
    return [{ label: "Dashboard", href: "/dashboard", icon: undefined }];
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: undefined },
  ];

  // Build breadcrumb path based on segments
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    if (segment === "dashboard") continue;

    if (segment === "manage") {
      breadcrumbs.push({ label: "Management", href: null });
      continue;
    }

    if (segment === "users") {
      breadcrumbs.push({ label: "Users", href: "/manage/users" });
      continue;
    }

    if (segment === "roles") {
      breadcrumbs.push({ label: "Roles", href: "/manage/roles" });
      continue;
    }

    if (segment === "permissions") {
      breadcrumbs.push({ label: "Permissions", href: "/manage/permissions" });
      continue;
    }

    if (segment === "system-settings") {
      breadcrumbs.push({ label: "System Settings", href: "/manage/system-settings" });
      continue;
    }

    // Skip profile from breadcrumbs
    if (segment === "profile") {
      continue;
    }

    // Skip settings from breadcrumbs
    if (segment === "settings") {
      continue;
    }

    // Dynamic segments (user IDs, etc.)
    if (i === segments.length - 1) {
      breadcrumbs.push({ label: segment, href: null });
    }
  }

  return breadcrumbs;
}
