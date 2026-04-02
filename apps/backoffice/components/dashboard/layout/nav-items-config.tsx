import {
  LayoutDashboard,
  LifeBuoy,
  CheckSquare,
  FolderKanban,
  Users,
  Shield,
  Key,
  Settings,
  Bell,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  requiredPermission?: string
  items?: NavItem[]
}

/**
 * Navigation items configuration for Naiera Support dashboard.
 * Items are filtered based on user permissions via the NavMain component.
 */
export const navItemsConfig: NavItem[] = [
  // Overview Group
  {
    title: 'Dashboard',
    url: '/',
    icon: LayoutDashboard,
    isActive: true,
    requiredPermission: undefined, // No permission required for dashboard
  },

  // Work Management
  {
    title: 'Tasks',
    url: '/tasks',
    icon: CheckSquare,
    requiredPermission: undefined, // Tasks are available to all authenticated users
  },
  {
    title: 'Tickets',
    url: '/tickets',
    icon: LifeBuoy,
    requiredPermission: 'TICKET_VIEW_ALL', // Need ticket view permission
  },
  {
    title: 'Apps',
    url: '/apps',
    icon: FolderKanban,
    requiredPermission: 'TICKET_APP_VIEW', // Need app management permission
  },

  // User & Access Management
  {
    title: 'Access Requests',
    url: '/access-requests',
    icon: Bell,
    requiredPermission: 'TICKET_APP_APPROVE', // Need approval permission
  },
  {
    title: 'Manage',
    url: '/manage',
    icon: Users,
    requiredPermission: 'ADMIN_USERS_MANAGE', // Need at least user management
    items: [
      {
        title: 'Users',
        url: '/manage/users',
        requiredPermission: 'ADMIN_USERS_MANAGE',
      },
      {
        title: 'Roles',
        url: '/manage/roles',
        requiredPermission: 'ADMIN_ROLES_MANAGE',
      },
      {
        title: 'Permissions',
        url: '/manage/permissions',
        requiredPermission: 'ADMIN_PERMISSIONS_MANAGE',
      },
    ],
  },

  // Settings
  {
    title: 'Settings',
    url: '/settings',
    icon: Settings,
    requiredPermission: undefined, // User settings available to all
  },
]
