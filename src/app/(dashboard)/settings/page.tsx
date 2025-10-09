"use client";
import { useSettings } from "@/contexts/SettingsContext";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, RefreshCw } from "lucide-react";

export default function SettingsPage() {
    const { 
        autoRefreshEnabled, 
        autoRefreshInterval, 
        setAutoRefreshEnabled, 
        setAutoRefreshInterval 
    } = useSettings();

    const intervalOptions = [
        { value: 10000, label: "10 segundos" },
        { value: 30000, label: "30 segundos" },
        { value: 60000, label: "1 minuto" },
        { value: 120000, label: "2 minutos" },
        { value: 300000, label: "5 minutos" },
    ];

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
                {/* Auto-refresh Configuration */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5" />
                            <CardTitle>Auto-actualización</CardTitle>
                        </div>
                        <CardDescription>
                            Configura la actualización automática de tickets para detectar nuevos tickets registrados por correo
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="auto-refresh">Habilitar auto-actualización</Label>
                                <p className="text-sm text-gray-600">
                                    Detecta automáticamente nuevos tickets sin necesidad de refrescar manualmente
                                </p>
                            </div>
                            <Switch
                                id="auto-refresh"
                                checked={autoRefreshEnabled}
                                onCheckedChange={setAutoRefreshEnabled}
                            />
                        </div>

                        {autoRefreshEnabled && (
                            <div className="space-y-2">
                                <Label htmlFor="refresh-interval">Intervalo de actualización</Label>
                                <Select
                                    value={autoRefreshInterval.toString()}
                                    onValueChange={(value) => setAutoRefreshInterval(parseInt(value))}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Selecciona un intervalo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {intervalOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-gray-600">
                                    Cada {intervalOptions.find(opt => opt.value === autoRefreshInterval)?.label || '30 segundos'} 
                                    se verificará si hay nuevos tickets
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Status Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Estado actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Auto-actualización:</span>
                                <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs ${
                                    autoRefreshEnabled 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    <div className={`w-2 h-2 rounded-full ${
                                        autoRefreshEnabled ? 'bg-green-500' : 'bg-gray-500'
                                    }`} />
                                    {autoRefreshEnabled ? 'Activo' : 'Desactivado'}
                                </div>
                            </div>
                            {autoRefreshEnabled && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Próxima verificación:</span>
                                    <span className="text-sm text-gray-600">
                                        En {intervalOptions.find(opt => opt.value === autoRefreshInterval)?.label || '30 segundos'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}