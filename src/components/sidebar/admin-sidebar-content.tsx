import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '@/components/ui/collapsible.tsx'
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
import {ChevronRight, FileText, Gavel, User} from 'lucide-react'
import {Badge} from '@/components/ui/badge.tsx'

export function AdminSidebarContent () {
  const pendingUsersCount = 200 // TODO: fetch pending users count
  const pendingAuctionsCount = 10 // TODO: fetch pending auctions count
  const pendingInvoicesCount = 20 // TODO: fetch pending invoices count

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarGroupLabel>Administración</SidebarGroupLabel>
        <SidebarMenu>
          <Collapsible className='group/collapsible'>
            <SidebarMenuItem>
              <CollapsibleTrigger asChild className={'group/collapsible'}>
                <SidebarMenuButton>
                  <User /> Usuarios
                  {pendingUsersCount > 0 && (
                    <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                  )}
                  <ChevronRight className='ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className={'m-0'}>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Todos los usuarios
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Usuarios para validar
                      {pendingUsersCount > 0 && (
                        <Badge variant={'destructive'} className={'ms-auto font-mono px-1'}>
                          {pendingUsersCount > 99 ? '+99' : pendingUsersCount}
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
                  <Gavel /> Subastas
                  {pendingAuctionsCount > 0 && (
                    <Badge variant={'destructive'} className={'relative -top-1 right-1 w-2 h-2 p-0 group-data-[state=open]/collapsible:hidden'} />
                  )}
                  <ChevronRight className='ms-auto transition-transform group-data-[state=open]/collapsible:rotate-90' />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub className={'m-0'}>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Todas las subastas
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Subastas para validar
                      {pendingAuctionsCount > 0 && (
                        <Badge variant={'destructive'} className={'ms-auto font-mono px-1'}>
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
                <SidebarMenuSub className={'m-0'}>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Todas las facturas
                    </SidebarMenuButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuButton>
                      Facturas para validar
                      {pendingInvoicesCount > 0 && (
                        <Badge variant={'destructive'} className={'ms-auto font-mono px-1'}>
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
