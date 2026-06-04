import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader
} from '@/components/ui/alert-dialog'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { AppSidebar } from '@/layouts/components/app-sidebar'
import { type Investor, InvestorStatus, UserType } from '@/types/User'
import { AlertDialogTitle } from '@radix-ui/react-alert-dialog'
import { CircleAlertIcon, ClockIcon, OctagonXIcon } from 'lucide-react'
import { Fragment } from 'react'
import { Link } from 'react-router'

const INVESTOR_STATUS_TEXT_MAP = {
  pending: {
    title: 'Pendiente de verificacion',
    icon: <ClockIcon className='w-full h-full rounded-full text-yellow-600 bg-yellow-300/25 p-2' />
  },
  correction: {
    title: 'Correccion requerida',
    icon: <CircleAlertIcon className='w-full h-full rounded-full text-red-600 bg-red-300/25 p-2' />
  },
  denied: {
    title: 'Cuenta denegada',
    icon: <OctagonXIcon className='w-full h-full rounded-full text-zinc-600 bg-zinc-300/25 p-2' />
  }
} as const

type MainLayoutProps = Readonly<{
  breadcrumbs?: Array<{ label: string; href: string }>
  children: React.ReactNode
}>

export default function MainLayout ({
  breadcrumbs,
  children
}: MainLayoutProps) {
  const loggedInUser = useLoggedInUser()

  const investorStatus =
    loggedInUser?.type === UserType.INVESTOR
      ? (loggedInUser as Investor).status
      : undefined

  const investorStatusText =
    investorStatus && investorStatus in INVESTOR_STATUS_TEXT_MAP
      ? INVESTOR_STATUS_TEXT_MAP[investorStatus as keyof typeof INVESTOR_STATUS_TEXT_MAP]
      : undefined

  return (
    <SidebarProvider>
      <AppSidebar />
      <div className='w-full h-screen flex flex-col'>
        <div className='flex items-center gap-2 border-b p-2'>
          <SidebarTrigger className='p-2' />
          {investorStatusText && (
            <span className='size-7'>
              {investorStatusText.icon}
            </span>
          )}
          {breadcrumbs && (
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.slice(0, -1).map((breadcrumb, index) => (
                  <Fragment key={index}>
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </Fragment>
                ))}
                <BreadcrumbItem className='text-foreground'>
                  {breadcrumbs[breadcrumbs.length - 1].label}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>
        <section className='grow p-4 h-full max-w-dvw overflow-scroll'>
          {children}
        </section>
      </div>
      {(
        loggedInUser?.type === UserType.INVESTOR &&
        (loggedInUser as Investor).status !== InvestorStatus.VERIFIED
      ) && (
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Actualizacion de la cuenta</AlertDialogTitle>
              <AlertDialogDescription>
                Compruebe el estado de su cuenta y ejecute las acciones necesarias. Una vez corregida la incidencia, solicite nuevamente la verificacion.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Item variant='muted' className='gap-2'>
              <ItemMedia className='self-center! size-10'>
                {investorStatusText?.icon}
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{investorStatusText?.title}</ItemTitle>
                <ItemDescription>
                  {(loggedInUser as Investor).lastCommunication}
                </ItemDescription>
              </ItemContent>
            </Item>
            <AlertDialogFooter>
              <AlertDialogAction>Aceptar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </SidebarProvider>
  )
}
