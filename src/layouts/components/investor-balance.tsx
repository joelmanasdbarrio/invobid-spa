import { Button } from '@/components/ui/button'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { AuthContext } from '@/contexts/auth.context'
import { formatCurrency } from '@/lib/format-currency'
import { connectBalanceSocket } from '@/services/bid.api'
import type { Investor } from '@/types/User'
import { WalletIcon } from 'lucide-react'
import { useContext, useEffect } from 'react'
import { Link } from 'react-router'

export default function InvestorBalance () {
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
    <HoverCard openDelay={10} closeDelay={100}>
      <HoverCardTrigger className='rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'>
        <Item className='p-0 gap-2' size='sm'>
          <ItemMedia variant='icon' className='bg-primary/20 text-primary'>
            <WalletIcon className='size-4' />
          </ItemMedia>
          <ItemContent className='gap-0'>
            <ItemTitle>Saldo disponible</ItemTitle>
            <ItemDescription>{formatCurrency((investor?.bankAccount.balance || 0) - (investor?.bankAccount.reservedBalance || 0))}</ItemDescription>
          </ItemContent>
        </Item>
      </HoverCardTrigger>

      <HoverCardContent className='grid grid-cols-2 gap-2 w-max'>
        <span className='text-muted-foreground'>Saldo contable</span>
        <span className='font-semibold'>{formatCurrency(investor?.bankAccount.balance || 0)}</span>

        <span className='text-muted-foreground'>Pujas pendientes</span>
        <span className='font-semibold text-destructive'>{formatCurrency(investor?.bankAccount.reservedBalance || 0)}</span>

        <Separator className='col-span-2' />

        <span className='text-muted-foreground'>Saldo disponible</span>
        <span className='font-semibold text-primary'>{formatCurrency((investor?.bankAccount.balance || 0) - (investor?.bankAccount.reservedBalance || 0))}</span>

        <div className='col-span-2'>
          <Button variant='secondary' size='sm' className='w-full' asChild>
            <Link to='/profile#bank-account'>
              Ver cartera
            </Link>
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
