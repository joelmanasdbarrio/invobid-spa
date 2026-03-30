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
import { countAuctions } from '@/services/auction.api'
import { countDebtors } from '@/services/debtor.api'
import { countInvestors } from '@/services/investor.api.ts'
import { countInvoices } from '@/services/invoice.api'
import { AuctionStatus } from '@/types/Auction'
import { DebtorStatus } from '@/types/Debtor'
import { InvoiceStatus } from '@/types/Invoice'
import { InvestorStatus } from '@/types/User'
import { ChevronRightIcon, FileTextIcon, GavelIcon, HandCoinsIcon, UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

export function AdminSidebarContent () {
  const location = useLocation()

  const [pendingInvestorsCount, setPendingInvestorsCount] = useState(0)
  useEffect(() => {
    countInvestors({ status: InvestorStatus.PENDING }).then(res => {
      setPendingInvestorsCount(res.data)
    })
  }, [])

  const [pendingDebtorsCount, setPendingDebtorsCount] = useState(0)
  useEffect(() => {
    countDebtors({ status: DebtorStatus.PENDING }).then(res => {
      setPendingDebtorsCount(res.data)
    })
  }, [])

  const [pendingInvoicesCount, setPendingInvoicesCount] = useState(0)
  useEffect(() => {
    countInvoices({ status: InvoiceStatus.PENDING }).then(res => {
      setPendingInvoicesCount(res.data)
    })
  }, [])

  const [transitioningAuctionsCount, setTransitioningAuctionsCount] = useState(0)
  useEffect(() => {
    countAuctions({ status: AuctionStatus.TRANSITIONING }).then(res => {
      setTransitioningAuctionsCount(res.data)
    })
  }, [])

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
                <SidebarMenuButton isActive={location.pathname.startsWith('/admin/auctions')}>
                  <GavelIcon /> Subastas
                  {transitioningAuctionsCount > 0 && (
                    <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                  )}
                  <ChevronRightIcon className='ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className={'m-0 pe-0'}>
                  <SidebarMenuSubItem>
                    <Link to='/admin/auctions'>
                      <SidebarMenuButton>
                        Todas las subastas
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <Link to='/admin/auctions?status=transitioning'>
                      <SidebarMenuButton>
                        Subastas en transición
                        {transitioningAuctionsCount > 0 && (
                          <Badge variant={'destructive'} className={'ms-auto font-mono px-1.5'}>
                            {transitioningAuctionsCount > 99 ? '+99' : transitioningAuctionsCount}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </Link>
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
