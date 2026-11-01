import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import {
    ArrowLeft,
    Filter,
    Download,
    Users,
    Calendar,
    CheckCircle2,
    XCircle,
    ChevronDown
} from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

export default function AttendanceReport() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [reportData, setReportData] = useState<any[]>([]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const endpoint = id ? `/lecturer/attendance-report/${id}` : '/lecturer/attendance/report';
            const response = await api.get(endpoint);

            // Transform backend paginated or array structure if needed
            const data = response.data.data || response.data || [];
            setReportData(data.map((item: any) => ({
                id: item.id,
                student_name: item.student ? `${item.student.first_name} ${item.student.surname}` : 'Unknown Student',
                course_code: item.virtual_class?.course_code || item.course_code || 'N/A',
                status: (item.status || 'Present').charAt(0).toUpperCase() + (item.status || 'Present').slice(1),
                date: item.virtual_class?.scheduled_at ? new Date(item.virtual_class.scheduled_at).toLocaleDateString() :
                    (item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A')
            })));
        } catch (error) {
            console.error('Error fetching report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [id]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchReport();
        setRefreshing(false);
    }, []);

    const handleExport = () => {
        Alert.alert(
            'Export Data',
            'Choose your preferred format',
            [
                { text: 'Excel (XLSX)', onPress: () => console.log('Exporting XLSX...') },
                { text: 'CSV', onPress: () => console.log('Exporting CSV...') },
                { text: 'Cancel', style: 'cancel' }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                        <ArrowLeft size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Attendance Report</Text>
                    <TouchableOpacity onPress={handleExport} className="w-10 h-10 rounded-full bg-secondary items-center justify-center shadow-lg shadow-secondary/20">
                        <Download size={20} color="#002147" />
                    </TouchableOpacity>
                </View>

                <View className="mt-8">
                    <Text className="text-gray-300 text-xs font-bold uppercase mb-1">Academic Year 2025/2026</Text>
                    <Text className="text-white text-2xl font-bold">Semester 1 Overview</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-primary text-xl font-bold">Student Records</Text>
                    <TouchableOpacity className="flex-row items-center bg-white px-3 py-1.5 rounded-xl border border-gray-100">
                        <Filter size={14} color="#64748B" />
                        <Text className="text-gray-500 text-xs ml-2 font-bold">Filter</Text>
                        <ChevronDown size={14} color="#64748B" className="ml-1" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : reportData.length > 0 ? (
                    reportData.map((item: any) => (
                        <PremiumCard key={item.id} variant="solid" className="mb-4 p-5 flex-row items-center border-gray-100">
                            <View className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center mr-4">
                                <Users size={24} color="#64748B" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-primary font-bold text-base" numberOfLines={1}>{item.student_name}</Text>
                                <View className="flex-row items-center mt-1">
                                    <Calendar size={12} color="#94A3B8" />
                                    <Text className="text-gray-400 text-[10px] ml-1 uppercase">{item.course_code}</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <View className={`px-3 py-1 rounded-full ${item.status === 'Present' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                    <Text className={`text-[10px] font-bold ${item.status === 'Present' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                                <Text className="text-gray-400 text-[10px] mt-1 font-medium">{item.date}</Text>
                            </View>
                        </PremiumCard>
                    ))
                ) : (
                    /* Mock data if none */
                    [
                        { id: 1, student_name: 'Musa Ibrahim', course_code: 'CSC 101', status: 'Present', date: '2026-01-16' },
                        { id: 2, student_name: 'Zainab Ahmed', course_code: 'CSC 101', status: 'Absent', date: '2026-01-16' },
                        { id: 3, student_name: 'David Okafor', course_code: 'CSC 101', status: 'Present', date: '2026-01-16' },
                    ].map((item: any) => (
                        <PremiumCard key={item.id} variant="solid" className="mb-4 p-5 flex-row items-center border-gray-100">
                            <View className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center mr-4">
                                <Users size={24} color="#64748B" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-primary font-bold text-base" numberOfLines={1}>{item.student_name}</Text>
                                <View className="flex-row items-center mt-1">
                                    <Calendar size={12} color="#94A3B8" />
                                    <Text className="text-gray-400 text-[10px] ml-1 uppercase">{item.course_code}</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <View className={`px-3 py-1 rounded-full ${item.status === 'Present' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                                    <Text className={`text-[10px] font-bold ${item.status === 'Present' ? 'text-emerald-700' : 'text-rose-700'}`}>
                                        {item.status.toUpperCase()}
                                    </Text>
                                </View>
                                <Text className="text-gray-400 text-[10px] mt-1 font-medium">{item.date}</Text>
                            </View>
                        </PremiumCard>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
