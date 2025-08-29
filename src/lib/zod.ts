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