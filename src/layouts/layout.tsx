import { AppSidebar } from '@/components/sidebar/app-sidebar.tsx'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default function MainLayout ({
  header,
  children
}: Readonly<{
  header: string;
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className='w-dvw! h-dvh!'>
      <AppSidebar />
      <div className='grow flex flex-col bg-background text-foreground md:m-2 md:rounded-lg md:shadow-md overflow-scroll'>
        <div className='flex items-center gap-2 border-b p-2'>
          <SidebarTrigger className='p-2' />
          <span className='h-8 border-s'/>
          <h1 className='text-2xl font-bold'>{header}</h1>
        </div>
        <section className='grow p-4 overflow-scroll'>
          {children}
        </section>
      </div>
    </SidebarProvider>
  )
}
