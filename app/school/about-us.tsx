import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, User, Mail, Phone, Heart, Github, Linkedin, Twitter, Sparkles } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface DeveloperProfile {
    id: number;
    name: string;
    photo_url?: string;
    position: string;
    donation?: string;
    phone?: string;
    email?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    description?: string;
}

export default function StudentAboutUs() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [devs, setDevs] = useState<DeveloperProfile[]>([]);

    useEffect(() => {
        fetchDevelopers();
    }, []);

    const fetchDevelopers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/about-us');
            setDevs(response.data || []);
        } catch (error) {
            console.error('Error fetching developers:', error);
            // Default Premium Mock Data
            setDevs([
                {
                    id: 1,
                    name: 'Othman Bello',
                    position: 'Lead Mobile Engineer',
                    donation: 'Designed & developed overall UI + Mobile Routing',
                    phone: '+234 803 000 1122',
                    email: 'othman.bello@kiu-explorer.org',
                    github: 'https://github.com',
                    linkedin: 'https://linkedin.com',
                    twitter: 'https://twitter.com',
                    description: 'Dedicated systems builder focusing on clean, secure architectures and beautiful React Native environments.'
                },
                {
                    id: 2,
                    name: 'Zahra Kabir',
                    position: 'Backend Solutions Architect',
                    donation: 'Implemented E-Exams, Live Classes, & Sanctum API',
                    phone: '+234 812 345 6789',
                    email: 'zahra.k@kiu-explorer.org',
                    github: 'https://github.com',
                    linkedin: 'https://linkedin.com',
                    description: 'Full stack developer specializing in Laravel, micro-services integrations, and database tuning.'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDevelopers();
        setRefreshing(false);
    };

    const handleSocialLink = (url?: string) => {
        if (!url) return;
        Linking.openURL(url).catch(() => {
            alert('Could not open external link');
        });
    };

    const handleEmail = (email?: string) => {
        if (!email) return;
        Linking.openURL(`mailto:${email}`).catch(() => {
            alert('Mail client not configured');
        });
    };

    const handleCall = (phone?: string) => {
        if (!phone) return;
        Linking.openURL(`tel:${phone}`).catch(() => {
            alert('Phone call option not supported');
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Glassmorphic Header */}
            <View className="bg-primary px-6 pt-6 pb-24 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Meet The Creators</Text>
                        <Text className="text-white text-xl font-bold">App Developers</Text>
                    </View>
                    <View className="w-12 h-12 bg-transparent" />
                </View>

                {/* Subtitle */}
                <View className="flex-row items-center justify-center mt-2 px-6">
                    <Sparkles size={16} color="#FFD700" />
                    <Text className="text-white/70 text-xs font-bold text-center ml-2 leading-relaxed">
                        These are the innovative minds who designed and engineered the KIU Explorer App.
                    </Text>
                </View>
            </View>

            {/* Main Cards list */}
            <ScrollView
                className="flex-1 -mt-12 px-6"
                contentContainerStyle={{ paddingBottom: 60 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
                showsVerticalScrollIndicator={false}
            >
                {loading && !devs.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : devs.length === 0 ? (
                    <View className="items-center justify-center py-24 opacity-25">
                        <User size={64} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4 uppercase">No developer profiles registered</Text>
                    </View>
                ) : (
                    devs.map(dev => (
                        <PremiumCard
                            key={dev.id}
                            variant="elevated"
                            className="bg-white mb-6 p-6 border-l-4 border-l-[#F97316] border-gray-100 shadow-xl"
                        >
                            {/* Header Section: Name, Photo, Position */}
                            <View className="flex-row items-center mb-5">
                                <View className="w-16 h-16 bg-primary/5 rounded-[22px] items-center justify-center border border-primary/10 mr-4 overflow-hidden shadow-sm">
                                    {dev.photo_url ? (
                                        <Image source={{ uri: dev.photo_url }} className="w-full h-full" resizeMode="cover" />
                                    ) : (
                                        <User size={28} color="#002147" />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-primary text-lg font-black">{dev.name}</Text>
                                    <Text className="text-[#F97316] font-bold text-xs mt-0.5">{dev.position}</Text>
                                </View>
                            </View>

                            {/* Bio Description */}
                            {dev.description && (
                                <Text className="text-gray-600 text-sm leading-relaxed mb-5 font-medium italic">
                                    "{dev.description}"
                                </Text>
                            )}

                            {/* Donation/Contribution Badge */}
                            {dev.donation && (
                                <View className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 flex-row items-start mb-5">
                                    <Heart size={16} color="#F97316" className="mt-0.5" />
                                    <View className="ml-3 flex-1">
                                        <Text className="text-gray-400 text-[9px] font-black uppercase tracking-wider">Donation & Contribution</Text>
                                        <Text className="text-primary text-xs font-bold mt-0.5 leading-relaxed">{dev.donation}</Text>
                                    </View>
                                </View>
                            )}

                            {/* Contact Action Buttons */}
                            <View className="flex-row justify-between mb-4">
                                {dev.email ? (
                                    <TouchableOpacity
                                        onPress={() => handleEmail(dev.email)}
                                        className="flex-1 bg-gray-50 border border-gray-100 p-3 rounded-2xl flex-row items-center justify-center mr-2 shadow-sm"
                                    >
                                        <Mail size={14} color="#64748B" />
                                        <Text className="text-gray-700 text-xs font-bold ml-2">Email</Text>
                                    </TouchableOpacity>
                                ) : null}

                                {dev.phone ? (
                                    <TouchableOpacity
                                        onPress={() => handleCall(dev.phone)}
                                        className="flex-1 bg-gray-50 border border-gray-100 p-3 rounded-2xl flex-row items-center justify-center ml-2 shadow-sm"
                                    >
                                        <Phone size={14} color="#64748B" />
                                        <Text className="text-gray-700 text-xs font-bold ml-2">Call</Text>
                                    </TouchableOpacity>
                                ) : null}
                            </View>

                            {/* Social Media Link Grid */}
                            <View className="flex-row items-center justify-center space-x-6 pt-3 mt-1 border-t border-gray-100">
                                {dev.github ? (
                                    <TouchableOpacity
                                        onPress={() => handleSocialLink(dev.github)}
                                        className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full items-center justify-center"
                                    >
                                        <Github size={18} color="#002147" />
                                    </TouchableOpacity>
                                ) : null}

                                {dev.linkedin ? (
                                    <TouchableOpacity
                                        onPress={() => handleSocialLink(dev.linkedin)}
                                        className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full items-center justify-center"
                                    >
                                        <Linkedin size={18} color="#3B82F6" />
                                    </TouchableOpacity>
                                ) : null}

                                {dev.twitter ? (
                                    <TouchableOpacity
                                        onPress={() => handleSocialLink(dev.twitter)}
                                        className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-full items-center justify-center"
                                    >
                                        <Twitter size={18} color="#1DA1F2" />
                                    </TouchableOpacity>
                                ) : null}
                            </View>
                        </PremiumCard>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
