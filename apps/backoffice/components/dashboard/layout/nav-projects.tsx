'use client'

import { Folder, MoreHorizontal, Settings, Share2 } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

export function NavProjects({
  projects,
}: {
  projects: Array<{
    name: string
    url: string
    slug: string
  }>
}) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()

  if (!projects || projects.length === 0) {
    return null
  }

  return (
    <SidebarGroup className="py-2">
      <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider">
        Projects
      </SidebarGroupLabel>
      <SidebarMenu className="mt-1">
        {projects.map((item) => {
          const isActive =
            pathname === item.url || pathname.startsWith(item.url + '/')
          return (
            <SidebarMenuItem key={item.slug}>
              <SidebarMenuButton asChild isActive={isActive}>
                <Link href={item.url} className="gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary text-xs font-semibold">
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium">{item.name}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More actions</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? 'bottom' : 'right'}
                  align={isMobile ? 'end' : 'start'}
                >
                  <DropdownMenuItem asChild>
                    <Link href={item.url} className="cursor-pointer text-sm">
                      <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>View Project</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${item.url}/install`}
                      className="cursor-pointer text-sm"
                    >
                      <Share2 className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Installation</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      href={`${item.url}/settings`}
                      className="cursor-pointer text-sm"
                    >
                      <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href="/projects" className="gap-3">
              <MoreHorizontal className="h-4 w-4 text-sidebar-foreground/50" />
              <span className="text-sm font-medium">View All Projects</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
