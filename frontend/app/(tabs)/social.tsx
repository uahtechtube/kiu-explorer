import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, Heart, MessageCircle, Share2, MoreHorizontal, Plus } from 'lucide-react-native';
import api from '../../lib/api';

interface Post {
    id: number;
    content: string;
    user: {
        id: number;
        surname: string;
        first_name: string;
    };
    association?: {
        id: number;
        name: string;
    };
    likes_count: number;
    comments_count: number;
    created_at: string;
    type: 'social' | 'news';
}

export default function SocialHubScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            setPosts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]); // Show empty state instead of mock data
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchPosts();
        setRefreshing(false);
    }, []);

    const handleLike = async (id: number) => {
        try {
            await api.post(`/student/posts/${id}/like`);
            fetchPosts(); // Refresh stats
        } catch (error) {
            console.error('Like failed:', error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100">
                <Text className="text-2xl font-bold text-primary italic tracking-tight">KIU Lounge</Text>
                <TouchableOpacity
                    onPress={() => router.push('/events/create')}
                    className="bg-primary w-10 h-10 rounded-full items-center justify-center shadow-lg shadow-primary/20"
                >
                    <Plus size={20} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 bg-gray-50"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {/* Stories/Associations Circle */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-6 px-6 bg-white border-b border-gray-100">
                    <View className="items-center mr-6">
                        <TouchableOpacity className="w-16 h-16 rounded-full border-2 border-dashed border-primary/30 items-center justify-center bg-gray-50">
                            <Camera size={24} color="#002147" />
                        </TouchableOpacity>
                        <Text className="text-[10px] mt-2 text-primary font-black uppercase tracking-widest">Story</Text>
                    </View>

                    {[1, 2, 3, 4].map((_, i) => (
                        <View key={i} className="items-center mr-6">
                            <View className="w-16 h-16 rounded-full border-2 border-secondary p-1 bg-white">
                                <View className="bg-primary/5 flex-1 rounded-full items-center justify-center overflow-hidden">
                                    <Text className="text-primary font-black text-[10px]">KIU</Text>
                                </View>
                            </View>
                            <Text className="text-[10px] mt-2 text-gray-500 font-bold uppercase tracking-widest">Official</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Feed */}
                <View className="px-4 mt-6 pb-20">
                    {loading && !posts.length ? (
                        <ActivityIndicator color="#002147" className="mt-10" />
                    ) : (
                        posts.map((post) => (
                            <View key={post.id} className="bg-white rounded-[32px] mb-6 shadow-sm border border-gray-100 overflow-hidden">
                                {/* Post Header */}
                                <View className="flex-row items-center justify-between p-5">
                                    <View className="flex-row items-center">
                                        <View className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center mr-4 border border-primary/10">
                                            <Text className="font-black text-primary text-sm">{post.user.surname.charAt(0)}{post.user.first_name.charAt(0)}</Text>
                                        </View>
                                        <View>
                                            <Text className="font-black text-primary text-sm">{post.user.surname} {post.user.first_name}</Text>
                                            <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-0.5">
                                                {new Date(post.created_at).toLocaleDateString()} • {post.type === 'news' ? 'University News' : 'Campus Moment'}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity className="w-8 h-8 items-center justify-center"><MoreHorizontal size={18} color="#94A3B8" /></TouchableOpacity>
                                </View>

                                {/* Post Content */}
                                <View className="px-6 pb-2">
                                    <Text className="text-gray-600 text-[14px] leading-6 font-medium">
                                        {post.content}
                                    </Text>
                                </View>

                                {/* Media Placeholder (If post has no image) */}
                                <View className="h-2 bg-gray-50/50 mt-4 mx-6 rounded-full" />

                                {/* Actions */}
                                <View className="flex-row items-center justify-between px-6 py-5 mt-2 border-t border-gray-50/80">
                                    <View className="flex-row items-center">
                                        <TouchableOpacity
                                            onPress={() => handleLike(post.id)}
                                            className="flex-row items-center mr-6 bg-red-50 px-3 py-2 rounded-xl"
                                        >
                                            <Heart size={18} color="#EF4444" fill="#EF4444" opacity={0.2} />
                                            <Text className="ml-2 text-red-600 font-black text-xs">{post.likes_count}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="flex-row items-center bg-blue-50 px-3 py-2 rounded-xl">
                                            <MessageCircle size={18} color="#3B82F6" />
                                            <Text className="ml-2 text-blue-600 font-black text-xs">{post.comments_count}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center border border-gray-100">
                                        <Share2 size={18} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
