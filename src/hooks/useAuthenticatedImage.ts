import { useState, useEffect, useRef } from 'react';

interface UseAuthenticatedImageResult {
  imageUrl: string | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook para cargar imágenes desde endpoints autenticados
 * @param fileId - ID del archivo a cargar
 * @param enabled - Si debe cargar la imagen (útil para lazy loading)
 * @returns Objeto con imageUrl, isLoading y error
 */
export function useAuthenticatedImage(
  fileId: number | undefined,
  enabled: boolean = true
): UseAuthenticatedImageResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);
  const loadedFileIdRef = useRef<number | undefined>(undefined);
  const isLoadingRef = useRef<boolean>(false);

  useEffect(() => {
    // Resetear estado cuando cambia el fileId
    if (loadedFileIdRef.current !== fileId) {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
      setImageUrl(null);
      setError(null);
      setIsLoading(false);
      isLoadingRef.current = false;
      loadedFileIdRef.current = fileId;
    }

    // No cargar si no hay fileId o si está deshabilitado
    if (!fileId || !enabled) {
      return;
    }

    // Si ya tenemos la URL para este fileId o ya estamos cargando, no volver a cargar
    if (imageUrl || isLoadingRef.current) {
      return;
    }

    let isCancelled = false;
    isLoadingRef.current = true;

    const loadImage = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación disponible');
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const response = await fetch(`${apiUrl}/files/${fileId}/download`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error al cargar la imagen: ${response.status}`);
        }

        const blob = await response.blob();
        
        // Verificar si el componente fue desmontado antes de actualizar el estado
        if (isCancelled) {
          return;
        }

        const url = URL.createObjectURL(blob);
        blobUrlRef.current = url;
        setImageUrl(url);
      } catch (err) {
        if (isCancelled) {
          return;
        }
        const errorMessage = err instanceof Error ? err.message : 'Error desconocido al cargar la imagen';
        setError(errorMessage);
        console.error('Error cargando imagen autenticada:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
          isLoadingRef.current = false;
        }
      }
    };

    loadImage();

    // Cleanup: revocar el blob URL cuando el componente se desmonte o cambie el fileId
    return () => {
      isCancelled = true;
      isLoadingRef.current = false;
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [fileId, enabled]);

  return { imageUrl, isLoading, error };
}

