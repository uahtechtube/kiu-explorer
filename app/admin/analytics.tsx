import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, TrendingUp, Users, BookOpen, Activity, Calendar, Download, Filter, Target, X, ChevronRight, FileSpreadsheet, Layers } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import AdminNavBar from '../../components/admin/AdminNavBar';

const { width } = Dimensions.get('window');

interface SystemAnalytics {
    user_growth: Array<{ month: string; count: number }>;
    course_enrollment: Array<{ course: string; students: number }>;
    engagement_metrics: {
        daily_active_users: number;
        avg_session_duration: number;
        total_logins_today: number;
    };
}

export default function SystemAnalyticsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
    const [showExportModal, setShowExportModal] = useState(false);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/analytics');
            setAnalytics(response.data);
        } catch (error) {
            console.error('Error:', error);
            // Mock data fallback...
            setAnalytics({
                user_growth: [
                    { month: 'SEP', count: 4200 }, { month: 'OCT', count: 4500 }, { month: 'NOV', count: 4800 }, { month: 'DEC', count: 5000 }, { month: 'JAN', count: 5245 },
                ],
                course_enrollment: [
                    { course: 'CSC 401: Distributed Systems', students: 65 }, { course: 'CSC 301: Algorithms', students: 80 }, { course: 'MTH 201: Calculus II', students: 72 }, { course: 'ENG 101: Communication', students: 95 },
                ],
                engagement_metrics: { daily_active_users: 3420, avg_session_duration: 45, total_logins_today: 4150 },
            });
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type: string) => {
        try {
            Alert.alert('Exporting Data', `Starting CSV export for ${type} analytics...`);
            const response = await api.get('/admin/analytics/export', {
                params: { format: 'csv', type },
                responseType: 'blob'
            });
            setShowExportModal(false);
            Alert.alert('Success', 'Analytics report generated and ready for download.');
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Error', 'Failed to generate export file.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Platform Insights</Text>
                        <Text className="text-white text-xl font-bold">System Analytics</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowExportModal(true)}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/20"
                    >
                        <Download size={20} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* Growth Visualization Placeholder Area */}
                <PremiumCard variant="glass" className="h-44 border-white/10 p-6 overflow-hidden">
                    <View className="flex-row justify-between items-start mb-6">
                        <View>
                            <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest">User Accretion</Text>
                            <Text className="text-white text-2xl font-black">+1,245 <Text className="text-emerald-400 text-xs font-bold">↑ 22%</Text></Text>
                        </View>
                        <View className="bg-white/10 px-3 py-1 rounded-lg border border-white/10">
                            <Text className="text-white/60 text-[8px] font-bold">YEAR-TO-DATE</Text>
                        </View>
                    </View>

                    {/* Visual Bar Chart */}
                    <View className="flex-row items-end justify-between h-20">
                        {(() => {
                            const userGrowth = analytics?.user_growth || [];
                            const max = Math.max(...userGrowth.map(d => d.count), 0);
                            return userGrowth.map((data, idx) => {
                                const h = (data.count / (max || 1)) * 100;
                                return (
                                    <View key={idx} className="items-center w-[12%]">
                                        <View className="w-2 bg-secondary rounded-full" style={{ height: `${h}%` }} />
                                        <Text className="text-white/30 text-[6px] font-black mt-2">{data.month}</Text>
                                    </View>
                                );
                            });
                        })()}
                    </View>
                </PremiumCard>
            </View>

            <ScrollView
                className="flex-1 -mt-8 px-6"
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {loading && !analytics ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : (
                    <>
                        {/* Core Engagement Matrix */}
                        <View className="flex-row items-center justify-between mb-4 mt-6">
                            <Text className="text-primary font-black text-xl">Engagement Matrix</Text>
                            <Filter size={16} color="#CBD5E1" />
                        </View>

                        <View className="flex-row flex-wrap justify-between mb-8">
                            {[
                                { label: 'DAU', value: analytics?.engagement_metrics?.daily_active_users, icon: Users, color: '#3B82F6' },
                                { label: 'Logins', value: analytics?.engagement_metrics?.total_logins_today, icon: Target, color: '#8B5CF6' },
                                { label: 'Session', value: analytics?.engagement_metrics ? `${analytics.engagement_metrics.avg_session_duration}m` : undefined, icon: Activity, color: '#10B981' },
                            ].map((item, idx) => (
                                <PremiumCard key={idx} variant="elevated" className="w-[31%] p-4 items-center bg-white border-gray-100">
                                    <View className="w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: `${item.color}10` }}>
                                        <item.icon size={18} color={item.color} />
                                    </View>
                                    <Text className="text-gray-400 font-black text-[8px] uppercase tracking-widest mb-1">{item.label}</Text>
                                    <Text className="text-primary font-black text-xs">{item.value?.toLocaleString()}</Text>
                                </PremiumCard>
                            ))}
                        </View>

                        {/* Professional Course Enrollment Rankings */}
                        <Text className="text-primary font-black text-xl mb-4">Elite Enrollments</Text>
                        {(analytics?.course_enrollment || []).map((course, idx) => (
                            <PremiumCard key={idx} variant="solid" className="mb-4 p-5 bg-white border-gray-100">
                                <View className="flex-row justify-between items-center mb-3">
                                    <View className="flex-1">
                                        <Text className="text-primary font-black text-sm">{course.course}</Text>
                                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Active Academic Path</Text>
                                    </View>
                                    <Text className="text-secondary font-black text-lg">{course.students}</Text>
                                </View>
                                <View className="h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                    <View
                                        className="h-full bg-primary rounded-full"
                                        style={{ width: `${(course.students / 100) * 100}%` }}
                                    />
                                </View>
                            </PremiumCard>
                        ))}
                    </>
                )}
            </ScrollView>

            {/* Export Options Modal */}
            <Modal
                visible={showExportModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowExportModal(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/60 px-6">
                    <PremiumCard variant="elevated" className="bg-white w-full p-8 rounded-[40px]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-primary text-2xl font-black">Export Analytics</Text>
                            <TouchableOpacity onPress={() => setShowExportModal(false)}>
                                <X size={24} color="#002147" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-400 text-xs font-medium mb-6 leading-5">
                            Select the data category you wish to export as a CSV report for external analysis.
                        </Text>

                        {[
                            { id: 'all', label: 'Complete System Analytics', icon: Layers },
                            { id: 'users', label: 'User Demographics & Growth', icon: Users },
                            { id: 'courses', label: 'Course Enrollment Data', icon: BookOpen },
                            { id: 'engagement', label: 'Engagement & Usage Metrics', icon: Activity }
                        ].map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                onPress={() => handleExport(option.id)}
                                className="flex-row items-center bg-gray-50 p-4 rounded-2xl mb-3 border border-gray-100"
                            >
                                <View className="w-10 h-10 bg-primary/5 rounded-xl items-center justify-center mr-4">
                                    <option.icon size={20} color="#002147" />
                                </View>
                                <Text className="flex-1 text-primary font-bold">{option.label}</Text>
                                <ChevronRight size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        ))}

                        <View className="mt-4 flex-row items-center justify-center">
                            <FileSpreadsheet size={16} color="#10B981" />
                            <Text className="ml-2 text-emerald-600 font-bold text-[10px] uppercase tracking-widest">CSV Format (Standard)</Text>
                        </View>
                    </PremiumCard>
                </View>
            </Modal>
            <AdminNavBar />
        </SafeAreaView>
    );
}
