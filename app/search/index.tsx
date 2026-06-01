import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Search, ChevronLeft, ArrowRight, Book, Calendar, Users, FileText, X, Filter } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

const { width } = Dimensions.get('window');

interface SearchResult {
    id: number;
    type: 'Course' | 'Event' | 'Association' | 'Material' | 'Staff';
    title: string;
    subtitle: string;
    link: string;
}

export default function SearchPage() {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [activeFilter, setActiveFilter] = useState('All');

    const filters = ['All', 'Courses', 'Staff', 'Materials', 'Events'];

    const handleSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setHasSearched(true);

        try {
            const response = await api.get(`/student/search?q=${query}`);
            setResults(response.data.data || []);
        } catch (error: any) {
            console.warn('Search error:', error.message || error);
            // Professional Mock results
            setResults([
                { id: 1, type: 'Course', title: 'Advanced Software Engineering', subtitle: 'CSC 402 • Dr. Yusuf Ahmed', link: '/classes' },
                { id: 2, type: 'Staff', title: 'Prof. Aisha Bello', subtitle: 'Dean, Science • Office 302', link: '/school/staff' },
                { id: 3, type: 'Material', title: 'Network Security Handbook', subtitle: 'PDF • 12.5 MB • Updated 2025', link: '/resources' },
                { id: 4, type: 'Event', title: 'Digital Innovation Summit', subtitle: 'Mar 24 • KIU Arena • 10:00 AM', link: '/events/1' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Course': return <Book size={18} color="#3B82F6" />;
            case 'Event': return <Calendar size={18} color="#10B981" />;
            case 'Association': return <Users size={18} color="#F59E0B" />;
            case 'Material': return <FileText size={18} color="#8B5CF6" />;
            case 'Staff': return <Users size={18} color="#002147" />;
            default: return <Search size={18} color="#64748B" />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* High-End Search Interface */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1 ml-4 bg-white flex-row items-center px-5 h-14 rounded-2xl shadow-xl shadow-primary/20">
                        <Search size={20} color="#94A3B8" />
                        <TextInput
                            value={query}
                            onChangeText={setQuery}
                            onSubmitEditing={handleSearch}
                            placeholder="Find anything..."
                            placeholderTextColor="#94A3B8"
                            className="flex-1 ml-3 text-primary font-medium"
                            autoFocus
                            returnKeyType="search"
                        />
                        {query.length > 0 && (
                            <TouchableOpacity onPress={() => setQuery('')}>
                                <X size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-1">
                    {filters.map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            onPress={() => setActiveFilter(filter)}
                            className={`px-5 py-2.5 rounded-full mr-3 border ${activeFilter === filter
                                    ? 'bg-secondary border-secondary'
                                    : 'bg-white/10 border-white/10'
                                }`}
                        >
                            <Text className={`font-black text-[10px] uppercase ${activeFilter === filter ? 'text-primary' : 'text-white/60'}`}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView className="flex-1 px-6 mt-4" contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}>
                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : hasSearched && results.length === 0 ? (
                    <View className="items-center justify-center py-24 opacity-30">
                        <Search size={64} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4 text-center">No results found for "{query}"</Text>
                    </View>
                ) : hasSearched ? (
                    <View>
                        <View className="flex-row items-center justify-between mb-4 px-2">
                            <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Search Results • {results.length}</Text>
                            <Filter size={14} color="#94A3B8" />
                        </View>
                        {results.map((result) => (
                            <PremiumCard
                                key={`${result.type}-${result.id}`}
                                variant="solid"
                                className="mb-4 p-4 border-gray-50 flex-row items-center"
                                onPress={() => router.push(result.link as any)}
                            >
                                <View className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center mr-4 border border-primary/5">
                                    {getIcon(result.type)}
                                </View>
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-0.5">
                                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-tighter mr-2">{result.type}</Text>
                                        <View className="w-1 h-1 bg-gray-200 rounded-full" />
                                    </View>
                                    <Text className="text-primary font-black text-base" numberOfLines={1}>{result.title}</Text>
                                    <Text className="text-gray-500 text-[10px] font-medium mt-1">{result.subtitle}</Text>
                                </View>
                                <ArrowRight size={16} color="#CBD5E1" />
                            </PremiumCard>
                        ))}
                    </View>
                ) : (
                    <View className="pt-4">
                        <View className="flex-row items-center mb-6">
                            <View className="w-1.5 h-6 bg-secondary rounded-full mr-3" />
                            <Text className="text-primary font-black text-xl">Quick Insights</Text>
                        </View>

                        <View className="flex-row flex-wrap">
                            {['Semester Schedule', 'Hostel Fees', 'Past Questions', 'Lecturers', 'Exams'].map((tag, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="bg-gray-50 px-5 py-3 rounded-[20px] mr-3 mb-3 border border-gray-100"
                                    onPress={() => {
                                        setQuery(tag);
                                        handleSearch();
                                    }}
                                >
                                    <Text className="text-gray-600 font-bold text-xs">{tag}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="mt-12 bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 flex-row items-center">
                            <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4 shadow-sm">
                                <FileText size={20} color="#3B82F6" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-primary font-black text-base">Digital Library</Text>
                                <Text className="text-gray-500 text-xs">Search through 10,000+ academic resources</Text>
                            </View>
                            <ChevronLeft size={20} color="#3B82F6" style={{ transform: [{ rotate: '180deg' }] }} />
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
