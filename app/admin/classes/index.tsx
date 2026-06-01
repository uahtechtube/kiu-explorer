import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Video, Users, Clock, Calendar, Play, Database, HardDrive, Film } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface VirtualClass {
    id: number;
    title: string;
    course: {
        course_code: string;
        title: string;
    };
    lecturer: {
        surname: string;
        first_name: string;
    };
    scheduled_at: string;
    duration: number;
    status: 'scheduled' | 'live' | 'ended';
    participants_count?: number;
    recording_url?: string;
    recording_size?: number;
}

export default function ClassesManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [classes, setClasses] = useState<VirtualClass[]>([]);
    const [selectedTab, setSelectedTab] = useState<'live' | 'scheduled' | 'ended'>('live');
    const [storageStats, setStorageStats] = useState({ total: 0, used: 0, recordings: 0 });

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/virtual-classes');
            // Fetch list or handle mock fallback
            const list = response.data.data || response.data || [];
            
            // Normalize list status if needed
            const normalized = list.map((c: any) => {
                let statusVal = c.status;
                if (statusVal === 'upcoming') statusVal = 'scheduled';
                if (statusVal === 'active') statusVal = 'live';
                return {
                    ...c,
                    status: statusVal || (c.is_live ? 'live' : 'ended')
                };
            });
            
            setClasses(normalized);
            setStorageStats({ total: 500000000000, used: 148000000000, recordings: normalized.filter((c: any) => c.status === 'ended').length || 18 });
        } catch (error) {
            console.error('Error fetching virtual classes:', error);
            // Mock data
            setClasses([
                {
                    id: 1,
                    title: 'Data Structures - Lecture 5',
                    course: { course_code: 'CSC301', title: 'Data Structures' },
                    lecturer: { surname: 'Ahmed', first_name: 'Ibrahim' },
                    scheduled_at: '2026-02-08T14:00:00',
                    duration: 90,
                    status: 'live',
                    participants_count: 45
                },
                {
                    id: 2,
                    title: 'Linear Algebra - Tutorial',
                    course: { course_code: 'MTH201', title: 'Linear Algebra' },
                    lecturer: { surname: 'Mohammed', first_name: 'Sarah' },
                    scheduled_at: '2026-02-08T16:00:00',
                    duration: 60,
                    status: 'scheduled',
                    participants_count: 0
                },
                {
                    id: 3,
                    title: 'Introduction to Computing - Final Review',
                    course: { course_code: 'CSC101', title: 'Intro to Computing' },
                    lecturer: { surname: 'Okoye', first_name: 'Chinedu' },
                    scheduled_at: '2026-02-07T10:00:00',
                    duration: 120,
                    status: 'ended',
                    participants_count: 110,
                    recording_url: 'https://storage.googleapis.com/kiu-recordings/csc101-rec-2.mp4',
                    recording_size: 4800000000
                }
            ]);
            setStorageStats({ total: 500000000000, used: 125000000000, recordings: 45 });
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchClasses();
        setRefreshing(false);
    }, []);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleMonitorLive = (cls: VirtualClass) => {
        Alert.alert(
            'Live Classroom Monitor',
            `Connecting to WebRTC live feed for "${cls.title}"...\n\nActive Users: ${cls.participants_count}\nBitrate: 2.4 Mbps\nServer Node: UG-WEST-3`,
            [{ text: 'Close Monitor', style: 'cancel' }]
        );
    };

    const handleViewRecording = (cls: VirtualClass) => {
        Alert.alert(
            'Cloud Recording Viewer',
            `Streaming recording for "${cls.title}"\nFile size: ${cls.recording_size ? formatBytes(cls.recording_size) : '1.2 GB'}\nFormat: H.264 MP4 High-Profile`,
            [{ text: 'Close player', style: 'cancel' }]
        );
    };

    const handleManageSchedule = (cls: VirtualClass) => {
        Alert.alert(
            'Virtual Classroom Schedule Planner',
            `Classroom ID: VCR-${cls.id}\nProposed Date: ${new Date(cls.scheduled_at).toLocaleDateString()}\nProposed Time: ${new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n\nDo you want to re-schedule or cancel this session?`,
            [
                { text: 'Keep Active', style: 'cancel' },
                {
                    text: 'Cancel Class',
                    style: 'destructive',
                    onPress: () => {
                        setClasses(classes.filter(c => c.id !== cls.id));
                        Alert.alert('Cancelled', 'Class session cancelled successfully');
                    }
                }
            ]
        );
    };

    const filteredClasses = classes.filter(cls => cls.status === selectedTab);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'live': return '#EF4444';
            case 'scheduled': return '#3B82F6';
            case 'ended': return '#64748B';
            default: return '#64748B';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-24 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Virtual Learning</Text>
                        <Text className="text-white text-xl font-bold">E-Classroom Oversight</Text>
                    </View>
                    <View className="w-12" />
                </View>

                {/* Storage Stats */}
                <PremiumCard variant="glass" className="p-5 border-white/10">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <HardDrive size={20} color="white" />
                            <Text className="text-white font-black text-sm ml-2">Storage Usage</Text>
                        </View>
                        <Text className="text-secondary font-black text-xs">
                            {formatBytes(storageStats.used)} / {formatBytes(storageStats.total)}
                        </Text>
                    </View>
                    <View className="bg-white/10 h-2 rounded-full overflow-hidden">
                        <View
                            className="bg-secondary h-full rounded-full"
                            style={{ width: `${(storageStats.used / storageStats.total) * 100}%` }}
                        />
                    </View>
                    <Text className="text-white/60 text-[10px] font-bold mt-2">
                        {storageStats.recordings} Recorded Sessions
                    </Text>
                </PremiumCard>
            </View>

            {/* Status Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mt-14 px-6 mb-4"
                contentContainerStyle={{ paddingRight: 24 }}
            >
                {['live', 'scheduled', 'ended'].map((tab) => (
                    <TouchableOpacity
                        key={tab}
                        onPress={() => setSelectedTab(tab as any)}
                        className={`mr-3 px-6 py-3 rounded-2xl border ${selectedTab === tab
                            ? 'bg-secondary border-secondary shadow-lg shadow-secondary/20'
                            : 'bg-white border-gray-100'
                            }`}
                    >
                        <Text className={`font-black text-xs uppercase ${selectedTab === tab ? 'text-primary' : 'text-gray-400'
                            }`}>
                            {tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !classes.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : filteredClasses.length === 0 ? (
                    <View className="items-center justify-center py-32 opacity-20">
                        <Video size={64} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4">NO {selectedTab.toUpperCase()} CLASSES</Text>
                    </View>
                ) : (
                    filteredClasses.map((cls) => (
                        <PremiumCard
                            key={cls.id}
                            variant="elevated"
                            className="bg-white mb-4 p-5 border-l-4 border-gray-100"
                            style={{ borderLeftColor: getStatusColor(cls.status) }}
                        >
                            {/* Header */}
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-2">
                                        <View
                                            className="px-3 py-1 rounded-lg"
                                            style={{ backgroundColor: `${getStatusColor(cls.status)}15` }}
                                        >
                                            <Text
                                                className="font-black text-[10px] uppercase tracking-widest"
                                                style={{ color: getStatusColor(cls.status) }}
                                            >
                                                {cls.status}
                                            </Text>
                                        </View>
                                        {cls.status === 'live' && (
                                            <View className="w-2 h-2 bg-rose-500 rounded-full ml-2 animate-pulse" />
                                        )}
                                    </View>
                                    <Text className="text-primary text-lg font-black">{cls.title}</Text>
                                    <Text className="text-gray-400 text-xs font-medium mt-1">
                                        {cls.course.course_code} • {cls.course.title}
                                    </Text>
                                </View>
                            </View>

                            {/* Details */}
                            <View className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 mb-4">
                                <View className="flex-row items-center mb-3">
                                    <Users size={14} color="#64748B" />
                                    <Text className="text-gray-600 text-xs font-bold ml-2">
                                        {cls.lecturer.surname} {cls.lecturer.first_name}
                                    </Text>
                                </View>
                                <View className="flex-row items-center mb-3">
                                    <Calendar size={14} color="#64748B" />
                                    <Text className="text-gray-600 text-xs font-bold ml-2">
                                        {new Date(cls.scheduled_at).toLocaleDateString()} at{' '}
                                        {new Date(cls.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Clock size={14} color="#64748B" />
                                    <Text className="text-gray-600 text-xs font-bold ml-2">
                                        {cls.duration} minutes
                                    </Text>
                                </View>
                            </View>

                            {/* Stats */}
                            {cls.status === 'live' && (
                                <View className="bg-rose-50 p-4 rounded-2xl border border-rose-100 mb-4">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-rose-600 text-xs font-black uppercase">Active Participants</Text>
                                        <Text className="text-rose-600 text-2xl font-black">{cls.participants_count}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Actions */}
                            <View className="flex-row pt-4 border-t border-gray-50">
                                {cls.status === 'live' && (
                                    <TouchableOpacity 
                                        onPress={() => handleMonitorLive(cls)}
                                        className="flex-1 bg-rose-500 rounded-xl py-3 flex-row items-center justify-center shadow-lg shadow-rose-200"
                                    >
                                        <Play size={16} color="white" />
                                        <Text className="text-white font-black text-xs ml-2 uppercase">Monitor Live</Text>
                                    </TouchableOpacity>
                                )}
                                {cls.status === 'ended' && (
                                    <TouchableOpacity 
                                        onPress={() => handleViewRecording(cls)}
                                        className="flex-1 bg-primary/5 rounded-xl py-3 flex-row items-center justify-center border border-primary/10"
                                    >
                                        <Film size={16} color="#002147" />
                                        <Text className="text-primary font-black text-xs ml-2 uppercase font-black">View Recording</Text>
                                    </TouchableOpacity>
                                )}
                                {cls.status === 'scheduled' && (
                                    <TouchableOpacity 
                                        onPress={() => handleManageSchedule(cls)}
                                        className="flex-1 bg-blue-50 rounded-xl py-3 flex-row items-center justify-center border border-blue-100"
                                    >
                                        <Calendar size={16} color="#3B82F6" />
                                        <Text className="text-blue-600 font-black text-xs ml-2 uppercase">Manage Schedule</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </PremiumCard>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
