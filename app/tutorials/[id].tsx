import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, Share2, BookOpen, Clock, Eye, User, Play } from 'lucide-react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import YouTubePlayer from '../../components/shared/YouTubePlayer';

const { width } = Dimensions.get('window');

interface Tutorial {
    id: number;
    title: string;
    description?: string;
    file_path?: string;
    file_type?: string;
    source_type: 'file' | 'youtube';
    youtube_video_id?: string;
    thumbnail?: string;
    url?: string;
    category: string;
    duration: string;
    views: string | number;
    lecturer: { name: string };
    course?: { code: string; title: string };
    created_at: string;
}

export default function TutorialDetailPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [tutorial, setTutorial] = useState<Tutorial | null>(null);
    const [relatedTutorials, setRelatedTutorials] = useState<Tutorial[]>([]);

    useEffect(() => {
        fetchTutorial();
    }, [id]);

    const fetchTutorial = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/tutorials/${id}`);
            const data = response.data.data || response.data;
            setTutorial(data);

            // Fetch related tutorials (same course)
            const relatedResponse = await api.get('/tutorials', {
                params: { course_id: data.course?.id }
            });
            const related = (relatedResponse.data.data || relatedResponse.data || [])
                .filter((t: Tutorial) => t.id !== parseInt(id as string))
                .slice(0, 3);
            setRelatedTutorials(related);
        } catch (error) {
            console.error('Error fetching tutorial:', error);
            Alert.alert('Error', 'Failed to load tutorial');
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        Alert.alert('Share Tutorial', 'Share functionality will be implemented with native share API.', [{ text: 'OK' }]);
    };

    const isYoutube = tutorial?.source_type === 'youtube';
    const isFileVideo = tutorial && !isYoutube && tutorial.file_type === 'video';

    // Initialize video player unconditionally at the top level
    const player = useVideoPlayer(isFileVideo ? (tutorial?.url || '') : '', p => {
        p.loop = false;
    });

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
                <Text className="mt-4 text-gray-400">Loading tutorial...</Text>
            </SafeAreaView>
        );
    }

    if (!tutorial) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <BookOpen size={64} color="#D1D5DB" />
                <Text className="mt-4 text-gray-500 font-bold">Tutorial not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-primary px-6 py-3 rounded-2xl">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 pt-4 pb-3 flex-row items-center justify-between border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
                >
                    <ChevronLeft size={24} color="#002147" />
                </TouchableOpacity>
                <View className="flex-row">
                    <TouchableOpacity
                        onPress={handleShare}
                        className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center"
                    >
                        <Share2 size={18} color="#002147" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Video / Embed Area */}
                {isYoutube && tutorial.youtube_video_id ? (
                    <YouTubePlayer
                        videoId={tutorial.youtube_video_id}
                        title={tutorial.title}
                        channelTitle={tutorial.description}
                    />
                ) : isFileVideo ? (
                    <View className="bg-black" style={{ height: width * 0.5625 }}>
                        <VideoView
                            player={player}
                            style={{ width: '100%', height: '100%' }}
                            fullscreenOptions={{ showFullscreenButton: true } as any}
                            allowsPictureInPicture
                            nativeControls
                        />
                    </View>
                ) : (
                    /* Document / PDF */
                    <View className="bg-gray-50 items-center justify-center" style={{ height: width * 0.5625 }}>
                        <BookOpen size={64} color="#002147" />
                        <Text className="text-primary font-bold mt-4">Document Tutorial</Text>
                        <Text className="text-gray-400 text-sm mt-1">{(tutorial.file_type || 'FILE').toUpperCase()}</Text>
                    </View>
                )}

                {/* Tutorial Info */}
                <View className="px-6 pt-6">
                    {/* Source Badge */}
                    <View className="flex-row items-center mb-3">
                        {isYoutube ? (
                            <View className="bg-red-50 px-3 py-1 rounded-full mr-2">
                                <Text className="text-red-600 font-bold text-xs uppercase">▶ YouTube</Text>
                            </View>
                        ) : null}
                        <View className="bg-primary/10 px-3 py-1 rounded-full">
                            <Text className="text-primary font-bold text-xs uppercase">{tutorial.category}</Text>
                        </View>
                        {tutorial.course && (
                            <Text className="text-gray-400 text-xs ml-3">{tutorial.course.code}</Text>
                        )}
                    </View>

                    {/* Title */}
                    <Text className="text-primary text-2xl font-bold mb-4">{tutorial.title}</Text>

                    {/* Stats */}
                    <View className="flex-row items-center mb-6">
                        <View className="flex-row items-center mr-4">
                            <Clock size={16} color="#6B7280" />
                            <Text className="text-gray-500 text-sm ml-1.5">{tutorial.duration}</Text>
                        </View>
                        <View className="flex-row items-center mr-4">
                            <Eye size={16} color="#6B7280" />
                            <Text className="text-gray-500 text-sm ml-1.5">{tutorial.views} views</Text>
                        </View>
                        <View className="flex-row items-center">
                            <User size={16} color="#6B7280" />
                            <Text className="text-gray-500 text-sm ml-1.5">{tutorial.lecturer.name}</Text>
                        </View>
                    </View>

                    {/* Description */}
                    {tutorial.description && (
                        <View className="mb-6">
                            <Text className="text-primary font-bold text-lg mb-2">About</Text>
                            <Text className="text-gray-600 leading-6">{tutorial.description}</Text>
                        </View>
                    )}

                    {/* Course Info */}
                    {tutorial.course && (
                        <PremiumCard variant="solid" className="mb-6 p-5">
                            <View className="flex-row items-center">
                                <View className="w-12 h-12 bg-primary/10 rounded-2xl items-center justify-center mr-4">
                                    <BookOpen size={24} color="#002147" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-xs font-bold uppercase">Course</Text>
                                    <Text className="text-primary font-bold text-base mt-1">{tutorial.course.title}</Text>
                                    <Text className="text-gray-500 text-sm">{tutorial.course.code}</Text>
                                </View>
                            </View>
                        </PremiumCard>
                    )}

                    {/* Related Tutorials */}
                    {relatedTutorials.length > 0 && (
                        <View className="mb-8">
                            <Text className="text-primary font-bold text-lg mb-4">Related Tutorials</Text>
                            {relatedTutorials.map((related) => (
                                <TouchableOpacity
                                    key={related.id}
                                    onPress={() => router.push(`/tutorials/${related.id}` as any)}
                                    className="bg-gray-50 rounded-2xl mb-3 flex-row items-center overflow-hidden"
                                    style={{ borderWidth: 1, borderColor: '#f3f4f6' }}
                                >
                                    {/* Thumbnail */}
                                    <View style={{ width: 72, height: 56, backgroundColor: '#111827' }}>
                                        {related.source_type === 'youtube' && related.youtube_video_id ? (
                                            <Image
                                                source={{ uri: `https://img.youtube.com/vi/${related.youtube_video_id}/mqdefault.jpg` }}
                                                style={{ width: '100%', height: '100%' }}
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View className="flex-1 items-center justify-center">
                                                <Play size={20} color="#6b7280" />
                                            </View>
                                        )}
                                    </View>
                                    <View className="flex-1 p-3">
                                        <Text className="text-primary font-bold text-sm" numberOfLines={2}>
                                            {related.title}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            <Clock size={12} color="#9CA3AF" />
                                            <Text className="text-gray-400 text-xs ml-1">{related.duration}</Text>
                                            <Text className="text-gray-300 mx-2">•</Text>
                                            <Text className="text-gray-400 text-xs">{related.views} views</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
