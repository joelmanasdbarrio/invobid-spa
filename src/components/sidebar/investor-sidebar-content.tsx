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
import { countCorrectionDebtors } from '@/services/debtor.api'
import { countCorrectionInvoices } from '@/services/invoice.api'
import { InvestorType, type Investor } from '@/types/User'
import { ChevronRight, ChevronRightIcon, FileText, Gavel, HandCoinsIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'

export function InvestorSidebarContent () {
  const location = useLocation()
  const loggedInUser = useLoggedInUser()

  const [correctionDebtorsCount, setCorrectionDebtorsCount] = useState(0)
  useEffect(() => {
    countCorrectionDebtors({ investorId: loggedInUser?.id ?? '' }).then(res => {
      setCorrectionDebtorsCount(res.data)
    })
  }, [loggedInUser?.id])

  const [correctionInvoicesCount, setCorrectionInvoicesCount] = useState(0)
  useEffect(() => {
    countCorrectionInvoices({ investorId: loggedInUser?.id ?? '' }).then(res => {
      setCorrectionInvoicesCount(res.data)
    })
  }, [loggedInUser?.id])

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarGroupLabel>Inversión</SidebarGroupLabel>

        <SidebarMenu>
          {
            (loggedInUser && (loggedInUser as Investor).investorType === InvestorType.COMPANY) && (
              <Collapsible className='group/collapsible' defaultOpen={location.pathname.startsWith('/debtors')}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild className={'group/collapsible'}>
                    <SidebarMenuButton isActive={location.pathname.startsWith('/debtors')}>
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
                          <SidebarMenuButton>
                            Mis deudores
                            {correctionDebtorsCount > 0 && (
                              <Badge variant={'destructive'} className={'ms-auto font-mono px-1.5'}>
                                {correctionDebtorsCount > 99 ? '+99' : correctionDebtorsCount}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            )
          }

          <Collapsible className='group/collapsible'>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className={'group/collapsible'}>
                <SidebarMenuButton>
                  <FileText /> Facturas
                  {(loggedInUser && (loggedInUser as Investor).investorType === InvestorType.COMPANY) && correctionInvoicesCount > 0 && (
                    <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                  )}
                  <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className={'m-0 pe-0'}>
                  {loggedInUser && (loggedInUser as Investor).investorType === InvestorType.COMPANY && (
                    <SidebarMenuSubItem>
                      <Link to='/invoices'>
                        <SidebarMenuButton>
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
                    <SidebarMenuButton>
                      Invertidas
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
                  <Gavel /> Subastas
                  <ChevronRight className='ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className={'m-0 pe-0'}>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Disponibles
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Publicadas
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Invertidas
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
