import { SidebarProvider } from '@/components/ui/sidebar'
import { Outlet } from 'react-router'
import { AppSidebar } from './components/app-sidebar'
import { SidebarTriggerFixed } from './components/sidebar-trigger-fixed'

export function AuthenticatedLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <main className="relative container mx-auto flex-1 overflow-auto px-4 pt-5 pb-6 md:p-6 md:pl-16">
          <SidebarTriggerFixed />
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  )
}
