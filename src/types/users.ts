export type User = {
    id: string,
    name: string
    last_name: string
    role: { role_name: string }
    email: string,
    phone_number: string,
    is_email_verified: boolean,
    created_at: string,
    updated_at: string,
    deleted_at: string | 'Activo',
}
