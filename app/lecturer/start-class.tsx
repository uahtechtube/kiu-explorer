import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Video, Clock, Users, Calendar } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface VirtualClass {
    id: number;
    title: string;
    course_code: string;
    scheduled_at: string;
    duration: number;
    status: string;
    students_count?: number;
}

export default function StartClassPage() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<VirtualClass[]>([]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/virtual-classes', {
                params: { status: 'upcoming' }
            });
            setClasses(response.data.data || []);
        } catch (error) {
            console.error('Error fetching classes:', error);
            // Mock data
            setClasses([
                {
                    id: 1,
                    title: 'Introduction to Algorithms',
                    course_code: 'CSC 401',
                    scheduled_at: new Date().toISOString(),
                    duration: 90,
                    status: 'upcoming',
                    students_count: 65
                },
                {
                    id: 2,
                    title: 'Database Design Principles',
                    course_code: 'CSC 301',
                    scheduled_at: new Date(Date.now() + 86400000).toISOString(),
                    duration: 120,
                    status: 'upcoming',
                    students_count: 80
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchClasses();
        setRefreshing(false);
    }, []);

    const handleStartClass = async (classId: number) => {
        try {
            await api.post(`/virtual-classes/${classId}/start`);
            Alert.alert(
                'Class Started',
                'Your virtual class is now live. Students can join.',
                [{ text: 'OK', onPress: () => router.push(`/lecturer/virtual-classes/${classId}`) }]
            );
        } catch (error) {
            console.error('Error starting class:', error);
            Alert.alert('Error', 'Failed to start class. Please try again.');
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
                    <Text className="text-white text-lg font-bold">Start Virtual Class</Text>
                    <View className="w-10" />
                </View>

                <View className="mt-8">
                    <Text className="text-gray-300 text-xs font-bold uppercase mb-1">Scheduled Classes</Text>
                    <Text className="text-white text-2xl font-bold">Ready to Start</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : classes.length > 0 ? (
                    classes.map((cls) => (
                        <PremiumCard key={cls.id} variant="solid" className="mb-4 p-5 border-gray-100">
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-1">
                                    <Text className="text-primary font-bold text-lg">{cls.course_code}</Text>
                                    <Text className="text-gray-600 text-sm">{cls.title}</Text>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${cls.status === 'upcoming' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                    <Text className={`text-[10px] font-bold ${cls.status === 'upcoming' ? 'text-blue-700' : 'text-green-700'}`}>
                                        {cls.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <View className="flex-row items-center mb-2">
                                <Calendar size={14} color="#64748B" />
                                <Text className="text-gray-500 text-xs ml-2">
                                    {new Date(cls.scheduled_at).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Text>
                            </View>

                            <View className="flex-row items-center mb-4">
                                <Clock size={14} color="#64748B" />
                                <Text className="text-gray-500 text-xs ml-2">{cls.duration} minutes</Text>
                                <Users size={14} color="#64748B" className="ml-4" />
                                <Text className="text-gray-500 text-xs ml-2">{cls.students_count || 0} students</Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleStartClass(cls.id)}
                                className="bg-primary py-3 rounded-2xl items-center flex-row justify-center"
                            >
                                <Video size={18} color="white" />
                                <Text className="text-white font-bold ml-2">Start Class Now</Text>
                            </TouchableOpacity>
                        </PremiumCard>
                    ))
                ) : (
                    <View className="items-center justify-center mt-20">
                        <Video size={48} color="#CBD5E1" />
                        <Text className="text-gray-400 text-center mt-4">No upcoming classes scheduled</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
