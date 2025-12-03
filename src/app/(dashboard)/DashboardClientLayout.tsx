"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { UsersMinimalProvider } from "@/contexts/UsersMinimalContext";
import { FloorsProvider } from "@/contexts/FloorsContext";
import { TypesProvider } from "@/contexts/TypesContext";
import { TicketsProvider } from "@/contexts/TicketsContext";
import { RolesProvider } from "@/contexts/RolesContext";
import { UserFavFiltersProvider } from "@/contexts/UserFavFiltersContext";
import { FiltersProvider } from "@/contexts/FiltersContext";

interface DashboardClientLayoutProps {
  children: React.ReactNode;
}

export function DashboardClientLayout({ children }: DashboardClientLayoutProps) {
  return (
    <UsersMinimalProvider>
      <FloorsProvider>
        <TypesProvider>
          <TicketsProvider>
            <RolesProvider>
              <UserFavFiltersProvider>
                <FiltersProvider>
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
                </FiltersProvider>
              </UserFavFiltersProvider>
            </RolesProvider>
          </TicketsProvider>
        </TypesProvider>
      </FloorsProvider>
    </UsersMinimalProvider>
  );
}


