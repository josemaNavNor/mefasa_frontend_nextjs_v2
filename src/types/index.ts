// Export specific types to avoid conflicts
export type { User as AuthUser, UserRole, AuthState, LoginCredentials, LoginResponse, AuthContextValue } from './use_auth';
export type { User as AdminUser } from './users';
export type { 
  Ticket, 
  TicketPage, 
  TicketComment, 
  CommentFile, 
  TicketHistoryItem, 
  TicketFile,
  User as TicketUser,
  TicketType as TicketTypeDetail,
  Floor as TicketFloor
} from './ticket';
export type { Floor, FormsFloor } from './floor';
export type { TicketType } from './ticketType';
export * from './filter';
export * from './rol';
export * from './profile';
export type { CreateTicketDto, UpdateTicketDto, TicketFiltersDto } from './ticket.dto';

// Common utility types
export type ID = number | string;

export interface ApiResponse<T = unknown> {
  readonly data: T;
  readonly message?: string;
  readonly success: boolean;
  readonly errors?: string[];
}

export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
  readonly sortBy?: string;
  readonly sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  readonly pagination: {
    readonly currentPage: number;
    readonly totalPages: number;
    readonly totalItems: number;
    readonly itemsPerPage: number;
    readonly hasNextPage: boolean;
    readonly hasPrevPage: boolean;
  };
}

export interface SelectOption<T = string> {
  readonly value: T;
  readonly label: string;
  readonly disabled?: boolean;
}

export interface FormError {
  readonly field: string;
  readonly message: string;
}

export interface Toast {
  readonly id: string;
  readonly type: 'success' | 'error' | 'warning' | 'info';
  readonly message: string;
  readonly duration?: number;
}

// Component prop types
export interface BaseComponentProps {
  readonly className?: string;
  readonly children?: React.ReactNode;
  readonly testId?: string;
}

export interface ModalProps extends BaseComponentProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly title?: string;
  readonly size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface ButtonProps extends BaseComponentProps {
  readonly variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  readonly size?: 'sm' | 'md' | 'lg';
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onClick?: () => void;
  readonly type?: 'button' | 'submit' | 'reset';
}

// Form types
export interface FormField<T = unknown> {
  readonly name: string;
  readonly label: string;
  readonly type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio';
  readonly value: T;
  readonly placeholder?: string;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly options?: SelectOption[];
  readonly validation?: {
    readonly min?: number;
    readonly max?: number;
    readonly pattern?: RegExp;
    readonly custom?: (value: T) => string | null;
  };
}

// Date and time types
export interface DateRange {
  readonly from: Date;
  readonly to: Date;
}

export interface TimeSlot {
  readonly start: string; // HH:mm format
  readonly end: string;   // HH:mm format
}