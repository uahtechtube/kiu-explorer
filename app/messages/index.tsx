import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Search, Edit, Circle, ChevronLeft, Bell, Users, MessageSquare, MoreVertical, Plus } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface Chat {
    id: string;
    user_id: number;
    name: string;
    avatar_url: string;
    last_message: string;
    timestamp: string;
    unread_count: number;
    online: boolean;
    is_group: boolean;
}

export default function ChatListPage() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'All' | 'Direct' | 'Groups'>('All');
    const [chats, setChats] = useState<Chat[]>([]);

    const fetchChats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/messages');
            setChats(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
            setChats([]); // Show empty state instead of mock data
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchChats();
        setRefreshing(false);
    }, []);

    const filteredChats = chats.filter(chat => {
        const matchesSearch = chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.last_message.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All' ||
            (activeTab === 'Direct' && !chat.is_group) ||
            (activeTab === 'Groups' && chat.is_group);
        return matchesSearch && matchesTab;
    });

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = diff / (1000 * 60 * 60);
        if (hours < 24) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (hours < 48) return 'Yesterday';
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* High-End Header */}
            <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg">
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Communication Hub</Text>
                        <Text className="text-white text-3xl font-black">Messages</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-xl shadow-secondary/20">
                        <Plus size={22} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* Performance Search Hub */}
                <View className="bg-white/10 flex-row items-center px-5 h-14 rounded-2xl border border-white/10 mb-6">
                    <Search size={20} color="#94A3B8" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search conversations..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-3 text-white font-medium"
                    />
                </View>

                {/* Context Tabs */}
                <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/10">
                    {['All', 'Direct', 'Groups'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab as any)}
                            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${activeTab === tab ? 'bg-secondary' : ''
                                }`}
                        >
                            <Text className={`text-[10px] font-black uppercase ${activeTab === tab ? 'text-primary' : 'text-white/60'}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView
                className="flex-1 -mt-10 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !chats.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : (
                    <View className="mt-4">
                        {filteredChats.map((chat) => (
                            <TouchableOpacity
                                key={chat.id}
                                onPress={() => router.push(`/messages/${chat.user_id}`)}
                                className="mb-4"
                            >
                                <PremiumCard variant="solid" className="p-4 bg-white border-gray-100 flex-row items-center">
                                    <View className="relative">
                                        <View className="w-14 h-14 rounded-[20px] bg-gray-50 border border-gray-100 items-center justify-center overflow-hidden">
                                            <Image source={{ uri: chat.avatar_url }} className="w-full h-full" />
                                        </View>
                                        {chat.online && (
                                            <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white" />
                                        )}
                                        {chat.is_group && (
                                            <View className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-lg items-center justify-center border-2 border-white">
                                                <Users size={12} color="white" />
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-1 ml-4 mr-2">
                                        <View className="flex-row justify-between items-center mb-1">
                                            <Text className="text-primary font-black text-base" numberOfLines={1}>{chat.name}</Text>
                                            <Text className="text-gray-400 text-[9px] font-black uppercase tracking-tighter">{formatTime(chat.timestamp)}</Text>
                                        </View>
                                        <Text
                                            className={`text-xs ${chat.unread_count > 0 ? 'text-primary font-bold' : 'text-gray-400'}`}
                                            numberOfLines={1}
                                        >
                                            {chat.last_message}
                                        </Text>
                                    </View>

                                    {chat.unread_count > 0 && (
                                        <View className="bg-secondary px-2 py-1 rounded-lg">
                                            <Text className="text-primary font-black text-[10px]">{chat.unread_count}</Text>
                                        </View>
                                    )}
                                </PremiumCard>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
