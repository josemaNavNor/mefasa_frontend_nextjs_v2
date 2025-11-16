import { USER_ROLES } from "@/lib/constants";

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export interface User {
  readonly id: number;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly isActive?: boolean;
  readonly lastLogin?: string;
}

export interface AuthState {
  readonly user: User | null;
  readonly loading: boolean;
  readonly isAuthenticated: boolean;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
  readonly token?: string | undefined; // For 2FA
}

export interface LoginResponse {
  readonly user: User;
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_in?: number;
}

export interface AuthContextValue {
  // State
  readonly user: User | null;
  readonly loading: boolean;
  readonly isAuthenticated: boolean;
  
  // Actions
  readonly login: (email: string, password: string, token?: string) => Promise<{ success: boolean; error?: string }>;
  readonly logout: () => void;
  
  // Role helpers
  readonly hasRole: (roles: UserRole | UserRole[]) => boolean;
  readonly isAdmin: boolean;
  readonly isTech: boolean;
  readonly isUserFinal: boolean;
}