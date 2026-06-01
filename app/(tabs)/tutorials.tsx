import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Video, ChevronRight, Filter, Play, Eye, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

const CATEGORIES = ['All', 'Software', 'Computing', 'Engineering', 'Science'];

export default function TutorialsScreen() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tutorials, setTutorials] = useState<any[]>([]);
    
    // Search states
    const [searchQuery, setSearchQuery] = useState('');
    const [youtubeResults, setYoutubeResults] = useState<any[]>([]);
    const [isSearchingYoutube, setIsSearchingYoutube] = useState(false);

    const router = useRouter();

    const fetchTutorials = async () => {
        try {
            const response = await api.get('/tutorials');
            setTutorials(response.data.data || response.data || []);
        } catch (error: any) {
            console.warn('Error fetching tutorials:', error.message || error);
            setTutorials([]); // Show empty state instead of mock data
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTutorials();
    }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchTutorials();
        setRefreshing(false);
    }, []);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setYoutubeResults([]);
            return;
        }

        const hasLocalResults = tutorials.some(t => 
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
            (selectedCategory === 'All' || t.category === selectedCategory)
        );

        if (!hasLocalResults) {
            setIsSearchingYoutube(true);
            try {
                const response = await api.get(`/tutorials/youtube/search?q=${encodeURIComponent(searchQuery)}`);
                setYoutubeResults(response.data.data || response.data || []);
            } catch (error: any) {
                console.warn('YouTube search error:', error.message || error);
                setYoutubeResults([]);
            } finally {
                setIsSearchingYoutube(false);
            }
        } else {
            setYoutubeResults([]);
        }
    };

    const handleSaveAndPlay = async (video: any) => {
        const videoId = video.id?.videoId || video.id || video.videoId;
        const title = video.snippet?.title || video.title;
        const channelTitle = video.snippet?.channelTitle || video.channelTitle || video.author;
        const description = video.snippet?.description || video.description;

        try {
            const response = await api.post('/tutorials/youtube/save', {
                youtube_video_id: videoId,
                title: title,
                channel_title: channelTitle,
                description: description,
            });
            const savedTutorial = response.data.tutorial;
            if (savedTutorial && savedTutorial.id) {
                router.push(`/tutorials/${savedTutorial.id}` as any);
            }
        } catch (error: any) {
            console.warn('Error saving YouTube tutorial:', error.message || error);
            // Fallback to opening externally if saving to DB fails
            Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`);
        }
    };

    const filteredTutorials = tutorials.filter(t => {
        const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
        const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
    });

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 pt-6 pb-2 rounded-b-[40px]">
                <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">KIU Repository</Text>
                <Text className="text-primary text-3xl font-black italic tracking-tighter">Elite Tutorials</Text>

                {/* Tactical Search */}
                <View className="mt-8 bg-gray-50 flex-row items-center px-5 h-14 rounded-2xl border border-gray-100 shadow-sm">
                    <Search size={20} color="#94A3B8" />
                    <TextInput 
                        className="flex-1 ml-4 text-primary font-bold text-sm" 
                        placeholder="Explore specialized courses..." 
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    <TouchableOpacity className="bg-primary/5 p-2 rounded-xl" onPress={handleSearch}>
                        <Search size={18} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* Categories Scroll */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-6 mb-4">
                    {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            className={`mr-3 px-6 py-3 rounded-2xl border ${selectedCategory === cat ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'bg-white border-gray-100'}`}
                        >
                            <Text className={`font-black text-[10px] uppercase tracking-widest ${selectedCategory === cat ? 'text-secondary' : 'text-primary/40'}`}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                className="flex-1 px-6 bg-gray-50/50"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !tutorials.length ? (
                    <ActivityIndicator color="#002147" className="mt-20" />
                ) : (
                    <>
                        <Text className="text-primary font-black text-sm uppercase tracking-widest mb-6 px-1">
                            {searchQuery && filteredTutorials.length === 0 ? (isSearchingYoutube ? 'Searching Web...' : 'External Resources') : 'Curated Selection'}
                        </Text>
                        
                        {filteredTutorials.map((tutorial) => (
                            <TouchableOpacity
                                key={tutorial.id}
                                onPress={() => router.push(`/tutorials/${tutorial.id}` as any)}
                                className="bg-white rounded-[32px] p-6 mb-5 shadow-sm border border-gray-100"
                            >
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="bg-primary/5 px-3 py-1.5 rounded-xl border border-primary/10">
                                        <Text className="text-primary font-black text-[10px] uppercase tracking-widest">{tutorial.category}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Eye size={14} color="#9CA3AF" />
                                        <Text className="text-gray-400 text-xs ml-1.5 font-bold">{tutorial.views}</Text>
                                    </View>
                                </View>

                                <Text className="text-primary font-black text-xl mb-3 leading-tight">{tutorial.title}</Text>

                                <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
                                    <View className="flex-row items-center">
                                        <View className="w-8 h-8 bg-primary/5 rounded-xl items-center justify-center mr-2 border border-primary/5">
                                            <Text className="text-primary font-black text-[10px]">{tutorial.lecturer?.name?.charAt(0) || 'A'}</Text>
                                        </View>
                                        <Text className="text-gray-500 text-xs font-bold">{tutorial.lecturer?.name || 'Academic Coach'}</Text>
                                    </View>
                                    <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-xl">
                                        <Clock size={12} color="#6B7280" />
                                        <Text className="text-gray-600 font-black text-[10px] ml-1.5 uppercase">{tutorial.duration}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}

                        {searchQuery && filteredTutorials.length === 0 && isSearchingYoutube && (
                            <ActivityIndicator color="#002147" className="mt-10" />
                        )}

                        {searchQuery && filteredTutorials.length === 0 && !isSearchingYoutube && youtubeResults.map((video: any, index: number) => {
                            const videoId = video.id?.videoId || video.id || video.videoId || `yt-${index}`;
                            const title = video.snippet?.title || video.title;
                            const channel = video.snippet?.channelTitle || video.channelTitle || video.author;
                            const desc = video.snippet?.description || video.description;
                            
                            return (
                                <TouchableOpacity
                                    key={videoId}
                                    onPress={() => handleSaveAndPlay(video)}
                                    className="bg-white rounded-[32px] p-6 mb-5 shadow-sm border border-gray-100"
                                >
                                    <View className="flex-row items-center justify-between mb-4">
                                        <View className="bg-[#FF0000]/10 px-3 py-1.5 rounded-xl border border-[#FF0000]/20">
                                            <Text className="text-[#FF0000] font-black text-[10px] uppercase tracking-widest">YouTube</Text>
                                        </View>
                                    </View>
                                    <Text className="text-primary font-black text-xl mb-3 leading-tight">{title}</Text>
                                    <Text className="text-gray-500 text-xs font-bold mb-4" numberOfLines={2}>{desc}</Text>
                                    
                                    <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
                                        <View className="flex-row items-center">
                                            <Text className="text-gray-500 text-xs font-bold">{channel}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                        
                        {searchQuery && filteredTutorials.length === 0 && !isSearchingYoutube && youtubeResults.length === 0 && (
                            <View className="items-center mt-10">
                                <Text className="text-gray-400 font-bold">No results found anywhere.</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
