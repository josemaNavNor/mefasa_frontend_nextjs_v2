import { useState, useEffect } from "react"
import Swal from 'sweetalert2'
import { eventEmitter } from './useEventListener'

export function useModules() {
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function getModules() {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/modules");
            const data = await response.json();
            setModules(data.flat());
            //console.log('API:', data);
        } catch (error) {
            console.error("Error al obtener los módulos:", error);
        } finally {
            setLoading(false);
        }
    }

    async function createModule(module: { name: string, description: string }) {
        setLoading(true);
        try {
            const response = await fetch("https://mefasa-backend-nestjs.onrender.com/api/v1/modules", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(module),
            });
            const data = await response.json();
            
            if (response.ok) {
                setModules((prevModules) => [...prevModules, data]);

                eventEmitter.emit('data-changed', 'modules');
                eventEmitter.emit('modules-updated');

                Swal.fire({
                    icon: 'success',
                    title: 'Módulo creado',
                    text: `${data.message}`,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error al crear el módulo',
                    text: `${data.message || ''}`,
                });
            }
        } catch (error) {
            console.error("Error al crear el módulo:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error al crear el módulo',
            });
        } finally {
            setLoading(false);
        }
    }

    const refetch = () => {
        getModules();
    };

    useEffect(() => {
        getModules();
    }, []);

    return { modules, loading, createModule, refetch };
}