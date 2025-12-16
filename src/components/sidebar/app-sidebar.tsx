import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar.tsx'
import {ModeToggle} from '../dark-mode/mode-toggle.tsx'
import {InvestorSidebarContent} from './investor-sidebar-content'
import {AdminSidebarContent} from './admin-sidebar-content'
import CommonSidebarContent from '@/components/sidebar/common-sidebar-content.tsx'
import UserSidebarDropdown from '@/components/sidebar/user-sidebar-dropdown.tsx'
import {Link, useLocation} from 'react-router'

export function AppSidebar () {
  const appName = import.meta.env.VITE_APP_NAME
  const location = useLocation()

  return (
    <Sidebar variant='inset'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={'flex gap-2 items-center'}>
              <img src='/logo.png' alt={`${appName?.toUpperCase()}'s logo`} className={'w-12'} />
              <h1 className='text-2xl font-bold'>{appName?.toUpperCase()}</h1>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarGroupLabel>General</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link to='/'>
                  <SidebarMenuButton isActive={location.pathname === '/'} className='hover:cursor-pointer'>
                    Dashboard
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <InvestorSidebarContent />
        <AdminSidebarContent />
        <CommonSidebarContent />
      </SidebarContent>
      <SidebarFooter>
        <UserSidebarDropdown
          user={{
            name: 'Charlie Kirk',
            email: 'mail@mail.com',
            avatar: '/avatar.png'
          }}
        />
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
