/**
 * Utilidades para manejar archivos con autenticación
 */

/**
 * Descarga un archivo desde un endpoint autenticado
 * @param fileId - ID del archivo a descargar
 * @param filename - Nombre del archivo para la descarga
 */
export async function downloadAuthenticatedFile(
  fileId: number,
  filename: string
): Promise<void> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const response = await fetch(`${apiUrl}/files/${fileId}/download`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.status}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error descargando archivo:', error);
    throw error;
  }
}

/**
 * Obtiene la URL de descarga autenticada para usar en enlaces
 * @param fileId - ID del archivo
 * @returns URL completa con token (para uso en href)
 */
export function getAuthenticatedDownloadUrl(fileId: number): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  return `${apiUrl}/files/${fileId}/download`;
}

