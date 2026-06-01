import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2, XCircle, Clock, Calendar, User, MessageSquare } from 'lucide-react-native';
import api from '../../../lib/api';

interface LeaveRequest {
    id: number;
    start_date: string;
    end_date: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    approver_comments?: string;
    student: {
        first_name: string;
        surname: string;
        matric_number: string;
    };
    hostel: {
        name: string;
    };
    room: {
        room_number: string;
    };
}

export default function AdminLeavesPortal() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [actioning, setActioning] = useState<number | null>(null);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [selectedTab, setSelectedTab] = useState<'pending' | 'reviewed'>('pending');

    // Admin comment state
    const [comments, setComments] = useState<{ [key: number]: string }>({});

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/hostels/leaves/requests');
            setLeaves(response.data.data || []);
        } catch (error) {
            console.error('Error fetching admin leaves:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchLeaves();
        setRefreshing(false);
    }, []);

    const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
        try {
            setActioning(id);
            const commentText = comments[id] || '';
            const response = await api.patch(`/admin/hostels/leaves/${id}/status`, {
                status,
                approver_comments: commentText,
            });

            if (response.data.status === 'success') {
                Alert.alert('Success', `Leave request ${status} successfully!`);
                fetchLeaves();
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update leave request.');
        } finally {
            setActioning(null);
        }
    };

    const pendingRequests = leaves.filter((l) => l.status === 'pending');
    const reviewedRequests = leaves.filter((l) => l.status !== 'pending');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-50 text-green-600';
            case 'rejected': return 'bg-red-50 text-red-600';
            default: return 'bg-amber-50 text-amber-600';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">Hostel Gate Passes & Leaves</Text>
            </View>

            {/* Sub-Tabs */}
            <View className="flex-row bg-white border-b border-gray-100 p-2">
                <TouchableOpacity
                    onPress={() => setSelectedTab('pending')}
                    className={`flex-1 py-3 rounded-2xl items-center justify-center flex-row space-x-2 ${
                        selectedTab === 'pending' ? 'bg-primary' : ''
                    }`}
                >
                    <Clock size={16} color={selectedTab === 'pending' ? 'white' : '#64748B'} />
                    <Text className={`font-bold text-sm ${selectedTab === 'pending' ? 'text-white' : 'text-slate-500'}`}>
                        Awaiting Review ({pendingRequests.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setSelectedTab('reviewed')}
                    className={`flex-1 py-3 rounded-2xl items-center justify-center flex-row space-x-2 ${
                        selectedTab === 'reviewed' ? 'bg-primary' : ''
                    }`}
                >
                    <CheckCircle2 size={16} color={selectedTab === 'reviewed' ? 'white' : '#64748B'} />
                    <Text className={`font-bold text-sm ${selectedTab === 'reviewed' ? 'text-white' : 'text-slate-500'}`}>
                        Reviewed History ({reviewedRequests.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {loading && !refreshing && actioning === null ? (
                <ActivityIndicator size="large" color="#3B82F6" className="mt-20" />
            ) : (
                <ScrollView
                    className="flex-1 p-6"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {(selectedTab === 'pending' ? pendingRequests : reviewedRequests).length > 0 ? (
                        (selectedTab === 'pending' ? pendingRequests : reviewedRequests).map((leave) => (
                            <View
                                key={leave.id}
                                className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6"
                            >
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-row items-center space-x-3">
                                        <View className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
                                            <User size={20} color="#64748B" />
                                        </View>
                                        <View>
                                            <Text className="text-primary font-bold text-base">
                                                {leave.student?.first_name} {leave.student?.surname}
                                            </Text>
                                            <Text className="text-gray-400 text-xs">{leave.student?.matric_number}</Text>
                                        </View>
                                    </View>
                                    {leave.status !== 'pending' && (
                                        <View className={`px-3 py-1 rounded-full ${getStatusColor(leave.status)}`}>
                                            <Text className="text-[10px] font-bold uppercase">{leave.status}</Text>
                                        </View>
                                    )}
                                </View>

                                <View className="bg-slate-50 p-4 border border-slate-100 rounded-2xl mb-4">
                                    <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">
                                        {leave.hostel?.name} • Room {leave.room?.room_number}
                                    </Text>
                                    <Text className="text-slate-600 text-xs">
                                        Leave Dates: <Text className="font-bold">{leave.start_date}</Text> to <Text className="font-bold">{leave.end_date}</Text>
                                    </Text>
                                </View>

                                <View className="mb-4">
                                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Reason</Text>
                                    <Text className="text-primary text-sm leading-5">{leave.reason}</Text>
                                </View>

                                {leave.status === 'pending' ? (
                                    <View className="mt-2">
                                        <Text className="text-slate-400 text-[10px] uppercase font-bold mb-2">Reviewer Remarks</Text>
                                        <TextInput
                                            placeholder="Write feedback or notes for the student..."
                                            value={comments[leave.id] || ''}
                                            onChangeText={(text) => setComments({ ...comments, [leave.id]: text })}
                                            className="bg-gray-50 border border-slate-100 px-4 py-3 rounded-2xl text-slate-800 text-xs mb-4 min-h-[60px]"
                                            multiline
                                        />

                                        <View className="flex-row space-x-3">
                                            <TouchableOpacity
                                                onPress={() => handleUpdateStatus(leave.id, 'rejected')}
                                                disabled={actioning !== null}
                                                className="flex-1 bg-red-50 border border-red-100 py-3.5 rounded-2xl items-center flex-row justify-center space-x-2"
                                            >
                                                <XCircle size={16} color="#EF4444" />
                                                <Text className="text-red-500 font-bold text-xs">REJECT</Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                onPress={() => handleUpdateStatus(leave.id, 'approved')}
                                                disabled={actioning !== null}
                                                className="flex-1 bg-green-600 py-3.5 rounded-2xl items-center flex-row justify-center space-x-2"
                                            >
                                                <CheckCircle2 size={16} color="white" />
                                                <Text className="text-white font-bold text-xs">APPROVE</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : leave.approver_comments ? (
                                    <View className="mt-2 bg-blue-50/40 p-4 border border-blue-50 rounded-2xl">
                                        <Text className="text-blue-900 font-bold text-[10px] uppercase mb-1">Decision Remarks</Text>
                                        <Text className="text-blue-800 text-xs leading-4">{leave.approver_comments}</Text>
                                    </View>
                                ) : null}
                            </View>
                        ))
                    ) : (
                        <View className="mt-20 items-center justify-center p-6 bg-white border border-gray-100 rounded-[32px]">
                            <Calendar size={64} color="#CBD5E1" />
                            <Text className="text-primary font-bold text-xl mt-4">All Clear!</Text>
                            <Text className="text-gray-400 text-center mt-2 text-xs leading-4">
                                No {selectedTab} leave or gate pass requests found in the system.
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
