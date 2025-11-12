import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

export function LoadingScreen({ 
  message = "Cargando...",
  className 
}: LoadingScreenProps) {
  return (
    <div 
      className={cn(
        "flex min-h-screen items-center justify-center bg-background",
        className
      )}
    >
      <div className="text-center space-y-4">
        <Spinner size="lg" />
        <p className="text-lg text-muted-foreground animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}