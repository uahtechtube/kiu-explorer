import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, MessageSquare, Globe, Users, Send, AlertTriangle, Layers, Eye } from 'lucide-react-native';
import api from '../../lib/api';

interface Association {
    id: number;
    name: string;
}

export default function ComposePostPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState('');
    const [type, setType] = useState<'social' | 'news'>('social');
    const [visibility, setVisibility] = useState<'school' | 'class' | 'association'>('school');
    const [associations, setAssociations] = useState<Association[]>([]);
    const [selectedAssociationId, setSelectedAssociationId] = useState<number | null>(null);
    const [loadingAssociations, setLoadingAssociations] = useState(true);

    const fetchAssociations = async () => {
        try {
            setLoadingAssociations(true);
            const response = await api.get('/student/associations');
            setAssociations(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error loading associations for compose:', error);
            setAssociations([]);
        } finally {
            setLoadingAssociations(false);
        }
    };

    useEffect(() => {
        fetchAssociations();
    }, []);

    const handlePublish = async () => {
        if (!content.trim()) {
            Alert.alert('Empty Post', 'Please write some content to share with your campus.');
            return;
        }

        if (visibility === 'association' && !selectedAssociationId) {
            Alert.alert('Selection Required', 'Please select an association/club to publish this post to.');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                content: content,
                type: type,
                association_id: visibility === 'association' ? selectedAssociationId : null,
                visibility: visibility,
            };

            await api.post('/posts', payload);

            Alert.alert(
                'Success',
                'Your moment has been published successfully!',
                [
                    {
                        text: 'Awesome',
                        onPress: () => {
                            // Go back to feed and refresh
                            router.replace('/social');
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Error creating post:', error);
            const errMsg = error.response?.data?.message || 'Failed to publish post. Please check your network and try again.';
            Alert.alert('Failed to Publish', errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Header */}
            <View className="bg-primary px-6 pt-6 pb-8 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Compose</Text>
                        <Text className="text-white text-xl font-bold">New Post</Text>
                    </View>
                    <View className="w-12" />
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 mt-4"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Composing Card */}
                <View className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
                    
                    {/* Visibility Selector */}
                    <Text className="text-primary font-black text-xs uppercase tracking-widest mb-3">Post Visibility</Text>
                    <View className="flex-row mb-4 flex-wrap">
                        <TouchableOpacity
                            onPress={() => {
                                setVisibility('school');
                                setSelectedAssociationId(null);
                            }}
                            className={`px-4 py-2.5 rounded-xl mr-2 mb-2 flex-row items-center border ${visibility === 'school' ? 'bg-secondary border-secondary' : 'bg-gray-50 border-gray-200'}`}
                        >
                            <Globe size={14} color="#002147" />
                            <Text className={`font-bold text-xs ml-2 ${visibility === 'school' ? 'text-primary' : 'text-gray-500'}`}>
                                School Wide
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setVisibility('class');
                                setSelectedAssociationId(null);
                            }}
                            className={`px-4 py-2.5 rounded-xl mr-2 mb-2 flex-row items-center border ${visibility === 'class' ? 'bg-secondary border-secondary' : 'bg-gray-50 border-gray-200'}`}
                        >
                            <Layers size={14} color="#002147" />
                            <Text className={`font-bold text-xs ml-2 ${visibility === 'class' ? 'text-primary' : 'text-gray-500'}`}>
                                My Department
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setVisibility('association')}
                            className={`px-4 py-2.5 rounded-xl mr-2 mb-2 flex-row items-center border ${visibility === 'association' ? 'bg-secondary border-secondary' : 'bg-gray-50 border-gray-200'}`}
                        >
                            <Users size={14} color="#002147" />
                            <Text className={`font-bold text-xs ml-2 ${visibility === 'association' ? 'text-primary' : 'text-gray-500'}`}>
                                Association / Club
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Club Selector (Only if visibility is association) */}
                    {visibility === 'association' && (
                        <View className="mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                            <Text className="text-gray-500 font-bold text-[10px] uppercase tracking-wider mb-2">Select your Association/Club:</Text>
                            <View className="flex-row flex-wrap">
                                {loadingAssociations ? (
                                    <ActivityIndicator size="small" color="#002147" />
                                ) : associations.length === 0 ? (
                                    <Text className="text-gray-400 text-xs italic">You are not registered in any associations.</Text>
                                ) : (
                                    associations.map((assoc) => {
                                        const isSelected = selectedAssociationId === assoc.id;
                                        return (
                                            <TouchableOpacity
                                                key={assoc.id}
                                                onPress={() => setSelectedAssociationId(assoc.id)}
                                                className={`px-3 py-2 rounded-xl mr-2 mb-2 flex-row items-center border ${isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                                            >
                                                <Users size={12} color={isSelected ? 'white' : '#002147'} />
                                                <Text className={`font-bold text-[11px] ml-1.5 ${isSelected ? 'text-white' : 'text-primary'}`}>
                                                    {assoc.name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })
                                )}
                            </View>
                        </View>
                    )}

                    {/* Text Composer */}
                    <Text className="text-primary font-black text-xs uppercase tracking-widest mb-3">What's on your mind?</Text>
                    <TextInput
                        value={content}
                        onChangeText={setContent}
                        placeholder="Share highlights of your campus day, study groups, or school updates..."
                        placeholderTextColor="#94A3B8"
                        multiline
                        numberOfLines={8}
                        maxLength={1000}
                        textAlignVertical="top"
                        className="bg-gray-50 rounded-2xl px-5 py-4 text-primary font-medium border border-gray-100 min-h-[180px] mb-2 leading-6 text-base"
                    />

                    {/* Character Count */}
                    <View className="flex-row justify-end mb-6">
                        <Text className="text-gray-400 text-xs font-bold">
                            {content.length} / 1000 characters
                        </Text>
                    </View>

                    {/* Posting Rules / Note */}
                    <View className="bg-amber-50 rounded-2xl p-4 flex-row items-center border border-amber-100 mb-8">
                        <AlertTriangle size={18} color="#D97706" />
                        <Text className="text-amber-800 text-[11px] leading-5 font-bold flex-1 ml-3">
                            Lounge Guidelines: Avoid offensive topics, fake news, or spam. Posts are moderated according to university standards.
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handlePublish}
                        disabled={loading || !content.trim()}
                        className={`rounded-2xl py-5 items-center justify-center flex-row shadow-lg ${loading || !content.trim() ? 'bg-gray-300 shadow-none' : 'bg-primary shadow-primary/20'}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text className="text-white font-black text-base uppercase tracking-widest">
                                    Publish Moments
                                </Text>
                                <Send size={16} color="white" className="ml-3" />
                            </>
                        )}
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
