import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { ROUTES } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { useAuthActions } from '@convex-dev/auth/react'
import { api } from '@convex/_generated/api'
import { useQuery } from 'convex/react'
import { BookOpen, Home, LogOut, Settings, Star, User } from 'lucide-react'
import { generatePath, Link, useLocation } from 'react-router'

export function AppSidebar() {
  const location = useLocation()
  const { signOut } = useAuthActions()
  const { isMobile, toggleSidebar } = useSidebar()
  const user = useQuery(api.users.queries.getCurrentUser)

  const stories = useQuery(api.stories.queries.getStories)

  const favoriteStories = stories?.filter((story) => story.isFavorite) ?? []
  const nonFavoriteStories = stories?.filter((story) => !story.isFavorite) ?? []

  const recentStories = [...nonFavoriteStories].sort(
    (a, b) => b.createdAt - a.createdAt
  )

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Link
            to={generatePath(ROUTES.dashboard)}
            className="flex items-center gap-2"
          >
            <BookOpen className="text-primary size-6" />
            <span className="text-xl font-bold">StoryTime</span>
          </Link>
          {!isMobile && <SidebarTrigger />}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === ROUTES.dashboard}
            >
              <Link to={ROUTES.dashboard}>
                <Home className="size-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={location.pathname === ROUTES.settings}
            >
              <Link to={ROUTES.settings}>
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {favoriteStories.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sidebar-foreground/60 mb-2 px-4 text-xs font-medium">
              Favorite Stories
            </h3>
            <SidebarMenu>
              {favoriteStories.map((story) => (
                <SidebarMenuItem key={story._id}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname ===
                      generatePath(ROUTES.storyDetail, { id: story._id })
                    }
                  >
                    <Link
                      to={generatePath(ROUTES.storyDetail, { id: story._id })}
                      onClick={() => (isMobile ? toggleSidebar() : undefined)}
                    >
                      <Star className="size-4 fill-yellow-500 text-yellow-500" />
                      <span className="truncate">{story.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        )}

        {recentStories.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sidebar-foreground/60 mb-2 px-4 text-xs font-medium">
              Recent Stories
            </h3>
            <SidebarMenu>
              {recentStories.slice(0, 5).map((story) => (
                <SidebarMenuItem key={story._id}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname ===
                      generatePath(ROUTES.storyDetail, { id: story._id })
                    }
                  >
                    <Link
                      to={generatePath(ROUTES.storyDetail, { id: story._id })}
                      onClick={() => (isMobile ? toggleSidebar() : undefined)}
                    >
                      <BookOpen className="size-4" />
                      <span className="truncate">{story.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full'
              )}
            >
              <User className="size-5" />
            </div>
            {user?.email && (
              <span className="text-muted-foreground text-sm">
                {user.email}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => signOut()}
            className="size-8"
          >
            <LogOut className="size-4" />
            <span className="sr-only">Log out</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
