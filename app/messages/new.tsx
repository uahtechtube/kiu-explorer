import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Search, ChevronLeft, User, Users, Check, UserPlus, MessageSquare, AlertTriangle, Briefcase, GraduationCap } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface SearchedUser {
    id: number;
    user_id: string;
    matric_number: string | null;
    name: string;
    surname: string;
    first_name: string;
    role: string;
    passport_photograph: string | null;
    department: string;
}

interface Friend {
    id: number;
    surname: string;
    first_name: string;
    passport_photograph: string | null;
}

export default function NewChatPage() {
    const router = useRouter();
    const [searchId, setSearchId] = useState('');
    const [searching, setSearching] = useState(false);
    const [searchedUser, setSearchedUser] = useState<SearchedUser | null>(null);
    const [areFriends, setAreFriends] = useState(false);
    const [isStaff, setIsStaff] = useState(false);
    const [canChat, setCanChat] = useState(false);
    const [requestSent, setRequestSent] = useState(false);
    const [sendingRequest, setSendingRequest] = useState(false);
    
    // Shortcuts / Quick Friends List
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loadingFriends, setLoadingFriends] = useState(true);

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            setLoadingFriends(true);
            const response = await api.get('/friends');
            setFriends(response.data || []);
        } catch (error) {
            console.error('Error fetching friends:', error);
        } finally {
            setLoadingFriends(false);
        }
    };

    const handleSearch = async () => {
        if (!searchId.trim()) return;
        Keyboard.dismiss();
        
        try {
            setSearching(true);
            setSearchedUser(null);
            setRequestSent(false);
            
            const response = await api.get('/chats/lookup-user', {
                params: { id_no: searchId.trim() }
            });
            
            const { user, are_friends, is_staff, can_chat } = response.data;
            setSearchedUser(user);
            setAreFriends(are_friends);
            setIsStaff(is_staff);
            setCanChat(can_chat);
        } catch (error: any) {
            if (error.response?.status === 404) {
                console.log('ℹ️ User search lookup: ID not found');
            } else {
                console.error('Search error:', error);
            }
            const errMsg = error.response?.data?.message || 'User with this ID number was not found.';
            Alert.alert('Not Found', errMsg);
        } finally {
            setSearching(false);
        }
    };

    const handleStartChat = async (userId: number) => {
        try {
            setSearching(true);
            // Initiate conversation
            const response = await api.post('/chats', { recipient_id: userId });
            const conversation = response.data;
            
            // Navigate to the chat page
            router.push(`/messages/${userId}`);
        } catch (error: any) {
            console.warn('Error starting chat:', error.message || error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to start conversation.');
        } finally {
            setSearching(false);
        }
    };

    const handleSendFriendRequest = async (userId: number) => {
        try {
            setSendingRequest(true);
            await api.post('/friends/request', { receiver_id: userId });
            setRequestSent(true);
            Alert.alert('Success', 'Friend request sent successfully! You can message them once they accept.');
        } catch (error: any) {
            console.warn('Friend request error:', error.message || error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to send friend request.');
        } finally {
            setSendingRequest(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Start Chat</Text>
                        <Text className="text-white text-xl font-bold">New Message</Text>
                    </View>
                    <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <User size={22} color="white" />
                    </View>
                </View>

                {/* ID Lookup Search Bar */}
                <View className="bg-white flex-row items-center px-5 h-14 rounded-2xl shadow-xl shadow-primary/20">
                    <Search size={20} color="#94A3B8" />
                    <TextInput
                        value={searchId}
                        onChangeText={setSearchId}
                        placeholder="Search ID (e.g. STU-001, LEC-001...)"
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-3 text-primary font-medium"
                        autoCapitalize="characters"
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity 
                        onPress={handleSearch}
                        className="bg-secondary px-4 py-2 rounded-xl"
                    >
                        <Text className="text-primary font-black text-xs uppercase">Find</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 mt-6" contentContainerStyle={{ paddingBottom: 40 }}>
                {searching ? (
                    <View className="items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#002147" />
                        <Text className="text-gray-400 text-xs font-bold uppercase mt-4">Searching Database...</Text>
                    </View>
                ) : searchedUser ? (
                    <View className="mb-8">
                        <Text className="text-primary font-black text-xs uppercase tracking-wider mb-3">Search Result</Text>
                        
                        <PremiumCard variant="solid" className="bg-white p-5 border-gray-100 items-center">
                            {/* Profile Photo */}
                            <View className="w-24 h-24 rounded-[30px] bg-gray-50 border border-gray-200 items-center justify-center overflow-hidden mb-4 shadow-sm">
                                <Image
                                    source={{ 
                                        uri: searchedUser.passport_photograph || 
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(searchedUser.first_name + '+' + searchedUser.surname)}&background=002147&color=fff&size=128` 
                                    }}
                                    className="w-full h-full"
                                />
                            </View>

                            {/* User details */}
                            <Text className="text-primary font-black text-xl text-center">
                                {searchedUser.first_name} {searchedUser.surname}
                            </Text>
                            
                            <View className="flex-row items-center bg-gray-50 px-3 py-1 rounded-full border border-gray-100 mt-2 mb-4">
                                {searchedUser.role === 'student' ? (
                                    <GraduationCap size={12} color="#002147" />
                                ) : (
                                    <Briefcase size={12} color="#002147" />
                                )}
                                <Text className="text-primary text-[10px] font-black uppercase tracking-wider ml-1.5">
                                    {searchedUser.role}
                                </Text>
                            </View>

                            <View className="w-full border-t border-gray-100 pt-4 mb-4">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-gray-400 text-[11px] font-bold uppercase">Department</Text>
                                    <Text className="text-primary text-xs font-bold">{searchedUser.department}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400 text-[11px] font-bold uppercase">ID Number</Text>
                                    <Text className="text-primary text-xs font-black">{searchedUser.matric_number || searchedUser.user_id}</Text>
                                </View>
                            </View>

                            {/* Relationship & Actions */}
                            {canChat ? (
                                <TouchableOpacity
                                    onPress={() => handleStartChat(searchedUser.id)}
                                    className="w-full bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20"
                                >
                                    <MessageSquare size={18} color="white" />
                                    <Text className="text-white font-black text-sm uppercase tracking-wider ml-2">Start Conversation</Text>
                                </TouchableOpacity>
                            ) : (
                                <View className="w-full">
                                    <View className="flex-row bg-amber-50 border border-amber-100 p-3 rounded-xl items-center mb-4">
                                        <AlertTriangle size={16} color="#D97706" />
                                        <Text className="text-amber-700 text-xs font-medium ml-2 flex-1">
                                            You must be friends with this student to start a conversation.
                                        </Text>
                                    </View>
                                    
                                    {requestSent ? (
                                        <View className="w-full bg-emerald-50 border border-emerald-100 py-4 rounded-2xl flex-row items-center justify-center">
                                            <Check size={18} color="#059669" />
                                            <Text className="text-emerald-700 font-black text-sm uppercase tracking-wider ml-2">Friend Request Sent</Text>
                                        </View>
                                    ) : (
                                        <TouchableOpacity
                                            onPress={() => handleSendFriendRequest(searchedUser.id)}
                                            disabled={sendingRequest}
                                            className="w-full bg-secondary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-secondary/20"
                                        >
                                            {sendingRequest ? (
                                                <ActivityIndicator size="small" color="#002147" />
                                            ) : (
                                                <>
                                                    <UserPlus size={18} color="#002147" />
                                                    <Text className="text-primary font-black text-sm uppercase tracking-wider ml-2">Send Friend Request</Text>
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </PremiumCard>
                    </View>
                ) : (
                    <View className="mb-8">
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 text-center">
                            Search for any user by their Unique School ID or Matric Number to start a conversation.
                        </Text>
                    </View>
                )}

                {/* Shortcuts - Friends List */}
                <View className="mt-4">
                    <Text className="text-primary font-black text-xs uppercase tracking-wider mb-3">Quick Message Friends</Text>
                    
                    {loadingFriends ? (
                        <ActivityIndicator size="small" color="#002147" className="my-8" />
                    ) : friends.length > 0 ? (
                        <View className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
                            {friends.map((friend) => (
                                <TouchableOpacity
                                    key={friend.id}
                                    onPress={() => handleStartChat(friend.id)}
                                    className="flex-row items-center py-3 border-b border-gray-50 last:border-b-0"
                                >
                                    <Image
                                        source={{ 
                                            uri: friend.passport_photograph || 
                                            `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.first_name + '+' + friend.surname)}&background=002147&color=fff` 
                                        }}
                                        className="w-10 h-10 rounded-full bg-gray-100"
                                    />
                                    <View className="flex-1 ml-3">
                                        <Text className="text-primary font-bold text-sm">
                                            {friend.first_name} {friend.surname}
                                        </Text>
                                    </View>
                                    <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
                                        <MessageSquare size={14} color="#002147" />
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <View className="items-center justify-center py-8 bg-white border border-dashed border-gray-200 rounded-3xl">
                            <Users size={32} color="#94A3B8" strokeWidth={1.5} />
                            <Text className="text-gray-400 text-xs font-bold uppercase mt-2">No friends found yet</Text>
                            <TouchableOpacity 
                                onPress={() => router.push('/school/staff')}
                                className="mt-3 bg-primary/5 px-4 py-2 rounded-xl border border-primary/10"
                            >
                                <Text className="text-primary font-black text-[10px] uppercase">Browse Staff Directory</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
