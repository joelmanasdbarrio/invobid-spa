import { Badge } from '@/components/ui/badge'
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
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { countDebtors } from '@/services/debtor.api'
import { countInvoices } from '@/services/invoice.api'
import { DebtorStatus } from '@/types/Debtor'
import { InvoiceStatus } from '@/types/Invoice'
import { InvestorStatus, InvestorType, type Investor } from '@/types/User'
import { ChevronRight, ChevronRightIcon, FileText, Gavel, HandCoinsIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

export function InvestorSidebarContent () {
  const location = useLocation()
  const loggedInUser = useLoggedInUser() as Investor
  const [isDisabled] = useState(!loggedInUser?.status.includes(InvestorStatus.VERIFIED))

  const [correctionDebtorsCount, setCorrectionDebtorsCount] = useState(0)
  useEffect(() => {
    if (loggedInUser?.investorType !== InvestorType.COMPANY) return
    countDebtors({ status: DebtorStatus.CORRECTION, investorId: loggedInUser?.id ?? '' }).then(res => {
      setCorrectionDebtorsCount(res.data)
    })
  }, [loggedInUser])

  const [correctionInvoicesCount, setCorrectionInvoicesCount] = useState(0)
  useEffect(() => {
    if (loggedInUser?.investorType !== InvestorType.COMPANY) return
    countInvoices({ status: InvoiceStatus.CORRECTION, investorId: loggedInUser?.id ?? '' }).then(res => {
      setCorrectionInvoicesCount(res.data)
    })
  }, [loggedInUser])

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarGroupLabel>Inversión</SidebarGroupLabel>
        <SidebarMenu>
          <Collapsible className='group/collapsible' disabled={isDisabled} defaultOpen={location.pathname.startsWith('/marketplace/auctions')}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton isActive={location.pathname.startsWith('/marketplace/auctions')}>
                  <Gavel /> Subastas
                  <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className={'m-0 pe-0'}>
                  <SidebarMenuSubItem>
                    <Link to='/marketplace/auctions'>
                      <SidebarMenuButton>
                        Disponibles
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <Link to='/marketplace/auctions?hasBidded=true'>
                      <SidebarMenuButton>
                        Pujadas
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          <Collapsible className='group/collapsible' disabled={isDisabled}>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton>
                  <FileText /> Facturas
                  <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className={'m-0 pe-0'}>
                  <SidebarMenuSubItem>
                    <Link to='/marketplace/invoices'>
                      <SidebarMenuButton isActive={location.pathname.startsWith('/marketplace/invoices')}>
                        Adquiridas
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        </SidebarMenu>
      </SidebarGroupContent>
      {loggedInUser?.investorType === InvestorType.COMPANY && (
        <SidebarGroupContent>
          <SidebarGroupLabel>Gestión</SidebarGroupLabel>
          <SidebarMenu>
            {(loggedInUser && loggedInUser.investorType === InvestorType.COMPANY) && (
              <Collapsible className='group/collapsible' defaultOpen={location.pathname.startsWith('/debtors')} disabled={isDisabled}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild className={'group/collapsible'}>
                    <SidebarMenuButton>
                      <HandCoinsIcon /> Deudores
                      {correctionDebtorsCount > 0 && (
                        <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                      )}
                      <ChevronRightIcon className='ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className={'m-0 pe-0'}>
                      <SidebarMenuSubItem>
                        <Link to='/debtors'>
                          <SidebarMenuButton isActive={location.pathname === '/debtors'}>
                            Mis deudores
                            {correctionDebtorsCount > 0 && (
                              <Badge variant={'destructive'} className={'ms-auto font-mono px-1.5'}>
                                {correctionDebtorsCount > 99 ? '+99' : correctionDebtorsCount}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link to='/debtors/create'>
                          <SidebarMenuButton isActive={location.pathname === '/debtors/create'}>
                            Nuevo deudor
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )}

            <Collapsible className='group/collapsible' defaultOpen={location.pathname.startsWith('/invoices')} disabled={isDisabled}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild className={'group/collapsible'}>
                  <SidebarMenuButton>
                    <FileText /> Facturas
                    {(loggedInUser && loggedInUser.investorType === InvestorType.COMPANY) && correctionInvoicesCount > 0 && (
                      <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                    )}
                    <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className={'m-0 pe-0'}>
                    {loggedInUser && loggedInUser.investorType === InvestorType.COMPANY && (
                      <SidebarMenuSubItem>
                        <Link to='/invoices'>
                          <SidebarMenuButton isActive={location.pathname === '/invoices'}>
                            Mis facturas
                            {correctionInvoicesCount > 0 && (
                              <Badge variant={'destructive'} className={'ms-auto font-mono px-1.5'}>
                                {correctionInvoicesCount > 99 ? '+99' : correctionInvoicesCount}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuSubItem>
                    )}
                    <SidebarMenuSubItem>
                      <Link to='/invoices/create'>
                        <SidebarMenuButton isActive={location.pathname === '/invoices/create'}>
                          Nueva factura
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>

            <Collapsible className='group/collapsible' disabled={isDisabled}>
              <SidebarMenuItem>
                <CollapsibleTrigger asChild className={'group/collapsible'}>
                  <SidebarMenuButton>
                    <Gavel /> Subastas
                    <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className={'m-0 pe-0'}>
                    <SidebarMenuSubItem>
                      <Link to='/auctions'>
                        <SidebarMenuButton isActive={location.pathname === '/auctions'}>
                          Mis subastas
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <Link to='/auctions/create'>
                        <SidebarMenuButton isActive={location.pathname === '/auctions/create'}>
                          Nueva subasta
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  )
}
