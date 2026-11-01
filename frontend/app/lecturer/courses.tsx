import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, BookOpen, Users, GraduationCap, Clock, ChevronRight } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface Course {
    id: number;
    code: string;
    title: string;
    credits: number;
    enrollment_count: number;
    level: string;
    semester: string;
}

export default function LecturerCourses() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lecturer/courses/allocated');
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchCourses();
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
                        <Text className="text-gray-300 text-sm font-medium uppercase tracking-wider">Academic Year 2025/2026</Text>
                        <Text className="text-white text-3xl font-bold">My Courses</Text>
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
                ) : courses.length > 0 ? (
                    courses.map((course) => (
                        <PremiumCard
                            key={course.id}
                            variant="elevated"
                            className="mb-4 bg-white p-5 overflow-hidden"
                            onPress={() => router.push(`/lecturer/courses/${course.id}` as any)}
                        >
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1 mr-3">
                                    <View className="bg-blue-50 self-start px-2 py-1 rounded-md mb-2">
                                        <Text className="text-blue-600 font-bold text-xs">{course.code}</Text>
                                    </View>
                                    <Text className="text-primary font-bold text-xl leading-7" numberOfLines={2}>
                                        {course.title}
                                    </Text>
                                </View>
                                <View className="bg-primary/5 w-12 h-12 rounded-2xl items-center justify-center">
                                    <BookOpen size={24} color="#002147" />
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between border-t border-gray-100 pt-4 mt-2">
                                <View className="flex-row items-center">
                                    <View className="flex-row items-center mr-4">
                                        <Users size={16} color="#64748B" />
                                        <Text className="text-gray-500 text-sm ml-1.5 font-semibold">{course.enrollment_count} Enrolled</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <GraduationCap size={16} color="#64748B" />
                                        <Text className="text-gray-500 text-sm ml-1.5">{course.level}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    className="w-8 h-8 bg-primary rounded-full items-center justify-center shadow-sm"
                                    onPress={() => router.push(`/lecturer/courses/${course.id}` as any)}
                                >
                                    <ChevronRight size={18} color="white" />
                                </TouchableOpacity>
                            </View>
                        </PremiumCard>
                    ))
                ) : (
                    <View className="bg-white rounded-3xl p-10 items-center justify-center border border-dashed border-gray-300 mt-10">
                        <BookOpen size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 font-bold mt-4 text-center">No Courses Allocated</Text>
                        <Text className="text-gray-400 text-xs text-center mt-2 px-10">
                            Your allocated courses will appear here once assigned by the administrator.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
