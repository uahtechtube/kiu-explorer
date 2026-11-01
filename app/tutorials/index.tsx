import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput,
    ActivityIndicator, Image, Alert, FlatList, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import {
    Search, BookOpen, Play, Clock, Eye, Youtube,
    ChevronLeft, BookmarkPlus, CheckCircle, X
} from 'lucide-react-native';
import api from '../../lib/api';

const { width } = Dimensions.get('window');

interface SavedTutorial {
    id: number;
    title: string;
    description?: string;
    source_type: 'file' | 'youtube';
    youtube_video_id?: string;
    thumbnail?: string;
    category: string;
    duration: string;
    views: number | string;
    lecturer: { name: string };
    course?: { code: string; title: string };
}

interface YouTubeResult {
    videoId: string;
    title: string;
    channelTitle: string;
    description: string;
    thumbnail: string;
    duration: string;
    views: string;
}

type Tab = 'saved' | 'search';

export default function TutorialsPage() {
    const router = useRouter();
    const [tab, setTab] = useState<Tab>('saved');
    const [savedTutorials, setSavedTutorials] = useState<SavedTutorial[]>([]);
    const [loadingSaved, setLoadingSaved] = useState(true);

    // YouTube search state
    const [query, setQuery] = useState('');
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<YouTubeResult[]>([]);
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
    const [savingId, setSavingId] = useState<string | null>(null);

    useEffect(() => {
        fetchSaved();
    }, []);

    const fetchSaved = async () => {
        try {
            setLoadingSaved(true);
            const response = await api.get('/tutorials');
            const data: SavedTutorial[] = response.data.data || response.data || [];
            setSavedTutorials(data);
            // Track already-saved YouTube IDs
            const ytIds = new Set(
                data.filter(t => t.source_type === 'youtube' && t.youtube_video_id)
                    .map(t => t.youtube_video_id as string)
            );
            setSavedIds(ytIds);
        } catch (error) {
            console.error('Failed to fetch tutorials:', error);
        } finally {
            setLoadingSaved(false);
        }
    };

    const handleSearch = async () => {
        if (!query.trim() || query.trim().length < 2) return;
        try {
            setSearching(true);
            setResults([]);
            const response = await api.get('/tutorials/youtube/search', { params: { q: query.trim() } });
            setResults(response.data.data || []);
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Search failed. Please try again.';
            Alert.alert('Search Error', msg);
        } finally {
            setSearching(false);
        }
    };

    const handleSave = async (item: YouTubeResult) => {
        setSavingId(item.videoId);
        try {
            await api.post('/tutorials/youtube/save', {
                youtube_video_id: item.videoId,
                title: item.title,
                description: item.channelTitle,
                channel_title: item.channelTitle,
            });
            setSavedIds(prev => new Set(prev).add(item.videoId));
            Alert.alert('Saved!', `"${item.title}" has been added to your tutorial list.`);
            fetchSaved();
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Failed to save tutorial.';
            Alert.alert('Error', msg);
        } finally {
            setSavingId(null);
        }
    };

    const renderSavedTutorial = (item: SavedTutorial) => (
        <TouchableOpacity
            key={item.id}
            onPress={() => router.push(`/tutorials/${item.id}` as any)}
            style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                marginBottom: 12,
                flexDirection: 'row',
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: '#f3f4f6'
            }}
        >
            {/* Thumbnail */}
            <View style={{ width: 96, height: 72, backgroundColor: '#111827' }}>
                {item.source_type === 'youtube' && item.youtube_video_id ? (
                    <Image
                        source={{ uri: item.thumbnail || `https://img.youtube.com/vi/${item.youtube_video_id}/mqdefault.jpg` }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                ) : (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <BookOpen size={28} color="#4b5563" />
                    </View>
                )}
                {/* Play overlay */}
                <View style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    alignItems: 'center', justifyContent: 'center',
                    backgroundColor: 'rgba(0,0,0,0.15)'
                }}>
                    <View style={{
                        width: 28, height: 28, borderRadius: 14,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Play size={14} color="#002147" />
                    </View>
                </View>
            </View>

            {/* Info */}
            <View style={{ flex: 1, padding: 10 }}>
                <Text style={{ color: '#002147', fontWeight: '700', fontSize: 13 }} numberOfLines={2}>
                    {item.title}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    {item.source_type === 'youtube' && (
                        <View style={{
                            backgroundColor: '#fee2e2', borderRadius: 6,
                            paddingHorizontal: 6, paddingVertical: 2, marginRight: 6
                        }}>
                            <Text style={{ color: '#dc2626', fontSize: 10, fontWeight: '700' }}>YouTube</Text>
                        </View>
                    )}
                    <Clock size={11} color="#9ca3af" />
                    <Text style={{ color: '#9ca3af', fontSize: 11, marginLeft: 3 }}>{item.duration}</Text>
                    <Text style={{ color: '#d1d5db', marginHorizontal: 4 }}>•</Text>
                    <Eye size={11} color="#9ca3af" />
                    <Text style={{ color: '#9ca3af', fontSize: 11, marginLeft: 3 }}>{item.views} views</Text>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                    {item.lecturer.name}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderYouTubeResult = ({ item }: { item: YouTubeResult }) => {
        const isSaved = savedIds.has(item.videoId);
        const isSaving = savingId === item.videoId;

        return (
            <View style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: '#f3f4f6',
                overflow: 'hidden'
            }}>
                {/* Thumbnail */}
                <View style={{ position: 'relative', height: 180 }}>
                    <Image
                        source={{ uri: item.thumbnail }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                    {/* Duration badge */}
                    <View style={{
                        position: 'absolute', bottom: 8, right: 8,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2
                    }}>
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{item.duration}</Text>
                    </View>
                    {/* YouTube badge */}
                    <View style={{
                        position: 'absolute', top: 8, left: 8,
                        backgroundColor: '#dc2626',
                        borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2,
                        flexDirection: 'row', alignItems: 'center'
                    }}>
                        <Youtube size={10} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', marginLeft: 3 }}>YouTube</Text>
                    </View>
                </View>

                {/* Content */}
                <View style={{ padding: 12 }}>
                    <Text style={{ color: '#111827', fontWeight: '700', fontSize: 14 }} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                        <Text style={{ color: '#6b7280', fontSize: 12 }}>{item.channelTitle}</Text>
                        <Text style={{ color: '#d1d5db', marginHorizontal: 6 }}>•</Text>
                        <Eye size={12} color="#9ca3af" />
                        <Text style={{ color: '#9ca3af', fontSize: 12, marginLeft: 3 }}>{item.views}</Text>
                    </View>
                    {item.description ? (
                        <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }} numberOfLines={2}>
                            {item.description}
                        </Text>
                    ) : null}

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={() => !isSaved && !isSaving && handleSave(item)}
                        disabled={isSaved || isSaving}
                        style={{
                            marginTop: 10,
                            backgroundColor: isSaved ? '#d1fae5' : '#002147',
                            borderRadius: 12,
                            paddingVertical: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : isSaved ? (
                            <>
                                <CheckCircle size={16} color="#059669" />
                                <Text style={{ color: '#059669', fontWeight: '700', marginLeft: 6 }}>Saved to Library</Text>
                            </>
                        ) : (
                            <>
                                <BookmarkPlus size={16} color="#fff" />
                                <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 6 }}>Save to My Tutorials</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f9fafb' }}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={{ backgroundColor: '#002147', paddingHorizontal: 24, paddingTop: 20, paddingBottom: 24 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                        <ChevronLeft size={24} color="#fff" />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ color: '#fff', fontSize: 22, fontWeight: '800' }}>Tutorial Library</Text>
                        <Text style={{ color: '#93c5fd', fontSize: 13 }}>Learn from YouTube & uploaded resources</Text>
                    </View>
                </View>

                {/* Tab Switcher */}
                <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 4 }}>
                    <TouchableOpacity
                        onPress={() => setTab('saved')}
                        style={{
                            flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
                            backgroundColor: tab === 'saved' ? '#fff' : 'transparent'
                        }}
                    >
                        <Text style={{ fontWeight: '700', fontSize: 13, color: tab === 'saved' ? '#002147' : '#93c5fd' }}>
                            My Tutorials
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setTab('search')}
                        style={{
                            flex: 1, paddingVertical: 8, borderRadius: 8, alignItems: 'center',
                            backgroundColor: tab === 'search' ? '#fff' : 'transparent'
                        }}
                    >
                        <Text style={{ fontWeight: '700', fontSize: 13, color: tab === 'search' ? '#002147' : '#93c5fd' }}>
                            🔍 Search YouTube
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            {tab === 'saved' ? (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
                    {loadingSaved ? (
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <ActivityIndicator size="large" color="#002147" />
                            <Text style={{ color: '#9ca3af', marginTop: 12 }}>Loading tutorials...</Text>
                        </View>
                    ) : savedTutorials.length === 0 ? (
                        <View style={{ alignItems: 'center', marginTop: 60 }}>
                            <BookOpen size={64} color="#d1d5db" />
                            <Text style={{ color: '#374151', fontWeight: '700', fontSize: 18, marginTop: 16 }}>
                                No tutorials yet
                            </Text>
                            <Text style={{ color: '#9ca3af', textAlign: 'center', marginTop: 8, paddingHorizontal: 32 }}>
                                Search YouTube to find and save tutorials to your library
                            </Text>
                            <TouchableOpacity
                                onPress={() => setTab('search')}
                                style={{
                                    marginTop: 20, backgroundColor: '#002147',
                                    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12
                                }}
                            >
                                <Text style={{ color: '#fff', fontWeight: '700' }}>Search YouTube</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <Text style={{ color: '#6b7280', fontSize: 13, marginBottom: 12 }}>
                                {savedTutorials.length} tutorial{savedTutorials.length !== 1 ? 's' : ''} saved
                            </Text>
                            {savedTutorials.map(renderSavedTutorial)}
                        </>
                    )}
                </ScrollView>
            ) : (
                <View style={{ flex: 1 }}>
                    {/* Search Bar */}
                    <View style={{ padding: 16, paddingBottom: 8 }}>
                        <View style={{
                            flexDirection: 'row', alignItems: 'center',
                            backgroundColor: '#fff', borderRadius: 14,
                            borderWidth: 1, borderColor: '#e5e7eb',
                            paddingHorizontal: 12
                        }}>
                            <Search size={18} color="#9ca3af" />
                            <TextInput
                                value={query}
                                onChangeText={setQuery}
                                onSubmitEditing={handleSearch}
                                placeholder="Search YouTube (e.g. database normalization)..."
                                placeholderTextColor="#9ca3af"
                                returnKeyType="search"
                                style={{ flex: 1, paddingVertical: 12, paddingHorizontal: 10, color: '#111827', fontSize: 14 }}
                            />
                            {query.length > 0 && (
                                <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
                                    <X size={16} color="#9ca3af" />
                                </TouchableOpacity>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={handleSearch}
                            disabled={searching || query.trim().length < 2}
                            style={{
                                marginTop: 8, backgroundColor: query.trim().length < 2 ? '#9ca3af' : '#002147',
                                borderRadius: 12, paddingVertical: 12, alignItems: 'center'
                            }}
                        >
                            {searching ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={{ color: '#fff', fontWeight: '700' }}>Search YouTube</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Results */}
                    {results.length === 0 && !searching ? (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Youtube size={56} color="#d1d5db" />
                            <Text style={{ color: '#6b7280', marginTop: 12, textAlign: 'center', paddingHorizontal: 32 }}>
                                Search for any topic to find YouTube tutorials.{'\n'}
                                Save them to your library for easy access.
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={results}
                            keyExtractor={item => item.videoId}
                            renderItem={renderYouTubeResult}
                            contentContainerStyle={{ padding: 16 }}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}
