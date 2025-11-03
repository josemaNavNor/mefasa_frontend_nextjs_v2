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
 * Procesa las imágenes en el contenido HTML de emails
 * @param html - Contenido HTML con imágenes
 * @returns HTML con imágenes procesadas
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
    
    // Si es una imagen base64, mantenerla pero con mejor estilo
    if (src.startsWith('data:image/')) {
      // Si es muy larga (> 100KB aprox), mostrar placeholder
      if (src.length > 100000) {
        return `<div class="email-image-placeholder">
          <span class="email-image-icon">🖼️</span>
          <span class="email-image-text">Imagen grande: ${alt}</span>
        </div>`;
      }
      // Si es tamaño razonable, mostrarla
      return `<img src="${src}" alt="${alt}" class="email-image" />`;
    }
    
    // Para URLs externas o problemáticas, mostrar placeholder directamente
    // Esto evita la carga de imágenes externas que pueden fallar
    return `<div class="email-image-placeholder">
      <span class="email-image-icon">🖼️</span>
      <span class="email-image-text">Imagen: ${alt || 'Sin descripción'}</span>
    </div>`;
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
 * Versión que permite mostrar imágenes externas
 * @param html - Contenido HTML
 * @returns HTML con imágenes externas habilitadas
 */
export function applyEmailStylesWithImages(html: string): string {
  if (!html) return '';
  
  // Solo sanitizar elementos peligrosos, mantener imágenes
  const cleanHtml = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remover event handlers
    .replace(/javascript:/gi, ''); // Remover javascript: URLs
  
  // Aplicar clase a todas las imágenes para estilo consistente
  const processedHtml = cleanHtml.replace(/<img([^>]*)>/gi, '<img$1 class="email-image" />');
  
  return `<div class="email-content" style="
    line-height: 1.6; 
    color: #374151; 
    font-size: 14px;
    word-wrap: break-word;
    max-width: 100%;
    overflow-wrap: break-word;
  ">
    ${processedHtml}
  </div>`;
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