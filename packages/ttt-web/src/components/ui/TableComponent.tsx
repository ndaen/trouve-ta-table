import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import Button from "./buttons/Button.tsx";
import { DynamicIcon } from "lucide-react/dynamic";

export interface TableColumn<T = Record<string, unknown>> {
    id: string;
    label: string;
    width?: string;
    render?: (value: unknown, row: T, index: number) => React.ReactNode;
    sortable?: boolean;
}

interface PaginationOptions {
    enabled: boolean;
    pageSize?: number;
    showInfo?: boolean;
}

interface TableProps<T = Record<string, unknown>> {
    columns: TableColumn<T>[];
    data: T[];
    className?: string;
    onRowClick?: (row: T, index: number) => void;
    pagination?: PaginationOptions;
}

export default function TableComponent<T = Record<string, unknown>>({
    columns, 
    data, 
    className = '',
    onRowClick,
    pagination = { enabled: false, pageSize: 10, showInfo: true }
}: TableProps<T>) {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = pagination.pageSize || 10;

    // Calculs de pagination
    const paginationData = useMemo(() => {
        if (!pagination.enabled) {
            return {
                displayData: data,
                totalPages: 1,
                totalItems: data.length,
                startIndex: 0,
                endIndex: data.length
            };
        }

        const totalItems = data.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const displayData = data.slice(startIndex, endIndex);

        return {
            displayData,
            totalPages,
            totalItems,
            startIndex,
            endIndex
        };
    }, [data, currentPage, pageSize, pagination.enabled]);

    // Reset de la page quand les données changent
    useEffect(() => {
        setCurrentPage(1);
    }, [data.length]);
    return (
        <div className={`table-wrapper ${className}`}>
            <table className="data-table">
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {columns.map((column) => (
                            <th
                                key={column.id}
                                className="table-header-cell"
                                style={{ 
                                    width: column.width
                                }}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {paginationData.displayData.length === 0 ? (
                        <tr>
                            <td 
                                colSpan={columns.length} 
                                className="table-empty-cell"
                            >
                                Aucune donnée disponible
                            </td>
                        </tr>
                    ) : (
                        paginationData.displayData.map((row, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className={`table-row ${
                                    onRowClick ? 'table-row-clickable' : ''
                                } ${rowIndex % 2 === 1 ? 'table-row-striped' : ''}`}
                                onClick={() => onRowClick?.(row, rowIndex)}
                            >
                                {columns.map((column) => {
                                    const value = (row as Record<string, unknown>)[column.id];
                                    return (
                                        <td key={column.id} className="table-cell">
                                            {column.render 
                                                ? column.render(value, row, rowIndex)
                                                : String(value ?? '')
                                            }
                                        </td>
                                    );
                                })}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            
            {/* Contrôles de pagination */}
            {pagination.enabled && (
                <div className="pagination-controls">
                    {pagination.showInfo && (
                        <div className="pagination-info">
                            {paginationData.startIndex + 1}-{paginationData.endIndex} sur {paginationData.totalItems} éléments
                        </div>
                    )}
                    <div className="pagination-buttons">
                        <Button
                            variant="btn-outline"
                            size="sm"
                            onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <DynamicIcon name="chevron-left" size={16} />
                            Précédent
                        </Button>
                        <span className="pagination-current">
                            Page {currentPage} sur {paginationData.totalPages}
                        </span>
                        <Button
                            variant="btn-outline" 
                            size="sm"
                            onClick={() => setCurrentPage(Math.min(currentPage + 1, paginationData.totalPages))}
                            disabled={currentPage === paginationData.totalPages}
                        >
                            Suivant
                            <DynamicIcon name="chevron-right" size={16} />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}