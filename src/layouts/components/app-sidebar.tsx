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
import { AdminSidebarContent } from '@/layouts/components/admin-sidebar-content'
import CommonSidebarContent from '@/layouts/components/common-sidebar-content.tsx'
import InvestorBalance from '@/layouts/components/investor-balance'
import { InvestorSidebarContent } from '@/layouts/components/investor-sidebar-content'
import UserSidebarDropdown from '@/layouts/components/user-sidebar-dropdown.tsx'
import { UserType } from '@/types/User.ts'
import { Link, useLocation } from 'react-router'

export function AppSidebar () {
  const appName = import.meta.env.VITE_APP_NAME
  const location = useLocation()

  const loggedInUser = useLoggedInUser()

  return (
    <Sidebar variant='inset' className='divide-y'>
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
          loggedInUser?.type === UserType.INVESTOR &&
          <InvestorSidebarContent />
        }
        {
          loggedInUser?.type === UserType.ADMIN &&
          <AdminSidebarContent />
        }
        <CommonSidebarContent />
      </SidebarContent>
      {loggedInUser && (
        <SidebarFooter>
          <SidebarMenuButton asChild>
            {loggedInUser?.type === UserType.INVESTOR && (
              <InvestorBalance />
            )}
          </SidebarMenuButton>
          <UserSidebarDropdown
            name={loggedInUser?.name}
            email={loggedInUser?.email}
          />
        </SidebarFooter>
      )}
    </Sidebar>
  )
}
