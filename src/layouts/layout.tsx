import { AppSidebar } from '@/components/sidebar/app-sidebar.tsx'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader
} from '@/components/ui/alert-dialog'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import useLoggedInUser from '@/hooks/use-loggedInUser'
import { type Investor, InvestorStatus, UserType } from '@/types/User'
import { AlertDialogTitle } from '@radix-ui/react-alert-dialog'
import { CircleAlertIcon, ClockIcon, OctagonXIcon } from 'lucide-react'
import { Link } from 'react-router'

export default function MainLayout ({
  breadcrumbs,
  children
}: Readonly<{
  breadcrumbs?: { label: string; href: string }[],
  children: React.ReactNode;
}>) {
  const loggedInUser = useLoggedInUser()

  const investorStatusTextMap: {
    pending: { title: string; icon: React.JSX.Element };
    correction: { title: string; icon: React.JSX.Element };
    denied: { title: string; icon: React.JSX.Element }
  } = {
    pending: {
      title: 'Pendiente de verificación',
      icon: <ClockIcon className='w-full h-full rounded-full text-yellow-600 bg-yellow-300/25 p-2'/>
    },
    correction: {
      title: 'Corrección requerida',
      icon: <CircleAlertIcon className='w-full h-full rounded-full text-red-600 bg-red-300/25 p-2'/>
    },
    denied: {
      title: 'Cuenta denegada',
      icon: <OctagonXIcon className='w-full h-full rounded-full text-zinc-600 bg-zinc-300/25 p-2'/>
    }
  }

  return (
    <SidebarProvider className='w-dvw h-dvh'>
      <AppSidebar />
      <div className='grow flex flex-col bg-background text-foreground md:m-2 md:rounded-lg md:shadow-md'>
        <div className='flex items-center gap-2 border-b p-2'>
          <SidebarTrigger className='p-2' />
          <span className='h-8 border-s'/>
          {breadcrumbs && (
            <Breadcrumb>
              <BreadcrumbList>
                {
                  breadcrumbs.slice(0, -1).map((breadcrumb, index) => (
                    <>
                      <BreadcrumbItem key={index}>
                        <BreadcrumbLink asChild>
                          <Link to={breadcrumb.href}>{breadcrumb.label}</Link>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </>
                  ))
                }
                <BreadcrumbItem className='text-foreground'>
                  {breadcrumbs[breadcrumbs.length - 1].label}
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </div>
        <section className='grow p-4 overflow-scroll max-w-dvw'>
          {children}
        </section>
      </div>
      {(
        (loggedInUser?.type === UserType.INVESTOR && (loggedInUser as Investor)?.status !== InvestorStatus.VERIFIED)
      ) && (
        <AlertDialog defaultOpen>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Actualización de la cuenta</AlertDialogTitle>
              <AlertDialogDescription>
                Comprueba el estado de tu cuenta y ejecuta las acciones necesarias:
              </AlertDialogDescription>
            </AlertDialogHeader>
            <Item variant='muted' className='gap-2'>
              <ItemMedia className='self-center! w-10 h-10'>
                {investorStatusTextMap[(loggedInUser as Investor)?.status as keyof typeof investorStatusTextMap].icon}
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{investorStatusTextMap[(loggedInUser as Investor)?.status as keyof typeof investorStatusTextMap].title}</ItemTitle>
                <ItemDescription>
                  {(loggedInUser as Investor)?.lastCommunication}
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
