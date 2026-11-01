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

            {/* High-Impact Header */}
            <View className="bg-primary px-6 pt-6 pb-24 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Self Assessment</Text>
                        <Text className="text-white text-xl font-bold">Practice Quizzes</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <History size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Hero Stats Card */}
                <PremiumCard variant="glass" className="p-6 border-white/10 flex-row items-center">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                            <Trophy size={14} color="#FFD700" />
                            <Text className="text-white/60 font-black text-[10px] uppercase ml-2 tracking-widest">Mastery Level</Text>
                        </View>
                        <Text className="text-white text-3xl font-black">Genius <Text className="text-secondary text-sm">Rank 4</Text></Text>
                        <Text className="text-white/40 text-[10px] font-bold mt-1 uppercase">12 Quizzes Completed This Semester</Text>
                    </View>
                    <View className="w-16 h-16 bg-secondary/80 rounded-full items-center justify-center border-4 border-white/10">
                        <Zap size={32} color="#002147" />
                    </View>
                </PremiumCard>
            </View>

            <ScrollView
                className="flex-1 -mt-10 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
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
