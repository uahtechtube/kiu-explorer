import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Zap, Trophy, History, BookOpen, ChevronRight, Target, Clock, Filter } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

interface Quiz {
    id: number;
    title: string;
    course_name: string;
    items_count: number;
    best_score: number | null;
    last_attempt: string | null;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export default function PracticeQuizzesPage() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    const fetchQuizzes = async () => {
        try {
            setLoading(true);
            const response = await api.get('/quizzes');
            setQuizzes(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
            setQuizzes([]); // Show empty state instead of mock data
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchQuizzes();
        setRefreshing(false);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Standard Dashboard Header Bar */}
            <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-100 shadow-xs">
                <View className="flex-row items-center flex-1 pr-3">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-xl bg-gray-50 mr-3">
                        <ChevronLeft size={22} color="#002147" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-bold text-primary">Practice Quizzes</Text>
                        <Text className="text-gray-400 text-xs font-medium">Self-Assessment & Revision</Text>
                    </View>
                </View>
                <View className="p-2.5 bg-purple-50 rounded-xl border border-purple-100/60">
                    <Zap size={20} color="#7C3AED" />
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 mt-4"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {/* Hero Stats Card */}
                <View className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex-row items-center mb-6">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-1">
                            <Trophy size={14} color="#D97706" />
                            <Text className="text-gray-400 font-bold text-xs uppercase ml-1.5 tracking-wider">Mastery Level</Text>
                        </View>
                        <Text className="text-primary text-2xl font-black">Genius <Text className="text-amber-600 text-xs font-bold">Rank 4</Text></Text>
                        <Text className="text-gray-400 text-xs font-medium mt-1">12 Quizzes Completed This Semester</Text>
                    </View>
                    <View className="w-12 h-12 bg-purple-50 rounded-2xl items-center justify-center border border-purple-100">
                        <Zap size={24} color="#7C3AED" />
                    </View>
                </View>
                {loading && !quizzes.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : (
                    <>
                        <View className="flex-row items-center justify-between mt-4 mb-4">
                            <Text className="text-primary font-black text-xl">Available Drills</Text>
                            <Filter size={18} color="#CBD5E1" />
                        </View>

                        {quizzes.map((quiz) => (
                            <TouchableOpacity
                                key={quiz.id}
                                onPress={() => router.push(`/quizzes/${quiz.id}`)}
                                className="mb-4"
                            >
                                <PremiumCard variant="elevated" className="bg-white p-5 border-gray-100 rounded-[32px]">
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View className="flex-1">
                                            <View className="flex-row items-center mb-1">
                                                <View className="bg-primary/5 px-2 py-0.5 rounded-md mr-2">
                                                    <Text className="text-primary font-black text-[8px] uppercase">{quiz.course_name}</Text>
                                                </View>
                                                <StatusBadge status={quiz.difficulty.toLowerCase() as any} />
                                            </View>
                                            <Text className="text-primary font-black text-lg">{quiz.title}</Text>
                                        </View>
                                        <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center">
                                            <ChevronRight size={20} color="#CBD5E1" />
                                        </View>
                                    </View>

                                    <View className="flex-row items-center justify-between border-t border-gray-50 pt-4">
                                        <View className="flex-row items-center">
                                            <Target size={14} color="#94A3B8" />
                                            <Text className="text-gray-400 text-[10px] font-bold ml-1.5 uppercase">{quiz.items_count} Questions</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Trophy size={14} color={quiz.best_score ? "#FFD700" : "#CBD5E1"} />
                                            <Text className="text-primary font-black text-[10px] ml-1.5 uppercase">
                                                {quiz.best_score ? `Best: ${quiz.best_score}%` : 'No Attempt'}
                                            </Text>
                                        </View>
                                    </View>
                                </PremiumCard>
                            </TouchableOpacity>
                        ))}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
