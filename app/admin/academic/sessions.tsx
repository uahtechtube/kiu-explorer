import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Edit2, Trash2, Calendar, X, Save, Search, CheckCircle } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface AcademicSession {
    id: number;
    name: string;
    is_current: boolean;
    start_date: string;
    end_date: string;
}

export default function SessionsManagementScreen() {
    const router = useRouter();
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSession, setEditingSession] = useState<AcademicSession | null>(null);
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCurrent, setIsCurrent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/sessions');
            setSessions(response.data || []);
        } catch (error: any) {
            console.error('Error fetching sessions:', error);
            Alert.alert('Error', 'Failed to retrieve academic sessions.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingSession(null);
        setName('');
        // Autofill dates with standard formats
        const year = new Date().getFullYear();
        setName(`${year}/${year + 1}`);
        setStartDate(`${year}-09-01`);
        setEndDate(`${year + 1}-07-31`);
        setIsCurrent(false);
        setModalVisible(true);
    };

    const handleOpenEditModal = (session: AcademicSession) => {
        setEditingSession(session);
        setName(session.name);
        // Format dates cleanly (YYYY-MM-DD)
        setStartDate(session.start_date ? session.start_date.split('T')[0] : '');
        setEndDate(session.end_date ? session.end_date.split('T')[0] : '');
        setIsCurrent(session.is_current);
        setModalVisible(true);
    };

    const handleToggleActive = async (session: AcademicSession) => {
        if (session.is_current) return; // Already active

        Alert.alert(
            'Activate Session',
            `Set ${session.name} as the active current session? This will turn off all other sessions.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Set Active',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.put(`/admin/sessions/${session.id}`, {
                                is_current: true
                            });
                            Alert.alert('Success', `${session.name} is now the active academic session.`);
                            fetchSessions();
                        } catch (error: any) {
                            console.error('Error activating session:', error);
                            Alert.alert('Error', 'Failed to set active session.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleSubmit = async () => {
        if (!name.trim() || !startDate.trim() || !endDate.trim()) {
            Alert.alert('Validation Error', 'Please fill in all required fields.');
            return;
        }

        // Date format check
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate.trim()) || !dateRegex.test(endDate.trim())) {
            Alert.alert('Validation Error', 'Dates must be in YYYY-MM-DD format.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: name.trim(),
                is_current: isCurrent,
                start_date: startDate.trim(),
                end_date: endDate.trim()
            };

            if (editingSession) {
                // Update
                await api.put(`/admin/sessions/${editingSession.id}`, payload);
                Alert.alert('Success', 'Academic session updated successfully.');
            } else {
                // Create
                await api.post('/admin/sessions', payload);
                Alert.alert('Success', 'Academic session created successfully.');
            }
            setModalVisible(false);
            fetchSessions();
        } catch (error: any) {
            console.error('Error saving session:', error);
            const msg = error.response?.data?.message || error.response?.data?.errors?.name?.[0] || 'Failed to save session details.';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (session: AcademicSession) => {
        Alert.alert(
            'Delete Session',
            `Are you sure you want to delete ${session.name}? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/sessions/${session.id}`);
                            Alert.alert('Success', 'Session deleted successfully.');
                            fetchSessions();
                        } catch (error: any) {
                            console.error('Error deleting session:', error);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete session.');
                        }
                    }
                }
            ]
        );
    };

    const filteredSessions = sessions.filter(item => {
        return item.name ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
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
                        <Text className="text-white text-xl font-bold">Sessions</Text>
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
                        placeholder="Search academic sessions..."
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
                    {filteredSessions.length === 0 ? (
                        <View className="items-center justify-center py-20 opacity-40">
                            <Calendar size={64} color="#002147" strokeWidth={1} />
                            <Text className="text-primary font-black mt-4">No sessions discovered yet.</Text>
                        </View>
                    ) : (
                        filteredSessions.map((item) => (
                            <PremiumCard
                                key={item.id}
                                variant="solid"
                                className="bg-white p-5 border-gray-100 shadow-sm flex-row items-center mb-4"
                            >
                                <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 border ${item.is_current ? 'bg-emerald-50 border-emerald-100' : 'bg-primary/5 border-primary/5'}`}>
                                    {item.is_current ? (
                                        <CheckCircle size={20} color="#10B981" />
                                    ) : (
                                        <Calendar size={20} color="#002147" />
                                    )}
                                </View>

                                <View className="flex-1 mr-2">
                                    <View className="flex-row items-center mb-1">
                                        <Text className="text-primary font-black text-base leading-tight mr-2">{item.name}</Text>
                                        {item.is_current && (
                                            <View className="bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                <Text className="text-emerald-500 text-[8px] font-black uppercase tracking-widest">Active</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-gray-400 text-[10px] font-medium leading-none">
                                        Term: {item.start_date ? item.start_date.split('T')[0] : 'TBA'} to {item.end_date ? item.end_date.split('T')[0] : 'TBA'}
                                    </Text>
                                </View>

                                <View className="flex-row items-center space-x-2">
                                    {!item.is_current && (
                                        <TouchableOpacity
                                            onPress={() => handleToggleActive(item)}
                                            className="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 mr-2"
                                        >
                                            <Text className="text-primary font-black text-[9px] uppercase tracking-wider">Activate</Text>
                                        </TouchableOpacity>
                                    )}
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
                                {editingSession ? 'Edit Session Details' : 'Add Academic Session'}
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
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Session Name *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. 2025/2026"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View className="mb-4 flex-row space-x-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Start Date (YYYY-MM-DD) *</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="e.g. 2025-09-01"
                                        value={startDate}
                                        onChangeText={setStartDate}
                                    />
                                </View>

                                <View className="flex-1">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">End Date (YYYY-MM-DD) *</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="e.g. 2026-07-31"
                                        value={endDate}
                                        onChangeText={setEndDate}
                                    />
                                </View>
                            </View>

                            <View className="mb-6 flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <View className="flex-1 mr-4">
                                    <Text className="text-primary font-black text-sm mb-0.5">Designate Active Current Session</Text>
                                    <Text className="text-gray-400 text-[9px] font-bold uppercase">Sets this session as the active timeline for dashboards</Text>
                                </View>
                                <Switch
                                    value={isCurrent}
                                    onValueChange={setIsCurrent}
                                    trackColor={{ false: '#E2E8F0', true: '#10B981' }}
                                    thumbColor="white"
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
                                        {editingSession ? 'Save Changes' : 'Create Session'}
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
