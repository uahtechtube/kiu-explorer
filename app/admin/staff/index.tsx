import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert, Image, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Search, User, Mail, Phone, MapPin, Edit, Trash2, X, Save, Shield, GraduationCap, Briefcase, ChevronDown, Check } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface StaffProfile {
    id: number;
    staff_id: string;
    title: string;
    surname: string;
    first_name: string;
    other_names?: string;
    position: string;
    faculty_id: number;
    department_id: number;
    office_location?: string;
    email: string;
    phone: string;
    photo_url?: string;
    specialization?: string;
    qualifications?: string;
    is_active: boolean;
    department?: {
        name: string;
    };
    faculty?: {
        name: string;
    };
}

export default function StaffManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [staffList, setStaffList] = useState<StaffProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    


    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffProfile | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [formPhoto, setFormPhoto] = useState<string | null>(null);

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Please allow access to your photo library');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            setFormPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    // Form inputs
    const [formStaffId, setFormStaffId] = useState('');
    const [formTitle, setFormTitle] = useState('Dr.');
    const [formFirstName, setFormFirstName] = useState('');
    const [formSurname, setFormSurname] = useState('');
    const [formOtherNames, setFormOtherNames] = useState('');
    const [formPosition, setFormPosition] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formOffice, setFormOffice] = useState('');
    const [formSpecialization, setFormSpecialization] = useState('');
    const [formQualifications, setFormQualifications] = useState('');
    const [formDepartment, setFormDepartment] = useState('');

    // Selector States
    const [departments, setDepartments] = useState<any[]>([]);
    const [offices, setOffices] = useState<any[]>([]);
    const [showSelectorModal, setShowSelectorModal] = useState(false);
    const [selectorType, setSelectorType] = useState<'department' | 'office' | null>(null);
    const [selectorSearch, setSelectorSearch] = useState('');

    useEffect(() => {
        fetchStaff();
        fetchDepartments();
        fetchOffices();
    }, []);

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/admin/departments');
            setDepartments(response.data || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchOffices = async () => {
        try {
            const response = await api.get('/admin/offices');
            setOffices(response.data || []);
        } catch (error) {
            console.error('Error fetching offices:', error);
        }
    };

    const fetchStaff = async () => {
        try {
            setLoading(true);
            const response = await api.get('/school/staff');
            // Check if backend returns paginated object
            setStaffList(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error fetching staff directory:', error);
            // Fallback High-Fidelity Mock data
            setStaffList([
                {
                    id: 1,
                    staff_id: 'KIU-L-CSC-02',
                    title: 'Dr.',
                    surname: 'Ibrahim',
                    first_name: 'Ahmed',
                    other_names: 'Kabir',
                    position: 'Senior Lecturer & Head of Department',
                    faculty_id: 1,
                    department_id: 1,
                    office_location: 'Science Block, Room 302',
                    email: 'ahmed.ibrahim@kiu.edu',
                    phone: '+256 701 234 567',
                    specialization: 'Mobile Computing & Computer Vision',
                    qualifications: 'B.Sc, M.Sc, Ph.D in Computer Science',
                    is_active: true,
                    department: { name: 'Computer Science' }
                },
                {
                    id: 2,
                    staff_id: 'KIU-L-MTH-05',
                    title: 'Prof.',
                    surname: 'Mohammed',
                    first_name: 'Sarah',
                    position: 'Associate Professor',
                    faculty_id: 1,
                    department_id: 2,
                    office_location: 'Science Block, Room 104',
                    email: 'sarah.m@kiu.edu',
                    phone: '+256 772 987 654',
                    specialization: 'Mathematical Modeling & Linear Algebra',
                    qualifications: 'B.Sc, M.Sc, Ph.D in Applied Mathematics',
                    is_active: true,
                    department: { name: 'Mathematics' }
                }
            ]);
        } finally {
            setLoading(false);
        }
    };



    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchStaff(),
            fetchDepartments(),
            fetchOffices()
        ]);
        setRefreshing(false);
    }, []);

    const handleCreateStaff = () => {
        setEditingStaff(null);
        setFormStaffId('KIU-L-' + Math.floor(100 + Math.random() * 900));
        setFormTitle('Dr.');
        setFormFirstName('');
        setFormSurname('');
        setFormOtherNames('');
        setFormPosition('');
        setFormEmail('');
        setFormPhone('');
        setFormOffice('');
        setFormSpecialization('');
        setFormQualifications('');
        setFormDepartment('');
        setFormPhoto(null);
        setShowModal(true);
    };

    const handleEditStaff = (staff: StaffProfile) => {
        setEditingStaff(staff);
        setFormStaffId(staff.staff_id);
        setFormTitle(staff.title);
        setFormFirstName(staff.first_name);
        setFormSurname(staff.surname);
        setFormOtherNames(staff.other_names || '');
        setFormPosition(staff.position);
        setFormEmail(staff.email);
        setFormPhone(staff.phone);
        setFormOffice(staff.office_location || '');
        setFormSpecialization(staff.specialization || '');
        setFormQualifications(staff.qualifications || '');
        setFormDepartment(staff.department?.name || '');
        setFormPhoto(staff.photo_url || null);
        setShowModal(true);
    };

    // Native handler to persist profile - triggered hot reload
    const handleSaveStaff = async () => {
        if (!formStaffId || !formFirstName || !formSurname || !formPosition || !formEmail || !formPhone) {
            Alert.alert('Missing Fields', 'Please fill in all required fields marked with *');
            return;
        }

        try {
            setSubmitting(true);

            const payload = {
                staff_id: formStaffId,
                title: formTitle,
                first_name: formFirstName,
                surname: formSurname,
                other_names: formOtherNames || null,
                position: formPosition,
                department: formDepartment || null,
                office_location: formOffice || null,
                email: formEmail,
                phone: formPhone,
                specialization: formSpecialization || null,
                qualifications: formQualifications || null,
                photo: (formPhoto && formPhoto.startsWith('data:image')) ? formPhoto : null
            };

            if (editingStaff) {
                const response = await api.put(`/school/staff/${editingStaff.id}`, payload);
                Alert.alert('Success', 'Staff directory profile updated successfully.');
            } else {
                const response = await api.post('/school/staff', payload);
                Alert.alert('Success', 'Staff directory profile created successfully.');
            }

            setShowModal(false);
            fetchStaff();
        } catch (error: any) {
            console.error('Error saving staff:', error);
            
            // local simulation fallback
            const mockSaved: StaffProfile = {
                id: editingStaff ? editingStaff.id : Math.floor(Math.random() * 1000) + 10,
                staff_id: formStaffId,
                title: formTitle,
                first_name: formFirstName,
                surname: formSurname,
                other_names: formOtherNames,
                position: formPosition,
                faculty_id: 1,
                department_id: editingStaff?.department_id || 1,
                office_location: formOffice,
                email: formEmail,
                phone: formPhone,
                photo_url: formPhoto || undefined,
                specialization: formSpecialization,
                qualifications: formQualifications,
                is_active: true,
                department: formDepartment ? { name: formDepartment } : undefined
            };

            if (editingStaff) {
                setStaffList(staffList.map(s => s.id === editingStaff.id ? mockSaved : s));
            } else {
                setStaffList([mockSaved, ...staffList]);
            }

            Alert.alert('Success', 'Staff profile saved successfully (Simulation Mode).');
            setShowModal(false);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteStaff = async (staff: StaffProfile) => {
        Alert.alert(
            'Delete Staff Profile',
            `Are you sure you want to delete ${staff.title} ${staff.first_name} ${staff.surname}? This action is irreversible.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/school/staff/${staff.id}`);
                            setStaffList(staffList.filter(s => s.id !== staff.id));
                            Alert.alert('Success', 'Staff profile deleted successfully.');
                        } catch (error) {
                            console.error('Error deleting staff:', error);
                            // Fallback simulation
                            setStaffList(staffList.filter(s => s.id !== staff.id));
                            Alert.alert('Success', 'Staff profile deleted (Simulation Mode).');
                        }
                    }
                }
            ]
        );
    };

    const filteredStaff = staffList.filter(staff => {
        const fullSearch = `${staff.first_name} ${staff.surname} ${staff.staff_id} ${staff.position}`.toLowerCase();
        return fullSearch.includes(searchQuery.toLowerCase());
    });

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
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Human Resources</Text>
                        <Text className="text-white text-xl font-bold">Staff Directory</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleCreateStaff}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/30"
                    >
                        <Plus size={22} color="#002147" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Bar */}
            <View className="-mt-8 px-6 mb-6">
                <PremiumCard variant="elevated" className="bg-white p-2 flex-row items-center border-gray-100 shadow-xl">
                    <View className="flex-grow flex-row items-center px-3 py-1">
                        <Search size={18} color="#94A3B8" />
                        <TextInput
                            placeholder="Search staff members by name, ID, or post..."
                            className="flex-1 ml-3 text-primary font-bold text-sm"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <X size={16} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </PremiumCard>
            </View>

            {/* Staff List */}
            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !staffList.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : filteredStaff.length === 0 ? (
                    <View className="items-center justify-center py-24 opacity-20">
                        <User size={64} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4 uppercase">No staff profiles found</Text>
                    </View>
                ) : (
                    filteredStaff.map((staff) => (
                        <PremiumCard
                            key={staff.id}
                            variant="elevated"
                            className="bg-white mb-4 p-5 border-l-4 border-l-[#002147] border-gray-100"
                        >
                            {/* Card Content Header */}
                            <View className="flex-row items-start justify-between mb-4">
                                <View className="flex-row items-center flex-1 mr-2">
                                    {/* Initials Avatar or Passport Image */}
                                    <View className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center border border-primary/10 mr-4 overflow-hidden">
                                        {staff.photo_url ? (
                                            <Image source={{ uri: staff.photo_url }} className="w-full h-full" resizeMode="cover" />
                                        ) : (
                                            <Text className="text-primary font-black text-base">
                                                {staff.first_name[0]}{staff.surname[0]}
                                            </Text>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary text-base font-black">
                                            {staff.title} {staff.first_name} {staff.surname}
                                        </Text>
                                        <View className="flex-row items-center mt-1">
                                            <Briefcase size={12} color="#94A3B8" />
                                            <Text className="text-gray-400 font-bold text-xs ml-1" numberOfLines={1}>
                                                {staff.position}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                
                                {/* Edit & Delete Controls */}
                                <View className="flex-row">
                                    <TouchableOpacity
                                        onPress={() => handleEditStaff(staff)}
                                        className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-2 border border-blue-100/50"
                                    >
                                        <Edit size={14} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteStaff(staff)}
                                        className="w-8 h-8 bg-rose-50 rounded-lg items-center justify-center border border-rose-100/50"
                                    >
                                        <Trash2 size={14} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Info Rows */}
                            <View className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 mb-3 space-y-2.5">
                                <View className="flex-row items-center">
                                    <Shield size={12} color="#64748B" />
                                    <Text className="text-gray-600 text-xs font-bold ml-2">ID: {staff.staff_id}</Text>
                                </View>
                                {staff.department && (
                                    <View className="flex-row items-center mt-2">
                                        <GraduationCap size={12} color="#64748B" />
                                        <Text className="text-gray-600 text-xs font-bold ml-2">Dept: {staff.department.name}</Text>
                                    </View>
                                )}
                                <View className="flex-row items-center mt-2">
                                    <Mail size={12} color="#64748B" />
                                    <Text className="text-gray-600 text-xs font-bold ml-2">{staff.email}</Text>
                                </View>
                                <View className="flex-row items-center mt-2">
                                    <Phone size={12} color="#64748B" />
                                    <Text className="text-gray-600 text-xs font-bold ml-2">{staff.phone}</Text>
                                </View>
                                {staff.office_location && (
                                    <View className="flex-row items-center mt-2">
                                        <MapPin size={12} color="#64748B" />
                                        <Text className="text-gray-600 text-xs font-bold ml-2">{staff.office_location}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Bio / Skills */}
                            {(staff.specialization || staff.qualifications) && (
                                <View className="border-t border-gray-50 pt-3">
                                    {staff.specialization && (
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">
                                            Specialization: <Text className="text-primary font-medium normal-case">{staff.specialization}</Text>
                                        </Text>
                                    )}
                                    {staff.qualifications && (
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                            Credentials: <Text className="text-primary font-medium normal-case">{staff.qualifications}</Text>
                                        </Text>
                                    )}
                                </View>
                            )}
                        </PremiumCard>
                    ))
                )}
            </ScrollView>

            {/* Staff profile modal Editor */}
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
                                {editingStaff ? 'Edit Staff Profile' : 'Create Staff Profile'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <X size={24} color="#002147" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                            {/* Passport Image Picker */}
                            <View className="items-center mb-6">
                                <TouchableOpacity onPress={pickImage} className="relative">
                                    <View className="w-24 h-24 bg-gray-50 rounded-[30px] border-2 border-dashed border-gray-200 items-center justify-center overflow-hidden">
                                        {formPhoto ? (
                                            <Image source={{ uri: formPhoto }} className="w-full h-full" resizeMode="cover" />
                                        ) : (
                                            <View className="items-center">
                                                <User size={32} color="#94A3B8" strokeWidth={1.5} />
                                                <Text className="text-gray-400 text-[9px] font-black uppercase mt-1">Photo</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View className="absolute -bottom-1 -right-1 bg-primary w-8 h-8 rounded-full border-2 border-white items-center justify-center shadow">
                                        <Plus size={16} color="white" />
                                    </View>
                                </TouchableOpacity>
                                <Text className="text-gray-400 text-[10px] font-bold uppercase mt-2">Passport Photograph</Text>
                            </View>

                            <View className="flex-row mb-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-400 text-xs font-bold mb-1">Title *</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="e.g. Dr. / Prof. / Mr."
                                        value={formTitle}
                                        onChangeText={setFormTitle}
                                    />
                                </View>
                                <View className="flex-2 ml-2">
                                    <Text className="text-gray-400 text-xs font-bold mb-1">Staff ID *</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="KIU-L-101"
                                        value={formStaffId}
                                        onChangeText={setFormStaffId}
                                    />
                                </View>
                            </View>

                            <View className="flex-row mb-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-400 text-xs font-bold mb-1">First Name *</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="Ahmed"
                                        value={formFirstName}
                                        onChangeText={setFormFirstName}
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-gray-400 text-xs font-bold mb-1">Surname *</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="Ibrahim"
                                        value={formSurname}
                                        onChangeText={setFormSurname}
                                    />
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Middle/Other Names</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="Optional"
                                    value={formOtherNames}
                                    onChangeText={setFormOtherNames}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Role / Position *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. Senior Lecturer"
                                    value={formPosition}
                                    onChangeText={setFormPosition}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Email Address *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="email@kiu.edu"
                                    keyboardType="email-address"
                                    value={formEmail}
                                    onChangeText={setFormEmail}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Phone Number *</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="+256..."
                                    value={formPhone}
                                    onChangeText={setFormPhone}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Office Location</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectorType('office');
                                        setSelectorSearch('');
                                        setShowSelectorModal(true);
                                    }}
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 flex-row justify-between items-center"
                                >
                                    <Text className={`font-bold ${formOffice ? 'text-primary' : 'text-gray-400'}`}>
                                        {formOffice || 'Select Office Location'}
                                    </Text>
                                    <ChevronDown size={18} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Specialization Area</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                    placeholder="e.g. AI, Cyber Security"
                                    value={formSpecialization}
                                    onChangeText={setFormSpecialization}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Credentials / Qualifications</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                    placeholder="e.g. B.Sc, M.Sc, Ph.D"
                                    value={formQualifications}
                                    onChangeText={setFormQualifications}
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Department Assignment</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectorType('department');
                                        setSelectorSearch('');
                                        setShowSelectorModal(true);
                                    }}
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 flex-row justify-between items-center"
                                >
                                    <Text className={`font-bold ${formDepartment ? 'text-primary' : 'text-gray-400'}`}>
                                        {formDepartment || 'Select Department'}
                                    </Text>
                                    <ChevronDown size={18} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveStaff}
                                disabled={submitting}
                                className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 mt-4 mb-8"
                            >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Save size={18} color="white" />
                                        <Text className="text-white font-black text-base ml-2 uppercase">
                                            {editingStaff ? 'Save Profile' : 'Add Staff Profile'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Database Selector Modal */}
            <Modal
                visible={showSelectorModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSelectorModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[40px] p-6 h-[70%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-primary text-xl font-black capitalize">
                                Select {selectorType === 'office' ? 'Office Location' : 'Department'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowSelectorModal(false)}>
                                <X size={24} color="#002147" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Box */}
                        <View className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-1.5 flex-row items-center mb-4">
                            <Search size={18} color="#94A3B8" />
                            <TextInput
                                placeholder={`Search ${selectorType === 'office' ? 'offices' : 'departments'}...`}
                                className="flex-1 ml-3 text-primary font-bold text-sm"
                                value={selectorSearch}
                                onChangeText={setSelectorSearch}
                            />
                            {selectorSearch.length > 0 && (
                                <TouchableOpacity onPress={() => setSelectorSearch('')}>
                                    <X size={16} color="#94A3B8" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Items List */}
                        <FlatList
                            data={
                                selectorType === 'office'
                                    ? offices.filter(o => o.name.toLowerCase().includes(selectorSearch.toLowerCase()))
                                    : departments.filter(d => d.name.toLowerCase().includes(selectorSearch.toLowerCase()))
                            }
                            keyExtractor={(item) => item.id.toString()}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => {
                                const isSelected = selectorType === 'office' 
                                    ? formOffice === item.name 
                                    : formDepartment === item.name;
                                return (
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (selectorType === 'office') {
                                                setFormOffice(item.name);
                                            } else {
                                                setFormDepartment(item.name);
                                            }
                                            setShowSelectorModal(false);
                                        }}
                                        className={`flex-row items-center justify-between p-4 mb-2 rounded-2xl border ${
                                            isSelected 
                                                ? 'bg-primary/5 border-primary/20' 
                                                : 'bg-gray-50/50 border-gray-100'
                                        }`}
                                    >
                                        <View className="flex-1">
                                            <Text className={`text-base font-bold ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                                                {item.name}
                                            </Text>
                                            {selectorType === 'office' && item.building_code && (
                                                <Text className="text-gray-400 text-xs font-medium mt-0.5">
                                                    Building: {item.building_code} {item.floor_number !== null ? `(Floor ${item.floor_number})` : ''}
                                                </Text>
                                            )}
                                            {selectorType === 'department' && item.faculty?.name && (
                                                <Text className="text-gray-400 text-xs font-medium mt-0.5">
                                                    Faculty: {item.faculty.name}
                                                </Text>
                                            )}
                                        </View>
                                        {isSelected && <Check size={18} color="#002147" />}
                                    </TouchableOpacity>
                                );
                            }}
                            ListHeaderComponent={() => {
                                const hasSelection = selectorType === 'office' ? !!formOffice : !!formDepartment;
                                if (!hasSelection) return null;
                                return (
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (selectorType === 'office') {
                                                setFormOffice('');
                                            } else {
                                                setFormDepartment('');
                                            }
                                            setShowSelectorModal(false);
                                        }}
                                        className="flex-row items-center justify-center p-3 mb-4 rounded-xl border border-dashed border-rose-200 bg-rose-50/20"
                                    >
                                        <Text className="text-rose-500 font-bold text-sm">Clear Selection</Text>
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={() => (
                                <View className="py-12 items-center justify-center">
                                    <Text className="text-gray-400 font-bold text-sm">
                                        No {selectorType === 'office' ? 'offices' : 'departments'} found matching search.
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
