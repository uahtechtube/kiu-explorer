import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, MapPin, Navigation, Search, Filter, Layers, Info } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

const { width } = Dimensions.get('window');

export default function CampusMapPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<any[]>([]);

    const categories = ['All', 'Faculties', 'Lecture Halls', 'Library', 'Labs', 'Hostels', 'Sports'];

    React.useEffect(() => {
        fetchLocations();
    }, [selectedCategory]);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/school/map', {
                params: {
                    category: selectedCategory,
                    search: searchQuery
                }
            });
            setLocations(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
            setLocations([]); // Show empty state instead of mock data
        } finally {
            setLoading(false);
        }
    };

    const filteredLocations = locations.filter(loc =>
        (selectedCategory === 'All' || loc.type === selectedCategory) &&
        (loc.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Header with Search */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Campus Explorer</Text>
                        <Text className="text-white text-xl font-bold">University Map</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <Layers size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Premium Search Bar */}
                <View className="bg-white flex-row items-center px-5 h-14 rounded-2xl shadow-xl shadow-primary/20">
                    <Search size={20} color="#94A3B8" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search landmark or building..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-3 text-primary font-medium"
                    />
                </View>

                {/* Category Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-8 -mx-2">
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-full mx-2 border ${selectedCategory === cat
                                ? 'bg-secondary border-secondary'
                                : 'bg-white/10 border-white/10'
                                }`}
                        >
                            <Text className={`font-black text-[10px] uppercase ${selectedCategory === cat ? 'text-primary' : 'text-white/60'}`}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView className="flex-1 mt-4 px-6" contentContainerStyle={{ paddingBottom: 60 }}>
                {/* Visual Map Overview */}
                <PremiumCard variant="elevated" className="p-0 overflow-hidden mb-8 mt-2 h-[220px]">
                    <Image
                        source={{ uri: 'https://images.unsplash.com/photo-1576166436400-da4a1e9ce756?w=800&q=80' }}
                        className="w-full h-full opacity-90"
                        resizeMode="cover"
                    />
                    <View className="absolute inset-0 bg-primary/20" />
                    <View className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm flex-row items-center">
                        <Navigation size={16} color="#002147" />
                        <Text className="text-primary font-black text-[10px] ml-2 uppercase">Interactive View</Text>
                    </View>
                </PremiumCard>

                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-primary font-black text-xl">Directory</Text>
                    <Text className="text-secondary font-bold text-xs uppercase">{filteredLocations.length} Results</Text>
                </View>

                {filteredLocations.length > 0 ? (
                    filteredLocations.map((loc) => (
                        <PremiumCard
                            key={loc.id}
                            variant="solid"
                            className="bg-white mb-4 p-5 border-gray-100 flex-row items-center"
                        >
                            <View className="w-14 h-14 bg-primary/5 rounded-2xl items-center justify-center mr-4 border border-primary/5">
                                <MapPin size={24} color="#002147" />
                            </View>

                            <View className="flex-1">
                                <View className="flex-row items-center mb-1">
                                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mr-2">{loc.type}</Text>
                                    <View className="w-1 h-1 bg-gray-200 rounded-full" />
                                </View>
                                <Text className="text-primary font-black text-lg mb-1">{loc.name}</Text>
                                <Text className="text-gray-500 text-[10px] font-medium leading-4" numberOfLines={1}>{loc.coords}</Text>
                            </View>

                            <TouchableOpacity className="w-10 h-10 bg-secondary rounded-xl items-center justify-center shadow-lg shadow-secondary/30">
                                <Navigation size={18} color="#002147" />
                            </TouchableOpacity>
                        </PremiumCard>
                    ))
                ) : (
                    <View className="items-center justify-center py-24 opacity-30">
                        <MapPin size={48} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4">Location not found</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
