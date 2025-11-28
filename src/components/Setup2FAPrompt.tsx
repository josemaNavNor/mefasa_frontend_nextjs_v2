'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, X, AlertTriangle } from "lucide-react";
import ImgLogo from './img-logo';

interface Setup2FAPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onSetup: () => void;
  userName: string;
}

export function Setup2FAPrompt({ isOpen, onClose, onSetup, userName }: Setup2FAPromptProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSetup = () => {
    setIsLoading(true);
    onSetup();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="align-center mb-4 flex justify-center">
            <ImgLogo />
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="rounded-full bg-blue-100 p-2">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <DialogTitle className="text-xl">Protege tu cuenta con 2FA</DialogTitle>
          </div>
          <DialogDescription className="pt-2 text-center">
            <span className="font-semibold text-foreground">¡Hola {userName}!</span>
            <br />
            <span className="text-muted-foreground">
              Tu cuenta no tiene activada la autenticación de dos factores (2FA). 
              Te recomendamos activarla para mayor seguridad.
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-800">
                <strong>Importante:</strong> La autenticación de dos factores añade una capa adicional 
                de seguridad a tu cuenta, protegiéndola incluso si alguien obtiene acceso a tu contraseña.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-foreground">
                <strong>Mayor seguridad:</strong> Protege tu cuenta incluso si alguien conoce tu contraseña
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-foreground">
                <strong>Fácil configuración:</strong> Solo toma unos minutos configurarlo con tu aplicación de autenticación
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-foreground">
                <strong>Opcional:</strong> Puedes activarlo ahora o más tarde desde tu perfil
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Tal vez más tarde
          </Button>
          <Button 
            onClick={handleSetup}
            disabled={isLoading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
          >
            <Shield className="h-4 w-4 mr-2" />
            {isLoading ? 'Redirigiendo...' : 'Configurar 2FA ahora'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}