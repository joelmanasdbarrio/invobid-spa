import CommonSidebarContent from '@/components/sidebar/common-sidebar-content.tsx'
import UserSidebarDropdown from '@/components/sidebar/user-sidebar-dropdown.tsx'
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
import useLoggedInUser from '@/hooks/use-loggedInUser.ts'
import { type Investor, InvestorStatus, UserType } from '@/types/User.ts'
import { Link, useLocation } from 'react-router'
import { ModeToggle } from '../dark-mode/mode-toggle.tsx'
import { AdminSidebarContent } from './admin-sidebar-content'
import { InvestorSidebarContent } from './investor-sidebar-content'

export function AppSidebar () {
  const appName = import.meta.env.VITE_APP_NAME
  const location = useLocation()

  const loggedInUser = useLoggedInUser()

  return (
    <Sidebar variant='inset'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={'flex gap-2 items-center'}>
              <img src='/logo.png' alt={`${appName}'s logo`} className={'w-12'} />
              <h1 className='text-2xl font-bold'>{appName}</h1>
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
        {
          (loggedInUser?.type === UserType.INVESTOR && (loggedInUser as Investor)?.status === InvestorStatus.VERIFIED) &&
          <InvestorSidebarContent />
        }
        {
          loggedInUser?.type === UserType.ADMIN &&
          <AdminSidebarContent />
        }
        <CommonSidebarContent />
      </SidebarContent>
      <SidebarFooter>
        <UserSidebarDropdown
          name={loggedInUser?.name}
          email={loggedInUser?.email}
        />
        <ModeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
