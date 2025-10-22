'use client';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, QrCode, Key, AlertCircle, CheckCircle, Copy } from "lucide-react";
import { use2FA } from "@/hooks/use2FA";
import Image from 'next/image';

export default function Setup2FAPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoading, error, qrCodeData, generate2FASecret, enable2FA, clearError } = use2FA();
  
  const [step, setStep] = useState<'generate' | 'verify' | 'success'>('generate');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    // Auto-generar el código QR cuando se carga la página
    if (step === 'generate' && !qrCodeData) {
      handleGenerateQR();
    }
  }, []);

  const handleGenerateQR = async () => {
    const result = await generate2FASecret();
    if (result) {
      setStep('verify');
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      return;
    }

    const result = await enable2FA(verificationCode);
    if (result) {
      setBackupCodes(result.backupCodes || []);
      setStep('success');
    }
  };

  const handleCopyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    setCopiedCodes(true);
    setTimeout(() => setCopiedCodes(false), 2000);
  };

  const handleFinish = () => {
    // Redirigir según el parámetro de retorno o al perfil por defecto
    const returnTo = searchParams.get('returnTo') || '/profile';
    router.push(returnTo);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Configurar Autenticación de Dos Factores</h1>
          </div>
          <p className="text-muted-foreground">
            Mejora la seguridad de tu cuenta con un paso adicional de verificación
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center space-x-2 ${step === 'generate' || step === 'verify' || step === 'success' ? 'text-blue-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'generate' || step === 'verify' || step === 'success' ? 'bg-blue-600 text-white' : 'bg-muted'}`}>
              1
            </div>
            <span className="text-sm font-medium">Generar QR</span>
          </div>
          <Separator className="w-8" />
          <div className={`flex items-center space-x-2 ${step === 'verify' || step === 'success' ? 'text-blue-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'verify' || step === 'success' ? 'bg-blue-600 text-white' : 'bg-muted'}`}>
              2
            </div>
            <span className="text-sm font-medium">Verificar</span>
          </div>
          <Separator className="w-8" />
          <div className={`flex items-center space-x-2 ${step === 'success' ? 'text-green-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'success' ? 'bg-green-600 text-white' : 'bg-muted'}`}>
              <CheckCircle className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">Completado</span>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Generate QR */}
        {step === 'generate' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Paso 1: Generar código QR
              </CardTitle>
              <CardDescription>
                Generaremos un código QR único para tu cuenta que podrás escanear con tu aplicación de autenticación.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <Button 
                  onClick={handleGenerateQR} 
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    "Generando..."
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Generar Código QR
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Verify */}
        {step === 'verify' && qrCodeData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Paso 2: Escanear QR y verificar
              </CardTitle>
              <CardDescription>
                Escanea el código QR con tu aplicación de autenticación y luego ingresa el código de 6 dígitos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-white rounded-lg border">
                  <Image
                    src={qrCodeData.qrCodeUrl}
                    alt="Código QR para 2FA"
                    width={200}
                    height={200}
                    className="mx-auto"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">¿No puedes escanear el código?</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                      {qrCodeData.secret}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigator.clipboard.writeText(qrCodeData.secret)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Copia este código manualmente en tu aplicación
                  </p>
                </div>
              </div>

              <Separator />

              {/* Verification */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Código de verificación</Label>
                  <Input
                    id="verification-code"
                    placeholder="Ingresa el código de 6 dígitos"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                </div>
                <Button 
                  onClick={handleVerifyCode}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full"
                >
                  {isLoading ? "Verificando..." : "Verificar y Activar 2FA"}
                </Button>
              </div>

              {/* Recommended apps */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Aplicaciones recomendadas:</strong> Google Authenticator, Microsoft Authenticator, Authy, o cualquier app compatible con TOTP.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                ¡2FA Activado Exitosamente!
              </CardTitle>
              <CardDescription>
                Tu cuenta ahora está protegida con autenticación de dos factores.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  A partir de ahora, necesitarás tu aplicación de autenticación para iniciar sesión.
                </AlertDescription>
              </Alert>

              {/* Backup codes */}
              {backupCodes.length > 0 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold">Códigos de respaldo</Label>
                    <p className="text-sm text-muted-foreground">
                      Guarda estos códigos en un lugar seguro. Puedes usar cada uno solo una vez si pierdes acceso a tu aplicación de autenticación.
                    </p>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {backupCodes.map((code, index) => (
                        <div key={index} className="bg-background p-2 rounded border">
                          <code className="text-sm font-mono">{code}</code>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleCopyBackupCodes}
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      {copiedCodes ? "¡Copiados!" : "Copiar todos los códigos"}
                    </Button>
                  </div>
                  
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Importante:</strong> Descarga o anota estos códigos ahora. No podrás verlos nuevamente.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              <Button onClick={handleFinish} className="w-full" size="lg">
                Continuar al Panel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Back button for non-success steps */}
        {step !== 'success' && (
          <div className="text-center">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
            >
              ← Volver
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}