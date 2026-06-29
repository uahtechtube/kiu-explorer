import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Home as House, ClipboardList, Hammer, ChevronRight, Settings, Plus, Users, FileText, BarChart3, DollarSign, UserCheck } from 'lucide-react-native';
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
    const [hostelServiceFee, setHostelServiceFee] = useState<string>('5000');
    const [savingFee, setSavingFee] = useState(false);

    useEffect(() => {
        api.get('/admin/hostels/stats')
            .then(r => setStats(r.data.data))
            .catch(e => console.error('Error fetching hostel stats', e));

        api.get('/admin/system/settings')
            .then(r => {
                if (r.data && r.data.hostel_service_fee !== undefined) {
                    setHostelServiceFee(String(r.data.hostel_service_fee));
                }
            })
            .catch(e => console.error('Error fetching settings for hostel service fee', e));
    }, []);

    const handleSaveServiceFee = async () => {
        if (!hostelServiceFee || isNaN(Number(hostelServiceFee))) {
            Alert.alert('Invalid Fee', 'Please enter a valid numeric service fee.');
            return;
        }
        try {
            setSavingFee(true);
            await api.post('/admin/system/settings/toggle', {
                key: 'hostel_service_fee',
                value: parseFloat(hostelServiceFee)
            });
            Alert.alert('Success', 'Hostel service fee updated successfully.');
        } catch (e: any) {
            console.error('Failed to update service fee:', e);
            Alert.alert('Error', e.response?.data?.message || 'Failed to update service fee.');
        } finally {
            setSavingFee(false);
        }
    };

    const menuItems = [
        {
            title: 'Maintenance Log',
            sub: 'Manage repairs and complaints',
            icon: Hammer,
            color: '#EF4444',
            route: '/admin/hostels/complaints',
            count: stats ? (stats.active_complaints > 0 ? `${stats.active_complaints} Active` : null) : '...',
        },
        {
            title: 'Guidelines & Rules',
            sub: 'Enforce codes of conduct and rules',
            icon: Settings,
            color: '#64748B',
            route: '/admin/hostels/rules',
        },
        {
            title: 'Hostel Heads',
            sub: 'Manage wardens & hall masters',
            icon: UserCheck,
            color: '#8B5CF6',
            route: '/admin/hostels/heads',
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
                        Manage all hostel regulations, codes of conduct, and student maintenance requests.
                    </Text>
                    {stats && (
                        <View className="flex-row justify-between">
                            <View className="items-center bg-white rounded-2xl px-4 py-4 flex-1 shadow-sm border border-gray-50">
                                <Text className="text-3xl font-black text-amber-500">{stats.active_complaints}</Text>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase mt-1">Active Complaints</Text>
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

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
