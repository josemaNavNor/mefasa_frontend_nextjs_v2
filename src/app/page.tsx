// Esta página será redirigida automáticamente por el AuthLoadingWrapper
// Creamos un redirect del lado del servidor para mayor eficiencia
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirigir al login por defecto - el AuthLoadingWrapper manejará la lógica de autenticación
  redirect('/login');
}