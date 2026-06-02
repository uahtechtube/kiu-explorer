import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
    attachment?: string; // Image URL/Base64
}

const quickActions = [
    { id: 1, label: 'Explain Topic', icon: BookOpen, color: '#3B82F6' },
    { id: 2, label: 'Summarize Notes', icon: FileText, color: '#8B5CF6' },
    { id: 3, label: 'Solve Math', icon: Calculator, color: '#10B981' },
];

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

export default function AIAssistantPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const scrollViewRef = useRef<ScrollView>(null);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 1,
            text: "Hello! I'm Gutti AI, your AI Study Assistant. I can help you with:\n\n• Explaining difficult topics\n• Solving homework problems\n• Summarizing notes\n• Preparing for exams\n\nHow can I help you today?",
            isUser: false,
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<{ uri: string, base64: string, type: string }[]>([]);

    useEffect(() => {
        if (params.initialQuery) {
            setInputText(params.initialQuery as string);
        }
        if (params.initialFiles) {
            try {
                const files = JSON.parse(params.initialFiles as string);
                if (Array.isArray(files)) {
                    setSelectedFiles(files.map(f => ({
                        uri: '', // URI not needed for base64 only
                        base64: f,
                        type: f.includes('pdf') ? 'pdf' : 'image'
                    })));
                }
            } catch (e) {
                console.error('Failed to parse initial files');
            }
        }
    }, [params.initialQuery, params.initialFiles]);

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
                // Read as base64
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

        setMessages([...messages, userMessage]);
        const currentFiles = [...selectedFiles];
        const currentText = inputText;

        setInputText('');
        setSelectedFiles([]);
        setIsLoading(true);

        try {
            const response = await api.post('/student/ai-assistant/chat', {
                query: currentText || (currentFiles.length > 0 ? "What's in this file?" : ""),
                files: currentFiles.map(f => f.base64)
            });

            const aiMessage: Message = {
                id: Date.now() + 1,
                text: response.data.response,
                isUser: false,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: "Sorry, I encountered an error. Please make sure your file is not too large and try again.",
                isUser: false,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (action: string) => {
        setInputText(action);
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 py-4">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View className="w-12 h-12 bg-secondary rounded-full items-center justify-center mr-3">
                        <Sparkles size={24} color="#002147" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-xl font-bold">Gutti AI</Text>
                        <Text className="text-gray-300 text-xs">Always here to help</Text>
                    </View>
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
                    className="flex-1 px-6 pt-4"
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
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
                            <View className="bg-white border border-gray-200 p-4 rounded-3xl rounded-bl-sm">
                                <View className="flex-row">
                                    <View className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse" />
                                    <View className="w-2 h-2 bg-gray-400 rounded-full mr-1 animate-pulse" />
                                    <View className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                                </View>
                            </View>
                        </View>
                    )}

                    <View className="h-4" />
                </ScrollView>

                {/* Specialized Coached Tools */}
                {messages.length <= 1 && (
                    <View className="px-6 pb-4">
                        <Text className="text-gray-500 text-sm mb-3">Specialized Coached Tools</Text>
                        <View className="flex-row space-x-3 mb-2">
                            <TouchableOpacity
                                onPress={() => router.push('/ai-assistant/homework')}
                                className="flex-1 p-5 rounded-3xl flex-row items-center shadow-sm"
                                style={{ backgroundColor: '#3B82F6' }}
                            >
                                <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                                    <Calculator size={20} color="white" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-white font-bold text-sm">Homework Helper</Text>
                                    <Text className="text-blue-100 text-[10px]">Solve & snap math</Text>
                                </View>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => router.push('/ai-assistant/topics')}
                                className="flex-1 p-5 rounded-3xl flex-row items-center shadow-sm"
                                style={{ backgroundColor: '#8B5CF6' }}
                            >
                                <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                                    <BookOpen size={20} color="white" />
                                </View>
                                <View className="ml-3 flex-1">
                                    <Text className="text-white font-bold text-sm">Study Topics</Text>
                                    <Text className="text-purple-100 text-[10px]">Master specific courses</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Quick Actions */}
                {messages.length <= 1 && (
                    <View className="px-6 pb-4">
                        <Text className="text-gray-500 text-sm mb-3">Quick Actions</Text>
                        <View className="flex-row flex-wrap">
                            {quickActions.map((action) => (
                                <TouchableOpacity
                                    key={action.id}
                                    onPress={() => handleQuickAction(action.label)}
                                    className="bg-white border border-gray-200 rounded-2xl p-3 mr-2 mb-2 flex-row items-center"
                                >
                                    <action.icon size={18} color={action.color} />
                                    <Text className="text-gray-700 text-sm ml-2">{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {/* Preview Area for Selected Files */}
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

                {/* Input Area */}
                <View className="bg-white px-6 py-4 border-t border-gray-200">
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
                                placeholder="Ask me anything..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                maxLength={5000}
                                className="flex-1 text-gray-800 text-base max-h-24"
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
