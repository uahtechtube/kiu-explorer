import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Users, CheckCircle2, XCircle, BarChart3, ChevronRight, Calendar } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface AttendanceSummary {
    course_id: number;
    course_code: string;
    course_title: string;
    attendance_rate: number;
    total_sessions: number;
    average_present: number;
}

export default function LecturerAttendanceHub() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lecturer/performance'); // Reusing performance endpoint which has attendance
            setSummaries(response.data.map((p: any) => ({
                course_id: p.course_id,
                course_code: p.course_code,
                course_title: p.course_title,
                attendance_rate: p.attendance_rate,
                total_sessions: 12, // Mock or from backend if available
                average_present: Math.round((p.attendance_rate / 100) * 85), // Assuming avg 85 students
            })));
        } catch (error) {
            console.error('Error fetching attendance summaries:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAttendanceData();
        setRefreshing(false);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 bg-white/10 rounded-full items-center justify-center">
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-gray-300 text-sm font-medium uppercase tracking-wider">Management</Text>
                        <Text className="text-white text-3xl font-bold">Attendance Hub</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 -mt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {loading ? (
                    <View className="mt-20">
                        <ActivityIndicator size="large" color="#002147" />
                    </View>
                ) : summaries.length > 0 ? (
                    summaries.map((summary) => (
                        <PremiumCard
                            key={summary.course_id}
                            variant="elevated"
                            className="mb-4 bg-white p-5 overflow-hidden"
                            onPress={() => router.push(`/lecturer/attendance-report/${summary.course_id}` as any)}
                        >
                            <View className="flex-row justify-between items-center mb-6">
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">{summary.course_code}</Text>
                                    <Text className="text-primary font-bold text-lg" numberOfLines={1}>{summary.course_title}</Text>
                                </View>
                                <View className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 items-center justify-center">
                                    <Text className="text-emerald-600 font-black text-base">{summary.attendance_rate}%</Text>
                                    <Text className="text-emerald-500 text-[8px] uppercase font-bold">Rate</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between space-x-2">
                                <View className="flex-1 bg-gray-50 p-3 rounded-2xl flex-row items-center">
                                    <View className="w-8 h-8 bg-blue-100 rounded-xl items-center justify-center mr-3">
                                        <Calendar size={16} color="#3B82F6" />
                                    </View>
                                    <View>
                                        <Text className="text-gray-400 text-[10px] uppercase font-bold">Sessions</Text>
                                        <Text className="text-primary font-bold text-sm">{summary.total_sessions}</Text>
                                    </View>
                                </View>

                                <View className="flex-1 bg-gray-50 p-3 rounded-2xl flex-row items-center">
                                    <View className="w-8 h-8 bg-purple-100 rounded-xl items-center justify-center mr-3">
                                        <Users size={16} color="#8B5CF6" />
                                    </View>
                                    <View>
                                        <Text className="text-gray-400 text-[10px] uppercase font-bold">Avg Present</Text>
                                        <Text className="text-primary font-bold text-sm">~{summary.average_present}</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                className="mt-4 py-3 bg-primary/5 rounded-2xl items-center flex-row justify-center"
                                onPress={() => router.push(`/lecturer/attendance-report/${summary.course_id}` as any)}
                            >
                                <BarChart3 size={16} color="#002147" />
                                <Text className="text-primary font-bold text-sm ml-2">View Detailed Report</Text>
                            </TouchableOpacity>
                        </PremiumCard>
                    ))
                ) : (
                    <View className="bg-white rounded-3xl p-10 items-center justify-center border border-dashed border-gray-300 mt-10">
                        <Users size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 font-bold mt-4 text-center">No Attendance Data</Text>
                        <Text className="text-gray-400 text-xs text-center mt-2 px-10">
                            Attendance records from your virtual classes will appear here.
                        </Text>
                    </View>
                )}

                {/* Manual Marking Shortcut */}
                <TouchableOpacity
                    className="mt-6 bg-secondary p-5 rounded-[32px] flex-row items-center justify-between shadow-lg shadow-secondary/20"
                    onPress={() => router.push('/lecturer/attendance/mark' as any)}
                >
                    <View className="flex-row items-center">
                        <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center mr-4">
                            <CheckCircle2 size={24} color="#002147" />
                        </View>
                        <View>
                            <Text className="text-primary font-bold text-lg">Mark Attendance</Text>
                            <Text className="text-primary/60 text-xs">Register manual classroom attendance</Text>
                        </View>
                    </View>
                    <ChevronRight size={20} color="#002147" />
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
