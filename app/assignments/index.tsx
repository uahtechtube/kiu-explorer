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

            {/* Standard Dashboard Header Bar */}
            <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-100 shadow-xs">
                <View className="flex-row items-center flex-1 pr-3">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-xl bg-gray-50 mr-3">
                        <ChevronLeft size={22} color="#002147" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-xl font-bold text-primary">Assignments</Text>
                        <Text className="text-gray-400 text-xs font-medium">My Coursework & Deadlines</Text>
                    </View>
                </View>
                <TouchableOpacity
                    className="p-2 bg-gray-50 rounded-xl"
                    onPress={() => router.push('/search')}
                >
                    <Search size={20} color="#002147" />
                </TouchableOpacity>
            </View>

            {/* Quick Stats in Dashboard Card Style */}
            <View className="px-6 mt-4 flex-row gap-3">
                <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <View className="flex-row items-center mb-1">
                        <View className="w-7 h-7 bg-amber-50 rounded-lg items-center justify-center mr-2">
                            <Clock size={14} color="#D97706" />
                        </View>
                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Pending</Text>
                    </View>
                    <Text className="text-primary font-black text-2xl mt-1">
                        {assignments.filter(a => a.status === 'pending').length}
                    </Text>
                </View>

                <View className="flex-1 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <View className="flex-row items-center mb-1">
                        <View className="w-7 h-7 bg-emerald-50 rounded-lg items-center justify-center mr-2">
                            <CheckCircle2 size={14} color="#16A34A" />
                        </View>
                        <Text className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Graded</Text>
                    </View>
                    <Text className="text-primary font-black text-2xl mt-1">
                        {assignments.filter(a => a.status === 'graded').length}
                    </Text>
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
