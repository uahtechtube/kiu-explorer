import React from 'react';
import { View, TouchableOpacity, ViewProps, ViewStyle } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PremiumCardProps extends Omit<ViewProps, 'className'> {
    children: React.ReactNode;
    onPress?: () => void;
    className?: any;
    containerStyle?: ViewStyle;
    variant?: 'glass' | 'solid' | 'elevated' | 'gradient';
}

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
    children,
    onPress,
    className,
    containerStyle,
    variant = 'elevated',
    ...props
}) => {
    const variantStyles = {
        glass: 'bg-white/70 border border-white/40',
        solid: 'bg-white border border-gray-100',
        elevated: 'bg-white shadow-xl shadow-primary/10 border border-gray-100',
        gradient: 'bg-primary border border-primary/20',
    };

    const cardStyle = [
        variant === 'elevated' && {
            shadowColor: '#002147',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.1,
            shadowRadius: 16,
            elevation: 8,
        } as any,
        containerStyle,
    ];

    const cardClass = cn(
        'rounded-[32px] p-5 overflow-hidden',
        variantStyles[variant],
        className
    );

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.8}
                className={cardClass}
                style={cardStyle}
                {...(props as any)}
            >
                {variant === 'glass' && (
                    <View className="absolute inset-0 bg-white/10" pointerEvents="none" />
                )}
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View
            className={cardClass}
            style={cardStyle}
            {...(props as any)}
        >
            {variant === 'glass' && (
                <View className="absolute inset-0 bg-white/10" pointerEvents="none" />
            )}
            {children}
        </View>
    );
};
