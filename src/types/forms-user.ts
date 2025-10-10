export interface UserFormData {
    name: string;
    last_name: string;
    email: string;
    password: string;
    phone_number: string;
    role_id: number;
}

export interface EditUserFormData {
    name: string;
    last_name: string;
    email: string;
    phone_number: string;
    role_id: number;
    password?: string;
}

export interface FormState {
    name: string;
    last_name: string;
    email: string;
    phone_number: string;
    password: string;
    confirmPassword: string;
    roleId: string;
}

export interface EditFormState {
    editName: string;
    editLastName: string;
    editEmail: string;
    editPhoneNumber: string;
    editPassword: string;
    editConfirmPassword: string;
    editRoleId: string;
}