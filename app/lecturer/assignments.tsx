import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { Plus, BookOpen, Users, Clock, ChevronRight, MoreVertical } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

export default function LecturerAssignments() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [assignments, setAssignments] = useState<any[]>([]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lecturer/assignments');
            const data = Array.isArray(response.data)
                ? response.data
                : (response.data && Array.isArray(response.data.data))
                    ? response.data.data
                    : [];
            setAssignments(data);
        } catch (error) {
            console.error('Error fetching lecturer assignments:', error);
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchAssignments();
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAssignments();
        setRefreshing(false);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-gray-300 text-sm font-medium">Lecturer Portal</Text>
                        <Text className="text-white text-3xl font-bold">Manage Work</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/lecturer/create-assignment' as any)}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/20"
                    >
                        <Plus size={24} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats */}
                <View className="flex-row mt-8 space-x-3">
                    <View className="flex-1 bg-white/10 rounded-2xl p-4 border border-white/10">
                        <Text className="text-white/60 text-[10px] uppercase font-bold mb-1">Active Tasks</Text>
                        <Text className="text-white text-2xl font-bold">{assignments.length}</Text>
                    </View>
                    <View className="flex-1 bg-white/10 rounded-2xl p-4 border border-white/10">
                        <Text className="text-white/60 text-[10px] uppercase font-bold mb-1">Total Submissions</Text>
                        <Text className="text-white text-2xl font-bold">
                            {assignments.reduce((sum: number, item: any) => sum + (item.submissions_count || 0), 0)}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <Text className="text-primary text-xl font-bold mb-4">Your Assignments</Text>

                {loading && !assignments.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : assignments.length > 0 ? (
                    assignments.map((assignment: any) => (
                        <PremiumCard
                            key={assignment.id}
                            onPress={() => router.push(`/lecturer/assignments/${assignment.id}` as any)}
                            variant="elevated"
                            className="mb-4"
                        >
                            <View className="flex-row justify-between items-start">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-2">
                                        <View className="bg-primary/5 p-1.5 rounded-lg mr-2">
                                            <BookOpen size={16} color="#002147" />
                                        </View>
                                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                                            {assignment.course?.code || 'CSC 101'}
                                        </Text>
                                    </View>
                                    <Text className="text-primary text-lg font-bold mb-3" numberOfLines={1}>
                                        {assignment.title}
                                    </Text>
                                </View>
                                <TouchableOpacity className="p-2">
                                    <MoreVertical size={18} color="#64748B" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
                                <View className="flex-row space-x-4">
                                    <View className="flex-row items-center">
                                        <Users size={14} color="#64748B" />
                                        <Text className="text-gray-500 text-xs ml-1.5">{assignment.submissions_count || 0} Submissions</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Clock size={14} color="#64748B" />
                                        <Text className="text-gray-500 text-xs ml-1.5">
                                            {new Date(assignment.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </Text>
                                    </View>
                                </View>
                                <ChevronRight size={16} color="#002147" />
                            </View>
                        </PremiumCard>
                    ))
                ) : (
                    <View className="items-center justify-center py-20">
                        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <BookOpen size={40} color="#94A3B8" />
                        </View>
                        <Text className="text-gray-500 font-bold text-lg">No assignments created</Text>
                        <Text className="text-gray-400 text-center mt-1 px-10">
                            Tap the + button above to create your first assignment.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
