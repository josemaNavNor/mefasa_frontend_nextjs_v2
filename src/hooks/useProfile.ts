import { useState, useEffect, useCallback } from 'react';
import { notifications } from '@/lib/notifications';
import { UserProfile, UpdateProfileData } from '@/types/profile';
import { api } from '@/lib/httpClient';
import { fileToBase64, validateImage } from '@/lib/image-utils';

export const useProfile = (userId?: number) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async (id: number) => {
        if (!id) return;
        
        setLoading(true);
        setError(null);

        try{
            const response = await api.get(`/users/${id}`);
            setProfile(response);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error('Error fetching profile:', err);
            notifications.error('Error al cargar el perfil');
        } finally {
            setLoading(false);
        }
    }, []);

    const updateProfile = async (updateData: UpdateProfileData): Promise<boolean> => {
        if (!profile?.id) return false;

        setLoading(true);
        setError(null);

        try {
            const response = await api.patch(`/users/profile/${profile.id}`, updateData);
            setProfile(response);
            notifications.success('Perfil actualizado exitosamente');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error('Error updating profile:', err);

            notifications.error(
                errorMessage || 'No se pudo actualizar el perfil'
            );
            return false;
        } finally {
            setLoading(false);
        }
    };

    const uploadAvatar = async (file: File): Promise<boolean> => {
        if (!profile?.id) return false;

        // Validar la imagen
        const validation = validateImage(file, 5);
        if (!validation.isValid) {
            notifications.error(validation.errorMessage || 'Error al validar la imagen');
            return false;
        }

        setLoading(true);
        setError(null);

        try {
            // Convertir archivo a base64
            const base64Data = await fileToBase64(file);

            // Subir el avatar (el backend actualiza automáticamente el avatar_url del usuario)
            await api.post('/files/avatar', {
                filename: file.name,
                file_type: file.type,
                user_id: profile.id,
                file_data: base64Data
            });

            // Recargar el perfil para obtener el avatar_url actualizado
            await refetch();
            notifications.success('Foto de perfil actualizada exitosamente');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error('Error uploading avatar:', err);
            notifications.error('No se pudo subir la foto de perfil');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const refetch = async () => {
        if (profile?.id) {
            await fetchProfile(profile.id);
        } else if (userId) {
            await fetchProfile(userId);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchProfile(userId);
        }
    }, [userId, fetchProfile]);

    return {
        profile,
        loading,
        error,
        updateProfile,
        uploadAvatar,
        refetch,
    };
};