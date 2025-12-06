"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Phone, Mail, Calendar, Shield, Edit3, Save, X, Lock, Eye, EyeOff, Key, Upload } from "lucide-react";
import { useAuthContext } from "@/components/auth-provider";
import { useProfile } from "@/hooks/useProfile";
import { usePasswordChange } from "@/hooks/usePasswordChange";
import Loading from "@/components/loading";
import { Badge } from "@/components/ui/badge";
import { profileSchema } from "@/lib/zod";
import { Separator } from "@/components/ui/separator";

export default function ProfilePage() {
    const { user: authUser, loading: authLoading } = useAuthContext();
    const { profile, loading, updateProfile, uploadAvatar, refetch } = useProfile(authUser?.id);
    const { changePassword, loading: passwordLoading, errors: passwordErrors, clearErrors } = usePasswordChange(authUser?.id);
    
    const [isEditing, setIsEditing] = useState(false);
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        name: "",
        last_name: "",
        phone_number: ""
    });
    
    const [passwordData, setPasswordData] = useState({
        password: "",
        confirmPassword: ""
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

    const handlePasswordChange = async () => {
        const success = await changePassword(passwordData);
        if (success) {
            setPasswordData({ password: "", confirmPassword: "" });
            setIsEditingPassword(false);
        }
    };

    const handlePasswordCancel = () => {
        setPasswordData({ password: "", confirmPassword: "" });
        setIsEditingPassword(false);
        clearErrors();
    };

    const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingAvatar(true);
        try {
            // Crear preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            // Subir el avatar
            const success = await uploadAvatar(file);
            if (success) {
                setAvatarPreview(null);
            }
        } catch (error) {
            console.error('Error al subir avatar:', error);
        } finally {
            setUploadingAvatar(false);
            // Limpiar el input
            event.target.value = '';
        }
    };

    const getAvatarUrl = () => {
        if (avatarPreview) return avatarPreview;
        if (profile?.avatar_url) {
            // Si es una URL relativa, construir la URL completa
            if (profile.avatar_url.startsWith('/')) {
                const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
                return `${baseUrl}${profile.avatar_url}`;
            }
            return profile.avatar_url;
        }
        return null;
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
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-full">
                        <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
                        <p className="text-gray-600">Gestiona tu información personal y configuración de cuenta</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Información Principal */}
                <Card className="lg:col-span-2 shadow-sm border-gray-200">
                    <CardHeader className="pb-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center space-x-3 text-xl text-gray-800">
                                <User className="h-6 w-6 text-blue-600" />
                                <span>Información Personal</span>
                            </CardTitle>
                            {!isEditing && (
                                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="hover:bg-blue-50">
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Editar Perfil
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-6 pb-6 border-b border-gray-100">
                            <div className="flex flex-col items-center space-y-3">
                                <Avatar className="h-24 w-24 border-4 border-white shadow-md">
                                    <AvatarImage 
                                        src={getAvatarUrl() || undefined} 
                                        alt={`${profile.name} ${profile.last_name}`}
                                    />
                                    <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                                        {getInitials(profile.name, profile.last_name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-center space-y-2">
                                    <Label 
                                        htmlFor="avatar-upload" 
                                        className="cursor-pointer flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        <Upload className="h-4 w-4" />
                                        <span>Subir foto de perfil</span>
                                    </Label>
                                    <Input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp"
                                        onChange={handleAvatarChange}
                                        disabled={uploadingAvatar}
                                        className="hidden"
                                    />
                                    {uploadingAvatar && (
                                        <p className="text-xs text-gray-500">Subiendo...</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold text-gray-900">
                                    {profile.name} {profile.last_name}
                                </h2>
                                <p className="text-gray-600 mt-1 flex items-center">
                                    <Mail className="h-4 w-4 mr-2" />
                                    {profile.email}
                                </p>
                                <div className="mt-3">
                                    <Badge variant={profile.role?.role_name === 'Administrador' ? 'default' : 'secondary'} className="px-3 py-1">
                                        <Shield className="h-3 w-3 mr-1" />
                                        {profile.role?.role_name}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nombre</Label>
                                {isEditing ? (
                                    <div>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            className={`transition-colors ${errors.name ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"}`}
                                            placeholder="Tu nombre"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-gray-900">{profile.name}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="last_name" className="text-sm font-medium text-gray-700">Apellidos</Label>
                                {isEditing ? (
                                    <div>
                                        <Input
                                            id="last_name"
                                            value={formData.last_name}
                                            onChange={(e) => handleInputChange("last_name", e.target.value)}
                                            className={`transition-colors ${errors.last_name ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"}`}
                                            placeholder="Tus apellidos"
                                        />
                                        {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-gray-900">{profile.last_name}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-gray-500" />
                                    <span>Correo Electrónico</span>
                                </Label>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-gray-900">{profile.email}</p>
                                    <span className="text-xs text-gray-500 mt-1 block">Este campo no se puede editar</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="phone_number" className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-gray-500" />
                                    <span>Teléfono</span>
                                </Label>
                                {isEditing ? (
                                    <div>
                                        <Input
                                            id="phone_number"
                                            value={formData.phone_number}
                                            onChange={(e) => handleInputChange("phone_number", e.target.value)}
                                            placeholder="Número de teléfono"
                                            className={`transition-colors ${errors.phone_number ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"}`}
                                        />
                                        {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number}</p>}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-gray-900">
                                            {profile.phone_number || "Sin teléfono registrado"}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                                <Button onClick={handleCancel} variant="outline" className="hover:bg-gray-50">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                                    <Save className="h-4 w-4 mr-2" />
                                    Guardar Cambios
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Información de la Cuenta y Seguridad */}
                <div className="space-y-6">
                    {/* Información de la Cuenta */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-3 text-lg text-gray-800">
                                <Shield className="h-5 w-5 text-green-600" />
                                <span>Información de Cuenta</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span>Miembro desde</span>
                                </Label>
                                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                                    {formatDate(profile.created_at)}
                                </p>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-700">Estado de verificación de email</Label>
                                <Badge variant={profile.is_email_verified ? "default" : "destructive"} className="flex w-fit">
                                    {profile.is_email_verified ? "✓ Verificado" : "✗ No verificado"}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-medium text-gray-700">Autenticación de dos factores</Label>
                                <Badge variant={profile.two_factor_enable ? "default" : "secondary"} className="flex w-fit">
                                    {profile.two_factor_enable ? "✓ Activado" : "Desactivado"}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cambio de Contraseña */}
                    <Card className="shadow-sm border-gray-200">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center space-x-3 text-lg text-gray-800">
                                    <Key className="h-5 w-5 text-purple-600" />
                                    <span>Seguridad</span>
                                </CardTitle>
                                {!isEditingPassword && (
                                    <Button
                                        onClick={() => setIsEditingPassword(true)}
                                        variant="outline"
                                        size="sm"
                                        className="hover:bg-purple-50"
                                    >
                                        <Lock className="h-4 w-4 mr-2" />
                                        Cambiar Contraseña
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        
                        {isEditingPassword && (
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">Nueva Contraseña</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Introduce tu nueva contraseña"
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                                            className={`pr-10 transition-colors ${passwordErrors.password ? "border-red-500 focus:ring-red-200" : "focus:ring-purple-200"}`}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.password && <p className="text-red-500 text-sm">{passwordErrors.password}</p>}
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirma tu nueva contraseña"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className={`pr-10 transition-colors ${passwordErrors.confirmPassword ? "border-red-500 focus:ring-red-200" : "focus:ring-purple-200"}`}
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && <p className="text-red-500 text-sm">{passwordErrors.confirmPassword}</p>}
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button
                                        onClick={handlePasswordCancel}
                                        variant="outline"
                                        className="flex-1 hover:bg-gray-50"
                                        disabled={passwordLoading}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handlePasswordChange}
                                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                                        disabled={passwordLoading}
                                    >
                                        {passwordLoading ? (
                                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        {passwordLoading ? "Cambiando..." : "Cambiar Contraseña"}
                                    </Button>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}