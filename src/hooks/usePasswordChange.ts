import { useState } from 'react';
import Notiflix from 'notiflix';
import { api } from '@/lib/httpClient';

interface PasswordChangeData {
    password: string;
    confirmPassword: string;
}

export const usePasswordChange = (userId?: number) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validatePasswords = (password: string, confirmPassword: string): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!password) {
            newErrors.password = "La contraseña es requerida";
        } else if (password.length < 6) {
            newErrors.password = "La contraseña debe tener al menos 6 caracteres";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirma tu contraseña";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Las contraseñas no coinciden";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const changePassword = async (data: PasswordChangeData): Promise<boolean> => {
        if (!userId) {
            Notiflix.Notify.failure('ID de usuario no válido');
            return false;
        }

        if (!validatePasswords(data.password, data.confirmPassword)) {
            return false;
        }

        setLoading(true);
        setErrors({});

        try {
            await api.patch(`/users/${userId}`, {
                password: data.password
            });

            Notiflix.Notify.success('Contraseña actualizada exitosamente');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            console.error('Error changing password:', err);
            Notiflix.Notify.failure(
                errorMessage || 'No se pudo cambiar la contraseña'
            );
            return false;
        } finally {
            setLoading(false);
        }
    };

    const clearErrors = () => {
        setErrors({});
    };

    return {
        changePassword,
        loading,
        errors,
        clearErrors
    };
};