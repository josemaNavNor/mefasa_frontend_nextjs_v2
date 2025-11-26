'use client';

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import ImgLogo from "@/components/img-logo"
import { useAuthContext } from "@/components/auth-provider" 
import { ChevronUp, Home, Settings, User2, Building2, Ticket, Notebook, Footprints, LogOut, Filter } from "lucide-react"
import { usePages } from "@/hooks/usePages"

// Mapeo de nombres de iconos a componentes de Lucide
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'Home': Home,
    'Ticket': Ticket,
    'Filter': Filter,
    'User2': User2,
    'Notebook': Notebook,
    'Footprints': Footprints,
    'Building2': Building2,
};

export function AppSidebar() {
    const { user, logout, loading: authLoading } = useAuthContext();
    const { menuItems, loading: pagesLoading } = usePages();

    const handleSignOut = () => {
        logout();
    };

    const loading = authLoading || pagesLoading;

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <ImgLogo />
                    <SidebarGroupLabel>HDM - Help Desk Mefasa</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {loading ? (
                                <SidebarMenuItem>
                                    <SidebarMenuButton disabled>
                                        <span>Cargando...</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ) : (
                                menuItems.map((item) => {
                                    const IconComponent = iconMap[item.icon] || Home;
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild>
                                                <a href={item.url}>
                                                    <IconComponent />
                                                    <span>{item.title}</span>
                                                </a>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton>
                                    <User2 /> 
                                    {authLoading ? 'Cargando...' : (user?.email || 'Username')}
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem asChild>
                                    <a href="/profile" className="flex items-center">
                                        <User2 className="mr-2 h-4 w-4" />
                                        <span>Cuenta</span>
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <a href="/settings">Configuración</a>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleSignOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Cerrar sesión</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}