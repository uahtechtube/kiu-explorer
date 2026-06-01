import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, BarChart3, Users, Building, ShieldAlert, FileText, ClipboardList, Settings } from 'lucide-react-native';
import api from '../../../lib/api';

interface StatsData {
    pending_bookings: number;
    active_complaints: number;
    total_rooms: number;
    available_rooms: number;
}

export default function AdminHostelStats() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState<StatsData | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/hostels/stats');
            setStats(response.data.data);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, []);

    const totalRooms = stats?.total_rooms ?? 0;
    const availableRooms = stats?.available_rooms ?? 0;
    const occupiedRooms = Math.max(0, totalRooms - availableRooms);
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">Hostel Analytics Dashboard</Text>
            </View>

            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : (
                <ScrollView
                    className="flex-1 p-6"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {/* Hero occupancy rate */}
                    <View className="bg-primary rounded-[36px] p-6 mb-6 shadow-md shadow-slate-900/10">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-white/60 text-xs font-bold uppercase tracking-wider">Occupancy Performance</Text>
                            <BarChart3 size={20} color="white" />
                        </View>
                        <View className="flex-row items-end space-x-4 mb-2">
                            <Text className="text-white text-5xl font-black">{occupancyRate}%</Text>
                            <Text className="text-white/80 font-bold text-sm mb-1.5">Capacity Allocated</Text>
                        </View>
                        <Text className="text-white/60 text-[10px] leading-4">
                            Aggregated from all active approved room beds inside campus accommodation buildings.
                        </Text>
                    </View>

                    {/* Stats Grid */}
                    <View className="flex-row flex-wrap justify-between mb-6">
                        {/* Pending Bookings */}
                        <TouchableOpacity
                            onPress={() => router.push('/admin/hostels/bookings' as any)}
                            className="bg-white border border-gray-100 rounded-[28px] p-5 w-[48%] shadow-sm mb-4"
                        >
                            <Users size={20} color="#3B82F6" className="mb-2" />
                            <Text className="text-slate-400 text-[10px] font-bold uppercase">Pending Bookings</Text>
                            <Text className="text-primary text-2xl font-black mt-1">{stats?.pending_bookings ?? 0}</Text>
                        </TouchableOpacity>

                        {/* Active Complaints */}
                        <TouchableOpacity
                            onPress={() => router.push('/admin/hostels/complaints' as any)}
                            className="bg-white border border-gray-100 rounded-[28px] p-5 w-[48%] shadow-sm mb-4"
                        >
                            <ShieldAlert size={20} color="#EF4444" className="mb-2" />
                            <Text className="text-slate-400 text-[10px] font-bold uppercase">Active Complaints</Text>
                            <Text className="text-primary text-2xl font-black mt-1">{stats?.active_complaints ?? 0}</Text>
                        </TouchableOpacity>

                        {/* Total Rooms */}
                        <View className="bg-white border border-gray-100 rounded-[28px] p-5 w-[48%] shadow-sm mb-4">
                            <Building size={20} color="#10B981" className="mb-2" />
                            <Text className="text-slate-400 text-[10px] font-bold uppercase">Total Rooms</Text>
                            <Text className="text-primary text-2xl font-black mt-1">{stats?.total_rooms ?? 0}</Text>
                        </View>

                        {/* Available Rooms */}
                        <View className="bg-white border border-gray-100 rounded-[28px] p-5 w-[48%] shadow-sm mb-4">
                            <Building size={20} color="#F59E0B" className="mb-2" />
                            <Text className="text-slate-400 text-[10px] font-bold uppercase">Available Slots</Text>
                            <Text className="text-primary text-2xl font-black mt-1">{stats?.available_rooms ?? 0}</Text>
                        </View>
                    </View>

                    {/* Quick Management Links */}
                    <Text className="text-primary font-black text-lg mb-4">Quick Management Actions</Text>

                    <View className="bg-white border border-gray-100 rounded-[32px] p-4 shadow-sm mb-10">
                        {/* Manage Hostels */}
                        <TouchableOpacity
                            onPress={() => router.push('/admin/hostels' as any)}
                            className="flex-row items-center justify-between p-4 border-b border-slate-50"
                        >
                            <View className="flex-row items-center space-x-3">
                                <Building size={18} color="#64748B" />
                                <Text className="text-primary font-bold text-sm">Manage Hostels & Rooms</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Rules */}
                        <TouchableOpacity
                            onPress={() => router.push('/admin/hostels/rules' as any)}
                            className="flex-row items-center justify-between p-4 border-b border-slate-50"
                        >
                            <View className="flex-row items-center space-x-3">
                                <ClipboardList size={18} color="#64748B" />
                                <Text className="text-primary font-bold text-sm">Rules & Regulations Settings</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Visitors log */}
                        <TouchableOpacity
                            onPress={() => router.push('/admin/hostels/visitors' as any)}
                            className="flex-row items-center justify-between p-4 border-b border-slate-50"
                        >
                            <View className="flex-row items-center space-x-3">
                                <Users size={18} color="#64748B" />
                                <Text className="text-primary font-bold text-sm">Security Visitor logs</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Leaves approval */}
                        <TouchableOpacity
                            onPress={() => router.push('/admin/hostels/leaves' as any)}
                            className="flex-row items-center justify-between p-4"
                        >
                            <View className="flex-row items-center space-x-3">
                                <FileText size={18} color="#64748B" />
                                <Text className="text-primary font-bold text-sm">Leaves & Gate Passes approvals</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
