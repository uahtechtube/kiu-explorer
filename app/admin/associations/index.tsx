import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Users, Trash2, ArrowRight, ShieldAlert, BookOpen } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface Association {
    id: number;
    name: string;
    acronym: string;
    category: string;
    description: string;
    logo_url?: string;
    members_count: number;
}

export default function AdminAssociationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [associations, setAssociations] = useState<Association[]>([]);

    const fetchAssociations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/associations');
            setAssociations(response.data.data || []);
        } catch (error) {
            console.error('Error fetching associations for admin:', error);
            setAssociations([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssociations();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchAssociations();
        setRefreshing(false);
    }, []);

    const handleDisbandAssociation = (id: number, acronym: string) => {
        Alert.alert(
            '⚠️ System Override',
            `Are you absolutely sure you want to permanently disband and delete ${acronym}? This system administration action is irreversible.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disband & Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/student/associations/${id}`);
                            Alert.alert('Success', `${acronym} has been dissolved and deleted.`);
                            fetchAssociations();
                        } catch (error: any) {
                            console.error('Admin delete error:', error);
                            Alert.alert('Error', error.response?.data?.message || 'Could not disband association.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Admin Command Header */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20 mr-4"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest">Global Governance</Text>
                        <Text className="text-white text-xl font-bold">Associations Oversight</Text>
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 mt-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-primary font-black text-lg">Active Coalitions Matrix ({associations.length})</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : associations.length > 0 ? (
                    associations.map((assoc) => (
                        <PremiumCard
                            key={assoc.id}
                            variant="elevated"
                            className="bg-white mb-4 p-5"
                        >
                            <View className="flex-row items-start">
                                <View className="w-14 h-14 bg-primary/5 rounded-2xl items-center justify-center border border-primary/5">
                                    <Image 
                                        source={{ uri: assoc.logo_url || `https://ui-avatars.com/api/?name=${assoc.acronym}&background=002147&color=fff` }} 
                                        className="w-10 h-10 rounded-lg" 
                                        resizeMode="contain" 
                                    />
                                </View>

                                <View className="flex-1 ml-4">
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1 mr-1">
                                            <Text className="text-primary font-black text-lg mb-0.5">{assoc.acronym}</Text>
                                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-tighter" numberOfLines={1}>
                                                {assoc.name}
                                            </Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => handleDisbandAssociation(assoc.id, assoc.acronym)}
                                            className="w-8 h-8 bg-red-50 rounded-xl items-center justify-center border border-red-100"
                                        >
                                            <Trash2 size={14} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex-row items-center mt-4">
                                        <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-lg">
                                            <Users size={12} color="#64748B" />
                                            <Text className="text-gray-500 font-black text-[10px] ml-1.5 uppercase">{assoc.members_count} Members</Text>
                                        </View>
                                        
                                        <TouchableOpacity 
                                            onPress={() => router.push(`/associations/${assoc.id}`)}
                                            className="ml-auto flex-row items-center bg-primary/10 px-4 py-2 rounded-xl"
                                        >
                                            <Text className="text-primary font-black text-[10px] mr-1 uppercase">OVERSIGHT FEED</Text>
                                            <ArrowRight size={10} color="#002147" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </PremiumCard>
                    ))
                ) : (
                    <View className="bg-white p-8 border border-gray-100 rounded-[32px] items-center justify-center py-20 mt-4">
                        <BookOpen size={48} color="#CBD5E1" strokeWidth={1} />
                        <Text className="text-gray-400 font-bold mt-4">No active associations found in the system</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
