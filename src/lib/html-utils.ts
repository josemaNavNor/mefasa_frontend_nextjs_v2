/**
 * Utilitarios para manejar contenido HTML de emails en tickets
 */

/**
 * Sanitiza contenido HTML básico manteniendo formato
 * @param html - Contenido HTML a sanitizar
 * @returns HTML sanitizado
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Remover scripts y otros elementos peligrosos
  let cleanHtml = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remover event handlers
    .replace(/javascript:/gi, ''); // Remover javascript: URLs
  
  // Manejar imágenes problemáticas
  cleanHtml = processEmailImages(cleanHtml);
  
  return cleanHtml;
}

/**
 * Procesa las imágenes en el contenido HTML de emails (modo conservador)
 * @param html - Contenido HTML con imágenes
 * @returns HTML con imágenes procesadas de forma conservadora
 */
function processEmailImages(html: string): string {
  // Reemplazar imágenes que no se pueden cargar con un placeholder o removerlas
  return html.replace(/<img[^>]*>/gi, (imgTag) => {
    // Extraer el src de la imagen
    const srcMatch = imgTag.match(/src=["']([^"']*)["']/i);
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    
    if (!srcMatch) {
      return ''; // Remover imágenes sin src
    }
    
    const src = srcMatch[1];
    const alt = altMatch ? altMatch[1] : 'Imagen del email';
    
    // Si es una imagen base64, mantenerla pero con límite más estricto por defecto
    if (src.startsWith('data:image/')) {
      // En modo conservador, límite más bajo (50KB aprox)
      if (src.length > 50000) {
        const sizeKB = Math.round(src.length / 1024);
        return `<div class="email-image-placeholder">
          <span class="email-image-icon">🖼️</span>
          <span class="email-image-text">Imagen grande (${sizeKB}KB): ${alt}</span>
          <span class="email-image-hint">Activa "Mostrar imágenes" para verla</span>
        </div>`;
      }
      // Si es tamaño pequeño, mostrarla
      return `<img src="${src}" alt="${alt}" class="email-image" />`;
    }
    
    // Para URLs externas o problemáticas, mostrar placeholder directamente
    return `<div class="email-image-placeholder">
      <span class="email-image-icon">🖼️</span>
      <span class="email-image-text">Imagen externa: ${alt || 'Sin descripción'}</span>
      <span class="email-image-hint">Activa "Mostrar imágenes" para intentar cargarla</span>
    </div>`;
  });
}

/**
 * Procesa las imágenes en el contenido HTML de emails (modo permisivo)
 * @param html - Contenido HTML con imágenes
 * @returns HTML con todas las imágenes habilitadas
 */
function processEmailImagesPermissive(html: string): string {
  return html.replace(/<img[^>]*>/gi, (imgTag) => {
    // Extraer el src de la imagen
    const srcMatch = imgTag.match(/src=["']([^"']*)["']/i);
    const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
    
    if (!srcMatch) {
      return ''; // Remover imágenes sin src
    }
    
    const src = srcMatch[1];
    const alt = altMatch ? altMatch[1] : 'Imagen del email';
    
    // En modo permisivo, mostrar todas las imágenes base64
    if (src.startsWith('data:image/')) {
      // Para imágenes base64, simplemente mostrarlas con información de tamaño si son grandes
      if (src.length > 100000) {
        const sizeKB = Math.round(src.length / 1024);
        return `<div class="email-image-container">
          <div class="email-image-info">Imagen grande: ${sizeKB}KB</div>
          <img src="${src}" alt="${alt}" class="email-image large-image" />
        </div>`;
      }
      return `<img src="${src}" alt="${alt}" class="email-image" />`;
    }
    
    // Para URLs externas, mostrarlas directamente y dejar que el navegador maneje los errores
    return `<img src="${src}" alt="${alt}" class="email-image external-image" />`;
  });
}

/**
 * Aplica estilos básicos para contenido de email
 * @param html - Contenido HTML
 * @param options - Opciones de configuración
 * @returns HTML con estilos aplicados
 */
export function applyEmailStyles(html: string, options: { showImages?: boolean } = {}): string {
  if (!html) return '';
  
  const sanitized = sanitizeHtml(html);
  
  // Wrapper con estilos básicos para contenido de email
  return `<div class="email-content" style="
    line-height: 1.6; 
    color: #374151; 
    font-size: 14px;
    word-wrap: break-word;
    max-width: 100%;
    overflow-wrap: break-word;
  ">
    ${sanitized}
  </div>`;
}

/**
 * Versión que permite mostrar todas las imágenes (incluyendo grandes y externas)
 * @param html - Contenido HTML
 * @returns HTML con todas las imágenes habilitadas
 */
export function applyEmailStylesWithImages(html: string): string {
  if (!html) return '';
  
  // Solo sanitizar elementos peligrosos, pero mantener todas las imágenes
  let cleanHtml = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remover event handlers por seguridad
    .replace(/javascript:/gi, ''); // Remover javascript: URLs
  
  // Aplicar clase CSS a todas las imágenes para estilo consistente
  cleanHtml = cleanHtml.replace(/<img([^>]*)>/gi, (match, attributes) => {
    // Verificar si ya tiene clase
    if (attributes.includes('class=')) {
      return match.replace(/class=["']([^"']*)["']/i, 'class="$1 email-image"');
    } else {
      return `<img${attributes} class="email-image" />`;
    }
  });
  
  return `<div class="email-content" style="
    line-height: 1.6; 
    color: #374151; 
    font-size: 14px;
    word-wrap: break-word;
    max-width: 100%;
    overflow-wrap: break-word;
  ">
    ${cleanHtml}
  </div>`;
}

/**
 * Analiza el contenido HTML para obtener información sobre las imágenes
 * @param html - Contenido HTML
 * @returns Información sobre las imágenes encontradas
 */
export function analyzeEmailImages(html: string): {
  totalImages: number;
  base64Images: number;
  externalImages: number;
  largeImages: number;
  totalSizeKB: number;
} {
  if (!html) return { totalImages: 0, base64Images: 0, externalImages: 0, largeImages: 0, totalSizeKB: 0 };
  
  const imgMatches = html.match(/<img[^>]*>/gi) || [];
  let base64Images = 0;
  let externalImages = 0;
  let largeImages = 0;
  let totalSizeKB = 0;
  
  imgMatches.forEach(imgTag => {
    const srcMatch = imgTag.match(/src=["']([^"']*)["']/i);
    if (srcMatch) {
      const src = srcMatch[1];
      if (src.startsWith('data:image/')) {
        base64Images++;
        const sizeKB = Math.round(src.length / 1024);
        totalSizeKB += sizeKB;
        if (sizeKB > 50) {
          largeImages++;
        }
      } else if (src.startsWith('http')) {
        externalImages++;
      }
    }
  });
  
  return {
    totalImages: imgMatches.length,
    base64Images,
    externalImages,
    largeImages,
    totalSizeKB
  };
}

/**
 * Trunca contenido HTML para previsualizaciones
 * @param html - Contenido HTML
 * @param maxLength - Longitud máxima del texto plano
 * @returns Texto truncado
 */
export function truncateHtmlContent(html: string, maxLength: number = 150): string {
  if (!html) return '';
  
  // Convertir HTML a texto plano
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  if (textContent.length <= maxLength) {
    return textContent;
  }
  
  return textContent.substring(0, maxLength) + '...';
}