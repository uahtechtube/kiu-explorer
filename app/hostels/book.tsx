import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, CheckCircle2, CreditCard, Info, ArrowRight } from 'lucide-react-native';
import api from '../../lib/api';

export default function HostelBooking() {
    const { roomId, hostelName, roomNumber, price, serviceFee } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
    const [academicSession, setAcademicSession] = useState<string | null>(null);
    const [sessionLoading, setSessionLoading] = useState(true);

    const fee = Number(serviceFee) || 5000;
    const totalAmount = Number(price) + fee;

    useEffect(() => {
        const fetchActiveSession = async () => {
            try {
                const response = await api.get('/academic-sessions');
                const sessions: any[] = response.data.data || response.data || [];
                // Find the active/current session, or fall back to the most recent one
                const active = sessions.find((s: any) => s.is_current) || sessions[sessions.length - 1];
                if (active) {
                    setAcademicSession(active.name || active.session || active.year);
                }
            } catch (error) {
                console.error('Error fetching academic session:', error);
            } finally {
                setSessionLoading(false);
            }
        };
        fetchActiveSession();
    }, []);

    const handleBooking = async () => {
        if (!academicSession) {
            Alert.alert('Please Wait', 'Academic session is still loading. Please try again.');
            return;
        }
        try {
            setLoading(true);

            // Generate Expo app deep link dynamically
            const redirectUrl = Linking.createURL('/hostels/my-bookings');

            // 1. Initiate Payment Transaction on Backend
            const payRes = await api.post('/student/payments/initiate', {
                amount: totalAmount,
                type: 'hostel',
                description: `Hostel Accommodation Fee - Room ${roomNumber} at ${hostelName}`,
            });

            if (!payRes.data.data?.reference || !payRes.data.data?.authorization_url) {
                Alert.alert('Error', 'Failed to initialize payment gateway.');
                return;
            }

            const { reference, authorization_url } = payRes.data.data;
            const finalAuthUrl = authorization_url.includes('?')
                ? `${authorization_url}&redirect_url=${encodeURIComponent(redirectUrl)}`
                : `${authorization_url}?redirect_url=${encodeURIComponent(redirectUrl)}`;
            setCheckoutUrl(finalAuthUrl);

            // 2. Submit Hostel Booking Request Linked to Payment Reference
            const response = await api.post('/student/hostels/book', {
                hostel_room_id: roomId,
                academic_session: academicSession,
                payment_reference: reference,
            });

            if (response.data.status === 'success') {
                // 3. Open Checkout Gateway in Web Browser
                await Linking.openURL(finalAuthUrl);
                setSuccess(true);
            }
        } catch (error: any) {
            console.error('Error booking hostel', error);
            const message = error.response?.data?.message || 'Failed to submit booking request.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
                <View className="bg-blue-50 p-6 rounded-full mb-6">
                    <CheckCircle2 size={64} color="#3B82F6" />
                </View>
                <Text className="text-primary text-3xl font-bold text-center mb-3">Redirected to Paystack</Text>
                <Text className="text-gray-500 text-center leading-6 mb-10">
                    We've opened the secure Paystack checkout portal in your browser.
                    Once authorized, your booking will be auto-approved and bed allocated instantly!
                </Text>
                <TouchableOpacity
                    onPress={() => router.push('/hostels/my-bookings' as any)}
                    className="bg-primary w-full py-5 rounded-[24px] items-center mb-4"
                >
                    <Text className="text-white font-bold text-lg">Go to My Bookings</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        if (checkoutUrl) {
                            Linking.openURL(checkoutUrl);
                        }
                    }}
                    className="bg-gray-50 border border-gray-100 w-full py-5 rounded-[24px] items-center"
                >
                    <Text className="text-primary font-bold text-base">Reopen Checkout Gateway</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">Confirm Booking</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
                <View className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 mb-8">
                    <Text className="text-blue-900/50 font-bold text-xs uppercase mb-1">Accommodation Details</Text>
                    <Text className="text-primary text-2xl font-bold mb-4">{hostelName}</Text>

                    <View className="flex-row space-x-10">
                        <View>
                            <Text className="text-gray-400 text-[10px] uppercase font-bold">Room</Text>
                            <Text className="text-primary font-bold text-lg"># {roomNumber}</Text>
                        </View>
                        <View>
                            <Text className="text-gray-400 text-[10px] uppercase font-bold">Session</Text>
                            {sessionLoading ? (
                                <ActivityIndicator size="small" color="#002147" />
                            ) : (
                                <Text className="text-primary font-bold text-lg">{academicSession ?? 'N/A'}</Text>
                            )}
                        </View>
                    </View>
                </View>

                <Text className="text-primary text-xl font-bold mb-4">Payment Summary</Text>
                <View className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-8">
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-500">Hostel Fee</Text>
                        <Text className="text-primary font-semibold">₦{Number(price).toLocaleString()}</Text>
                    </View>
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-gray-500">Service Charge</Text>
                        <Text className="text-primary font-semibold">₦{Number(fee).toLocaleString()}</Text>
                    </View>
                    <View className="h-[1px] bg-gray-50 my-2" />
                    <View className="flex-row justify-between pt-2">
                        <Text className="text-primary font-bold text-lg">Total Amount</Text>
                        <Text className="text-blue-600 font-bold text-lg">₦{Number(totalAmount).toLocaleString()}</Text>
                    </View>
                </View>

                <View className="bg-blue-50 p-4 rounded-2xl flex-row border border-blue-100 mb-10">
                    <Info size={20} color="#3B82F6" />
                    <Text className="text-blue-800 text-xs ml-3 flex-1 leading-4">
                        Note: Tap "Pay Hostel Fee" to securely proceed to Paystack checkout. 
                        Upon successful authorization, your room bed allocation will be completed instantly!
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={handleBooking}
                    disabled={loading}
                    className={`w-full py-5 rounded-[24px] flex-row items-center justify-center ${loading ? 'bg-gray-200' : 'bg-primary'
                        }`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Text className="text-white font-bold text-lg mr-2">Pay Hostel Fee</Text>
                            <ArrowRight size={20} color="white" />
                        </>
                    )}
                </TouchableOpacity>

                <Text className="text-center text-gray-400 text-xs mt-6 mb-10">
                    Secure transaction powered by SchoolPay & Paystack
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}
