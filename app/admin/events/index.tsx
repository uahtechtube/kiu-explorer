import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Calendar, MapPin, Users, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface Event {
    id: number;
    title: string;
    description: string;
    location: string;
    start_date: string;
    end_date: string;
    organizer: string;
    status: 'pending' | 'approved' | 'rejected';
    registrations_count?: number;
    category: string;
}

export default function EventsManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'approved'>('all');

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/events');
            setEvents(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error:', error);
            // Mock data
            setEvents([
                {
                    id: 1,
                    title: 'Tech Innovation Summit 2026',
                    description: 'Annual technology conference featuring industry leaders and innovative projects',
                    location: 'Main Auditorium',
                    start_date: '2026-03-15T09:00:00',
                    end_date: '2026-03-15T17:00:00',
                    organizer: 'Computer Science Association',
                    status: 'approved',
                    registrations_count: 245,
                    category: 'Conference'
                },
                {
                    id: 2,
                    title: 'Mathematics Workshop Series',
                    description: 'Weekly workshops on advanced mathematical concepts',
                    location: 'Science Block, Room 204',
                    start_date: '2026-02-20T14:00:00',
                    end_date: '2026-02-20T16:00:00',
                    organizer: 'Mathematics Department',
                    status: 'pending',
                    registrations_count: 0,
                    category: 'Workshop'
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
    }, []);

    const handleApprove = async (event: Event) => {
        Alert.alert(
            'Approve Event',
            `Approve "${event.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        try {
                            // await api.post(`/admin/events/${event.id}/approve`);
                            setEvents(events.map(e => e.id === event.id ? { ...e, status: 'approved' as const } : e));
                            Alert.alert('Success', 'Event approved successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to approve event');
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async (event: Event) => {
        Alert.alert(
            'Reject Event',
            `Reject "${event.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // await api.post(`/admin/events/${event.id}/reject`);
                            setEvents(events.map(e => e.id === event.id ? { ...e, status: 'rejected' as const } : e));
                            Alert.alert('Success', 'Event rejected');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to reject event');
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = async (event: Event) => {
        Alert.alert(
            'Delete Event',
            `Delete "${event.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/events/${event.id}`);
                            setEvents(events.filter(e => e.id !== event.id));
                            Alert.alert('Success', 'Event deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete event');
                        }
                    }
                }
            ]
        );
    };

    const filteredEvents = selectedTab === 'all'
        ? events
        : events.filter(e => e.status === selectedTab);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return '#10B981';
            case 'pending': return '#F59E0B';
            case 'rejected': return '#EF4444';
            default: return '#64748B';
        }
    };

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
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Campus Activities</Text>
                        <Text className="text-white text-xl font-bold">Events Management</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {/* Navigate to create event */ }}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/30"
                    >
                        <Plus size={22} color="#002147" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Filter Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mt-10 px-6 mb-4"
                contentContainerStyle={{ paddingRight: 24 }}
            >
                {['all', 'pending', 'approved'].map((tab) => (
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
                            {tab === 'all' ? 'All Events' : tab}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !events.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : filteredEvents.length === 0 ? (
                    <View className="items-center justify-center py-32 opacity-20">
                        <Calendar size={64} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4">NO EVENTS FOUND</Text>
                    </View>
                ) : (
                    filteredEvents.map((event) => (
                        <PremiumCard
                            key={event.id}
                            variant="elevated"
                            className="bg-white mb-4 p-5 border-l-4 border-gray-100"
                            style={{ borderLeftColor: getStatusColor(event.status) }}
                        >
                            {/* Header */}
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-2">
                                        <View
                                            className="px-3 py-1 rounded-lg"
                                            style={{ backgroundColor: `${getStatusColor(event.status)}15` }}
                                        >
                                            <Text
                                                className="font-black text-[10px] uppercase tracking-widest"
                                                style={{ color: getStatusColor(event.status) }}
                                            >
                                                {event.status}
                                            </Text>
                                        </View>
                                        <View className="bg-gray-50 px-3 py-1 rounded-lg ml-2 border border-gray-100">
                                            <Text className="text-gray-600 font-black text-[8px] uppercase">
                                                {event.category}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className="text-primary text-lg font-black">{event.title}</Text>
                                    <Text className="text-gray-400 text-xs font-medium mt-1" numberOfLines={2}>
                                        {event.description}
                                    </Text>
                                </View>
                            </View>

                            {/* Details */}
                            <View className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 mb-4">
                                <View className="flex-row items-center mb-3">
                                    <Calendar size={14} color="#64748B" />
                                    <Text className="text-gray-600 text-xs font-bold ml-2">
                                        {new Date(event.start_date).toLocaleDateString()} at{' '}
                                        {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                                <View className="flex-row items-center mb-3">
                                    <MapPin size={14} color="#64748B" />
                                    <Text className="text-gray-600 text-xs font-bold ml-2">{event.location}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Users size={14} color="#64748B" />
                                    <Text className="text-gray-600 text-xs font-bold ml-2">
                                        {event.organizer} • {event.registrations_count || 0} registered
                                    </Text>
                                </View>
                            </View>

                            {/* Actions */}
                            <View className="flex-row pt-4 border-t border-gray-50">
                                {event.status === 'pending' ? (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => handleReject(event)}
                                            className="flex-1 bg-rose-50 rounded-xl py-3 mr-2 flex-row items-center justify-center border border-rose-100"
                                        >
                                            <XCircle size={16} color="#EF4444" />
                                            <Text className="text-rose-600 font-black text-xs ml-2 uppercase">Reject</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleApprove(event)}
                                            className="flex-1 bg-emerald-500 rounded-xl py-3 ml-2 flex-row items-center justify-center shadow-lg shadow-emerald-200"
                                        >
                                            <CheckCircle size={16} color="white" />
                                            <Text className="text-white font-black text-xs ml-2 uppercase">Approve</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            onPress={() => {/* Navigate to edit */ }}
                                            className="flex-1 bg-primary/5 rounded-xl py-3 mr-2 flex-row items-center justify-center border border-primary/10"
                                        >
                                            <Edit size={16} color="#002147" />
                                            <Text className="text-primary font-black text-xs ml-2 uppercase">Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDelete(event)}
                                            className="flex-1 bg-rose-50 rounded-xl py-3 ml-2 flex-row items-center justify-center border border-rose-100"
                                        >
                                            <Trash2 size={16} color="#EF4444" />
                                            <Text className="text-rose-600 font-black text-xs ml-2 uppercase">Delete</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                            </View>
                        </PremiumCard>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
