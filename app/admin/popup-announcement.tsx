import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Check, Trash2, ToggleLeft, ToggleRight, X, AlertCircle } from 'lucide-react-native';
import api from '../../lib/api';

export default function AdminPopupAnnouncement() {
    const router = useRouter();
    const [popups, setPopups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal state
    const [createVisible, setCreateVisible] = useState(false);

    // Form state
    const [form, setForm] = useState({
        title: '',
        registration_updates: '',
        documentation_deadlines: '',
        student_dues: '',
        events: '',
        is_active: false,
    });

    useEffect(() => {
        fetchPopups();
    }, []);

    const fetchPopups = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/popup-announcement');
            setPopups(res.data.data || res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to retrieve popup configurations.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!form.title) {
            Alert.alert('Validation Error', 'Please enter a title.');
            return;
        }

        setActionLoading(true);
        try {
            await api.post('/admin/popup-announcement', form);
            Alert.alert('Success', 'Popup announcement configured.');
            setCreateVisible(false);
            setForm({
                title: '',
                registration_updates: '',
                documentation_deadlines: '',
                student_dues: '',
                events: '',
                is_active: false,
            });
            fetchPopups();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save configuration.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleActive = async (id: number) => {
        try {
            await api.post(`/admin/popup-announcement/${id}/toggle`);
            fetchPopups();
        } catch (error) {
            Alert.alert('Error', 'Failed to toggle status.');
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert('Confirm Delete', 'Delete this popup configuration permanently?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/admin/popup-announcement/${id}`);
                        fetchPopups();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete configuration.');
                    }
                }
            }
        ]);
    };

    if (loading && !popups.length) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-4 pb-6 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mr-4">
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-white text-xl font-bold">App-Load Popups</Text>
                    <Text className="text-gray-300 text-xs mt-0.5">Manage student portal alerts</Text>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={popups}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-4">
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center flex-1 mr-2">
                                <AlertCircle size={20} color={item.is_active ? '#10B981' : '#64748B'} />
                                <Text className="text-primary font-bold text-base ml-2 flex-1" numberOfLines={1}>{item.title}</Text>
                            </View>
                            <View className="flex-row items-center space-x-2">
                                <TouchableOpacity onPress={() => handleToggleActive(item.id)}>
                                    {item.is_active ? (
                                        <ToggleRight size={32} color="#10B981" />
                                    ) : (
                                        <ToggleLeft size={32} color="#64748B" />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.id)} className="w-8 h-8 bg-red-50 rounded-xl items-center justify-center ml-1">
                                    <Trash2 size={16} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <Text className="text-gray-400 text-xs">Created: {new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="py-20 items-center">
                        <AlertCircle size={48} color="#9CA3AF" />
                        <Text className="text-gray-400 font-semibold mt-4">No popups configured yet.</Text>
                    </View>
                }
            />

            {/* Float Button */}
            <TouchableOpacity
                onPress={() => setCreateVisible(true)}
                className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/30"
            >
                <Plus size={24} color="white" strokeWidth={3} />
            </TouchableOpacity>

            {/* Create Modal */}
            <Modal visible={createVisible} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    className="flex-1"
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        <TouchableWithoutFeedback onPress={() => setCreateVisible(false)}>
                            <View className="absolute inset-0" />
                        </TouchableWithoutFeedback>
                        <View className="bg-white rounded-t-[36px] max-h-[85%] p-6 relative z-10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-primary">Configure Launch Popup</Text>
                                <TouchableOpacity onPress={() => setCreateVisible(false)} className="p-2 bg-gray-50 rounded-full w-10 h-10 items-center justify-center">
                                    <X size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 mb-6">
                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Popup Title</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                        placeholder="e.g. Registration Deadline Update"
                                        value={form.title}
                                        onChangeText={(val) => setForm({ ...form, title: val })}
                                    />
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Registration Updates</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-primary font-medium"
                                        placeholder="Updates about registration..."
                                        multiline
                                        numberOfLines={3}
                                        style={{ height: 80, textAlignVertical: 'top' }}
                                        value={form.registration_updates}
                                        onChangeText={(val) => setForm({ ...form, registration_updates: val })}
                                    />
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Documentation & Deadlines</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-primary font-medium"
                                        placeholder="Submit passport photos by..."
                                        multiline
                                        numberOfLines={3}
                                        style={{ height: 80, textAlignVertical: 'top' }}
                                        value={form.documentation_deadlines}
                                        onChangeText={(val) => setForm({ ...form, documentation_deadlines: val })}
                                    />
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Student Dues</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-primary font-medium"
                                        placeholder="Departmental dues details..."
                                        multiline
                                        numberOfLines={3}
                                        style={{ height: 80, textAlignVertical: 'top' }}
                                        value={form.student_dues}
                                        onChangeText={(val) => setForm({ ...form, student_dues: val })}
                                    />
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Upcoming Events</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-primary font-medium"
                                        placeholder="Upcoming orientation or events..."
                                        multiline
                                        numberOfLines={3}
                                        style={{ height: 80, textAlignVertical: 'top' }}
                                        value={form.events}
                                        onChangeText={(val) => setForm({ ...form, events: val })}
                                    />
                                </View>

                                <View className="flex-row items-center justify-between py-2">
                                    <Text className="text-primary font-bold">Set Active Immediately</Text>
                                    <TouchableOpacity onPress={() => setForm({ ...form, is_active: !form.is_active })}>
                                        {form.is_active ? (
                                            <ToggleRight size={36} color="#10B981" />
                                        ) : (
                                            <ToggleLeft size={36} color="#64748B" />
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    onPress={handleCreate}
                                    disabled={actionLoading}
                                    className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 mt-4"
                                >
                                    {actionLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Text className="text-white text-lg font-bold mr-2">Save Configuration</Text>
                                            <Check size={20} color="white" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
