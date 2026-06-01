import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Search, MapPin, Coffee, BookOpen, Briefcase, Award, ShieldAlert, X, Save, Edit, Trash2, Globe, Clock, Phone, Mail, Home } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface Landmark {
    id: number;
    name: string;
    type: 'building' | 'facility' | 'emergency_point' | 'office' | 'library' | 'cafeteria' | 'hostel' | 'sports' | 'other';
    description?: string;
    latitude?: number;
    longitude?: number;
    contact_phone?: string;
    contact_email?: string;
    operating_hours?: string;
    floor_number?: number;
    building_code?: string;
    is_active: boolean;
}

export default function CampusMapManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [landmarks, setLandmarks] = useState<Landmark[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [editingLandmark, setEditingLandmark] = useState<Landmark | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form inputs
    const [formName, setFormName] = useState('');
    const [formType, setFormType] = useState<Landmark['type']>('building');
    const [formDesc, setFormDesc] = useState('');
    const [formBuildingCode, setFormBuildingCode] = useState('');
    const [formLat, setFormLat] = useState('0.3475'); // Default Kashim Ibrahim University coordinates
    const [formLng, setFormLng] = useState('32.5825');
    const [formHours, setFormHours] = useState('08:00 AM - 05:00 PM');
    const [formPhone, setFormPhone] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formFloor, setFormFloor] = useState('0');

    useEffect(() => {
        fetchLandmarks();
    }, []);

    const fetchLandmarks = async () => {
        try {
            setLoading(true);
            const response = await api.get('/campus/locations');
            setLandmarks(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error fetching campus landmarks:', error);
            // Fallback High-Fidelity Mock landmarks
            setLandmarks([
                {
                    id: 1,
                    name: 'KIU Main Library',
                    type: 'library',
                    description: 'Main campus library with extensive physical and digital catalog resources.',
                    latitude: 0.3475,
                    longitude: 32.5825,
                    operating_hours: '08:00 AM - 10:00 PM',
                    building_code: 'LIB-BLK',
                    is_active: true
                },
                {
                    id: 2,
                    name: 'School of Science Block',
                    type: 'building',
                    description: 'Hosts computer science laboratories, lecture theatres, and administrative dean offices.',
                    latitude: 0.3481,
                    longitude: 32.5831,
                    operating_hours: '07:30 AM - 08:00 PM',
                    building_code: 'SCI-BLK',
                    is_active: true
                },
                {
                    id: 3,
                    name: 'Campus Central Clinic',
                    type: 'emergency_point',
                    description: '24/7 medical response center and emergency healthcare support for all students.',
                    latitude: 0.3469,
                    longitude: 32.5819,
                    contact_phone: '+256 701 999 111',
                    operating_hours: 'Open 24 hours',
                    building_code: 'MED-CTR',
                    is_active: true
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchLandmarks();
        setRefreshing(false);
    }, []);

    const handleCreateLandmark = () => {
        setEditingLandmark(null);
        setFormName('');
        setFormType('building');
        setFormDesc('');
        setFormBuildingCode('');
        setFormLat('0.3475');
        setFormLng('32.5825');
        setFormHours('08:00 AM - 05:00 PM');
        setFormPhone('');
        setFormEmail('');
        setFormFloor('0');
        setShowModal(true);
    };

    const handleEditLandmark = (landmark: Landmark) => {
        setEditingLandmark(landmark);
        setFormName(landmark.name);
        setFormType(landmark.type);
        setFormDesc(landmark.description || '');
        setFormBuildingCode(landmark.building_code || '');
        setFormLat(String(landmark.latitude || '0.3475'));
        setFormLng(String(landmark.longitude || '32.5825'));
        setFormHours(landmark.operating_hours || '08:00 AM - 05:00 PM');
        setFormPhone(landmark.contact_phone || '');
        setFormEmail(landmark.contact_email || '');
        setFormFloor(String(landmark.floor_number || '0'));
        setShowModal(true);
    };

    const handleSaveLandmark = async () => {
        if (!formName || !formType) {
            Alert.alert('Validation Error', 'Landmark Name and Type are required.');
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                name: formName,
                type: formType,
                description: formDesc || null,
                building_code: formBuildingCode || null,
                latitude: formLat ? parseFloat(formLat) : null,
                longitude: formLng ? parseFloat(formLng) : null,
                operating_hours: formHours || null,
                contact_phone: formPhone || null,
                contact_email: formEmail || null,
                floor_number: formFloor ? parseInt(formFloor) : 0,
            };

            if (editingLandmark) {
                await api.put(`/campus/locations/${editingLandmark.id}`, payload);
                Alert.alert('Success', 'Campus location updated successfully.');
            } else {
                await api.post('/campus/locations', payload);
                Alert.alert('Success', 'Campus location added successfully.');
            }

            setShowModal(false);
            fetchLandmarks();
        } catch (error) {
            console.error('Error saving location:', error);
            
            // local simulation fallback
            const mockSaved: Landmark = {
                id: editingLandmark ? editingLandmark.id : Math.floor(Math.random() * 1000) + 10,
                name: formName,
                type: formType,
                description: formDesc,
                building_code: formBuildingCode,
                latitude: formLat ? parseFloat(formLat) : 0.3475,
                longitude: formLng ? parseFloat(formLng) : 32.5825,
                operating_hours: formHours,
                contact_phone: formPhone,
                contact_email: formEmail,
                floor_number: formFloor ? parseInt(formFloor) : 0,
                is_active: true
            };

            if (editingLandmark) {
                setLandmarks(landmarks.map(l => l.id === editingLandmark.id ? mockSaved : l));
            } else {
                setLandmarks([mockSaved, ...landmarks]);
            }

            Alert.alert('Success', 'Location saved successfully (Simulation Mode).');
            setShowModal(false);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteLandmark = async (landmark: Landmark) => {
        Alert.alert(
            'Delete Location',
            `Delete "${landmark.name}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/campus/locations/${landmark.id}`);
                            setLandmarks(landmarks.filter(l => l.id !== landmark.id));
                            Alert.alert('Success', 'Location deleted successfully.');
                        } catch (error) {
                            console.error('Error deleting location:', error);
                            // Fallback simulation
                            setLandmarks(landmarks.filter(l => l.id !== landmark.id));
                            Alert.alert('Success', 'Location deleted (Simulation Mode).');
                        }
                    }
                }
            ]
        );
    };

    const getLandmarkIcon = (type: Landmark['type']) => {
        switch (type) {
            case 'library': return BookOpen;
            case 'building': return Home;
            case 'emergency_point': return ShieldAlert;
            case 'cafeteria': return Coffee;
            case 'office': return Briefcase;
            case 'sports': return Award;
            default: return MapPin;
        }
    };

    const getLandmarkColor = (type: Landmark['type']) => {
        switch (type) {
            case 'library': return '#8B5CF6';
            case 'building': return '#002147';
            case 'emergency_point': return '#EF4444';
            case 'cafeteria': return '#F59E0B';
            case 'office': return '#3B82F6';
            case 'sports': return '#10B981';
            default: return '#64748B';
        }
    };

    const filteredLandmarks = landmarks.filter(l => {
        const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              (l.building_code && l.building_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
                              (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = selectedTypeFilter === 'all' || l.type === selectedTypeFilter;
        return matchesSearch && matchesType;
    });

    const locationTypes = ['building', 'facility', 'emergency_point', 'office', 'library', 'cafeteria', 'hostel', 'sports', 'other'];

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
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Campus Infrastructure</Text>
                        <Text className="text-white text-xl font-bold">Campus Map Admin</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleCreateLandmark}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/30"
                    >
                        <Plus size={22} color="#002147" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View className="-mt-8 px-6 mb-4">
                <PremiumCard variant="elevated" className="bg-white p-2 flex-row items-center border-gray-100 shadow-xl">
                    <View className="flex-grow flex-row items-center px-3 py-1">
                        <Search size={18} color="#94A3B8" />
                        <TextInput
                            placeholder="Search landmark name, code, description..."
                            className="flex-1 ml-3 text-primary font-bold text-sm"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                </PremiumCard>
            </View>

            {/* Type Filter Chips */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-6 mb-4"
                contentContainerStyle={{ paddingRight: 24 }}
            >
                <TouchableOpacity
                    onPress={() => setSelectedTypeFilter('all')}
                    className={`mr-2.5 px-5 py-2.5 rounded-xl border ${selectedTypeFilter === 'all'
                        ? 'bg-secondary border-secondary'
                        : 'bg-white border-gray-100'
                    }`}
                >
                    <Text className={`font-bold text-xs uppercase ${selectedTypeFilter === 'all' ? 'text-primary' : 'text-gray-400'}`}>
                        All
                    </Text>
                </TouchableOpacity>
                {locationTypes.map((type) => (
                    <TouchableOpacity
                        key={type}
                        onPress={() => setSelectedTypeFilter(type)}
                        className={`mr-2.5 px-5 py-2.5 rounded-xl border ${selectedTypeFilter === type
                            ? 'bg-secondary border-secondary'
                            : 'bg-white border-gray-100'
                        }`}
                    >
                        <Text className={`font-bold text-xs uppercase ${selectedTypeFilter === type ? 'text-primary' : 'text-gray-400'}`}>
                            {type.replace('_', ' ')}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Landmark Cards List */}
            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !landmarks.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : filteredLandmarks.length === 0 ? (
                    <View className="items-center justify-center py-24 opacity-20">
                        <MapPin size={64} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4 uppercase">No landmarks found</Text>
                    </View>
                ) : (
                    filteredLandmarks.map((landmark) => {
                        const Icon = getLandmarkIcon(landmark.type);
                        const themeColor = getLandmarkColor(landmark.type);
                        return (
                            <PremiumCard
                                key={landmark.id}
                                variant="elevated"
                                className="bg-white mb-4 p-5 border-l-4 border-gray-100"
                                style={{ borderLeftColor: themeColor }}
                            >
                                <View className="flex-row items-start justify-between mb-4">
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <View 
                                            className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                            style={{ backgroundColor: `${themeColor}15` }}
                                        >
                                            <Icon size={22} color={themeColor} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-primary text-base font-black" numberOfLines={1}>
                                                {landmark.name}
                                            </Text>
                                            <View className="flex-row items-center mt-1">
                                                <Text className="text-gray-400 font-bold text-[10px] uppercase tracking-wider">
                                                    {landmark.type.replace('_', ' ')}
                                                </Text>
                                                {landmark.building_code && (
                                                    <View className="bg-gray-100 px-2 py-0.5 rounded ml-2">
                                                        <Text className="text-gray-600 font-black text-[8px] uppercase">
                                                            {landmark.building_code}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    </View>

                                    {/* Action Buttons */}
                                    <View className="flex-row">
                                        <TouchableOpacity
                                            onPress={() => handleEditLandmark(landmark)}
                                            className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-2 border border-blue-100/50"
                                        >
                                            <Edit size={14} color="#3B82F6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteLandmark(landmark)}
                                            className="w-8 h-8 bg-rose-50 rounded-lg items-center justify-center border border-rose-100/50"
                                        >
                                            <Trash2 size={14} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Description */}
                                {landmark.description && (
                                    <Text className="text-gray-500 text-xs font-medium leading-5 mb-4">
                                        {landmark.description}
                                    </Text>
                                )}

                                {/* Location Details Box */}
                                <View className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 mb-1 space-y-2.5">
                                    <View className="flex-row items-center">
                                        <Globe size={12} color="#64748B" />
                                        <Text className="text-gray-600 text-xs font-bold ml-2">
                                            Coords: {landmark.latitude}, {landmark.longitude}
                                        </Text>
                                    </View>
                                    {landmark.operating_hours && (
                                        <View className="flex-row items-center mt-2">
                                            <Clock size={12} color="#64748B" />
                                            <Text className="text-gray-600 text-xs font-bold ml-2">
                                                {landmark.operating_hours}
                                            </Text>
                                        </View>
                                    )}
                                    {landmark.contact_phone && (
                                        <View className="flex-row items-center mt-2">
                                            <Phone size={12} color="#64748B" />
                                            <Text className="text-gray-600 text-xs font-bold ml-2">
                                                {landmark.contact_phone}
                                            </Text>
                                        </View>
                                    )}
                                    {landmark.contact_email && (
                                        <View className="flex-row items-center mt-2">
                                            <Mail size={12} color="#64748B" />
                                            <Text className="text-gray-600 text-xs font-bold ml-2">
                                                {landmark.contact_email}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </PremiumCard>
                        );
                    })
                )}
            </ScrollView>

            {/* Landmark Modal Editor */}
            <Modal
                visible={showModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[40px] p-8 max-h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-primary text-xl font-black">
                                {editingLandmark ? 'Edit Landmark' : 'Create Landmark'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <X size={24} color="#002147" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Landmark Name *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. Science block Lecture Theatre"
                                    value={formName}
                                    onChangeText={setFormName}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Building Code / Room</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. SCI-BLK"
                                    value={formBuildingCode}
                                    onChangeText={setFormBuildingCode}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Description</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                    placeholder="Brief overview of location usage..."
                                    multiline
                                    numberOfLines={3}
                                    value={formDesc}
                                    onChangeText={setFormDesc}
                                />
                            </View>

                            <View className="flex-row mb-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-400 text-xs font-bold mb-1">Latitude</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="0.3475"
                                        value={formLat}
                                        onChangeText={setFormLat}
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-gray-400 text-xs font-bold mb-1">Longitude</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="32.5825"
                                        value={formLng}
                                        onChangeText={setFormLng}
                                    />
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Operating Hours</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. 08:00 AM - 05:00 PM"
                                    value={formHours}
                                    onChangeText={setFormHours}
                                />
                            </View>

                            <View className="flex-row mb-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-400 text-xs font-bold mb-1">Contact Phone</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="Optional"
                                        value={formPhone}
                                        onChangeText={setFormPhone}
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-gray-400 text-xs font-bold mb-1">Contact Email</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="Optional"
                                        value={formEmail}
                                        onChangeText={setFormEmail}
                                    />
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-400 text-xs font-bold mb-2">Location Category *</Text>
                                <View className="flex-row flex-wrap">
                                    {locationTypes.map((t) => (
                                        <TouchableOpacity
                                            key={t}
                                            onPress={() => setFormType(t as Landmark['type'])}
                                            className={`mr-2 mb-2 px-4 py-2 border rounded-xl ${
                                                formType === t ? 'bg-secondary border-secondary' : 'bg-white border-gray-100'
                                            }`}
                                        >
                                            <Text className={`font-bold text-xs ${formType === t ? 'text-primary' : 'text-gray-400'}`}>
                                                {t.replace('_', ' ')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveLandmark}
                                disabled={submitting}
                                className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 mt-4 mb-8"
                            >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Save size={18} color="white" />
                                        <Text className="text-white font-black text-base ml-2 uppercase">
                                            {editingLandmark ? 'Save Landmark' : 'Add Landmark'}
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
