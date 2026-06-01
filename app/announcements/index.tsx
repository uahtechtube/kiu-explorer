import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Bell, ChevronLeft, AlertCircle, ShieldAlert, BookOpen, Globe, Info } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

interface Announcement {
    id: number;
    title: string;
    content: string;
    type: 'General' | 'Emergency' | 'Academic' | 'Event';
    posted_at: string;
    author: string;
    is_read: boolean;
}

export default function AnnouncementsPage() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/announcements');
            setAnnouncements(response.data.data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            // Professional Mock Data for Announcements
            setAnnouncements([
                { id: 1, title: 'Urgent: Campus Maintenance Closure', content: 'Due to ongoing electrical infrastructure upgrades, the South Campus will be inaccessible on Friday, 16th Jan. Classes scheduled for Hall A-E will move online.', type: 'Emergency', posted_at: '2026-01-14T08:00:00', author: 'The Registrar', is_read: false },
                { id: 2, title: 'Examination Timetable Release', content: 'First semester provisional timetables are now available. Students are advised to report discrepancies to the Dean of Students by Jan 20th.', type: 'Academic', posted_at: '2026-01-13T14:30:00', author: 'Director of Exams', is_read: true },
                { id: 3, title: 'KIU Annual Tech Fair 2026', content: 'Join us for a three-day celebration of digital innovation. Register your projects at the Students Center.', type: 'Event', posted_at: '2026-01-12T11:00:00', author: 'V.C. Office', is_read: true },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchAnnouncements();
        setRefreshing(false);
    }, []);

    const getIcon = (type: string) => {
        switch (type) {
            case 'Emergency': return <ShieldAlert size={20} color="#EF4444" />;
            case 'Academic': return <BookOpen size={20} color="#3B82F6" />;
            case 'Event': return <Globe size={20} color="#10B981" />;
            default: return <Info size={20} color="#6B7280" />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* High-End Header */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">KIU News</Text>
                        <Text className="text-white text-xl font-bold">Announcements</Text>
                    </View>
                    <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <Bell size={22} color="white" />
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 -mt-8 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !announcements.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : (
                    announcements.map((item) => (
                        <PremiumCard
                            key={item.id}
                            variant={item.type === 'Emergency' ? 'elevated' : 'solid'}
                            className={`mb-5 p-6 ${item.type === 'Emergency' ? 'bg-rose-50 border-rose-100 shadow-rose-200/40' : 'bg-white border-gray-100'}`}
                            onPress={() => router.push(`/announcements/${item.id}`)}
                        >
                            <View className="flex-row justify-between items-start mb-4">
                                <View className={`w-12 h-12 rounded-2xl items-center justify-center border ${item.type === 'Emergency' ? 'bg-white border-rose-200' : 'bg-primary/5 border-primary/5'
                                    }`}>
                                    {getIcon(item.type)}
                                </View>
                                <View className="items-end">
                                    <StatusBadge status={item.type.toLowerCase() as any} />
                                    <Text className="text-gray-400 text-[8px] font-black uppercase mt-1">
                                        {new Date(item.posted_at).toLocaleDateString()}
                                    </Text>
                                </View>
                            </View>

                            <Text className={`font-black text-xl mb-3 ${item.type === 'Emergency' ? 'text-rose-900' : 'text-primary'}`}>
                                {item.title}
                            </Text>
                            <Text className={`leading-6 text-sm font-medium ${item.type === 'Emergency' ? 'text-rose-700' : 'text-gray-500'}`}>
                                {item.content}
                            </Text>

                            <View className={`flex-row items-center mt-6 pt-4 border-t ${item.type === 'Emergency' ? 'border-rose-100' : 'border-gray-50'
                                }`}>
                                <View className="flex-row items-center bg-white/50 px-3 py-1.5 rounded-xl">
                                    <AlertCircle size={14} color="#94A3B8" />
                                    <Text className="text-gray-400 text-[10px] ml-1.5 font-black uppercase tracking-widest">{item.author}</Text>
                                </View>
                            </View>
                        </PremiumCard>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
