import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, CreditCard, Download, CheckCircle } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface Transaction {
    id: string;
    title: string;
    amount: number;
    status: 'Paid';
    date: string;
    type: 'Tuition' | 'Hostel' | 'Library' | 'Other';
}

export default function PaymentsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            
            // Only fetch Paid/Successful transactions from the backend to exclude any pending attempts
            const response = await api.get('/student/payments', {
                params: { status: 'paid' }
            });
            
            // Ensure we strictly list only Paid records (filter on frontend as an additional layer of security)
            const paidTransactions = (response.data.data || []).filter((txn: any) => 
                txn.status?.toLowerCase() === 'paid'
            );
            
            setTransactions(paidTransactions);
        } catch (error) {
            console.error('Error fetching payments:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₦${amount.toLocaleString()}`;
    };

    const handleDownloadReceipt = async (reference: string) => {
        try {
            const SecureStore = await import('expo-secure-store');
            const token = await SecureStore.getItemAsync('token');

            if (!token) {
                Alert.alert('Error', 'Please log in to download receipt.');
                return;
            }

            const baseUrl = (api.defaults.baseURL || '').replace('/api', '');
            const receiptUrl = `${baseUrl}/payments/${reference}/receipt?token=${encodeURIComponent(token)}`;
            
            await Linking.openURL(receiptUrl);
        } catch (error) {
            console.error('Receipt download error:', error);
            Alert.alert('Error', 'Failed to retrieve your digital receipt.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* High-End Header */}
            <View className="bg-primary px-6 pt-6 pb-10 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center flex-1 mr-12">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Financial Portal</Text>
                        <Text className="text-white text-xl font-bold">Payment History</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 mt-6 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="flex-row items-center justify-between mb-6">
                    <Text className="text-primary font-black text-xl">Official Receipts</Text>
                    <TouchableOpacity onPress={fetchPayments}>
                        <Text className="text-blue-500 font-bold text-xs uppercase">Refresh</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : transactions.length === 0 ? (
                    <View className="items-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <CreditCard size={48} color="#CBD5E1" strokeWidth={1} />
                        <Text className="text-gray-400 font-bold mt-4">No successful payments found</Text>
                    </View>
                ) : (
                    transactions.map((txn) => (
                        <PremiumCard
                            key={txn.id}
                            variant="elevated"
                            className="mb-4 p-5 flex-row justify-between items-center"
                        >
                            <View className="flex-1 mr-4">
                                <View className="flex-row items-center mb-2">
                                    <View className="w-2 h-2 rounded-full mr-2 bg-emerald-500" />
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{txn.type}</Text>
                                </View>
                                <Text className="text-primary font-bold text-base mb-1" numberOfLines={1}>{txn.title}</Text>
                                <Text className="text-gray-400 text-[10px] font-medium">Ref: {txn.id} • {new Date(txn.date).toLocaleDateString()}</Text>
                            </View>

                            <View className="items-end">
                                <Text className="text-primary font-black text-xl mb-2">{formatCurrency(txn.amount)}</Text>
                                <TouchableOpacity 
                                    onPress={() => handleDownloadReceipt(txn.id)}
                                    className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100"
                                >
                                    <Download size={14} color="#64748B" />
                                    <Text className="text-gray-500 text-[10px] font-bold ml-1.5 uppercase">Receipt</Text>
                                </TouchableOpacity>
                            </View>
                        </PremiumCard>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
