import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Plus, Users, FileText, Megaphone, Settings } from 'lucide-react-native';

export default function AssociationManagePage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const menuItems = [
        { label: 'Manage Members', icon: Users, color: '#3B82F6', desc: 'Approve or remove members' },
        { label: 'Post Announcement', icon: Megaphone, color: '#F59E0B', desc: 'Notify all members' },
        { label: 'Create Event', icon: Plus, color: '#10B981', desc: 'Schedule a new activity' },
        { label: 'Association Docs', icon: FileText, color: '#8B5CF6', desc: 'Upload constitution/minutes' },
        { label: 'Settings', icon: Settings, color: '#6B7280', desc: 'Edit profile & roles' },
    ];

    const handlePress = (item: string) => {
        Alert.alert('Coming Soon', `${item} functionality will be implemented in the next update.`);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-2xl font-bold">Executive Panel</Text>
                        <Text className="text-gray-300 text-sm">Manage your association</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                <View className="flex-row flex-wrap justify-between">
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handlePress(item.label)}
                            className="w-[48%] bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100"
                        >
                            <View
                                className="w-12 h-12 rounded-2xl items-center justify-center mb-4"
                                style={{ backgroundColor: `${item.color}15` }}
                            >
                                <item.icon size={24} color={item.color} />
                            </View>
                            <Text className="text-primary font-bold text-lg mb-1">{item.label}</Text>
                            <Text className="text-gray-400 text-xs leading-4">{item.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="bg-blue-50 p-5 rounded-3xl mt-2 border border-blue-100">
                    <Text className="text-blue-900 font-bold text-lg mb-2">Executive Overview</Text>
                    <View className="flex-row justify-between mt-2">
                        <View>
                            <Text className="text-blue-500 text-xs uppercase">Total Members</Text>
                            <Text className="text-blue-900 font-bold text-2xl">450</Text>
                        </View>
                        <View>
                            <Text className="text-blue-500 text-xs uppercase">Pending Requests</Text>
                            <Text className="text-blue-900 font-bold text-2xl">12</Text>
                        </View>
                        <View>
                            <Text className="text-blue-500 text-xs uppercase">Upcoming Events</Text>
                            <Text className="text-blue-900 font-bold text-2xl">2</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
