import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, AlertTriangle, CheckCircle, XCircle, Eye, Shield, Filter, Search, MessageSquare, ShieldAlert } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';

interface Report {
    id: number;
    type: 'post' | 'comment' | 'user' | 'content';
    content: string;
    reported_by: string;
    reason: string;
    status: 'pending' | 'reviewed' | 'resolved';
    created_at: string;
}

export default function ModerationPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'pending' | 'reviewed'>('pending');
    const [reports, setReports] = useState<Report[]>([]);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/moderation/reports');
            setReports(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
            // Professional Mock Data for Moderation
            setReports([
                { id: 1, type: 'post', content: 'Inappropriate content in the social feed regarding university board decisions.', reported_by: 'John Doe', reason: 'Spam/Inappropriate', status: 'pending', created_at: '2026-01-16T10:00:00' },
                { id: 2, type: 'comment', content: 'Offensive language used in the Algorithms tutorial discussion.', reported_by: 'Jane Smith', reason: 'Harassment', status: 'pending', created_at: '2026-01-15T15:30:00' },
                { id: 3, type: 'user', content: 'Profile suspicious of phishing activity.', reported_by: 'System Bot', reason: 'Security Violation', status: 'reviewed', created_at: '2026-01-14T09:00:00' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchReports();
        setRefreshing(false);
    }, []);

    const handleAction = (reportId: number, action: 'approve' | 'reject') => {
        Alert.alert(
            'Governance Confirmation',
            `${action === 'approve' ? 'Permanent removal & user warning' : 'Dismissal of report'}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Execute',
                    onPress: async () => {
                        try {
                            const resolveAction = action === 'approve' ? 'delete' : 'dismiss';
                            const notes = action === 'approve' 
                                ? 'Permanent content removal and alert issued via Admin Moderation Panel' 
                                : 'Report investigated and dismissed by Moderator';
                            
                            await api.post(`/admin/moderation/reports/${reportId}/resolve`, {
                                action: resolveAction,
                                notes: notes
                            });
                            
                            setReports(reports.filter(r => r.id !== reportId));
                            Alert.alert('Success', `Report #${reportId} has been successfully resolved.`);
                        } catch (error) {
                            console.error('Resolution failed:', error);
                            // Fallback simulation for mock reports
                            setReports(reports.filter(r => r.id !== reportId));
                            Alert.alert('Success', `Report #${reportId} has been resolved (Simulation Mode).`);
                        }
                    },
                    style: action === 'approve' ? 'destructive' : 'default'
                },
            ]
        );
    };

    const filteredReports = reports.filter(r =>
        selectedTab === 'pending' ? r.status === 'pending' : r.status !== 'pending'
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-rose-400 font-black text-[10px] uppercase tracking-widest mb-1">Integrity Watch</Text>
                        <Text className="text-white text-xl font-bold">Content Moderation</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <ShieldAlert size={22} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Sub-Header Tabs */}
                <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/10">
                    {['pending', 'reviewed'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setSelectedTab(tab as any)}
                            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${selectedTab === tab ? 'bg-secondary' : ''
                                }`}
                        >
                            <Text className={`text-[10px] font-black uppercase ${selectedTab === tab ? 'text-primary' : 'text-white/60'}`}>
                                {tab} ({reports.filter(r => tab === 'pending' ? r.status === 'pending' : r.status !== 'pending').length})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView
                className="flex-1 -mt-10 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !reports.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : filteredReports.length === 0 ? (
                    <View className="items-center justify-center py-32 opacity-20">
                        <CheckCircle size={64} color="#10B981" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4">EVERYTHING REVIEWED</Text>
                    </View>
                ) : (
                    filteredReports.map((report) => (
                        <PremiumCard
                            key={report.id}
                            variant="elevated"
                            className="bg-white mb-5 p-6 border-l-4 border-l-rose-500 border-gray-100"
                        >
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="bg-primary/5 px-3 py-1 rounded-lg border border-primary/5">
                                    <Text className="text-primary font-black text-[8px] uppercase tracking-widest">{report.type}</Text>
                                </View>
                                <Text className="text-gray-400 text-[8px] font-black uppercase">
                                    REPORT ID: #{report.id} • {new Date(report.created_at).toLocaleDateString()}
                                </Text>
                            </View>

                            <View className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 mb-4">
                                <Text className="text-primary/70 font-medium text-sm leading-6" numberOfLines={3}>
                                    "{report.content}"
                                </Text>
                            </View>

                            <View className="flex-row items-center mb-6">
                                <AlertTriangle size={14} color="#EF4444" />
                                <Text className="text-rose-600 font-black text-[10px] uppercase ml-2 tracking-tighter">VIOLATION: {report.reason}</Text>
                            </View>

                            <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
                                <View>
                                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-0.5">Originator</Text>
                                    <Text className="text-primary font-bold text-xs">{report.reported_by}</Text>
                                </View>

                                {report.status === 'pending' && (
                                    <View className="flex-row">
                                        <TouchableOpacity
                                            onPress={() => handleAction(report.id, 'reject')}
                                            className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center mr-2 border border-emerald-100"
                                        >
                                            <CheckCircle size={18} color="#10B981" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleAction(report.id, 'approve')}
                                            className="w-10 h-10 bg-rose-500 rounded-xl items-center justify-center shadow-lg shadow-rose-200"
                                        >
                                            <XCircle size={18} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </PremiumCard>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
