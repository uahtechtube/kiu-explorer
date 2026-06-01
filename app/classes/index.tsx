import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Video, Calendar, Clock, Users, Play, Circle, CheckCircle, ChevronLeft, Info } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

const { width } = Dimensions.get('window');

interface VirtualClass {
    id: number;
    title: string;
    course_code: string;
    lecturer_name: string;
    scheduled_at: string;
    duration: number;
    status: 'scheduled' | 'live' | 'ended';
    participants_count?: number;
    recording_url?: string;
}

export default function VirtualClassesPage() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'live' | 'recorded'>('live');
    const [classes, setClasses] = useState<VirtualClass[]>([]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const dbStatus = activeTab === 'live' ? 'active' : (activeTab === 'recorded' ? 'ended' : 'upcoming');
            const response = await api.get('/student/virtual-classes', {
                params: { status: dbStatus }
            });
            const rawList = response.data.data || response.data || [];
            const mappedList = rawList.map((c: any) => {
                let statusVal = c.status;
                if (statusVal === 'upcoming') statusVal = 'scheduled';
                if (statusVal === 'active') statusVal = 'live';
                return {
                    ...c,
                    status: statusVal
                };
            });
            setClasses(mappedList);
        } catch (error) {
            console.error('Error fetching classes:', error);
            setClasses([]); // Show empty state instead of mock data
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, [activeTab]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchClasses();
        setRefreshing(false);
    }, [activeTab]);

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit', minute: '2-digit', hour12: true,
        });
    };

    const handleJoinClass = (classItem: VirtualClass) => {
        router.push(`/classes/${classItem.id}` as any);
    };

    const filteredClasses = classes.filter(c => {
        if (activeTab === 'upcoming') return c.status === 'scheduled';
        if (activeTab === 'live') return c.status === 'live';
        if (activeTab === 'recorded') return c.status === 'ended';
        return true;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Header */}
            <View className="bg-primary px-6 pt-6 pb-24 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Digital Campus</Text>
                        <Text className="text-white text-xl font-bold">E-Classroom</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <Info size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Crystal Tab System */}
                <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/10">
                    {[
                        { key: 'live', label: 'Live Now', icon: Circle },
                        { key: 'upcoming', label: 'Upcoming', icon: Calendar },
                        { key: 'recorded', label: 'Library', icon: Play },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key as any)}
                            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${activeTab === tab.key ? 'bg-secondary' : ''
                                }`}
                        >
                            <tab.icon
                                size={14}
                                color={activeTab === tab.key ? '#002147' : 'rgba(255,255,255,0.6)'}
                                fill={tab.key === 'live' && activeTab === tab.key ? '#002147' : 'transparent'}
                            />
                            <Text
                                className={`text-[10px] font-black uppercase ml-2 ${activeTab === tab.key ? 'text-primary' : 'text-white/60'
                                    }`}
                            >
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Class Cards List */}
            <ScrollView
                className="flex-1 -mt-12 px-6"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !classes.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-24" />
                ) : filteredClasses.length === 0 ? (
                    <View className="items-center justify-center py-32 opacity-30">
                        <Video size={64} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4 text-center">
                            No {activeTab} classes found
                        </Text>
                    </View>
                ) : (
                    <View className="pt-2">
                        {filteredClasses.map((classItem) => (
                            <PremiumCard
                                key={classItem.id}
                                variant="elevated"
                                className="mb-5 overflow-hidden"
                            >
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center">
                                        <View className="w-1.5 h-6 bg-secondary rounded-full mr-3" />
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                            {classItem.course_code}
                                        </Text>
                                    </View>
                                    <StatusBadge status={classItem.status as any} />
                                </View>

                                <Text className="text-primary font-black text-xl mb-2">{classItem.title}</Text>

                                <View className="flex-row items-center mb-6">
                                    <View className="w-8 h-8 bg-primary/5 rounded-xl items-center justify-center mr-2 border border-primary/5">
                                        <Text className="text-primary font-black text-[10px]">{classItem.lecturer_name.charAt(5)}</Text>
                                    </View>
                                    <Text className="text-gray-500 text-xs font-bold">{classItem.lecturer_name}</Text>
                                    {classItem.status === 'live' && (
                                        <View className="ml-auto flex-row items-center bg-emerald-50 px-2 py-1 rounded-lg">
                                            <Users size={12} color="#10B981" />
                                            <Text className="text-emerald-600 font-black text-[10px] ml-1">{classItem.participants_count}</Text>
                                        </View>
                                    )}
                                </View>

                                <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
                                    <View className="flex-row items-center">
                                        <Clock size={12} color="#94A3B8" />
                                        <Text className="text-gray-400 font-bold text-[10px] ml-1.5 uppercase">
                                            {formatTime(classItem.scheduled_at)} • {classItem.duration}m
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleJoinClass(classItem)}
                                        className={`px-6 py-2 rounded-xl flex-row items-center ${classItem.status === 'live' ? 'bg-primary' : 'bg-gray-100'
                                            }`}
                                    >
                                        <Text className={`font-black text-[10px] uppercase mr-2 ${classItem.status === 'live' ? 'text-white' : 'text-gray-500'
                                            }`}>
                                            {classItem.status === 'live' ? 'JOIN NOW' : classItem.status === 'ended' ? 'WATCH' : 'DETAILS'}
                                        </Text>
                                        <Play size={10} color={classItem.status === 'live' ? 'white' : '#64748B'} fill={classItem.status === 'live' ? 'white' : 'transparent'} />
                                    </TouchableOpacity>
                                </View>
                            </PremiumCard>
                        ))}
                    </View>
                )}
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
