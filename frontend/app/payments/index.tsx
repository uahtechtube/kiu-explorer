import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, CreditCard, Download, Clock, CheckCircle, AlertTriangle, Filter, ChevronRight } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

interface Transaction {
    id: string;
    title: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Failed';
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
            const response = await api.get('/student/payments');
            setTransactions(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
            setTransactions([]); // Show empty state instead of mock data
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₦${amount.toLocaleString()}`;
    };

    const handlePay = () => {
        Alert.alert('Secure Payment', 'Initializing secure payment gateway... (Paystack Integration Pending)');
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* High-End Header & Balance */}
            <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Financial Portal</Text>
                        <Text className="text-white text-xl font-bold">Accounts & Fees</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <Filter size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Glass Balance Card */}
                <PremiumCard variant="glass" className="p-8 border-white/10">
                    <View className="flex-row justify-between items-start mb-4">
                        <View>
                            <Text className="text-white/60 text-xs font-bold uppercase tracking-tighter mb-1">Total Outstanding</Text>
                            <Text className="text-white text-4xl font-black">{formatCurrency(12500)}</Text>
                        </View>
                        <View className="bg-white/10 p-3 rounded-2xl border border-white/10">
                            <CreditCard size={28} color="#FFD700" />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handlePay}
                        className="bg-secondary h-16 rounded-2xl items-center flex-row justify-center shadow-xl shadow-secondary/20"
                    >
                        <Text className="text-primary font-black text-lg">PROCEED TO PAY</Text>
                        <ChevronRight size={20} color="#002147" className="ml-2" />
                    </TouchableOpacity>
                </PremiumCard>
            </View>

            <ScrollView className="flex-1 -mt-10 px-6" contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-primary font-black text-xl">Payment History</Text>
                    <Text className="text-secondary font-bold text-xs uppercase">View All</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : (
                    transactions.map((txn) => (
                        <PremiumCard
                            key={txn.id}
                            variant="elevated"
                            className="mb-4 p-5 flex-row justify-between items-center"
                        >
                            <View className="flex-1 mr-4">
                                <View className="flex-row items-center mb-2">
                                    <View className={`w-2 h-2 rounded-full mr-2 ${txn.status === 'Paid' ? 'bg-emerald-500' : txn.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                                        }`} />
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{txn.type}</Text>
                                </View>
                                <Text className="text-primary font-bold text-base mb-1" numberOfLines={1}>{txn.title}</Text>
                                <Text className="text-gray-400 text-[10px] font-medium">Ref: {txn.id} • {new Date(txn.date).toLocaleDateString()}</Text>
                            </View>

                            <View className="items-end">
                                <Text className="text-primary font-black text-xl mb-2">{formatCurrency(txn.amount)}</Text>
                                {txn.status === 'Paid' ? (
                                    <TouchableOpacity className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                        <Download size={14} color="#64748B" />
                                        <Text className="text-gray-500 text-[10px] font-bold ml-1.5 uppercase">Receipt</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <View className="bg-gray-50 px-3 py-1.5 rounded-xl">
                                        <Text className={`text-[10px] font-black uppercase ${txn.status === 'Pending' ? 'text-amber-600' : 'text-rose-600'
                                            }`}>{txn.status}</Text>
                                    </View>
                                )}
                            </View>
                        </PremiumCard>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
