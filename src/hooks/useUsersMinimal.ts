import { useState, useEffect } from "react"
import { api } from '@/lib/httpClient';

export interface MinimalUser {
    id: number;
    name: string;
    last_name: string;
    email: string;
    role?: {
        role_name: string;
    };
}

export function useUsersMinimal() {
    const [users, setUsers] = useState<MinimalUser[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchUsers() {
        setLoading(true);
        try {
            const response = await api.get('/users/onlyMinimInfo');
            
            if (Array.isArray(response)) {
                setUsers(response);
            } else if (response && Array.isArray(response.users)) {
                setUsers(response.users);
            } else if (response && typeof response === 'object' && !Array.isArray(response)) {
                setUsers([response]);
            } else {
                console.error('Unexpected data structure:', response);
                setUsers([]);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    return { users, loading };
}

