import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Edit2, Trash2, GraduationCap, X, Save, Search } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface Faculty {
    id: number;
    name: string;
    code: string;
    description: string | null;
    departments_count?: number;
}

export default function FacultiesManagementScreen() {
    const router = useRouter();
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchFaculties();
    }, []);

    const fetchFaculties = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/faculties');
            setFaculties(response.data || []);
        } catch (error: any) {
            console.error('Error fetching faculties:', error);
            Alert.alert('Error', 'Failed to retrieve faculties directory.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingFaculty(null);
        setName('');
        setCode('');
        setDescription('');
        setModalVisible(true);
    };

    const handleOpenEditModal = (faculty: Faculty) => {
        setEditingFaculty(faculty);
        setName(faculty.name);
        setCode(faculty.code);
        setDescription(faculty.description || '');
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!name.trim() || !code.trim()) {
            Alert.alert('Validation Error', 'Please fill in all required fields.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: name.trim(),
                code: code.trim().toUpperCase(),
                description: description.trim() || null
            };

            if (editingFaculty) {
                // Update
                const response = await api.put(`/admin/faculties/${editingFaculty.id}`, payload);
                Alert.alert('Success', 'Faculty updated successfully.');
            } else {
                // Create
                const response = await api.post('/admin/faculties', payload);
                Alert.alert('Success', 'Faculty created successfully.');
            }
            setModalVisible(false);
            fetchFaculties();
        } catch (error: any) {
            console.error('Error saving faculty:', error);
            const msg = error.response?.data?.message || error.response?.data?.errors?.name?.[0] || error.response?.data?.errors?.code?.[0] || 'Failed to save faculty details.';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (faculty: Faculty) => {
        Alert.alert(
            'Delete Faculty',
            `Are you sure you want to delete ${faculty.name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/faculties/${faculty.id}`);
                            Alert.alert('Success', 'Faculty deleted successfully.');
                            fetchFaculties();
                        } catch (error: any) {
                            console.error('Error deleting faculty:', error);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete faculty.');
                        }
                    }
                }
            ]
        );
    };

    const filteredFaculties = faculties.filter(item => {
        const nameMatch = item.name ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const codeMatch = item.code ? item.code.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        return nameMatch || codeMatch;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center flex-1">
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Academic Structure</Text>
                        <Text className="text-white text-xl font-bold">Faculties</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleOpenAddModal}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/30"
                    >
                        <Plus size={22} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="bg-white flex-row items-center px-4 h-12 rounded-2xl shadow-xl shadow-primary/20">
                    <Search size={18} color="#94A3B8" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search faculties by name or code..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-3 text-primary font-bold text-xs"
                    />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#002147" className="m-auto" />
            ) : (
                <ScrollView
                    className="flex-1 -mt-10 px-6"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    {filteredFaculties.length === 0 ? (
                        <View className="items-center justify-center py-20 opacity-40">
                            <GraduationCap size={64} color="#002147" strokeWidth={1} />
                            <Text className="text-primary font-black mt-4">No faculties discovered yet.</Text>
                        </View>
                    ) : (
                        filteredFaculties.map((item) => (
                            <PremiumCard
                                key={item.id}
                                variant="solid"
                                className="bg-white p-5 border-gray-100 shadow-sm flex-row items-center mb-4"
                            >
                                <View className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center mr-4 border border-primary/5">
                                    <Text className="text-primary font-black text-xs">{item.code}</Text>
                                </View>

                                <View className="flex-1 mr-2">
                                    <Text className="text-primary font-black text-base leading-tight mb-1">{item.name}</Text>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                        {item.departments_count ?? 0} Departments
                                    </Text>
                                </View>

                                <View className="flex-row items-center space-x-2">
                                    <TouchableOpacity
                                        onPress={() => handleOpenEditModal(item)}
                                        className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center border border-gray-100 mr-2"
                                    >
                                        <Edit2 size={12} color="#002147" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(item)}
                                        className="w-8 h-8 rounded-full bg-red-50 items-center justify-center border border-red-100"
                                    >
                                        <Trash2 size={12} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </PremiumCard>
                        ))
                    )}
                </ScrollView>
            )}

            {/* Premium Dynamic Modal Sheet */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[40px] px-8 pt-6 pb-12 shadow-2xl">
                        {/* Modal Header */}
                        <View className="flex-row items-center justify-between mb-8">
                            <Text className="text-primary font-black text-xl">
                                {editingFaculty ? 'Edit Faculty Details' : 'Add New Faculty'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100"
                            >
                                <X size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Modal Form */}
                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[350px]">
                            <View className="mb-4">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Faculty Code *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. SCI"
                                    autoCapitalize="characters"
                                    value={code}
                                    onChangeText={setCode}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Faculty Name *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. Faculty of Science"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Description</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                    placeholder="Overview summary..."
                                    multiline
                                    numberOfLines={3}
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>
                        </ScrollView>

                        {/* Submit Action */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={submitting}
                            className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 mt-4"
                        >
                            {submitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Save size={18} color="white" />
                                    <Text className="text-white font-black text-sm uppercase tracking-wider ml-2">
                                        {editingFaculty ? 'Save Changes' : 'Create Faculty'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
