import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Play, Calendar, Clock, Download, FileText, ChevronLeft } from 'lucide-react-native';
import api from '../../lib/api';

interface RecordedClass {
    id: number;
    title: string;
    course_code: string;
    lecturer_name: string;
    recorded_at: string;
    duration: number;
    views: number;
    thumbnail_url?: string;
    recording_url: string;
    materials_count: number;
}

export default function RecordedClassesPage() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [recordings, setRecordings] = useState<RecordedClass[]>([]);
    const [filter, setFilter] = useState<'all' | 'recent' | 'popular'>('all');

    const fetchRecordings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/virtual-classes/recorded', {
                params: { filter }
            });
            setRecordings(response.data.data || []);
        } catch (error) {
            console.error('Error fetching recordings:', error);
            setRecordings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecordings();
    }, [filter]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchRecordings();
        setRefreshing(false);
    }, [filter]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const handlePlayRecording = (recording: RecordedClass) => {
        router.push(`/classes/${recording.id}`);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white text-3xl font-bold">Recorded Classes</Text>
                        <Text className="text-gray-300 text-sm mt-1">Watch previous class sessions</Text>
                    </View>
                </View>

                {/* Filter Chips */}
                <View className="flex-row space-x-2">
                    {[
                        { key: 'all', label: 'All' },
                        { key: 'recent', label: 'Recent' },
                        { key: 'popular', label: 'Popular' },
                    ].map((item) => (
                        <TouchableOpacity
                            key={item.key}
                            onPress={() => setFilter(item.key as any)}
                            className={`px-4 py-2 rounded-full ${filter === item.key ? 'bg-secondary' : 'bg-white/20'
                                }`}
                        >
                            <Text
                                className={`text-sm font-semibold ${filter === item.key ? 'text-primary' : 'text-white'
                                    }`}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Recordings List */}
            <ScrollView
                className="flex-1 px-6 pt-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#002147" />
                        <Text className="text-gray-500 mt-4">Loading recordings...</Text>
                    </View>
                ) : recordings.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <Play size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-lg font-semibold mt-4">No recordings found</Text>
                        <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                            Recorded classes will appear here after sessions end
                        </Text>
                    </View>
                ) : (
                    recordings.map((recording) => (
                        <TouchableOpacity
                            key={recording.id}
                            onPress={() => handlePlayRecording(recording)}
                            className="bg-white rounded-3xl overflow-hidden mb-4 shadow-sm border border-gray-100"
                        >
                            {/* Thumbnail */}
                            <View className="h-48 bg-gray-800 items-center justify-center relative">
                                <Play size={48} color="#FFFFFF" fill="#FFFFFF" opacity={0.9} />

                                {/* Duration Badge */}
                                <View className="absolute bottom-3 right-3 bg-black/80 px-2 py-1 rounded-lg">
                                    <Text className="text-white text-xs font-bold">
                                        {formatDuration(recording.duration)}
                                    </Text>
                                </View>

                                {/* Views Badge */}
                                <View className="absolute top-3 right-3 bg-black/80 px-2 py-1 rounded-lg">
                                    <Text className="text-white text-xs">{recording.views} views</Text>
                                </View>
                            </View>

                            {/* Info */}
                            <View className="p-5">
                                <Text className="text-primary text-lg font-bold mb-1" numberOfLines={2}>
                                    {recording.title}
                                </Text>
                                <Text className="text-gray-500 text-sm mb-3">{recording.course_code}</Text>

                                {/* Lecturer */}
                                <View className="flex-row items-center mb-3">
                                    <View className="w-8 h-8 bg-blue-100 rounded-full items-center justify-center">
                                        <Text className="text-blue-600 font-bold text-xs">
                                            {recording.lecturer_name.charAt(0)}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-700 text-sm ml-2">{recording.lecturer_name}</Text>
                                </View>

                                {/* Meta Info */}
                                <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
                                    <View className="flex-row items-center">
                                        <Calendar size={16} color="#6B7280" />
                                        <Text className="text-gray-600 text-xs ml-1.5">
                                            {formatDate(recording.recorded_at)}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <FileText size={16} color="#6B7280" />
                                        <Text className="text-gray-600 text-xs ml-1.5">
                                            {recording.materials_count} materials
                                        </Text>
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                <View className="flex-row mt-4 space-x-2">
                                    <TouchableOpacity
                                        onPress={() => handlePlayRecording(recording)}
                                        className="flex-1 bg-primary py-3 rounded-2xl items-center flex-row justify-center"
                                    >
                                        <Play size={16} color="#FFFFFF" />
                                        <Text className="text-white font-bold ml-2">Watch</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => router.push(`/classes/materials/${recording.id}`)}
                                        className="bg-gray-100 px-4 py-3 rounded-2xl items-center justify-center"
                                    >
                                        <Download size={20} color="#002147" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}

                <View className="h-6" />
            </ScrollView>
        </SafeAreaView>
    );
}
