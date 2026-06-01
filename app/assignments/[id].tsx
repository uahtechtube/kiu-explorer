import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
    ArrowLeft,
    Calendar,
    FileText,
    Download,
    HelpCircle,
    FileCheck
} from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

export default function AssignmentDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [assignment, setAssignment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get(`/assignments/${id}`);
                setAssignment(response.data);
            } catch (error) {
                console.error('Error fetching assignment detail:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    if (loading || !assignment) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
                <Text className="mt-4 text-gray-500">Loading assignment...</Text>
            </View>
        );
    }

    const isSubmitted = assignment.status === 'submitted' || assignment.status === 'graded';
    const isOverdue = new Date(assignment.due_date) < new Date() && !isSubmitted;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Custom Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-50">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                >
                    <ArrowLeft size={20} color="#002147" />
                </TouchableOpacity>
                <Text className="text-primary font-bold text-lg">Assignment Detail</Text>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                    <HelpCircle size={20} color="#64748B" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Title & Status */}
                <View className="mt-8 mb-6">
                    <View className="flex-row items-center mb-2">
                        <View className="bg-primary/5 px-2 py-1 rounded-md mr-2">
                            <Text className="text-primary text-[10px] font-bold uppercase tracking-tighter">
                                {assignment.course?.code || 'COURSE'}
                            </Text>
                        </View>
                        <StatusBadge status={isOverdue ? 'overdue' : assignment.status} />
                    </View>
                    <Text className="text-primary text-3xl font-bold leading-tight">
                        {assignment.title}
                    </Text>
                </View>

                {/* Due Date Indicator */}
                <PremiumCard variant="elevated" className="bg-primary p-6 mb-8 border-0">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="bg-white/10 p-3 rounded-2xl mr-4 border border-white/10">
                                <Calendar size={24} color="#FFD700" />
                            </View>
                            <View>
                                <Text className="text-white/60 text-xs font-medium">Final Deadline</Text>
                                <Text className="text-white text-lg font-bold">
                                    {new Date(assignment.due_date).toLocaleDateString(undefined, {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <Text className="text-white/40 text-[10px] font-bold uppercase">Time</Text>
                            <Text className="text-white font-bold">
                                {new Date(assignment.due_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </View>
                    </View>
                </PremiumCard>

                {/* Instructions */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <FileText size={20} color="#002147" className="mr-2" />
                        <Text className="text-primary text-xl font-bold">Instructions</Text>
                    </View>
                    <PremiumCard variant="solid" className="bg-gray-50/50 p-6">
                        <Text className="text-gray-600 leading-6 text-base">
                            {assignment.description || 'No detailed instructions provided.'}
                        </Text>
                        {assignment.instructions && (
                            <View className="mt-6 pt-6 border-t border-gray-100">
                                <Text className="text-primary font-bold mb-2">Additional Notes:</Text>
                                <Text className="text-gray-500 italic">{assignment.instructions}</Text>
                            </View>
                        )}
                    </PremiumCard>
                </View>

                {/* Attachments */}
                {assignment.attachment_path && (
                    <View className="mb-8">
                        <Text className="text-primary font-bold text-lg mb-4">Reference Materials</Text>
                        <TouchableOpacity
                            onPress={() => Linking.openURL(assignment.full_attachment_url)}
                            className="flex-row items-center bg-blue-50/30 p-4 rounded-2xl border border-blue-100"
                        >
                            <View className="bg-blue-100 p-3 rounded-xl mr-4">
                                <FileText size={20} color="#2563EB" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-blue-900 font-bold text-base" numberOfLines={1}>
                                    Assignment_Resource.pdf
                                </Text>
                                <Text className="text-blue-600/60 text-xs">PDF Document • 1.2 MB</Text>
                            </View>
                            <Download size={20} color="#2563EB" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Submission History / Result */}
                {isSubmitted && (
                    <View className="mb-8">
                        <Text className="text-primary font-bold text-lg mb-4">Your Submission</Text>
                        <PremiumCard variant="elevated" className="bg-emerald-50/30 border-emerald-100 p-6">
                            <View className="flex-row items-start">
                                <View className="bg-emerald-100 p-3 rounded-2xl mr-4">
                                    <FileCheck size={28} color="#059669" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-emerald-900 font-bold text-xl mb-1">Successfully Turned In</Text>
                                    <Text className="text-emerald-600 text-sm mb-4">
                                        Submitted on {new Date(assignment.submission?.submitted_at || Date.now()).toLocaleDateString()}
                                    </Text>

                                    {assignment.status === 'graded' ? (
                                        <View className="bg-white p-4 rounded-2xl border border-emerald-100 items-center justify-between flex-row">
                                            <View>
                                                <Text className="text-gray-400 text-[10px] font-bold uppercase">Final Score</Text>
                                                <View className="flex-row items-baseline">
                                                    <Text className="text-primary text-2xl font-black">{assignment.submission?.score}</Text>
                                                    <Text className="text-gray-400 font-bold"> / {assignment.max_score}</Text>
                                                </View>
                                            </View>
                                            <View className="bg-primary/5 px-4 py-2 rounded-xl">
                                                <Text className="text-primary font-bold">Excellent!</Text>
                                            </View>
                                        </View>
                                    ) : (
                                        <View className="bg-emerald-100/50 px-4 py-3 rounded-xl inline-block">
                                            <Text className="text-emerald-700 font-bold">Awaiting Grading</Text>
                                        </View>
                                    )}
                                </View>
                            </View>

                            {assignment.submission?.feedback && (
                                <View className="mt-6 pt-6 border-t border-emerald-100">
                                    <Text className="text-emerald-900 font-bold mb-2">Lecturer Feedback:</Text>
                                    <Text className="text-emerald-700 italic">"{assignment.submission.feedback}"</Text>
                                </View>
                            )}
                        </PremiumCard>
                    </View>
                )}
            </ScrollView>

            {/* Floating Action Button for Submission */}
            {!isSubmitted && (
                <View className="absolute bottom-10 left-6 right-6">
                    <TouchableOpacity
                        onPress={() => router.push(`/assignments/${id}/submit` as any)}
                        disabled={isOverdue && !assignment.allow_late_submission}
                        className={`flex-row items-center justify-center p-5 rounded-[24px] shadow-xl ${isOverdue && !assignment.allow_late_submission
                                ? 'bg-gray-300'
                                : 'bg-primary'
                            }`}
                    >
                        <View className="mr-2">
                            <FileCheck size={20} color="white" />
                        </View>
                        <Text className="text-white text-lg font-bold">
                            {isOverdue ? 'Late Submission' : 'Submit Assignment'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
