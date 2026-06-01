import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react-native';
import { PremiumCard } from './PremiumCard';

interface ProgressCardProps {
    label: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color: string;
    trend?: {
        value: number;
        isUp: boolean;
    };
    onPress?: () => void;
}

export const ProgressCard: React.FC<ProgressCardProps> = ({
    label,
    value,
    subtitle,
    icon: Icon,
    color,
    trend,
    onPress,
}) => {
    return (
        <PremiumCard
            onPress={onPress}
            variant="elevated"
            className="mb-4 flex-1 mx-1"
            containerStyle={{ borderBottomWidth: 4, borderBottomColor: color }}
        >
            <View className="flex-row justify-between items-start mb-4">
                <View style={{ backgroundColor: `${color}15` }} className="p-3 rounded-2xl">
                    <Icon size={24} color={color} />
                </View>
                {trend && (
                    <View className={`flex-row items-center px-2 py-1 rounded-lg ${trend.isUp ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                        {trend.isUp ? <TrendingUp size={12} color="#10B981" /> : <TrendingDown size={12} color="#E11D48" />}
                        <Text className={`text-[10px] font-bold ml-1 ${trend.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {trend.value}%
                        </Text>
                    </View>
                )}
            </View>

            <View>
                <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">{label}</Text>
                <Text className="text-primary text-2xl font-black">{value}</Text>
                {subtitle && (
                    <Text className="text-gray-400 text-[10px] mt-1" numberOfLines={1}>{subtitle}</Text>
                )}
            </View>
        </PremiumCard>
    );
};
