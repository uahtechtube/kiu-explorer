import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Users, Video, FileText, BarChart, MessageSquare } from 'lucide-react-native';
import api from '../../../lib/api';

interface ClassDetails {
    id: number;
    course_code: string;
    title: string;
    enrolled_students: number;
    attendance_rate: number;
    next_session: string;
}

export default function ClassManagementPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [classData, setClassData] = useState<ClassDetails | null>(null);

    useEffect(() => {
        fetchClassData();
    }, [id]);

    const fetchClassData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/lecturer/classes/${id}`);
            setClassData(response.data);
        } catch (error) {
            console.error('Error:', error);
            // Mock data
            setClassData({
                id: Number(id),
                course_code: 'CSC 401',
                title: 'Web Development',
                enrolled_students: 65,
                attendance_rate: 87,
                next_session: '2026-01-15T10:00:00',
            });
        } finally {
            setLoading(false);
        }
    };

    const managementOptions = [
        { label: 'View Students', icon: Users, color: '#3B82F6', action: () => Alert.alert('Students', 'Student list coming soon') },
        { label: 'Start Virtual Class', icon: Video, color: '#10B981', action: () => Alert.alert('Virtual Class', 'Starting class...') },
        { label: 'Upload Materials', icon: FileText, color: '#F59E0B', action: () => router.push('/lecturer/upload-tutorial') },
        { label: 'View Analytics', icon: BarChart, color: '#8B5CF6', action: () => router.push('/lecturer/analytics') },
        { label: 'Class Forum', icon: MessageSquare, color: '#EF4444', action: () => Alert.alert('Forum', 'Discussion forum coming soon') },
    ];

    if (loading || !classData) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-2xl font-bold">{classData.course_code}</Text>
                        <Text className="text-gray-300 text-sm">{classData.title}</Text>
                    </View>
                </View>

                {/* Stats Cards */}
                <View className="flex-row space-x-3">
                    <View className="flex-1 bg-white/10 p-4 rounded-2xl">
                        <Text className="text-gray-300 text-xs uppercase">Students</Text>
                        <Text className="text-white text-2xl font-bold">{classData.enrolled_students}</Text>
                    </View>
                    <View className="flex-1 bg-white/10 p-4 rounded-2xl">
                        <Text className="text-gray-300 text-xs uppercase">Attendance</Text>
                        <Text className="text-white text-2xl font-bold">{classData.attendance_rate}%</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Next Session */}
                <View className="bg-blue-50 p-5 rounded-3xl mb-6 border border-blue-100">
                    <Text className="text-blue-900 font-bold text-lg mb-1">Next Session</Text>
                    <Text className="text-blue-700">
                        {new Date(classData.next_session).toLocaleString('en-US', {
                            weekday: 'long',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>

                {/* Management Options */}
                <Text className="text-primary font-bold text-lg mb-4">Class Management</Text>
                <View className="flex-row flex-wrap justify-between">
                    {managementOptions.map((option, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={option.action}
                            className="bg-white p-5 rounded-3xl w-[48%] mb-4 shadow-sm border border-gray-100"
                        >
                            <View
                                className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                                style={{ backgroundColor: `${option.color}15` }}
                            >
                                <option.icon size={24} color={option.color} />
                            </View>
                            <Text className="text-gray-800 font-bold text-sm">{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
