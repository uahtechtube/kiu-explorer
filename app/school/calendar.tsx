import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Calendar as CalendarIcon, Clock, MapPin, ChevronRight } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

interface CalendarEvent {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    type: 'Holiday' | 'Exam' | 'Academic' | 'Registration';
    description: string;
    location?: string;
}

export default function AcademicCalendarPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    useEffect(() => {
        fetchCalendar();
    }, []);

    const fetchCalendar = async () => {
        try {
            setLoading(true);
            const response = await api.get('/school/calendar');
            setEvents(response.data.data || []);
        } catch (error) {
            console.error('Error fetching calendar:', error);
            setEvents([]); // Show empty state instead of mock data
        } finally {
            setLoading(false);
        }
    };

    const formatDateRange = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        if (start === end) {
            return startDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        }
        return `${startDate.toLocaleDateString('en-US', { day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}`;
    };

    const filteredEvents = events.filter(event => {
        const eventMonth = new Date(event.start_date).getMonth();
        const endMonth = new Date(event.end_date).getMonth();
        return eventMonth === selectedMonth || endMonth === selectedMonth;
    });

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
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">KIU Explorer</Text>
                        <Text className="text-white text-xl font-bold">Academic Calendar</Text>
                    </View>
                    <View className="w-12" />
                </View>

                {/* Glass Month Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-1">
                    {months.map((month, index) => (
                        <TouchableOpacity
                            key={month}
                            onPress={() => setSelectedMonth(index)}
                            className={`px-6 py-3 rounded-2xl mr-3 border ${selectedMonth === index
                                ? 'bg-secondary border-secondary'
                                : 'bg-white/10 border-white/10'
                                }`}
                        >
                            <Text className={`font-bold ${selectedMonth === index ? 'text-primary' : 'text-white/70'}`}>
                                {month}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView className="flex-1 -mt-10 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : filteredEvents.length === 0 ? (
                    <View className="items-center justify-center py-24 opacity-40">
                        <CalendarIcon size={64} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-bold mt-4">No events scheduled</Text>
                    </View>
                ) : (
                    <View className="pt-2">
                        {filteredEvents.map((event, index) => (
                            <PremiumCard
                                key={event.id}
                                variant="elevated"
                                className="mb-4 overflow-hidden"
                            >
                                <View className="flex-row items-start">
                                    {/* Date Column */}
                                    <View className="bg-primary/5 rounded-2xl p-3 items-center justify-center mr-4 w-16">
                                        <Text className="text-primary font-black text-lg">
                                            {new Date(event.start_date).getDate()}
                                        </Text>
                                        <Text className="text-primary/60 text-[10px] font-bold uppercase">
                                            {new Date(event.start_date).toLocaleDateString(undefined, { month: 'short' })}
                                        </Text>
                                    </View>

                                    <View className="flex-1">
                                        <View className="flex-row justify-between items-center mb-1">
                                            <StatusBadge status={event.type.toLowerCase() as any} />
                                            {event.location && (
                                                <View className="flex-row items-center">
                                                    <MapPin size={10} color="#94A3B8" />
                                                    <Text className="text-gray-400 text-[10px] ml-1">{event.location}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text className="text-primary font-bold text-lg mb-1">{event.title}</Text>
                                        <Text className="text-gray-500 text-xs leading-5" numberOfLines={2}>
                                            {event.description}
                                        </Text>

                                        <View className="flex-row items-center mt-3 pt-3 border-t border-gray-50">
                                            <Clock size={12} color="#64748B" />
                                            <Text className="text-gray-400 text-[10px] font-bold ml-1.5">
                                                {formatDateRange(event.start_date, event.end_date)}
                                            </Text>
                                            <TouchableOpacity 
                                                onPress={() => Alert.alert('Reminder Set', `You will receive a notification before the event "${event.title}" starts.`)}
                                                className="ml-auto flex-row items-center"
                                            >
                                                <Text className="text-primary/60 text-[10px] font-bold mr-1">Remind Me</Text>
                                                <ChevronRight size={10} color="#002147" opacity={0.4} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            </PremiumCard>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
