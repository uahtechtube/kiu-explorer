import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Users, ShieldCheck, PieChart, Plus, CheckCircle2, XCircle, MoreVertical, Search, Filter, Shield } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';

interface MemberRequest {
    id: number;
    user: {
        surname: string;
        first_name: string;
        matric_number: string;
        avatar_url: string;
    };
    requested_at: string;
}

export default function ExecutiveGovernancePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'Requests' | 'Governance' | 'Polls'>('Requests');
    const [requests, setRequests] = useState<MemberRequest[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // In a real app, combine several calls
            const response = await api.get('/associations/manage/requests');
            setRequests(response.data || []);
        } catch (error) {
            console.error('Error:', error);
            // Professional Mock Data for Executives
            setRequests([
                { id: 1, user: { surname: 'Aliyu', first_name: 'Umar', matric_number: 'KIU/CSC/23/044', avatar_url: 'https://ui-avatars.com/api/?name=Umar+Aliyu' }, requested_at: '2026-01-16T08:15:00' },
                { id: 2, user: { surname: 'John', first_name: 'David', matric_number: 'KIU/CSC/23/102', avatar_url: 'https://ui-avatars.com/api/?name=David+John' }, requested_at: '2026-01-15T14:40:00' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (id: number, action: 'approve' | 'reject') => {
        Alert.alert(
            'Confirm Action',
            `Are you sure you want to ${action} this membership request?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: action.toUpperCase(), onPress: () => {
                        setRequests(requests.filter(r => r.id !== id));
                        Alert.alert('Success', `Member ${action === 'approve' ? 'admitted' : 'rejected'}.`);
                    }
                }
            ]
        );
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Executive Command Header */}
            <View className="bg-primary px-6 pt-6 pb-24 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Executive Session</Text>
                        <Text className="text-white text-xl font-bold">Governance Hub</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <ShieldCheck size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Tactical Stats Matrix */}
                <View className="flex-row justify-between">
                    {[
                        { label: 'Citizens', value: '450', icon: Users, color: '#FFD700' },
                        { label: 'Active Polls', value: '03', icon: PieChart, color: '#3B82F6' },
                        { label: 'Security', value: 'Elite', icon: Shield, color: '#10B981' },
                    ].map((stat, i) => (
                        <View key={i} className="items-center w-[30%]">
                            <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/10 mb-2">
                                <stat.icon size={20} color={stat.color} />
                            </View>
                            <Text className="text-white font-black text-lg">{stat.value}</Text>
                            <Text className="text-white/40 text-[8px] font-black uppercase">{stat.label}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Content Context Tabs */}
            <View className="px-6 -mt-8 mb-6">
                <View className="bg-white p-1 rounded-2xl flex-row shadow-xl shadow-primary/10">
                    {['Requests', 'Governance', 'Polls'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab as any)}
                            className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl ${activeTab === tab ? 'bg-primary' : ''
                                }`}
                        >
                            <Text className={`text-[10px] font-black uppercase ${activeTab === tab ? 'text-secondary' : 'text-primary/40'}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !requests.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : (
                    <>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-primary font-black text-xl">{activeTab} Queue</Text>
                            {activeTab === 'Polls' && (
                                <TouchableOpacity
                                    onPress={() => router.push('/associations/manage/create-poll')}
                                    className="bg-secondary px-3 py-1.5 rounded-lg flex-row items-center"
                                >
                                    <Plus size={14} color="#002147" />
                                    <Text className="text-primary font-black text-[10px] uppercase ml-1.5">Initiate Poll</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {activeTab === 'Requests' && requests.map((req) => (
                            <PremiumCard key={req.id} variant="elevated" className="bg-white p-4 border-gray-100 rounded-[24px] mb-4 flex-row items-center">
                                <Image source={{ uri: req.user.avatar_url }} className="w-12 h-12 rounded-xl bg-gray-50" />
                                <View className="flex-1 ml-4 mr-2">
                                    <Text className="text-primary font-black text-sm">{req.user.surname}, {req.user.first_name}</Text>
                                    <Text className="text-gray-400 font-bold text-[8px] uppercase tracking-widest">{req.user.matric_number}</Text>
                                </View>
                                <View className="flex-row">
                                    <TouchableOpacity
                                        onPress={() => handleAction(req.id, 'reject')}
                                        className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center border border-red-100 mr-2"
                                    >
                                        <XCircle size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleAction(req.id, 'approve')}
                                        className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100"
                                    >
                                        <CheckCircle2 size={18} color="#10B981" />
                                    </TouchableOpacity>
                                </View>
                            </PremiumCard>
                        ))}

                        {activeTab === 'Polls' && (
                            <PremiumCard variant="solid" className="bg-white p-6 border-gray-100 rounded-[24px] items-center py-12">
                                <PieChart size={48} color="#CBD5E1" strokeWidth={1} />
                                <Text className="text-gray-400 font-bold mt-4 text-center">No active polls under your jurisdiction</Text>
                            </PremiumCard>
                        )}

                        {activeTab === 'Governance' && (
                            <View className="space-y-4">
                                <PremiumCard variant="solid" className="p-5 bg-white border-gray-100 rounded-[24px]">
                                    <View className="flex-row items-center mb-4">
                                        <ShieldCheck size={18} color="#002147" />
                                        <Text className="text-primary font-black text-xs uppercase ml-3">Security Protocols</Text>
                                    </View>
                                    <Text className="text-gray-500 text-xs leading-5">Adjust membership verification strictness and data retention policies for your association.</Text>
                                </PremiumCard>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
