import { useState, useEffect } from 'react';
import Notiflix from 'notiflix';
import { eventEmitter } from './useEventListener';
import { api } from '@/lib/httpClient'


interface TicketComment {
  id: string;
  ticket_id: number;
  body: string;
  technician_id: number;
  is_public: boolean;
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
  is_public: boolean;
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
      Notiflix.Notify.failure('Error al cargar los comentarios');
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

      eventEmitter.emitWithDebounce('data-changed', 200, 'ticket-comments');
      eventEmitter.emitWithDebounce('ticket-comments-updated', 200);
      eventEmitter.emitWithDebounce('ticket-history-updated', 300, ticketId);
      Notiflix.Notify.success('Respuesta enviada con éxito');
      return response;
    } catch (error) {
      console.error('Error al crear el comentario:', error);
      Notiflix.Notify.failure(
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