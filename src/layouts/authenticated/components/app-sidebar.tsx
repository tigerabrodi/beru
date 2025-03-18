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
} from "@/components/ui/sidebar";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { BookOpen, Home, Settings, User } from "lucide-react";
import { generatePath, Link, useLocation } from "react-router";

// TODO: implement this with convex
export function AppSidebar() {
  const location = useLocation();
  // const { user, logout } = useAuth();
  // const { stories } = useStories();
  const { isMobile, toggleSidebar } = useSidebar();
  // const favoriteStories = stories.filter((story) => story.isFavorite);
  // const nonFavoriteStories = stories.filter((story) => !story.isFavorite);
  // const recentStories = [...nonFavoriteStories].sort(
  //   (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  // );

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Link to={generatePath(ROUTES.dashboard)} className="flex items-center gap-2">
            <BookOpen className="size-6 text-primary" />
            <span className="font-bold text-xl">StoryTime</span>
          </Link>
          {!isMobile && <SidebarTrigger />}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === ROUTES.dashboard}>
              <Link to={ROUTES.dashboard}>
                <Home className="size-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location.pathname === ROUTES.settings}>
              <Link to={ROUTES.settings}>
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* {favoriteStories.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 px-4 text-xs font-medium text-sidebar-foreground/60">
              Favorite Stories
            </h3>
            <SidebarMenu>
              {favoriteStories.map((story) => (
                <SidebarMenuItem key={story.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/story/${story.id}`}
                  >
                    <Link
                      href={`/story/${story.id}`}
                      onClick={() => (isMobile ? toggleSidebar() : undefined)}
                    >
                      <Star className="size-4 text-yellow-500 fill-yellow-500" />
                      <span className="truncate">{story.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </div>
        )} */}

        {/* {recentStories.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 px-4 text-xs font-medium text-sidebar-foreground/60">
              Recent Stories
            </h3>
            <SidebarMenu>
              {recentStories.slice(0, 5).map((story) => (
                <SidebarMenuItem key={story.id}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === `/story/${story.id}`}
                  >
                    <Link
                      href={`/story/${story.id}`}
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
        )} */}
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
              )}
            >
              <User className="size-5" />
            </div>
          </div>
          {/* TODO: implement with convex auth */}
          {/* <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="size-8"
          >
            <LogOut className="size-4" />
            <span className="sr-only">Log out</span>
          </Button> */}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
