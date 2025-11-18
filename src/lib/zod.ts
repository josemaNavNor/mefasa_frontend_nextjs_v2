import { z } from "zod";

export const userSchema = z.object({
    name: z.string()
        .min(1, { message: "El nombre es requerido" })
        .max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
    last_name: z.string()
        .min(1, { message: "El apellido es requerido" })
        .max(100, { message: "El apellido debe tener menos de 100 caracteres" }),
    email: z.string()
        .email({ message: "Email inválido" })
        .min(1, { message: "El email es requerido" }),
    password: z.string()
        .min(1, { message: "La contraseña es requerida" })
        .min(6, { message: "La contraseña debe tener más de 6 caracteres" })
        .max(32, { message: "La contraseña debe tener menos de 32 caracteres" }),
    phone_number: z.string()
        .regex(/^[0-9\s\-]+$/, { message: "Solo números, espacios o guiones" })
        .min(10, { message: "El número de teléfono debe tener al menos 10 caracteres" })
        .max(15, { message: "El número de teléfono debe tener menos de 15 caracteres" })
        .optional()
        .or(z.literal("").transform(() => undefined)),
    role_id: z.number().refine(val => val > 0, { message: "Debes seleccionar un rol" }),
});

export const roleSchema = z.object({
    role_name: z.string()
        .min(1, { message: "El nombre del rol es requerido" })
        .max(100, { message: "El nombre del rol debe tener menos de 100 caracteres" }),
    description: z.string()
        .min(1, { message: "La descripción es requerida" })
        .max(255, { message: "La descripción debe tener menos de 255 caracteres" })
        .optional()
        .or(z.literal("").transform(() => undefined)),
});

export const floorSchema = z.object({
    floor_name: z.string()
        .min(1, { message: "El nombre de la planta es requerido" })
        .max(100, { message: "El nombre de la planta debe tener menos de 100 caracteres" }),
    description: z.string()
        .max(255, { message: "La descripción debe tener menos de 255 caracteres" })
        .optional()
        .or(z.literal("").transform(() => undefined)),
});

export const areaSchema = z.object({
    area_name: z.string()
        .min(1, { message: "El nombre de la planta es requerido" })
        .max(100, { message: "El nombre de la planta debe tener menos de 100 caracteres" }),
    floor_id: z.number().refine(val => val > 0, { message: "Debes seleccionar una planta" }),
});

export const ticketTypeSchema = z.object({
    type_name: z.string()
        .min(1, { message: "El nombre del tipo de ticket es requerido" })
        .max(100, { message: "El nombre del tipo de ticket debe tener menos de 100 caracteres" }),
    description: z.string()
        .max(255, { message: "La descripción debe tener menos de 255 caracteres" })
        .optional()
        .or(z.literal("").transform(() => undefined)),
});

export const loginSchema = z.object({
    email: z.string()
        .min(1, { message: "El email es requerido" })
        .email({ message: "Email inválido" }),
    password: z.string()
        .min(1, { message: "La contraseña es requerida" })
        .min(6, { message: "La contraseña debe tener más de 6 caracteres" }),
    otp: z.string()
        .optional()
        .refine((val) => {
            if (!val || val === "") return true; // Permitir vacío u opcional
            return val.length === 6 && /^[0-9]{6}$/.test(val);
        }, { message: "El token debe tener exactamente 6 dígitos numéricos" })
});

export const registerSchema = z.object({
    name: z.string()
        .min(1, { message: "El nombre es requerido" })
        .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
        .max(50, { message: "El nombre no puede tener más de 50 caracteres" })
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/, { message: "Solo se permiten letras, espacios y guiones" }),
    last_name: z.string()
        .min(1, { message: "El apellido es requerido" })
        .min(2, { message: "El apellido debe tener al menos 2 caracteres" })
        .max(50, { message: "El apellido no puede tener más de 50 caracteres" })
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/, { message: "Solo se permiten letras, espacios y guiones" }),
    email: z.string()
        .min(1, { message: "El email es requerido" })
        .email({ message: "Email inválido" }),
    password: z.string()
        .min(1, { message: "La contraseña es requerida" })
        .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
        .max(32, { message: "La contraseña debe tener menos de 32 caracteres" })
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { message: "La contraseña debe contener al menos una mayúscula, una minúscula y un número" }),
    confirmPassword: z.string()
        .min(1, { message: "Confirmar contraseña es requerido" }),
    phone_number: z.string()
        .regex(/^[0-9\s\-+()]*$/, { message: "Solo números, espacios y los siguientes caracteres: - + ( )" })
        .min(10, { message: "El número de teléfono debe tener al menos 10 caracteres" })
        .max(15, { message: "El número de teléfono debe tener menos de 15 caracteres" })
        .optional()
        .or(z.literal("").transform(() => undefined))
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export const profileSchema = z.object({
    name: z.string()
        .min(1, { message: "El nombre es requerido" })
        .min(2, { message: "El nombre debe tener al menos 2 caracteres" })
        .max(50, { message: "El nombre no puede tener más de 50 caracteres" })
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/, { message: "Solo se permiten letras, espacios y guiones" }),
    last_name: z.string()
        .min(1, { message: "El apellido es requerido" })
        .min(2, { message: "El apellido debe tener al menos 2 caracteres" })
        .max(50, { message: "El apellido no puede tener más de 50 caracteres" })
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-]+$/, { message: "Solo se permiten letras, espacios y guiones" }),
    phone_number: z.string()
        .regex(/^[0-9\s\-+()]*$/, { message: "Solo números, espacios y los siguientes caracteres: - + ( )" })
        .min(0)
        .max(15, { message: "El número de teléfono no puede tener más de 15 caracteres" })
        .optional()
        .or(z.literal(""))
});

export const filterSchema = z.object({
    startDate: z.string().refine((val) => {
        return val === "" || !isNaN(Date.parse(val));
    }, { message: "Fecha de inicio inválida" }),
    endDate: z.string().refine((val) => {
        return val === "" || !isNaN(Date.parse(val));
    }, { message: "Fecha de fin inválida" }),
});

export const ticketFilterSchema = z.object({
    filter_name: z.string()
        .min(1, { message: "El nombre del filtro es requerido" })
        .max(100, { message: "El nombre no puede tener más de 100 caracteres" }),
    description: z.string()
        .max(500, { message: "La descripción no puede tener más de 500 caracteres" })
        .optional(),
    is_public: z.boolean(),
    criteria: z.array(z.object({
        field_name: z.string()
            .min(1, { message: "El campo es requerido" }),
        operator: z.string()
            .min(1, { message: "El operador es requerido" }),
        value: z.string()
            .optional(),
        logical_operator: z.string()
            .optional(),
    }).refine((criterion) => {
        // Los operadores IS_NULL e IS_NOT_NULL no necesitan valor
        const operatorsWithoutValue = ['IS_NULL', 'IS_NOT_NULL'];
        const needsValue = !operatorsWithoutValue.includes(criterion.operator);
        
        if (needsValue && (!criterion.value || criterion.value.trim() === '')) {
            return false;
        }
        return true;
    }, {
        message: "El valor es requerido para este operador",
        path: ["value"]
    })).min(1, { message: "Debe tener al menos un criterio" }),
});
