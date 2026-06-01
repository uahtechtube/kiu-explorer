import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Home as House, ClipboardList, Hammer, ChevronRight, Settings, Plus, Users, FileText, BarChart3, DollarSign } from 'lucide-react-native';
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
            title: 'Oversight & Analytics',
            sub: 'System statistics and occupancy rates',
            icon: BarChart3,
            color: '#8B5CF6',
            route: '/admin/dashboard/hostel-stats',
        },
        {
            title: 'Booking Requests',
            sub: 'Approve or reject room applications',
            icon: ClipboardList,
            color: '#3B82F6',
            route: '/admin/hostels/bookings',
            count: stats ? (stats.pending_bookings > 0 ? `${stats.pending_bookings} Pending` : null) : '...',
        },
        {
            title: 'Hostel Booking Payments',
            sub: 'Track paid & unpaid hostel bookings',
            icon: DollarSign,
            color: '#10B981',
            route: '/admin/hostels/payments',
        },
        {
            title: 'Leaves & Gate Passes',
            sub: 'Review and approve student leaves',
            icon: FileText,
            color: '#14B8A6',
            route: '/admin/hostels/leaves',
        },
        {
            title: 'Security Visitors Log',
            sub: 'Gate check-in / check-out visitor records',
            icon: Users,
            color: '#F59E0B',
            route: '/admin/hostels/visitors',
        },
        {
            title: 'Maintenance Log',
            sub: 'Manage repairs and complaints',
            icon: Hammer,
            color: '#EF4444',
            route: '/admin/hostels/complaints',
            count: stats ? (stats.active_complaints > 0 ? `${stats.active_complaints} Active` : null) : '...',
        },
        {
            title: 'Manage Hostels',
            sub: 'Add/Edit hostels, rooms & beds map',
            icon: House,
            color: '#06B6D4',
            route: '/admin/hostels/manage',
            count: stats ? `${stats.available_rooms}/${stats.total_rooms} Available` : null,
        },
        {
            title: 'Guidelines & Rules',
            sub: 'Enforce codes of conduct and rules',
            icon: Settings,
            color: '#64748B',
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
                    className="mt-4 bg-blue-50 py-5 rounded-[28px] items-center flex-row justify-center border border-dashed border-primary mb-6"
                >
                    <Plus size={20} color="#3B82F6" />
                    <Text className="text-blue-600 font-bold ml-2">Quick Add New Hostel</Text>
                </TouchableOpacity>

                {/* Financial Parameter: Hostel Service Charge Card */}
                <View className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-16">
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-2">
                        Hostel Service Charge (Levy)
                    </Text>
                    <Text className="text-gray-500 text-xs mb-4">
                        Define the administrative service fee automatically added to all student hostel booking payments.
                    </Text>
                    <View className="flex-row items-center">
                        <View className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex-row items-center mr-3">
                            <Text className="text-primary font-bold text-base mr-1">₦</Text>
                            <TextInput
                                className="flex-1 text-primary font-bold text-base p-0"
                                placeholder="5,000.00"
                                placeholderTextColor="#94A3B8"
                                keyboardType="numeric"
                                value={hostelServiceFee}
                                onChangeText={setHostelServiceFee}
                            />
                        </View>
                        <TouchableOpacity
                            onPress={handleSaveServiceFee}
                            disabled={savingFee}
                            className="bg-primary px-6 py-4 rounded-2xl items-center justify-center"
                        >
                            {savingFee ? (
                                <ActivityIndicator size="small" color="white" />
                            ) : (
                                <Text className="text-white font-bold text-sm uppercase">Apply</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
