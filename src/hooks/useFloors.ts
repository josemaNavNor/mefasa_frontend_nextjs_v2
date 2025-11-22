import { useState, useEffect } from "react"
import Notiflix from 'notiflix';
import { eventEmitter } from './useEventListener'
import { api } from '@/lib/httpClient'
import { FLOOR_EVENTS, GLOBAL_EVENTS } from '@/lib/events'
import type { Floor } from '@/types'

export function useFloors() {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchFloors() {
        setLoading(true);
        try {
            const data = await api.get('/floors');
            // El api helper ahora maneja automáticamente la estructura {success, data, ...}
            // y devuelve solo los datos
            if(Array.isArray(data)){
                setFloors(data);
            } else {
                console.error('Unexpected data structure, expected array but got:', typeof data, data);
                setFloors([]);
            }
        } catch (error) {
            console.error('Error fetching floors:', error);
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
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'floors');
            eventEmitter.emit('floors-updated');
            Notiflix.Notify.success(`Planta ${floor.floor_name} creada correctamente`);
        } catch (error) {
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
                prevFloors.map((f) => (f.id.toString() === id.toString() ? { ...f, ...response } : f))
            );
            // Emitir eventos específicos para plantas
            eventEmitter.emit(FLOOR_EVENTS.UPDATED, { id, data: response });
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'floors');
            eventEmitter.emit('floors-updated');
            Notiflix.Notify.success(`Planta ${floor.floor_name ?? ''} actualizada correctamente`);
            return response;
        } catch (error) {
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
            setFloors((prevFloors) => prevFloors.filter((floor) => floor.id.toString() !== id.toString()));
            // Emitir eventos específicos para plantas
            eventEmitter.emit(FLOOR_EVENTS.DELETED, { id });
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'floors');
            eventEmitter.emit('floors-updated');
            Notiflix.Notify.success('Planta eliminada correctamente');
            return true;
        } catch (error) {
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


