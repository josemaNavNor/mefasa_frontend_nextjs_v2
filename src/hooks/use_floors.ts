import { useState, useEffect } from "react"
import Notiflix from 'notiflix';
import { eventEmitter } from './useEventListener'
import { api } from '@/lib/httpClient'

export function useFloors() {
    const [floors, setFloors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchFloors() {
        setLoading(true);
        try {
            const data = await api.get('/floors');
            if(Array.isArray(data)){
                setFloors(data);
            } else if (data && Array.isArray(data.floors)) {
                setFloors(data.floors);
            } else {
                console.error('Unexpected data structure:', data);
                setFloors([]);
            }
        } catch (error) {
            setFloors([]);
        } finally {
            setLoading(false);
        }
    }

    async function createFloor(floor: { floor_name: string, description: string }) {
        setLoading(true);
        try {
            const response = await api.post('/floors', floor);
            setFloors((prevFloors) => [...prevFloors, response]);
            eventEmitter.emit('data-changed', 'floors');
            eventEmitter.emit('floors-updated');
            Notiflix.Notify.success(`Planta ${floor.floor_name} creada correctamente`);
        } catch (error) {
            //console.error("Error al crear el piso:", error);
            Notiflix.Notify.failure(
                error instanceof Error ? `Error al crear el piso: ${error.message}` : 'Error al crear el piso: Error desconocido'
            );
        } finally {
            setLoading(false);
        }
    }

    async function updateFloor(id: number, floor: { floor_name?: string, description?: string }) {
        setLoading(true);
        try {
            const response = await api.patch(`/floors/${id}`, floor);
            setFloors((prevFloors) =>
                prevFloors.map((f) => (f.id === id ? { ...f, ...response } : f))
            );
            eventEmitter.emit('data-changed', 'floors');
            eventEmitter.emit('floors-updated');
            Notiflix.Notify.success(`Planta ${floor.floor_name ?? ''} actualizada correctamente`);
            return response;
        } catch (error) {
            //console.error("Error al actualizar la planta:", error);
            Notiflix.Notify.failure(
                error instanceof Error ? `Error al actualizar la planta: ${error.message}` : 'Error al actualizar la planta: Error desconocido'
            );
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function deleteFloor(id: number) {
        setLoading(true);
        try {
            await api.delete(`/floors/${id}`);
            setFloors((prevFloors) => prevFloors.filter((floor) => floor.id !== id));
            eventEmitter.emit('data-changed', 'floors');
            eventEmitter.emit('floors-updated');
            Notiflix.Notify.success('Planta eliminada correctamente');
            return true;
        } catch (error) {
            //console.error("Error al eliminar la planta:", error);
            Notiflix.Notify.failure(
                error instanceof Error ? `Error al eliminar la planta: ${error.message}` : 'Error al eliminar la planta: Error desconocido'
            );
            return false;
        } finally {
            setLoading(false);
        }
    }

    const refetch = () => {
        fetchFloors();
    };

    useEffect(() => {
        fetchFloors();
    }, []);

    return { floors, loading, createFloor, refetch, updateFloor, deleteFloor };
}