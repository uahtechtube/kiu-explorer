import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import {
    ChevronLeft,
    FileText,
    Download,
    Users,
    Activity,
    BookOpen
} from 'lucide-react-native';
// @ts-ignore
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

export default function AdminReportsPage() {
    const router = useRouter();
    const [academicStudentId, setAcademicStudentId] = useState('');
    const [attendanceStudentId, setAttendanceStudentId] = useState('');
    
    // Loading states
    const [loadingAcademic, setLoadingAcademic] = useState(false);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [loadingSystem, setLoadingSystem] = useState(false);

    const handleExportAcademic = async () => {
        setLoadingAcademic(true);
        try {
            const studentIdParam = academicStudentId.trim() ? `/${academicStudentId.trim()}` : '';
            const response = await api.get(`/reports/academic${studentIdParam}`, {
                params: { format: 'csv' },
                responseType: 'text'
            });

            const fileName = `academic_report_${academicStudentId.trim() || 'default'}.csv`;
            const fileUri = FileSystem.documentDirectory + fileName;
            
            await FileSystem.writeAsStringAsync(fileUri, response.data);
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Success', `Report saved to sandbox at ${fileUri}`);
            }
        } catch (error) {
            console.error('Failed to export academic report:', error);
            Alert.alert('Error', 'Failed to retrieve or generate report. Check student ID.');
        } finally {
            setLoadingAcademic(false);
        }
    };

    const handleExportAttendance = async () => {
        setLoadingAttendance(true);
        try {
            const studentIdParam = attendanceStudentId.trim() ? `/${attendanceStudentId.trim()}` : '';
            const response = await api.get(`/reports/attendance${studentIdParam}`, {
                params: { format: 'csv' },
                responseType: 'text'
            });

            const fileName = `attendance_report_${attendanceStudentId.trim() || 'default'}.csv`;
            const fileUri = FileSystem.documentDirectory + fileName;
            
            await FileSystem.writeAsStringAsync(fileUri, response.data);
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Success', `Report saved to sandbox at ${fileUri}`);
            }
        } catch (error) {
            console.error('Failed to export attendance report:', error);
            Alert.alert('Error', 'Failed to retrieve or generate report. Check student ID.');
        } finally {
            setLoadingAttendance(false);
        }
    };

    const handleExportSystem = async () => {
        setLoadingSystem(true);
        try {
            const response = await api.get('/reports/system-usage', {
                params: { format: 'csv' },
                responseType: 'text'
            });

            const fileName = 'system_analytics_report.csv';
            const fileUri = FileSystem.documentDirectory + fileName;
            
            await FileSystem.writeAsStringAsync(fileUri, response.data);
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Success', `Report saved to sandbox at ${fileUri}`);
            }
        } catch (error) {
            console.error('Failed to export system report:', error);
            Alert.alert('Error', 'Failed to export system report.');
        } finally {
            setLoadingSystem(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                        <ChevronLeft size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Reports Administration</Text>
                    <View className="w-10" />
                </View>

                <View className="mt-8">
                    <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Data & Analytics</Text>
                    <Text className="text-white text-2xl font-black">Audit & Performance Logs</Text>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 -mt-6" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* 1. Academic Performance card */}
                <PremiumCard variant="elevated" className="mt-2 mb-4 p-5 bg-white border-gray-100">
                    <View className="flex-row items-center mb-3">
                        <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                            <BookOpen size={18} color="#3B82F6" />
                        </View>
                        <View>
                            <Text className="text-primary font-black text-sm uppercase">Academic Performance</Text>
                            <Text className="text-gray-400 text-[9px] uppercase font-bold mt-0.5">Students Exam & Assignment Averages</Text>
                        </View>
                    </View>

                    <Text className="text-gray-500 text-xs mb-4">
                        Download comprehensive academic record reports containing average exam scores, assignment percentages, and course metrics.
                    </Text>

                    <View className="mb-4">
                        <Text className="text-primary font-bold text-xs uppercase mb-2 ml-1">Optional Student User ID</Text>
                        <TextInput
                            value={academicStudentId}
                            onChangeText={setAcademicStudentId}
                            placeholder="e.g. 3 (leave blank for self/logged-in)"
                            keyboardType="numeric"
                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-12 text-primary text-sm"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleExportAcademic}
                        disabled={loadingAcademic}
                        className="bg-primary py-3.5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20"
                    >
                        {loadingAcademic ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Download size={16} color="white" />
                                <Text className="text-white font-bold ml-2 text-xs uppercase tracking-wider">Export Academic CSV</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </PremiumCard>

                {/* 2. Attendance audit card */}
                <PremiumCard variant="elevated" className="mb-4 p-5 bg-white border-gray-100">
                    <View className="flex-row items-center mb-3">
                        <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center mr-3">
                            <Users size={18} color="#10B981" />
                        </View>
                        <View>
                            <Text className="text-primary font-black text-sm uppercase">Attendance Log Audit</Text>
                            <Text className="text-gray-400 text-[9px] uppercase font-bold mt-0.5">Tracked classroom attendance history</Text>
                        </View>
                    </View>

                    <Text className="text-gray-500 text-xs mb-4">
                        Download student attendance records. Provides total days tracked, present/absent counts, and chronological logs.
                    </Text>

                    <View className="mb-4">
                        <Text className="text-primary font-bold text-xs uppercase mb-2 ml-1">Optional Student User ID</Text>
                        <TextInput
                            value={attendanceStudentId}
                            onChangeText={setAttendanceStudentId}
                            placeholder="e.g. 3 (leave blank for self/logged-in)"
                            keyboardType="numeric"
                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-12 text-primary text-sm"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleExportAttendance}
                        disabled={loadingAttendance}
                        className="bg-primary py-3.5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20"
                    >
                        {loadingAttendance ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Download size={16} color="white" />
                                <Text className="text-white font-bold ml-2 text-xs uppercase tracking-wider">Export Attendance CSV</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </PremiumCard>

                {/* 3. System usage card */}
                <PremiumCard variant="elevated" className="mb-4 p-5 bg-white border-gray-100">
                    <View className="flex-row items-center mb-3">
                        <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center mr-3">
                            <Activity size={18} color="#8B5CF6" />
                        </View>
                        <View>
                            <Text className="text-primary font-black text-sm uppercase">System Usage Analytics</Text>
                            <Text className="text-gray-400 text-[9px] uppercase font-bold mt-0.5">Global platforms statistics & popularity</Text>
                        </View>
                    </View>

                    <Text className="text-gray-500 text-xs mb-4">
                        Export system-wide analytics logs containing role distributions, active session telemetry, popular course enrollments, and social engagement metrics.
                    </Text>

                    <TouchableOpacity
                        onPress={handleExportSystem}
                        disabled={loadingSystem}
                        className="bg-primary py-3.5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20"
                    >
                        {loadingSystem ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Download size={16} color="white" />
                                <Text className="text-white font-bold ml-2 text-xs uppercase tracking-wider">Export System Analytics CSV</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </PremiumCard>
            </ScrollView>
        </SafeAreaView>
    );
}
