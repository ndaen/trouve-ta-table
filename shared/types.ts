export interface Project {
    id: string
    name: string
    eventType: 'wedding' | 'bar_mitzvah' | 'anniversary'
    eventDate: string
    qrCodeUrl?: string
}

export interface Guest {
    id: string
    projectId: string
    firstName: string
    lastName: string
    tableId?: string
    table?: Table
}

export interface Table {
    id: string
    projectId: string
    name: string
    capacity: number
}

