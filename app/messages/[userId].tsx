import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Send, Phone, Video, MoreVertical, Paperclip } from 'lucide-react-native';
import api from '../../lib/api';

interface Message {
    id: number;
    text: string;
    sender_id: number;
    timestamp: string;
    is_me: boolean;
}

interface User {
    id: number;
    name: string;
    avatar_url: string;
    status: string;
}

import { useAuth } from '../../context/AuthContext';

export default function ChatPage() {
    const router = useRouter();
    const { userId } = useLocalSearchParams();
    const { user: currentUser } = useAuth();
    const scrollViewRef = useRef<ScrollView>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [inputText, setInputText] = useState('');
    const [conversationId, setConversationId] = useState<number | null>(null);

    useEffect(() => {
        establishConversation();
    }, [userId]);

    const establishConversation = async () => {
        try {
            setLoading(true);
            
            // Get or create conversation with the recipient
            const convResponse = await api.post('/chats', { recipient_id: Number(userId) });
            const conversation = convResponse.data;
            setConversationId(conversation.id);

            // Find other participant for header
            const otherUser = (conversation.users || []).find((u: any) => u.id !== currentUser?.id);
            if (otherUser) {
                setUser({
                    id: otherUser.id,
                    name: `${otherUser.first_name} ${otherUser.surname}`,
                    avatar_url: otherUser.passport_photograph || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.first_name + '+' + otherUser.surname)}&background=002147&color=fff`,
                    status: 'Online',
                });
            } else {
                setUser({
                    id: Number(userId),
                    name: 'Academic Staff',
                    avatar_url: `https://ui-avatars.com/api/?name=Staff&background=002147&color=fff`,
                    status: 'Active',
                });
            }

            // Fetch message history for this conversation
            const msgResponse = await api.get(`/chats/${conversation.id}/messages`);
            // Laravel paginator message list is in response.data.data
            const rawMessages = msgResponse.data.data || [];
            
            const mappedMessages: Message[] = rawMessages.map((m: any) => ({
                id: m.id,
                text: m.content,
                sender_id: m.user_id,
                timestamp: m.created_at,
                is_me: m.user_id === currentUser?.id,
            })).reverse(); // ScrollView wants old messages at the top, newer at the bottom

            setMessages(mappedMessages);
        } catch (error: any) {
            console.error('Error establishing conversation:', error);
            const msg = error.response?.data?.message || 'Failed to start conversation. Ensure you are connected.';
            Alert.alert(
                'Conversation Error',
                msg,
                [{ text: 'Go Back', onPress: () => router.back() }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || !conversationId) return;

        const originalText = inputText;
        setInputText('');

        try {
            const response = await api.post(`/chats/${conversationId}/messages`, {
                content: originalText,
            });
            
            const sentMsg = response.data;
            const newMessage: Message = {
                id: sentMsg.id,
                text: sentMsg.content,
                sender_id: sentMsg.user_id,
                timestamp: sentMsg.created_at,
                is_me: true,
            };

            setMessages(prev => [...prev, newMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            Alert.alert('Send Error', 'Failed to deliver message.');
            setInputText(originalText); // Restore input text on error
        }
    };

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages, loading]);

    if (loading || !user) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between bg-white z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#002147" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: user.avatar_url }}
                        className="w-10 h-10 rounded-full bg-gray-200"
                    />
                    <View className="ml-3">
                        <Text className="text-primary font-bold text-base">{user.name}</Text>
                        <Text className="text-green-600 text-xs font-semibold">{user.status}</Text>
                    </View>
                </View>

                <View className="flex-row items-center space-x-4">
                    <TouchableOpacity onPress={() => Alert.alert('Voice Call', 'Initiating voice call protocol... (Feature coming soon)')}>
                        <Phone size={22} color="#002147" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert('Video Call', 'Initiating video call protocol... (Feature coming soon)')}>
                        <Video size={22} color="#002147" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => Alert.alert('More Options', 'Options menu is not configured.')}>
                        <MoreVertical size={22} color="#002147" />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-4 py-4 bg-gray-50"
                    contentContainerStyle={{ paddingBottom: 20 }}
                >
                    {messages.map((message) => (
                        <View
                            key={message.id}
                            className={`mb-3 flex-row ${message.is_me ? 'justify-end' : 'justify-start'}`}
                        >
                            <View
                                className={`max-w-[75%] px-4 py-3 rounded-2xl ${message.is_me
                                        ? 'bg-primary rounded-br-none'
                                        : 'bg-white border border-gray-200 rounded-bl-none'
                                    }`}
                            >
                                <Text
                                    className={`text-base ${message.is_me ? 'text-white' : 'text-gray-800'
                                        }`}
                                >
                                    {message.text}
                                </Text>
                                <Text
                                    className={`text-[10px] mt-1 text-right ${message.is_me ? 'text-blue-200' : 'text-gray-400'
                                        }`}
                                >
                                    {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Input Area */}
                <View className="px-4 py-3 bg-white border-t border-gray-100 flex-row items-center">
                     <TouchableOpacity 
                        onPress={() => Alert.alert('Attachment', 'Attach image, voice, or document to this message thread. (Feature coming soon)')}
                        className="mr-3"
                     >
                         <Paperclip size={24} color="#6B7280" />
                     </TouchableOpacity>

                    <TextInput
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Type a message..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        className="flex-1 bg-gray-100 rounded-2xl px-4 py-2 text-base text-gray-800 max-h-24 mr-3"
                        textAlignVertical="center"
                    />

                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={!inputText.trim()}
                        className={`w-10 h-10 rounded-full items-center justify-center ${inputText.trim() ? 'bg-primary' : 'bg-gray-300'
                            }`}
                    >
                        <Send size={18} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
