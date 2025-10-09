export interface UserProfile {
    id: number;
    name: string;
    last_name: string;
    email: string;
    phone_number?: string;
    role_id: number;
    is_email_verified: boolean;
    two_factor_enable: boolean;
    created_at: string;
    updated_at: string;
    role?: {
        id: number;
        rol_name: string;
        description: string;
    };
}

export interface UpdateProfileData {
    name: string;
    last_name: string;
    phone_number?: string;
}