import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, BookOpen, Video, FileText, ChevronRight, Filter } from 'lucide-react-native';

const CATEGORIES = ['All', 'Software', 'Computing', 'Engineering', 'Science'];
const FEATURED_TUTORIALS = [
    { id: '1', title: 'Data Structures & Algorithms', coach: 'Dr. Sarah', views: '2.4k', duration: '15:20', thumbnail: '#3B82F6' },
    { id: '2', title: 'Modern Web Architectures', coach: 'Prof. John', views: '1.8k', duration: '22:45', thumbnail: '#F59E0B' },
];

export default function TutorialsScreen() {
    const [selectedCategory, setSelectedCategory] = useState('All');

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-6 pt-4 pb-6 border-b border-gray-100">
                <Text className="text-2xl font-bold text-primary">Learn & Explore</Text>
                <Text className="text-gray-400 text-sm mt-1">Master your courses with video guides</Text>

                {/* Search */}
                <View className="mt-6 bg-gray-50 flex-row items-center px-4 h-12 rounded-2xl border border-gray-100">
                    <Search size={20} color="#9CA3AF" />
                    <TextInput className="flex-1 ml-3 text-primary" placeholder="Search video tutorials..." />
                    <TouchableOpacity className="p-2">
                        <Filter size={18} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-6 flex-row">
                    {CATEGORIES.map((cat) => (
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

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Featured / Top Tutorials */}
                <View className="mt-6">
                    <View className="flex-row justify-between items-center px-6 mb-4">
                        <Text className="text-primary text-xl font-bold">Top Tutorials</Text>
                        <TouchableOpacity><Text className="text-primary font-semibold text-sm">See All</Text></TouchableOpacity>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pl-6">
                        {FEATURED_TUTORIALS.map((item) => (
                            <TouchableOpacity key={item.id} className="mr-6 w-72">
                                <View style={{ backgroundColor: item.thumbnail }} className="h-44 rounded-[32px] items-center justify-center shadow-lg shadow-blue-200">
                                    <View className="bg-white/20 w-16 h-16 rounded-full items-center justify-center">
                                        <Video size={32} color="white" />
                                    </View>
                                    <View className="absolute bottom-4 right-4 bg-black/40 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-[10px] font-bold">{item.duration}</Text>
                                    </View>
                                </View>
                                <View className="mt-4">
                                    <Text className="text-primary font-bold text-lg" numberOfLines={1}>{item.title}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Text className="text-gray-400 text-xs">By {item.coach}</Text>
                                        <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                                        <Text className="text-gray-400 text-xs">{item.views} views</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Recent Tutorials */}
                <View className="px-6 mt-10">
                    <Text className="text-primary text-xl font-bold mb-4">Recent Additions</Text>
                    {[1, 2, 3, 4].map((_, i) => (
                        <TouchableOpacity key={i} className="bg-white p-3 rounded-[28px] border border-gray-50 flex-row items-center mb-4 shadow-sm">
                            <View className="w-20 h-20 bg-gray-100 rounded-2xl items-center justify-center">
                                <Video size={28} color="#6B7280" />
                            </View>
                            <View className="ml-4 flex-1">
                                <Text className="text-primary font-bold text-base" numberOfLines={1}>Advanced React Patterns</Text>
                                <Text className="text-gray-400 text-xs mt-1">Dr. Michael • 45 mins</Text>
                                <View className="flex-row items-center mt-2">
                                    <View className="bg-green-50 px-2 py-0.5 rounded-md">
                                        <Text className="text-[10px] text-green-600 font-bold uppercase">New</Text>
                                    </View>
                                </View>
                            </View>
                            <ChevronRight size={20} color="#E5E7EB" />
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
