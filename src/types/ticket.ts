export interface TicketComment {
    id: string | number
    body: string
    created_at: string
    users?: {
        id: number
        name: string
        last_name: string
        email: string
    }
    comments_files?: CommentFile[]
}

export interface CommentFile {
    id: number
    ticket_comment: number
    file_id: number
    file?: {
        id: number
        filename: string
        file_type: string
        ticket_id: number
        file_data: string
        uploaded_at: string
    }
}

export interface TicketHistoryItem {
    id: string | number
    action_type: string
    description: string
    created_at: string
    user?: {
        name: string
        last_name: string
    }
}

export interface User {
    id: number
    name: string
    last_name: string
    email: string
    role?: {
        role_name: string  
    }
}

export interface TicketType {
    id: number
    type_name: string
}

export interface Floor {
    id: number
    floor_name: string
    description?: string
}

export interface TicketFile {
    id: number
    filename: string
    file_type: string
    ticket_id: number
    file_data: string
    uploaded_at: string
    deleted_at?: string | null
}

export interface Ticket {
    id: number
    ticket_number: string
    summary: string
    description?: string
    status: string
    priority: string
    technician_id?: number  
    technician?: {         
        id: number
        name: string
        last_name: string
    }
    type_id?: number
    floor_id?: number
    floor?: Floor
    due_date?: string
    created_at: string
    end_user: string
    file?: TicketFile[]  // Archivos directos del ticket
}

export type TicketPage = {
    id: string,
    ticket_number: string
    summary: string
    end_user: string
    technician: { name: string, last_name: string } | null,
    type: { type_name: string } | null,
    priority: string,
    status: string,
    due_date: string,
    created_at: string,
    updated_at: string,
    deleted_at: string | null,
}

