import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, FileText, Download, Bookmark, Filter, ChevronRight, Book } from 'lucide-react-native';

const RESOURCE_CATEGORIES = ['All', 'PDFs', 'Past Questions', 'E-books', 'Articles'];
const MOCK_RESOURCES = [
    { id: '1', title: 'Advanced Calculus Note', code: 'MTH 301', type: 'PDF', size: '1.2 MB', category: 'PDFs' },
    { id: '2', title: 'CSC 201 Past Questions (2023)', code: 'CSC 201', type: 'Past Question', size: '800 KB', category: 'Past Questions' },
    { id: '3', title: 'Introduction to AI E-book', code: 'CSC 411', type: 'E-book', size: '5.6 MB', category: 'E-books' },
    { id: '4', title: 'Data Structures Manual', code: 'CSC 202', type: 'PDF', size: '2.4 MB', category: 'PDFs' },
    { id: '5', title: 'Quantum Physics Article', code: 'PHY 401', type: 'Article', size: '450 KB', category: 'Articles' },
];

export default function ResourcesScreen() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredResources = MOCK_RESOURCES.filter(res =>
        (selectedCategory === 'All' || res.category === selectedCategory) &&
        (res.title.toLowerCase().includes(searchQuery.toLowerCase()) || res.code.toLowerCase().includes(searchQuery.toLowerCase()))
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
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            className={`mr-3 px-6 py-2 rounded-full ${selectedCategory === cat ? 'bg-primary' : 'bg-gray-100'}`}
                        >
                            <Text className={`font-semibold ${selectedCategory === cat ? 'text-white' : 'text-gray-500'}`}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <FlatList
                data={filteredResources}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 24 }}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        className="bg-white p-4 rounded-3xl border border-gray-100 flex-row items-center mb-4 shadow-sm"
                    >
                        <View className={`w-14 h-14 rounded-2xl items-center justify-center ${index % 2 === 0 ? 'bg-indigo-50' : 'bg-rose-50'}`}>
                            {item.type === 'Past Question' ? <Book size={24} color="#F43F5E" /> : <FileText size={24} color="#6366F1" />}
                        </View>
                        <View className="ml-4 flex-1">
                            <Text className="text-primary font-bold text-base" numberOfLines={1}>{item.title}</Text>
                            <View className="flex-row items-center mt-1">
                                <Text className="text-gray-400 text-xs font-semibold">{item.code}</Text>
                                <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                                <Text className="text-gray-400 text-xs">{item.type}</Text>
                            </View>
                            <View className="flex-row items-center mt-2">
                                <View className="bg-gray-100 px-2 py-0.5 rounded-md flex-row items-center">
                                    <Download size={10} color="#6B7280" />
                                    <Text className="text-[10px] text-gray-500 ml-1">{item.size}</Text>
                                </View>
                                <TouchableOpacity className="ml-3">
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
        </SafeAreaView>
    );
}
