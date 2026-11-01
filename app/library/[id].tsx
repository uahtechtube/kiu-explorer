import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, Download, Eye, Clock, Bookmark, Share2, FileText, User, Globe, Info, ThumbsUp } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

const { width } = Dimensions.get('window');

interface ResourceDetail {
    id: number;
    title: string;
    author: string;
    description: string;
    category: string;
    file_type: string;
    file_size: number;
    downloads: number;
    cover_image?: string;
    is_public: boolean;
    created_at: string;
}

export default function ResourceDetailPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [resource, setResource] = useState<ResourceDetail | null>(null);

    useEffect(() => {
        fetchResource();
    }, [id]);

    const fetchResource = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/library/${id}`);
            setResource(response.data);
        } catch (error) {
            console.error('Error fetching resource details:', error);
            setResource(null);
            Alert.alert('Error', 'Failed to load resource details.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            Alert.alert(
                'Download Resource',
                `Download "${resource?.title}"?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Download',
                        onPress: async () => {
                            try {
                                // Get token from SecureStore
                                const SecureStore = await import('expo-secure-store');
                                const token = await SecureStore.getItemAsync('token'); // Fixed key

                                if (!token) {
                                    Alert.alert('Error', 'Please log in to download resources.');
                                    return;
                                }

                                const downloadUrl = `${api.defaults.baseURL}/library/${id}/download`;

                                // Open download in browser with authentication
                                await Linking.openURL(`${downloadUrl}?token=${token}`);

                                Alert.alert('Success', 'Download started!');
                            } catch (error) {
                                console.error('Download error:', error);
                                Alert.alert('Error', 'Failed to download resource.');
                            }
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleReadNow = async () => {
        try {
            const SecureStore = await import('expo-secure-store');
            const token = await SecureStore.getItemAsync('token');

            if (!token) {
                Alert.alert('Error', 'Please log in to view resources.');
                return;
            }

            const viewUrl = `${api.defaults.baseURL}/library/${id}/download?token=${token}`;
            await Linking.openURL(viewUrl);
        } catch (error) {
            console.error('View error:', error);
            Alert.alert('Error', 'Failed to open resource.');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        const sizes = ['B', 'KB', 'MB', 'GB'];
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {loading && !resource ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#002147" />
                </View>
            ) : resource && (
                <>
                    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                        {/* Immersive Cover Header */}
                        <View className="h-[450px] relative">
                            <Image
                                source={{ uri: resource.cover_image }}
                                className="w-full h-full"
                                resizeMode="cover"
                            />
                            <View className="absolute inset-0 bg-black/40" />

                            <SafeAreaView className="absolute top-0 w-full px-6 pt-6">
                                <View className="flex-row justify-between items-center">
                                    <TouchableOpacity
                                        onPress={() => router.back()}
                                        className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/20"
                                    >
                                        <ChevronLeft size={24} color="white" />
                                    </TouchableOpacity>
                                    <View className="flex-row">
                                        <TouchableOpacity className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/20 mr-2">
                                            <Bookmark size={20} color="white" />
                                        </TouchableOpacity>
                                        <TouchableOpacity className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl items-center justify-center border border-white/20">
                                            <Share2 size={20} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </SafeAreaView>

                            <View className="absolute bottom-10 left-6 right-6">
                                <View className="bg-secondary self-start px-3 py-1 rounded-lg mb-4">
                                    <Text className="text-primary font-black text-[10px] uppercase tracking-widest">{resource.category}</Text>
                                </View>
                                <Text className="text-white text-3xl font-black mb-2">{resource.title}</Text>
                                <Text className="text-white/80 font-bold text-lg">{resource.author}</Text>
                            </View>
                        </View>

                        {/* Content Body */}
                        <View className="px-6 py-8">
                            {/* Metadata Stats */}
                            <View className="flex-row justify-between mb-10">
                                {[
                                    { label: 'Downloads', value: resource.downloads, icon: Download },
                                    { label: 'Format', value: resource.file_type, icon: FileText },
                                    { label: 'Size', value: formatSize(resource.file_size), icon: Info },
                                ].map((stat, idx) => (
                                    <View key={idx} className="items-center">
                                        <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mb-2">
                                            <stat.icon size={20} color="#002147" />
                                        </View>
                                        <Text className="text-primary font-black text-[10px] uppercase">{stat.value}</Text>
                                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-tighter">{stat.label}</Text>
                                    </View>
                                ))}
                            </View>

                            {/* Description */}
                            <Text className="text-primary font-black text-xl mb-4">Academic Summary</Text>
                            <Text className="text-gray-500 text-base leading-7 mb-8">
                                {resource.description}
                            </Text>

                            {/* Additional Metadata Card */}
                            <PremiumCard variant="solid" className="p-6 bg-gray-50 border-gray-100 mb-10">
                                <View className="flex-row items-center mb-4">
                                    <Globe size={18} color="#002147" />
                                    <Text className="text-primary font-black text-sm ml-3 uppercase">Resource Verification</Text>
                                </View>
                                <View className="flex-row justify-between items-center bg-white p-4 rounded-xl mb-3">
                                    <Text className="text-gray-400 text-xs font-bold uppercase">Public Access</Text>
                                    <Text className="text-emerald-500 font-black text-xs uppercase">Verified</Text>
                                </View>
                                <View className="flex-row justify-between items-center bg-white p-4 rounded-xl">
                                    <Text className="text-gray-400 text-xs font-bold uppercase">Last Updated</Text>
                                    <Text className="text-primary font-black text-xs uppercase">{resource.created_at}</Text>
                                </View>
                            </PremiumCard>

                            <View className="h-32" />
                        </View>
                    </ScrollView>

                    {/* Floating Action Bar */}
                    <View className="absolute bottom-0 w-full bg-white/95 px-6 pt-6 pb-10 border-t border-gray-100 backdrop-blur-md">
                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={handleReadNow}
                                className="flex-1 h-16 bg-primary rounded-[24px] flex-row items-center justify-center shadow-xl shadow-primary/20"
                            >
                                <Eye size={20} color="white" />
                                <Text className="text-white font-black text-lg ml-3 tracking-widest uppercase">Read Now</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleDownload}
                                className="w-16 h-16 bg-secondary rounded-[24px] items-center justify-center ml-4 shadow-xl shadow-secondary/20"
                            >
                                <Download size={24} color="#002147" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            )}
        </View>
    );
}
