// Hook para convertir HTML a texto plano para validaciones
export function useTextFromHtml(html: string): string {
  if (!html) return '';
  
  // Crear un elemento temporal para extraer el texto
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

// Función utilitaria para validar si el contenido HTML está vacío
export function isHtmlEmpty(html: string): boolean {
  if (!html || html.trim() === '') return true;
  
  // Remover tags HTML y verificar si queda contenido
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const textContent = temp.textContent || temp.innerText || '';
  
  return textContent.trim().length === 0;
}