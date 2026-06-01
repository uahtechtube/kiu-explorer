import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Modal, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, User as UserIcon, ArrowLeft, ArrowRight, CheckCircle2, School, GraduationCap, ChevronDown, Check, Camera, Calendar } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen() {
    const router = useRouter();
    const { signIn } = useAuth();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Modal state
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'faculty' | 'department' | 'programme' | 'session' | 'gender' | null>(null);

    // Image state
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [profileImageBase64, setProfileImageBase64] = useState<string | null>(null);

    // Form Data
    const [formData, setFormData] = useState({
        surname: '',
        first_name: '',
        other_names: '',
        gender: '',
        dob: '',
        nationality: 'Nigerian',
        state_of_origin: '',
        lga: '',
        email: '',
        phone_number: '',
        alternative_phone_number: '',
        residential_address: '',
        city: '',
        state_of_residence: '',
        password: '',
        password_confirmation: '',
        faculty_id: '',
        department_id: '',
        programme_id: '',
        academic_session_id: '',
        level: '',
        matric_number: '',
        guardian_name: '',
        guardian_relationship: '',
        guardian_phone: '',
        guardian_email: '',
        guardian_address: '',
    });

    // Data from API
    const [faculties, setFaculties] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [programmes, setProgrammes] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);

    useEffect(() => {
        fetchFaculties();
        fetchSessions();
    }, []);

    const fetchFaculties = async () => {
        try {
            const response = await api.get('/faculties');
            setFaculties(response.data.data || response.data);
        } catch (error: any) {
            console.error('Error fetching faculties', error);
            Alert.alert(
                'Data Fetch Error',
                `Failed to load faculties.\nURL: ${api.defaults.baseURL}/faculties\nError: ${error.message}`
            );
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await api.get('/academic-sessions');
            setSessions(response.data.data || response.data);
        } catch (error: any) {
            console.error('Error fetching academic sessions', error);
            Alert.alert(
                'Data Fetch Error',
                `Failed to load sessions.\nURL: ${api.defaults.baseURL}/academic-sessions\nError: ${error.message}`
            );
        }
    };

    const handleFacultySelect = async (faculty: any) => {
        setFormData({ ...formData, faculty_id: faculty.id, department_id: '', programme_id: '' });
        setDepartments([]);
        setProgrammes([]);
        setModalVisible(false);
        try {
            const response = await api.get(`/faculties/${faculty.id}/departments`);
            setDepartments(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching departments', error);
        }
    };

    const handleDepartmentSelect = async (dept: any) => {
        setFormData({ ...formData, department_id: dept.id, programme_id: '' });
        setProgrammes([]);
        setModalVisible(false);
        try {
            const response = await api.get(`/departments/${dept.id}/programmes`);
            setProgrammes(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching programmes', error);
        }
    };

    const handleProgrammeSelect = (prog: any) => {
        setFormData({ ...formData, programme_id: prog.id });
        setModalVisible(false);
    };

    const handleSessionSelect = (session: any) => {
        setFormData({ ...formData, academic_session_id: session.id });
        setModalVisible(false);
    };

    const handleGenderSelect = (gender: string) => {
        setFormData({ ...formData, gender });
        setModalVisible(false);
    };

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

        if (!result.canceled && result.assets[0]) {
            setProfileImage(result.assets[0].uri);
            if (result.assets[0].base64) {
                setProfileImageBase64(result.assets[0].base64);
            }
        }
    };

    const handleRegister = async () => {
        if (!formData.faculty_id || !formData.department_id || !formData.programme_id || !formData.academic_session_id || !formData.level || !formData.matric_number) {
            Alert.alert('Error', 'Please complete all academic details');
            return;
        }

        if (!formData.guardian_name || !formData.guardian_phone || !formData.guardian_relationship) {
            Alert.alert('Error', 'Please complete guardian information');
            return;
        }

        setIsLoading(true);
        try {
            // Prepare registration data
            const registrationData = {
                ...formData,
                passport_photograph: profileImageBase64 ? `data:image/jpeg;base64,${profileImageBase64}` : undefined,
            };

            const response = await api.post('/register', registrationData);
            const { token, user } = response.data;
            await signIn(token, user);
        } catch (error: any) {
            let message = 'Registration failed. Please check your details.';
            if (error.response?.data) {
                const errors = error.response.data;
                if (typeof errors === 'object' && !errors.message) {
                    const firstError = Object.values(errors)[0];
                    if (Array.isArray(firstError)) message = firstError[0];
                    else if (typeof firstError === 'string') message = firstError;
                } else {
                    message = errors.message || message;
                }
            }
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.surname || !formData.first_name || !formData.email || !formData.password || !formData.dob) {
                Alert.alert('Error', 'Please fill in all personal details including Date of Birth');
                return;
            }
            if (formData.password !== formData.password_confirmation) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }
        } else if (step === 2) {
            if (!formData.faculty_id || !formData.department_id || !formData.programme_id || !formData.academic_session_id || !formData.level || !formData.matric_number) {
                Alert.alert('Error', 'Please complete all academic details');
                return;
            }
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const openModal = (type: 'faculty' | 'department' | 'programme' | 'session' | 'gender') => {
        if (type === 'department' && !formData.faculty_id) {
            Alert.alert('Required', 'Please select a faculty first');
            return;
        }
        if (type === 'programme' && !formData.department_id) {
            Alert.alert('Required', 'Please select a department first');
            return;
        }
        setModalType(type);
        setModalVisible(true);
    };

    const getSelectedName = (type: 'faculty' | 'department' | 'programme' | 'session' | 'gender') => {
        if (type === 'faculty') return faculties.find(f => f.id === formData.faculty_id)?.name || 'Select Faculty';
        if (type === 'department') return departments.find(d => d.id === formData.department_id)?.name || 'Select Department';
        if (type === 'programme') return programmes.find(p => p.id === formData.programme_id)?.name || 'Select Programme';
        if (type === 'session') return sessions.find(s => s.id === formData.academic_session_id)?.name || 'Select Session';
        if (type === 'gender') return formData.gender || 'Select Gender';
        return '';
    };

    const renderModalContent = () => {
        let data: any[] = [];
        let onSelect: (item: any) => void = () => { };

        if (modalType === 'faculty') {
            data = faculties;
            onSelect = handleFacultySelect;
        } else if (modalType === 'department') {
            data = departments;
            onSelect = handleDepartmentSelect;
        } else if (modalType === 'programme') {
            data = programmes;
            onSelect = handleProgrammeSelect;
        } else if (modalType === 'session') {
            data = sessions;
            onSelect = handleSessionSelect;
        } else if (modalType === 'gender') {
            data = [{ id: 'Male', name: 'Male' }, { id: 'Female', name: 'Female' }];
            onSelect = (item) => handleGenderSelect(item.id);
        }

        return (
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl min-h-[50%] p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-primary capitalize">Select {modalType}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text className="text-gray-500 font-semibold">Close</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => onSelect(item)}
                                className="flex-row items-center justify-between py-4 border-b border-gray-50"
                            >
                                <Text className="text-gray-700 text-lg flex-1 mr-4">{item.name}</Text>
                                {(formData[`${modalType}_id` as keyof typeof formData] === item.id) && (
                                    <Check size={20} color="#002147" />
                                )}
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View className="py-10 items-center">
                                <Text className="text-gray-400 italic">No {modalType}s available</Text>
                            </View>
                        }
                    />
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mt-6">
                        <TouchableOpacity
                            onPress={() => step > 1 ? prevStep() : router.back()}
                            className="w-10 h-10 items-center justify-center rounded-full bg-gray-50"
                        >
                            <ArrowLeft size={24} color="#002147" />
                        </TouchableOpacity>
                        <View className="flex-row space-x-2">
                            {[1, 2, 3].map((s) => (
                                <View
                                    key={s}
                                    className={`h-2 w-8 rounded-full ${step >= s ? 'bg-primary' : 'bg-gray-100'}`}
                                />
                            ))}
                        </View>
                    </View>

                    <View className="mt-8">
                        <Text className="text-3xl font-bold text-primary">
                            {step === 1 ? 'Create Account' : step === 2 ? 'Academic Info' : 'Bio Data'}
                        </Text>
                        <Text className="text-gray-500 mt-2">
                            {step === 1 ? 'Join the KIU Explorer community' : step === 2 ? 'Tell us about your studies at KIU' : 'A few more personal details'}
                        </Text>
                    </View>

                    {step === 1 ? (
                        /* Step 1: Personal Details */
                        <View className="mt-8 space-y-4">
                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Surname</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                                    <UserIcon size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary"
                                        placeholder="Enter surname"
                                        value={formData.surname}
                                        onChangeText={(val) => setFormData({ ...formData, surname: val })}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">First Name</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                                    <UserIcon size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary"
                                        placeholder="Enter first name"
                                        value={formData.first_name}
                                        onChangeText={(val) => setFormData({ ...formData, first_name: val })}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Other Names (Optional)</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                                    <UserIcon size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary"
                                        placeholder="Middle name or other names"
                                        value={formData.other_names}
                                        onChangeText={(val) => setFormData({ ...formData, other_names: val })}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Date of Birth</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                                    <Calendar size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary"
                                        placeholder="YYYY-MM-DD (e.g. 2000-01-15)"
                                        value={formData.dob}
                                        onChangeText={(val) => setFormData({ ...formData, dob: val })}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Email</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                                    <Mail size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary"
                                        placeholder="email@example.com"
                                        autoCapitalize="none"
                                        keyboardType="email-address"
                                        value={formData.email}
                                        onChangeText={(val) => setFormData({ ...formData, email: val })}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Password</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                                    <Lock size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary"
                                        placeholder="••••••••"
                                        secureTextEntry
                                        value={formData.password}
                                        onChangeText={(val) => setFormData({ ...formData, password: val })}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Confirm Password</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                                    <Lock size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary"
                                        placeholder="••••••••"
                                        secureTextEntry
                                        value={formData.password_confirmation}
                                        onChangeText={(val) => setFormData({ ...formData, password_confirmation: val })}
                                    />
                                </View>
                            </View>
                        </View>
                    ) : step === 2 ? (
                        /* Step 2: Academic Details */
                        <View className="mt-8 space-y-4">
                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Faculty</Text>
                                <TouchableOpacity
                                    onPress={() => openModal('faculty')}
                                    className="flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14"
                                >
                                    <Text className={`ml-1 ${formData.faculty_id ? 'text-primary' : 'text-gray-400'}`}>
                                        {getSelectedName('faculty')}
                                    </Text>
                                    <ChevronDown size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Department</Text>
                                <TouchableOpacity
                                    onPress={() => openModal('department')}
                                    className="flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14"
                                >
                                    <Text className={`ml-1 ${formData.department_id ? 'text-primary' : 'text-gray-400'}`}>
                                        {getSelectedName('department')}
                                    </Text>
                                    <ChevronDown size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Programme</Text>
                                <TouchableOpacity
                                    onPress={() => openModal('programme')}
                                    className="flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14"
                                >
                                    <Text className={`ml-1 ${formData.programme_id ? 'text-primary' : 'text-gray-400'}`}>
                                        {getSelectedName('programme')}
                                    </Text>
                                    <ChevronDown size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Academic Session</Text>
                                <TouchableOpacity
                                    onPress={() => openModal('session')}
                                    className="flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14"
                                >
                                    <Text className={`ml-1 ${formData.academic_session_id ? 'text-primary' : 'text-gray-400'}`}>
                                        {getSelectedName('session')}
                                    </Text>
                                    <ChevronDown size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Reg/Matric Number</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                                    <GraduationCap size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary"
                                        placeholder="KIU/2026/..."
                                        value={formData.matric_number}
                                        onChangeText={(val) => setFormData({ ...formData, matric_number: val })}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-1 ml-1">Level (100, 200, ...)</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                    placeholder="e.g. 100"
                                    keyboardType="numeric"
                                    value={formData.level}
                                    onChangeText={(val) => setFormData({ ...formData, level: val })}
                                />
                            </View>
                        </View>
                    ) : (
                        /* Step 3: Bio Data */
                        <View className="mt-8 space-y-4">
                            {/* Profile Image */}
                            <View className="items-center mb-4">
                                <Text className="text-primary font-semibold mb-3">Profile Photo (Optional)</Text>
                                <TouchableOpacity
                                    onPress={pickImage}
                                    className="w-32 h-32 bg-gray-50 border-2 border-dashed border-gray-300 rounded-full items-center justify-center"
                                >
                                    {profileImage ? (
                                        <Image source={{ uri: profileImage }} className="w-32 h-32 rounded-full" />
                                    ) : (
                                        <View className="items-center">
                                            <Camera size={32} color="#6B7280" />
                                            <Text className="text-gray-400 text-xs mt-2">Tap to upload</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Gender</Text>
                                <TouchableOpacity
                                    onPress={() => openModal('gender')}
                                    className="flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14"
                                >
                                    <Text className={`ml-1 ${formData.gender ? 'text-primary' : 'text-gray-400'}`}>
                                        {getSelectedName('gender')}
                                    </Text>
                                    <ChevronDown size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Phone Number</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                    placeholder="080..."
                                    keyboardType="phone-pad"
                                    value={formData.phone_number}
                                    onChangeText={(val) => setFormData({ ...formData, phone_number: val })}
                                />
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Alternative Phone (Optional)</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                    placeholder="080..."
                                    keyboardType="phone-pad"
                                    value={formData.alternative_phone_number}
                                    onChangeText={(val) => setFormData({ ...formData, alternative_phone_number: val })}
                                />
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Nationality</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                    placeholder="e.g. Nigerian"
                                    value={formData.nationality}
                                    onChangeText={(val) => setFormData({ ...formData, nationality: val })}
                                />
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">State of Origin</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                    placeholder="Enter state"
                                    value={formData.state_of_origin}
                                    onChangeText={(val) => setFormData({ ...formData, state_of_origin: val })}
                                />
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">LGA</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                    placeholder="Enter LGA"
                                    value={formData.lga}
                                    onChangeText={(val) => setFormData({ ...formData, lga: val })}
                                />
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">City</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                    placeholder="Enter city"
                                    value={formData.city}
                                    onChangeText={(val) => setFormData({ ...formData, city: val })}
                                />
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">State of Residence</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                    placeholder="Current state of residence"
                                    value={formData.state_of_residence}
                                    onChangeText={(val) => setFormData({ ...formData, state_of_residence: val })}
                                />
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Residential Address</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary pt-4"
                                    placeholder="Enter full address"
                                    multiline
                                    style={{ height: 100, textAlignVertical: 'top' }}
                                    value={formData.residential_address}
                                    onChangeText={(val) => setFormData({ ...formData, residential_address: val })}
                                />
                            </View>

                            {/* Guardian Information */}
                            <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-6 mb-2">Guardian Information</Text>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Guardian Name</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                    placeholder="Full name"
                                    value={formData.guardian_name}
                                    onChangeText={(val) => setFormData({ ...formData, guardian_name: val })}
                                />
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Relationship</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                    placeholder="e.g. Father, Mother, Uncle"
                                    value={formData.guardian_relationship}
                                    onChangeText={(val) => setFormData({ ...formData, guardian_relationship: val })}
                                />
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Guardian Phone</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                    placeholder="080..."
                                    keyboardType="phone-pad"
                                    value={formData.guardian_phone}
                                    onChangeText={(val) => setFormData({ ...formData, guardian_phone: val })}
                                />
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Guardian Email (Optional)</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                    placeholder="email@example.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={formData.guardian_email}
                                    onChangeText={(val) => setFormData({ ...formData, guardian_email: val })}
                                />
                            </View>

                            <View>
                                <Text className="text-primary font-semibold mb-2 ml-1">Guardian Address</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary pt-4"
                                    placeholder="Enter guardian's address"
                                    multiline
                                    style={{ height: 100, textAlignVertical: 'top' }}
                                    value={formData.guardian_address}
                                    onChangeText={(val) => setFormData({ ...formData, guardian_address: val })}
                                />
                            </View>
                        </View>
                    )}

                    {/* Action Button */}
                    <View className="mt-12 mb-10">
                        <TouchableOpacity
                            onPress={step < 3 ? nextStep : handleRegister}
                            disabled={isLoading}
                            className="bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/30"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-white text-lg font-bold mr-2">
                                        {step < 3 ? 'Next' : 'Create Account'}
                                    </Text>
                                    {step < 3 ? <ArrowRight size={20} color="white" /> : <CheckCircle2 size={20} color="white" />}
                                </>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-8">
                            <Text className="text-gray-500">Already have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/login')}>
                                <Text className="text-primary font-bold">Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                {renderModalContent()}
            </Modal>
        </SafeAreaView>
    );
}
