/**
 * Data Transfer Objects (DTOs) para operaciones de tickets
 */

/**
 * DTO para crear un nuevo ticket
 */
export interface CreateTicketDto {
  readonly ticket_number: string;
  readonly summary: string;
  readonly description: string;
  readonly end_user: string;
  readonly technician_id: number | null;
  readonly type_id: number;
  readonly priority: string;
  readonly status: string;
  readonly floor_id: number | null;
  readonly due_date: string;
}

/**
 * DTO para actualizar un ticket existente
 */
export interface UpdateTicketDto {
  readonly summary?: string;
  readonly description?: string;
  readonly technician_id?: number | null;
  readonly type_id?: number;
  readonly priority?: string;
  readonly status?: string;
  readonly floor_id?: number | null;
  readonly due_date?: string;
}

/**
 * DTO para filtros de tickets
 */
export interface TicketFiltersDto {
  readonly ticket_number?: string;
  readonly summary?: string;
  readonly status?: string;
  readonly priority?: string;
  readonly type_id?: number;
  readonly floor_id?: number;
  readonly technician_id?: number;
  readonly created_at?: string;
  readonly updated_at?: string;
}


