import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MapPin, Users, Wifi, Wind, Shield, Coffee, ChevronRight, Hammer, Sparkles, Clock, Calendar, UserPlus } from 'lucide-react-native';
import api from '../../lib/api';

interface Room {
    id: number;
    room_number: string;
    capacity: number;
    available_slots: number;
    price_per_semester: number;
    status: 'available' | 'full' | 'maintenance';
    amenities: string[];
}

interface Hostel {
    id: number;
    name: string;
    gender_type: string;
    description: string;
    image_url: string;
    campus_location: {
        name: string;
    };
    rooms: Room[];
}

export default function HostelDetail() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [hostel, setHostel] = useState<Hostel | null>(null);
    const [rules, setRules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [serviceFee, setServiceFee] = useState(5000);

    const fetchHostelDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/hostels/${id}`);
            setHostel(response.data.data);
            if (response.data.hostel_service_fee !== undefined) {
                setServiceFee(response.data.hostel_service_fee);
            }

            const rulesRes = await api.get(`/student/hostels/${id}/rules`);
            setRules(rulesRes.data.data || []);
        } catch (error) {
            console.error('Error fetching hostel details', error);
            Alert.alert('Error', 'Failed to load hostel details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHostelDetail();
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!hostel) return null;

    return (
        <View className="flex-1 bg-white">
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Banner Image */}
                <View className="relative">
                    <Image
                        source={{ uri: hostel.image_url || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop' }}
                        className="w-full h-80"
                        resizeMode="cover"
                    />
                    <SafeAreaView className="absolute top-0 left-0 right-0 p-6 flex-row justify-between" edges={['top']}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md"
                        >
                            <ChevronLeft size={24} color="white" />
                        </TouchableOpacity>
                    </SafeAreaView>
                </View>

                {/* Content */}
                <View className="px-6 -mt-10 bg-white rounded-t-[40px] pt-8">
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-primary text-3xl font-bold flex-1">{hostel.name}</Text>
                        <View className={`px-4 py-1.5 rounded-full ${hostel.gender_type === 'male' ? 'bg-blue-50' : 'bg-pink-50'
                            }`}>
                            <Text className={`text-xs font-bold uppercase ${hostel.gender_type === 'male' ? 'text-blue-600' : 'text-pink-600'
                                }`}>
                                {hostel.gender_type}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center mb-6">
                        <MapPin size={16} color="#9CA3AF" />
                        <Text className="text-gray-400 text-sm ml-1">{hostel.campus_location.name}</Text>
                    </View>

                    <Text className="text-primary text-xl font-bold mb-3">About</Text>
                    <Text className="text-gray-500 leading-6 mb-8">{hostel.description}</Text>

                    {/* Quick Services Portal Grid */}
                    <Text className="text-primary text-xl font-bold mb-4">Hostel Services</Text>
                    <View className="flex-row flex-wrap justify-between mb-8">
                        <TouchableOpacity
                            onPress={() => router.push('/hostels/attendance' as any)}
                            className="bg-white border border-gray-100 rounded-[28px] p-5 w-[48%] shadow-sm mb-4 items-center"
                        >
                            <Clock size={20} color="#3B82F6" className="mb-2" />
                            <Text className="text-primary font-bold text-xs">QR Access Check</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/hostels/roommates' as any)}
                            className="bg-white border border-gray-100 rounded-[28px] p-5 w-[48%] shadow-sm mb-4 items-center"
                        >
                            <Sparkles size={20} color="#8B5CF6" className="mb-2" />
                            <Text className="text-primary font-bold text-xs">Roommate Match</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/hostels/leave' as any)}
                            className="bg-white border border-gray-100 rounded-[28px] p-5 w-[48%] shadow-sm mb-4 items-center"
                        >
                            <Calendar size={20} color="#10B981" className="mb-2" />
                            <Text className="text-primary font-bold text-xs">Gate Passes</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/hostels/visitor-request' as any)}
                            className="bg-white border border-gray-100 rounded-[28px] p-5 w-[48%] shadow-sm mb-4 items-center"
                        >
                            <UserPlus size={20} color="#F59E0B" className="mb-2" />
                            <Text className="text-primary font-bold text-xs">Pre-Reg Visitor</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Maintenance Quick Link */}
                    <TouchableOpacity
                        onPress={() => router.push('/hostels/complaints' as any)}
                        className="bg-amber-50 border border-amber-100 p-5 rounded-3xl flex-row items-center mb-8"
                    >
                        <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center mr-4">
                            <Hammer size={24} color="#D97706" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-amber-900 font-bold">Maintenance & Repairs</Text>
                            <Text className="text-amber-700/60 text-xs text-secondary-alt">Report issues in your room</Text>
                        </View>
                        <ChevronRight size={20} color="#D97706" />
                    </TouchableOpacity>

                    <Text className="text-primary text-xl font-bold mb-4">Guidelines & Rules</Text>
                    <View className="bg-gray-50 p-6 rounded-[32px] mb-8">
                        {rules.length > 0 ? (
                            rules.map((rule, idx) => (
                                <View key={idx} className="mb-3">
                                    <View className="flex-row items-start">
                                        <View className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-3" />
                                        <Text className="text-primary font-bold text-sm flex-1">{rule.title}</Text>
                                    </View>
                                    <Text className="text-gray-500 text-xs pl-4.5 mt-0.5 leading-4">{rule.description}</Text>
                                </View>
                            ))
                        ) : (
                            [
                                "Check-in time: Mon - Fri, 8AM - 4PM",
                                "Visitors are only allowed in common rooms",
                                "Noise levels must be kept low after 10PM",
                                "Cooking is only permitted in designated kitchen areas",
                                "Keep the environment clean at all times"
                            ].map((rule, idx) => (
                                <View key={idx} className="flex-row items-start mb-3">
                                    <View className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 mr-3" />
                                    <Text className="text-gray-600 text-sm flex-1">{rule}</Text>
                                </View>
                            ))
                        )}
                    </View>

                    <Text className="text-primary text-xl font-bold mb-4">Common Amenities</Text>
                    <View className="flex-row flex-wrap mb-8">
                        {[
                            { icon: Wifi, label: 'High Speed WiFi' },
                            { icon: Shield, label: '24/7 Security' },
                            { icon: Wind, label: 'Well Ventilated' },
                            { icon: Coffee, label: 'Student Lounge' },
                        ].map((item, i) => (
                            <View key={i} className="flex-row items-center bg-gray-50 px-4 py-2 rounded-2xl mr-3 mb-3">
                                <item.icon size={16} color="#3B82F6" />
                                <Text className="text-gray-600 text-xs font-semibold ml-2">{item.label}</Text>
                            </View>
                        ))}
                    </View>

                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-primary text-xl font-bold">Available Rooms</Text>
                        <Text className="text-blue-500 font-bold text-sm">Select one to book</Text>
                    </View>

                    {hostel.rooms.length > 0 ? (
                        hostel.rooms.map((room) => (
                            <TouchableOpacity
                                key={room.id}
                                onPress={() => router.push({
                                    pathname: '/hostels/book',
                                    params: { roomId: room.id, hostelName: hostel.name, roomNumber: room.room_number, price: room.price_per_semester, serviceFee: serviceFee }
                                } as any)}
                                className="bg-white border border-gray-100 rounded-[28px] p-5 mb-4 shadow-sm flex-row items-center"
                            >
                                <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                                    <Text className="text-blue-600 font-bold text-lg">{room.room_number}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-primary font-bold text-base">Room {room.room_number}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <Users size={14} color="#9CA3AF" />
                                        <Text className="text-gray-400 text-xs ml-1">{room.available_slots}/{room.capacity} slots left</Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="text-primary font-bold text-base">₦{room.price_per_semester.toLocaleString()}</Text>
                                    <Text className="text-gray-400 text-[10px]">Per Semester</Text>
                                </View>
                                <ChevronRight size={20} color="#E2E8F0" className="ml-2" />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View className="py-10 items-center">
                            <Text className="text-gray-400 font-medium">No rooms currently available in this hostel.</Text>
                        </View>
                    )}

                    <View className="h-20" />
                </View>
            </ScrollView>
        </View>
    );
}
