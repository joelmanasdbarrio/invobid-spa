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
import { countPendingDebtors } from '@/services/debtor.api'
import { countPendingInvestors } from '@/services/investor.api.ts'
import { countPendingInvoices } from '@/services/invoice.api'
import { ChevronRightIcon, FileTextIcon, GavelIcon, HandCoinsIcon, UserIcon } from 'lucide-react'
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

  const [pendingDebtorsCount, setPendingDebtorsCount] = useState(0)
  useEffect(() => {
    countPendingDebtors().then(res => {
      setPendingDebtorsCount(res.data)
    })
  }, [])

  const [pendingInvoicesCount, setPendingInvoicesCount] = useState(0)
  useEffect(() => {
    countPendingInvoices().then(res => {
      setPendingInvoicesCount(res.data)
    })
  }, [])

  const pendingAuctionsCount = 0 // TODO: fetch pending auctions count

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarGroupLabel>Administración</SidebarGroupLabel>
        <SidebarMenu>

          <Collapsible className='group/collapsible' defaultOpen={location.pathname.startsWith('/admin/users')}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className={'group/collapsible'}>
                <SidebarMenuButton isActive={location.pathname.startsWith('/admin/users')}>
                  <UserIcon /> Usuarios
                  {pendingInvestorsCount > 0 && (
                    <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                  )}
                  <ChevronRightIcon className='ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
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

          <Collapsible className='group/collapsible' defaultOpen={location.pathname.startsWith('/admin/debtors')}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className={'group/collapsible'}>
                <SidebarMenuButton isActive={location.pathname.startsWith('/admin/debtors')}>
                  <HandCoinsIcon /> Deudores
                  {pendingDebtorsCount > 0 && (
                    <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                  )}
                  <ChevronRightIcon className='ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className={'m-0 pe-0'}>
                  <SidebarMenuSubItem>
                    <Link to='/admin/debtors'>
                      <SidebarMenuButton>
                        Todos los deudores
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <Link to='/admin/debtors?status=pending'>
                      <SidebarMenuButton>
                        Deudores para validar
                        {pendingDebtorsCount > 0 && (
                          <Badge variant={'destructive'} className={'ms-auto font-mono px-1.5'}>
                            {pendingDebtorsCount > 99 ? '+99' : pendingDebtorsCount}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          <Collapsible className='group/collapsible' defaultOpen={location.pathname.startsWith('/admin/invoices')}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className={'group/collapsible'}>
                <SidebarMenuButton isActive={location.pathname.startsWith('/admin/invoices')}>
                  <FileTextIcon /> Facturas
                  {pendingInvoicesCount > 0 && (
                    <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                  )}
                  <ChevronRightIcon className='ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className={'m-0 pe-0'}>
                  <SidebarMenuSubItem>
                    <Link to='/admin/invoices'>
                      <SidebarMenuButton>
                        Todas las facturas
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <Link to='/admin/invoices?status=pending'>
                      <SidebarMenuButton>
                        Facturas para validar
                        {pendingInvoicesCount > 0 && (
                          <Badge variant={'destructive'} className={'ms-auto font-mono px-1.5'}>
                            {pendingInvoicesCount > 99 ? '+99' : pendingInvoicesCount}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>

          <Collapsible className='group/collapsible' defaultOpen={location.pathname.startsWith('/admin/auctions')}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className={'group/collapsible'}>
                <SidebarMenuButton>
                  <GavelIcon /> Subastas
                  {pendingAuctionsCount > 0 && (
                    <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                  )}
                  <ChevronRightIcon className='ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
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
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
