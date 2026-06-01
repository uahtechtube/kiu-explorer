import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Edit2, Trash2, BookOpen, X, Save, Search, ChevronDown } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface Department {
    id: number;
    name: string;
    code: string;
    faculty?: { name: string };
}

interface Programme {
    id: number;
    department_id: number;
    name: string;
    degree_type: string;
    duration: string;
    description: string | null;
    department?: Department;
}

export default function ProgrammesManagementScreen() {
    const router = useRouter();
    const [programmes, setProgrammes] = useState<Programme[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [editingProg, setEditingProg] = useState<Programme | null>(null);
    const [name, setName] = useState('');
    const [degreeType, setDegreeType] = useState('B.Sc.');
    const [duration, setDuration] = useState('4 Years');
    const [departmentId, setDepartmentId] = useState<number | null>(null);
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    
    // Selectors state
    const [deptDropdownVisible, setDeptDropdownVisible] = useState(false);
    const [degreeDropdownVisible, setDegreeDropdownVisible] = useState(false);

    const degreeTypes = ['B.Sc.', 'B.Eng.', 'B.A.', 'B.Tech.', 'LL.B.', 'M.Sc.', 'M.Eng.', 'MBA', 'Ph.D.', 'Diploma'];
    const durations = ['1 Year', '2 Years', '3 Years', '4 Years', '5 Years', '6 Years'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [progResponse, deptResponse] = await Promise.all([
                api.get('/admin/programmes'),
                api.get('/admin/departments')
            ]);
            setProgrammes(progResponse.data || []);
            setDepartments(deptResponse.data || []);
        } catch (error: any) {
            console.error('Error fetching programmes data:', error);
            Alert.alert('Error', 'Failed to retrieve academic structures.');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenAddModal = () => {
        setEditingProg(null);
        setName('');
        setDegreeType('B.Sc.');
        setDuration('4 Years');
        setDepartmentId(departments[0]?.id || null);
        setDescription('');
        setModalVisible(true);
    };

    const handleOpenEditModal = (prog: Programme) => {
        setEditingProg(prog);
        setName(prog.name);
        setDegreeType(prog.degree_type);
        setDuration(prog.duration);
        setDepartmentId(prog.department_id);
        setDescription(prog.description || '');
        setModalVisible(true);
    };

    const handleSubmit = async () => {
        if (!name.trim() || !degreeType || !duration || !departmentId) {
            Alert.alert('Validation Error', 'Please fill in all required fields.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                department_id: departmentId,
                name: name.trim(),
                degree_type: degreeType,
                duration: duration,
                description: description.trim() || null
            };

            if (editingProg) {
                // Update
                await api.put(`/admin/programmes/${editingProg.id}`, payload);
                Alert.alert('Success', 'Programme updated successfully.');
            } else {
                // Create
                await api.post('/admin/programmes', payload);
                Alert.alert('Success', 'Programme created successfully.');
            }
            setModalVisible(false);
            fetchData();
        } catch (error: any) {
            console.error('Error saving programme:', error);
            const msg = error.response?.data?.message || error.response?.data?.errors?.name?.[0] || 'Failed to save programme details.';
            Alert.alert('Error', msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (prog: Programme) => {
        Alert.alert(
            'Delete Programme',
            `Are you sure you want to delete the ${prog.name} programme? Registered student courses or profiles may be broken.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/programmes/${prog.id}`);
                            Alert.alert('Success', 'Programme deleted successfully.');
                            fetchData();
                        } catch (error: any) {
                            console.error('Error deleting programme:', error);
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete programme.');
                        }
                    }
                }
            ]
        );
    };

    const getSelectedDeptName = () => {
        const found = departments.find(d => d.id === departmentId);
        return found ? found.name : 'Choose parent department...';
    };

    const filteredProgs = programmes.filter(item => {
        const nameMatch = item.name ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const degreeMatch = item.degree_type ? item.degree_type.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        const deptMatch = item.department?.name ? item.department.name.toLowerCase().includes(searchQuery.toLowerCase()) : false;
        return nameMatch || degreeMatch || deptMatch;
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
                        <Text className="text-white text-xl font-bold">Programmes</Text>
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
                        placeholder="Search programmes by name or degree..."
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
                    {filteredProgs.length === 0 ? (
                        <View className="items-center justify-center py-20 opacity-40">
                            <BookOpen size={64} color="#002147" strokeWidth={1} />
                            <Text className="text-primary font-black mt-4">No programmes discovered yet.</Text>
                        </View>
                    ) : (
                        filteredProgs.map((item) => (
                            <PremiumCard
                                key={item.id}
                                variant="solid"
                                className="bg-white p-5 border-gray-100 shadow-sm flex-row items-center mb-4"
                            >
                                <View className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center mr-4 border border-primary/5">
                                    <Text className="text-primary font-black text-[10px] text-center">{item.degree_type}</Text>
                                </View>

                                <View className="flex-1 mr-2">
                                    <Text className="text-primary font-black text-sm leading-tight mb-1" numberOfLines={1}>{item.name}</Text>
                                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-wider mb-0.5" numberOfLines={1}>
                                        Dept: {item.department?.name || 'General'}
                                    </Text>
                                    <Text className="text-secondary text-[8px] font-black uppercase tracking-wider">
                                        Duration: {item.duration}
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
                                {editingProg ? 'Edit Programme Details' : 'Add New Programme'}
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
                            {/* Department Dropdown Selector */}
                            <View className="mb-4">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Parent Department *</Text>
                                <TouchableOpacity
                                    onPress={() => setDeptDropdownVisible(true)}
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 flex-row items-center justify-between"
                                >
                                    <Text className="text-primary font-bold text-sm" numberOfLines={1}>{getSelectedDeptName()}</Text>
                                    <ChevronDown size={20} color="#002147" />
                                </TouchableOpacity>
                            </View>

                            <View className="mb-4 flex-row space-x-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Degree Type *</Text>
                                    <TouchableOpacity
                                        onPress={() => setDegreeDropdownVisible(true)}
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 flex-row items-center justify-between"
                                    >
                                        <Text className="text-primary font-bold text-sm">{degreeType}</Text>
                                        <ChevronDown size={16} color="#002147" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-1">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Duration *</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mt-1">
                                        {durations.map((d) => (
                                            <TouchableOpacity
                                                key={d}
                                                onPress={() => setDuration(d)}
                                                className={`mr-2 px-3 py-2 rounded-xl border ${duration === d ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-100'}`}
                                            >
                                                <Text className={`text-[10px] font-black uppercase tracking-widest ${duration === d ? 'text-secondary' : 'text-primary/40'}`}>{d}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Programme Name *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. Software Engineering"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-1.5 ml-1">Description</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                    placeholder="Overview syllabus details..."
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
                                        {editingProg ? 'Save Changes' : 'Create Programme'}
                                    </Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Inner Department Dropdown Modal Sheet */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={deptDropdownVisible}
                onRequestClose={() => setDeptDropdownVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    <View className="bg-white rounded-3xl w-full p-6 shadow-2xl max-h-[350px]">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-primary font-black text-lg">Select Department</Text>
                            <TouchableOpacity onPress={() => setDeptDropdownVisible(false)}>
                                <X size={20} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {departments.map((d) => (
                                <TouchableOpacity
                                    key={d.id}
                                    onPress={() => {
                                        setDepartmentId(d.id);
                                        setDeptDropdownVisible(false);
                                    }}
                                    className={`py-4 px-4 border-b border-gray-50 flex-row items-center justify-between ${d.id === departmentId ? 'bg-primary/5 rounded-2xl' : ''}`}
                                >
                                    <View className="flex-1 mr-2">
                                        <Text className="text-primary font-bold text-sm">{d.name}</Text>
                                        <Text className="text-gray-400 text-[8px] font-bold">Faculty: {d.faculty?.name || 'General'}</Text>
                                    </View>
                                    <Text className="text-secondary font-black text-xs">{d.code}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Inner Degree Type Dropdown Modal Sheet */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={degreeDropdownVisible}
                onRequestClose={() => setDegreeDropdownVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-6">
                    <View className="bg-white rounded-3xl w-[260px] p-6 shadow-2xl max-h-[300px]">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-primary font-black text-base">Select Degree Type</Text>
                            <TouchableOpacity onPress={() => setDegreeDropdownVisible(false)}>
                                <X size={18} color="#6B7280" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {degreeTypes.map((dt) => (
                                <TouchableOpacity
                                    key={dt}
                                    onPress={() => {
                                        setDegreeType(dt);
                                        setDegreeDropdownVisible(false);
                                    }}
                                    className={`py-3.5 px-4 border-b border-gray-50 ${dt === degreeType ? 'bg-primary/5 rounded-xl' : ''}`}
                                >
                                    <Text className="text-primary font-black text-sm text-center">{dt}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
