"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { useAuthContext } from "@/components/auth-provider";

export default function HomePage() {
  const { user, loading, isAuthenticated } = useAuthContext();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && user) {
      // Redirect to dashboard for authenticated users
      redirect("/dashboard");
    } else {
      // Redirect to login for unauthenticated users
      redirect("/login");
    }
  }, [user, loading, isAuthenticated]);

  // // // Show loading screen while determining auth state
  // // if (loading) {
  // //   return <LoadingScreen message="Verificando autenticación..." />;
  // // }

  // // Show loading screen while redirect is happening
  // if (!isAuthenticated || !user) {
  //   return <LoadingScreen message="Redirigiendo al login..." />;
  // }

  // // Show loading screen while redirect to dashboard is happening
  // return <LoadingScreen message="Redirigiendo al dashboard..." />;
}