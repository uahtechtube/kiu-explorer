import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Edit2, Trash2, MapPin, X, Save, Search } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface Office {
    id: number;
    name: string;
    description: string | null;
    operating_hours: string | null;
    contact_phone: string | null;
    contact_email: string | null;
    building_code: string | null;
    floor_number: number | null;
    is_active: boolean;
}

export default function OfficesManagementScreen() {
    const router = useRouter();
    const [offices, setOffices] = useState<Office[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [editingOffice, setEditingOffice] = useState<Office | null>(null);
    
    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [operatingHours, setOperatingHours] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [buildingCode, setBuildingCode] = useState('');
    const [floorNumber, setFloorNumber] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchOffices();
    }, []);

    const fetchOffices = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/offices');
            setOffices(response.data || []);
        } catch (error: any) {
            console.error('Error fetching offices:', error);
            Alert.alert('Error', 'Failed to retrieve offices directory.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingOffice(null);
        setName('');
        setDescription('');
        setOperatingHours('8:00 AM - 5:00 PM');
        setContactPhone('');
        setContactEmail('');
        setBuildingCode('ADMIN');
        setFloorNumber('0');
        setIsActive(true);
        setModalVisible(true);
    };

    const handleOpenEditModal = (office: Office) => {
        setEditingOffice(office);
        setName(office.name);
        setDescription(office.description || '');
        setOperatingHours(office.operating_hours || '');
        setContactPhone(office.contact_phone || '');
        setContactEmail(office.contact_email || '');
        setBuildingCode(office.building_code || '');
        setFloorNumber(office.floor_number !== null ? String(office.floor_number) : '');
        setIsActive(office.is_active);
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Please fill in all required fields.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                name: name.trim(),
                description: description.trim() || null,
                operating_hours: operatingHours.trim() || null,
                contact_phone: contactPhone.trim() || null,
                contact_email: contactEmail.trim() || null,
                building_code: buildingCode.trim().toUpperCase() || null,
                floor_number: floorNumber.trim() ? parseInt(floorNumber.trim()) : null,
                is_active: isActive
            };

            if (editingOffice) {
                // Update
                await api.put(`/admin/offices/${editingOffice.id}`, payload);
                Alert.alert('Success', 'Office profile updated successfully.');
            } else {
                // Create
                await api.post('/admin/offices', payload);
                Alert.alert('Success', 'Office profile created successfully.');
            }
            setModalVisible(false);
            fetchOffices();
        } catch (error: any) {
            console.error('Error saving office:', error);
            const msg = error.response?.data?.message || 'Failed to save office details.';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (office: Office) => {
        Alert.alert(
            'Delete Office',
            `Are you sure you want to delete ${office.name}? This will remove it from the campus map and staff directories.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/offices/${office.id}`);
                            Alert.alert('Success', 'Office deleted successfully.');
                            fetchOffices();
                        } catch (error: any) {
                            console.error('Error deleting office:', error);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete office.');
                        }
                    }
                }
            ]
        );
    };

    const filteredOffices = offices.filter(item => {
        const nameMatch = item.name ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const bldgMatch = item.building_code ? item.building_code.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        return nameMatch || bldgMatch;
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
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Administrative Units</Text>
                        <Text className="text-white text-xl font-bold">Offices & units</Text>
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
                        placeholder="Search offices by name or building..."
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
                    {filteredOffices.length === 0 ? (
                        <View className="items-center justify-center py-20 opacity-40">
                            <MapPin size={64} color="#002147" strokeWidth={1} />
                            <Text className="text-primary font-black mt-4">No campus offices discovered yet.</Text>
                        </View>
                    ) : (
                        filteredOffices.map((item) => (
                            <PremiumCard
                                key={item.id}
                                variant="solid"
                                className="bg-white p-5 border-gray-100 shadow-sm flex-row items-center mb-4"
                            >
                                <View className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center mr-4 border border-primary/5">
                                    <MapPin size={20} color="#002147" />
                                </View>

                                <View className="flex-1 mr-2">
                                    <Text className="text-primary font-black text-sm leading-tight mb-1" numberOfLines={1}>{item.name}</Text>
                                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-wider mb-0.5" numberOfLines={1}>
                                        Building: {item.building_code || 'Main'} • Floor: {item.floor_number ?? '0'}
                                    </Text>
                                    <Text className="text-secondary text-[8px] font-black uppercase tracking-wider">
                                        Hours: {item.operating_hours || '8:00 AM - 5:00 PM'}
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
                        <View className="flex-row items-center justify-between mb-6">
                            <Text className="text-primary font-black text-xl">
                                {editingOffice ? 'Edit Office Details' : 'Add Campus Office'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center border border-gray-100"
                            >
                                <X size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Modal Form */}
                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[350px] mb-4">
                            <View className="mb-4">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Office Name *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. Registrar's Office"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View className="mb-4 flex-row space-x-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Building Code</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="e.g. ADMIN"
                                        autoCapitalize="characters"
                                        value={buildingCode}
                                        onChangeText={setBuildingCode}
                                    />
                                </View>

                                <View className="flex-1">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Floor Number</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="e.g. 1"
                                        keyboardType="numeric"
                                        value={floorNumber}
                                        onChangeText={setFloorNumber}
                                    />
                                </View>
                            </View>

                            <View className="mb-4 flex-row space-x-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Outreach Phone</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="+234..."
                                        value={contactPhone}
                                        onChangeText={setContactPhone}
                                    />
                                </View>

                                <View className="flex-1">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Outreach Email</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="info@..."
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={contactEmail}
                                        onChangeText={setContactEmail}
                                    />
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Operating Hours</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. 8:00 AM - 5:00 PM"
                                    value={operatingHours}
                                    onChangeText={setOperatingHours}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Description</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                    placeholder="Overview unit description..."
                                    multiline
                                    numberOfLines={2}
                                    value={description}
                                    onChangeText={setDescription}
                                />
                            </View>

                            <View className="mb-4 flex-row items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                <View className="flex-1 mr-4">
                                    <Text className="text-primary font-black text-sm mb-0.5">Office Status</Text>
                                    <Text className="text-gray-400 text-[9px] font-bold uppercase">Mark this office as active and open to student inquiries</Text>
                                </View>
                                <Switch
                                    value={isActive}
                                    onValueChange={setIsActive}
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
                                        {editingOffice ? 'Save Changes' : 'Create Office'}
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
