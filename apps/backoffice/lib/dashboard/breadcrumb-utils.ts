export interface BreadcrumbItem {
  label: string;
  href: string | null;
  icon?: React.ComponentType<{ className?: string }>;
}

export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return [{ label: "Dashboard", href: "/", icon: undefined }];
  }

  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/", icon: undefined },
  ];

  // Build breadcrumb path based on segments
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];

    // Analytics
    if (segment === "analytics") {
      breadcrumbs.push({ label: "Analytics", href: "/analytics" });
      continue;
    }

    // Services section
    if (segment === "services") {
      const nextSegment = segments[i + 1];

      if (nextSegment === "categories") {
        breadcrumbs.push({ label: "Services", href: "/services" });
        breadcrumbs.push({ label: "Categories", href: "/services/categories" });
        i++; // Skip next segment as we already processed it
        continue;
      }

      if (nextSegment === "new") {
        breadcrumbs.push({ label: "Services", href: "/services" });
        breadcrumbs.push({ label: "New Service", href: "/services/new" });
        i++; // Skip next segment
        continue;
      }

      if (nextSegment === "edit") {
        breadcrumbs.push({ label: "Services", href: "/services" });
        breadcrumbs.push({ label: "Edit Service", href: null });
        i += 2; // Skip "edit" and the ID
        continue;
      }

      breadcrumbs.push({ label: "Services", href: "/services" });
      continue;
    }

    // Manage section
    if (segment === "manage") {
      const manageItem = segments[i + 1];

      if (manageItem === "users") {
        breadcrumbs.push({ label: "Users", href: "/manage/users" });
        i++; // Skip next segment
        continue;
      }

      if (manageItem === "roles") {
        breadcrumbs.push({ label: "Roles", href: "/manage/roles" });
        i++; // Skip next segment
        continue;
      }

      if (manageItem === "permissions") {
        breadcrumbs.push({ label: "Permissions", href: "/manage/permissions" });
        i++; // Skip next segment
        continue;
      }

      if (manageItem === "system-settings") {
        breadcrumbs.push({ label: "System Settings", href: "/manage/system-settings" });
        i++; // Skip next segment
        continue;
      }

      breadcrumbs.push({ label: "Management", href: null });
      continue;
    }

    // Profile
    if (segment === "profile") {
      breadcrumbs.push({ label: "Profile", href: "/profile" });
      continue;
    }

    // Settings
    if (segment === "settings") {
      breadcrumbs.push({ label: "Settings", href: "/settings" });
      continue;
    }

    // Dynamic segments (user IDs, etc.)
    if (i === segments.length - 1) {
      breadcrumbs.push({ label: segment || "", href: null });
    }
  }

  return breadcrumbs;
}
