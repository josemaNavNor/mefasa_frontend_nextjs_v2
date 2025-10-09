"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
    autoRefreshEnabled: boolean;
    autoRefreshInterval: number;
    setAutoRefreshEnabled: (enabled: boolean) => void;
    setAutoRefreshInterval: (interval: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(30000); // 30 segundos

    // Cargar configuraciones del localStorage al iniciar
    useEffect(() => {
        const savedAutoRefresh = localStorage.getItem('autoRefreshEnabled');
        const savedInterval = localStorage.getItem('autoRefreshInterval');
        
        if (savedAutoRefresh !== null) {
            setAutoRefreshEnabled(JSON.parse(savedAutoRefresh));
        }
        
        if (savedInterval !== null) {
            setAutoRefreshInterval(parseInt(savedInterval));
        }
    }, []);

    // Guardar configuraciones en localStorage cuando cambien
    const handleSetAutoRefreshEnabled = (enabled: boolean) => {
        setAutoRefreshEnabled(enabled);
        localStorage.setItem('autoRefreshEnabled', JSON.stringify(enabled));
    };

    const handleSetAutoRefreshInterval = (interval: number) => {
        setAutoRefreshInterval(interval);
        localStorage.setItem('autoRefreshInterval', interval.toString());
    };

    return (
        <SettingsContext.Provider value={{
            autoRefreshEnabled,
            autoRefreshInterval,
            setAutoRefreshEnabled: handleSetAutoRefreshEnabled,
            setAutoRefreshInterval: handleSetAutoRefreshInterval
        }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}