import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Edit2, Trash2, Network, X, Save, Search, ChevronDown } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface Faculty {
    id: number;
    name: string;
    code: string;
}

interface Department {
    id: number;
    faculty_id: number;
    name: string;
    code: string;
    description: string | null;
    programmes_count?: number;
    faculty?: Faculty;
}

export default function DepartmentsManagementScreen() {
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>([]);
    const [faculties, setFaculties] = useState<Faculty[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [editingDept, setEditingDept] = useState<Department | null>(null);
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [facultyId, setFacultyId] = useState<number | null>(null);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Faculty selector dropdown state
    const [facultyDropdownVisible, setFacultyDropdownVisible] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptResponse, facultyResponse] = await Promise.all([
                api.get('/admin/departments'),
                api.get('/admin/faculties')
            ]);
            setDepartments(deptResponse.data || []);
            setFaculties(facultyResponse.data || []);
        } catch (error: any) {
            console.error('Error fetching departments data:', error);
            Alert.alert('Error', 'Failed to retrieve structural directories.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingDept(null);
        setName('');
        setCode('');
        setFacultyId(faculties[0]?.id || null);
        setDescription('');
        setModalVisible(true);
    };

    const handleOpenEditModal = (dept: Department) => {
        setEditingDept(dept);
        setName(dept.name);
        setCode(dept.code);
        setFacultyId(dept.faculty_id);
        setDescription(dept.description || '');
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!name.trim() || !code.trim() || !facultyId) {
            Alert.alert('Validation Error', 'Please fill in all required fields.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                faculty_id: facultyId,
                name: name.trim(),
                code: code.trim().toUpperCase(),
                description: description.trim() || null
            };

            if (editingDept) {
                // Update
                await api.put(`/admin/departments/${editingDept.id}`, payload);
                Alert.alert('Success', 'Department updated successfully.');
            } else {
                // Create
                await api.post('/admin/departments', payload);
                Alert.alert('Success', 'Department created successfully.');
            }
            setModalVisible(false);
            fetchData();
        } catch (error: any) {
            console.error('Error saving department:', error);
            const msg = error.response?.data?.message || error.response?.data?.errors?.name?.[0] || error.response?.data?.errors?.code?.[0] || 'Failed to save department details.';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (dept: Department) => {
        Alert.alert(
            'Delete Department',
            `Are you sure you want to delete the ${dept.name} department? This will not work if programmes are bound to it.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/departments/${dept.id}`);
                            Alert.alert('Success', 'Department deleted successfully.');
                            fetchData();
                        } catch (error: any) {
                            console.error('Error deleting department:', error);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete department.');
                        }
                    }
                }
            ]
        );
    };

    const getSelectedFacultyName = () => {
        const found = faculties.find(f => f.id === facultyId);
        return found ? found.name : 'Choose parent faculty...';
    };

    const filteredDepts = departments.filter(item => {
        const nameMatch = item.name ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const codeMatch = item.code ? item.code.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const facultyMatch = item.faculty?.name ? item.faculty.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        return nameMatch || codeMatch || facultyMatch;
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
                        <Text className="text-white text-xl font-bold">Departments</Text>
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
                        placeholder="Search departments..."
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
                    {filteredDepts.length === 0 ? (
                        <View className="items-center justify-center py-20 opacity-40">
                            <Network size={64} color="#002147" strokeWidth={1} />
                            <Text className="text-primary font-black mt-4">No departments discovered yet.</Text>
                        </View>
                    ) : (
                        filteredDepts.map((item) => (
                            <PremiumCard
                                key={item.id}
                                variant="solid"
                                className="bg-white p-5 border-gray-100 shadow-sm flex-row items-center mb-4"
                            >
                                <View className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center mr-4 border border-primary/5">
                                    <Text className="text-primary font-black text-xs">{item.code}</Text>
                                </View>

                                <View className="flex-1 mr-2">
                                    <Text className="text-primary font-black text-base leading-tight mb-1" numberOfLines={1}>{item.name}</Text>
                                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-wider mb-0.5">
                                        Faculty: {item.faculty?.name || 'General'}
                                    </Text>
                                    <Text className="text-secondary text-[8px] font-black uppercase tracking-wider">
                                        {item.programmes_count ?? 0} Programmes
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
                                {editingDept ? 'Edit Department Details' : 'Add New Department'}
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
                            {/* Faculty Dropdown Selector */}
                            <View className="mb-4">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Parent Faculty *</Text>
                                <TouchableOpacity
                                    onPress={() => setFacultyDropdownVisible(true)}
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 flex-row items-center justify-between"
                                >
                                    <Text className="text-primary font-bold text-sm">{getSelectedFacultyName()}</Text>
                                    <ChevronDown size={20} color="#002147" />
                                </TouchableOpacity>
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Department Code *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. CSC"
                                    autoCapitalize="characters"
                                    value={code}
                                    onChangeText={setCode}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Department Name *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. Computer Science"
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
                                        {editingDept ? 'Save Changes' : 'Create Department'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Inner Faculty Dropdown Modal Sheet */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={facultyDropdownVisible}
                onRequestClose={() => setFacultyDropdownVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    <View className="bg-white rounded-3xl w-full p-6 shadow-2xl max-h-[300px]">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-primary font-black text-lg">Select Faculty</Text>
                            <TouchableOpacity onPress={() => setFacultyDropdownVisible(false)}>
                                <X size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {faculties.map((f) => (
                                <TouchableOpacity
                                    key={f.id}
                                    onPress={() => {
                                        setFacultyId(f.id);
                                        setFacultyDropdownVisible(false);
                                    }}
                                    className={`py-4 px-4 border-b border-gray-50 flex-row items-center justify-between ${f.id === facultyId ? 'bg-primary/5 rounded-2xl' : ''}`}
                                >
                                    <Text className="text-primary font-bold text-sm">{f.name}</Text>
                                    <Text className="text-secondary font-black text-xs">{f.code}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
