import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
    Alert, TextInput, Image, RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
    ChevronLeft, Plus, Pencil, Trash2, Phone, Mail, MapPin,
    Clock, UserCheck, X, Save, User, Building2
} from 'lucide-react-native';
import api from '../../../lib/api';

interface HostelHead {
    id: number;
    hostel_id: number;
    name: string;
    title: string;
    phone: string | null;
    email: string | null;
    room_number: string | null;
    office_hours: string | null;
    bio: string | null;
    image: string | null;
    is_active: boolean;
    hostel?: { id: number; name: string; gender_type: string };
}

interface Hostel {
    id: number;
    name: string;
    gender_type: string;
}

const EMPTY_FORM = {
    hostel_id: '',
    name: '',
    title: 'Head of Hostel',
    phone: '',
    email: '',
    room_number: '',
    office_hours: '',
    bio: '',
    image: '',
    is_active: true,
};

export default function HostelHeadsAdmin() {
    const router = useRouter();
    const [heads, setHeads] = useState<HostelHead[]>([]);
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState({ ...EMPTY_FORM });
    const [saving, setSaving] = useState(false);
    const [imageUri, setImageUri] = useState<string | null>(null);

    const loadData = async () => {
        try {
            const [headsRes, hostelsRes] = await Promise.all([
                api.get('/admin/hostel-heads'),
                api.get('/admin/hostels'),
            ]);
            setHeads(headsRes.data.data || []);
            setHostels(hostelsRes.data.data || []);
        } catch (e) {
            console.error('Error loading hostel heads', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...EMPTY_FORM });
        setImageUri(null);
        setShowForm(true);
    };

    const openEdit = (head: HostelHead) => {
        setEditingId(head.id);
        setForm({
            hostel_id: String(head.hostel_id),
            name: head.name,
            title: head.title,
            phone: head.phone || '',
            email: head.email || '',
            room_number: head.room_number || '',
            office_hours: head.office_hours || '',
            bio: head.bio || '',
            image: '',
            is_active: head.is_active,
        });
        setImageUri(head.image ? `${api.defaults.baseURL?.replace('/api', '')}/storage/${head.image}` : null);
        setShowForm(true);
    };

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant media library permission.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        });
        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            setImageUri(asset.uri);
            setForm(f => ({ ...f, image: `data:image/jpeg;base64,${asset.base64}` }));
        }
    };

    const handleSave = async () => {
        if (!form.hostel_id) {
            Alert.alert('Error', 'Please select a hostel.');
            return;
        }
        if (!form.name.trim()) {
            Alert.alert('Error', 'Please enter the head\'s name.');
            return;
        }

        const payload: any = {
            hostel_id: parseInt(form.hostel_id),
            name: form.name,
            title: form.title || 'Head of Hostel',
            phone: form.phone || null,
            email: form.email || null,
            room_number: form.room_number || null,
            office_hours: form.office_hours || null,
            bio: form.bio || null,
            is_active: form.is_active,
        };

        if (form.image) {
            payload.image = form.image;
        }

        try {
            setSaving(true);
            if (editingId) {
                await api.put(`/admin/hostel-heads/${editingId}`, payload);
                Alert.alert('Success', 'Hostel head updated successfully.');
            } else {
                await api.post('/admin/hostel-heads', payload);
                Alert.alert('Success', 'Hostel head added successfully.');
            }
            setShowForm(false);
            await loadData();
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.message || 'Failed to save hostel head.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (head: HostelHead) => {
        Alert.alert(
            'Remove Head',
            `Are you sure you want to remove ${head.name} as ${head.title}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/hostel-heads/${head.id}`);
                            setHeads(prev => prev.filter(h => h.id !== head.id));
                        } catch (e: any) {
                            Alert.alert('Error', e.response?.data?.message || 'Failed to delete.');
                        }
                    },
                },
            ]
        );
    };

    const genderBadge = (g: string) => {
        if (g === 'male') return { label: 'Male', bg: '#EFF6FF', text: '#3B82F6' };
        if (g === 'female') return { label: 'Female', bg: '#FDF4FF', text: '#A855F7' };
        return { label: 'Mixed', bg: '#F0FDF4', text: '#22C55E' };
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center" edges={['top']}>
                <ActivityIndicator size="large" color="#3B82F6" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100">
                <View className="flex-row items-center flex-1">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                        <ChevronLeft size={20} color="#0F172A" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-primary text-xl font-black">Hostel Heads</Text>
                        <Text className="text-gray-400 text-xs">Manage wardens & hall masters</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={openCreate}
                    className="bg-primary px-4 py-2.5 rounded-2xl flex-row items-center shadow-sm"
                >
                    <Plus size={16} color="white" />
                    <Text className="text-white font-bold text-xs ml-1.5">Add Head</Text>
                </TouchableOpacity>
            </View>

            {showForm ? (
                /* ─── FORM ─── */
                <ScrollView className="flex-1 px-6 py-4" contentContainerStyle={{ paddingBottom: 40 }}>
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-primary text-lg font-black">
                            {editingId ? 'Edit Hostel Head' : 'Add Hostel Head'}
                        </Text>
                        <TouchableOpacity onPress={() => setShowForm(false)}>
                            <X size={22} color="#64748B" />
                        </TouchableOpacity>
                    </View>

                    {/* Photo picker */}
                    <TouchableOpacity onPress={pickImage} className="items-center mb-6">
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} className="w-28 h-28 rounded-full border-4 border-blue-100" />
                        ) : (
                            <View className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 items-center justify-center">
                                <User size={36} color="#CBD5E1" />
                            </View>
                        )}
                        <Text className="text-blue-500 font-semibold text-xs mt-2">
                            {imageUri ? 'Change Photo' : 'Upload Photo'}
                        </Text>
                    </TouchableOpacity>

                    {/* Hostel selector */}
                    <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Hostel *</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        {hostels.map(h => (
                            <TouchableOpacity
                                key={h.id}
                                onPress={() => setForm(f => ({ ...f, hostel_id: String(h.id) }))}
                                className={`px-4 py-3 rounded-2xl mr-2 border ${
                                    form.hostel_id === String(h.id)
                                        ? 'bg-primary border-primary'
                                        : 'bg-gray-50 border-gray-100'
                                }`}
                            >
                                <Text className={`text-xs font-bold ${form.hostel_id === String(h.id) ? 'text-white' : 'text-slate-600'}`}>
                                    {h.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Full Name *</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 h-12 text-primary font-semibold text-sm mb-4"
                        placeholder="e.g. Dr. Aisha Yusuf"
                        value={form.name}
                        onChangeText={v => setForm(f => ({ ...f, name: v }))}
                    />

                    <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Title / Role</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 h-12 text-primary font-semibold text-sm mb-4"
                        placeholder="e.g. Hall Warden, Provost, Hall Master"
                        value={form.title}
                        onChangeText={v => setForm(f => ({ ...f, title: v }))}
                    />

                    <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Phone Number</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 h-12 text-primary font-semibold text-sm mb-4"
                        placeholder="+234 800 000 0000"
                        keyboardType="phone-pad"
                        value={form.phone}
                        onChangeText={v => setForm(f => ({ ...f, phone: v }))}
                    />

                    <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Email Address</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 h-12 text-primary font-semibold text-sm mb-4"
                        placeholder="warden@kiu.edu.ng"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={form.email}
                        onChangeText={v => setForm(f => ({ ...f, email: v }))}
                    />

                    <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Office / Room Number</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 h-12 text-primary font-semibold text-sm mb-4"
                        placeholder="e.g. Room 001, Admin Block"
                        value={form.room_number}
                        onChangeText={v => setForm(f => ({ ...f, room_number: v }))}
                    />

                    <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Office Hours</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 h-12 text-primary font-semibold text-sm mb-4"
                        placeholder="e.g. Mon–Fri, 8:00 AM – 5:00 PM"
                        value={form.office_hours}
                        onChangeText={v => setForm(f => ({ ...f, office_hours: v }))}
                    />

                    <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Bio / Note</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-primary text-sm mb-4"
                        style={{ height: 80 }}
                        multiline
                        textAlignVertical="top"
                        placeholder="Short description or introduction..."
                        value={form.bio}
                        onChangeText={v => setForm(f => ({ ...f, bio: v }))}
                    />

                    {/* Active toggle */}
                    <View className="flex-row items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 mb-6">
                        <Text className="text-primary font-bold text-sm">Mark as Active</Text>
                        <TouchableOpacity
                            onPress={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                            className={`w-12 h-6 rounded-full ${form.is_active ? 'bg-green-500' : 'bg-gray-300'} justify-center px-1`}
                        >
                            <View className={`w-4 h-4 bg-white rounded-full shadow ${form.is_active ? 'self-end' : 'self-start'}`} />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        className="bg-primary py-4 rounded-2xl items-center shadow-sm flex-row justify-center"
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Save size={16} color="white" />
                                <Text className="text-white font-bold text-sm ml-2">
                                    {editingId ? 'Update Record' : 'Save Head'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                /* ─── LIST ─── */
                <ScrollView
                    className="flex-1 px-6 py-4"
                    contentContainerStyle={{ paddingBottom: 40 }}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                >
                    {heads.length === 0 ? (
                        <View className="items-center mt-24">
                            <UserCheck size={56} color="#CBD5E1" strokeWidth={1.5} />
                            <Text className="text-gray-400 font-bold mt-4 text-center">No hostel heads added yet.</Text>
                            <TouchableOpacity onPress={openCreate} className="mt-4 bg-primary/10 px-6 py-3 rounded-2xl border border-primary/20">
                                <Text className="text-blue-600 font-bold text-sm">Add First Head</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        heads.map(head => {
                            const badge = head.hostel ? genderBadge(head.hostel.gender_type) : { label: '', bg: '#F8FAFC', text: '#64748B' };
                            const imgUrl = head.image
                                ? `${api.defaults.baseURL?.replace('/api', '')}/storage/${head.image}`
                                : null;

                            return (
                                <View key={head.id} className="bg-white border border-gray-100 rounded-[28px] shadow-sm mb-4 p-5">
                                    <View className="flex-row items-start mb-4">
                                        {imgUrl ? (
                                            <Image source={{ uri: imgUrl }} className="w-16 h-16 rounded-full border-2 border-blue-100 mr-4" />
                                        ) : (
                                            <View className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-100 items-center justify-center mr-4">
                                                <User size={26} color="#3B82F6" />
                                            </View>
                                        )}
                                        <View className="flex-1">
                                            <View className="flex-row items-center flex-wrap mb-1">
                                                <Text className="text-primary font-black text-base mr-2">{head.name}</Text>
                                                {!head.is_active && (
                                                    <View className="bg-gray-100 px-2 py-0.5 rounded-full">
                                                        <Text className="text-gray-500 text-[9px] font-bold uppercase">Inactive</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <Text className="text-blue-500 font-semibold text-xs mb-1">{head.title}</Text>
                                            {head.hostel && (
                                                <View className="flex-row items-center">
                                                    <Building2 size={12} color="#94A3B8" />
                                                    <Text className="text-gray-400 text-xs ml-1 mr-2">{head.hostel.name}</Text>
                                                    <View style={{ backgroundColor: badge.bg }} className="px-2 py-0.5 rounded-full">
                                                        <Text style={{ color: badge.text }} className="text-[9px] font-bold uppercase">{badge.label}</Text>
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </View>

                                    {/* Contact & Details */}
                                    <View className="bg-gray-50 rounded-2xl p-4 mb-4 gap-2">
                                        {head.phone && (
                                            <View className="flex-row items-center">
                                                <Phone size={13} color="#3B82F6" />
                                                <Text className="text-slate-600 text-xs ml-2 font-medium">{head.phone}</Text>
                                            </View>
                                        )}
                                        {head.email && (
                                            <View className="flex-row items-center">
                                                <Mail size={13} color="#3B82F6" />
                                                <Text className="text-slate-600 text-xs ml-2 font-medium">{head.email}</Text>
                                            </View>
                                        )}
                                        {head.room_number && (
                                            <View className="flex-row items-center">
                                                <MapPin size={13} color="#3B82F6" />
                                                <Text className="text-slate-600 text-xs ml-2 font-medium">{head.room_number}</Text>
                                            </View>
                                        )}
                                        {head.office_hours && (
                                            <View className="flex-row items-center">
                                                <Clock size={13} color="#3B82F6" />
                                                <Text className="text-slate-600 text-xs ml-2 font-medium">{head.office_hours}</Text>
                                            </View>
                                        )}
                                    </View>

                                    {head.bio && (
                                        <Text className="text-gray-500 text-xs leading-5 mb-4 italic">"{head.bio}"</Text>
                                    )}

                                    {/* Actions */}
                                    <View className="flex-row gap-3">
                                        <TouchableOpacity
                                            onPress={() => openEdit(head)}
                                            className="flex-1 flex-row items-center justify-center bg-blue-50 border border-blue-100 py-3 rounded-2xl"
                                        >
                                            <Pencil size={14} color="#3B82F6" />
                                            <Text className="text-blue-600 font-bold text-xs ml-2">Edit</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDelete(head)}
                                            className="flex-1 flex-row items-center justify-center bg-red-50 border border-red-100 py-3 rounded-2xl"
                                        >
                                            <Trash2 size={14} color="#EF4444" />
                                            <Text className="text-red-500 font-bold text-xs ml-2">Remove</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
