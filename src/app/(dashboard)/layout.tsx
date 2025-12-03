import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AUTH_CONFIG } from "@/lib/constants";
import { DashboardClientLayout } from "./DashboardClientLayout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.tokenKey)?.value;

  // Si no hay token en cookies, redirigir al login desde el servidor
  if (!token) {
    redirect("/login");
  }

  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}