'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/httpClient';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ImgLogo from "@/components/img-logo";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Mail } from 'lucide-react';

export default function VerifyEmail() {
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setError('Token de verificación no válido');
      setLoading(false);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.post('/auth/verify-email', {
        token: verificationToken
      });

      if (response.success || response.message) {
        setSuccess(true);
        setMessage(response.message || 'Email verificado correctamente');
      } else {
        throw new Error('Respuesta no válida del servidor');
      }

    } catch (error: any) {
      console.error('Error verificando email:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Error al verificar el email. El token puede haber expirado o ser inválido.');
      }
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Aquí puedes implementar la lógica para reenviar el email de verificación
      // Necesitarías el email del usuario, que podrías obtener del token o almacenar en localStorage
      
      setMessage('Se ha enviado un nuevo email de verificación');
    } catch (error: any) {
      setError('Error al reenviar el email de verificación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <div className="flex justify-center mt-6">
          <ImgLogo />
        </div>
        
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {loading && <Loader2 className="h-12 w-12 animate-spin text-blue-600" />}
            {!loading && success && <CheckCircle className="h-12 w-12 text-green-600" />}
            {!loading && !success && error && <XCircle className="h-12 w-12 text-red-600" />}
            {!loading && !success && !error && <Mail className="h-12 w-12 text-blue-600" />}
          </div>
          
          <CardTitle>
            {loading && "Verificando email..."}
            {!loading && success && "¡Email verificado!"}
            {!loading && !success && error && "Error de verificación"}
            {!loading && !success && !error && "Verificación pendiente"}
          </CardTitle>
          
          <CardDescription>
            {loading && "Por favor espera mientras verificamos tu email"}
            {!loading && success && "Tu cuenta ha sido verificada correctamente"}
            {!loading && !success && error && "Hubo un problema al verificar tu email"}
            {!loading && !success && !error && "Verifica tu email para continuar"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {message && !error && (
            <Alert className="mb-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {message}
              </AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {success && (
            <div className="text-center text-green-700 mb-4">
              <p>Ahora puedes iniciar sesión con tu cuenta verificada.</p>
            </div>
          )}

          {!loading && !success && error && (
            <div className="text-center text-gray-600 mb-4">
              <p className="text-sm">
                Si el problema persiste, puedes solicitar un nuevo email de verificación
                o contactar al soporte técnico.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-2">
          {success && (
            <Button 
              className="w-full"
              onClick={handleGoToLogin}
            >
              Ir al login
            </Button>
          )}
          
          {!loading && !success && (
            <>
              <Button 
                className="w-full"
                onClick={handleGoToLogin}
              >
                Volver al login
              </Button>
              
              {error && (
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={handleResendVerification}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reenviar verificación
                </Button>
              )}
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}