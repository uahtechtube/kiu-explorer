import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, FileText, Trash2, Edit, Clock, Calendar, ChevronRight } from 'lucide-react-native';
import api from '../../lib/api';

interface Exam {
    id: number;
    title: string;
    course_code: string;
    duration: number;
    start_time: string;
    questions_count: number;
}

export default function ManageExamsPage() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState<Exam[]>([]);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lecturer/exams');
            setExams(response.data);
        } catch (error) {
            console.error('Error fetching lecturer exams:', error);
            Alert.alert('Error', 'Failed to load exams.');
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

    const handleDelete = (id: number) => {
        Alert.alert(
            'Delete Exam',
            'Are you sure you want to delete this exam? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/lecturer/exams/${id}`);
                            Alert.alert('Success', 'Exam deleted successfully.');
                            fetchExams();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete exam.');
                        }
                    }
                }
            ]
        );
    };

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
                            <Text className="text-gray-300 text-sm font-medium uppercase tracking-wider">Lecturer Admin</Text>
                            <Text className="text-white text-3xl font-bold">Manage Exams</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/lecturer/create-exam')}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg"
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
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : exams.length > 0 ? (
                    exams.map((exam) => (
                        <View
                            key={exam.id}
                            className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
                        >
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1">
                                    <View className="bg-blue-50 self-start px-2 py-0.5 rounded-md mb-2">
                                        <Text className="text-blue-600 font-bold text-[10px] uppercase tracking-tighter">{exam.course_code}</Text>
                                    </View>
                                    <Text className="text-primary font-bold text-lg" numberOfLines={1}>{exam.title}</Text>
                                </View>
                                <View className="flex-row space-x-2">
                                    <TouchableOpacity 
                                        onPress={() => router.push(`/lecturer/edit-exam?id=${exam.id}` as any)}
                                        className="p-2 bg-blue-50 rounded-xl"
                                    >
                                        <Edit size={18} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => handleDelete(exam.id)}
                                        className="p-2 bg-red-50 rounded-xl"
                                    >
                                        <Trash2 size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="flex-row items-center justify-between border-t border-gray-100 pt-4">
                                <View className="flex-row items-center space-x-4">
                                    <View className="flex-row items-center">
                                        <Clock size={14} color="#64748B" />
                                        <Text className="text-gray-500 text-xs ml-1">{exam.duration}m</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Calendar size={14} color="#64748B" />
                                        <Text className="text-gray-500 text-xs ml-1">
                                            {new Date(exam.start_time).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <FileText size={14} color="#64748B" />
                                        <Text className="text-gray-500 text-xs ml-1">{exam.questions_count} Qs</Text>
                                    </View>
                                </View>
                                <TouchableOpacity
                                    onPress={() => router.push(`/lecturer/exams/${exam.id}` as any)}
                                    className="flex-row items-center"
                                >
                                    <Text className="text-primary font-bold text-xs">Stats</Text>
                                    <ChevronRight size={14} color="#002147" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <View className="bg-white rounded-3xl p-10 items-center justify-center border border-dashed border-gray-300 mt-10">
                        <FileText size={48} color="#D1D5DB" />
                        <Text className="text-gray-400 font-bold mt-4 text-center">No Exams Found</Text>
                        <Text className="text-gray-400 text-xs text-center mt-2 px-10">
                            Create and manage your exams here.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
