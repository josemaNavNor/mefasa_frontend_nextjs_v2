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
  const cleanHtml = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '') // Remover event handlers
    .replace(/javascript:/gi, ''); // Remover javascript: URLs
  
  return cleanHtml;
}

/**
 * Aplica estilos básicos para contenido de email
 * @param html - Contenido HTML
 * @returns HTML con estilos aplicados
 */
export function applyEmailStyles(html: string): string {
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