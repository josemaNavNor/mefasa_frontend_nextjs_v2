"use client";

import React, { lazy, Suspense, type ComponentType, type ReactNode } from "react";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { ErrorBoundary } from "@/components/error-boundary";

interface LazyLoadOptions {
  readonly fallback?: ReactNode;
  readonly errorFallback?: ReactNode;
  readonly loadingMessage?: string;
}

/**
 * Higher-order component for lazy loading components with error boundaries and loading states
 */
export function createLazyComponent<T extends Record<string, unknown>>(
  importFunction: () => Promise<{ default: ComponentType<T> }>,
  options: LazyLoadOptions = {}
) {
  const LazyComponent = lazy(importFunction);
  
  return function LazyLoadedComponent(props: T) {
    const {
      fallback = <LoadingScreen message={options.loadingMessage || "Cargando componente..."} />,
      errorFallback,
    } = options;

    return (
      <ErrorBoundary fallback={errorFallback}>
        <Suspense fallback={fallback}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

/**
 * Hook for dynamic imports with loading state
 */
export function useDynamicImport<T>(
  importFunction: () => Promise<T>
): {
  readonly data: T | null;
  readonly loading: boolean;
  readonly error: Error | null;
  readonly reload: () => void;
} {
  const [state, setState] = React.useState<{
    data: T | null;
    loading: boolean;
    error: Error | null;
  }>({
    data: null,
    loading: true,
    error: null,
  });

  const load = React.useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const data = await importFunction();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error : new Error("Unknown error") 
      });
    }
  }, [importFunction]);

  React.useEffect(() => {
    load();
  }, [load]);

  return {
    ...state,
    reload: load,
  };
}

// Common lazy-loaded components that can be reused
export const LazyApexCharts = createLazyComponent(
  () => import("react-apexcharts"),
  { loadingMessage: "Cargando gráficos..." }
);