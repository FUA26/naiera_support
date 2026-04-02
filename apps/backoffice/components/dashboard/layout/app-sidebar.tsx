'use client'

import * as React from 'react'
import {
  LifeBuoy,
  Send,
  Layers,
} from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar'
import { NavMain } from './nav-main'
import { NavProjects } from './nav-projects'
import { NavSecondary } from './nav-secondary'
import { navItemsConfig } from './nav-items-config'

const navSecondaryItems = [
  {
    title: 'Support',
    url: 'https://github.com/anthropics/claude-code/issues',
    icon: LifeBuoy,
  },
  {
    title: 'Feedback',
    url: 'https://github.com/anthropics/claude-code/issues',
    icon: Send,
  },
]

export function AppSidebar({
  projects = [],
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  projects?: Array<{
    name: string
    url: string
    slug: string
  }>
}) {
  return (
    <Sidebar collapsible="icon" className="border-r border-border" {...props}>
      <SidebarHeader className="py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="h-14 data-[active=true]:bg-primary/5 rounded-xl"
            >
              <a href="/" className="gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-base font-bold tracking-tight">
                    Naiera Support
                  </span>
                  <span className="truncate text-xs font-medium opacity-60">
                    {projects.length > 0
                      ? `${projects.length} project${projects.length > 1 ? 's' : ''}`
                      : 'No projects'}
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavMain items={navItemsConfig} />
        <SidebarSeparator className="mx-2 my-2 bg-sidebar-border/50" />
        <NavProjects projects={projects} />
        <SidebarSeparator className="mx-2 my-2 bg-sidebar-border/50" />
        <NavSecondary items={navSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
