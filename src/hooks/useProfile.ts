import { useState, useEffect, useCallback } from 'react';
import Notiflix from 'notiflix';
import { UserProfile, UpdateProfileData } from '@/types/profile';
import { api } from '@/lib/httpClient'

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
            Notiflix.Notify.failure('Error al cargar el perfil');
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
            Notiflix.Notify.success('Perfil actualizado exitosamente');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error('Error updating profile:', err);

            Notiflix.Notify.failure(
                errorMessage || 'No se pudo actualizar el perfil'
            );
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
        refetch,
    };
};