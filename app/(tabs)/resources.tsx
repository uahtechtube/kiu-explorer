import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, FileText, Download, Bookmark, Filter, ChevronRight, Book } from 'lucide-react-native';
import api from '../../lib/api';

const RESOURCE_CATEGORIES = [
    { label: 'All', value: 'All' },
    { label: 'Textbooks', value: 'textbook' },
    { label: 'Journals', value: 'journal' },
    { label: 'Past Questions', value: 'past_question' },
    { label: 'References', value: 'reference' },
    { label: 'Other', value: 'other' }
];

export default function ResourcesScreen() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [resources, setResources] = useState<any[]>([]);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            setLoading(true);
            const response = await api.get('/library');
            // Safely parse paginated response or list array
            const data = response.data.data || response.data || [];
            setResources(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredResources = resources.filter(res =>
        (selectedCategory === 'All' || res.category === selectedCategory) &&
        (res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
         (res.course_code && res.course_code.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 pt-4 pb-6 border-b border-gray-100">
                <Text className="text-2xl font-bold text-primary">Academic Library</Text>
                <Text className="text-gray-400 text-sm mt-1">Access notes, books and past questions</Text>

                {/* Search */}
                <View className="mt-6 bg-gray-50 flex-row items-center px-4 h-12 rounded-2xl border border-gray-100">
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-3 text-primary"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <TouchableOpacity className="p-2">
                        <Filter size={18} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-6 flex-row">
                    {RESOURCE_CATEGORIES.map((cat) => (
                        <TouchableOpacity
                            key={cat.value}
                            onPress={() => setSelectedCategory(cat.value)}
                            className={`mr-3 px-6 py-2 rounded-full ${selectedCategory === cat.value ? 'bg-primary' : 'bg-gray-100'}`}
                        >
                            <Text className={`font-semibold ${selectedCategory === cat.value ? 'text-white' : 'text-gray-500'}`}>{cat.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#002147" />
                    <Text className="mt-2 text-gray-400 font-medium">Scanning catalog...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredResources}
                    keyExtractor={(item) => String(item.id)}
                    contentContainerStyle={{ padding: 24 }}
                    renderItem={({ item, index }) => (
                        <TouchableOpacity
                            onPress={() => router.push(`/library/${item.id}`)}
                            className="bg-white p-4 rounded-3xl border border-gray-100 flex-row items-center mb-4 shadow-sm"
                        >
                            <View className={`w-14 h-14 rounded-2xl items-center justify-center ${index % 2 === 0 ? 'bg-indigo-50' : 'bg-rose-50'}`}>
                                {item.category === 'past_question' ? <Book size={24} color="#F43F5E" /> : <FileText size={24} color="#6366F1" />}
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-primary font-bold text-base" numberOfLines={1}>{item.title}</Text>
                                <View className="flex-row items-center mt-1">
                                    <Text className="text-gray-400 text-xs font-semibold">{item.course_code || 'GEN'}</Text>
                                    <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                                    <Text className="text-gray-400 text-xs">{item.category?.replace('_', ' ')}</Text>
                                </View>
                                <View className="flex-row items-center mt-2">
                                    <View className="bg-gray-100 px-2 py-0.5 rounded-md flex-row items-center">
                                        <Download size={10} color="#6B7280" />
                                        <Text className="text-[10px] text-gray-500 ml-1">
                                            {item.file_size ? `${(item.file_size / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity 
                                        onPress={() => Alert.alert('Bookmarked', `"${item.title}" has been saved to your academic workspace.`)}
                                        className="ml-3"
                                    >
                                        <Bookmark size={14} color="#9CA3AF" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <ChevronRight size={20} color="#E5E7EB" />
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <View className="py-20 items-center">
                            <Book size={64} color="#E5E7EB" />
                            <Text className="text-gray-400 mt-4 text-base italic">No resources found</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
