import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import {
    BarChart2,
    TrendingUp,
    Users,
    Award,
    CheckCircle,
    AlertCircle,
    Download,
    ChevronLeft
} from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { ProgressCard } from '../../components/shared/ProgressCard';

export default function LecturerAnalytics() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lecturer/analytics');
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAnalytics();
        setRefreshing(false);
    }, []);

    if (loading && !analytics) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />
            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Header */}
                <View className="bg-primary px-6 pt-6 pb-16 rounded-b-[40px] shadow-lg">
                    <View className="flex-row items-center justify-between mb-8">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => router.back()} className="mr-4">
                                <ChevronLeft size={24} color="white" />
                            </TouchableOpacity>
                            <View>
                                <Text className="text-gray-300 text-sm font-medium">Performance Insights</Text>
                                <Text className="text-white text-3xl font-bold">Class Analytics</Text>
                            </View>
                        </View>
                        <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                            <Download size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row">
                        <ProgressCard
                            label="Engagement"
                            value="82%"
                            icon={Users}
                            color="#FFD700"
                            subtitle="Active Students"
                            trend={{ value: 12, isUp: true }}
                        />
                        <ProgressCard
                            label="Avg. Score"
                            value="74.2"
                            icon={Award}
                            color="#10B981"
                            subtitle="Across all courses"
                            trend={{ value: 3, isUp: true }}
                        />
                    </View>
                </View>

                {/* Content */}
                <View className="px-6 -mt-6">
                    {/* Submission Rates */}
                    <PremiumCard variant="elevated" className="mb-6 bg-white">
                        <View className="flex-row items-center justify-between mb-6">
                            <View>
                                <Text className="text-primary font-bold text-lg">Submission Rates</Text>
                                <Text className="text-gray-400 text-xs">Current active assignments</Text>
                            </View>
                            <BarChart2 size={20} color="#002147" />
                        </View>

                        {/* Simple Visual Bar Chart */}
                        {[
                            { label: 'Algorithm Design', val: 95, color: '#10B981' },
                            { label: 'Database Systems', val: 78, color: '#3B82F6' },
                            { label: 'Network Security', val: 56, color: '#F59E0B' },
                        ].map((item, i) => (
                            <View key={i} className="mb-5">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-gray-600 font-bold text-xs">{item.label}</Text>
                                    <Text className="text-primary font-black text-xs">{item.val}%</Text>
                                </View>
                                <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <View
                                        style={{ width: `${item.val}%`, backgroundColor: item.color }}
                                        className="h-full rounded-full"
                                    />
                                </View>
                            </View>
                        ))}
                    </PremiumCard>

                    {/* Student Rankings / At Risk */}
                    <Text className="text-primary text-xl font-bold mb-4">Student Status</Text>
                    <View className="flex-row mb-6 mt-2">
                        <TouchableOpacity className="flex-1 mr-2 bg-emerald-50 p-6 rounded-[32px] border border-emerald-100">
                            <View className="bg-emerald-100 w-10 h-10 rounded-xl items-center justify-center mb-3">
                                <TrendingUp size={20} color="#059669" />
                            </View>
                            <Text className="text-emerald-900 font-bold text-base">Elite</Text>
                            <Text className="text-emerald-600 text-xs">15 Students</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-1 ml-2 bg-rose-50 p-6 rounded-[32px] border border-rose-100">
                            <View className="bg-rose-100 w-10 h-10 rounded-xl items-center justify-center mb-3">
                                <AlertCircle size={20} color="#E11D48" />
                            </View>
                            <Text className="text-rose-900 font-bold text-base">At Risk</Text>
                            <Text className="text-rose-600 text-xs">4 Students</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Detailed Course breakdown */}
                    <Text className="text-primary text-lg font-bold mb-4">Course Breakdown</Text>
                    {analytics?.courses?.map((course: any, i: number) => (
                        <PremiumCard key={i} variant="solid" className="mb-4 p-5 flex-row items-center border-gray-100">
                            <View className="bg-primary/5 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                <BarChart2 size={24} color="#002147" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-primary font-bold text-base">{course.course_code} - Performance</Text>
                                <Text className="text-gray-400 text-xs">Average Score: {course.average_score}%</Text>
                            </View>
                            <View className="items-end">
                                <CheckCircle size={18} color="#10B981" />
                                <Text className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Stable</Text>
                            </View>
                        </PremiumCard>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
