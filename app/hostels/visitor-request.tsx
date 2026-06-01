import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Users, UserPlus, CheckCircle2, ShieldAlert, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import api from '../../lib/api';

interface VisitorRecord {
    id: number;
    visitor_name: string;
    visitor_phone: string;
    relationship?: string;
    purpose?: string;
    check_in?: string;
    check_out?: string;
    status: 'pre-registered' | 'active' | 'checked-out';
}

export default function VisitorPreRegistration() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [visitors, setVisitors] = useState<VisitorRecord[]>([]);
    const [activeTab, setActiveTab] = useState<'list' | 'add'>('list');

    // Form inputs
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [relationship, setRelationship] = useState('');
    const [purpose, setPurpose] = useState('');

    const fetchVisitors = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/hostels/visitors');
            setVisitors(response.data.data || []);
        } catch (error) {
            console.error('Error fetching visitors:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'list') {
            fetchVisitors();
        }
    }, [activeTab]);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchVisitors();
        setRefreshing(false);
    }, []);

    const handlePreRegister = async () => {
        if (!name || !phone) {
            Alert.alert('Incomplete Form', 'Visitor Name and Phone Number are required.');
            return;
        }

        try {
            setSubmitting(true);
            const response = await api.post('/student/hostels/visitors', {
                visitor_name: name,
                visitor_phone: phone,
                relationship,
                purpose,
            });

            if (response.data.status === 'success') {
                Alert.alert('Registered Successfully', 'Visitor pre-registered successfully!');
                setName('');
                setPhone('');
                setRelationship('');
                setPurpose('');
                setActiveTab('list');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to pre-register visitor.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-50 text-green-600';
            case 'pre-registered': return 'bg-blue-50 text-blue-600';
            case 'checked-out': return 'bg-gray-100 text-gray-500';
            default: return 'bg-gray-50 text-gray-600';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">Visitor Management</Text>
            </View>

            {/* Tabs */}
            <View className="flex-row bg-white border-b border-gray-100 p-2">
                <TouchableOpacity
                    onPress={() => setActiveTab('list')}
                    className={`flex-1 py-3 rounded-2xl items-center flex-row justify-center space-x-2 ${
                        activeTab === 'list' ? 'bg-primary' : ''
                    }`}
                >
                    <Users size={16} color={activeTab === 'list' ? 'white' : '#64748B'} />
                    <Text className={`font-bold text-sm ${activeTab === 'list' ? 'text-white' : 'text-slate-500'}`}>
                        Visitor Registry
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setActiveTab('add')}
                    className={`flex-1 py-3 rounded-2xl items-center flex-row justify-center space-x-2 ${
                        activeTab === 'add' ? 'bg-primary' : ''
                    }`}
                >
                    <UserPlus size={16} color={activeTab === 'add' ? 'white' : '#64748B'} />
                    <Text className={`font-bold text-sm ${activeTab === 'add' ? 'text-white' : 'text-slate-500'}`}>
                        Pre-Register
                    </Text>
                </TouchableOpacity>
            </View>

            {loading && !submitting ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#3B82F6" />
                </View>
            ) : activeTab === 'list' ? (
                <ScrollView
                    className="flex-1 p-6"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {visitors.length > 0 ? (
                        visitors.map((visitor) => (
                            <View
                                key={visitor.id}
                                className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6"
                            >
                                <View className="flex-row justify-between items-start mb-4">
                                    <View>
                                        <Text className="text-primary font-bold text-lg">{visitor.visitor_name}</Text>
                                        <Text className="text-gray-400 text-xs">{visitor.visitor_phone}</Text>
                                    </View>
                                    <View className={`px-3 py-1.5 rounded-full ${getStatusColor(visitor.status).split(' ')[0]}`}>
                                        <Text className={`text-[10px] font-bold uppercase ${getStatusColor(visitor.status).split(' ')[1]}`}>
                                            {visitor.status.replace('-', ' ')}
                                        </Text>
                                    </View>
                                </View>

                                {visitor.relationship ? (
                                    <View className="flex-row space-x-2 mb-2">
                                        <Text className="text-slate-400 text-xs">Relationship:</Text>
                                        <Text className="text-slate-600 text-xs font-semibold">{visitor.relationship}</Text>
                                    </View>
                                ) : null}

                                {visitor.purpose ? (
                                    <View className="mb-4">
                                        <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Purpose of Visit</Text>
                                        <Text className="text-slate-600 text-sm leading-5">{visitor.purpose}</Text>
                                    </View>
                                ) : null}

                                <View className="h-[1px] bg-slate-50 my-2" />

                                <View className="flex-row justify-between mt-2 pt-2 border-t border-slate-50">
                                    <View className="flex-row items-center">
                                        <ArrowDownLeft size={16} color={visitor.check_in ? '#10B981' : '#94A3B8'} />
                                        <Text className="text-slate-500 text-xs ml-1">
                                            In: {visitor.check_in ? new Date(visitor.check_in).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <ArrowUpRight size={16} color={visitor.check_out ? '#EF4444' : '#94A3B8'} />
                                        <Text className="text-slate-500 text-xs ml-1">
                                            Out: {visitor.check_out ? new Date(visitor.check_out).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View className="mt-20 items-center justify-center p-6 bg-white border border-gray-100 rounded-[32px]">
                            <Users size={64} color="#CBD5E1" />
                            <Text className="text-primary font-bold text-xl mt-4">Visitor Registry Empty</Text>
                            <Text className="text-gray-400 text-center mt-2 mb-6 text-sm">
                                Pre-register your friends, family, or study partners here to ensure smooth building gate security access!
                            </Text>
                            <TouchableOpacity
                                onPress={() => setActiveTab('add')}
                                className="bg-blue-50 px-8 py-4 rounded-2xl"
                            >
                                <Text className="text-blue-600 font-bold">Pre-Register Visitor</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            ) : (
                <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                    <View className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6">
                        <Text className="text-primary font-bold text-lg mb-4">Pre-Register a Visitor</Text>

                        <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Visitor's Full Name</Text>
                        <TextInput
                            placeholder="e.g. John Doe"
                            value={name}
                            onChangeText={setName}
                            className="bg-gray-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-slate-800 text-sm mb-4"
                        />

                        <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Phone Number</Text>
                        <TextInput
                            placeholder="e.g. 08123456789"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            className="bg-gray-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-slate-800 text-sm mb-4"
                        />

                        <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Relationship (Optional)</Text>
                        <TextInput
                            placeholder="e.g. Brother, Friend, Parent"
                            value={relationship}
                            onChangeText={setRelationship}
                            className="bg-gray-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-slate-800 text-sm mb-4"
                        />

                        <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Purpose of Visit (Optional)</Text>
                        <TextInput
                            placeholder="Study session, delivery, dropping items..."
                            value={purpose}
                            onChangeText={setPurpose}
                            multiline
                            numberOfLines={3}
                            className="bg-gray-50 border border-slate-100 p-4 rounded-2xl text-slate-800 text-sm mb-6 min-h-[80px]"
                        />

                        <TouchableOpacity
                            onPress={handlePreRegister}
                            disabled={submitting}
                            className="bg-primary w-full py-5 rounded-2xl items-center"
                        >
                            {submitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-base">Pre-Register Visitor</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
