"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/useUsersAdmin";
import { useRoles } from "@/hooks/useRoles";
import { userSchema } from "@/lib/zod";

export default function CreateUserPage() {
    const { roles } = useRoles();
    const { createUser } = useUsers();
    const [name, setName] = useState("");
    const [last_name, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phone_number, setPhoneNumber] = useState("");
    const [password, setPassword] = useState("");
    const [roleId, setRoleId] = useState("");
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const result = userSchema.safeParse({
            name,
            last_name,
            email,
            password,
            phone_number,
            role_id: Number(roleId),
        });
        // maneja los errores de validacion de campos con zod
        if (!result.success) {
            const formatted = result.error.format();
            setErrors({
                name: formatted.name?._errors?.[0] || "",
                last_name: formatted.last_name?._errors?.[0] || "",
                email: formatted.email?._errors?.[0] || "",
                password: formatted.password?._errors?.[0] || "",
                phone_number: formatted.phone_number?._errors?.[0] || "",
                role_id: formatted.role_id?._errors?.[0] || "",
            });
            return;
        }
        await createUser({
            name,
            last_name,
            email,
            password,
            phone_number,
            role_id: Number(roleId),
            is_email_verified: false,
            email_verification_token: '',
            two_factor_enable: false,
            two_factor_secret: ''
        });
        setName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setPhoneNumber("");
        setRoleId("");
    };

    return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100">
            <div className=" bg-white shadow-md rounded-xl p-8 md:p-10 w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-center mb-8 text-black">Crear Usuario</h1>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 grid-rows-3 gap-6">
                    <div>
                        <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-700">
                            Nombre del usuario <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            autoComplete="off"
                            placeholder="Nombre del usuario"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.name ? ' border-red-500' : ' border-gray-200'}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block mb-2 text-sm font-semibold text-gray-700">
                            Apellidos del usuario <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            autoComplete="off"
                            placeholder="Apellidos"
                            value={last_name}
                            onChange={(e) => setLastName(e.target.value)}
                            className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.last_name ? ' border-red-500' : ' border-gray-200'}`}
                        />
                        {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
                    </div>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700">
                            Correo electrónico <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="off"
                            placeholder="Correo electrónico"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.email ? ' border-red-500' : ' border-gray-200'}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700">
                            Contraseña <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="password"
                            type="password"
                            autoComplete="off"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.password ? ' border-red-500' : ' border-gray-200'}`}
                        />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    <div>
                        <label htmlFor="phone_number" className="block mb-2 text-sm font-semibold text-gray-700">
                            Número de teléfono
                        </label>
                        <input
                            id="phone_number"
                            type="tel"
                            autoComplete="off"
                            placeholder="Número de teléfono"
                            value={phone_number}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className={`w-full border-2 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.phone_number ? ' border-red-500' : ' border-gray-200'}`}
                        />
                        {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                    </div>
                    <div>
                        <label htmlFor="options" className="block mb-2 text-sm font-semibold text-gray-700">
                            Rol <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="options"
                            value={roleId}
                            onChange={(e) => setRoleId(e.target.value)}
                            className={`w-full border-2 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-400 transition placeholder:text-gray-300${errors.role_id ? ' border-red-500' : ' border-gray-200'}`}
                        >
                            <option value="" disabled hidden>-- Selecciona --</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.rol_name}
                                </option>
                            ))}
                        </select>
                        {errors.role_id && <p className="text-red-500 text-xs mt-1">{errors.role_id}</p>}
                    </div>
                    <div className="col-span-1 md:col-span-2 flex items-center justify-center">
                        <button
                            type="submit"
                            className="w-50 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow transition duration-150 ease-in-out"
                        >
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
