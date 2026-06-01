import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle, XCircle, Clock, Share2, Download } from 'lucide-react-native';
// @ts-ignore
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface AttendanceRecord {
    id: number;
    course_code: string;
    course_title: string;
    date: string;
    status: 'Present' | 'Absent' | 'Late';
    time: string;
}

interface CourseAttendance {
    course_code: string;
    total_classes: number;
    attended: number;
    percentage: number;
}

export default function AttendancePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [summary, setSummary] = useState<CourseAttendance[]>([]);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/attendance');
            setRecords(response.data.records || []);
            setSummary(response.data.summary || []);
        } catch (error) {
            console.error('Error:', error);
            setRecords([]); // Show empty state instead of mock data
            setSummary([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (records.length === 0) {
            Alert.alert('No Data', 'There are no attendance records to export.');
            return;
        }

        try {
            const csvHeaders = 'Course Code,Course Title,Date,Status,Time\n';
            const csvRows = records.map(record => 
                `"${record.course_code}","${record.course_title}","${record.date}","${record.status}","${record.time}"`
            ).join('\n');
            const csvContent = csvHeaders + csvRows;

            const fileUri = `${FileSystem.documentDirectory}Attendance_Report.csv`;

            await FileSystem.writeAsStringAsync(fileUri, csvContent, {
                encoding: FileSystem.EncodingType.UTF8
            });

            const isSharingAvailable = await Sharing.isAvailableAsync();
            if (isSharingAvailable) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'text/csv',
                    dialogTitle: 'Export Attendance Report',
                    UTI: 'public.comma-separated-values-text'
                });
            } else {
                Alert.alert('Sharing Unavailable', 'This device does not support file sharing.');
            }
        } catch (error) {
            console.error('Export Error:', error);
            Alert.alert('Error', 'Failed to export attendance report.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Present': return '#10B981';
            case 'Absent': return '#EF4444';
            case 'Late': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white text-2xl font-bold">Attendance</Text>
                        <Text className="text-gray-300 text-sm">Track your efficiency</Text>
                    </View>
                    <TouchableOpacity
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                        onPress={handleExport}
                    >
                        <Download size={24} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {loading ? (
                    <ActivityIndicator size="large" color="#002147" />
                ) : (
                    <>
                        {/* Summary Cards */}
                        <Text className="text-primary font-bold text-lg mb-4">Course Summary</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-2">
                            {summary.map((course, index) => (
                                <View key={index} className="bg-white p-4 rounded-3xl w-40 mx-2 shadow-sm border border-gray-100">
                                    <Text className="text-gray-500 font-bold mb-2">{course.course_code}</Text>
                                    <Text className="text-3xl font-bold mb-1" style={{
                                        color: course.percentage >= 75 ? '#10B981' : '#EF4444'
                                    }}>
                                        {course.percentage}%
                                    </Text>
                                    <Text className="text-gray-400 text-xs">
                                        {course.attended}/{course.total_classes} classes
                                    </Text>

                                    {/* Progress Bar */}
                                    <View className="h-1.5 bg-gray-100 rounded-full mt-3 overflow-hidden">
                                        <View
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${course.percentage}%`,
                                                backgroundColor: course.percentage >= 75 ? '#10B981' : '#EF4444'
                                            }}
                                        />
                                    </View>
                                </View>
                            ))}
                        </ScrollView>

                        {/* Attendance History */}
                        <Text className="text-primary font-bold text-lg mb-4">Recent History</Text>
                        {records.map((record) => (
                            <View key={record.id} className="bg-white p-4 rounded-2xl mb-3 shadow-sm border-l-4" style={{
                                borderLeftColor: getStatusColor(record.status)
                            }}>
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-gray-800 font-bold text-base">{record.course_code}</Text>
                                    <Text className="text-sm font-bold" style={{ color: getStatusColor(record.status) }}>
                                        {record.status}
                                    </Text>
                                </View>
                                <Text className="text-gray-500 text-sm mb-2">{record.course_title}</Text>

                                <View className="flex-row justify-between border-t border-gray-100 pt-2">
                                    <Text className="text-gray-400 text-xs">{new Date(record.date).toDateString()}</Text>
                                    <Text className="text-gray-400 text-xs">{record.time}</Text>
                                </View>
                            </View>
                        ))}
                    </>
                )}
                <View className="h-6" />
            </ScrollView>
        </SafeAreaView>
    );
}
