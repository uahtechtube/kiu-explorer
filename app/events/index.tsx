import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Calendar, MapPin, Users, Heart, ChevronRight, ChevronLeft, Plus, Globe } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

interface Event {
    id: number;
    title: string;
    description: string;
    location: string;
    start_time: string;
    type: 'Academic' | 'Social' | 'Career' | 'Association';
    banner_url?: string;
    participants_count: number;
    is_registered: boolean;
}

export default function EventsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('All');
    const [events, setEvents] = useState<Event[]>([]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/events');
            setEvents(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
            setEvents([]); // Show empty state instead of mock data
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchEvents();
        setRefreshing(false);
    }, []);

    const filteredEvents = events.filter(e => activeTab === 'All' || (e.type || 'Social') === activeTab);
    const featuredEvent = events.find(e => e.banner_url);

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
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Social Hub</Text>
                        <Text className="text-white text-xl font-bold">University Events</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/events/create')}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/20"
                    >
                        <Plus size={24} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* Event Type Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
                    {['All', 'Academic', 'Social', 'Career', 'Association'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`px-6 py-2.5 rounded-2xl mx-2 border ${activeTab === tab ? 'bg-secondary border-secondary' : 'bg-white/10 border-white/10'
                                }`}
                        >
                            <Text className={`font-black text-[10px] uppercase ${activeTab === tab ? 'text-primary' : 'text-white/60'}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                className="flex-1 -mt-10 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {/* Featured Highlight */}
                {featuredEvent && activeTab === 'All' && (
                    <TouchableOpacity
                        onPress={() => router.push(`/events/${featuredEvent.id}`)}
                        className="mb-8"
                    >
                        <PremiumCard variant="elevated" className="p-0 overflow-hidden h-[240px]">
                            <Image source={{ uri: featuredEvent.banner_url }} className="w-full h-full" resizeMode="cover" />
                            <View className="absolute inset-0 bg-black/30" />
                            <View className="absolute top-4 left-4 bg-secondary px-3 py-1 rounded-lg">
                                <Text className="text-primary font-black text-[10px] uppercase">Featured</Text>
                            </View>
                            <View className="absolute bottom-6 left-6 right-6">
                                <View className="flex-row items-center mb-2">
                                    <Globe size={14} color="#FFD700" />
                                    <Text className="text-secondary font-black text-[10px] ml-2 uppercase tracking-widest">Major Event</Text>
                                </View>
                                <Text className="text-white font-black text-2xl leading-tight mb-2">{featuredEvent.title}</Text>
                                <View className="flex-row items-center">
                                    <MapPin size={12} color="rgba(255,255,255,0.7)" />
                                    <Text className="text-white/70 text-xs ml-1.5">{featuredEvent.location}</Text>
                                </View>
                            </View>
                        </PremiumCard>
                    </TouchableOpacity>
                )}

                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-primary font-black text-xl">All Happenings</Text>
                    <StatusBadge status="upcoming" />
                </View>

                {loading && !events.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : filteredEvents.map((event) => (
                    <PremiumCard
                        key={event.id}
                        variant="solid"
                        className="bg-white mb-4 p-5 border-gray-100"
                        onPress={() => router.push(`/events/${event.id}`)}
                    >
                        <View className="flex-row justify-between items-start mb-4">
                            <View className="bg-primary/5 p-3 rounded-2xl items-center justify-center w-14">
                                <Text className="text-primary font-black text-xl">{new Date(event.start_time).getDate()}</Text>
                                <Text className="text-primary/60 text-[8px] font-black uppercase">{new Date(event.start_time).toLocaleDateString(undefined, { month: 'short' })}</Text>
                            </View>
                            <StatusBadge status={event.is_registered ? 'active' : ((event.type || 'Social').toLowerCase() as any)} />
                        </View>

                        <Text className="text-primary font-black text-lg mb-2">{event.title}</Text>

                        <View className="flex-row items-center mb-4">
                            <MapPin size={12} color="#94A3B8" />
                            <Text className="text-gray-400 text-xs ml-1.5">{event.location}</Text>
                        </View>

                        <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
                            <View className="flex-row items-center">
                                <Users size={14} color="#64748B" />
                                <Text className="text-gray-500 font-bold text-[10px] ml-1.5 uppercase">{event.participants_count} Attending</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Text className="text-primary/60 font-black text-[10px] mr-1">REGISTER</Text>
                                <ChevronRight size={14} color="#002147" opacity={0.4} />
                            </View>
                        </View>
                    </PremiumCard>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}
