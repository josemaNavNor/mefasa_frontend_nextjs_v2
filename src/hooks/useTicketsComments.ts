import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { eventEmitter } from './useEventListener';

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
  //const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  async function fetchCommentsByTicket(id: number) {
    setLoading(true);
    try {
      const response = await fetch(`https://mefasa-backend-nestjs.onrender.com/api/v1/tickets-comments/by-ticket/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener los comentarios');
      }
      
      const data = await response.json();
      setComments(data);
      return data;
    } catch (error) {
      console.error('Error al obtener los comentarios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar los comentarios',
      });
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function createComment(commentData: CreateCommentData) {
    setLoading(true);
    try {
      const response = await fetch('https://mefasa-backend-nestjs.onrender.com/api/v1/tickets-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(commentData),
      });
      
      const data = await response.json();

      if (response.ok) {
        // actualizar estado local inmediatamente
        setComments((prevComments) => [...prevComments, data]);
        
        // eventos globales
        eventEmitter.emit('data-changed', 'ticket-comments');
        eventEmitter.emit('ticket-comments-updated');
        
        Swal.fire({
          icon: 'success',
          title: 'Comentario creado',
          text: 'Comentario agregado exitosamente',
        });
        
        return data;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error al crear el comentario',
          text: `${data.message || ''}`,
        });
      }
    } catch (error) {
      console.error('Error al crear el comentario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al crear el comentario',
      });
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
    if (ticketId) {
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