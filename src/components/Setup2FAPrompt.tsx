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
import { Shield, X } from "lucide-react";

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <DialogTitle>Mejorar tu seguridad</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            ¡Hola {userName}! Te recomendamos activar la autenticación de dos factores (2FA) 
            para proteger mejor tu cuenta.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                <strong>Mayor seguridad:</strong> Protege tu cuenta incluso si alguien conoce tu contraseña
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
                <strong>Fácil configuración:</strong> Solo toma unos minutos configurarlo
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-sm text-gray-600">
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
            className="w-full sm:w-auto"
          >
            <Shield className="h-4 w-4 mr-2" />
            Configurar 2FA ahora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}