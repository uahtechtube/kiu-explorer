import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Users, Globe, Mail, ShieldCheck, Briefcase, FileText, ChevronRight, ArrowLeft, MoreVertical, Heart, UserCheck } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

const { width } = Dimensions.get('window');

interface AssociationDetail {
    id: number;
    name: string;
    acronym: string;
    description: string;
    category: string;
    vision: string;
    mission: string;
    logo_url: string;
    members_count: number;
    is_member: boolean;
    executives: Array<{ name: string; position: string; image: string }>;
    documents?: Array<{ id: number; title: string; type: string }>;
}

export default function AssociationDetailPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [association, setAssociation] = useState<AssociationDetail | null>(null);

    useEffect(() => {
        fetchAssociationDetail();
    }, [id]);

    const fetchAssociationDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/associations/${id}`);
            setAssociation(response.data.data);
        } catch (error) {
            console.error('Error:', error);
            // Professional Mock Data for Associations
            setAssociation({
                id: Number(id),
                name: 'National Association of Computer Science Students',
                acronym: 'NACOSS',
                description: 'The umbrella body for all computer science students at Kashim Ibrahim University, dedicated to fostering tech excellence and innovation.',
                vision: 'To be the leading student tech association in West Africa, producing globally competitive graduates.',
                mission: 'Providing resources, networking, and technical training to bridge the gap between classroom and industry.',
                category: 'Academic',
                logo_url: 'https://ui-avatars.com/api/?name=NACOSS&background=002147&color=fff',
                members_count: 852,
                is_member: false,
                executives: [
                    { name: 'Othman Bello', position: 'President', image: 'https://i.pravatar.cc/150?u=othman' },
                    { name: 'Zainab Musa', position: 'General Secretary', image: 'https://i.pravatar.cc/150?u=zainab' },
                ],
                documents: [
                    { id: 1, title: '2025/26 Constitution', type: 'PDF' },
                    { id: 2, title: 'Academic Resource Kit', type: 'ZIP' },
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        setRequesting(true);
        try {
            // Mock join request
            await new Promise(resolve => setTimeout(resolve, 1500));
            Alert.alert('Request Sent', 'Your membership request has been sent to the association executives for approval.');
        } catch (error) {
            Alert.alert('Error', 'Could not send request. Try again.');
        } finally {
            setRequesting(false);
        }
    };

    if (loading) return (
        <View className="flex-1 bg-white items-center justify-center">
            <ActivityIndicator size="large" color="#002147" />
        </View>
    );

    if (!association) return null;

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {/* Branding Header Section */}
                <View className="bg-primary pt-12 pb-20 px-6 rounded-b-[40px] relative">
                    <SafeAreaView className="flex-row justify-between mb-8">
                        <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-2xl border border-white/20 items-center justify-center">
                            <ArrowLeft size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl border border-white/20 items-center justify-center">
                            <MoreVertical size={24} color="white" />
                        </TouchableOpacity>
                    </SafeAreaView>

                    <View className="flex-row items-center mb-6">
                        <PremiumCard variant="elevated" className="w-24 h-24 p-0 rounded-[32px] overflow-hidden bg-white border-0 shadow-lg items-center justify-center">
                            <Image source={{ uri: association.logo_url }} className="w-16 h-16" resizeMode="contain" />
                        </PremiumCard>
                        <View className="ml-6 flex-1">
                            <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">{association.category} Division</Text>
                            <Text className="text-white text-3xl font-black">{association.acronym}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center pt-2">
                        <View className="bg-white/10 px-4 py-2 rounded-xl flex-row items-center mr-3 border border-white/5">
                            <Users size={14} color="#FFD700" />
                            <Text className="text-white font-bold text-xs ml-2">{association.members_count}</Text>
                        </View>
                        {association.is_member && (
                            <View className="bg-emerald-500/20 px-4 py-2 rounded-xl flex-row items-center border border-emerald-500/20">
                                <ShieldCheck size={14} color="#10B981" />
                                <Text className="text-emerald-500 font-bold text-xs ml-2 uppercase">Member</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Content Section */}
                <View className="px-6 -mt-10">
                    <PremiumCard variant="elevated" className="mb-10 p-8 pt-10">
                        <Text className="text-gray-500 leading-7 text-base mb-6">{association.description}</Text>

                        <View className="space-y-6">
                            <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                <Text className="text-primary font-black text-xs uppercase mb-2">Our Vision</Text>
                                <Text className="text-gray-500 text-sm leading-6">{association.vision}</Text>
                            </View>
                            <View className="bg-secondary/5 p-6 rounded-[32px] border border-secondary/10">
                                <Text className="text-primary font-black text-xs uppercase mb-2 text-secondary">Strategic Mission</Text>
                                <Text className="text-primary/70 text-sm leading-6">{association.mission}</Text>
                            </View>
                        </View>
                    </PremiumCard>

                    {/* Executives Directory */}
                    <View className="mb-10">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-primary font-black text-xl">Governance Board</Text>
                            <Text className="text-gray-300 font-black text-[10px] uppercase tracking-widest">2025/2026 TENURE</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                            {association.executives?.map((exec, idx) => (
                                <View key={idx} className="mr-4 w-[180px]">
                                    <PremiumCard variant="solid" className="bg-white border-gray-50 p-4 items-center">
                                        <Image source={{ uri: exec.image }} className="w-20 h-20 rounded-[24px] bg-gray-100 mb-4 border border-gray-100" />
                                        <Text className="text-primary font-black text-center text-sm mb-1" numberOfLines={1}>{exec.name}</Text>
                                        <StatusBadge status="other" />
                                        <Text className="text-gray-400 text-[8px] font-black uppercase mt-1 tracking-tighter">{exec.position}</Text>
                                    </PremiumCard>
                                </View>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Resources section */}
                    <View className="mb-10">
                        <Text className="text-primary font-black text-xl mb-4">Official Archives</Text>
                        {association.documents?.map(doc => (
                            <TouchableOpacity key={doc.id} className="flex-row items-center bg-gray-50/50 border border-gray-100 p-5 rounded-[24px] mb-3">
                                <View className="w-10 h-10 bg-white rounded-2xl items-center justify-center mr-4 border border-gray-50 shadow-sm">
                                    <FileText size={18} color="#94A3B8" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-primary font-black text-sm">{doc.title}</Text>
                                    <Text className="text-gray-400 text-[10px] uppercase font-bold">{doc.type}</Text>
                                </View>
                                <ChevronRight size={16} color="#CBD5E1" />
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View className="h-32" />
                </View>
            </ScrollView>

            {/* Application Action Footer */}
            {!association.is_member && (
                <View className="absolute bottom-0 w-full bg-white/95 border-t border-gray-100 px-6 py-8 backdrop-blur-md">
                    <TouchableOpacity
                        onPress={handleJoin}
                        disabled={requesting}
                        className="h-16 bg-primary rounded-[24px] items-center justify-center flex-row shadow-xl shadow-primary/20"
                    >
                        {requesting ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <UserCheck size={20} color="white" />
                                <Text className="text-white font-black text-lg ml-3 tracking-widest">SUBMIT JOIN REQUEST</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
