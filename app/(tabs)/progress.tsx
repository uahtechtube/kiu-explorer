import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    TrendingUp,
    Award,
    Users,
    Clock,
    BookOpen,
    GraduationCap,
    Filter,
    ChevronRight,
    Target
} from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { ProgressCard } from '../../components/shared/ProgressCard';

export default function ProgressDashboard() {
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/progress/academic');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching progress stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    }, []);

    const coursesList = stats?.courses || [];
    const averageScore = coursesList.length > 0
        ? (coursesList.reduce((sum: number, c: any) => sum + (c.score || 0), 0) / coursesList.length).toFixed(1)
        : '0.0';

    if (loading && !stats) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
                <Text className="mt-4 text-gray-400 font-medium">Analyzing your progress...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Profile/Header Section */}
                <View className="bg-primary px-6 pt-6 pb-16 rounded-b-[40px] shadow-lg">
                    <View className="flex-row items-center justify-between mb-8">
                        <View>
                            <Text className="text-gray-300 text-sm font-medium">Academic Performance</Text>
                            <Text className="text-white text-3xl font-bold">My Stats</Text>
                        </View>
                        <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                            <Award size={24} color="#FFD700" />
                        </TouchableOpacity>
                    </View>

                    {/* Overall GPA / Performance Score Card */}
                    <PremiumCard variant="glass" className="p-6">
                        <View className="flex-row items-center justify-between">
                            <View>
                                <Text className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                                    Cumulative Performance
                                </Text>
                                <View className="flex-row items-baseline">
                                    <Text className="text-white text-4xl font-black">{averageScore}</Text>
                                    <Text className="text-white/40 text-lg font-bold"> / 100</Text>
                                </View>
                            </View>
                            <View className="bg-secondary p-4 rounded-[24px] shadow-lg shadow-secondary/20">
                                <TrendingUp size={30} color="#FFFFFF" />
                            </View>
                        </View>

                        <View className="mt-6 flex-row items-center">
                            <View className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                                <View className="h-full bg-secondary" style={{ width: `${averageScore}%` as any }} />
                            </View>
                            <Text className="text-white/80 text-xs font-bold ml-4">
                                {parseFloat(averageScore) >= 50 ? 'On Track' : 'Needs Focus'}
                            </Text>
                        </View>
                    </PremiumCard>
                </View>

                {/* Primary Metrics Grid */}
                <View className="px-5 -mt-8">
                    <View className="flex-row">
                        <ProgressCard
                            label="Attendance"
                            value={`${stats?.attendance?.rate || 0}%`}
                            icon={Clock}
                            color="#10B981"
                            subtitle="Current Semester"
                            trend={{ value: 2, isUp: true }}
                        />
                        <ProgressCard
                            label="Assignments"
                            value={stats?.assignment_performance?.average_score || '0.0'}
                            icon={BookOpen}
                            color="#3B82F6"
                            subtitle={`${stats?.assignment_performance?.total_assignments || 0} Submitted`}
                            trend={{ value: 5, isUp: true }}
                        />
                    </View>
                    <View className="flex-row">
                        <ProgressCard
                            label="Exam Avg"
                            value={`${stats?.exam_performance?.average_score || '0.0'}%`}
                            icon={GraduationCap}
                            color="#8B5CF6"
                            subtitle={`${stats?.exam_performance?.total_exams || 0} Exams Taken`}
                            trend={{ value: 1.5, isUp: false }}
                        />
                        <ProgressCard
                            label="Participation"
                            value="Elite"
                            icon={Target}
                            color="#F59E0B"
                            subtitle="Top 15% of Class"
                        />
                    </View>
                </View>

                {/* Course Performance Section */}
                <View className="px-6 mt-8 mb-4 flex-row items-center justify-between">
                    <Text className="text-primary text-xl font-bold">Course Progression</Text>
                    <TouchableOpacity className="flex-row items-center">
                        <Filter size={16} color="#64748B" />
                        <Text className="text-gray-400 text-sm ml-2">All Courses</Text>
                    </TouchableOpacity>
                </View>

                <View className="px-6 mb-10">
                    {(stats?.courses || []).map((course: any, i: number) => (
                        <PremiumCard key={i} variant="solid" className="mb-4 p-5 flex-row items-center">
                            <View className="bg-gray-100 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                                <Text className="text-primary font-bold">{course.code.split(' ')[0]}</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-primary font-bold text-base mb-1">{course.name}</Text>
                                <View className="flex-row items-center">
                                    <Text className="text-gray-400 text-xs mr-3">Score: {course.score}%</Text>
                                    <Text className="text-gray-400 text-xs">Attendance: {course.attendance}%</Text>
                                </View>
                            </View>
                            <ChevronRight size={18} color="#CBD5E1" />
                        </PremiumCard>
                    ))}

                    {(!stats?.courses || stats.courses.length === 0) && (
                        <View className="items-center justify-center py-10">
                            <BookOpen size={48} color="#D1D5DB" />
                            <Text className="text-gray-400 mt-4 text-center">No course data available</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
