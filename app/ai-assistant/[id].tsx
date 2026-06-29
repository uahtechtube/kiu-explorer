import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Send, Sparkles, BookOpen, FileText, Calculator, ChevronLeft, Mic, Paperclip, X, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
// @ts-ignore
import * as FileSystem from 'expo-file-system/legacy';
import api from '../../lib/api';

interface Message {
    id: number;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface FormattedTextProps {
    text: string;
    isUser: boolean;
}

const FormattedText: React.FC<FormattedTextProps> = ({ text, isUser }) => {
    if (isUser) {
        return (
            <Text className="text-white text-base leading-6 font-medium">
                {text}
            </Text>
        );
    }

    const lines = text.split('\n');

    return (
        <View className="flex-col">
            {lines.map((line, lineIdx) => {
                const trimmed = line.trim();
                if (!trimmed) {
                    return <View key={lineIdx} className="h-2" />;
                }

                const isBullet = trimmed.startsWith('•') || trimmed.startsWith('* ') || trimmed.startsWith('- ');
                let bulletText = trimmed;
                if (isBullet) {
                    bulletText = trimmed.replace(/^(•|\*|-)\s*/, '');
                }

                const parseInline = (rawText: string) => {
                    const regex = /(\*\*.*?\*\*|`.*?`)/g;
                    const parts = rawText.split(regex);

                    return parts.map((part, partIdx) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            const boldVal = part.slice(2, -2);
                            return (
                                <Text key={partIdx} className="font-extrabold text-[#002147] text-base">
                                    {boldVal}
                                </Text>
                            );
                        } else if (part.startsWith('`') && part.endsWith('`')) {
                            const codeVal = part.slice(1, -1);
                            return (
                                <Text
                                    key={partIdx}
                                    style={{ fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }}
                                    className="bg-gray-100 text-rose-600 px-1 py-0.5 rounded text-sm font-bold"
                                >
                                    {codeVal}
                                </Text>
                            );
                        }
                        return (
                            <Text key={partIdx} className="text-gray-700 text-base leading-6">
                                {part}
                            </Text>
                        );
                    });
                };

                if (isBullet) {
                    return (
                        <View key={lineIdx} className="flex-row items-start pl-2 mb-1.5">
                            <Text className="text-primary font-black text-base mr-2 mt-0.5">•</Text>
                            <Text className="flex-1 text-gray-700 text-base leading-6">
                                {parseInline(bulletText)}
                            </Text>
                        </View>
                    );
                }

                return (
                    <Text key={lineIdx} className="text-gray-700 text-base leading-6 mb-1.5">
                        {parseInline(trimmed)}
                    </Text>
                );
            })}
        </View>
    );
};

export default function AIAssistantChatRoom() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id } = params; // dynamic dynamic chat session id or 'new'
    
    const scrollViewRef = useRef<ScrollView>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState<{ uri: string, base64: string, type: string }[]>([]);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [chatTitle, setChatTitle] = useState('Gutti AI Chat');

    useEffect(() => {
        if (id && id !== 'new') {
            setConversationId(id as string);
            fetchConversationMessages(id as string);
        } else {
            // New conversation starter template
            setMessages([
                {
                    id: 1,
                    text: "Hello! I'm Gutti AI, your AI Study Assistant. I can help you with:\n\n• Explaining difficult topics\n• Solving homework problems\n• Summarizing notes\n• Preparing for exams\n\nHow can I help you today?",
                    isUser: false,
                    timestamp: new Date(),
                },
            ]);
            setIsPageLoading(false);
        }
        
        // Handle prefilled query parameter
        if (params.initialQuery) {
            setInputText(params.initialQuery as string);
        }
    }, [id]);

    const fetchConversationMessages = async (threadId: string) => {
        try {
            setIsPageLoading(true);
            const response = await api.get(`/student/ai-assistant/history/${threadId}`);
            setChatTitle(response.data.conversation?.title || 'AI Chat Session');
            
            const rawMsgs = response.data.messages || [];
            const parsedMsgs: Message[] = rawMsgs.map((m: any) => ({
                id: m.id,
                text: m.content,
                isUser: m.sender === 'user',
                timestamp: new Date(m.created_at)
            }));
            
            // If empty, append template
            if (parsedMsgs.length === 0) {
                parsedMsgs.push({
                    id: 1,
                    text: "No message logs found. Ask me anything to get started!",
                    isUser: false,
                    timestamp: new Date()
                });
            }
            setMessages(parsedMsgs);
        } catch (e) {
            console.error('Failed to load past chat messages:', e);
            Alert.alert('Error', 'Failed to load chat history.');
        } finally {
            setIsPageLoading(false);
        }
    };

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0].base64) {
                const asset = result.assets[0];
                setSelectedFiles(prev => [...prev, {
                    uri: asset.uri,
                    base64: `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`,
                    type: 'image'
                }]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets) {
                const asset = result.assets[0];
                const base64 = await FileSystem.readAsStringAsync(asset.uri, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                setSelectedFiles(prev => [...prev, {
                    uri: asset.uri,
                    base64: `data:application/pdf;base64,${base64}`,
                    type: 'pdf'
                }]);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document');
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if (!inputText.trim() && selectedFiles.length === 0) return;

        const userMessage: Message = {
            id: Date.now(),
            text: inputText,
            isUser: true,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        const currentFiles = [...selectedFiles];
        const currentText = inputText;

        setInputText('');
        setSelectedFiles([]);
        setIsLoading(true);

        try {
            const payload: any = {
                query: currentText || (currentFiles.length > 0 ? "Explain this attached media." : ""),
                files: currentFiles.map(f => f.base64)
            };

            if (conversationId) {
                payload.ai_conversation_id = parseInt(conversationId);
            }

            const response = await api.post('/student/ai-assistant/chat', payload);

            const aiMessage: Message = {
                id: Date.now() + 1,
                text: response.data.response,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);

            // If it was a new chat thread, backend returned new conversation ID. Lock it in!
            if (!conversationId && response.data.ai_conversation_id) {
                const newId = response.data.ai_conversation_id.toString();
                setConversationId(newId);
                // Dynamically rewrite path parameters in router without reloading screen
                router.setParams({ id: newId });
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: "Sorry, I encountered an error. Please make sure the service is online and try again.",
                isUser: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (isPageLoading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
                <Text className="text-gray-400 mt-2 text-xs uppercase font-bold">Resuming study session...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="bg-primary px-6 py-4 shadow-md">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.replace('/ai-assistant')} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View className="w-10 h-10 bg-secondary rounded-2xl items-center justify-center mr-3">
                        <Sparkles size={20} color="#002147" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-base font-bold uppercase" numberOfLines={1}>{chatTitle}</Text>
                        <Text className="text-gray-300 text-[10px] font-bold">GUTTI AI STUDY ROOM</Text>
                    </View>
                </View>
            </View>

            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Messages List */}
                <ScrollView
                    ref={scrollViewRef}
                    className="flex-1 px-6 pt-4"
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                    showsVerticalScrollIndicator={false}
                >
                    {messages.map((message) => (
                        <View
                            key={message.id}
                            className={`mb-5 ${message.isUser ? 'items-end' : 'items-start'}`}
                        >
                            {!message.isUser && (
                                <View className="flex-row items-center mb-1.5 ml-2">
                                    <View className="w-5 h-5 bg-secondary rounded-full items-center justify-center mr-1.5 shadow-sm">
                                        <Sparkles size={10} color="#002147" />
                                    </View>
                                    <Text className="text-primary font-black text-[10px] uppercase tracking-widest">
                                        Gutti AI
                                    </Text>
                                </View>
                            )}
                            <View
                                className={`max-w-[85%] p-5 rounded-[28px] shadow-sm ${message.isUser
                                    ? 'bg-primary rounded-br-sm shadow-primary/10'
                                    : 'bg-white border border-slate-100 rounded-bl-sm shadow-slate-100/50'
                                    }`}
                            >
                                <FormattedText text={message.text} isUser={message.isUser} />
                                <Text
                                    className={`text-[10px] mt-2 font-bold ${message.isUser ? 'text-white/60' : 'text-slate-400'
                                        }`}
                                >
                                    {formatTime(message.timestamp)}
                                </Text>
                            </View>
                        </View>
                    ))}

                    {isLoading && (
                        <View className="items-start mb-4">
                            <View className="bg-white border border-slate-100 p-5 rounded-3xl rounded-bl-sm shadow-sm flex-row items-center">
                                <ActivityIndicator size="small" color="#002147" />
                                <Text className="text-gray-400 font-bold text-xs ml-2 uppercase">Gutti AI is thinking...</Text>
                            </View>
                        </View>
                    )}

                    <View className="h-4" />
                </ScrollView>

                {/* Preview Selected Files */}
                {selectedFiles.length > 0 && (
                    <View className="bg-white px-6 py-2 border-t border-gray-100">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View className="flex-row">
                                {selectedFiles.map((file, index) => (
                                    <View key={index} className="mr-3 relative">
                                        {file.type === 'image' ? (
                                            <Image
                                                source={{ uri: file.uri }}
                                                className="w-16 h-16 rounded-xl border border-gray-200"
                                            />
                                        ) : (
                                            <View className="w-16 h-16 rounded-xl border border-gray-200 bg-red-50 items-center justify-center">
                                                <FileText size={24} color="#EF4444" />
                                                <Text className="text-[8px] text-red-600 font-bold mt-1">PDF</Text>
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            onPress={() => removeFile(index)}
                                            className="absolute -top-1 -right-1 bg-gray-800 rounded-full p-0.5"
                                        >
                                            <X size={12} color="#FFFFFF" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    </View>
                )}

                {/* Chat Inputs */}
                <View 
                    style={{ paddingBottom: Math.max(insets.bottom + 16, 36) }} 
                    className="bg-white px-6 pt-4 border-t border-gray-200"
                >
                    <View className="flex-row items-center">
                        <View className="flex-1 bg-gray-100 rounded-3xl flex-row items-center px-4 py-2">
                            <TouchableOpacity onPress={pickImage} className="mr-2">
                                <ImageIcon size={22} color="#6B7280" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={pickDocument} className="mr-2">
                                <Paperclip size={22} color="#6B7280" />
                            </TouchableOpacity>
                            <TextInput
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Ask Gutti AI..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                maxLength={5000}
                                className="flex-1 text-gray-800 text-sm max-h-24 py-1"
                            />
                        </View>
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={(!inputText.trim() && selectedFiles.length === 0) || isLoading}
                            className={`ml-3 w-12 h-12 rounded-full items-center justify-center ${(inputText.trim() || selectedFiles.length > 0) && !isLoading ? 'bg-primary' : 'bg-gray-300'
                                }`}
                        >
                            <Send size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
