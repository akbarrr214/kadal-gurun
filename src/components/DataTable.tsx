import React from 'react';
import { Loader2 } from 'lucide-react';

export interface Column<T = any> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => React.ReactNode;
    className?: string; // For specific column alignment/styling
}

interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
}

export default function DataTable<T>({
    data,
    columns,
    isLoading = false,
    emptyMessage = "Tidak ada data.",
    onRowClick
}: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-2 text-gray-500">Memuat data...</span>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-100">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={`px-6 py-4 ${col.className || ''}`}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 border-t border-gray-100">
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            onClick={() => onRowClick && onRowClick(row)}
                            className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                        >
                            {columns.map((col, colIndex) => (
                                <td key={colIndex} className={`px-6 py-4 whitespace-nowrap ${col.className || ''}`}>
                                    {col.cell
                                        ? col.cell(row)
                                        : (col.accessorKey ? String(row[col.accessorKey]) : '-')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
