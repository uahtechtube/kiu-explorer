import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FileText, Clock, Calendar, Trophy, AlertCircle, CheckCircle, Circle, ChevronLeft } from 'lucide-react-native';
import api from '../../lib/api';

interface Exam {
    id: number;
    title: string;
    course_code: string;
    type: 'practice' | 'midterm' | 'final';
    status: 'upcoming' | 'active' | 'completed' | 'missed';
    scheduled_at: string;
    duration: number;
    total_questions: number;
    total_marks: number;
    score?: number;
    percentage?: number;
    attempt_id?: number;
}

export default function ExamsPage() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');
    const [exams, setExams] = useState<Exam[]>([]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/exams', {
                params: { status: activeTab }
            });
            setExams(response.data.data || []);
        } catch (error) {
            console.error('Error fetching exams:', error);
            setExams([]); // Show empty state instead of mock data
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, [activeTab]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchExams();
        setRefreshing(false);
    }, [activeTab]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'TBA';

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        } else {
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        }
    };

    const formatTime = (dateString: string) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'TBA';

        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'practice':
                return '#10B981';
            case 'midterm':
                return '#F59E0B';
            case 'final':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <Circle size={12} color="#10B981" fill="#10B981" />;
            case 'upcoming':
                return <Clock size={12} color="#3B82F6" />;
            case 'completed':
                return <CheckCircle size={12} color="#10B981" />;
            case 'missed':
                return <AlertCircle size={12} color="#EF4444" />;
            default:
                return null;
        }
    };

    const handleExamPress = (exam: Exam) => {
        if (exam.status === 'active') {
            router.push(`/exams/${exam.id}/instructions`);
        } else if (exam.status === 'upcoming') {
            router.push(`/exams/${exam.id}/instructions`);
        } else if (exam.status === 'completed') {
            router.push(`/exams/results/${exam.attempt_id || exam.id}`);
        }
    };

    const filteredExams = exams.filter(e => {
        if (activeTab === 'upcoming') return e.status === 'upcoming' || e.status === 'active';
        if (activeTab === 'completed') return e.status === 'completed' || e.status === 'missed';
        return true;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-8">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mb-4"
                >
                    <ChevronLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text className="text-white text-3xl font-bold">E-Exams</Text>
                <Text className="text-gray-300 text-sm mt-1">Practice tests and assessments</Text>
            </View>

            {/* Tabs */}
            <View className="bg-white px-6 py-4 flex-row justify-between border-b border-gray-200">
                {[
                    { key: 'upcoming', label: 'Upcoming', icon: Calendar },
                    { key: 'completed', label: 'Completed', icon: Trophy },
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => setActiveTab(tab.key as any)}
                        className={`flex-1 items-center py-3 mx-1 rounded-xl ${activeTab === tab.key ? 'bg-primary' : 'bg-gray-100'
                            }`}
                    >
                        <tab.icon
                            size={20}
                            color={activeTab === tab.key ? '#FFFFFF' : '#6B7280'}
                        />
                        <Text
                            className={`text-sm mt-1 font-semibold ${activeTab === tab.key ? 'text-white' : 'text-gray-600'
                                }`}
                        >
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Quick Access to Practice */}
            {activeTab === 'upcoming' && (
                <View className="px-6 pt-4">
                    <TouchableOpacity
                        onPress={() => router.push('/exams/practice')}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 rounded-3xl flex-row items-center shadow-lg"
                        style={{ backgroundColor: '#10B981' }}
                    >
                        <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center">
                            <FileText size={28} color="#FFFFFF" />
                        </View>
                        <View className="flex-1 ml-4">
                            <Text className="text-white font-bold text-lg">Practice Quizzes</Text>
                            <Text className="text-green-100 text-sm mt-0.5">
                                Test your knowledge anytime
                            </Text>
                        </View>
                        <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center">
                            <Text className="text-white font-bold">→</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            {/* Exams List */}
            <ScrollView
                className="flex-1 px-6 pt-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#002147" />
                        <Text className="text-gray-500 mt-4">Loading exams...</Text>
                    </View>
                ) : filteredExams.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <FileText size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-lg font-semibold mt-4">
                            No {activeTab} exams
                        </Text>
                        <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                            {activeTab === 'upcoming' && 'Check back later for scheduled exams'}
                            {activeTab === 'completed' && 'Your completed exams will appear here'}
                        </Text>
                    </View>
                ) : (
                    filteredExams.map((exam) => (
                        <TouchableOpacity
                            key={exam.id}
                            onPress={() => handleExamPress(exam)}
                            className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
                        >
                            {/* Type & Status Badge */}
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    {getStatusIcon(exam.status)}
                                    <Text
                                        className="text-xs font-bold ml-1.5 uppercase"
                                        style={{ color: exam.status === 'active' ? '#10B981' : '#6B7280' }}
                                    >
                                        {exam.status}
                                    </Text>
                                </View>
                                <View
                                    className="px-3 py-1 rounded-full"
                                    style={{ backgroundColor: `${getTypeColor(exam.type)}15` }}
                                >
                                    <Text
                                        className="text-xs font-bold uppercase"
                                        style={{ color: getTypeColor(exam.type) }}
                                    >
                                        {exam.type}
                                    </Text>
                                </View>
                            </View>

                            {/* Exam Info */}
                            <Text className="text-primary text-lg font-bold mb-1">{exam.title}</Text>
                            <Text className="text-gray-500 text-sm mb-3">{exam.course_code}</Text>

                            {/* Details Grid */}
                            <View className="flex-row flex-wrap pt-3 border-t border-gray-100">
                                <View className="w-1/2 mb-3">
                                    <View className="flex-row items-center">
                                        <Calendar size={16} color="#6B7280" />
                                        <Text className="text-gray-600 text-xs ml-1.5">
                                            {formatDate(exam.scheduled_at)}
                                        </Text>
                                    </View>
                                </View>
                                <View className="w-1/2 mb-3">
                                    <View className="flex-row items-center">
                                        <Clock size={16} color="#6B7280" />
                                        <Text className="text-gray-600 text-xs ml-1.5">
                                            {formatTime(exam.scheduled_at)}
                                        </Text>
                                    </View>
                                </View>
                                <View className="w-1/2">
                                    <Text className="text-gray-500 text-xs">Duration</Text>
                                    <Text className="text-primary font-bold">{exam.duration} min</Text>
                                </View>
                                <View className="w-1/2">
                                    <Text className="text-gray-500 text-xs">Questions</Text>
                                    <Text className="text-primary font-bold">{exam.total_questions}</Text>
                                </View>
                            </View>

                            {/* Score (for completed exams) */}
                            {exam.status === 'completed' && exam.score !== undefined && (
                                <View className="mt-4 bg-green-50 p-4 rounded-2xl flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-gray-600 text-xs mb-1">Your Score</Text>
                                        <Text className="text-green-600 font-bold text-2xl">
                                            {exam.percentage?.toFixed(1)}%
                                        </Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-gray-600 text-xs">Marks</Text>
                                        <Text className="text-primary font-bold text-lg">
                                            {exam.score}/{exam.total_marks}
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {/* Action Button */}
                            <View className="mt-4">
                                {exam.status === 'active' && (
                                    <View className="bg-green-500 py-3 rounded-2xl items-center">
                                        <Text className="text-white font-bold">Start Exam Now</Text>
                                    </View>
                                )}
                                {exam.status === 'upcoming' && (
                                    <View className="bg-blue-500 py-3 rounded-2xl items-center">
                                        <Text className="text-white font-bold">View Details</Text>
                                    </View>
                                )}
                                {exam.status === 'completed' && (
                                    <View className="bg-primary py-3 rounded-2xl items-center">
                                        <Text className="text-white font-bold">View Results</Text>
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                <View className="h-6" />
            </ScrollView>
        </SafeAreaView>
    );
}
