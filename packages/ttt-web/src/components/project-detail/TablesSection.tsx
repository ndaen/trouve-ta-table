import type { Table } from "@/types/table.types.ts";
import type { Guest } from "@/types/guest.types.ts";
import Button from "@/components/ui/buttons/Button.tsx";
import { DynamicIcon } from "lucide-react/dynamic";

interface TablesSectionProps {
    tables: Table[];
    guests: Guest[];
}

export default function TablesSection({ tables, guests }: TablesSectionProps) {
    const getTableOccupancy = (tableId: string) => {
        const tableGuests = guests.filter(g => g.tableId === tableId);
        return tableGuests.length;
    };

    const getOccupancyPercentage = (tableId: string, capacity: number) => {
        const occupied = getTableOccupancy(tableId);
        return capacity > 0 ? (occupied / capacity) * 100 : 0;
    };

    const getOccupancyStatus = (occupied: number, capacity: number) => {
        if (occupied === 0) return 'Vide';
        if (occupied === capacity) return 'Compléte';
        return 'Disponible';
    };

    const getStatusColor = (occupied: number, capacity: number) => {
        if (occupied === 0) return 'text-muted';
        if (occupied === capacity) return 'text-error';
        return 'text-success';
    };

    return (
        <div className="tables-section">
            {tables.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <DynamicIcon name="table" size={48} />
                    </div>
                    <h4 className="empty-state-title">Aucune table configurée</h4>
                    <p className="empty-state-description">
                        Commencez par ajouter des tables à votre projet
                    </p>
                    <Button variant="btn-primary">
                        <DynamicIcon name="plus" size={16} />
                        Ajouter une table
                    </Button>
                </div>
            ) : (
                <div className="tables-grid">
                    {tables.map((table) => {
                        const occupied = getTableOccupancy(table.id);
                        const percentage = getOccupancyPercentage(table.id, table.capacity);
                        const status = getOccupancyStatus(occupied, table.capacity);
                        const statusColor = getStatusColor(occupied, table.capacity);

                        return (
                            <div key={table.id} className="table-card">
                                <div className="table-card-header">
                                    <div>
                                        <h4 className="table-name">{table.name}</h4>
                                        <span className="table-capacity">
                                            Capacité: {table.capacity} personnes
                                        </span>
                                    </div>
                                    <span className={`text-sm font-medium ${statusColor}`}>
                                        {status}
                                    </span>
                                </div>

                                <div className="table-occupancy">
                                    <div className="occupancy-bar">
                                        <div 
                                            className="occupancy-fill"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <div className="occupancy-text">
                                        {occupied}/{table.capacity} places occupées
                                    </div>
                                </div>

                                {table.description && (
                                    <p className="text-sm text-muted mt-2">
                                        {table.description}
                                    </p>
                                )}

                                <div className="form-row">
                                    <Button 
                                        variant="btn-outline" 
                                        size="sm"
                                        onClick={() => {/* TODO: View table details */}}
                                    >
                                        <DynamicIcon name="eye" size={14} />
                                        Voir
                                    </Button>
                                    <Button 
                                        variant="btn-secondary" 
                                        size="sm"
                                        onClick={() => {/* TODO: Edit table */}}
                                    >
                                        <DynamicIcon name="edit-3" size={14} />
                                        Modifier
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}