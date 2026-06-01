import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
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

export default function HostelPaymentsAdmin() {
    const router = useRouter();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

    // Offline Verification State
    const [verifyingId, setVerifyingId] = useState<number | null>(null);
    const [amountConfirmed, setAmountConfirmed] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'finxchange' | 'manual'>('bank_transfer');

    const fetchPayments = async () => {
        try {
            setLoading(true);
            // Fetch hostel-specific payments
            const response = await api.get('/admin/finance/payments', {
                params: {
                    type: 'hostel'
                }
            });
            setPayments(response.data.data.data || []);
        } catch (error) {
            console.error('Error fetching hostel payments:', error);
            Alert.alert('Error', 'Failed to fetch hostel payment records.');
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
            Alert.alert('Success', 'Hostel payment manually verified.');
            setVerifyingId(null);
            setAmountConfirmed('');
            fetchPayments();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to verify payment.');
        }
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'paid': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' };
            case 'pending': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
            case 'failed': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' };
            default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100' };
        }
    };

    // Filter payments based on search and status
    const filteredPayments = payments.filter(payment => {
        const studentName = `${payment.student?.first_name ?? ''} ${payment.student?.surname ?? ''}`.toLowerCase();
        const matric = (payment.student?.matric_number ?? '').toLowerCase();
        const ref = payment.reference.toLowerCase();
        
        const matchesSearch = studentName.includes(searchQuery.toLowerCase()) || 
                              matric.includes(searchQuery.toLowerCase()) || 
                              ref.includes(searchQuery.toLowerCase());
                              
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-primary text-xl font-bold">Hostel Payments</Text>
                    <Text className="text-slate-400 text-[10px] font-bold uppercase mt-0.5">Kashim Ibrahim University</Text>
                </View>
            </View>

            {/* Search and Filters */}
            <View className="bg-white px-6 pb-4 pt-2 shadow-sm border-b border-gray-100">
                <View className="bg-gray-50 flex-row items-center rounded-2xl px-4 py-3 border border-gray-100 mb-3">
                    <Search size={18} color="#94A3B8" />
                    <TextInput
                        className="flex-1 ml-3 text-primary font-bold text-sm"
                        placeholder="Search student name, matric, reference..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                        autoCapitalize="none"
                    />
                </View>

                {/* Filter Tabs */}
                <View className="flex-row space-x-2">
                    {(['all', 'paid', 'pending'] as const).map((status) => (
                        <TouchableOpacity
                            key={status}
                            onPress={() => setStatusFilter(status)}
                            className={`px-4 py-2.5 rounded-xl border flex-1 items-center justify-center ${
                                statusFilter === status 
                                ? 'bg-primary border-primary' 
                                : 'bg-gray-50 border-gray-100'
                            }`}
                        >
                            <Text className={`text-xs font-bold uppercase tracking-wider ${
                                statusFilter === status ? 'text-white' : 'text-gray-500'
                            }`}>
                                {status === 'all' ? 'All' : status === 'paid' ? 'Paid' : 'Unpaid'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                showsVerticalScrollIndicator={false}
            >
                {loading && !refreshing ? (
                    <View className="mt-20 items-center justify-center">
                        <ActivityIndicator size="large" color="#002147" />
                        <Text className="text-gray-400 text-xs font-bold mt-4">Retrieving hostel payments...</Text>
                    </View>
                ) : filteredPayments.length === 0 ? (
                    <View className="mt-20 items-center justify-center">
                        <FileText size={48} color="#CBD5E1" className="mb-4" />
                        <Text className="text-gray-400 font-bold text-sm text-center">No matching payment records found.</Text>
                        <Text className="text-gray-400 text-[10px] text-center mt-1">Try refining your search or filter criteria.</Text>
                    </View>
                ) : (
                    filteredPayments.map((payment) => {
                        const statusMeta = getStatusColor(payment.status);
                        
                        return (
                            <View key={payment.id} className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6">
                                <View className="flex-row justify-between items-start mb-4">
                                    <View>
                                        <Text className="text-primary font-black text-xl">₦{Number(payment.amount).toLocaleString()}</Text>
                                        <Text className="text-gray-400 text-[9px] font-black uppercase mt-1">Ref: {payment.reference}</Text>
                                    </View>
                                    <View className={`px-4 py-1.5 rounded-full border ${statusMeta.bg} ${statusMeta.border}`}>
                                        <Text className={`text-[9px] font-black uppercase tracking-wider ${statusMeta.text}`}>
                                            {payment.status === 'pending' ? 'UNPAID' : payment.status.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                                    <Text className="text-primary font-bold text-sm mb-1">
                                        {payment.student?.first_name} {payment.student?.surname}
                                    </Text>
                                    <Text className="text-gray-500 text-xs font-bold mb-2">{payment.student?.matric_number ?? 'N/A'}</Text>
                                    
                                    <View className="flex-row justify-between items-center border-t border-gray-200/50 pt-3 mt-2">
                                        <Text className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">Hostel Levy</Text>
                                        <Text className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">{payment.payment_method || 'PENDING GATEWAY'}</Text>
                                    </View>
                                </View>

                                {payment.status === 'pending' && (
                                    <View>
                                        {verifyingId === payment.id ? (
                                            <View className="bg-blue-50/30 p-4 rounded-2xl border border-blue-100">
                                                <Text className="text-blue-800 font-bold text-xs mb-2">Verify Offline / Cash Payment</Text>
                                                <TextInput
                                                    className="bg-white px-4 h-12 rounded-xl border border-blue-100 text-primary text-sm font-bold mb-3"
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
                                                            className={`px-3 py-2.5 rounded-lg border flex-1 items-center justify-center ${
                                                                paymentMethod === method 
                                                                ? 'bg-blue-100 border-blue-200' 
                                                                : 'bg-white border-gray-200'
                                                            }`}
                                                        >
                                                            <Text className={`text-[9px] font-black uppercase ${
                                                                paymentMethod === method ? 'text-blue-700' : 'text-gray-500'
                                                            }`}>
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
                                                className="bg-blue-50 py-3.5 rounded-xl flex-row items-center justify-center border border-blue-100"
                                            >
                                                <Check size={16} color="#2563EB" />
                                                <Text className="text-blue-600 font-bold ml-2">Manually Verify Paid</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                )}
                            </View>
                        );
                    })
                )}
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
}
