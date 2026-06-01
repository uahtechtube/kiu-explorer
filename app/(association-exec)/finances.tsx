import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    Modal,
    RefreshControl,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
    ChevronLeft,
    DollarSign,
    Users,
    TrendingUp,
    FileText,
    Plus,
    Check,
    CreditCard
} from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

const financeStorage = {
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
    },
    setItem: async (key: string, value: string) => {
        if (Platform.OS === 'web') {
            localStorage.setItem(key, value);
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    }
};

interface Payment {
    id: number;
    student_name: string;
    matric_number: string;
    amount: number;
    fee_type: string;
    paid_at: string;
    reference: string;
}

export default function AssociationExecFinances() {
    const { associationId, associationName } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Dues stats
    const [totalCollected, setTotalCollected] = useState(0);
    const [activeMembersCount, setActiveMembersCount] = useState(0);
    const [recentPayments, setRecentPayments] = useState<Payment[]>([]);

    // Manual Payment Modal States
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [studentName, setStudentName] = useState('');
    const [matricNumber, setMatricNumber] = useState('');
    const [amount, setAmount] = useState('');
    const [feeType, setFeeType] = useState('Annual Association Dues');
    const [isSaving, setIsSaving] = useState(false);

    const fetchFinancialData = async () => {
        try {
            setLoading(true);

            // Fetch active members count to sync
            const membersResponse = await api.get(`/student/associations/${associationId}/members`);
            const totalMembers = membersResponse.data.data?.length || 0;
            setActiveMembersCount(totalMembers);

            // Load financial stats from SecureStore / localStorage
            const storedFinances = await financeStorage.getItem(`association_finances_${associationId}`);
            if (storedFinances) {
                const parsed = JSON.parse(storedFinances);
                setRecentPayments(parsed.recentPayments || []);
                setTotalCollected(parsed.totalCollected || 0);
            } else {
                setRecentPayments([]);
                setTotalCollected(0);
            }
        } catch (error) {
            console.log('Error fetching financials:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancialData();
    }, [associationId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFinancialData();
        setRefreshing(false);
    };

    const handleRecordPayment = async () => {
        if (!studentName.trim() || !matricNumber.trim() || !amount.trim()) {
            Alert.alert('Validation Error', 'Please complete all required fields');
            return;
        }

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Validation Error', 'Please enter a valid payment amount');
            return;
        }

        setIsSaving(true);
        try {
            const newPayment: Payment = {
                id: Date.now(),
                student_name: studentName,
                matric_number: matricNumber,
                amount: numAmount,
                fee_type: feeType,
                paid_at: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                reference: 'REF-MANUAL-' + Math.floor(10000 + Math.random() * 90000)
            };

            const updatedPayments = [newPayment, ...recentPayments];
            const updatedTotal = totalCollected + numAmount;

            // Persist the transaction ledger securely
            await financeStorage.setItem(`association_finances_${associationId}`, JSON.stringify({
                totalCollected: updatedTotal,
                recentPayments: updatedPayments
            }));

            setRecentPayments(updatedPayments);
            setTotalCollected(updatedTotal);
            setStudentName('');
            setMatricNumber('');
            setAmount('');
            setPaymentModalVisible(false);
            Alert.alert('Success', 'Manual cash payment recorded successfully!');
        } catch (err) {
            console.error('Error saving manual payment:', err);
            Alert.alert('Error', 'Failed to save payment record. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                        <ChevronLeft size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Financial Center</Text>
                    <View className="w-10" />
                </View>

                <View className="mt-8">
                    <Text className="text-yellow-400 text-xs font-bold uppercase mb-1">Financial Console</Text>
                    <Text className="text-white text-xl font-bold" numberOfLines={1}>{associationName}</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 -mt-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Dues Stats Row */}
                <View className="flex-row justify-between mt-2 mb-6">
                    <View className="bg-white p-5 rounded-3xl w-[48%] shadow-sm border border-gray-100 items-center">
                        <View className="w-10 h-10 bg-green-50 rounded-xl items-center justify-center mb-3">
                            <TrendingUp size={18} color="#10B981" />
                        </View>
                        <Text className="text-gray-400 text-[9px] uppercase font-bold text-center">Total Balance</Text>
                        <Text className="text-primary font-black text-sm mt-1" numberOfLines={1}>
                            ₦{totalCollected.toLocaleString()}
                        </Text>
                    </View>

                    <View className="bg-white p-5 rounded-3xl w-[48%] shadow-sm border border-gray-100 items-center">
                        <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mb-3">
                            <Users size={18} color="#3B82F6" />
                        </View>
                        <Text className="text-gray-400 text-[9px] uppercase font-bold text-center">Paying Members</Text>
                        <Text className="text-primary font-black text-sm mt-1">{activeMembersCount}</Text>
                    </View>
                </View>

                {/* Record Button */}
                <TouchableOpacity
                    onPress={() => setPaymentModalVisible(true)}
                    className="bg-primary py-4 rounded-[24px] items-center flex-row justify-center mb-6 shadow-lg shadow-primary/20"
                >
                    <Plus size={20} color="white" />
                    <Text className="text-white font-black ml-2 text-sm uppercase tracking-wider">Record Cash Payment</Text>
                </TouchableOpacity>

                {/* Ledger Listing */}
                <Text className="text-primary font-bold text-lg mb-4">Transaction Ledger</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : recentPayments.length > 0 ? (
                    recentPayments.map((p) => (
                        <PremiumCard key={p.id} variant="solid" className="mb-3 p-4 bg-white border-gray-100 flex-row items-center justify-between">
                            <View className="flex-1 mr-3">
                                <View className="flex-row items-center">
                                    <Text className="text-primary font-bold text-sm">{p.student_name}</Text>
                                    {p.reference.includes('MANUAL') && (
                                        <View className="bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded ml-2">
                                            <Text className="text-orange-600 text-[7px] font-black">CASH</Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-gray-400 text-[10px] mt-0.5">{p.matric_number} • {p.paid_at}</Text>
                                <Text className="text-gray-500 text-xs mt-1 font-semibold">{p.fee_type}</Text>
                            </View>

                            <View className="items-end">
                                <Text className="text-green-600 font-extrabold text-sm">+₦{p.amount.toLocaleString()}</Text>
                                <Text className="text-gray-400 text-[8px] mt-1">{p.reference}</Text>
                            </View>
                        </PremiumCard>
                    ))
                ) : (
                    <View className="bg-white rounded-3xl p-8 items-center border border-gray-100">
                        <DollarSign size={32} color="#CBD5E1" />
                        <Text className="text-gray-400 mt-2 font-bold">No transactions found</Text>
                    </View>
                )}
            </ScrollView>

            {/* Record Payment Modal */}
            <Modal visible={paymentModalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] h-[85%] p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-primary">Record Cash Payment</Text>
                            <TouchableOpacity
                                onPress={() => setPaymentModalVisible(false)}
                                className="bg-gray-100 p-2 rounded-full"
                            >
                                <Text className="text-gray-500 font-bold text-xs">Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                            <View className="space-y-4 mb-6">
                                <View>
                                    <Text className="text-primary font-bold text-xs uppercase mb-2 ml-1">Student Name</Text>
                                    <TextInput
                                        value={studentName}
                                        onChangeText={setStudentName}
                                        placeholder="e.g. Musa Ibrahim"
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary text-sm"
                                    />
                                </View>

                                <View>
                                    <Text className="text-primary font-bold text-xs uppercase mb-2 ml-1">Matric Number</Text>
                                    <TextInput
                                        value={matricNumber}
                                        onChangeText={setMatricNumber}
                                        placeholder="e.g. KIU/CSC/22/1004"
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary text-sm"
                                    />
                                </View>

                                <View>
                                    <Text className="text-primary font-bold text-xs uppercase mb-2 ml-1">Fee Type</Text>
                                    <TextInput
                                        value={feeType}
                                        onChangeText={setFeeType}
                                        placeholder="Annual Association Dues"
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary text-sm"
                                    />
                                </View>

                                <View>
                                    <Text className="text-primary font-bold text-xs uppercase mb-2 ml-1">Amount (₦)</Text>
                                    <TextInput
                                        value={amount}
                                        onChangeText={setAmount}
                                        placeholder="5000"
                                        keyboardType="numeric"
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary text-sm"
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleRecordPayment}
                                disabled={isSaving}
                                className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 mb-8"
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white text-base font-bold mr-2">Save Receipt Record</Text>
                                        <Check size={20} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
