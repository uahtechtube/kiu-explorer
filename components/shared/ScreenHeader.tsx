import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    rightAction?: React.ReactNode;
    onBack?: () => void;
}

/**
 * Standard KIU Explorer dashboard header bar.
 * Matches the white header (bg-white px-6 py-4 border-b shadow-xs) used across
 * the student dashboard screens — KIU navy (#002147) title, gray subtitle,
 * optional back button and right action.
 */
export default function ScreenHeader({
    title,
    subtitle,
    showBack = true,
    rightAction,
    onBack,
}: ScreenHeaderProps) {
    const router = useRouter();

    return (
        <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-100 shadow-xs">
            <View className="flex-row items-center flex-1 pr-3">
                {showBack && (
                    <TouchableOpacity
                        onPress={onBack ?? (() => router.back())}
                        className="p-2 -ml-2 rounded-xl bg-gray-50 mr-3"
                    >
                        <ChevronLeft size={22} color="#002147" />
                    </TouchableOpacity>
                )}
                <View className="flex-1 pr-1">
                    <Text className="text-xl font-bold text-primary" numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle ? (
                        <Text className="text-gray-400 text-xs font-medium" numberOfLines={1}>
                            {subtitle}
                        </Text>
                    ) : null}
                </View>
            </View>
            {rightAction || <View className="w-10 h-10" />}
        </View>
    );
}