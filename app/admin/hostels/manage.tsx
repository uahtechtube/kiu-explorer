import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
    Alert, TextInput, Modal, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ChevronLeft, Plus, Edit2, Trash2, ChevronDown, ChevronUp,
    Bed, DollarSign, Users, X, Save, AlertTriangle, MapPin,
} from 'lucide-react-native';
import api from '../../../lib/api';

interface Bed {
    id: number;
    bed_number: string;
    is_occupied: boolean;
    student?: {
        id: number;
        name: string;
        matric_number: string;
    };
}

interface Room {
    id: number;
    room_number: string;
    capacity: number;
    available_slots: number;
    price_per_semester: number;
    status: 'available' | 'full' | 'maintenance';
    amenities: string[];
    beds?: Bed[];
}

interface Hostel {
    id: number;
    name: string;
    gender_type: 'male' | 'female' | 'mixed';
    description: string;
    rooms_count: number;
}

const GENDER_LABELS: Record<string, string> = { male: 'Male', female: 'Female', mixed: 'Mixed' };
const GENDER_COLORS: Record<string, string> = { male: '#3B82F6', female: '#EC4899', mixed: '#8B5CF6' };

export default function ManageHostels() {
    const router = useRouter();
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Expanded rooms per hostel
    const [expandedHostelId, setExpandedHostelId] = useState<number | null>(null);
    const [rooms, setRooms] = useState<Record<number, Room[]>>({});
    const [loadingRooms, setLoadingRooms] = useState<number | null>(null);

    // Edit hostel modal
    const [editHostel, setEditHostel] = useState<Hostel | null>(null);
    const [editName, setEditName] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editGender, setEditGender] = useState<'male' | 'female' | 'mixed'>('male');
    const [savingHostel, setSavingHostel] = useState(false);

    // Add hostel modal
    const [showAddHostel, setShowAddHostel] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newGender, setNewGender] = useState<'male' | 'female' | 'mixed'>('male');
    const [addingHostel, setAddingHostel] = useState(false);

    // Add room modal
    const [addRoomHostelId, setAddRoomHostelId] = useState<number | null>(null);
    const [newRoomNumber, setNewRoomNumber] = useState('');
    const [newRoomCapacity, setNewRoomCapacity] = useState('4');
    const [newRoomPrice, setNewRoomPrice] = useState('25000');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [addingRoom, setAddingRoom] = useState(false);

    // Campus locations state
    const [locations, setLocations] = useState<any[]>([]);
    const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

    const fetchHostelsAndLocations = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/hostels');
            setHostels(response.data.data);

            const locResponse = await api.get('/campus/locations');
            const locData = locResponse.data.data || locResponse.data || [];
            setLocations(locData);
            if (locData.length > 0) {
                setSelectedLocationId(locData[0].id);
            }
        } catch (error) {
            console.error('Error fetching admin hostels or locations', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHostels = fetchHostelsAndLocations;

    useEffect(() => { fetchHostelsAndLocations(); }, []);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchHostelsAndLocations();
        setRefreshing(false);
    }, [fetchHostelsAndLocations]);

    const toggleRooms = async (hostelId: number) => {
        if (expandedHostelId === hostelId) {
            setExpandedHostelId(null);
            return;
        }
        setExpandedHostelId(hostelId);
        if (!rooms[hostelId]) {
            try {
                setLoadingRooms(hostelId);
                const r = await api.get(`/admin/hostels/${hostelId}/rooms`);
                setRooms(prev => ({ ...prev, [hostelId]: r.data.data }));
            } catch {
                Alert.alert('Error', 'Failed to load rooms.');
            } finally {
                setLoadingRooms(null);
            }
        }
    };

    const openEditHostel = (hostel: Hostel) => {
        setEditHostel(hostel);
        setEditName(hostel.name);
        setEditDesc(hostel.description);
        setEditGender(hostel.gender_type);
    };

    const saveEditHostel = async () => {
        if (!editHostel) return;
        try {
            setSavingHostel(true);
            await api.put(`/admin/hostels/${editHostel.id}`, {
                name: editName,
                description: editDesc,
                gender_type: editGender,
            });
            Alert.alert('Success', 'Hostel updated successfully.');
            setEditHostel(null);
            fetchHostels();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update hostel.');
        } finally {
            setSavingHostel(false);
        }
    };

    const handleDeleteHostel = (hostel: Hostel) => {
        Alert.alert(
            'Delete Hostel',
            `Are you sure you want to delete "${hostel.name}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/hostels/${hostel.id}`);
                            Alert.alert('Deleted', 'Hostel removed successfully.');
                            fetchHostels();
                        } catch (error: any) {
                            Alert.alert('Error', error.response?.data?.message || 'Cannot delete hostel.');
                        }
                    },
                },
            ]
        );
    };

    const handleAddHostel = async () => {
        if (!newName.trim()) {
            Alert.alert('Required', 'Please enter a hostel name.');
            return;
        }
        try {
            setAddingHostel(true);
            const r = await api.post('/admin/hostels', {
                name: newName.trim(),
                description: newDesc.trim(),
                gender_type: newGender,
                campus_location_id: selectedLocationId || 1,
            });
            Alert.alert('Success', 'Hostel created successfully.');
            setShowAddHostel(false);
            setNewName(''); setNewDesc(''); setNewGender('male');
            fetchHostels();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create hostel.');
        } finally {
            setAddingHostel(false);
        }
    };

    const handleAddRoom = async () => {
        if (!newRoomNumber.trim()) {
            Alert.alert('Required', 'Please enter a room number.');
            return;
        }
        try {
            setAddingRoom(true);
            await api.post(`/admin/hostels/${addRoomHostelId}/rooms`, {
                room_number: newRoomNumber.trim(),
                capacity: parseInt(newRoomCapacity) || 4,
                price_per_semester: parseFloat(newRoomPrice) || 25000,
                amenities: selectedAmenities.length > 0 ? selectedAmenities : ['WiFi', 'Ceiling Fan', 'Study Desk', 'Bed Frame'],
            });
            Alert.alert('Success', 'Room added successfully.');
            // Refresh rooms for this hostel
            if (addRoomHostelId !== null) {
                const r = await api.get(`/admin/hostels/${addRoomHostelId}/rooms`);
                setRooms(prev => ({ ...prev, [addRoomHostelId!]: r.data.data }));
            }
            setAddRoomHostelId(null);
            setNewRoomNumber(''); setNewRoomCapacity('4'); setNewRoomPrice('25000'); setSelectedAmenities([]);
            fetchHostels(); // refresh room count
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to add room.');
        } finally {
            setAddingRoom(false);
        }
    };

    const getRoomStatusColor = (status: string) => {
        switch (status) {
            case 'available': return '#10B981';
            case 'full': return '#EF4444';
            case 'maintenance': return '#F59E0B';
            default: return '#9CA3AF';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-50">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ChevronLeft size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text className="text-primary text-xl font-bold">Manage Facilities</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setShowAddHostel(true)}
                    className="bg-primary w-10 h-10 rounded-full items-center justify-center"
                >
                    <Plus size={20} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-6 pt-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#3B82F6" className="mt-20" />
                ) : hostels.length === 0 ? (
                    <View className="mt-20 items-center">
                        <Text className="text-gray-400 text-center">No hostels found. Add one to get started.</Text>
                    </View>
                ) : (
                    hostels.map((hostel) => (
                        <View key={hostel.id} className="bg-white border border-gray-100 rounded-[32px] shadow-sm mb-6 overflow-hidden">
                            {/* Header */}
                            <View className="p-6">
                                <View className="flex-row justify-between items-start mb-3">
                                    <View className="flex-1">
                                        <Text className="text-primary font-bold text-lg">{hostel.name}</Text>
                                        <View className="flex-row items-center mt-1">
                                            <View
                                                className="px-2 py-0.5 rounded-md mr-2"
                                                style={{ backgroundColor: `${GENDER_COLORS[hostel.gender_type]}15` }}
                                            >
                                                <Text
                                                    className="text-[8px] font-bold uppercase"
                                                    style={{ color: GENDER_COLORS[hostel.gender_type] }}
                                                >
                                                    {GENDER_LABELS[hostel.gender_type]}
                                                </Text>
                                            </View>
                                            <Text className="text-gray-400 text-[10px] font-bold uppercase">
                                                {hostel.rooms_count} Room{hostel.rooms_count !== 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row space-x-2">
                                        <TouchableOpacity
                                            onPress={() => openEditHostel(hostel)}
                                            className="p-2 bg-gray-50 rounded-xl"
                                        >
                                            <Edit2 size={16} color="#64748B" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteHostel(hostel)}
                                            className="p-2 bg-rose-50 rounded-xl ml-2"
                                        >
                                            <Trash2 size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text className="text-gray-500 text-xs mb-4 leading-4">{hostel.description}</Text>

                                {/* Room management toggle */}
                                <View className="flex-row space-x-2">
                                    <TouchableOpacity
                                        onPress={() => toggleRooms(hostel.id)}
                                        className="flex-1 bg-primary/5 py-3 rounded-xl items-center flex-row justify-center border border-primary/10"
                                    >
                                        <Bed size={16} color="#3B82F6" />
                                        <Text className="text-primary font-bold text-xs ml-2">
                                            {expandedHostelId === hostel.id ? 'Hide Rooms' : 'Manage Rooms'}
                                        </Text>
                                        {expandedHostelId === hostel.id
                                            ? <ChevronUp size={14} color="#3B82F6" className="ml-1" />
                                            : <ChevronDown size={14} color="#3B82F6" className="ml-1" />
                                        }
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => { setAddRoomHostelId(hostel.id); setExpandedHostelId(hostel.id); }}
                                        className="bg-green-50 px-3 py-3 rounded-xl items-center justify-center border border-green-100 ml-2"
                                    >
                                        <Plus size={16} color="#10B981" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Rooms Panel */}
                            {expandedHostelId === hostel.id && (
                                <View className="border-t border-gray-50 bg-gray-50/50 px-6 pb-6">
                                    {/* Add Room Form */}
                                    {addRoomHostelId === hostel.id && (
                                        <View className="bg-white rounded-2xl p-4 mt-4 mb-4 border border-green-100">
                                            <Text className="text-primary font-bold mb-4">Add New Room</Text>
                                            <View className="flex-row space-x-3 mb-3">
                                                <View className="flex-1">
                                                    <Text className="text-gray-500 text-xs font-semibold mb-1">Room Number</Text>
                                                    <TextInput
                                                        className="bg-gray-50 px-3 h-10 rounded-xl border border-gray-100 text-primary text-sm"
                                                        placeholder="e.g. A01"
                                                        value={newRoomNumber}
                                                        onChangeText={setNewRoomNumber}
                                                    />
                                                </View>
                                                <View className="flex-1 ml-3">
                                                    <Text className="text-gray-500 text-xs font-semibold mb-1">Capacity</Text>
                                                    <TextInput
                                                        className="bg-gray-50 px-3 h-10 rounded-xl border border-gray-100 text-primary text-sm"
                                                        placeholder="4"
                                                        keyboardType="numeric"
                                                        value={newRoomCapacity}
                                                        onChangeText={setNewRoomCapacity}
                                                    />
                                                </View>
                                            </View>
                                            <Text className="text-gray-500 text-xs font-semibold mb-1">Price per Semester (₦)</Text>
                                            <TextInput
                                                className="bg-gray-50 px-3 h-10 rounded-xl border border-gray-100 text-primary text-sm mb-3"
                                                placeholder="25000"
                                                keyboardType="numeric"
                                                value={newRoomPrice}
                                                onChangeText={setNewRoomPrice}
                                            />
                                            <Text className="text-gray-500 text-xs font-semibold mb-2">Amenities</Text>
                                            <View className="flex-row flex-wrap mb-4">
                                                {['WiFi', 'Air Conditioning', 'Study Desk', 'En-suite Bathroom', 'Wardrobe', 'Ceiling Fan', 'Balcony'].map((ame) => {
                                                    const isSelected = selectedAmenities.includes(ame);
                                                    return (
                                                        <TouchableOpacity
                                                            key={ame}
                                                            onPress={() => {
                                                                if (isSelected) {
                                                                    setSelectedAmenities(selectedAmenities.filter((a) => a !== ame));
                                                                } else {
                                                                    setSelectedAmenities([...selectedAmenities, ame]);
                                                                }
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg mr-2 mb-2 border ${
                                                                isSelected ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 border-gray-100'
                                                            }`}
                                                        >
                                                            <Text className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-slate-500'}`}>
                                                                {ame}
                                                            </Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </View>

                                            <View className="flex-row space-x-2">
                                                <TouchableOpacity
                                                    onPress={() => setAddRoomHostelId(null)}
                                                    className="flex-1 bg-gray-100 py-3 rounded-xl items-center"
                                                >
                                                    <Text className="text-gray-500 font-bold text-sm">Cancel</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={handleAddRoom}
                                                    disabled={addingRoom}
                                                    className="flex-1 bg-green-600 py-3 rounded-xl items-center ml-2"
                                                >
                                                    {addingRoom
                                                        ? <ActivityIndicator size="small" color="white" />
                                                        : <Text className="text-white font-bold text-sm">Add Room</Text>
                                                    }
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    {loadingRooms === hostel.id ? (
                                        <ActivityIndicator size="small" color="#3B82F6" className="mt-4" />
                                    ) : (rooms[hostel.id] ?? []).length === 0 ? (
                                        <View className="py-6 items-center">
                                            <Text className="text-gray-400 text-sm">No rooms yet. Tap + to add one.</Text>
                                        </View>
                                    ) : (
                                        (rooms[hostel.id] ?? []).map((room) => (
                                            <View key={room.id} className="bg-white rounded-2xl p-4 mt-3 border border-gray-100">
                                                <View className="flex-row items-center">
                                                    <View className="w-12 h-12 rounded-xl bg-blue-50 items-center justify-center mr-3">
                                                        <Text className="text-blue-600 font-bold text-base">{room.room_number}</Text>
                                                    </View>
                                                    <View className="flex-1">
                                                        <View className="flex-row items-center">
                                                            <Users size={12} color="#9CA3AF" />
                                                            <Text className="text-gray-400 text-xs ml-1">
                                                                {room.available_slots}/{room.capacity} slots
                                                            </Text>
                                                        </View>
                                                        <View className="flex-row items-center mt-1">
                                                            <DollarSign size={12} color="#9CA3AF" />
                                                            <Text className="text-gray-500 text-xs ml-1">
                                                                ₦{room.price_per_semester?.toLocaleString()}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                    <View
                                                        className="px-2 py-1 rounded-lg"
                                                        style={{ backgroundColor: `${getRoomStatusColor(room.status)}15` }}
                                                    >
                                                        <Text
                                                            className="text-[8px] font-bold uppercase"
                                                            style={{ color: getRoomStatusColor(room.status) }}
                                                        >
                                                            {room.status}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Beds List */}
                                                {room.beds && room.beds.length > 0 && (
                                                    <View className="mt-4 pt-3 border-t border-gray-50 flex-row flex-wrap">
                                                        {room.beds.map(bed => (
                                                            <View key={bed.id} className="w-[48%] bg-gray-50 rounded-lg p-2 mr-[2%] mb-2 border border-gray-100 flex-row items-center">
                                                                <Bed size={14} color={bed.is_occupied ? "#EF4444" : "#10B981"} />
                                                                <View className="ml-2 flex-1">
                                                                    <Text className="text-xs font-bold text-gray-700">{bed.bed_number}</Text>
                                                                    <Text className="text-[10px] text-gray-500 truncate" numberOfLines={1}>
                                                                        {bed.is_occupied && bed.student ? bed.student.name : 'Available'}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        ))}
                                                    </View>
                                                )}
                                            </View>
                                        ))
                                    )}
                                </View>
                            )}
                        </View>
                    ))
                )}
                <View className="h-10" />
            </ScrollView>

            {/* Edit Hostel Modal */}
            <Modal visible={!!editHostel} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-primary text-xl font-bold">Edit Hostel</Text>
                            <TouchableOpacity onPress={() => setEditHostel(null)}>
                                <X size={24} color="#0F172A" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Hostel Name</Text>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl border border-gray-100 text-primary mb-4"
                            value={editName}
                            onChangeText={setEditName}
                        />

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Description</Text>
                        <TextInput
                            className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-primary mb-4"
                            style={{ height: 80 }}
                            multiline
                            textAlignVertical="top"
                            value={editDesc}
                            onChangeText={setEditDesc}
                        />

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Gender Type</Text>
                        <View className="flex-row space-x-2 mb-6">
                            {(['male', 'female', 'mixed'] as const).map(g => (
                                <TouchableOpacity
                                    key={g}
                                    onPress={() => setEditGender(g)}
                                    className={`flex-1 py-3 rounded-xl items-center ${editGender === g ? 'bg-primary' : 'bg-gray-100'}`}
                                >
                                    <Text className={`font-bold text-sm capitalize ${editGender === g ? 'text-white' : 'text-gray-500'}`}>
                                        {g}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={saveEditHostel}
                            disabled={savingHostel}
                            className="bg-primary py-4 rounded-2xl items-center flex-row justify-center"
                        >
                            {savingHostel
                                ? <ActivityIndicator color="white" />
                                : <><Save size={18} color="white" /><Text className="text-white font-bold ml-2">Save Changes</Text></>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Hostel Modal */}
            <Modal visible={showAddHostel} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-primary text-xl font-bold">New Hostel</Text>
                            <TouchableOpacity onPress={() => setShowAddHostel(false)}>
                                <X size={24} color="#0F172A" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Hostel Name</Text>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl border border-gray-100 text-primary mb-4"
                            placeholder="e.g. Nelson Mandela Hall"
                            value={newName}
                            onChangeText={setNewName}
                        />

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Description</Text>
                        <TextInput
                            className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-primary mb-4"
                            style={{ height: 80 }}
                            multiline
                            textAlignVertical="top"
                            placeholder="Brief description of the hostel..."
                            value={newDesc}
                            onChangeText={setNewDesc}
                        />

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Campus Location</Text>
                        <View className="flex-row mb-4">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                {locations.map((loc) => (
                                    <TouchableOpacity
                                        key={loc.id}
                                        onPress={() => setSelectedLocationId(loc.id)}
                                        className={`px-4 py-2.5 rounded-xl mr-2 border flex-row items-center ${
                                            selectedLocationId === loc.id ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-100'
                                        }`}
                                    >
                                        <MapPin size={12} color={selectedLocationId === loc.id ? 'white' : '#64748B'} className="mr-1" />
                                        <Text className={`text-xs font-semibold ${selectedLocationId === loc.id ? 'text-white' : 'text-slate-500'}`}>
                                            {loc.name}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Gender Type</Text>
                        <View className="flex-row space-x-2 mb-6">
                            {(['male', 'female', 'mixed'] as const).map(g => (
                                <TouchableOpacity
                                    key={g}
                                    onPress={() => setNewGender(g)}
                                    className={`flex-1 py-3 rounded-xl items-center ${newGender === g ? 'bg-primary' : 'bg-gray-100'}`}
                                >
                                    <Text className={`font-bold text-sm capitalize ${newGender === g ? 'text-white' : 'text-gray-500'}`}>
                                        {g}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={handleAddHostel}
                            disabled={addingHostel}
                            className="bg-primary py-4 rounded-2xl items-center flex-row justify-center"
                        >
                            {addingHostel
                                ? <ActivityIndicator color="white" />
                                : <><Plus size={18} color="white" /><Text className="text-white font-bold ml-2">Create Hostel</Text></>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
