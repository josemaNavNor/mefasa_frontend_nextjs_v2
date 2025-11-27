import { useState, useEffect } from 'react';
import { notifications } from '@/lib/notifications';
import { eventEmitter } from './useEventListener';
import { api } from '@/lib/httpClient';
import { TICKET_EVENTS } from '@/lib/events';


interface TicketComment {
  id: string;
  ticket_id: number;
  body: string;
  technician_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  delete_by: number | null;
  users: {
    id: number;
    name: string;
    last_name: string;
    email: string;
  };
  comments_files?: any[];
}

interface CreateCommentData {
  ticket_id: number;
  body: string;
  technician_id: number;
}

export function useTicketComments(ticketId?: number) {
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loading, setLoading] = useState(false);
  
  async function fetchCommentsByTicket(id: number) {
    setLoading(true);
    try {
      const response = await api.get(`/tickets-comments/by-ticket/${id}`);

      if (Array.isArray(response)) {
        setComments(response);
      } else if (response && Array.isArray(response.comments)) {
        setComments(response.comments);
      } else if (response && typeof response === 'object' && !Array.isArray(response)) {
        setComments([response]);
      } else {
        console.error('Unexpected data structure:', response);
        setComments([]);
      }
    } catch (error) {
      console.error('Error al obtener los comentarios:', error);
      notifications.error('Error al cargar los comentarios');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }

  async function createComment(commentData: CreateCommentData) {
    setLoading(true);
    try {
      const response = await api.post('/tickets-comments', commentData);

      if (ticketId) {
        await fetchCommentsByTicket(ticketId);
      }

      eventEmitter.emit(TICKET_EVENTS.UPDATED, { ticketId });
      eventEmitter.emit(TICKET_EVENTS.REFRESH_TICKETS_PAGE);
      eventEmitter.emitWithDebounce('ticket-history-updated', 300, ticketId);
      // Notificación movida a useTicketModal para incluir información sobre archivos
      return response;
    } catch (error) {
      // No mostrar notificación si es error de autorización (ya se muestra en httpClient)
      if ((error as any)?.type === 'AUTHORIZATION_ERROR') {
        throw error;
      }
      console.error('Error al crear el comentario:', error);
      notifications.error(
        error instanceof Error ? `Error al crear el comentario: ${error.message}` : 'Error al crear el comentario'
      );
      throw error;
    } finally {
      setLoading(false);
    }
  }

  const refetch = () => {
    if (ticketId) {
      fetchCommentsByTicket(ticketId);
    }
  };

  useEffect(() => {
    if (ticketId && ticketId > 0) {
      fetchCommentsByTicket(ticketId);
    }
  }, [ticketId]);

  return {
    comments,
    loading,
    createComment,
    fetchCommentsByTicket,
    refetch
  };
}