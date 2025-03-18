import { SidebarProvider } from '@/components/ui/sidebar'
import { ROUTES } from '@/lib/constants'
import { api } from '@convex/_generated/api'
import { useConvexAuth, useQuery } from 'convex/react'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'
import { generatePath, Outlet, useNavigate } from 'react-router'
import { AppSidebar } from './components/app-sidebar'
import { SidebarTriggerFixed } from './components/sidebar-trigger-fixed'

export function AuthenticatedLayout() {
  const user = useQuery(api.users.queries.getCurrentUser)
  const state = useConvexAuth()
  const isLoading = user === undefined || state.isLoading
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !user) {
      void navigate(generatePath(ROUTES.login))
    }
  }, [isLoading, user, navigate])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-10 animate-spin" />
      </div>
    )
  }

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
