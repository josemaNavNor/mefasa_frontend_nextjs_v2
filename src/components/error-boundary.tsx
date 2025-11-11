"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";

import { Button } from "@/components/ui/button";

interface Props {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  readonly hasError: boolean;
  readonly error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 p-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-destructive">
              ¡Oops! Algo salió mal
            </h2>
            <p className="text-muted-foreground max-w-md">
              Se ha producido un error inesperado. Por favor, inténtalo de nuevo.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 p-4 bg-muted rounded-lg text-left">
                <summary className="cursor-pointer font-medium">
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre className="mt-2 text-sm text-destructive whitespace-pre-wrap">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>\n\n{this.state.error.stack}</>
                  )}
                </pre>
              </details>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={this.handleReset} variant="outline">
              Intentar de nuevo
            </Button>
            <Button onClick={() => window.location.reload()}>
              Recargar página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export function useErrorBoundary() {
  return (error: Error) => {
    throw error;
  };
}