import { useState, useEffect } from "react"
import Notiflix from 'notiflix';
import { eventEmitter } from './useEventListener'
import { TYPE_EVENTS, GLOBAL_EVENTS } from '@/lib/events'
import {api} from '@/lib/httpClient'

export function useType() {
    const [types, setTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    async function fetchTicketsType() {
        setLoading(true);
        try {
            const response = await api.get('/types');
            
            if (Array.isArray(response)) {
                setTypes(response);
            } else if (response && Array.isArray(response.types)) {
                setTypes(response.types);
            } else if (response && typeof response === 'object' && !Array.isArray(response)) {
                setTypes([response]);
            } else {
                console.error('Unexpected data structure:', response);
                setTypes([]);
            }
        } catch (error) {
            console.error("Error al obtener los tipos de ticket:", error);
            setTypes([]);
        } finally {
            setLoading(false);
        }
    }

    async function createType(type: { type_name: string, description: string }) {
        setLoading(true);
        try {
            const response = await api.post('/types', type);
            
            setTypes((prevTypes) => [...prevTypes, response]);
            
            // Emitir eventos específicos para tipos de tickets
            eventEmitter.emit(TYPE_EVENTS.CREATED, response);
            eventEmitter.emit(TYPE_EVENTS.CLOSE_FORM);
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'types');
            eventEmitter.emit('types-updated');
            
            Notiflix.Notify.success('Tipo creado correctamente');
        } catch (error) {
            console.error("Error al crear el tipo:", error);
            Notiflix.Notify.failure(
                error instanceof Error ? `Error al crear el tipo: ${error.message}` : 'Error al crear el tipo'
            );
        } finally {
            setLoading(false);
        }
    }

    async function updateType(id: number, type: { type_name?: string, description?: string }) {
        setLoading(true);
        try {
            const response = await api.patch(`/types/${id}`, type);
            setTypes((prevTypes) =>
                prevTypes.map((t) => (t.id === id ? { ...t, ...response } : t))
            );
            // Emitir eventos específicos para tipos de tickets
            eventEmitter.emit(TYPE_EVENTS.UPDATED, { id, data: response });
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'types');
            eventEmitter.emit('types-updated');
            Notiflix.Notify.success('Tipo de ticket actualizado correctamente');
            return response;
        } catch (error) {
            console.error("Error al actualizar el tipo de ticket:", error);
            Notiflix.Notify.failure(
                error instanceof Error ? `Error al actualizar el tipo: ${error.message}` : 'Error al actualizar el tipo: Error desconocido'
            );
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function deleteType(id: number) {
        setLoading(true);
        try {
            await api.delete(`/types/${id}`);
            setTypes((prevTypes) => prevTypes.filter((type) => type.id !== id));
            // Emitir eventos específicos para tipos de tickets
            eventEmitter.emit(TYPE_EVENTS.DELETED, { id });
            // Mantener eventos globales para compatibilidad
            eventEmitter.emit(GLOBAL_EVENTS.DATA_CHANGED, 'types');
            eventEmitter.emit('types-updated');
            Notiflix.Notify.success('Tipo de ticket eliminado correctamente');
            return true;
        } catch (error) {
            console.error("Error al eliminar el tipo de ticket:", error);
            Notiflix.Notify.failure(
                error instanceof Error ? `Error al eliminar el tipo: ${error.message}` : 'Error al eliminar el tipo: Error desconocido'
            );
            return false;
        } finally {
            setLoading(false);
        }
    }

    const refetch = () => {
        fetchTicketsType();
    };

    useEffect(() => {
        fetchTicketsType();
    }, []);

    return { types, loading, createTicketType: createType, refetch, updateTicketType: updateType, deleteTicketType: deleteType };
}