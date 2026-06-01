import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl, TextInput, ActivityIndicator, Alert } from 'react-native';
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
    const [friendRequests, setFriendRequests] = useState<any[]>([]);

    const fetchChats = async () => {
        try {
            setLoading(true);
            const response = await api.get('/chats');
            const rawChats = Array.isArray(response.data) ? response.data : (response.data.data || []);
            
            const mappedChats: Chat[] = rawChats.map((c: any) => {
                const otherUser = c.users && c.users[0] ? c.users[0] : null;
                const lastMsgObj = c.messages && c.messages[0] ? c.messages[0] : null;
                
                return {
                    id: String(c.id),
                    user_id: otherUser ? otherUser.id : 0,
                    name: otherUser ? `${otherUser.first_name} ${otherUser.surname}` : (c.group ? c.group.name : 'Group Chat'),
                    avatar_url: otherUser?.passport_photograph || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser ? `${otherUser.first_name}+${otherUser.surname}` : c.group?.name || 'Group')}&background=002147&color=fff`,
                    last_message: lastMsgObj ? lastMsgObj.content : 'No messages yet',
                    timestamp: lastMsgObj ? lastMsgObj.created_at : c.updated_at || c.created_at,
                    unread_count: 0,
                    online: false,
                    is_group: c.type === 'group',
                };
            });
            
            setChats(mappedChats);
        } catch (error) {
            console.error('Error:', error);
            setChats([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        try {
            const response = await api.get('/friends/requests/pending');
            setFriendRequests(response.data || []);
        } catch (error) {
            console.error('Error fetching friend requests:', error);
        }
    };

    const handleAcceptFriendRequest = async (requestId: number, senderId: number) => {
        try {
            await api.post(`/friends/request/${requestId}/accept`);
            setFriendRequests(prev => prev.filter(r => r.id !== requestId));
            
            // Auto start/get conversation to ensure they can chat immediately
            await api.post('/chats', { recipient_id: senderId });
            
            // Refresh chats list so the new chat shows up immediately
            await fetchChats();
            
            Alert.alert(
                'Request Accepted',
                'You are now friends! You can start chatting.',
                [{ text: 'Start Chatting', onPress: () => router.push(`/messages/${senderId}`) }]
            );
        } catch (error) {
            console.error('Error accepting request:', error);
            Alert.alert('Error', 'Failed to accept friend request.');
        }
    };

    const handleRejectFriendRequest = async (requestId: number) => {
        try {
            await api.post(`/friends/request/${requestId}/reject`);
            setFriendRequests(prev => prev.filter(r => r.id !== requestId));
            Alert.alert('Ignored', 'Friend request ignored.');
        } catch (error) {
            console.error('Error rejecting request:', error);
            Alert.alert('Error', 'Failed to ignore friend request.');
        }
    };

    useEffect(() => {
        Promise.all([fetchChats(), fetchPendingRequests()]);
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchChats(), fetchPendingRequests()]);
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
                    <TouchableOpacity 
                        onPress={() => router.push('/messages/new')}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-xl shadow-secondary/20"
                    >
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
                {loading && !chats.length && !friendRequests.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : (
                    <View className="mt-4">
                        {/* Pending Friend Requests Panel */}
                        {friendRequests.length > 0 && (
                            <View className="mb-6">
                                <View className="flex-row items-center justify-between mb-3 px-1">
                                    <Text className="text-primary font-black text-xs uppercase tracking-widest">Friend Requests</Text>
                                    <View className="bg-rose-500 px-2 py-0.5 rounded-full">
                                        <Text className="text-white font-black text-[10px]">{friendRequests.length}</Text>
                                    </View>
                                </View>
                                
                                {friendRequests.map((req) => {
                                    const sender = req.sender || {};
                                    const displayName = `${sender.first_name || ''} ${sender.surname || ''}`.trim() || 'Someone';
                                    const avatar = sender.passport_photograph || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=002147&color=fff`;
                                    
                                    return (
                                        <PremiumCard key={req.id} variant="solid" className="p-4 mb-3 border border-secondary/20 flex-row items-center justify-between bg-white shadow-sm">
                                            <View className="flex-row items-center flex-1 mr-3">
                                                <View className="w-10 h-10 rounded-full border border-gray-100 overflow-hidden bg-gray-50 mr-3">
                                                    <Image source={{ uri: avatar }} className="w-full h-full" />
                                                </View>
                                                <View className="flex-1">
                                                     <Text className="text-primary font-black text-sm" numberOfLines={1}>{displayName}</Text>
                                                     <Text className="text-gray-400 text-[10px] font-bold">wants to chat</Text>
                                                </View>
                                            </View>
                                            
                                            <View className="flex-row space-x-2">
                                                <TouchableOpacity 
                                                    onPress={() => handleRejectFriendRequest(req.id)}
                                                    className="px-3 py-2 bg-gray-100 rounded-xl"
                                                >
                                                    <Text className="text-gray-500 font-black text-[9px] uppercase">Ignore</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    onPress={() => handleAcceptFriendRequest(req.id, sender.id)}
                                                    className="px-4 py-2 bg-secondary rounded-xl"
                                                >
                                                    <Text className="text-primary font-black text-[9px] uppercase">Accept</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </PremiumCard>
                                    );
                                })}
                            </View>
                        )}

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
