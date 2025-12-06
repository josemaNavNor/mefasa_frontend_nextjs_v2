/**
 * Convierte un archivo File a base64
 * @param file - El archivo a convertir
 * @returns Promise que resuelve con el string base64
 */
export async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            resolve(result);
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Valida el tipo de archivo de imagen
 * @param file - El archivo a validar
 * @returns true si es un tipo de imagen válido
 */
export function isValidImageType(file: File): boolean {
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp'
    ];
    return allowedTypes.includes(file.type.toLowerCase());
}

/**
 * Valida el tamaño del archivo
 * @param file - El archivo a validar
 * @param maxSizeMB - Tamaño máximo en MB (por defecto 5MB)
 * @returns true si el tamaño es válido
 */
export function isValidImageSize(file: File, maxSizeMB: number = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
}

/**
 * Valida una imagen completa (tipo y tamaño)
 * @param file - El archivo a validar
 * @param maxSizeMB - Tamaño máximo en MB (por defecto 5MB)
 * @returns Objeto con isValid y errorMessage si hay error
 */
export function validateImage(file: File, maxSizeMB: number = 5): { isValid: boolean; errorMessage?: string } {
    if (!isValidImageType(file)) {
        return {
            isValid: false,
            errorMessage: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, GIF, WEBP, BMP)'
        };
    }

    if (!isValidImageSize(file, maxSizeMB)) {
        return {
            isValid: false,
            errorMessage: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`
        };
    }

    return { isValid: true };
}

