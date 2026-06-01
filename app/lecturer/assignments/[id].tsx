import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, User, FileText, CheckCircle2, AlertCircle, ChevronRight, Filter } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';

export default function AssignmentSubmissions() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [assignment, setAssignment] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const [assignRes, subRes] = await Promise.all([
                api.get(`/assignments/${id}`),
                api.get(`/assignments/${id}/submissions`)
            ]);
            setAssignment(assignRes.data);
            setSubmissions(subRes.data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, [id]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchSubmissions();
        setRefreshing(false);
    }, []);

    if (loading && !assignment) {
        return <View className="flex-1 bg-white items-center justify-center"><ActivityIndicator size="large" color="#002147" /></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                        <ArrowLeft size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Submissions</Text>
                    <TouchableOpacity className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                        <Filter size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View>
                    <Text className="text-gray-300 text-xs font-bold uppercase tracking-widest mb-1">Assignment</Text>
                    <Text className="text-white text-2xl font-bold mb-4" numberOfLines={1}>{assignment?.title}</Text>

                    <View className="flex-row space-x-3">
                        <View className="flex-1 bg-white/10 rounded-2xl p-3 border border-white/10">
                            <Text className="text-white/40 text-[10px] uppercase font-bold">Turned In</Text>
                            <Text className="text-white text-xl font-bold">{submissions.length}</Text>
                        </View>
                        <View className="flex-1 bg-white/10 rounded-2xl p-3 border border-white/10">
                            <Text className="text-white/40 text-[10px] uppercase font-bold">Pending Grade</Text>
                            <Text className="text-white text-xl font-bold">
                                {submissions.filter(s => s.status === 'submitted').length}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {submissions.length > 0 ? (
                    submissions.map((submission: any) => (
                        <PremiumCard
                            key={submission.id}
                            onPress={() => router.push(`/lecturer/assignments/submissions/${submission.id}/grade` as any)}
                            variant="solid"
                            className="mb-4 py-4 px-5 border-gray-100"
                        >
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
                                        <User size={24} color="#64748B" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary font-bold text-base" numberOfLines={1}>
                                            {submission.student?.name || 'Student name'}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            ID: {submission.student?.registration_number || submission.student?.matric_number || 'KIU-...'}
                                        </Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <StatusBadge status={submission.status} className="mb-1" />
                                    {submission.status === 'graded' && (
                                        <Text className="text-primary font-black text-sm">{submission.score}%</Text>
                                    )}
                                </View>
                            </View>

                            <View className="mt-4 pt-3 border-t border-gray-50 flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <FileText size={14} color="#64748B" />
                                    <Text className="text-gray-400 text-[10px] ml-1.5 uppercase font-bold">
                                        {submission.file_path ? 'Attachment' : 'Text Submission'}
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Text className="text-primary/60 text-xs mr-2">{submission.status === 'graded' ? 'Edit Grade' : 'Grade Now'}</Text>
                                    <ChevronRight size={14} color="#002147" />
                                </View>
                            </View>
                        </PremiumCard>
                    ))
                ) : (
                    <View className="items-center justify-center py-20">
                        <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
                            <AlertCircle size={40} color="#94A3B8" />
                        </View>
                        <Text className="text-gray-500 font-bold text-lg">No submissions yet</Text>
                        <Text className="text-gray-400 text-center mt-1 px-10">
                            Students will appear here once they turn in their work.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
