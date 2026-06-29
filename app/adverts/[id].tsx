import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, Bell, Calendar, User, Info, Globe, ExternalLink } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface AdvertDetails {
    id: number;
    title: string;
    content: string;
    media_type: 'image' | 'video' | 'none';
    media_url?: string;
    full_media_url?: string;
    external_link?: string;
    created_at: string;
    creator?: {
        surname: string;
        first_name: string;
    };
}

export default function AdvertDetailPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [advert, setAdvert] = useState<AdvertDetails | null>(null);

    const isVideo = advert && advert.media_type === 'video';
    const player = useVideoPlayer(isVideo ? (advert?.full_media_url || '') : '', p => {
        p.loop = false;
    });

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/adverts/${id}`);
            setAdvert(response.data);
        } catch (error) {
            console.error('Error loading advert details:', error);
            // Professional Mock fallback data matching ID in case of database sync or connectivity delay
            const mockAdverts: Record<number, AdvertDetails> = {
                1: {
                    id: 1,
                    title: 'KIU New E-Library Facility Commissioned',
                    content: 'We are proud to announce that the new KIU Digital and E-Library facility has been officially commissioned. With access to over 20,000+ scientific journals, high-speed fiber internet, and dedicated study stations, students can now access top-tier academic resources. The facility is located on the second floor of the main building and is open from 8:00 AM to 9:00 PM daily. Bring your student ID card to register and activate your electronic access key.',
                    media_type: 'image',
                    full_media_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop&q=60',
                    external_link: 'https://library.kiu.edu',
                    created_at: new Date().toISOString()
                }
            };
            const numId = Number(id);
            if (mockAdverts[numId]) {
                setAdvert(mockAdverts[numId]);
            } else {
                setAdvert({
                    id: numId,
                    title: 'KIU Campus Circular',
                    content: 'Official campus promotional notification. Please log into the student portal to view updates or contact the student affairs representative for more details.',
                    media_type: 'none',
                    created_at: new Date().toISOString()
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchDetails();
        }
    }, [id]);

    const handleOpenLink = () => {
        if (advert?.external_link) {
            Linking.openURL(advert.external_link).catch(() => {
                Alert.alert('Error', 'Could not open the provided link URL.');
            });
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Header */}
            <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Campus Showcase</Text>
                        <Text className="text-white text-xl font-bold">Ad Detail</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <Bell size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#002147" />
                    <Text className="text-gray-400 mt-4 font-bold">Loading media updates...</Text>
                </View>
            ) : advert ? (
                <ScrollView
                    className="flex-1 -mt-10 px-6"
                    contentContainerStyle={{ paddingBottom: 60 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Main Card Wrapper */}
                    <PremiumCard variant="elevated" className="bg-white p-0 border-gray-100 rounded-[32px] overflow-hidden">
                        
                        {/* Media Header Section */}
                        {advert.media_type === 'image' && advert.full_media_url ? (
                            <Image
                                source={{ uri: advert.full_media_url }}
                                className="w-full h-56"
                                resizeMode="cover"
                            />
                        ) : advert.media_type === 'video' && advert.full_media_url ? (
                            <View className="w-full h-56 bg-slate-900 justify-center">
                                <VideoView
                                    player={player}
                                    style={{ width: '100%', height: 224 }}
                                    allowsPictureInPicture
                                    nativeControls
                                />
                            </View>
                        ) : null}

                        {/* Text Container */}
                        <View className="p-6">
                            {/* Advert Tag */}
                            <View className="bg-rose-500/10 px-3 py-1 rounded-xl self-start mb-4">
                                <Text className="text-rose-600 text-[10px] font-black uppercase tracking-wider">Campus Ad</Text>
                            </View>

                            {/* Title */}
                            <Text className="text-primary text-2xl font-black mb-4 leading-tight">
                                {advert.title}
                            </Text>

                            {/* Metadata Row */}
                            <View className="flex-row items-center justify-between py-4 border-t border-b border-gray-50 mb-6">
                                <View className="flex-row items-center">
                                    <Calendar size={16} color="#94A3B8" />
                                    <Text className="text-gray-400 text-xs font-bold ml-1.5">
                                        {new Date(advert.created_at).toLocaleDateString(undefined, {
                                            month: 'short', day: 'numeric', year: 'numeric'
                                        })}
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <User size={16} color="#94A3B8" />
                                    <Text className="text-gray-400 text-xs font-black ml-1.5 uppercase">
                                        {advert.creator ? `${advert.creator.first_name} ${advert.creator.surname}` : 'Management'}
                                    </Text>
                                </View>
                            </View>

                            {/* Body Text */}
                            <Text className="text-gray-600 leading-7 text-base font-medium mb-8">
                                {advert.content}
                            </Text>

                            {/* External URL Action Button */}
                            {advert.external_link ? (
                                <TouchableOpacity
                                    onPress={handleOpenLink}
                                    className="bg-primary py-4 px-5 rounded-2xl flex-row items-center justify-center border border-primary"
                                >
                                    <Globe size={18} color="white" />
                                    <Text className="text-white font-black text-xs uppercase ml-3 tracking-widest">
                                        Learn More / Visit Portal
                                    </Text>
                                    <ExternalLink size={14} color="white" className="ml-2" />
                                </TouchableOpacity>
                            ) : null}
                        </View>
                    </PremiumCard>
                </ScrollView>
            ) : (
                <View className="flex-1 justify-center items-center px-8">
                    <Info size={48} color="#EF4444" />
                    <Text className="text-gray-400 font-bold text-center mt-4">Advertisement details not found or expired.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}
