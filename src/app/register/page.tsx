'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { registerSchema } from '@/lib/zod';
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ImgLogo from "@/components/img-logo"
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Mail } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    setValidationErrors({});

    // Validar con Zod
    const validation = registerSchema.safeParse({
      name,
      last_name: lastName,
      email,
      password,
      confirmPassword,
      phone_number: phoneNumber 
    });

    if (!validation.success) {
      const errors: { [key: string]: string } = {};

      // Mostrar solo el primer error por campo
      validation.error.issues.forEach((error) => {
        const fieldName = error.path[0] as string;
        if (fieldName && !errors[fieldName]) {
          errors[fieldName] = error.message;
        }
      });

      setValidationErrors(errors);
      setLoading(false);
      return;
    }

    try {
      // Si la validación pasa, proceder con el registro
      await api.post('/auth/register', {
        name,
        last_name: lastName,
        email,
        password,
        phone_number: phoneNumber || undefined,
        role_id: 2  // Asignar rol ID 2 por defecto (Técnico)
      });

      setSuccess(true);
      
      // Redirigir al login después de 5 segundos para dar tiempo a leer el mensaje
      setTimeout(() => {
        router.push('/login');
      }, 5000);

    } catch (error: any) {
      console.error('Error en registro:', error);
      
      // El httpClient ya procesa el error y lo convierte en un Error simple
      if (error.message) {
        setError(error.message);
      } else {
        setError('Error al registrar usuario. Intenta nuevamente.');
      }
    }

    setLoading(false);
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <div className="flex justify-center mt-6">
            <ImgLogo />
          </div>
          <CardHeader>
            <CardTitle className="text-center text-green-600">¡Registro Exitoso!</CardTitle>
            <CardDescription className="text-center">
              Tu cuenta ha sido creada correctamente. 
              <br />
              <strong>Revisa tu correo electrónico</strong> y haz clic en el enlace de verificación para activar tu cuenta.
              <br />
              <br />
              Serás redirigido al login en unos segundos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              <Mail className="h-16 w-16 text-green-600" />
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
              <p className="text-center text-sm text-gray-600">
                Hemos enviado un email de verificación a tu dirección de correo electrónico.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleGoToLogin}
            >
              Ir al login ahora
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-8">
      <Card className="w-full max-w-md">
        <div className="flex justify-center mt-6">
          <ImgLogo />
        </div>
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            Completa los datos para crear tu cuenta
          </CardDescription>
          <CardAction>
            <Button variant="link" onClick={handleGoToLogin}>
              ¿Ya tienes cuenta? Inicia sesión
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4 border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Ingresa tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={validationErrors.name ? "border-red-500" : ""}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-500">{validationErrors.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Ingresa tu apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={validationErrors.last_name ? "border-red-500" : ""}
                />
                {validationErrors.last_name && (
                  <p className="text-sm text-red-500">{validationErrors.last_name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {validationErrors.email && (
                  <p className="text-sm text-red-500">{validationErrors.email}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Número de teléfono (opcional)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+34 123 456 789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={validationErrors.phone_number ? "border-red-500" : ""}
                />
                {validationErrors.phone_number && (
                  <p className="text-sm text-red-500">{validationErrors.phone_number}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
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
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`pr-12 ${validationErrors.confirmPassword ? "border-red-500" : ""}`}
                  />
                  {showConfirmPassword ? (
                    <EyeOff
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(false)}
                    />
                  ) : (
                    <Eye
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
                      onClick={() => setShowConfirmPassword(true)}
                    />
                  )}
                </div>
                {validationErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{validationErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Crear cuenta
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoToLogin}
            disabled={loading}
          >
            Volver al login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}