import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Home as House, ClipboardList, Hammer, ChevronRight, Settings, Plus } from 'lucide-react-native';
import api from '../../../lib/api';

interface Stats {
    pending_bookings: number;
    active_complaints: number;
    total_rooms: number;
    available_rooms: number;
}

export default function HostelAdminPortal() {
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);

    useEffect(() => {
        api.get('/admin/hostels/stats')
            .then(r => setStats(r.data.data))
            .catch(e => console.error('Error fetching hostel stats', e));
    }, []);

    const menuItems = [
        {
            title: 'Booking Requests',
            sub: 'Approve or reject room applications',
            icon: ClipboardList,
            color: '#3B82F6',
            route: '/admin/hostels/bookings',
            count: stats ? (stats.pending_bookings > 0 ? `${stats.pending_bookings} Pending` : null) : '...',
        },
        {
            title: 'Maintenance Log',
            sub: 'Manage repairs and complaints',
            icon: Hammer,
            color: '#F59E0B',
            route: '/admin/hostels/complaints',
            count: stats ? (stats.active_complaints > 0 ? `${stats.active_complaints} Active` : null) : '...',
        },
        {
            title: 'Manage Hostels',
            sub: 'Add/Edit hostels and rooms',
            icon: House,
            color: '#10B981',
            route: '/admin/hostels/manage',
            count: stats ? `${stats.available_rooms}/${stats.total_rooms} Available` : null,
        },
        {
            title: 'System Rules',
            sub: 'View hostel guidelines',
            icon: Settings,
            color: '#6366F1',
            route: '/admin/hostels/rules',
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">Hostel Administration</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-8">
                {/* Stats Banner */}
                <View className="bg-primary/5 p-6 rounded-[32px] mb-8 border border-primary/10">
                    <Text className="text-primary font-bold text-lg mb-1">Administrative Overview</Text>
                    <Text className="text-slate-500 text-xs mb-5">
                        Manage all campus accommodation facilities and student requests.
                    </Text>
                    {stats && (
                        <View className="flex-row justify-between">
                            <View className="items-center bg-white rounded-2xl px-4 py-3 flex-1 mr-2 shadow-sm border border-gray-50">
                                <Text className="text-2xl font-bold text-blue-600">{stats.pending_bookings}</Text>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase mt-1">Pending</Text>
                            </View>
                            <View className="items-center bg-white rounded-2xl px-4 py-3 flex-1 mr-2 shadow-sm border border-gray-50">
                                <Text className="text-2xl font-bold text-amber-500">{stats.active_complaints}</Text>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase mt-1">Issues</Text>
                            </View>
                            <View className="items-center bg-white rounded-2xl px-4 py-3 flex-1 shadow-sm border border-gray-50">
                                <Text className="text-2xl font-bold text-green-600">{stats.available_rooms}</Text>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase mt-1">Free Rooms</Text>
                            </View>
                        </View>
                    )}
                </View>

                <View className="space-y-4">
                    {menuItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => router.push(item.route as any)}
                            className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-sm flex-row items-center mb-4"
                        >
                            <View
                                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                style={{ backgroundColor: `${item.color}15` }}
                            >
                                <item.icon size={24} color={item.color} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-primary font-bold text-base">{item.title}</Text>
                                <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">{item.sub}</Text>
                            </View>
                            {item.count && (
                                <View className="bg-rose-50 px-2 py-1 rounded-md mr-2">
                                    <Text className="text-rose-500 text-[8px] font-black">{item.count}</Text>
                                </View>
                            )}
                            <ChevronRight size={20} color="#E2E8F0" />
                        </TouchableOpacity>
                    ))}
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/admin/hostels/manage' as any)}
                    className="mt-4 bg-blue-50 py-5 rounded-[28px] items-center flex-row justify-center border border-dashed border-primary"
                >
                    <Plus size={20} color="#3B82F6" />
                    <Text className="text-blue-600 font-bold ml-2">Quick Add New Hostel</Text>
                </TouchableOpacity>

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
