import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Sparkles, MessageSquare, PlusCircle, Trash2, BookOpen, FileText, Calculator, ChevronRight, BookOpenCheck } from 'lucide-react-native';
import api from '../../lib/api';

const { width } = Dimensions.get('window');

export default function AIAssistantDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/ai-assistant/history');
            setHistory(response.data.data || []);
        } catch (error) {
            console.error('Error fetching chat history:', error);
            // Default mock chat data for UI preview in case of backend delay
            setHistory([
                { id: 1, title: 'Explain Object-Oriented Programming', created_at: '2026-06-04T08:00:00Z' },
                { id: 2, title: 'Solve Quadratic Equation y=x^2-4x+3', created_at: '2026-06-03T14:30:00Z' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchHistory();
        setRefreshing(false);
    };

    const handleStartNewChat = (prefilledQuery = '') => {
        router.push({
            pathname: '/ai-assistant/[id]',
            params: { id: 'new', initialQuery: prefilledQuery }
        } as any);
    };

    const handleDeleteChat = (id: number, title: string) => {
        Alert.alert(
            'Delete Chat Session',
            `Are you sure you want to permanently delete the study session "${title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.delete(`/student/ai-assistant/history/${id}`);
                            setHistory(prev => prev.filter(item => item.id !== id));
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete chat session.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Stack.Screen options={{ title: 'Gutti AI Assistant', headerShown: true, headerStyle: { backgroundColor: '#002147' }, headerTintColor: '#fff' }} />

            <ScrollView
                className="flex-1"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Sparkle Box */}
                <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg items-center">
                    <View className="w-16 h-16 bg-secondary rounded-[24px] items-center justify-center border-4 border-white/10 mb-4 shadow-md">
                        <Sparkles size={32} color="#002147" />
                    </View>
                    <Text className="text-white text-xl font-black uppercase text-center tracking-wide">Gutti Study Assistant</Text>
                    <Text className="text-gray-300 text-xs text-center mt-1.5 px-6 leading-relaxed">
                        Master your university curriculum, solve complex problems, and summarize course materials with KIU's advanced learning model.
                    </Text>
                </View>

                {/* Floating "Start New Chat" Button */}
                <View className="px-6 -mt-10 mb-8">
                    <TouchableOpacity
                        onPress={() => handleStartNewChat()}
                        className="bg-secondary p-5 rounded-[24px] flex-row items-center justify-center shadow-lg border border-primary/10"
                    >
                        <PlusCircle size={22} color="#002147" />
                        <Text className="text-primary font-black text-sm uppercase tracking-wider ml-2.5">Start New Study Session</Text>
                    </TouchableOpacity>
                </View>

                {/* Specialized Learning Coaches */}
                <View className="px-6 mb-6">
                    <Text className="text-primary font-black text-xs uppercase tracking-widest mb-3.5">Specialized Study Tools</Text>
                    <View className="flex-row space-x-3">
                        <TouchableOpacity
                            onPress={() => router.push('/ai-assistant/homework')}
                            className="flex-1 bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex-row items-center"
                        >
                            <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                                <Calculator size={20} color="#3B82F6" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-primary font-bold text-xs uppercase">Homework</Text>
                                <Text className="text-gray-400 text-[8px] uppercase font-bold tracking-tight">Solve math & upload files</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/ai-assistant/topics')}
                            className="flex-1 bg-white p-5 rounded-[28px] border border-gray-100 shadow-sm flex-row items-center"
                        >
                            <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center mr-3">
                                <BookOpenCheck size={20} color="#8B5CF6" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-primary font-bold text-xs uppercase">Curriculum</Text>
                                <Text className="text-gray-400 text-[8px] uppercase font-bold tracking-tight">Master specific topics</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Pre-made Quick Prompts */}
                <View className="px-6 mb-8">
                    <Text className="text-primary font-black text-xs uppercase tracking-widest mb-3.5">Ask Gutti AI Anything</Text>
                    <View className="flex-row flex-wrap">
                        {[
                            { label: 'Explain Database Normalization', query: 'Can you explain database normalization (1NF, 2NF, 3NF) with a student record database example?', color: '#3B82F6' },
                            { label: 'Explain Object-Oriented Principles', query: 'What are the 4 main principles of Object-Oriented Programming (OOP) with clean code examples?', color: '#8B5CF6' },
                            { label: 'Solve Calculus Derivative', query: 'Please explain step-by-step how to find the derivative of f(x) = 3x^2 + 5x - 7 using first principles.', color: '#10B981' }
                        ].map((prompt, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleStartNewChat(prompt.query)}
                                className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3.5 mr-2 mb-2 flex-row items-center"
                            >
                                <Sparkles size={12} color={prompt.color} />
                                <Text className="text-gray-700 text-xs font-bold ml-2">{prompt.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Chat History Section */}
                <View className="px-6 pb-20">
                    <Text className="text-primary font-black text-xs uppercase tracking-widest mb-4">Recent Sessions ({history.length})</Text>

                    {loading && history.length === 0 ? (
                        <ActivityIndicator size="small" color="#002147" className="my-8" />
                    ) : history.length > 0 ? (
                        history.map((item) => (
                            <View
                                key={item.id}
                                className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-3 flex-row items-center justify-between"
                            >
                                <TouchableOpacity
                                    onPress={() => router.push(`/ai-assistant/${item.id}` as any)}
                                    className="flex-row items-center flex-1 mr-4"
                                >
                                    <View className="w-10 h-10 bg-primary/5 rounded-2xl items-center justify-center mr-3">
                                        <MessageSquare size={16} color="#002147" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary font-bold text-sm uppercase leading-tight" numberOfLines={1}>
                                            {item.title || 'AI Chat Session'}
                                        </Text>
                                        <Text className="text-gray-400 text-[9px] font-bold uppercase mt-1">
                                            {formatDate(item.created_at)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => handleDeleteChat(item.id, item.title)}
                                    className="bg-red-50 p-2.5 rounded-xl"
                                >
                                    <Trash2 size={14} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        ))
                    ) : (
                        <View className="items-center justify-center py-10 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                            <MessageSquare size={36} color="#CBD5E1" />
                            <Text className="text-gray-400 text-xs font-black uppercase text-center mt-3">No study history found</Text>
                            <Text className="text-gray-400 text-[10px] text-center mt-1">Select "Start New Study Session" above to ask your first question.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
