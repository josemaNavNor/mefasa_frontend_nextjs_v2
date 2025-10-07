import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token'); 
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const isAdmin = () => {
    return user?.role === 'Administrador';
  };

  const isTechnician = () => {
    return user?.role === 'Tecnico';
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAdmin,
    isTechnician,
    logout,
  };
};