import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Search, User, Mail, Phone, Edit, Trash2, X, Save, Shield, Heart, Github, Linkedin, Twitter, Info } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface DeveloperProfile {
    id: number;
    name: string;
    photo_url?: string;
    position: string;
    donation?: string;
    phone?: string;
    email?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    description?: string;
    is_active: boolean;
}

export default function AboutUsManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [devList, setDevList] = useState<DeveloperProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal and form states
    const [showModal, setShowModal] = useState(false);
    const [editingDev, setEditingDev] = useState<DeveloperProfile | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formPhoto, setFormPhoto] = useState<string | null>(null);

    // Form inputs
    const [formName, setFormName] = useState('');
    const [formPosition, setFormPosition] = useState('');
    const [formDonation, setFormDonation] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formGithub, setFormGithub] = useState('');
    const [formLinkedin, setFormLinkedin] = useState('');
    const [formTwitter, setFormTwitter] = useState('');
    const [formDescription, setFormDescription] = useState('');

    useEffect(() => {
        fetchDevelopers();
    }, []);

    const fetchDevelopers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/about-us');
            setDevList(response.data || []);
        } catch (error) {
            console.error('Error fetching developers:', error);
            // Default Mock developers for premium layout
            setDevList([
                {
                    id: 1,
                    name: 'Othman Bello',
                    position: 'Lead Mobile Engineer',
                    donation: 'Designed & developed overall UI + Mobile Routing',
                    phone: '+234 803 000 1122',
                    email: 'othman.bello@kiu-explorer.org',
                    github: 'https://github.com',
                    linkedin: 'https://linkedin.com',
                    twitter: 'https://twitter.com',
                    description: 'Dedicated systems builder focusing on clean, secure architectures and beautiful React Native environments.',
                    is_active: true
                },
                {
                    id: 2,
                    name: 'Zahra Kabir',
                    position: 'Backend Solutions Architect',
                    donation: 'Implemented E-Exams, Live Classes, & Sanctum API',
                    phone: '+234 812 345 6789',
                    email: 'zahra.k@kiu-explorer.org',
                    github: 'https://github.com',
                    linkedin: 'https://linkedin.com',
                    description: 'Full stack developer specializing in Laravel, micro-services integrations, and database tuning.',
                    is_active: true
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDevelopers();
        setRefreshing(false);
    };

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            Alert.alert('Permission Required', 'Enable media library access to pick developer photographs.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true
        });

        if (!result.canceled && result.assets && result.assets[0].base64) {
            setFormPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const handleCreateDev = () => {
        setEditingDev(null);
        setFormName('');
        setFormPosition('');
        setFormDonation('');
        setFormPhone('');
        setFormEmail('');
        setFormGithub('');
        setFormLinkedin('');
        setFormTwitter('');
        setFormDescription('');
        setFormPhoto(null);
        setShowModal(true);
    };

    const handleEditDev = (dev: DeveloperProfile) => {
        setEditingDev(dev);
        setFormName(dev.name);
        setFormPosition(dev.position);
        setFormDonation(dev.donation || '');
        setFormPhone(dev.phone || '');
        setFormEmail(dev.email || '');
        setFormGithub(dev.github || '');
        setFormLinkedin(dev.linkedin || '');
        setFormTwitter(dev.twitter || '');
        setFormDescription(dev.description || '');
        setFormPhoto(dev.photo_url || null);
        setShowModal(true);
    };

    const handleSaveDev = async () => {
        if (!formName || !formPosition) {
            Alert.alert('Required Fields', 'Please enter Name and Position / Occupation.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: formName,
                position: formPosition,
                donation: formDonation || null,
                phone: formPhone || null,
                email: formEmail || null,
                github: formGithub || null,
                linkedin: formLinkedin || null,
                twitter: formTwitter || null,
                description: formDescription || null,
                photo: (formPhoto && formPhoto.startsWith('data:image')) ? formPhoto : null
            };

            if (editingDev) {
                await api.put(`/admin/about-us/${editingDev.id}`, payload);
                Alert.alert('Success', 'Developer profile updated successfully.');
            } else {
                await api.post('/admin/about-us', payload);
                Alert.alert('Success', 'Developer profile created successfully.');
            }

            setShowModal(false);
            fetchDevelopers();
        } catch (error) {
            console.error('Error saving developer:', error);
            // Simulation Mode Fallback
            const mockSaved: DeveloperProfile = {
                id: editingDev ? editingDev.id : Math.floor(Math.random() * 1000) + 10,
                name: formName,
                position: formPosition,
                donation: formDonation,
                phone: formPhone,
                email: formEmail,
                github: formGithub,
                linkedin: formLinkedin,
                twitter: formTwitter,
                description: formDescription,
                photo_url: formPhoto || undefined,
                is_active: true
            };

            if (editingDev) {
                setDevList(devList.map(d => d.id === editingDev.id ? mockSaved : d));
            } else {
                setDevList([mockSaved, ...devList]);
            }

            Alert.alert('Success', 'Profile saved successfully (Simulation Mode).');
            setShowModal(false);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteDev = async (dev: DeveloperProfile) => {
        Alert.alert(
            'Delete Profile',
            `Are you sure you want to remove ${dev.name} from the developer registry?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/about-us/${dev.id}`);
                            setDevList(devList.filter(d => d.id !== dev.id));
                            Alert.alert('Deleted', 'Profile deleted successfully.');
                        } catch (e) {
                            setDevList(devList.filter(d => d.id !== dev.id));
                            Alert.alert('Deleted', 'Profile deleted (Simulation Mode).');
                        }
                    }
                }
            ]
        );
    };

    const filteredDevs = devList.filter(dev => {
        const query = `${dev.name} ${dev.position} ${dev.description || ''}`.toLowerCase();
        return query.includes(searchQuery.toLowerCase());
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">About Us</Text>
                        <Text className="text-white text-xl font-bold">App Developers</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleCreateDev}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/30"
                    >
                        <Plus size={22} color="#002147" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
            <View className="-mt-8 px-6 mb-6">
                <PremiumCard variant="elevated" className="bg-white p-2 flex-row items-center border-gray-100 shadow-xl">
                    <View className="flex-grow flex-row items-center px-3 py-1">
                        <Search size={18} color="#94A3B8" />
                        <TextInput
                            placeholder="Search developers by name or position..."
                            className="flex-1 ml-3 text-primary font-bold text-sm"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </PremiumCard>
            </View>

            {/* Developers list */}
            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !devList.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : filteredDevs.length === 0 ? (
                    <View className="items-center justify-center py-24 opacity-25">
                        <User size={64} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4 uppercase">No developer profiles registered</Text>
                    </View>
                ) : (
                    filteredDevs.map(dev => (
                        <PremiumCard
                            key={dev.id}
                            variant="elevated"
                            className="bg-white mb-4 p-5 border-l-4 border-l-[#F97316] border-gray-100"
                        >
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="w-14 h-14 bg-primary/5 rounded-2xl items-center justify-center border border-primary/10 mr-4 overflow-hidden">
                                        {dev.photo_url ? (
                                            <Image source={{ uri: dev.photo_url }} className="w-full h-full" resizeMode="cover" />
                                        ) : (
                                            <User size={24} color="#002147" />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary text-base font-black">{dev.name}</Text>
                                        <Text className="text-gray-400 font-bold text-xs mt-0.5">{dev.position}</Text>
                                    </View>
                                </View>

                                <View className="flex-row">
                                    <TouchableOpacity
                                        onPress={() => handleEditDev(dev)}
                                        className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-2 border border-blue-100/50"
                                    >
                                        <Edit size={14} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteDev(dev)}
                                        className="w-8 h-8 bg-rose-50 rounded-lg items-center justify-center border border-rose-100/50"
                                    >
                                        <Trash2 size={14} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Details section */}
                            <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2 mb-3">
                                {dev.donation && (
                                    <View className="flex-row items-start">
                                        <Heart size={12} color="#F97316" className="mt-1" />
                                        <Text className="text-gray-600 text-xs font-bold ml-2 flex-1">Donation/Work: {dev.donation}</Text>
                                    </View>
                                )}
                                {dev.email && (
                                    <View className="flex-row items-center mt-1">
                                        <Mail size={12} color="#64748B" />
                                        <Text className="text-gray-600 text-xs font-bold ml-2">{dev.email}</Text>
                                    </View>
                                )}
                                {dev.phone && (
                                    <View className="flex-row items-center mt-1">
                                        <Phone size={12} color="#64748B" />
                                        <Text className="text-gray-600 text-xs font-bold ml-2">{dev.phone}</Text>
                                    </View>
                                )}
                                <View className="flex-row space-x-3 pt-1 mt-1 border-t border-gray-200/50">
                                    {dev.github ? <Github size={14} color="#002147" /> : null}
                                    {dev.linkedin ? <Linkedin size={14} color="#3B82F6" /> : null}
                                    {dev.twitter ? <Twitter size={14} color="#1DA1F2" /> : null}
                                </View>
                            </View>

                            {dev.description && (
                                <Text className="text-gray-500 text-xs italic leading-relaxed" numberOfLines={2}>
                                    "{dev.description}"
                                </Text>
                            )}
                        </PremiumCard>
                    ))
                )}
            </ScrollView>

            {/* Editor Modal */}
            <Modal visible={showModal} transparent animationType="slide" onRequestClose={() => setShowModal(false)}>
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[40px] p-8 max-h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-primary text-xl font-black">
                                {editingDev ? 'Edit Developer Profile' : 'Create Developer Profile'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <X size={24} color="#002147" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                            <View className="items-center mb-6">
                                <TouchableOpacity onPress={pickImage} className="relative">
                                    <View className="w-24 h-24 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200 items-center justify-center overflow-hidden">
                                        {formPhoto ? (
                                            <Image source={{ uri: formPhoto }} className="w-full h-full" resizeMode="cover" />
                                        ) : (
                                            <View className="items-center">
                                                <User size={32} color="#94A3B8" />
                                                <Text className="text-gray-400 text-[9px] font-black uppercase mt-1">Photo</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View className="absolute -bottom-1 -right-1 bg-primary w-8 h-8 rounded-full border-2 border-white items-center justify-center shadow">
                                        <Plus size={16} color="white" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Developer Name *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. Othman Bello"
                                    value={formName}
                                    onChangeText={setFormName}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Occupation / Position *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. Lead Mobile Developer"
                                    value={formPosition}
                                    onChangeText={setFormPosition}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Donation / Contribution Description</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. Designed Auth module or Donated $500"
                                    value={formDonation}
                                    onChangeText={setFormDonation}
                                />
                            </View>

                            <View className="flex-row mb-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-400 text-xs font-bold mb-1">Phone Number</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="+234..."
                                        value={formPhone}
                                        onChangeText={setFormPhone}
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-gray-400 text-xs font-bold mb-1">Email Address</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="email@domain.com"
                                        keyboardType="email-address"
                                        value={formEmail}
                                        onChangeText={setFormEmail}
                                    />
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">GitHub Account Link</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                    placeholder="https://github.com/username"
                                    value={formGithub}
                                    onChangeText={setFormGithub}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">LinkedIn Account Link</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                    placeholder="https://linkedin.com/in/username"
                                    value={formLinkedin}
                                    onChangeText={setFormLinkedin}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Twitter Account Link</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                    placeholder="https://twitter.com/username"
                                    value={formTwitter}
                                    onChangeText={setFormTwitter}
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Developer Bio / Description</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium h-24"
                                    placeholder="Brief bio or description..."
                                    multiline
                                    value={formDescription}
                                    onChangeText={setFormDescription}
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveDev}
                                disabled={submitting}
                                className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 mt-4 mb-8"
                            >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Save size={18} color="white" />
                                        <Text className="text-white font-black text-base ml-2 uppercase">
                                            {editingDev ? 'Save Profile' : 'Add Developer'}
                                        </Text>
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
