import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { AuthLoadingWrapper } from "@/components/AuthLoadingWrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthLoadingWrapper>
      <SidebarProvider>
        <AppSidebar />
        <main className="flex-1">
          <div className="flex items-center gap-2 p-4">
            <SidebarTrigger />
            <ModeToggle />
          </div>
          {children}
        </main>
      </SidebarProvider>
    </AuthLoadingWrapper>
  );
}