"use client"

import { useAuthenticatedImage } from "@/hooks/useAuthenticatedImage";
import { downloadAuthenticatedFile } from "@/lib/file-utils";

interface AuthenticatedImageProps {
  fileId: number | undefined;
  filename: string;
  className?: string;
  style?: React.CSSProperties;
  onError?: () => void;
  onClick?: () => void;
}

/**
 * Componente para mostrar imágenes cargadas desde endpoints autenticados
 */
export function AuthenticatedImage({
  fileId,
  filename,
  className = "",
  style,
  onError,
  onClick,
}: AuthenticatedImageProps) {
  const { imageUrl, isLoading, error } = useAuthenticatedImage(fileId, true);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!fileId) return;
    
    try {
      await downloadAuthenticatedFile(fileId, filename);
    } catch (err) {
      console.error('Error descargando archivo:', err);
      onError?.();
    }
  };

  if (error) {
    return (
      <div className="email-image-placeholder">
        <span className="email-image-icon">🖼️</span>
        <span className="email-image-text">Error al cargar: {filename}</span>
        {fileId && (
          <button
            onClick={handleDownload}
            className="text-blue-600 hover:underline text-xs cursor-pointer"
          >
            Descargar archivo
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
        <span className="text-sm text-gray-500">Cargando imagen...</span>
      </div>
    );
  }

  if (!imageUrl) {
    return null;
  }

  return (
    <img
      src={imageUrl}
      alt={filename}
      className={className}
      style={style}
      onClick={onClick}
      onError={onError}
    />
  );
}

