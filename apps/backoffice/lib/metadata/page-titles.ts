/**
 * Page Title Configuration
 *
 * Centralized configuration for page titles across the backoffice
 */

export interface PageTitleConfig {
  title: string;
  description?: string;
}

/**
 * Route to title mapping
 */
export const pageTitles: Record<string, PageTitleConfig> = {
  // Root / Dashboard
  "/": {
    title: "Dashboard",
    description: "Overview and statistics",
  },

  // Analytics
  "/analytics": {
    title: "Analytics",
    description: "Detailed analytics and reports",
  },

  // Services
  "/services": {
    title: "Services",
    description: "Manage services",
  },
  "/services/categories": {
    title: "Service Categories",
    description: "Manage service categories",
  },
  "/services/new": {
    title: "New Service",
    description: "Create a new service",
  },

  // Users & Access Management
  "/manage/users": {
    title: "Users",
    description: "Manage user accounts",
  },
  "/manage/roles": {
    title: "Roles",
    description: "Manage user roles",
  },
  "/manage/permissions": {
    title: "Permissions",
    description: "Manage system permissions",
  },
  "/manage/system-settings": {
    title: "System Settings",
    description: "Configure system settings",
  },

  // Profile & Settings
  "/profile": {
    title: "Profile",
    description: "Manage your profile",
  },
  "/settings": {
    title: "Settings",
    description: "Account settings",
  },
};

/**
 * Get page title configuration for a given pathname
 * Falls back to generic title if not found
 */
export function getPageTitle(pathname: string): PageTitleConfig {
  // Direct match
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }

  // Handle dynamic routes (e.g., /services/edit/[id])
  if (pathname.startsWith("/services/edit/")) {
    return {
      title: "Edit Service",
      description: "Edit service details",
    };
  }

  // Handle other patterns
  const segments = pathname.split("/").filter(Boolean);

  // Services category pattern
  if (segments[0] === "services" && segments[1] === "categories") {
    return {
      title: "Service Categories",
      description: "Manage service categories",
    };
  }

  // Manage section pattern
  if (segments[0] === "manage") {
    const section = segments[1];
    return {
      title: section
        ? section
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
        : "Manage",
      description: `Manage ${section || "items"}`,
    };
  }

  // Default fallback
  return {
    title: "Dashboard",
    description: "Naiera Backoffice",
  };
}

/**
 * Generate full page title with app name
 */
export function getFullPageTitle(pathname: string): string {
  const config = getPageTitle(pathname);
  return `${config.title} | Naiera Backoffice`;
}
