import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Camera, ShieldCheck, Clock, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import api from '../../lib/api';

interface AttendanceLog {
    id: number;
    direction: 'in' | 'out';
    timestamp: string;
    hostel: {
        name: string;
    };
    room: {
        room_number: string;
    };
}

export default function HostelAttendance() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [logs, setLogs] = useState<AttendanceLog[]>([]);
    const [activeBooking, setActiveBooking] = useState<any>(null);
    const [checking, setChecking] = useState<'in' | 'out' | null>(null);

    const fetchAttendanceAndBooking = async () => {
        try {
            setLoading(true);
            // Fetch student's approved bookings first to get their hostel and room details
            const bookingRes = await api.get('/student/hostels/my-bookings');
            const approved = (bookingRes.data.data || []).find((b: any) => b.status === 'approved');
            setActiveBooking(approved || null);

            // Fetch history logs
            const attendanceRes = await api.get('/student/hostels/attendance');
            setLogs(attendanceRes.data.data || []);
        } catch (error) {
            console.error('Error fetching attendance logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceAndBooking();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchAttendanceAndBooking();
        setRefreshing(false);
    }, []);

    const handleLogAttendance = async (direction: 'in' | 'out') => {
        if (!activeBooking) {
            Alert.alert('No Active Allocation', 'You do not have an approved/active room booking in the hostel.');
            return;
        }

        try {
            setChecking(direction);
            const response = await api.post('/student/hostels/attendance/check', {
                hostel_id: activeBooking.room.hostel_id,
                room_id: activeBooking.room.id,
                direction: direction,
                device_id: 'EXPO-SIMULATOR',
            });

            if (response.data.status === 'success') {
                Alert.alert(
                    'Success',
                    `Successfully marked attendance check-${direction}!`,
                    [{ text: 'OK', onPress: () => fetchAttendanceAndBooking() }]
                );
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to record attendance.');
        } finally {
            setChecking(null);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">QR Attendance</Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Active Allocation Info */}
                {activeBooking ? (
                    <View className="bg-primary rounded-[32px] p-6 mb-6 shadow-md shadow-slate-900/10">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Active Allocation</Text>
                        <Text className="text-white text-2xl font-bold mb-1">{activeBooking.room?.hostel?.name}</Text>
                        <Text className="text-white/80 font-semibold mb-4">Room {activeBooking.room?.room_number}</Text>

                        {/* Scanner / Simulator Panel */}
                        <View className="bg-white/10 border border-white/10 rounded-2xl p-4 items-center">
                            <Camera size={36} color="white" />
                            <Text className="text-white text-xs font-bold text-center mt-2">QR Gates & Scanner Active</Text>
                            <Text className="text-white/60 text-[10px] text-center mt-1 leading-4">
                                Secure access checks logged directly via building entrance scanners.
                            </Text>

                            <View className="flex-row space-x-3 w-full mt-4">
                                <TouchableOpacity
                                    onPress={() => handleLogAttendance('in')}
                                    disabled={checking !== null}
                                    className="flex-1 bg-green-600/85 h-12 rounded-xl items-center justify-center flex-row"
                                >
                                    {checking === 'in' ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <>
                                            <ArrowDownLeft size={16} color="white" className="mr-1" />
                                            <Text className="text-white font-bold text-xs">CHECK IN</Text>
                                        </>
                                    )}
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleLogAttendance('out')}
                                    disabled={checking !== null}
                                    className="flex-1 bg-amber-600/85 h-12 rounded-xl items-center justify-center flex-row"
                                >
                                    {checking === 'out' ? (
                                        <ActivityIndicator color="white" size="small" />
                                    ) : (
                                        <>
                                            <ArrowUpRight size={16} color="white" className="mr-1" />
                                            <Text className="text-white font-bold text-xs">CHECK OUT</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View className="bg-white border border-gray-100 rounded-[32px] p-6 mb-6 shadow-sm items-center py-10">
                        <ShieldCheck size={48} color="#94A3B8" />
                        <Text className="text-primary font-bold text-lg mt-3 text-center">No Active Allocation</Text>
                        <Text className="text-gray-400 text-xs text-center mt-1">
                            An active room booking is required to record check-in/out attendance.
                        </Text>
                    </View>
                )}

                <Text className="text-primary font-black text-lg mb-4">Attendance History Log</Text>

                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : logs.length > 0 ? (
                    logs.map((log) => (
                        <View
                            key={log.id}
                            className="bg-white border border-gray-100 rounded-3xl p-5 flex-row justify-between items-center mb-4"
                        >
                            <View className="flex-row items-center space-x-4">
                                <View className={`w-10 h-10 rounded-2xl items-center justify-center ${
                                    log.direction === 'in' ? 'bg-green-50' : 'bg-amber-50'
                                }`}>
                                    {log.direction === 'in' ? (
                                        <ArrowDownLeft size={20} color="#10B981" />
                                    ) : (
                                        <ArrowUpRight size={20} color="#D97706" />
                                    )}
                                </View>
                                <View>
                                    <Text className="text-primary font-bold text-base capitalize">
                                        Checked {log.direction}
                                    </Text>
                                    <Text className="text-gray-400 text-[10px] mt-0.5">
                                        {log.hostel?.name} • Room {log.room?.room_number}
                                    </Text>
                                </View>
                            </View>

                            <View className="items-end">
                                <Clock size={14} color="#64748B" />
                                <Text className="text-slate-500 font-medium text-[10px] mt-1">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <Text className="text-slate-400 text-[8px] font-bold">
                                    {new Date(log.timestamp).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>
                    ))
                ) : (
                    <View className="mt-10 items-center">
                        <Clock size={48} color="#E2E8F0" />
                        <Text className="text-gray-400 text-center mt-2 text-sm">No gate check logs yet.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
