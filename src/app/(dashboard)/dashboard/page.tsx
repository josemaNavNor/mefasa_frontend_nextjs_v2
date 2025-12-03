import { cookies } from "next/headers";

import { AUTH_CONFIG, API_CONFIG } from "@/lib/constants";
import { TicketsDashboard } from "@/components/dashboard/TicketsDashboard";
import type { DashboardData } from "@/hooks/useDashboard";

// Hacemos que esta página use ISR: los datos del dashboard se regeneran periódicamente
export const revalidate = 60; // segundos

async function fetchDashboardData(cookieStore: Awaited<ReturnType<typeof cookies>>): Promise<DashboardData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || `${API_CONFIG.baseUrl}/api/${API_CONFIG.version}`;

  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Construir header Cookie con todas las cookies disponibles
    const cookiePairs: string[] = [];
    cookieStore.getAll().forEach(cookie => {
      cookiePairs.push(`${cookie.name}=${cookie.value}`);
    });
    
    if (cookiePairs.length > 0) {
      headers['Cookie'] = cookiePairs.join('; ');
    }

    const response = await fetch(`${baseUrl}/tickets/dashboard`, {
      headers,
      // Dejamos que ISR controle el caché con revalidate
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return null;
    }

    const responseData = await response.json();
    
    // El backend puede devolver los datos envueltos en { success, data } o directamente
    let data: DashboardData;
    if (responseData && typeof responseData === 'object' && 'data' in responseData && 'success' in responseData) {
      // Si viene envuelto en { success, data }
      data = responseData.data as DashboardData;
    } else {
      // Si viene directamente
      data = responseData as DashboardData;
    }
    
    // Validar que los datos tienen la estructura esperada
    if (!data || (!data.seriesByDate && !data.countsByStatus && !data.metrics && !data.topTechnicians)) {
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching dashboard data (SSR):", error);
    return null;
  }
}

export default async function DashboardHome() {
  const cookieStore = await cookies();

  let initialData: DashboardData | null = null;

  // Verificar si hay token en cookies antes de hacer la petición
  const token = cookieStore.get(AUTH_CONFIG.tokenKey)?.value;
  
  if (token) {
    initialData = await fetchDashboardData(cookieStore);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <TicketsDashboard initialData={initialData} />
      </div>
    </div>
  );
}