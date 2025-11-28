import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader
} from '@/components/ui/sidebar'

export function AppSidebar () {
  return (
    <Sidebar>
      <SidebarHeader>
        Header
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          Group 1
        </SidebarGroup>
        <SidebarGroup>
          Group 2
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        Footer
      </SidebarFooter>
    </Sidebar>
  )
}
