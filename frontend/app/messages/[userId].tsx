import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
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

export default function ChatPage() {
    const router = useRouter();
    const { userId } = useLocalSearchParams();
    const scrollViewRef = useRef<ScrollView>(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState<Message[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [inputText, setInputText] = useState('');

    useEffect(() => {
        fetchChatData();
    }, [userId]);

    const fetchChatData = async () => {
        try {
            setLoading(true);
            // In a real app, these would be API calls
            // const userResponse = await api.get(`/users/${userId}`);
            // const messagesResponse = await api.get(`/messages/${userId}`);

            // Mock data
            setUser({
                id: Number(userId),
                name: 'Dr. John Doe',
                avatar_url: 'https://ui-avatars.com/api/?name=John+Doe&background=0D8ABC&color=fff',
                status: 'Online',
            });

            setMessages([
                {
                    id: 1,
                    text: 'Hello! How are you finding the course so far?',
                    sender_id: Number(userId),
                    timestamp: '2026-01-13T09:00:00',
                    is_me: false,
                },
                {
                    id: 2,
                    text: 'Hi Dr. Doe! I am really enjoying it. The last lecture was very insightful.',
                    sender_id: 1, // Current user
                    timestamp: '2026-01-13T09:05:00',
                    is_me: true,
                },
                {
                    id: 3,
                    text: 'Glad to hear that. Make sure to check the assignment guidelines I posted.',
                    sender_id: Number(userId),
                    timestamp: '2026-01-13T10:30:00',
                    is_me: false,
                },
            ]);
        } catch (error) {
            console.error('Error fetching chat:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = () => {
        if (!inputText.trim()) return;

        const newMessage: Message = {
            id: Date.now(),
            text: inputText,
            sender_id: 1, // Current user
            timestamp: new Date().toISOString(),
            is_me: true,
        };

        setMessages([...messages, newMessage]);
        setInputText('');

        // Simulate API call
        // await api.post('/messages', { recipient_id: userId, text: inputText });
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
                    <TouchableOpacity>
                        <Phone size={22} color="#002147" />
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Video size={22} color="#002147" />
                    </TouchableOpacity>
                    <TouchableOpacity>
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
                    <TouchableOpacity className="mr-3">
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
