import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Check, X, Clock, User, Home as House } from 'lucide-react-native';
import api from '../../../lib/api';

interface Booking {
    id: number;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    academic_session: string;
    student: {
        id: number;
        name: string;
        matric_number: string;
    };
    room: {
        room_number: string;
        hostel: {
            name: string;
        };
        beds?: {
            bed_number: string;
            student_id: number;
        }[];
    };
}

export default function AdminBookings() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/hostels/bookings');
            setBookings(response.data.data);
        } catch (error) {
            console.error('Error fetching admin bookings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleAction = async (id: number, action: 'approve' | 'reject' | 'evict') => {
        try {
            await api.post(`/admin/hostels/bookings/${id}/${action}`);
            Alert.alert('Success', `Student ${action}ed successfully.`);
            fetchBookings();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || `Failed to ${action}.`);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">Manage Bookings</Text>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {
                    setRefreshing(true);
                    fetchBookings().then(() => setRefreshing(false));
                }} />}
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
                ) : bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <View key={booking.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6">
                            <View className="flex-row justify-between items-start mb-4">
                                <View>
                                    <Text className="text-primary font-bold text-lg">{booking.student.name}</Text>
                                    <Text className="text-gray-400 text-xs">{booking.student.matric_number}</Text>
                                </View>
                                <View className={`px-3 py-1 rounded-full ${booking.status === 'pending' ? 'bg-amber-50' : booking.status === 'approved' ? 'bg-green-50' : 'bg-red-50'
                                    }`}>
                                    <Text className={`text-[10px] font-bold uppercase ${booking.status === 'pending' ? 'text-amber-600' : booking.status === 'approved' ? 'text-green-600' : 'text-red-600'
                                        }`}>{booking.status}</Text>
                                </View>
                            </View>

                            <View className="bg-gray-50 p-4 rounded-2xl mb-4">
                                <View className="flex-row items-center mb-2">
                                    <House size={14} color="#64748B" />
                                    <Text className="text-slate-600 text-sm ml-2 font-semibold">{booking.room.hostel.name}</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Clock size={14} color="#64748B" />
                                    <Text className="text-slate-500 text-xs ml-2">Room {booking.room.room_number} • {booking.academic_session}</Text>
                                </View>
                                {booking.status === 'approved' && booking.room.beds && (
                                    <View className="flex-row items-center mt-2 pt-2 border-t border-gray-200">
                                        <Text className="text-slate-600 text-xs font-bold">Assigned Bed: </Text>
                                        <Text className="text-primary text-xs font-bold ml-1">
                                            {booking.room.beds.find(b => b.student_id === booking.student.id)?.bed_number || 'Unknown'}
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {booking.status === 'pending' && (
                                <View className="flex-row space-x-3">
                                    <TouchableOpacity
                                        onPress={() => handleAction(booking.id, 'reject')}
                                        className="flex-1 bg-red-50 py-3 rounded-xl flex-row items-center justify-center border border-red-100"
                                    >
                                        <X size={18} color="#EF4444" />
                                        <Text className="text-red-500 font-bold ml-2">Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleAction(booking.id, 'approve')}
                                        className="flex-1 bg-green-600 py-3 rounded-xl flex-row items-center justify-center"
                                    >
                                        <Check size={18} color="white" />
                                        <Text className="text-white font-bold ml-2">Approve</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {booking.status === 'approved' && (
                                <View className="flex-row space-x-3">
                                    <TouchableOpacity
                                        onPress={() => Alert.alert('Evict Student', 'Are you sure you want to end this allocation and evict the student? This frees up the bed immediately.', [
                                            { text: 'Cancel', style: 'cancel' },
                                            { text: 'Evict', style: 'destructive', onPress: () => handleAction(booking.id, 'evict') }
                                        ])}
                                        className="flex-1 bg-rose-50 py-3 rounded-xl flex-row items-center justify-center border border-rose-100"
                                    >
                                        <X size={18} color="#E11D48" />
                                        <Text className="text-rose-600 font-bold ml-2">Evict / End Allocation</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))
                ) : (
                    <View className="mt-20 items-center">
                        <Clock size={64} color="#E2E8F0" />
                        <Text className="text-gray-400 mt-4">No pending bookings.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
