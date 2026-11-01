import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Search, Filter, BookOpen, Download, Clock, Star, GraduationCap, FileText, Bookmark } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

interface Resource {
    id: number;
    title: string;
    author: string;
    category: 'textbook' | 'journal' | 'past_question' | 'reference' | 'research' | 'other';
    file_type: string;
    file_size: number;
    downloads: number;
    cover_image?: string;
    created_at: string;
}

export default function DigitalLibraryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [resources, setResources] = useState<Resource[]>([]);

    const categories = ['All', 'Textbook', 'Past Question', 'Journal', 'Research'];

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await api.get('/library', {
                params: {
                    search: searchQuery,
                    category: selectedCategory === 'All' ? null : selectedCategory.toLowerCase().replace(' ', '_')
                }
            });
            // Handle both paginated and non-paginated responses
            const data = response.data.data || response.data;
            setResources(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching resources:', error);
            setResources([]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchResources();
        setRefreshing(false);
    }, []);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'textbook': return BookOpen;
            case 'past_question': return GraduationCap;
            case 'journal': return FileText;
            default: return Bookmark;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* High-End Academic Header */}
            <View className="bg-primary px-6 pt-6 pb-24 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">KIU Repository</Text>
                        <Text className="text-white text-xl font-bold">Digital Library</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <Bookmark size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Search & Filter Matrix */}
                <View className="bg-white flex-row items-center px-5 h-14 rounded-2xl shadow-xl shadow-primary/20 mb-6">
                    <Search size={20} color="#94A3B8" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={fetchResources}
                        placeholder="Search textbooks, questions..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-3 text-primary font-medium"
                    />
                    <Filter size={18} color="#002147" />
                </View>

                {/* Category Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-2xl mx-2 border ${selectedCategory === cat ? 'bg-secondary border-secondary' : 'bg-white/10 border-white/10'
                                }`}
                        >
                            <Text className={`font-black text-[10px] uppercase ${selectedCategory === cat ? 'text-primary' : 'text-white/60'}`}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                className="flex-1 -mt-12 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !resources.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : (
                    <View className="flex-row flex-wrap justify-between mt-4">
                        {resources.map((item) => {
                            const Icon = getCategoryIcon(item.category);
                            return (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => router.push(`/library/${item.id}`)}
                                    className="w-[48%] mb-6"
                                >
                                    <PremiumCard variant="elevated" className="p-0 overflow-hidden bg-white border-gray-100 rounded-[24px]">
                                        <View className="h-44 w-full bg-gray-100 relative">
                                            {item.cover_image ? (
                                                <Image source={{ uri: item.cover_image }} className="w-full h-full" resizeMode="cover" />
                                            ) : (
                                                <View className="w-full h-full items-center justify-center">
                                                    <Icon size={40} color="#CBD5E1" strokeWidth={1} />
                                                </View>
                                            )}
                                            <View className="absolute top-3 left-3 bg-primary/80 backdrop-blur-md px-2 py-1 rounded-lg">
                                                <Text className="text-secondary font-black text-[8px] uppercase">{item.category.replace('_', ' ')}</Text>
                                            </View>
                                        </View>

                                        <View className="p-4">
                                            <Text className="text-primary font-black text-xs h-8 mb-1" numberOfLines={2}>{item.title}</Text>
                                            <Text className="text-gray-400 text-[9px] font-bold mb-3">{item.author}</Text>

                                            <View className="flex-row items-center justify-between border-t border-gray-50 pt-3">
                                                <View className="flex-row items-center">
                                                    <Download size={10} color="#94A3B8" />
                                                    <Text className="text-gray-400 text-[8px] font-black ml-1 uppercase">{item.downloads}</Text>
                                                </View>
                                                <Text className="text-primary font-black text-[8px] uppercase">{item.file_type} • {formatSize(item.file_size)}</Text>
                                            </View>
                                        </View>
                                    </PremiumCard>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
