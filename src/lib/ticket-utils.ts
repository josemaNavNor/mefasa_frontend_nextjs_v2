export const createHistoryDescription = (field: string, oldValue: any, newValue: any, users: any[], types: any[], floors?: any[]) => {
    const fieldName = getFieldDisplayName(field)
    
    let oldDisplayValue = oldValue
    let newDisplayValue = newValue
    
    if (field === 'technician_id') {
        oldDisplayValue = oldValue ? 
            users.find(u => u.id === oldValue)?.name + ' ' + users.find(u => u.id === oldValue)?.last_name || `ID: ${oldValue}` 
            : 'Sin asignar'
        newDisplayValue = newValue ? 
            users.find(u => u.id === newValue)?.name + ' ' + users.find(u => u.id === newValue)?.last_name || `ID: ${newValue}` 
            : 'Sin asignar'
    } else if (field === 'type_id') {
        oldDisplayValue = oldValue ? 
            types.find(t => t.id === oldValue)?.type_name || `ID: ${oldValue}`
            : 'Sin asignar'
        newDisplayValue = newValue ? 
            types.find(t => t.id === newValue)?.type_name || `ID: ${newValue}`
            : 'Sin asignar'
    } else if (field === 'floor_id' && floors) {
        oldDisplayValue = oldValue ? 
            floors.find(f => f.id === oldValue)?.floor_name || `ID: ${oldValue}`
            : 'Sin asignar'
        newDisplayValue = newValue ? 
            floors.find(f => f.id === newValue)?.floor_name || `ID: ${newValue}`
            : 'Sin asignar'
    } else {
        oldDisplayValue = oldValue || 'Sin asignar'
        newDisplayValue = newValue || 'Sin asignar'
    }
    
    return `${fieldName} cambiado de '${oldDisplayValue}' a '${newDisplayValue}'`
}

export const getFieldDisplayName = (field: string) => {
    const fieldNames: { [key: string]: string } = {
        status: 'Estado',
        priority: 'Prioridad',
        technician_id: 'Técnico asignado',
        type_id: 'Tipo',
        floor_id: 'Planta',
        due_date: 'Fecha límite'
    }
    return fieldNames[field] || field
}

export const getCurrentUserId = (): number | null => {
    try {
        // Verificar si estamos en el navegador (localStorage solo está disponible en el cliente)
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return null
        }
        
        const userString = localStorage.getItem('user')
        if (!userString) {
            console.warn('Usuario no encontrado en localStorage')
            return null
        }
        
        const user = JSON.parse(userString)
        return user?.id || null
    } catch (error) {
        console.error('Error al obtener el usuario de localStorage:', error)
        return null
    }
}

/**
 * Obtiene el email del usuario autenticado desde localStorage
 * @returns El email del usuario o null si no está disponible
 */
export const getCurrentUserEmail = (): string | null => {
    try {
        // Verificar si estamos en el navegador (localStorage solo está disponible en el cliente)
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return null
        }
        
        const userString = localStorage.getItem('user')
        if (!userString) {
            return null
        }
        
        const user = JSON.parse(userString)
        return user?.email || null
    } catch (error) {
        console.error('Error al obtener el email del usuario de localStorage:', error)
        return null
    }
}