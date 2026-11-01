import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, DollarSign, Search, Check, Clock, FileText } from 'lucide-react-native';
import api from '../../../lib/api';

interface Payment {
    id: number;
    reference: string;
    amount: number;
    status: 'pending' | 'paid' | 'failed';
    type: string;
    payment_method: string;
    created_at: string;
    student: {
        id: number;
        surname: string;
        first_name: string;
        matric_number: string;
    };
}

export default function FinancePayments() {
    const router = useRouter();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Verification state
    const [verifyingId, setVerifyingId] = useState<number | null>(null);
    const [amountConfirmed, setAmountConfirmed] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'finxchange' | 'manual'>('bank_transfer');

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/finance/payments');
            // Assuming response is paginated: response.data.data.data
            setPayments(response.data.data.data || []);
        } catch (error) {
            console.error('Error fetching payments:', error);
            Alert.alert('Error', 'Failed to fetch payment records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchPayments();
        setRefreshing(false);
    };

    const handleVerify = async (payment: Payment) => {
        if (!amountConfirmed || isNaN(Number(amountConfirmed))) {
            Alert.alert('Invalid Amount', 'Please enter a valid numeric amount confirmed.');
            return;
        }

        try {
            await api.post(`/admin/finance/payments/${payment.reference}/verify`, {
                amount_confirmed: Number(amountConfirmed),
                payment_method: paymentMethod,
            });
            Alert.alert('Success', 'Payment verified successfully.');
            setVerifyingId(null);
            setAmountConfirmed('');
            fetchPayments();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to verify payment.');
        }
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'paid': return { bg: 'bg-green-50', text: 'text-green-600' };
            case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-600' };
            case 'failed': return { bg: 'bg-red-50', text: 'text-red-600' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-600' };
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-50">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ChevronLeft size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text className="text-primary text-xl font-bold">Finance Log</Text>
                </View>
                <TouchableOpacity className="bg-primary/5 w-10 h-10 rounded-full items-center justify-center">
                    <Search size={20} color="#3B82F6" />
                </TouchableOpacity>
            </View>

            <ScrollView 
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#3B82F6" className="mt-20" />
                ) : payments.length === 0 ? (
                    <View className="mt-20 items-center">
                        <FileText size={64} color="#E2E8F0" />
                        <Text className="text-gray-400 mt-4 text-center">No payment records found.</Text>
                    </View>
                ) : (
                    payments.map((payment) => {
                        const statusMeta = getStatusColor(payment.status);
                        
                        return (
                            <View key={payment.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6">
                                <View className="flex-row justify-between items-start mb-4">
                                    <View>
                                        <Text className="text-primary font-bold text-lg">₦{Number(payment.amount).toLocaleString()}</Text>
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase mt-1">Ref: {payment.reference}</Text>
                                    </View>
                                    <View className={`px-3 py-1 rounded-full ${statusMeta.bg}`}>
                                        <Text className={`text-[10px] font-bold uppercase ${statusMeta.text}`}>
                                            {payment.status}
                                        </Text>
                                    </View>
                                </View>

                                <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                                    <Text className="text-primary font-bold text-sm mb-1">
                                        {payment.student?.first_name} {payment.student?.surname}
                                    </Text>
                                    <Text className="text-gray-500 text-xs mb-2">{payment.student?.matric_number}</Text>
                                    
                                    <View className="flex-row justify-between items-center border-t border-gray-200 pt-2 mt-2">
                                        <Text className="text-gray-400 text-xs uppercase">{payment.type.replace('_', ' ')}</Text>
                                        <Text className="text-gray-400 text-xs uppercase">{payment.payment_method || 'Unknown'}</Text>
                                    </View>
                                </View>

                                {payment.status === 'pending' && (
                                    <View>
                                        {verifyingId === payment.id ? (
                                            <View className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                                <Text className="text-blue-800 font-bold text-xs mb-2">Verify Payment Offline</Text>
                                                <TextInput
                                                    className="bg-white px-3 h-10 rounded-xl border border-blue-100 text-primary text-sm mb-3"
                                                    placeholder="Amount Confirmed (₦)"
                                                    keyboardType="numeric"
                                                    value={amountConfirmed}
                                                    onChangeText={setAmountConfirmed}
                                                />
                                                <View className="flex-row space-x-2 mb-3">
                                                    {(['bank_transfer', 'finxchange', 'manual'] as const).map(method => (
                                                        <TouchableOpacity
                                                            key={method}
                                                            onPress={() => setPaymentMethod(method)}
                                                            className={`px-3 py-2 rounded-lg border ${paymentMethod === method ? 'bg-blue-100 border-blue-200' : 'bg-white border-gray-200'}`}
                                                        >
                                                            <Text className={`text-[10px] font-bold uppercase ${paymentMethod === method ? 'text-blue-700' : 'text-gray-500'}`}>
                                                                {method.replace('_', ' ')}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                                <View className="flex-row space-x-2">
                                                    <TouchableOpacity 
                                                        onPress={() => setVerifyingId(null)}
                                                        className="flex-1 py-3 rounded-xl items-center bg-gray-200"
                                                    >
                                                        <Text className="text-gray-600 font-bold text-xs">Cancel</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity 
                                                        onPress={() => handleVerify(payment)}
                                                        className="flex-1 py-3 rounded-xl items-center bg-blue-600"
                                                    >
                                                        <Text className="text-white font-bold text-xs">Confirm</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        ) : (
                                            <TouchableOpacity 
                                                onPress={() => { setVerifyingId(payment.id); setAmountConfirmed(payment.amount.toString()); }}
                                                className="bg-blue-50 py-3 rounded-xl flex-row items-center justify-center border border-blue-100"
                                            >
                                                <Check size={16} color="#2563EB" />
                                                <Text className="text-blue-600 font-bold ml-2">Manually Verify</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
                <View className="h-10" />
            </ScrollView>
        </SafeAreaView>
    );
}
