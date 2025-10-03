import { email, z } from "zod";

export const userSchema = z.object({
    name: z.string()
        .min(1, { message: "El nombre es requerido" })
        .max(100, { message: "El nombre debe tener menos de 100 caracteres" }),
    last_name: z.string()
        .min(1, { message: "El apellido es requerido" })
        .max(100, { message: "El apellido debe tener menos de 100 caracteres" }),
    email: email({ message: "Email inválido" })
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
    rol_name: z.string()
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

export const permissionSchema = z.object({
    perm_name: z.string()
        .min(1, { message: "El nombre del permiso es requerido" })
        .max(100, { message: "El nombre del permiso debe tener menos de 100 caracteres" }),
    moduleId: z.string()
        .min(1, { message: "El módulo es requerido" })
        .max(100, { message: "El módulo debe tener menos de 100 caracteres" }),
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
        .min(6, { message: "El código debe tener 6 dígitos" })
        .max(6, { message: "El código debe tener 6 dígitos" })
        .or(z.literal(""))
});
