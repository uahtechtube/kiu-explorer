import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Search, ChevronLeft, Mail, Phone, Briefcase, ChevronRight, User } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface StaffMember {
    id: number;
    name: string;
    role: string;
    department: string;
    email: string;
    phone: string;
    image_url: string;
}

export default function StaffDirectoryPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [staff, setStaff] = useState<StaffMember[]>([]);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await api.get('/school/staff');
            const rawData = response.data.data || [];
            
            const mappedStaff = rawData.map((item: any) => {
                const titleStr = item.title ? `${item.title} ` : '';
                const firstNameStr = item.first_name || '';
                const surnameStr = item.surname || '';
                const fullName = `${titleStr}${firstNameStr} ${surnameStr}`.trim();
                
                let deptName = 'General';
                if (item.department && typeof item.department === 'object') {
                    deptName = item.department.name || 'General';
                } else if (typeof item.department === 'string') {
                    deptName = item.department;
                }

                return {
                    id: item.id,
                    name: fullName || 'Staff Member',
                    role: item.position || item.role || 'Staff',
                    department: deptName,
                    email: item.email || '',
                    phone: item.phone || '',
                    image_url: item.photo_url || item.image_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
                };
            });

            setStaff(mappedStaff);
        } catch (error) {
            console.error('Error fetching staff:', error);
            setStaff([]); // Show empty state instead of mock data
        } finally {
            setLoading(false);
        }
    };

    const filteredStaff = staff.filter(member => {
        const name = member.name || '';
        const dept = member.department || '';
        const role = member.role || '';
        const query = searchQuery.toLowerCase();
        
        return name.toLowerCase().includes(query) ||
               dept.toLowerCase().includes(query) ||
               role.toLowerCase().includes(query);
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Professional Search Header */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">KIU Directory</Text>
                        <Text className="text-white text-xl font-bold">University Staff</Text>
                    </View>
                    <View className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <User size={22} color="white" />
                    </View>
                </View>

                {/* Premium Search Bar */}
                <View className="bg-white flex-row items-center px-5 h-14 rounded-2xl shadow-xl shadow-primary/20">
                    <Search size={20} color="#94A3B8" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search name, role, or department..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-3 text-primary font-medium"
                    />
                </View>
            </View>

            <ScrollView className="flex-1 px-6 mt-4" contentContainerStyle={{ paddingBottom: 40, paddingTop: 10 }}>
                {loading && !staff.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : filteredStaff.length > 0 ? (
                    filteredStaff.map((member) => (
                        <PremiumCard
                            key={member.id}
                            variant="solid"
                            className="bg-white mb-4 p-4 border-gray-100 flex-row items-center"
                            onPress={() => router.push(`/messages/${member.id}`)}
                        >
                            <Image
                                source={{ uri: member.image_url }}
                                className="w-20 h-20 rounded-2xl bg-gray-100 border border-gray-200"
                            />

                            <View className="flex-1 ml-4">
                                <View className="flex-row justify-between items-start">
                                    <View className="flex-1">
                                        <Text className="text-primary font-black text-lg" numberOfLines={1}>{member.name}</Text>
                                        <View className="flex-row items-center mt-1">
                                            <Briefcase size={10} color="#64748B" />
                                            <Text className="text-gray-400 text-[10px] ml-1 font-bold uppercase tracking-tighter">
                                                {member.role} • {member.department}
                                            </Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity className="p-1" onPress={() => router.push(`/messages/${member.id}`)}>
                                        <ChevronRight size={16} color="#CBD5E1" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row mt-4 space-x-2">
                                    <TouchableOpacity 
                                        onPress={() => Linking.openURL('mailto:' + member.email)}
                                        className="flex-row items-center bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100"
                                    >
                                        <Mail size={12} color="#3B82F6" />
                                        <Text className="text-blue-600 text-[10px] font-bold ml-1.5 uppercase">Email</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => Linking.openURL('tel:' + member.phone)}
                                        className="flex-row items-center bg-emerald-50/50 px-3 py-1.5 rounded-lg border border-emerald-100"
                                    >
                                        <Phone size={12} color="#10B981" />
                                        <Text className="text-emerald-600 text-[10px] font-bold ml-1.5 uppercase">Call</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </PremiumCard>
                    ))
                ) : (
                    <View className="items-center justify-center py-24 opacity-30">
                        <Search size={48} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-bold mt-4">No matches found</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
