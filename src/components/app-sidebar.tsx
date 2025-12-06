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
    useSidebar,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import ImgLogo from "@/components/img-logo"
import { useAuthContext } from "@/components/auth-provider" 
import { ChevronUp, Home, Settings, User2, Building2, Ticket, Notebook, Footprints, LogOut, Filter } from "lucide-react"
import { usePages } from "@/hooks/usePages"
import { useProfile } from "@/hooks/useProfile"

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

// Función para generar iniciales del nombre y apellido
const getInitials = (name: string, lastName: string) => {
    const firstInitial = name?.charAt(0) || '';
    const lastInitial = lastName?.charAt(0) || '';
    return `${firstInitial}${lastInitial}`.toUpperCase();
};

export function AppSidebar() {
    const { user, logout, loading: authLoading } = useAuthContext();
    const { menuItems, loading: pagesLoading } = usePages();
    const { state } = useSidebar();
    const { profile, loading: profileLoading } = useProfile(user?.id);

    const handleSignOut = () => {
        logout();
    };

    const loading = authLoading || pagesLoading;

    // Función para construir la URL completa del avatar
    const getAvatarUrl = () => {
        if (profile?.avatar_url) {
            // Si es una URL relativa, construir la URL completa
            if (profile.avatar_url.startsWith('/')) {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
                return `${baseUrl}${profile.avatar_url}`;
            }
            return profile.avatar_url;
        }
        return undefined;
    };

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
                                    <Avatar className="h-8 w-8 group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6">
                                        <AvatarImage 
                                            src={getAvatarUrl()} 
                                            alt={profile ? `${profile.name} ${profile.last_name}` : user?.name || 'Usuario'}
                                        />
                                        <AvatarFallback className="text-xs group-data-[collapsible=icon]:text-[10px]">
                                            {profile 
                                                ? getInitials(profile.name, profile.last_name) 
                                                : user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    {state === "expanded" && (
                                        <span>
                                            {authLoading || profileLoading ? 'Cargando...' : (user?.email || 'Username')}
                                        </span>
                                    )}
                                    {state === "expanded" && <ChevronUp className="ml-auto" />}
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