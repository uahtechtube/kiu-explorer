import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, FileText, Calendar, PlusCircle, CheckCircle2, Clock, XCircle } from 'lucide-react-native';
import api from '../../lib/api';

interface LeaveRequest {
    id: number;
    start_date: string;
    end_date: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    approver_comments?: string;
    hostel: {
        name: string;
    };
    room: {
        room_number: string;
    };
}

export default function LeaveRequests() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [activeTab, setActiveTab] = useState<'history' | 'apply'>('history');

    // Form inputs
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/hostels/leaves');
            setLeaves(response.data.data || []);
        } catch (error) {
            console.error('Error fetching leaves:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'history') {
            fetchLeaves();
        }
    }, [activeTab]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchLeaves();
        setRefreshing(false);
    }, []);

    const handleApply = async () => {
        if (!startDate || !endDate || !reason) {
            Alert.alert('Incomplete Form', 'Please fill out all fields.');
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.post('/student/hostels/leaves', {
                start_date: startDate,
                end_date: endDate,
                reason,
            });

            if (response.data.status === 'success') {
                Alert.alert('Applied Successfully', 'Your leave request has been submitted for approval.');
                setStartDate('');
                setEndDate('');
                setReason('');
                setActiveTab('history');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit leave request.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-50 text-green-600';
            case 'pending': return 'bg-amber-50 text-amber-600';
            case 'rejected': return 'bg-red-50 text-red-600';
            default: return 'bg-gray-100 text-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 size={16} color="#10B981" />;
            case 'pending': return <Clock size={16} color="#D97706" />;
            case 'rejected': return <XCircle size={16} color="#EF4444" />;
            default: return <Clock size={16} color="#64748B" />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">Leave & Gate Pass</Text>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-white border-b border-gray-100 p-2">
                <TouchableOpacity
                    onPress={() => setActiveTab('history')}
                    className={`flex-1 py-3 rounded-2xl items-center flex-row justify-center space-x-2 ${
                        activeTab === 'history' ? 'bg-primary' : ''
                    }`}
                >
                    <FileText size={16} color={activeTab === 'history' ? 'white' : '#64748B'} />
                    <Text className={`font-bold text-sm ${activeTab === 'history' ? 'text-white' : 'text-slate-500'}`}>
                        My Requests
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('apply')}
                    className={`flex-1 py-3 rounded-2xl items-center flex-row justify-center space-x-2 ${
                        activeTab === 'apply' ? 'bg-primary' : ''
                    }`}
                >
                    <PlusCircle size={16} color={activeTab === 'apply' ? 'white' : '#64748B'} />
                    <Text className={`font-bold text-sm ${activeTab === 'apply' ? 'text-white' : 'text-slate-500'}`}>
                        Apply for Leave
                    </Text>
                </TouchableOpacity>
            </View>

            {loading && !submitting ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : activeTab === 'history' ? (
                <ScrollView
                    className="flex-1 p-6"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {leaves.length > 0 ? (
                        leaves.map((leave) => (
                            <View
                                key={leave.id}
                                className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6"
                            >
                                <View className="flex-row justify-between items-start mb-4">
                                    <View>
                                        <Text className="text-primary font-bold text-base">{leave.hostel?.name}</Text>
                                        <Text className="text-gray-400 text-xs">Room {leave.room?.room_number}</Text>
                                    </View>
                                    <View className={`flex-row items-center px-3 py-1.5 rounded-full ${getStatusColor(leave.status).split(' ')[0]}`}>
                                        <View className="mr-1.5">{getStatusIcon(leave.status)}</View>
                                        <Text className={`text-[10px] font-bold uppercase ${getStatusColor(leave.status).split(' ')[1]}`}>
                                            {leave.status}
                                        </Text>
                                    </View>
                                </View>

                                <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex-row justify-between mb-4">
                                    <View>
                                        <Text className="text-slate-400 text-[10px] uppercase font-bold">Start Date</Text>
                                        <Text className="text-primary font-bold text-sm mt-1">{leave.start_date}</Text>
                                    </View>
                                    <View>
                                        <Text className="text-slate-400 text-[10px] uppercase font-bold">End Date</Text>
                                        <Text className="text-primary font-bold text-sm mt-1">{leave.end_date}</Text>
                                    </View>
                                </View>

                                <View className="mb-2">
                                    <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Reason for Leave</Text>
                                    <Text className="text-primary text-sm leading-5">{leave.reason}</Text>
                                </View>

                                {leave.approver_comments ? (
                                    <View className="mt-4 bg-blue-50/50 p-4 border border-blue-100 rounded-2xl">
                                        <Text className="text-blue-900 font-bold text-[10px] uppercase mb-1">Admin Response</Text>
                                        <Text className="text-blue-800 text-xs leading-4">{leave.approver_comments}</Text>
                                    </View>
                                ) : null}
                            </View>
                        ))
                    ) : (
                        <View className="mt-20 items-center justify-center p-6 bg-white border border-gray-100 rounded-[32px]">
                            <Calendar size={64} color="#CBD5E1" />
                            <Text className="text-primary font-bold text-xl mt-4">No Leave Requests</Text>
                            <Text className="text-gray-400 text-center mt-2 mb-6 text-sm">
                                You haven't made any leave applications yet. Apply for gate passes here!
                            </Text>
                            <TouchableOpacity
                                onPress={() => setActiveTab('apply')}
                                className="bg-blue-50 px-8 py-4 rounded-2xl"
                            >
                                <Text className="text-blue-600 font-bold">Apply Now</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            ) : (
                <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                    <View className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6">
                        <Text className="text-primary font-bold text-lg mb-4">Request Leave / Gate Pass</Text>

                        <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Departure Date (YYYY-MM-DD)</Text>
                        <TextInput
                            placeholder="e.g. 2026-06-01"
                            value={startDate}
                            onChangeText={setStartDate}
                            className="bg-gray-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-slate-800 text-sm mb-4"
                        />

                        <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Return Date (YYYY-MM-DD)</Text>
                        <TextInput
                            placeholder="e.g. 2026-06-08"
                            value={endDate}
                            onChangeText={setEndDate}
                            className="bg-gray-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-slate-800 text-sm mb-4"
                        />

                        <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Reason & Purpose</Text>
                        <TextInput
                            placeholder="State clearly why you require a gate pass/leave..."
                            value={reason}
                            onChangeText={setReason}
                            multiline
                            numberOfLines={4}
                            className="bg-gray-50 border border-slate-100 p-4 rounded-2xl text-slate-800 text-sm mb-6 min-h-[100px]"
                        />

                        <TouchableOpacity
                            onPress={handleApply}
                            disabled={submitting}
                            className="bg-primary w-full py-5 rounded-2xl items-center"
                        >
                            {submitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-base">Submit Leave Request</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
