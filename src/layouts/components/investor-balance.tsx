import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { AuthContext } from '@/contexts/auth.context'
import { formatCurrency } from '@/lib/format-currency'
import { connectBalanceSocket } from '@/services/bid.api'
import type { Investor } from '@/types/User'
import { EllipsisVerticalIcon, WalletIcon } from 'lucide-react'
import { useContext, useEffect } from 'react'
import { Link } from 'react-router'

export default function InvestorBalance () {
  const { isMobile } = useSidebar()
  const { loggedInUser, setLoggedInUser } = useContext(AuthContext)!
  const investor = loggedInUser as Investor

  useEffect(() => {
    if (!investor?.id) return
    const socket = connectBalanceSocket({
      onBalanceUpdate: (reservedBalance) => {

        setLoggedInUser((prev) => prev ? {
          ...prev,
          bankAccount: { ...(prev as Investor).bankAccount, reservedBalance }
        } : null)
      }
    })
    return () => { socket.disconnect() }
  }, [investor?.id, setLoggedInUser])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground p-0'
            >
              <Item className='p-0 gap-2' size='sm'>
                <ItemMedia variant='icon' className='bg-primary/20 text-primary'>
                  <WalletIcon className='size-4' />
                </ItemMedia>
                <ItemContent className='gap-0'>
                  <ItemTitle>Saldo disponible</ItemTitle>
                  <ItemDescription>{formatCurrency((investor?.bankAccount.balance || 0) - (investor?.bankAccount.reservedBalance || 0))}</ItemDescription>
                </ItemContent>
              </Item>
              <EllipsisVerticalIcon className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <span className='text-muted-foreground'>Saldo disponible</span>
                <span className='font-semibold text-primary'>{formatCurrency((investor?.bankAccount.balance || 0) - (investor?.bankAccount.reservedBalance || 0))}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <span className='text-muted-foreground'>Saldo contable</span>
                <span className='font-semibold'>{formatCurrency(investor?.bankAccount.balance || 0)}</span>
              </div>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <span className='text-muted-foreground'>Pujas pendientes</span>
                <span className='font-semibold text-destructive'>{formatCurrency(investor?.bankAccount.reservedBalance || 0)}</span>
              </div>

            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Button variant='secondary' size='sm' className='w-full' asChild>
                <Link to='/profile#bank-account'>
                  Ver cartera
                </Link>
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
