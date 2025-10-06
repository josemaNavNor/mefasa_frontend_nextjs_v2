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
import { ChevronUp, Home, Settings, User2, Building2, Ticket, Notebook, Footprints, LogOut } from "lucide-react"

// Definir los elementos del menú con roles requeridos
const menuItems = [
    {
        title: "Home",
        url: "/",
        icon: Home,
        roles: ['Administrador', 'Tecnico'], // Todos pueden ver Home
    },
    {
        title: "Tickets",
        url: "/tickets",
        icon: Ticket,
        roles: ['Administrador', 'Tecnico'], // Todos pueden ver tickets
    },
    {
        title: "Usuarios",
        url: "/users",
        icon: User2,
        roles: ['Administrador'], // Solo administradores
    },
    {
        title: "Roles",
        url: "/roles",
        icon: Notebook,
        roles: ['Administrador'], // Solo administradores
    },
    {
        title: "Permisos",
        url: "/permissions",
        icon: Footprints,
        roles: ['Administrador'], // Solo administradores
    },
    {
        title: "Plantas",
        url: "/floors",
        icon: Building2,
        roles: ['Administrador'], // Solo administradores
    },
    {
        title: "Tipos de Tickets",
        url: "/type_tickets",
        icon: Ticket,
        roles: ['Administrador'], // Solo administradores
    },
    {
        title: "Asignar Permisos",
        url: "/role-permissions",
        icon: Settings,
        roles: ['Administrador'], // Solo administradores
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
        roles: ['Administrador', 'Tecnico'], // Administradores y técnicos
    },
]

export function AppSidebar() {
    const { user, logout, hasRole, loading } = useAuthContext(); 

    const handleSignOut = () => {
        logout();
    };

    // Filtrar elementos del menú basados en el rol del usuario (similar a tu ejemplo de Express)
    const visibleMenuItems = loading ? [] : menuItems.filter(item => {
        if (!user) return false;
        return hasRole(item.roles);
    });

    return (
        <Sidebar collapsible="icon">
            <SidebarContent>
                <SidebarGroup>
                    <ImgLogo />
                    <SidebarGroupLabel>HDM - Help Desk Mefasa</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {visibleMenuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <a href={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
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
                                    {loading ? 'Cargando...' : (user?.email || 'Username')}
                                    <ChevronUp className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width]"
                            >
                                <DropdownMenuItem>
                                    <User2 className="mr-2 h-4 w-4" />
                                    <span>Cuenta</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Configuración</span>
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