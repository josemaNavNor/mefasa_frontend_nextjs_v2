// Utilidades para el manejo de tickets
export const createHistoryDescription = (field: string, oldValue: any, newValue: any, users: any[], types: any[]) => {
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
        due_date: 'Fecha límite'
    }
    return fieldNames[field] || field
}

export const getCurrentUserId = (): number | null => {
    const userId = localStorage.getItem('userId') || '2'
    return parseInt(userId)
}