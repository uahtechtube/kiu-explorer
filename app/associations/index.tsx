import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Users, Search, ChevronLeft, ArrowRight, ShieldCheck, Plus, X, BookOpen, Calendar, AlignLeft, Info } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

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

    // Form states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [name, setName] = useState('');
    const [acronym, setAcronym] = useState('');
    const [category, setCategory] = useState('Academic');
    const [description, setDescription] = useState('');
    const [meetingSchedule, setMeetingSchedule] = useState('');
    const [creating, setCreating] = useState(false);

    const fetchAssociations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/associations');
            setAssociations(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
            // High-quality Mock Data fallback
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

    const handleCreate = async () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please enter the association name.');
            return;
        }
        if (!acronym.trim()) {
            Alert.alert('Validation Error', 'Please enter the acronym (e.g. NACOSS).');
            return;
        }
        if (!description.trim()) {
            Alert.alert('Validation Error', 'Please enter a description for the association.');
            return;
        }

        try {
            setCreating(true);
            const response = await api.post('/student/associations', {
                name: name.trim(),
                acronym: acronym.trim().toUpperCase(),
                category,
                description: description.trim(),
                meeting_schedule: meetingSchedule.trim() || 'Not Scheduled Yet'
            });

            if (response.data.success) {
                Alert.alert('Success', 'Association established successfully! You are now registered as the founder and president.');
                setShowCreateModal(false);
                // Clear fields
                setName('');
                setAcronym('');
                setCategory('Academic');
                setDescription('');
                setMeetingSchedule('');
                // Refresh list
                fetchAssociations();
            } else {
                Alert.alert('Error', response.data.message || 'Could not create association.');
            }
        } catch (error: any) {
            console.error('Create error:', error);
            const errorMsg = error.response?.data?.errors
                ? Object.values(error.response.data.errors).flat().join('\n')
                : error.response?.data?.message || 'Failed to create association. Please check if the name or acronym is already taken.';
            Alert.alert('Submission Failed', errorMsg);
        } finally {
            setCreating(false);
        }
    };

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
                contentContainerStyle={{ paddingBottom: 100 }}
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
                                    <Image 
                                        source={{ uri: assoc.logo_url || `https://ui-avatars.com/api/?name=${assoc.acronym}&background=002147&color=fff` }} 
                                        className="w-10 h-10 rounded-lg" 
                                        resizeMode="contain" 
                                    />
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
                                        <TouchableOpacity 
                                            onPress={() => router.push(`/associations/${assoc.id}`)}
                                            className="ml-auto flex-row items-center bg-primary/10 px-4 py-2 rounded-xl"
                                        >
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

            {/* Premium FAB to create Association */}
            <TouchableOpacity
                onPress={() => setShowCreateModal(true)}
                activeOpacity={0.85}
                className="absolute bottom-8 right-6 w-16 h-16 bg-secondary rounded-full items-center justify-center shadow-2xl shadow-primary/45 border border-white/20 z-50"
            >
                <Plus size={28} color="#002147" />
            </TouchableOpacity>

            {/* Full Screen Premium Modal for Create Association */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <SafeAreaView className="bg-white rounded-t-[40px] max-h-[92%] border-t border-gray-100">
                        {/* Modal Header */}
                        <View className="flex-row items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                            <View className="flex-row items-center">
                                <View className="w-10 h-10 bg-secondary/20 rounded-xl items-center justify-center mr-3">
                                    <BookOpen size={20} color="#002147" />
                                </View>
                                <View>
                                    <Text className="text-primary font-black text-lg">Establish Club</Text>
                                    <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Create New Association</Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => setShowCreateModal(false)}
                                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <X size={20} color="#475569" />
                            </TouchableOpacity>
                        </View>

                        {/* Modal Scroll Form */}
                        <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                            {/* Input: Name */}
                            <View className="mb-5">
                                <View className="flex-row items-center mb-1.5">
                                    <Info size={14} color="#002147" className="mr-1.5" />
                                    <Text className="text-primary font-black text-xs uppercase tracking-wide">Association Full Name</Text>
                                </View>
                                <TextInput
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="e.g. Society of Petroleum Engineers"
                                    placeholderTextColor="#94A3B8"
                                    className="bg-gray-50 border border-gray-200 text-primary font-semibold text-sm px-4 py-3.5 rounded-2xl focus:border-primary"
                                />
                            </View>

                            {/* Input: Acronym */}
                            <View className="mb-5">
                                <View className="flex-row items-center mb-1.5">
                                    <Users size={14} color="#002147" className="mr-1.5" />
                                    <Text className="text-primary font-black text-xs uppercase tracking-wide">Club Acronym</Text>
                                </View>
                                <TextInput
                                    value={acronym}
                                    onChangeText={setAcronym}
                                    autoCapitalize="characters"
                                    placeholder="e.g. SPE"
                                    placeholderTextColor="#94A3B8"
                                    className="bg-gray-50 border border-gray-200 text-primary font-semibold text-sm px-4 py-3.5 rounded-2xl focus:border-primary"
                                />
                            </View>

                            {/* Category Selector */}
                            <View className="mb-5">
                                <Text className="text-primary font-black text-xs uppercase tracking-wide mb-2.5">Category Classification</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {['Academic', 'Social', 'Sports', 'Cultural', 'Professional', 'Other'].map((cat) => (
                                        <TouchableOpacity
                                            key={cat}
                                            onPress={() => setCategory(cat)}
                                            className={`px-4 py-2.5 rounded-xl border ${category === cat ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'}`}
                                        >
                                            <Text className={`text-[10px] font-black uppercase ${category === cat ? 'text-secondary' : 'text-gray-500'}`}>
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Input: Description */}
                            <View className="mb-5">
                                <View className="flex-row items-center mb-1.5">
                                    <AlignLeft size={14} color="#002147" className="mr-1.5" />
                                    <Text className="text-primary font-black text-xs uppercase tracking-wide">Club Description</Text>
                                </View>
                                <TextInput
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                    placeholder="Explain the mission, goals, and values of your new club..."
                                    placeholderTextColor="#94A3B8"
                                    textAlignVertical="top"
                                    className="bg-gray-50 border border-gray-200 text-primary font-semibold text-sm px-4 py-3 rounded-2xl focus:border-primary min-h-[100px]"
                                />
                            </View>

                            {/* Input: Meeting Schedule */}
                            <View className="mb-8">
                                <View className="flex-row items-center mb-1.5">
                                    <Calendar size={14} color="#002147" className="mr-1.5" />
                                    <Text className="text-primary font-black text-xs uppercase tracking-wide">Meeting Schedule (Optional)</Text>
                                </View>
                                <TextInput
                                    value={meetingSchedule}
                                    onChangeText={setMeetingSchedule}
                                    placeholder="e.g. Every Friday at 4:00 PM, Block B Lab"
                                    placeholderTextColor="#94A3B8"
                                    className="bg-gray-50 border border-gray-200 text-primary font-semibold text-sm px-4 py-3.5 rounded-2xl focus:border-primary"
                                />
                            </View>

                            {/* Submit Button */}
                            <TouchableOpacity
                                onPress={handleCreate}
                                disabled={creating}
                                className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 mb-12"
                            >
                                {creating ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Plus size={18} color="white" className="mr-2" />
                                        <Text className="text-white font-black text-sm uppercase tracking-wider">Establish Association</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </SafeAreaView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
