"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Settings, Phone, Mail, Calendar, Shield, Edit3, Save, X } from "lucide-react";
import { useAuthContext } from "@/components/auth-provider";
import { useProfile } from "@/hooks/useProfile";
import  Loading  from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { profileSchema } from "@/lib/zod";

export default function ProfilePage() {
    const { user: authUser, loading: authLoading } = useAuthContext();
    const { profile, loading, updateProfile, refetch } = useProfile(authUser?.id);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        last_name: "",
        phone_number: ""
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Cargar datos del perfil en el formulario cuando este disponible
    useEffect(() => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                last_name: profile.last_name || "",
                phone_number: profile.phone_number || ""
            });
        }
    }, [profile]);

    const handleInputChange = (field: string, value: string) => {
        const newFormData = {
            ...formData,
            [field]: value
        };
        setFormData(newFormData);
        
        // Validación en tiempo real del campo específico
        const fieldSchema = profileSchema.shape[field as keyof typeof profileSchema.shape];
        if (fieldSchema) {
            const result = fieldSchema.safeParse(value);
            if (!result.success) {
                setErrors(prev => ({
                    ...prev,
                    [field]: result.error.issues[0]?.message || ""
                }));
            } else {
                // Limpiar error si la validación es exitosa
                setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field];
                    return newErrors;
                });
            }
        }
    };

    const validateForm = () => {
        setErrors({});
        
        const result = profileSchema.safeParse(formData);
        
        if (!result.success) {
            const formatted = result.error.format();
            const newErrors: { [key: string]: string } = {};
            
            if (formatted.name?._errors?.[0]) {
                newErrors.name = formatted.name._errors[0];
            }
            if (formatted.last_name?._errors?.[0]) {
                newErrors.last_name = formatted.last_name._errors[0];
            }
            if (formatted.phone_number?._errors?.[0]) {
                newErrors.phone_number = formatted.phone_number._errors[0];
            }
            
            setErrors(newErrors);
            return false;
        }
        
        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        const success = await updateProfile(formData);
        if (success) {
            setIsEditing(false);
            await refetch();
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFormData({
                name: profile.name || "",
                last_name: profile.last_name || "",
                phone_number: profile.phone_number || ""
            });
        }
        setErrors({});
        setIsEditing(false);
    };

    if (authLoading || loading) {
        return <Loading />;
    }

    if (!profile) {
        return (
            <div className="flex items-center justify-center h-96">
                <p className="text-muted-foreground">No se pudo cargar la información del perfil</p>
            </div>
        );
    }

    const getInitials = (name: string, lastName: string) => {
        return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="container mx-auto p-6 max-w-9xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <User className="h-6 w-6" />
                    <h1 className="text-3xl font-bold">Mi Perfil</h1>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Editar Perfil
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Información Principal */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="h-5 w-5" />
                            <span>Información Personal</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4 mb-6">
                            <Avatar className="h-20 w-20">
                                <AvatarFallback className="text-lg">
                                    {getInitials(profile.name, profile.last_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="text-2xl font-semibold">
                                    {profile.name} {profile.last_name}
                                </h2>
                                <p className="text-muted-foreground">{profile.email}</p>
                                <Badge variant={profile.role?.role_name === 'Administrador' ? 'default' : 'secondary'} className="mt-1">
                                    {profile.role?.role_name}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                {isEditing ? (
                                    <div>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            className={errors.name ? "border-red-500" : ""}
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>
                                ) : (
                                    <p className="p-3 bg-muted rounded-md">{profile.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last_name">Apellidos</Label>
                                {isEditing ? (
                                    <div>
                                        <Input
                                            id="last_name"
                                            value={formData.last_name}
                                            onChange={(e) => handleInputChange("last_name", e.target.value)}
                                            className={errors.last_name ? "border-red-500" : ""}
                                        />
                                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                                    </div>
                                ) : (
                                    <p className="p-3 bg-muted rounded-md">{profile.last_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4" />
                                    <span>Email</span>
                                </Label>
                                <p className="p-3 bg-muted rounded-md text-muted-foreground">
                                    {profile.email} <span className="text-xs">(No editable)</span>
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone_number" className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4" />
                                    <span>Teléfono</span>
                                </Label>
                                {isEditing ? (
                                    <div>
                                        <Input
                                            id="phone_number"
                                            value={formData.phone_number}
                                            onChange={(e) => handleInputChange("phone_number", e.target.value)}
                                            placeholder="Número de teléfono"
                                            className={errors.phone_number ? "border-red-500" : ""}
                                        />
                                        {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                                    </div>
                                ) : (
                                    <p className="p-3 bg-muted rounded-md">
                                        {profile.phone_number || "Sin teléfono"}
                                    </p>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end space-x-3 pt-4">
                                <Button onClick={handleCancel} variant="outline">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave}>
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Cambios
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Información de la Cuenta */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Shield className="h-5 w-5" />
                                <span>Información de la Cuenta</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Miembro desde</span>
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(profile.created_at)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Estado de verificación de email</Label>
                                <Badge variant={profile.is_email_verified ? "default" : "destructive"}>
                                    {profile.is_email_verified ? "Verificado" : "No verificado"}
                                </Badge>
                            </div>

                            <div className="space-y-2">
                                <Label>Autenticación de dos factores</Label>
                                <Badge variant={profile.two_factor_enable ? "default" : "secondary"}>
                                    {profile.two_factor_enable ? "Activado" : "Desactivado"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Settings className="h-5 w-5" />
                                <span>Configuración</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Para cambiar tu contraseña o configurar la autenticación de dos factores, 
                                contacta con el administrador del sistema.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}