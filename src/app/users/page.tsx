"use client";
import { useUsers } from "@/hooks/useUsersAdmin";
import { Button } from "@/components/ui/button"
import Link from "next/link";
import { columns, User } from "./columns"
import { DataTable } from "./data-table"


export default function UsersPage() {
    const { users, loading } = useUsers();

    if (loading) return <p>Cargando usuarios...</p>;

    return (
        // <div className="min-h-screen bg-gray-400 from-gray-900 to-gray-700 py-10 px-4">
        //     <div className=" bg-white/90 shadow-xl rounded-xl p-6 md:p-10">
        //         <h1 className="text-3xl font-bold mb-8 text-gray-900">Lista de Usuarios</h1>
        //         {users && users.length > 0 ? (
        //             <div className="overflow-x-auto">
        //                 <div className="float-right mb-4 bg-gray-300 p-2 rounded-md shadow space-x-2">
        //                     <Button asChild className="bg-green-600 text-white px-4 py-2 rounded-md">
        //                         <Link href="/users/create">Crear Usuario</Link>
        //                     </Button>
        //                 </div>
        //                 <table className="min-w-full divide-y divide-gray-200">
        //                     <thead className="bg-gray-100">
        //                         <tr>
        //                             <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Nombre</th>
        //                             <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Apellidos</th>
        //                             <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Rol</th>
        //                             <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Correo</th>
        //                             <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Numero de telefono</th>
        //                             <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Email verificado</th>
        //                             <th className="px-4 py-2 text-left text-xs font-semibold text-gray-700">Acciones</th>
        //                         </tr>
        //                     </thead>
        //                     <tbody className="bg-white divide-y divide-gray-200">
        //                         {users.map((user) => (
        //                             <tr key={user.id} className="hover:bg-gray-50 transition">
        //                                 <td className="px-4 py-3 text-sm text-gray-800 font-medium">{user.name}</td>
        //                                 <td className="px-4 py-3 text-sm text-gray-700">{user.last_name}</td>
        //                                 <td className="px-4 py-3 text-sm text-green-700 font-semibold">{user.role.rol_name}</td>
        //                                 <td className="px-4 py-3 text-sm text-gray-700">{user.email}</td>
        //                                 <td className="px-4 py-3 text-sm text-gray-700">{user.phone_number ? user.phone_number : 'N/A'}</td>
        //                                 <td className="px-4 py-3 text-sm text-gray-700">{user.is_email_verified ? 'Sí' : 'No'}</td>
        //                                 <td className="px-4 py-3 text-sm text-gray-700 space-x-2">
        //                                     <Button asChild className="bg-blue-500 text-white px-4 py-2 rounded-md">
        //                                         <Link href={`/users/${user.id}/edit`}>Editar</Link>
        //                                     </Button>
        //                                     <Button asChild className="bg-red-500 text-white px-4 py-2 rounded-md">
        //                                         <Link href={`/users/${user.id}/delete`}>Eliminar</Link>
        //                                     </Button>
        //                                 </td>
        //                             </tr>
        //                         ))}
        //                     </tbody>
        //                 </table>
        //             </div>
        //         ) : (
        //             <div className="flex flex-col items-center justify-center py-10">
        //                 <p className="text-gray-500 text-lg">No hay usuarios disponibles.</p>
        //                 <svg className="w-16 h-16 mt-4 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20h6M3 20h5m4-16a4 4 0 110 8 4 4 0 010-8zm0 8v2m0 4v2m-7-6a4 4 0 013-3.87M21 20v-2a4 4 0 00-3-3.87" /></svg>
        //             </div>
        //         )}
        //     </div>
        // </div>
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={users} />
        </div>
    );
}
