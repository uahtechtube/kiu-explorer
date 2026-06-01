import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity,
    RefreshControl, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2, Clock, Play, Hammer } from 'lucide-react-native';
import api from '../../../lib/api';

interface Complaint {
    id: number;
    category: string;
    title: string;
    description: string;
    status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
    admin_comment?: string;
    student: { name: string; matric_number: string };
    hostel: { name: string };
    room: { room_number: string };
}

const STATUS_META: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', icon: <Clock size={14} color="#D97706" /> },
    assigned: { bg: 'bg-purple-50', text: 'text-purple-600', icon: <Hammer size={14} color="#9333EA" /> },
    in_progress: { bg: 'bg-blue-50', text: 'text-blue-600', icon: <Play size={14} color="#3B82F6" /> },
    resolved: { bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle2 size={14} color="#10B981" /> },
    closed: { bg: 'bg-gray-100', text: 'text-gray-500', icon: <CheckCircle2 size={14} color="#9CA3AF" /> },
};

export default function AdminComplaints() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState<number | null>(null);
    // Per-card comment state: {[complaintId]: string}
    const [comments, setComments] = useState<Record<number, string>>({});

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/hostels/complaints');
            setComplaints(response.data.data);
        } catch (error) {
            console.error('Error fetching admin complaints', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchComplaints();
        setRefreshing(false);
    };

    useEffect(() => { fetchComplaints(); }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            setSubmitting(id);
            await api.patch(`/admin/hostels/complaints/${id}`, {
                status,
                admin_comment: comments[id] ?? '',
            });
            Alert.alert('Updated', `Complaint marked as: ${status.replace('_', ' ')}.`);
            setComments(prev => { const next = { ...prev }; delete next[id]; return next; });
            fetchComplaints();
        } catch {
            Alert.alert('Error', 'Failed to update complaint status.');
        } finally {
            setSubmitting(null);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">Maintenance Requests</Text>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#3B82F6" className="mt-20" />
                ) : complaints.length === 0 ? (
                    <View className="mt-20 items-center">
                        <Hammer size={64} color="#E2E8F0" />
                        <Text className="text-gray-400 mt-4 text-center">No maintenance requests at the moment.</Text>
                    </View>
                ) : (
                    complaints.map((item) => {
                        const meta = STATUS_META[item.status] ?? STATUS_META.pending;
                        const isActive = item.status !== 'resolved' && item.status !== 'closed';
                        const cardComment = comments[item.id] ?? '';

                        return (
                            <View key={item.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6">
                                {/* Header row */}
                                <View className="flex-row justify-between items-center mb-3">
                                    <View className="bg-blue-50 px-3 py-1 rounded-full">
                                        <Text className="text-blue-600 text-[10px] font-bold uppercase">{item.category}</Text>
                                    </View>
                                    <View className={`flex-row items-center px-3 py-1 rounded-full ${meta.bg}`}>
                                        <View className="mr-1">{meta.icon}</View>
                                        <Text className={`text-[10px] font-bold uppercase ${meta.text}`}>
                                            {item.status.replace('_', ' ')}
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-primary font-bold text-base mb-1">{item.title}</Text>
                                <Text className="text-gray-500 text-sm leading-5 mb-2">{item.description}</Text>
                                <Text className="text-gray-400 text-[10px] font-semibold">
                                    {item.student?.name ?? '—'}  •  Room {item.room?.room_number} ({item.hostel?.name})
                                </Text>

                                {/* Existing admin feedback */}
                                {item.admin_comment ? (
                                    <View className="mt-4 p-4 bg-gray-50 rounded-2xl">
                                        <Text className="text-gray-500 text-[10px] font-bold uppercase mb-1">Admin Feedback</Text>
                                        <Text className="text-gray-600 text-xs italic">"{item.admin_comment}"</Text>
                                    </View>
                                ) : null}

                                {/* Action area for active complaints */}
                                {isActive && (
                                    <View className="mt-4">
                                        <TextInput
                                            className="bg-gray-50 p-4 rounded-2xl mb-3 text-xs text-primary border border-gray-100"
                                            placeholder="Add a comment or response note..."
                                            value={cardComment}
                                            onChangeText={(t) => setComments(prev => ({ ...prev, [item.id]: t }))}
                                            multiline
                                            textAlignVertical="top"
                                            style={{ height: 72 }}
                                        />
                                        <View className="flex-row">
                                            {item.status === 'pending' && (
                                                <TouchableOpacity
                                                    onPress={() => updateStatus(item.id, 'assigned')}
                                                    disabled={submitting === item.id}
                                                    className="flex-1 bg-purple-50 py-3 rounded-xl items-center border border-purple-100 mr-2"
                                                >
                                                    {submitting === item.id
                                                        ? <ActivityIndicator size="small" color="#9333EA" />
                                                        : <Text className="text-purple-600 font-bold text-xs">Assign</Text>
                                                    }
                                                </TouchableOpacity>
                                            )}
                                            {item.status === 'assigned' && (
                                                <TouchableOpacity
                                                    onPress={() => updateStatus(item.id, 'in_progress')}
                                                    disabled={submitting === item.id}
                                                    className="flex-1 bg-blue-50 py-3 rounded-xl items-center border border-blue-100 mr-2"
                                                >
                                                    {submitting === item.id
                                                        ? <ActivityIndicator size="small" color="#3B82F6" />
                                                        : <Text className="text-blue-600 font-bold text-xs">Start Repairs</Text>
                                                    }
                                                </TouchableOpacity>
                                            )}
                                            {(item.status === 'pending' || item.status === 'assigned' || item.status === 'in_progress') && (
                                                <TouchableOpacity
                                                    onPress={() => updateStatus(item.id, 'resolved')}
                                                    disabled={submitting === item.id}
                                                    className="flex-1 bg-green-600 py-3 rounded-xl items-center"
                                                >
                                                    {submitting === item.id
                                                        ? <ActivityIndicator size="small" color="white" />
                                                        : <Text className="text-white font-bold text-xs">Mark Resolved</Text>
                                                    }
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
