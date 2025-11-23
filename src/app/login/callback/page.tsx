'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Setup2FAPrompt } from '@/components/Setup2FAPrompt';

function LoginCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show2FAPrompt, setShow2FAPrompt] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [authData, setAuthData] = useState<any>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    const userParam = searchParams.get('user');
    const recommendationsParam = searchParams.get('recommendations');
    const error = searchParams.get('error');

    if (error) {
      console.error('Error de autenticación:', error);
      router.push('/login?error=' + encodeURIComponent(error));
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        let recommendations: any = {};
        
        // Parsear recomendaciones si existen
        if (recommendationsParam) {
          try {
            recommendations = JSON.parse(decodeURIComponent(recommendationsParam));
          } catch (error) {
            console.warn('Error al parsear recomendaciones:', error);
          }
        }
        
        // IMPORTANTE: Guardar en localStorage ANTES de cualquier validación
        // para que el token esté disponible cuando se configure 2FA
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Verificar si necesita configurar 2FA
        if (recommendations?.setup2FA) {
          setUserData(user);
          setAuthData({ recommendations });
          setShow2FAPrompt(true);
        } else {
          // Redirigir al dashboard directamente
          router.push('/');
        }
      } catch (error) {
        console.error('Error procesando datos de usuario:', error);
        router.push('/login?error=' + encodeURIComponent('Error procesando datos de usuario'));
      }
    } else {
      router.push('/login?error=' + encodeURIComponent('Faltan datos de autenticación'));
    }
  }, [searchParams, router]);

  const handleSetup2FA = () => {
    setShow2FAPrompt(false);
    // Redirigir a la pagina de configuracion de 2FA
    router.push('/setup-2fa?returnTo=/');
  };

  const handleSkip2FA = () => {
    setShow2FAPrompt(false);
    // Redirigir al dashboard
    router.push('/');
  };

  if (show2FAPrompt && userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Setup2FAPrompt
          isOpen={show2FAPrompt}
          onClose={handleSkip2FA}
          onSetup={handleSetup2FA}
          userName={userData.name}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-lg">Procesando autenticación...</p>
      </div>
    </div>
  );
}

export default function LoginCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando...</p>
        </div>
      </div>
    }>
      <LoginCallbackContent />
    </Suspense>
  );
}