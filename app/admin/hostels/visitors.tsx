import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Users, ShieldAlert, ArrowDownLeft, ArrowUpRight, CheckSquare, LogOut } from 'lucide-react-native';
import api from '../../../lib/api';

interface VisitorRecord {
    id: number;
    visitor_name: string;
    visitor_phone: string;
    relationship?: string;
    purpose?: string;
    check_in?: string;
    check_out?: string;
    status: 'pre-registered' | 'active' | 'checked-out';
    student: {
        first_name: string;
        surname: string;
        matric_number: string;
    };
    hostel: {
        name: string;
    };
    room: {
        room_number: string;
    };
}

export default function AdminVisitorsPortal() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actioning, setActioning] = useState<number | null>(null);
    const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
    const [selectedTab, setSelectedTab] = useState<'all' | 'active'>('active');

    useEffect(() => {
        fetchVisitors();
    }, []);

    const fetchVisitors = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/hostels/visitors/logs');
            setVisitors(response.data.data || []);
        } catch (error) {
            console.error('Error fetching admin visitors:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchVisitors();
        setRefreshing(false);
    }, []);

    const handleCheckIn = async (id: number) => {
        try {
            setActioning(id);
            const response = await api.patch(`/admin/hostels/visitors/${id}/check-in`);
            if (response.data.status === 'success') {
                Alert.alert('Checked In', 'Visitor entry checked in successfully!');
                fetchVisitors();
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to check in visitor.');
        } finally {
            setActioning(null);
        }
    };

    const handleCheckOut = async (id: number) => {
        try {
            setActioning(id);
            const response = await api.patch(`/admin/hostels/visitors/${id}/check-out`);
            if (response.data.status === 'success') {
                Alert.alert('Checked Out', 'Visitor exit checked out successfully!');
                fetchVisitors();
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to check out visitor.');
        } finally {
            setActioning(null);
        }
    };

    const activeVisitors = visitors.filter((v) => v.status === 'active' || v.status === 'pre-registered');
    const allVisitors = visitors;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-50 text-green-600';
            case 'pre-registered': return 'bg-blue-50 text-blue-600';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">Security Visitor Registry</Text>
            </View>

            {/* Sub-Tabs */}
            <View className="flex-row bg-white border-b border-gray-100 p-2">
                <TouchableOpacity
                    onPress={() => setSelectedTab('active')}
                    className={`flex-1 py-3 rounded-2xl items-center justify-center flex-row space-x-2 ${
                        selectedTab === 'active' ? 'bg-primary' : ''
                    }`}
                >
                    <ArrowDownLeft size={16} color={selectedTab === 'active' ? 'white' : '#64748B'} />
                    <Text className={`font-bold text-sm ${selectedTab === 'active' ? 'text-white' : 'text-slate-500'}`}>
                        Active / Expected ({activeVisitors.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setSelectedTab('all')}
                    className={`flex-1 py-3 rounded-2xl items-center justify-center flex-row space-x-2 ${
                        selectedTab === 'all' ? 'bg-primary' : ''
                    }`}
                >
                    <Users size={16} color={selectedTab === 'all' ? 'white' : '#64748B'} />
                    <Text className={`font-bold text-sm ${selectedTab === 'all' ? 'text-white' : 'text-slate-500'}`}>
                        Full Registry Logs ({allVisitors.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {loading && !refreshing && actioning === null ? (
                <ActivityIndicator size="large" color="#3B82F6" className="mt-20" />
            ) : (
                <ScrollView
                    className="flex-1 p-6"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {(selectedTab === 'active' ? activeVisitors : allVisitors).length > 0 ? (
                        (selectedTab === 'active' ? activeVisitors : allVisitors).map((visitor) => (
                            <View
                                key={visitor.id}
                                className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6"
                            >
                                <View className="flex-row justify-between items-start mb-4">
                                    <View>
                                        <Text className="text-primary font-bold text-lg">{visitor.visitor_name}</Text>
                                        <Text className="text-gray-400 text-xs">Phone: {visitor.visitor_phone}</Text>
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${getStatusColor(visitor.status)}`}>
                                        <Text className="text-[10px] font-bold uppercase">{visitor.status.replace('-', ' ')}</Text>
                                    </View>
                                </View>

                                <View className="bg-slate-50 p-4 border border-slate-100 rounded-2xl mb-4">
                                    <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">
                                        Host Student Allocation
                                    </Text>
                                    <Text className="text-primary text-sm font-bold">
                                        {visitor.student?.first_name} {visitor.student?.surname}
                                    </Text>
                                    <Text className="text-slate-500 text-xs mt-0.5">
                                        {visitor.hostel?.name} • Room {visitor.room?.room_number}
                                    </Text>
                                </View>

                                {visitor.purpose ? (
                                    <View className="mb-4">
                                        <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Purpose of Visit</Text>
                                        <Text className="text-primary text-sm leading-5">{visitor.purpose}</Text>
                                    </View>
                                ) : null}

                                <View className="h-[1px] bg-slate-50 my-2" />

                                {visitor.status === 'pre-registered' ? (
                                    <TouchableOpacity
                                        onPress={() => handleCheckIn(visitor.id)}
                                        disabled={actioning !== null}
                                        className="bg-primary w-full py-4 rounded-2xl items-center flex-row justify-center space-x-2 mt-2"
                                    >
                                        <CheckSquare size={16} color="white" />
                                        <Text className="text-white font-bold text-sm">CHECK IN ENTRY</Text>
                                    </TouchableOpacity>
                                ) : visitor.status === 'active' ? (
                                    <TouchableOpacity
                                        onPress={() => handleCheckOut(visitor.id)}
                                        disabled={actioning !== null}
                                        className="bg-amber-600 w-full py-4 rounded-2xl items-center flex-row justify-center space-x-2 mt-2"
                                    >
                                        <LogOut size={16} color="white" />
                                        <Text className="text-white font-bold text-sm">CHECK OUT EXIT</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View className="flex-row justify-between mt-2 pt-2 border-t border-slate-50">
                                        <View className="flex-row items-center">
                                            <ArrowDownLeft size={16} color="#10B981" />
                                            <Text className="text-slate-500 text-xs ml-1">
                                                In: {visitor.check_in ? new Date(visitor.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <ArrowUpRight size={16} color="#EF4444" />
                                            <Text className="text-slate-500 text-xs ml-1">
                                                Out: {visitor.check_out ? new Date(visitor.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                                            </Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        <View className="mt-20 items-center justify-center p-6 bg-white border border-gray-100 rounded-[32px]">
                            <ShieldAlert size={64} color="#CBD5E1" />
                            <Text className="text-primary font-bold text-xl mt-4">Registry Log Empty</Text>
                            <Text className="text-gray-400 text-center mt-2 text-xs leading-4">
                                No {selectedTab === 'active' ? 'active' : ''} visitor pre-registrations found.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
