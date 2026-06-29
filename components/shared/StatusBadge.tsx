import React from 'react';
import { View, Text } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface StatusBadgeProps {
    status?: string | null;
    className?: ClassValue;
}

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
    submitted: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Submitted' },
    graded: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Graded' },
    overdue: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Overdue' },
    online: { bg: 'bg-emerald-500', text: 'text-white', label: 'Online' },
    offline: { bg: 'bg-gray-400', text: 'text-white', label: 'Offline' },
    active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
    suspended: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Suspended' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
    const safeStatus = typeof status === 'string' ? status : 'Unknown';
    const config = statusConfig[safeStatus.toLowerCase()] || {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        label: String(status || 'Unknown'),
    };

    return (
        <View className={cn('px-3 py-1 rounded-full items-center justify-center', config.bg, className)}>
            <Text className={cn('text-[10px] font-bold uppercase tracking-wider', config.text)}>
                {config.label}
            </Text>
        </View>
    );
};
