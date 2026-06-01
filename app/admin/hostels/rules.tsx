import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, Edit2, Trash2, ShieldAlert, CheckCircle, Info } from 'lucide-react-native';
import api from '../../../lib/api';

interface Hostel {
    id: number;
    name: string;
}

interface Rule {
    id: number;
    title: string;
    description: string;
    is_active: boolean;
}

export default function AdminRulesPortal() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [selectedHostel, setSelectedHostel] = useState<number | null>(null);
    const [rules, setRules] = useState<Rule[]>([]);

    // Form inputs
    const [editingRuleId, setEditingRuleId] = useState<number | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchHostels();
    }, []);

    useEffect(() => {
        if (selectedHostel) {
            fetchRules(selectedHostel);
        }
    }, [selectedHostel]);

    const fetchHostels = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/hostels');
            const data = response.data.data || [];
            setHostels(data);
            if (data.length > 0) {
                setSelectedHostel(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching hostels:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRules = async (hostelId: number) => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/hostels/${hostelId}/rules`);
            setRules(response.data.data || []);
        } catch (error) {
            console.error('Error fetching rules:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveRule = async () => {
        if (!title || !description || !selectedHostel) {
            Alert.alert('Incomplete Form', 'Please provide a Title and Description.');
            return;
        }

        try {
            setSaving(true);
            if (editingRuleId) {
                // Update
                const response = await api.put(`/admin/hostels/rules/${editingRuleId}`, {
                    title,
                    description,
                    is_active: isActive,
                });
                if (response.data.status === 'success') {
                    Alert.alert('Updated', 'Hostel rule updated successfully!');
                }
            } else {
                // Create
                const response = await api.post(`/admin/hostels/${selectedHostel}/rules`, {
                    title,
                    description,
                    is_active: isActive,
                });
                if (response.data.status === 'success') {
                    Alert.alert('Success', 'New rule added successfully!');
                }
            }
            setTitle('');
            setDescription('');
            setIsActive(true);
            setEditingRuleId(null);
            setShowForm(false);
            fetchRules(selectedHostel);
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save rule.');
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (rule: Rule) => {
        setEditingRuleId(rule.id);
        setTitle(rule.title);
        setDescription(rule.description);
        setIsActive(rule.is_active);
        setShowForm(true);
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this rule permanently?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/hostels/rules/${id}`);
                            if (selectedHostel) fetchRules(selectedHostel);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete rule.');
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100 bg-white">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ChevronLeft size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text className="text-primary text-xl font-bold">Manage Hostel Rules</Text>
                </View>
                {!showForm && (
                    <TouchableOpacity
                        onPress={() => {
                            setEditingRuleId(null);
                            setTitle('');
                            setDescription('');
                            setIsActive(true);
                            setShowForm(true);
                        }}
                        className="bg-primary p-3.5 rounded-full"
                    >
                        <Plus size={16} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Hostel Selector */}
            <View className="bg-white px-6 py-4 border-b border-gray-100 flex-row items-center gap-x-2">
                <Text className="text-primary font-bold text-xs uppercase tracking-wider mr-2">Select Hostel:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {hostels.map((h) => (
                        <TouchableOpacity
                            key={h.id}
                            onPress={() => {
                                setSelectedHostel(h.id);
                                setShowForm(false);
                            }}
                            className={`px-4 py-2 rounded-xl mr-2 border ${
                                selectedHostel === h.id ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-100'
                            }`}
                        >
                            <Text className={`text-xs font-semibold ${selectedHostel === h.id ? 'text-white' : 'text-slate-500'}`}>
                                {h.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                {showForm ? (
                    <View 
                        className="bg-white border border-gray-100 rounded-[32px] p-6 mb-6"
                        style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}
                    >
                        <Text className="text-primary font-bold text-lg mb-4">
                            {editingRuleId ? 'Edit Hostel Rule' : 'Add New Rule & Regulation'}
                        </Text>

                        <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Rule Title</Text>
                        <TextInput
                            placeholder="e.g. Access & Curfew Gates"
                            value={title}
                            onChangeText={setTitle}
                            className="bg-gray-50 border border-slate-100 px-4 py-3.5 rounded-2xl text-slate-800 text-sm mb-4"
                        />

                        <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Rule Description</Text>
                        <TextInput
                            placeholder="Describe the policy, regulations and penalty details..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            className="bg-gray-50 border border-slate-100 p-4 rounded-2xl text-slate-800 text-sm mb-4 min-h-[100px]"
                        />

                        <View className="flex-row justify-between items-center bg-gray-50 p-4 rounded-2xl border border-slate-100 mb-6">
                            <View>
                                <Text className="text-slate-800 font-bold text-sm">Active & Enforced</Text>
                                <Text className="text-gray-400 text-[10px]">Show dynamically to hostel students</Text>
                            </View>
                            <Switch value={isActive} onValueChange={setIsActive} />
                        </View>

                        <View className="flex-row gap-x-3">
                            <TouchableOpacity
                                onPress={() => setShowForm(false)}
                                className="flex-1 bg-slate-50 border border-slate-100 py-4 rounded-2xl items-center"
                            >
                                <Text className="text-slate-500 font-bold">Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSaveRule}
                                disabled={saving}
                                className="flex-1 bg-primary py-4 rounded-2xl items-center"
                            >
                                {saving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Save Rule</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : loading ? (
                    <ActivityIndicator size="large" color="#3B82F6" className="mt-20" />
                ) : rules.length > 0 ? (
                    rules.map((rule) => (
                        <View
                            key={rule.id}
                            className="bg-white border border-gray-100 rounded-[28px] p-5 mb-4"
                            style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}
                        >
                            <View className="flex-row justify-between items-start mb-2">
                                <Text className="text-primary font-bold text-base flex-1">{rule.title}</Text>
                                <View className={`px-2 py-0.5 rounded-full ${rule.is_active ? 'bg-green-50' : 'bg-gray-100'}`}>
                                    <Text className={`text-[8px] font-bold uppercase ${rule.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                        {rule.is_active ? 'Enforced' : 'Inactive'}
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-slate-500 text-xs leading-5 mb-4">{rule.description}</Text>

                            <View className="h-[1px] bg-slate-50 my-2" />

                            <View className="flex-row justify-end gap-x-4 mt-2">
                                <TouchableOpacity
                                    onPress={() => handleEdit(rule)}
                                    className="flex-row items-center text-slate-500 px-2 py-1"
                                >
                                    <Edit2 size={14} color="#64748B" />
                                    <Text className="text-slate-500 text-xs font-semibold ml-1">Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDelete(rule.id)}
                                    className="flex-row items-center text-red-500 px-2 py-1"
                                >
                                    <Trash2 size={14} color="#EF4444" />
                                    <Text className="text-red-500 text-xs font-semibold ml-1">Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                ) : (
                    <View className="mt-20 items-center justify-center p-6 bg-white border border-gray-100 rounded-[32px]">
                        <ShieldAlert size={48} color="#CBD5E1" />
                        <Text className="text-primary font-bold text-lg mt-4">No Rules Created</Text>
                        <Text className="text-gray-400 text-center mt-2 mb-6 text-xs">
                            Define specific codes of conduct, privacy, noise limits and safety rules for this hostel.
                        </Text>
                        <TouchableOpacity
                            onPress={() => setShowForm(true)}
                            className="bg-blue-50 px-8 py-4 rounded-2xl"
                        >
                            <Text className="text-blue-600 font-bold">Add First Rule</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
