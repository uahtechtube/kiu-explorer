import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, FileText, BarChart3, Clock, CheckCircle, AlertCircle, ChevronRight, Users } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface ExamStat {
    exam_id: number;
    title: string;
    course: string;
    total_attempts: number;
    average_score: number;
    pass_rate: number;
}

export default function LecturerExams() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState<ExamStat[]>([]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lecturer/exam-stats');
            setExams(response.data);
        } catch (error) {
            console.error('Error fetching exam stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchExams();
        setRefreshing(false);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 bg-white/10 rounded-full items-center justify-center">
                            <ChevronLeft size={24} color="white" />
                        </TouchableOpacity>
                        <View>
                            <Text className="text-gray-300 text-sm font-medium uppercase tracking-wider">Assessments</Text>
                            <Text className="text-white text-3xl font-bold">Exams</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/lecturer/create-exam')}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/20"
                    >
                        <Plus size={24} color="#002147" />
                    </TouchableOpacity>
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
                ) : exams.length > 0 ? (
                    exams.map((exam) => (
                        <PremiumCard
                            key={exam.exam_id}
                            variant="elevated"
                            className="mb-4 bg-white p-5"
                            onPress={() => router.push(`/lecturer/exams/${exam.exam_id}` as any)}
                        >
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1">
                                    <View className="bg-blue-50 self-start px-2 py-0.5 rounded-md mb-2">
                                        <Text className="text-blue-600 font-bold text-[10px] uppercase tracking-tighter">{exam.course}</Text>
                                    </View>
                                    <Text className="text-primary font-bold text-lg" numberOfLines={1}>{exam.title}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-primary font-black text-xl">{exam.pass_rate}%</Text>
                                    <Text className="text-gray-400 text-[8px] uppercase font-bold">Pass Rate</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between border-t border-gray-100 pt-4">
                                <View className="flex-row items-center space-x-4">
                                    <View className="items-center">
                                        <Text className="text-gray-400 text-[10px] uppercase font-bold mb-1">Attempts</Text>
                                        <View className="flex-row items-center">
                                            <Users size={12} color="#64748B" />
                                            <Text className="text-primary font-bold text-sm ml-1">{exam.total_attempts}</Text>
                                        </View>
                                    </View>
                                    <View className="w-px h-8 bg-gray-100" />
                                    <View className="items-center">
                                        <Text className="text-gray-400 text-[10px] uppercase font-bold mb-1">Avg Score</Text>
                                        <View className="flex-row items-center">
                                            <CheckCircle size={12} color="#10B981" />
                                            <Text className="text-primary font-bold text-sm ml-1">{exam.average_score}</Text>
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    className="bg-primary/5 px-4 py-2 rounded-xl flex-row items-center"
                                    onPress={() => router.push(`/lecturer/exams/${exam.exam_id}` as any)}
                                >
                                    <Text className="text-primary font-bold text-xs mr-1">Results</Text>
                                    <ChevronRight size={14} color="#002147" />
                                </TouchableOpacity>
                            </View>
                        </PremiumCard>
                    ))
                ) : (
                    <View className="bg-white rounded-3xl p-10 items-center justify-center border border-dashed border-gray-300 mt-10">
                        <FileText size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 font-bold mt-4 text-center">No Exams Created</Text>
                        <Text className="text-gray-400 text-xs text-center mt-2 px-10">
                            Create your first exam by clicking the plus button above.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
