import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

interface UserProfile {
    id: number;
    name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    role_id: number;
    is_email_verified: boolean;
    two_factor_enable: boolean;
    created_at: string;
    updated_at: string;
    role?: {
        id: number;
        rol_name: string;
        description: string;
    };
}

interface UpdateProfileData {
    name: string;
    last_name: string;
    phone_number?: string;
}

export const useProfile = (userId?: number) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };
    };

    const fetchProfile = async (id: number) => {
        if (!id) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`https://mefasa-backend-nestjs.onrender.com/api/v1/auth/profile/${id}`, {
                method: 'GET',
                headers: getAuthHeaders(),
            });

            if (response.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'No autorizado',
                    text: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
                });
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return;
            }

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setProfile(data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error('Error fetching profile:', err);
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo cargar la información del perfil',
            });
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (updateData: UpdateProfileData): Promise<boolean> => {
        if (!profile?.id) return false;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`https://mefasa-backend-nestjs.onrender.com/api/v1/users/profile/${profile.id}`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData),
            });

            if (response.status === 401) {
                Swal.fire({
                    icon: 'error',
                    title: 'No autorizado',
                    text: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
                });
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return false;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
            }

            const updatedProfile = await response.json();
            setProfile(updatedProfile);

            // Actualizar también el usuario en localStorage si es necesario
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                if (userData.id === profile.id) {
                    const updatedUser = {
                        ...userData,
                        name: updateData.name,
                        // Nota: El email no se puede cambiar desde el perfil
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            }

            Swal.fire({
                icon: 'success',
                title: '¡Perfil actualizado!',
                text: 'Tu información ha sido actualizada correctamente.',
                timer: 2000,
                showConfirmButton: false,
            });

            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setError(errorMessage);
            console.error('Error updating profile:', err);
            
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage || 'No se pudo actualizar el perfil',
            });

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
    }, [userId]);

    return {
        profile,
        loading,
        error,
        updateProfile,
        refetch,
    };
};