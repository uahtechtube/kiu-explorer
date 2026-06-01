import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Search, Filter, BookOpen, Clock, CheckCircle2, ChevronLeft } from 'lucide-react-native';
import api from '../../lib/api';
import { AssignmentCard } from '../../components/shared/AssignmentCard';

export default function AssignmentIndex() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/assignments');
            const data = Array.isArray(response.data)
                ? response.data
                : (response.data && Array.isArray(response.data.data))
                    ? response.data.data
                    : [];
            setAssignments(data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchAssignments();
        setRefreshing(false);
    }, []);

    const filteredAssignments = assignments.filter((a: any) => {
        if (filter === 'all') return true;
        return a.status === filter;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen
                options={{
                    headerShown: false
                }}
            />

            {/* Header Section */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20 mr-4"
                        >
                            <ChevronLeft size={24} color="white" />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-gray-300 text-sm font-medium">My Academics</Text>
                            <Text className="text-white text-2xl font-bold" numberOfLines={1}>Assignments</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20 ml-2"
                        onPress={() => router.push('/search')}
                    >
                        <Search size={22} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Quick Stats in Header */}
                <View className="flex-row mt-8 space-x-3">
                    <View className="flex-1 bg-white/10 rounded-2xl p-3 border border-white/10">
                        <View className="flex-row items-center mb-1">
                            <Clock size={14} color="#FFD700" />
                            <Text className="text-white/60 text-[10px] uppercase font-bold ml-1.5">Pending</Text>
                        </View>
                        <Text className="text-white text-xl font-bold">
                            {assignments.filter(a => a.status === 'pending').length}
                        </Text>
                    </View>
                    <View className="flex-1 bg-white/10 rounded-2xl p-3 border border-white/10">
                        <View className="flex-row items-center mb-1">
                            <CheckCircle2 size={14} color="#10B981" />
                            <Text className="text-white/60 text-[10px] uppercase font-bold ml-1.5">Graded</Text>
                        </View>
                        <Text className="text-white text-xl font-bold">
                            {assignments.filter(a => a.status === 'graded').length}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Filter Tabs */}
            <View className="px-6 flex-row items-center mt-6 mb-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-grow">
                    {['all', 'pending', 'submitted', 'graded'].map((type) => (
                        <TouchableOpacity
                            key={type}
                            onPress={() => setFilter(type)}
                            className={`mr-3 px-5 py-2.5 rounded-2xl border ${filter === type
                                    ? 'bg-primary border-primary shadow-md shadow-primary/20'
                                    : 'bg-white border-gray-100'
                                }`}
                        >
                            <Text
                                className={`text-xs font-bold capitalize ${filter === type ? 'text-white' : 'text-gray-500'
                                    }`}
                            >
                                {type}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <TouchableOpacity className="ml-2 w-10 h-10 bg-white rounded-xl items-center justify-center border border-gray-100 shadow-sm">
                    <Filter size={18} color="#64748B" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment: any) => (
                        <AssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            onPress={() => router.push(`/assignments/${assignment.id}` as any)}
                        />
                    ))
                ) : (
                    <View className="items-center justify-center py-20">
                        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <BookOpen size={40} color="#94A3B8" />
                        </View>
                        <Text className="text-gray-500 font-bold text-lg">No assignments found</Text>
                        <Text className="text-gray-400 text-center mt-1 px-10">
                            When your lecturers upload assignments, they will appear here.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
