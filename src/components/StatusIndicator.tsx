import React from 'react';
import { Indikator } from '@/types';

interface StatusIndicatorProps {
    status: Indikator;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const colorMap = {
    hijau: 'bg-green-500 text-green-700 bg-green-100',
    kuning: 'bg-yellow-500 text-yellow-700 bg-yellow-100',
    merah: 'bg-red-500 text-red-700 bg-red-100',
};

const dotColorMap = {
    hijau: 'bg-green-500',
    kuning: 'bg-yellow-500',
    merah: 'bg-red-500',
};

export default function StatusIndicator({
    status,
    label,
    size = 'md',
    className = ''
}: StatusIndicatorProps) {
    if (!status) return null;

    const baseClasses = "inline-flex items-center rounded-full font-medium transition-colors";
    const sizeClasses = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-base",
    };

    // If label is provided, show as badge
    if (label) {
        const colorClasses = {
            hijau: "bg-green-100 text-green-800",
            kuning: "bg-yellow-100 text-yellow-800",
            merah: "bg-red-100 text-red-800",
        }[status];

        return (
            <span className={`${baseClasses} ${sizeClasses[size]} ${colorClasses} ${className}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${dotColorMap[status]}`} />
                {label}
            </span>
        );
    }

    // If no label, just a dot with tooltip or simple indicator
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className={`w-3 h-3 rounded-full ${dotColorMap[status]}`} />
            <span className="capitalize">{status}</span>
        </div>
    );
}
