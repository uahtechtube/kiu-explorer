import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Building2, Clock, CheckCircle2, XCircle, CreditCard, X } from 'lucide-react-native';
import api from '../../lib/api';

interface Booking {
    id: number;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    academic_session: string;
    booked_at: string;
    room: {
        room_number: string;
        price_per_semester: number;
        hostel: {
            name: string;
        };
    };
    payment?: {
        status: string;
        reference: string;
    };
}

export default function MyBookings() {
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [cancelling, setCancelling] = useState<number | null>(null);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/hostels/my-bookings');
            setBookings(response.data.data);
        } catch (error) {
            console.error('Error fetching bookings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchBookings();
        setRefreshing(false);
    }, []);

    const handleCancel = (id: number) => {
        Alert.alert(
            'Cancel Booking',
            'Are you sure you want to cancel this booking request?',
            [
                { text: 'No, Keep It', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setCancelling(id);
                            await api.post(`/student/hostels/bookings/${id}/cancel`);
                            Alert.alert('Cancelled', 'Your booking has been cancelled.');
                            fetchBookings();
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to cancel booking.');
                        } finally {
                            setCancelling(null);
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-50 text-green-600';
            case 'pending': return 'bg-amber-50 text-amber-600';
            case 'rejected': return 'bg-red-50 text-red-600';
            case 'cancelled': return 'bg-gray-100 text-gray-500';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 size={16} color="#10B981" />;
            case 'pending': return <Clock size={16} color="#D97706" />;
            case 'rejected': return <XCircle size={16} color="#EF4444" />;
            case 'cancelled': return <X size={16} color="#9CA3AF" />;
            default: return <Clock size={16} color="#64748B" />;
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">My Hostel Bookings</Text>
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#3B82F6" className="mt-20" />
                ) : bookings.length > 0 ? (
                    bookings.map((booking) => (
                        <View
                            key={booking.id}
                            className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6"
                        >
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1">
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                                        {booking.academic_session} Session
                                    </Text>
                                    <Text className="text-primary text-xl font-bold">{booking.room?.hostel?.name}</Text>
                                    <Text className="text-gray-500 font-medium">Room {booking.room?.room_number}</Text>
                                </View>
                                <View className={`flex-row items-center px-3 py-1.5 rounded-full ${getStatusColor(booking.status).split(' ')[0]}`}>
                                    <View className="mr-1.5">{getStatusIcon(booking.status)}</View>
                                    <Text className={`text-[10px] font-bold uppercase ${getStatusColor(booking.status).split(' ')[1]}`}>
                                        {booking.status}
                                    </Text>
                                </View>
                            </View>

                            <View className="h-[1px] bg-gray-50 my-2" />

                            <View className="flex-row justify-between items-center py-2">
                                <View>
                                    <Text className="text-gray-400 text-[10px] uppercase font-bold">Amount</Text>
                                    <Text className="text-primary font-bold text-lg">
                                        ₦{booking.room?.price_per_semester?.toLocaleString()}
                                    </Text>
                                </View>
                                {booking.status === 'approved' && !booking.payment && (
                                    <TouchableOpacity
                                        onPress={() => router.push('/payments' as any)}
                                        className="bg-blue-600 px-6 py-3 rounded-2xl flex-row items-center"
                                    >
                                        <CreditCard size={18} color="white" />
                                        <Text className="text-white font-bold ml-2">Pay Fee</Text>
                                    </TouchableOpacity>
                                )}
                                {booking.payment && (
                                    <View className="flex-row items-center bg-green-50 px-3 py-1.5 rounded-xl">
                                        <CheckCircle2 size={16} color="#10B981" />
                                        <Text className="text-green-600 font-bold ml-1.5 text-xs">Paid</Text>
                                    </View>
                                )}
                            </View>

                            {booking.status === 'pending' && (
                                <View className="mt-4 space-y-3">
                                    <View className="bg-amber-50 p-3 rounded-xl flex-row items-center">
                                        <Clock size={14} color="#D97706" />
                                        <Text className="text-amber-800 text-[10px] ml-2 flex-1">
                                            Awaiting admin approval. You'll be notified once reviewed.
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleCancel(booking.id)}
                                        disabled={cancelling === booking.id}
                                        className="bg-red-50 border border-red-100 py-3 rounded-2xl flex-row items-center justify-center mt-2"
                                    >
                                        {cancelling === booking.id ? (
                                            <ActivityIndicator size="small" color="#EF4444" />
                                        ) : (
                                            <>
                                                <X size={16} color="#EF4444" />
                                                <Text className="text-red-500 font-bold ml-2">Cancel Request</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    ))
                ) : (
                    <View className="mt-20 items-center">
                        <Building2 size={64} color="#E2E8F0" />
                        <Text className="text-gray-400 mt-4 text-center font-medium">
                            You haven't made any hostel bookings yet.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/hostels' as any)}
                            className="mt-6 bg-blue-50 px-8 py-4 rounded-2xl"
                        >
                            <Text className="text-blue-600 font-bold">Browse Hostels</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
