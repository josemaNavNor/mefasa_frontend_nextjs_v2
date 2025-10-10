// Este tipo se usa para representar una planta en la base de datos
export type Floor = {
    id: string,
    floor_name: string
    description: string,
    created_at: string,
    updated_at: string,
    deleted_at: string | 'Activo',
}

// Este tipo se usa para representar los datos del formulario de plantas
export interface FormsFloor {
    id: number;
    floor_name: string;
    description: string;
}