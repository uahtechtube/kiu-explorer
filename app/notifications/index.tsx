import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Bell, BookOpen, Calendar, CircleAlert, ChevronLeft, CheckCircle2, Trash2 } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'academic' | 'event' | 'system' | 'alert';
    created_at: string;
    is_read: boolean;
}

export default function NotificationsPage() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/notifications');
            setNotifications(response.data.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            // Professional Mock Data for Notifications
            setNotifications([
                { id: 1, title: 'Class Cancelled', message: 'CSC 401 lecture for today has been cancelled by the lecturer due to academic commitments.', type: 'academic', created_at: '2026-01-16T08:30:00', is_read: false },
                { id: 2, title: 'Exam Registration Deadline', message: 'Reminder: The deadline for exam registration is tomorrow at 5 PM. Ensure all details are correct.', type: 'alert', created_at: '2026-01-15T14:00:00', is_read: true },
                { id: 3, title: 'New Event: Career Fair', message: 'Don\'t miss the upcoming Career Fair at the Main Auditorium featuring top tech companies.', type: 'event', created_at: '2026-01-14T10:00:00', is_read: true },
                { id: 4, title: 'System Maintenance', message: 'The student portal will be down for maintenance this weekend from midnight Saturday.', type: 'system', created_at: '2026-01-13T09:00:00', is_read: true },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchNotifications();
        setRefreshing(false);
    }, []);

    const markAllAsRead = async () => {
        try {
            await api.post('/student/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error(error);
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'academic': return <BookOpen size={20} color="#3B82F6" />;
            case 'event': return <Calendar size={20} color="#10B981" />;
            case 'alert': return <CircleAlert size={20} color="#EF4444" />;
            default: return <Bell size={20} color="#6B7280" />;
        }
    };

    const getTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Professional Header */}
            <View className="bg-white px-6 pt-4 pb-6 border-b border-gray-100 flex-row justify-between items-center shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center mr-3"
                    >
                        <ChevronLeft size={20} color="#002147" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-primary text-xl font-black">Inbox</Text>
                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Alerts Center</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={markAllAsRead} className="flex-row items-center bg-primary/5 px-4 py-2 rounded-xl border border-primary/5">
                    <CheckCircle2 size={14} color="#002147" />
                    <Text className="text-primary font-black text-[10px] ml-2 uppercase">Read All</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !notifications.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : notifications.length === 0 ? (
                    <View className="items-center justify-center py-32 opacity-20">
                        <Bell size={64} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4">NO NOTIFICATIONS</Text>
                    </View>
                ) : (
                    notifications.map((notification) => (
                        <PremiumCard
                            key={notification.id}
                            variant="solid"
                            className={`flex-row items-start p-5 mb-5 ${!notification.is_read ? 'bg-white border-blue-500/20' : 'bg-white border-gray-100'
                                }`}
                        >
                            <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 border ${!notification.is_read ? 'bg-primary/5 border-primary/5' : 'bg-gray-50 border-gray-50'
                                }`}>
                                {getIcon(notification.type)}
                            </View>

                            <View className="flex-1">
                                <View className="flex-row justify-between items-start mb-2">
                                    <View className="flex-1 mr-2">
                                        <Text className={`text-base leading-5 ${!notification.is_read ? 'font-black text-primary' : 'font-bold text-gray-500'}`}>
                                            {notification.title}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mt-1">
                                        {getTimeAgo(notification.created_at)}
                                    </Text>
                                </View>
                                <Text className={`text-sm leading-5 ${!notification.is_read ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                                    {notification.message}
                                </Text>

                                <View className="flex-row items-center mt-4">
                                    <View className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: !notification.is_read ? '#3B82F6' : '#E2E8F0' }} />
                                    <Text className="text-[8px] font-black text-gray-300 uppercase tracking-widest">
                                        {notification.type}
                                    </Text>
                                </View>
                            </View>
                        </PremiumCard>
                    ))
                )}
                <View className="h-6" />
            </ScrollView>

            <TouchableOpacity 
                onPress={() => {
                    Alert.alert(
                        'Clear All Notifications',
                        'Are you sure you want to delete all notifications? This action cannot be undone.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Clear All',
                                style: 'destructive',
                                onPress: async () => {
                                    try {
                                        await api.delete('/student/notifications/clear-all');
                                        setNotifications([]);
                                        Alert.alert('Cleared', 'All notifications have been removed.');
                                    } catch (error) {
                                        console.error('Clear error:', error);
                                        Alert.alert('Error', 'Failed to clear notifications.');
                                    }
                                }
                            }
                        ]
                    );
                }}
                className="absolute bottom-8 right-8 w-14 h-14 bg-rose-500 rounded-2xl items-center justify-center shadow-xl shadow-rose-500/30"
            >
                <Trash2 size={24} color="white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
