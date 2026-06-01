import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Calendar, MapPin, Clock, Users, ArrowLeft, Heart, Share2, ShieldCheck, ChevronRight, Bookmark } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

const { width } = Dimensions.get('window');

interface EventDetail {
    id: number;
    title: string;
    description: string;
    content: string;
    location: string;
    start_time: string;
    end_time: string;
    type: 'Academic' | 'Social' | 'Career' | 'Association';
    banner_url: string;
    participants_count: number;
    max_capacity: number;
    is_registered: boolean;
    speakers?: Array<{ name: string; role: string; image: string }>;
}

export default function EventDetailPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [event, setEvent] = useState<EventDetail | null>(null);

    useEffect(() => {
        fetchEventDetail();
    }, [id]);

    const fetchEventDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/events/${id}`);
            setEvent(response.data.data);
        } catch (error) {
            console.error('Error:', error);
            // Professional Mock Detail
            setEvent({
                id: Number(id),
                title: 'KIU Innovation & Tech Summit 2026',
                description: 'The premier technology event for Borno State students and entrepreneurs.',
                content: 'Join us for a day of inspiration, networking, and hands-on workshops with industry leaders from Google, Microsoft, and African tech giants. We will explore AI, Blockchain, and Sustainable Tech for African markets.\n\nKey highlights include:\n• Keynote speeches from top CTOs\n• Panel discussions on digital economy\n• Hands-on coding workshops\n• Startup pitching competition',
                location: 'Main University Auditorium',
                start_time: '2026-03-24T10:00:00',
                end_time: '2026-03-24T17:00:00',
                type: 'Career',
                banner_url: 'https://images.unsplash.com/photo-1540575861501-7ad060e39fe6?w=800&q=80',
                participants_count: 450,
                max_capacity: 1000,
                is_registered: false,
                speakers: [
                    { name: 'Dr. John Kashim', role: 'CTO, Nile Tech', image: 'https://i.pravatar.cc/150?u=john' },
                    { name: 'Engr. Sarah Yusuf', role: 'Head of AI, Borno Hub', image: 'https://i.pravatar.cc/150?u=sarah' },
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!event) return;
        if (event.is_registered) {
            Alert.alert(
                'Cancel Reservation',
                'Are you sure you want to cancel your seat reservation for this event?',
                [
                    { text: 'No', style: 'cancel' },
                    {
                        text: 'Yes, Cancel',
                        style: 'destructive',
                        onPress: async () => {
                            setRegistering(true);
                            try {
                                await api.post(`/student/events/${id}/unregister`);
                                setEvent(prev => prev ? { ...prev, is_registered: false, participants_count: Math.max(0, prev.participants_count - 1) } : null);
                                Alert.alert('Cancelled', 'Your seat reservation has been cancelled.');
                            } catch (error) {
                                console.error('Unregister error:', error);
                                Alert.alert('Error', 'Failed to cancel reservation. Please try again.');
                            } finally {
                                setRegistering(false);
                            }
                        }
                    }
                ]
            );
        } else {
            setRegistering(true);
            try {
                await api.post(`/student/events/${id}/register`);
                setEvent(prev => prev ? { ...prev, is_registered: true, participants_count: prev.participants_count + 1 } : null);
                Alert.alert('Success!', 'Your seat has been reserved. Check your dashboard for details.');
            } catch (error) {
                console.error('Register error:', error);
                Alert.alert('Error', 'Could not complete registration. Try again.');
            } finally {
                setRegistering(false);
            }
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out ${event?.title} at KIU Explorer!`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return (
        <View className="flex-1 bg-white items-center justify-center">
            <ActivityIndicator size="large" color="#002147" />
        </View>
    );

    if (!event) return null;

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Immersive Banner Header */}
                <View className="h-[400px] relative">
                    <Image source={{ uri: event.banner_url }} className="w-full h-full" resizeMode="cover" />
                    <View className="absolute inset-0 bg-primary/40" />
                    <SafeAreaView className="absolute top-0 w-full px-6 flex-row justify-between">
                        <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-black/20 rounded-2xl border border-white/20 items-center justify-center backdrop-blur-md">
                            <ArrowLeft size={24} color="white" />
                        </TouchableOpacity>
                        <View className="flex-row">
                            <TouchableOpacity onPress={handleShare} className="w-12 h-12 bg-black/20 rounded-2xl border border-white/20 items-center justify-center backdrop-blur-md mr-2">
                                <Share2 size={20} color="white" />
                            </TouchableOpacity>
                            <TouchableOpacity className="w-12 h-12 bg-black/20 rounded-2xl border border-white/20 items-center justify-center backdrop-blur-md">
                                <Bookmark size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>

                    <View className="absolute bottom-10 left-6 right-6">
                        <View className="flex-row items-center mb-3">
                            <StatusBadge status={(event.type || 'Social').toLowerCase() as any} />
                            <View className="flex-row items-center ml-auto">
                                <Users size={12} color="white" />
                                <Text className="text-white font-black text-[10px] ml-1.5 uppercase">
                                    {event.participants_count}/{event.max_capacity} Reserved
                                </Text>
                            </View>
                        </View>
                        <Text className="text-white text-4xl font-black leading-tight">{event.title}</Text>
                    </View>
                    <View className="absolute bottom-0 w-full h-10 bg-white rounded-t-[40px]" />
                </View>

                {/* Details Section */}
                <View className="px-6 -mt-4">
                    <View className="flex-row justify-between mb-10">
                        <PremiumCard variant="elevated" className="w-[48%] p-5 bg-gray-50/50 border-gray-100">
                            <Clock size={20} color="#002147" opacity={0.6} />
                            <Text className="text-primary font-black text-xs uppercase mt-3 mb-1">Time</Text>
                            <Text className="text-gray-500 font-bold text-[10px]">
                                {new Date(event.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </PremiumCard>
                        <PremiumCard variant="elevated" className="w-[48%] p-5 bg-gray-50/50 border-gray-100">
                            <MapPin size={20} color="#002147" opacity={0.6} />
                            <Text className="text-primary font-black text-xs uppercase mt-3 mb-1">Location</Text>
                            <Text className="text-gray-500 font-bold text-[10px]" numberOfLines={1}>{event.location}</Text>
                        </PremiumCard>
                    </View>

                    <View className="mb-10">
                        <Text className="text-primary font-black text-2xl mb-4">Event Insight</Text>
                        <Text className="text-gray-500 leading-7 text-base">{event.content}</Text>
                    </View>

                    {/* Speakers section */}
                    {event.speakers && (
                        <View className="mb-10">
                            <Text className="text-primary font-black text-xl mb-4">Elite Speakers</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                                {event.speakers.map((speaker, idx) => (
                                    <View key={idx} className="mr-4 w-[250px]">
                                        <PremiumCard variant="solid" className="flex-row items-center bg-gray-50 border-gray-100 p-4">
                                            <Image source={{ uri: speaker.image }} className="w-12 h-12 rounded-2xl bg-gray-200" />
                                            <View className="ml-4 flex-1">
                                                <Text className="text-primary font-black text-sm" numberOfLines={1}>{speaker.name}</Text>
                                                <Text className="text-gray-400 text-[10px] font-bold uppercase">{speaker.role}</Text>
                                            </View>
                                        </PremiumCard>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    <View className="h-32" />
                </View>
            </ScrollView>

            {/* Sticky Action Footer */}
            <View className="absolute bottom-0 w-full bg-white/95 border-t border-gray-100 px-6 py-8 backdrop-blur-md">
                <TouchableOpacity
                    onPress={handleRegister}
                    disabled={registering}
                    className={`h-16 rounded-[24px] items-center justify-center flex-row shadow-xl ${event.is_registered ? 'bg-emerald-500' : 'bg-primary'
                        }`}
                >
                    {registering ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <ShieldCheck size={20} color="white" />
                            <Text className="text-white font-black text-lg ml-3 tracking-widest">
                                {event.is_registered ? 'RESERVATION SECURED' : 'SECURE MY SEAT'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}
