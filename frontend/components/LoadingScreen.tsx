import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { GraduationCap } from 'lucide-react-native';

export default function LoadingScreen() {
    return (
        <View className="flex-1 bg-white items-center justify-center">
            <View className="w-24 h-24 bg-primary rounded-3xl items-center justify-center shadow-lg shadow-primary/40 mb-6">
                <GraduationCap size={48} color="#FFD700" />
            </View>
            <Text className="text-2xl font-bold text-primary mb-2">
                KIU <Text className="text-secondary">EXPLORER</Text>
            </Text>
            <ActivityIndicator size="large" color="#002147" className="mt-4" />
            <Text className="text-gray-400 mt-4">Loading your experience...</Text>
        </View>
    );
}
