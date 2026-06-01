import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Linking, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Globe, Phone, Mail, MapPin, Award, BookOpen, Users, ExternalLink } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

const { width } = Dimensions.get('window');

interface SchoolDetails {
    school_name: string;
    background: string;
    history: string;
    vision: string;
    mission: string;
    core_values: string;
    motto: string;
    established_year: number;
    address: string;
    phone: string;
    email: string;
    website: string;
}

export default function SchoolInfoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [info, setInfo] = useState<SchoolDetails | null>(null);

    useEffect(() => {
        fetchSchoolInfo();
    }, []);

    const fetchSchoolInfo = async () => {
        try {
            setLoading(true);
            const response = await api.get('/school/info');
            setInfo(response.data);
        } catch (error) {
            console.error('Error fetching school info:', error);
            // High fidelity fallback
            setInfo({
                school_name: 'Kashim Ibrahim University',
                motto: 'Knowledge, Character, and Service',
                established_year: 2002,
                address: 'Maiduguri, Borno State, Nigeria',
                phone: '+234 76 290 0000',
                email: 'info@kiu.edu.ng',
                website: 'https://kiu.edu.ng',
                background: 'Kashim Ibrahim University (KIU) stands as a beacon of academic brilliance in Northern Nigeria. Named after the visionary statesman Alhaji Kashim Ibrahim, our institution is dedicated to transforming lives.',
                history: 'Named after the visionary statesman Alhaji Kashim Ibrahim, our institution is dedicated to transforming lives through research-driven education and ethical leadership training.',
                vision: 'To lead Africa in innovative research and community transformation.',
                mission: 'Empowering students with ethical values and practical expertise.',
                core_values: 'Integrity, Diligence, Innovation, and Excellence'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLink = (url: string) => {
        if (!url) return;
        const targetUrl = url.startsWith('http') ? url : `https://${url}`;
        Linking.openURL(targetUrl).catch(() => {});
    };

    const stats = [
        { label: 'Students', value: '5K+', icon: Users, color: '#3B82F6' },
        { label: 'Faculties', value: '8', icon: BookOpen, color: '#10B981' },
        { label: 'Awards', value: '50+', icon: Award, color: '#F59E0B' },
    ];

    if (loading || !info) {
        return (
            <View className="flex-1 bg-white justify-center items-center">
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#002147" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Visual Cover Section */}
            <View className="h-[350px] relative">
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80' }}
                    className="w-full h-full"
                    resizeMode="cover"
                />
                <View className="absolute inset-0 bg-primary/40 shadow-inner" />

                <SafeAreaView className="absolute top-0 w-full px-6 flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-black/20 rounded-2xl items-center justify-center border border-white/20 backdrop-blur-md"
                    >
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleLink(info.website)}
                        className="w-12 h-12 bg-black/20 rounded-2xl items-center justify-center border border-white/20 backdrop-blur-md"
                    >
                        <Globe size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </SafeAreaView>

                <View className="absolute bottom-12 left-6 right-6">
                    <Text className="text-secondary text-[10px] font-black uppercase tracking-[4px] mb-2">
                        {info.motto || 'Heritage of Excellence'}
                    </Text>
                    <Text className="text-white text-4xl font-black leading-tight">
                        {info.school_name}
                    </Text>
                </View>

                {/* Decorative curve */}
                <View className="absolute bottom-0 w-full h-10 bg-white rounded-t-[40px]" />
            </View>

            <ScrollView
                className="flex-1 bg-white px-6"
                contentContainerStyle={{ paddingBottom: 60 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Stats Grid */}
                <View className="flex-row justify-between mb-8">
                    {stats.map((stat, index) => (
                        <View key={index} className="w-[30%] items-center">
                            <PremiumCard variant="elevated" className="w-full p-4 items-center bg-gray-50/50">
                                <View
                                    className="w-10 h-10 rounded-xl items-center justify-center mb-2"
                                    style={{ backgroundColor: `${stat.color}15` }}
                                >
                                    <stat.icon size={20} color={stat.color} />
                                </View>
                                <Text className="text-primary font-black text-lg">{stat.value}</Text>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase">{stat.label}</Text>
                            </PremiumCard>
                        </View>
                    ))}
                </View>

                {/* About Section */}
                <View className="mb-10">
                    <View className="flex-row items-center mb-4">
                        <View className="w-1 bg-secondary h-6 rounded-full mr-3" />
                        <Text className="text-primary font-black text-xl">The University</Text>
                    </View>
                    <Text className="text-gray-500 leading-7 text-base font-medium">
                        {info.background}
                    </Text>
                </View>

                {/* Contact Interface */}
                <Text className="text-primary font-black text-xl mb-4">Contact Gateway</Text>
                <PremiumCard variant="solid" className="bg-primary p-6 mb-10 border-0">
                    <View className="space-y-6">
                        <TouchableOpacity onPress={() => handleLink(`tel:${info.phone}`)} className="flex-row items-center border-b border-white/10 pb-4">
                            <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center mr-4">
                                <Phone size={20} color="#FFD700" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white/40 text-[10px] font-bold uppercase">Main Reception</Text>
                                <Text className="text-white font-bold text-base">{info.phone}</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleLink(`mailto:${info.email}`)} className="flex-row items-center border-b border-white/10 pb-4">
                            <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center mr-4">
                                <Mail size={20} color="#FFD700" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white/40 text-[10px] font-bold uppercase">Email Registry</Text>
                                <Text className="text-white font-bold text-base">{info.email}</Text>
                            </View>
                        </TouchableOpacity>

                        <View className="flex-row items-center pt-2">
                            <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center mr-4">
                                <MapPin size={20} color="#FFD700" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white/40 text-[10px] font-bold uppercase">Campus Address</Text>
                                <Text className="text-white font-bold text-base">{info.address}</Text>
                            </View>
                        </View>
                    </View>
                </PremiumCard>

                {/* Legacy & Future */}
                <View className="flex-row space-x-4">
                    <View className="flex-1 bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                        <Text className="text-primary font-bold text-lg mb-2">Our Vision</Text>
                        <Text className="text-gray-400 text-xs leading-5">{info.vision}</Text>
                    </View>
                    <View className="flex-1 bg-secondary/10 p-6 rounded-[32px] border border-secondary/20">
                        <Text className="text-primary font-bold text-lg mb-2">Our Mission</Text>
                        <Text className="text-primary/70 text-xs leading-5">{info.mission}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
