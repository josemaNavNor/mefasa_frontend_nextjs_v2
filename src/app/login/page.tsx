'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/components/auth-provider';
import { loginSchema } from '@/lib/zod';
import { api } from '@/lib/httpClient';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ImgLogo from "@/components/img-logo"
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff } from 'lucide-react';

// Icono de Microsoft
const MicrosoftIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" />
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const { login } = useAuthContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setValidationErrors({});

    // Validar con Zod
    const validation = loginSchema.safeParse({ email, password, otp });

    if (!validation.success) {
      const errors: { [key: string]: string } = {};
      validation.error.issues.forEach((error) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    // Si la validación pasa, proceder con el login
    const result = await login(email, password, otp);

    if (!result.success) {
      setError(result.error || 'Error al iniciar sesión');
    }

    setLoading(false);
  };

  const handleMicrosoftLogin = async () => {
    try {
      setMicrosoftLoading(true);
      setError('');

      // Obtener URL de autorizacion del backend usando api
      const data = await api.get('/auth/microsoft/login');
      //console.log('Respuesta del backend:', data);

      let authUrl = null;
      
      if (data && data.authUrl) {
        authUrl = data.authUrl;
      }
      
      //console.log('URL de autorización extraída:', authUrl);
      
      if (authUrl) {
        // Redirigir directamente a Microsoft
        window.location.href = authUrl;
      } else {
        console.error('Respuesta del backend:', data);
        console.error('No se encontró authUrl en:', {
          'data.data': data.data,
          'data.authUrl': data.authUrl,
          'data.data?.authUrl': data.data?.authUrl
        });
        throw new Error('No se recibió URL de autorización del servidor');
      }
    } catch (error) {
      console.error('Error en login con Microsoft:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(`Error al iniciar sesión con Microsoft: ${errorMessage}`);
      setMicrosoftLoading(false);
    }
  };

  // Manejar errores de URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');

    if (error) {
      setError(decodeURIComponent(error));
      // Limpiar URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-sm">
        <div className="flex justify-center mt-6">
          <ImgLogo />
        </div>
        <CardHeader>
          <CardTitle>Iniciar sesion</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para iniciar sesion
          </CardDescription>
          <CardAction>
            <Button variant="link">Registro</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Correo electronico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Contraseña</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pr-12 ${validationErrors.password ? "border-red-500" : ""}`}
                  />
                  {showPassword ? (
                    <EyeOff
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <Eye
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-500">{validationErrors.password}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="otp">Codigo de verificacion</Label>
                <div className="flex items-center justify-center gap-2">
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {validationErrors.otp && (
                  <p className="text-sm text-red-500">{validationErrors.otp}</p>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || microsoftLoading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Iniciar sesión
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleMicrosoftLogin}
            disabled={loading || microsoftLoading}
          >
            {microsoftLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MicrosoftIcon className="mr-2 h-4 w-4" />
            )}
            Iniciar sesión con Microsoft
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}