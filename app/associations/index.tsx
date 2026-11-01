import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Users, Search, ChevronLeft, Star, Briefcase, Globe, ArrowRight, ShieldCheck, Heart } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

interface Association {
    id: number;
    name: string;
    acronym: string;
    category: string;
    description: string;
    logo_url?: string;
    members_count: number;
    is_member: boolean;
}

export default function AssociationsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'Discover' | 'My Clubs'>('Discover');
    const [associations, setAssociations] = useState<Association[]>([]);

    const fetchAssociations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/associations');
            setAssociations(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
            // High-quality Mock Data for Associations
            setAssociations([
                { id: 1, name: 'National Association of Computer Science Students', acronym: 'NACOSS', category: 'Academic', description: 'Empowering future tech leaders through innovation and collaboration.', logo_url: 'https://ui-avatars.com/api/?name=NACOSS&background=002147&color=fff', members_count: 850, is_member: true },
                { id: 2, name: 'Google Developer Student Clubs', acronym: 'GDSC', category: 'Professional', description: 'Building the next generation of software engineers with Google technologies.', logo_url: 'https://ui-avatars.com/api/?name=GDSC&background=4285F4&color=fff', members_count: 320, is_member: false },
                { id: 3, name: 'University Press Club', acronym: 'UPC', category: 'Media', description: 'Investigative journalism and storytelling for the university community.', logo_url: 'https://ui-avatars.com/api/?name=UPC&background=facc15&color=000', members_count: 120, is_member: true },
                { id: 4, name: 'KIU Art & Culture Society', acronym: 'KACS', category: 'Culture', description: 'Celebrating heritage and creativity through performing arts.', logo_url: 'https://ui-avatars.com/api/?name=KACS&background=ef4444&color=fff', members_count: 240, is_member: false },
            ]);
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

    const filteredAssociations = associations.filter(assoc => {
        const matchesSearch = assoc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            assoc.acronym.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeTab === 'My Clubs') return matchesSearch && assoc.is_member;
        return matchesSearch;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Corporate Header */}
            <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Community Hub</Text>
                        <Text className="text-white text-xl font-bold">Associations</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <Users size={22} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Sub-Header Tabs */}
                <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/10 mb-6">
                    {['Discover', 'My Clubs'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab as any)}
                            className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${activeTab === tab ? 'bg-secondary' : ''
                                }`}
                        >
                            <Text className={`text-[10px] font-black uppercase ${activeTab === tab ? 'text-primary' : 'text-white/60'}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Professional Search Bar */}
                <View className="bg-white flex-row items-center px-5 h-14 rounded-2xl shadow-xl shadow-primary/20">
                    <Search size={20} color="#94A3B8" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search associate name or acronym..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-3 text-primary font-medium"
                    />
                </View>
            </View>

            <ScrollView
                className="flex-1 -mt-10 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                <View className="flex-row items-center justify-between mb-4 mt-4 px-2">
                    <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest">Active Coalitions • {filteredAssociations.length}</Text>
                </View>

                {loading && !associations.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : filteredAssociations.length > 0 ? (
                    filteredAssociations.map((assoc) => (
                        <PremiumCard
                            key={assoc.id}
                            variant="elevated"
                            className="bg-white mb-5 p-5 min-h-[140px]"
                            onPress={() => router.push(`/associations/${assoc.id}`)}
                        >
                            <View className="flex-row items-start">
                                <View className="w-16 h-16 bg-primary/5 rounded-[20px] items-center justify-center border border-primary/5">
                                    <Image source={{ uri: assoc.logo_url }} className="w-10 h-10 rounded-lg" resizeMode="contain" />
                                </View>

                                <View className="flex-1 ml-4 justify-center">
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1">
                                            <Text className="text-primary font-black text-lg mb-0.5">{assoc.acronym}</Text>
                                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-tighter" numberOfLines={1}>{assoc.category}</Text>
                                        </View>
                                        {assoc.is_member && <ShieldCheck size={20} color="#10B981" fill="#ECFDF5" />}
                                    </View>

                                    <View className="flex-row items-center mt-4">
                                        <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded-lg">
                                            <Users size={12} color="#64748B" />
                                            <Text className="text-gray-500 font-black text-[10px] ml-1.5 uppercase">{assoc.members_count} Members</Text>
                                        </View>
                                        <TouchableOpacity className="ml-auto flex-row items-center bg-primary/10 px-4 py-2 rounded-xl">
                                            <Text className="text-primary font-black text-[10px] mr-1 uppercase">PROFILE</Text>
                                            <ArrowRight size={10} color="#002147" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </PremiumCard>
                    ))
                ) : (
                    <View className="items-center justify-center py-24 opacity-30">
                        <Users size={48} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4">No associations found</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
