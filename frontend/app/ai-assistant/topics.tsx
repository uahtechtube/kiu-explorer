import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Search, ChevronRight, Bookmark, Sparkles, ChevronLeft } from 'lucide-react-native';
import api from '../../lib/api';

interface Topic {
    id: number;
    title: string;
    course: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    saved: boolean;
}

export default function AIStudyTopicsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('All');
    const [topics, setTopics] = useState<Topic[]>([]);

    const courses = ['All', 'CSC 401', 'CSC 301', 'CSC 402', 'MTH 201'];

    useEffect(() => {
        fetchTopics();
    }, []);

    const fetchTopics = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/ai-assistant/topics');
            setTopics(response.data.topics || []);
        } catch (error) {
            console.error('Error fetching topics:', error);
            setTopics([]);
        } finally {
            setLoading(false);
        }
    };

    const handleTopicPress = (topic: Topic) => {
        // Navigate to chat with context
        router.push({
            pathname: '/ai-assistant',
            params: { initialQuery: `Explain ${topic.title} in detail.` }
        });
    };

    const filteredTopics = topics.filter(topic => {
        const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCourse = selectedCourse === 'All' || topic.course === selectedCourse;
        return matchesSearch && matchesCourse;
    });

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Beginner': return '#10B981';
            case 'Intermediate': return '#F59E0B';
            case 'Advanced': return '#EF4444';
            default: return '#6B7280';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white text-3xl font-bold">Study Topics</Text>
                        <Text className="text-gray-300 text-sm mt-1">Master your courses with AI</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="bg-white/10 flex-row items-center px-4 h-12 rounded-2xl">
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search topics..."
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-3 text-white"
                    />
                </View>
            </View>

            {/* Course Filter */}
            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="px-6 py-4"
                >
                    {courses.map((course) => (
                        <TouchableOpacity
                            key={course}
                            onPress={() => setSelectedCourse(course)}
                            className={`px-4 py-2 rounded-full mr-2 ${selectedCourse === course ? 'bg-primary' : 'bg-white border border-gray-200'
                                }`}
                        >
                            <Text className={`font-semibold ${selectedCourse === course ? 'text-white' : 'text-gray-600'
                                }`}>
                                {course}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Topics List */}
            <ScrollView className="flex-1 px-6">
                {loading ? (
                    <View className="items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#002147" />
                    </View>
                ) : filteredTopics.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <BookOpen size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-lg font-semibold mt-4">No topics found</Text>
                    </View>
                ) : (
                    filteredTopics.map((topic) => (
                        <TouchableOpacity
                            key={topic.id}
                            onPress={() => handleTopicPress(topic)}
                            className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
                        >
                            <View className="flex-row justify-between items-start mb-2">
                                <View className="bg-blue-50 px-3 py-1 rounded-lg">
                                    <Text className="text-blue-600 text-xs font-bold">{topic.course}</Text>
                                </View>
                                {topic.saved && <Bookmark size={20} color="#F59E0B" fill="#F59E0B" />}
                            </View>

                            <Text className="text-primary text-lg font-bold mb-2">{topic.title}</Text>
                            <Text className="text-gray-500 text-sm mb-4 leading-5">{topic.description}</Text>

                            <View className="flex-row items-center justify-between border-t border-gray-100 pt-4">
                                <View className="flex-row items-center">
                                    <View
                                        className="w-2 h-2 rounded-full mr-2"
                                        style={{ backgroundColor: getDifficultyColor(topic.difficulty) }}
                                    />
                                    <Text className="text-gray-600 text-xs font-semibold">{topic.difficulty}</Text>
                                </View>

                                <View className="flex-row items-center text-primary">
                                    <Text className="text-primary font-bold text-sm mr-1">Study now</Text>
                                    <Sparkles size={16} color="#002147" />
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
