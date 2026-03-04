import {
  type LucideIcon,
  LayoutDashboard,
  BarChart3,
  FolderOpen,
  Folders,
  Users,
  Shield,
  Key,
  Settings,
  FileEdit,
  Plus,
  UserCog,
} from "lucide-react";

export interface PageTitle {
  title: string;
  icon: LucideIcon;
}

export function getPageTitle(pathname: string): PageTitle {
  const pathSegments = pathname.split("/").filter(Boolean);

  // Root / Dashboard
  if (pathSegments.length === 0) {
    return { title: "Dashboard", icon: LayoutDashboard };
  }

  const firstSegment = pathSegments[0];

  // Analytics
  if (firstSegment === "analytics") {
    return { title: "Analytics", icon: BarChart3 };
  }

  // Services
  if (firstSegment === "services") {
    const secondSegment = pathSegments[1];

    if (secondSegment === "categories") {
      return { title: "Categories", icon: Folders };
    }

    if (secondSegment === "new") {
      return { title: "New Service", icon: Plus };
    }

    if (secondSegment === "edit") {
      return { title: "Edit Service", icon: FileEdit };
    }

    return { title: "Services", icon: FolderOpen };
  }

  // Manage section
  if (firstSegment === "manage") {
    const manageItem = pathSegments[1];

    switch (manageItem) {
      case "users":
        return { title: "Users", icon: Users };
      case "roles":
        return { title: "Roles", icon: Shield };
      case "permissions":
        return { title: "Permissions", icon: Key };
      case "system-settings":
        return { title: "System Settings", icon: Settings };
      default:
        return { title: "Management", icon: Settings };
    }
  }

  // Profile & Settings
  if (firstSegment === "profile") {
    return { title: "Profile", icon: UserCog };
  }

  if (firstSegment === "settings") {
    return { title: "Settings", icon: Settings };
  }

  // Default fallback
  return { title: "Dashboard", icon: LayoutDashboard };
}
