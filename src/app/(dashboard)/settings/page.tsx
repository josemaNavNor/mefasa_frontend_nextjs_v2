"use client";
import { Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="w-full px-4 py-4">
            <div className="mb-6">
                <div className="flex items-center gap-3">
                    <Settings className="h-8 w-8" />
                    <h1 className="text-4xl font-bold">Configuraciones</h1>
                </div>
                <p className="text-gray-600 mt-2">Personaliza el comportamiento del sistema</p>
            </div>

            <div className="max-w-2xl space-y-6">
                <p className="text-gray-600">No hay configuraciones disponibles en este momento.</p>
            </div>
        </div>
    );
}