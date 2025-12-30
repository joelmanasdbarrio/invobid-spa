import { Badge } from '@/components/ui/badge.tsx'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible.tsx'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem
} from '@/components/ui/sidebar.tsx'
import { countPendingInvestors } from '@/services/investor.api.ts'
import { ChevronRight, FileText, Gavel, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

export function AdminSidebarContent () {
  const location = useLocation()

  const [pendingInvestorsCount, setPendingInvestorsCount] = useState(0)
  useEffect(() => {
    countPendingInvestors().then(res => {
      setPendingInvestorsCount(res.data)
    })
  }, [])

  const pendingAuctionsCount = 0 // TODO: fetch pending auctions count
  const pendingInvoicesCount = 0 // TODO: fetch pending invoices count

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarGroupLabel>Administración</SidebarGroupLabel>
        <SidebarMenu>
          <Collapsible className='group/collapsible' defaultOpen={location.pathname.startsWith('/admin/users')}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className={'group/collapsible'}>
                <SidebarMenuButton isActive={location.pathname.startsWith('/admin/users')}>
                  <User /> Usuarios
                  {pendingInvestorsCount > 0 && (
                    <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                  )}
                  <ChevronRight className='ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className={'m-0 pe-0'}>
                  <SidebarMenuSubItem>
                    <Link to='/admin/users'>
                      <SidebarMenuButton>
                        Todos los usuarios
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <Link to='/admin/users?status=pending'>
                      <SidebarMenuButton>
                        Usuarios para validar
                        {pendingInvestorsCount > 0 && (
                          <Badge variant={'destructive'} className={'ms-auto font-mono px-1.5'}>
                            {pendingInvestorsCount > 99 ? '+99' : pendingInvestorsCount}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          <Collapsible className='group/collapsible'>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className={'group/collapsible'}>
                <SidebarMenuButton>
                  <Gavel /> Subastas
                  {pendingAuctionsCount > 0 && (
                    <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                  )}
                  <ChevronRight className='ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className={'m-0 pe-0'}>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Todas las subastas
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Subastas para validar
                      {pendingAuctionsCount > 0 && (
                        <Badge variant={'destructive'} className={'ms-auto font-mono px-1.5'}>
                          {pendingAuctionsCount > 99 ? '+99' : pendingAuctionsCount}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          <Collapsible className='group/collapsible'>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className={'group/collapsible'}>
                <SidebarMenuButton>
                  <FileText /> Facturas
                  {pendingInvoicesCount > 0 && (
                    <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                  )}
                  <ChevronRight className='ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className={'m-0 pe-0'}>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Todas las facturas
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Facturas para validar
                      {pendingInvoicesCount > 0 && (
                        <Badge variant={'destructive'} className={'ms-auto font-mono px-1.5'}>
                          {pendingInvoicesCount > 99 ? '+99' : pendingInvoicesCount}
                        </Badge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
