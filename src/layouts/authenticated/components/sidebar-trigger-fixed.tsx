import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function SidebarTriggerFixed() {
  const { state, isMobile } = useSidebar();

  // Show when sidebar is collapsed or on mobile
  if (state !== "collapsed" && !isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 md:top-4 md:left-6 z-50 shadow-white md:bg-background rounded-md md:right-auto md:bottom-auto">
      <SidebarTrigger className="flex items-center justify-center" />
    </div>
  );
}
