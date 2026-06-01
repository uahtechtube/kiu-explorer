import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Trash2, Edit2, Shield, Phone, Mail, MapPin, Briefcase } from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface ParentGuardian {
    id: number;
    student_id: number;
    full_name: string;
    relationship: string;
    phone_number: string;
    alternative_phone?: string;
    email?: string;
    address?: string;
    occupation?: string;
    is_primary: boolean;
}

export default function ParentGuardianScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [parents, setParents] = useState<ParentGuardian[]>([]);
    
    // Modal states for creating/editing
    const [modalVisible, setModalVisible] = useState(false);
    const [editingParent, setEditingParent] = useState<ParentGuardian | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form fields
    const [fullName, setFullName] = useState('');
    const [relationship, setRelationship] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [altPhone, setAltPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');
    const [occupation, setOccupation] = useState('');
    const [isPrimary, setIsPrimary] = useState(false);

    const fetchParents = async () => {
        try {
            setLoading(true);
            const response = await api.get('/parents');
            setParents(response.data || []);
        } catch (error) {
            console.error('Error fetching parent details:', error);
            setParents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParents();
    }, []);

    const openAddModal = () => {
        setEditingParent(null);
        setFullName('');
        setRelationship('');
        setPhoneNumber('');
        setAltPhone('');
        setEmail('');
        setAddress('');
        setOccupation('');
        setIsPrimary(parents.length === 0); // Default to primary if it's the first contact
        setModalVisible(true);
    };

    const openEditModal = (parent: ParentGuardian) => {
        setEditingParent(parent);
        setFullName(parent.full_name);
        setRelationship(parent.relationship);
        setPhoneNumber(parent.phone_number);
        setAltPhone(parent.alternative_phone || '');
        setEmail(parent.email || '');
        setAddress(parent.address || '');
        setOccupation(parent.occupation || '');
        setIsPrimary(parent.is_primary);
        setModalVisible(true);
    };

    const handleFormSubmit = async () => {
        if (!fullName.trim() || !relationship.trim() || !phoneNumber.trim()) {
            Alert.alert('Validation Error', 'Full Name, Relationship, and Phone Number are required.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                student_id: user?.id,
                full_name: fullName,
                relationship: relationship,
                phone_number: phoneNumber,
                alternative_phone: altPhone || null,
                email: email || null,
                address: address || null,
                occupation: occupation || null,
                is_primary: isPrimary
            };

            if (editingParent) {
                await api.put(`/parents/${editingParent.id}`, payload);
                Alert.alert('Success', 'Parent/Guardian details updated successfully.');
            } else {
                await api.post('/parents', payload);
                Alert.alert('Success', 'Parent/Guardian details added successfully.');
            }

            setModalVisible(false);
            fetchParents();
        } catch (error: any) {
            console.error('Save failed:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save parent details.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this guardian record?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/parents/${id}`);
                            fetchParents();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete guardian details.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Header */}
            <View className="bg-primary px-6 pt-6 pb-8 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Student</Text>
                        <Text className="text-white text-xl font-bold">Parents & Guardians</Text>
                    </View>
                    <TouchableOpacity
                        onPress={openAddModal}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-md shadow-secondary/10"
                    >
                        <Plus size={22} color="#002147" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 mt-6" contentContainerStyle={{ paddingBottom: 40 }}>
                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : parents.length === 0 ? (
                    <View className="items-center py-20 bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm mt-4">
                        <Shield size={48} color="#94A3B8" strokeWidth={1.5} />
                        <Text className="text-primary font-bold mt-4 text-base">No Guardians Listed</Text>
                        <Text className="text-gray-400 text-xs text-center mt-2 px-6">
                            You haven't added any parent or guardian information yet. Click the "+" button above to add one.
                        </Text>
                    </View>
                ) : (
                    parents.map((parent) => (
                        <View key={parent.id} className="bg-white rounded-[32px] p-6 mb-5 border border-gray-100 shadow-sm overflow-hidden">
                            <View className="flex-row justify-between items-center border-b border-gray-50 pb-4 mb-4">
                                <View className="flex-row items-center">
                                    <View className="bg-primary/5 p-3 rounded-2xl border border-primary/10 mr-3">
                                        <Shield size={20} color="#002147" />
                                    </View>
                                    <View>
                                        <Text className="text-primary font-black text-sm">{parent.full_name}</Text>
                                        <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">
                                            {parent.relationship} {parent.is_primary && '• Primary Contact'}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row space-x-2">
                                    <TouchableOpacity 
                                        onPress={() => openEditModal(parent)}
                                        className="p-2 bg-blue-50 rounded-xl"
                                    >
                                        <Edit2 size={14} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => handleDelete(parent.id)}
                                        className="p-2 bg-red-50 rounded-xl"
                                    >
                                        <Trash2 size={14} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="space-y-3">
                                <View className="flex-row items-center">
                                    <Phone size={14} color="#94A3B8" />
                                    <Text className="text-primary/70 text-xs font-semibold ml-3">{parent.phone_number}</Text>
                                    {parent.alternative_phone && (
                                        <Text className="text-gray-400 text-xs font-medium ml-2">/ {parent.alternative_phone}</Text>
                                    )}
                                </View>

                                {parent.email && (
                                    <View className="flex-row items-center">
                                        <Mail size={14} color="#94A3B8" />
                                        <Text className="text-primary/70 text-xs font-semibold ml-3">{parent.email}</Text>
                                    </View>
                                )}

                                {parent.occupation && (
                                    <View className="flex-row items-center">
                                        <Briefcase size={14} color="#94A3B8" />
                                        <Text className="text-primary/70 text-xs font-semibold ml-3">{parent.occupation}</Text>
                                    </View>
                                )}

                                {parent.address && (
                                    <View className="flex-row items-start">
                                        <MapPin size={14} color="#94A3B8" className="mt-0.5" />
                                        <Text className="text-primary/70 text-xs font-semibold ml-3 flex-1 leading-5">{parent.address}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Create/Edit Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <SafeAreaView className="flex-1 bg-white p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-black text-primary">{editingParent ? 'Edit Contact' : 'New Contact'}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-gray-50 rounded-full">
                            <X size={20} color="#002147" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1 space-y-4" contentContainerStyle={{ paddingBottom: 40 }}>
                        <View>
                            <Text className="text-primary font-bold text-xs mb-2">Guardian Full Name *</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-13 text-primary text-sm font-semibold"
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="Mr. / Mrs. John Doe"
                            />
                        </View>

                        <View>
                            <Text className="text-primary font-bold text-xs mb-2">Relationship *</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-13 text-primary text-sm font-semibold"
                                value={relationship}
                                onChangeText={setRelationship}
                                placeholder="e.g. Father, Mother, Brother"
                            />
                        </View>

                        <View>
                            <Text className="text-primary font-bold text-xs mb-2">Phone Number *</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-13 text-primary text-sm font-semibold"
                                value={phoneNumber}
                                onChangeText={setPhoneNumber}
                                placeholder="080..."
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View>
                            <Text className="text-primary font-bold text-xs mb-2">Alternative Phone Number</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-13 text-primary text-sm font-semibold"
                                value={altPhone}
                                onChangeText={setAltPhone}
                                placeholder="090..."
                                keyboardType="phone-pad"
                            />
                        </View>

                        <View>
                            <Text className="text-primary font-bold text-xs mb-2">Email Address</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-13 text-primary text-sm font-semibold"
                                value={email}
                                onChangeText={setEmail}
                                placeholder="name@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View>
                            <Text className="text-primary font-bold text-xs mb-2">Occupation</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-13 text-primary text-sm font-semibold"
                                value={occupation}
                                onChangeText={setOccupation}
                                placeholder="e.g. Teacher, Merchant"
                            />
                        </View>

                        <View>
                            <Text className="text-primary font-bold text-xs mb-2">Residential Address</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-primary text-sm font-semibold min-h-[80px]"
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Guardian house address"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                        <TouchableOpacity
                            onPress={() => setIsPrimary(!isPrimary)}
                            className="flex-row items-center py-2"
                        >
                            <View className={`w-5 h-5 rounded border items-center justify-center mr-3 ${isPrimary ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                                {isPrimary && <View className="w-2.5 h-2.5 bg-secondary rounded-sm" />}
                            </View>
                            <Text className="text-primary text-xs font-bold">Mark as Primary Guardian</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleFormSubmit}
                            disabled={submitting}
                            className={`rounded-2xl py-4.5 items-center justify-center shadow-lg mt-6 ${submitting ? 'bg-gray-300 shadow-none' : 'bg-primary shadow-primary/20'}`}
                        >
                            {submitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-black text-sm uppercase tracking-widest">
                                    {editingParent ? 'Update Guardian' : 'Add Guardian'}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

// Inline helper X icon since it was not explicitly imported from lucide
const X = (props: any) => (
    <View className="w-5 h-5 items-center justify-center">
        <Text className="text-primary font-black text-xs">✕</Text>
    </View>
);
