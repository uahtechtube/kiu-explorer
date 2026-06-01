import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Home, MapPin, Users, ArrowRight, Filter, ChevronRight } from 'lucide-react-native';
import api from '../../lib/api';

interface Hostel {
    id: number;
    name: string;
    gender_type: 'male' | 'female' | 'mixed';
    description: string;
    image_url: string;
    campus_location: {
        name: string;
    };
    rooms_count?: number;
}

export default function HostelListing() {
    const router = useRouter();
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');

    const fetchHostels = async () => {
        try {
            setLoading(true);
            const endpoint = selectedGender === 'all'
                ? '/student/hostels'
                : `/student/hostels?gender_type=${selectedGender}`;
            const response = await api.get(endpoint);
            setHostels(response.data.data);
        } catch (error) {
            console.error('Error fetching hostels', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHostels();
    }, [selectedGender]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchHostels();
        setRefreshing(false);
    }, [selectedGender]);

    const filteredHostels = hostels.filter(h =>
        h.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 pt-4 pb-4 border-b border-gray-100 flex-row justify-between items-center bg-white shadow-sm">
                <View>
                    <Text className="text-primary text-2xl font-bold">Hostels</Text>
                    <Text className="text-gray-400 text-sm">Find your perfect home on campus</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/hostels/my-bookings' as any)}
                    className="bg-blue-50 px-4 py-2 rounded-2xl"
                >
                    <Text className="text-blue-600 font-semibold text-xs">My Booking</Text>
                </TouchableOpacity>
            </View>

            {/* Search & Filter */}
            <View className="px-6 py-4 bg-gray-50/50">
                <View className="bg-white flex-row items-center px-4 h-12 rounded-2xl border border-gray-100 shadow-sm mb-4">
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-2 text-primary"
                        placeholder="Search hostels..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View className="flex-row space-x-2">
                    {['all', 'male', 'female'].map((gender) => (
                        <TouchableOpacity
                            key={gender}
                            onPress={() => setSelectedGender(gender as any)}
                            className={`px-6 py-2 rounded-2xl ${selectedGender === gender ? 'bg-primary' : 'bg-white border border-gray-100'
                                }`}
                        >
                            <Text className={`text-sm font-semibold capitalize ${selectedGender === gender ? 'text-white' : 'text-gray-500'
                                }`}>
                                {gender}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6"
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                <View className="py-6">
                    {loading && !refreshing ? (
                        <ActivityIndicator size="large" color="#3B82F6" className="mt-20" />
                    ) : filteredHostels.length > 0 ? (
                        filteredHostels.map((hostel) => (
                            <TouchableOpacity
                                key={hostel.id}
                                onPress={() => router.push(`/hostels/${hostel.id}` as any)}
                                className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-sm mb-6"
                            >
                                <Image
                                    source={{ uri: hostel.image_url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop' }}
                                    className="w-full h-48"
                                    resizeMode="cover"
                                />
                                <View className="p-5">
                                    <View className="flex-row justify-between items-start mb-2">
                                        <Text className="text-primary text-xl font-bold flex-1">{hostel.name}</Text>
                                        <View className={`px-3 py-1 rounded-full ${hostel.gender_type === 'male' ? 'bg-blue-50' : 'bg-pink-50'
                                            }`}>
                                            <Text className={`text-[10px] font-bold uppercase ${hostel.gender_type === 'male' ? 'text-blue-600' : 'text-pink-600'
                                                }`}>
                                                {hostel.gender_type}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center mb-4">
                                        <MapPin size={14} color="#9CA3AF" />
                                        <Text className="text-gray-400 text-xs ml-1">{hostel.campus_location.name}</Text>
                                    </View>

                                    <View className="flex-row justify-between items-center mt-2 pt-4 border-t border-gray-50">
                                        <View className="flex-row items-center">
                                            <Users size={16} color="#64748B" />
                                            <Text className="text-slate-500 text-xs ml-1">Available Rooms</Text>
                                        </View>
                                        <View className="flex-row items-center bg-blue-50/50 px-3 py-1 rounded-xl">
                                            <Text className="text-blue-600 font-bold text-sm">View Rooms</Text>
                                            <ChevronRight size={16} color="#3B82F6" />
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View className="mt-20 items-center">
                            <Home size={64} color="#E2E8F0" />
                            <Text className="text-gray-400 mt-4 text-center">No hostels found.</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
