import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Modal, FlatList, Image, TouchableWithoutFeedback, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Check, User, MessageCircle } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const LogoImage = require('../../assets/images/logo.png');

export default function LoginScreen() {
    const router = useRouter();
    const { tab } = useLocalSearchParams<{ tab?: 'login' | 'register' }>();
    const { signIn } = useAuth();

    // WhatsApp Help Support State
    const [whatsappNumber, setWhatsappNumber] = useState<string>('');
    const [apiLogoUrl, setApiLogoUrl] = useState<string>('');

    // Tab control: 'login' or 'register'
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    const [registerStep, setRegisterStep] = useState(1);
    
    // Loading State
    const [isLoading, setIsLoading] = useState(false);

    const getFormattedLogoUrl = () => {
        if (!apiLogoUrl) return null;
        if (apiLogoUrl.startsWith('http')) return apiLogoUrl;
        const cleanBase = api.defaults.baseURL?.replace('/api', '') || '';
        return `${cleanBase}/${apiLogoUrl.replace(/^\//, '')}`;
    };

    useEffect(() => {
        // Fetch school info (WhatsApp number + logo)
        api.get('/school/info')
            .then(res => {
                if (res.data && res.data.whatsapp_number) {
                    setWhatsappNumber(res.data.whatsapp_number);
                }
                if (res.data && res.data.logo_url) {
                    setApiLogoUrl(res.data.logo_url);
                }
            })
            .catch(err => console.log('Notice: Failed to fetch school info:', err));
    }, []);

    const handleOpenWhatsapp = () => {
        if (!whatsappNumber) return;
        const cleanNumber = whatsappNumber.replace(/[^\d]/g, '');
        const url = `whatsapp://send?phone=${cleanNumber}`;
        Linking.canOpenURL(url)
            .then(supported => {
                if (supported) {
                    return Linking.openURL(url);
                } else {
                    return Linking.openURL(`https://wa.me/${cleanNumber}`);
                }
            })
            .catch(err => {
                Alert.alert('Error', 'Failed to open WhatsApp');
                console.error(err);
            });
    };

    // Form inputs: Login
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Form inputs: Registration
    const [regData, setRegData] = useState({
        surname: '',
        first_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        faculty_id: '',
        department_id: '',
        programme_id: '',
        academic_session_id: '',
        level: '100',
    });

    // Dropdown Modal States
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'faculty' | 'department' | 'programme' | 'session' | 'level' | null>(null);

    // Dynamic Picker lists from API
    const [faculties, setFaculties] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [programmes, setProgrammes] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);

    useEffect(() => {
        if (tab === 'register') {
            setActiveTab('register');
        } else {
            setActiveTab('login');
        }
    }, [tab]);

    useEffect(() => {
        if (activeTab === 'register') {
            fetchFaculties();
            fetchSessions();
        }
    }, [activeTab]);

    const fetchFaculties = async () => {
        try {
            const response = await api.get('/faculties');
            setFaculties(response.data.data || response.data);
        } catch (error: any) {
            console.error('Error fetching faculties', error);
        }
    };

    const fetchSessions = async () => {
        try {
            const response = await api.get('/academic-sessions');
            setSessions(response.data.data || response.data);
        } catch (error: any) {
            console.error('Error fetching academic sessions', error);
        }
    };

    const handleFacultySelect = async (faculty: any) => {
        setRegData({ ...regData, faculty_id: faculty.id, department_id: '', programme_id: '' });
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
        setRegData({ ...regData, department_id: dept.id, programme_id: '' });
        setProgrammes([]);
        setModalVisible(false);
        try {
            const response = await api.get(`/departments/${dept.id}/programmes`);
            setProgrammes(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching programmes', error);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/login', { email, password });
            const { token, user } = response.data;
            await signIn(token, user);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Invalid credentials. Please try again.';
            Alert.alert('Login Failed', message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        // Validate academic inputs
        if (!regData.faculty_id || !regData.department_id || !regData.programme_id || !regData.academic_session_id || !regData.level) {
            Alert.alert('Validation Error', 'Please fill all academic program selections.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/register', regData);
            const { token, user } = response.data;
            await signIn(token, user);
            Alert.alert('Registration Successful', 'Welcome to KIU Explorer! Complete your profile setup in the profile section.');
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data ? JSON.stringify(error.response.data) : 'Registration failed. Try again.';
            Alert.alert('Registration Error', errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNextRegisterStep = () => {
        if (!regData.surname || !regData.first_name || !regData.email || !regData.password || !regData.password_confirmation) {
            Alert.alert('Validation Error', 'Please fill all credential fields.');
            return;
        }
        if (regData.password !== regData.password_confirmation) {
            Alert.alert('Validation Error', 'Passwords do not match.');
            return;
        }
        if (regData.password.length < 8) {
            Alert.alert('Validation Error', 'Password must be at least 8 characters.');
            return;
        }
        setRegisterStep(2);
    };

    const openDropdownModal = (type: typeof modalType) => {
        if (type === 'department' && !regData.faculty_id) {
            Alert.alert('Selection Error', 'Please select a Faculty first.');
            return;
        }
        if (type === 'programme' && !regData.department_id) {
            Alert.alert('Selection Error', 'Please select a Department first.');
            return;
        }
        setModalType(type);
        setModalVisible(true);
    };

    const getSelectedLabel = (type: string) => {
        if (type === 'faculty') return faculties.find(f => f.id === regData.faculty_id)?.name || 'Select Faculty';
        if (type === 'department') return departments.find(d => d.id === regData.department_id)?.name || 'Select Department';
        if (type === 'programme') return programmes.find(p => p.id === regData.programme_id)?.name || 'Select Programme';
        if (type === 'session') return sessions.find(s => s.id === regData.academic_session_id)?.name || 'Select Academic Session';
        if (type === 'level') return regData.level ? `${regData.level} Level` : 'Select Level';
        return '';
    };

    const renderModalContent = () => {
        let data: any[] = [];
        let onSelect: (item: any) => void = () => {};

        if (modalType === 'faculty') {
            data = faculties;
            onSelect = handleFacultySelect;
        } else if (modalType === 'department') {
            data = departments;
            onSelect = handleDepartmentSelect;
        } else if (modalType === 'programme') {
            data = programmes;
            onSelect = (item) => {
                setRegData({ ...regData, programme_id: item.id });
                setModalVisible(false);
            };
        } else if (modalType === 'session') {
            data = sessions;
            onSelect = (item) => {
                setRegData({ ...regData, academic_session_id: item.id });
                setModalVisible(false);
            };
        } else if (modalType === 'level') {
            data = [
                { id: '100', name: '100 Level' },
                { id: '200', name: '200 Level' },
                { id: '300', name: '300 Level' },
                { id: '400', name: '400 Level' },
                { id: '500', name: '500 Level' }
            ];
            onSelect = (item) => {
                setRegData({ ...regData, level: item.id });
                setModalVisible(false);
            };
        }

        return (
            <View className="flex-1 bg-black/50 justify-end">
                {/* Tap outside to close overlay */}
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View className="absolute inset-0" />
                </TouchableWithoutFeedback>
                <View className="bg-white rounded-t-[36px] min-h-[50%] p-6 shadow-2xl relative z-10">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-bold text-primary capitalize">Select {modalType}</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2 bg-gray-100 rounded-full">
                            <Text className="text-gray-500 font-bold text-xs uppercase">Close</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={data}
                        keyExtractor={(item) => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => onSelect(item)}
                                className="flex-row items-center justify-between h-14 border-b border-gray-50 px-2"
                            >
                                <Text className="text-gray-700 text-base font-medium flex-1 mr-4" numberOfLines={1}>{item.name}</Text>
                                {((modalType === 'level' ? regData.level : regData[`${modalType}_id` as keyof typeof regData]) === item.id) && (
                                    <Check size={20} color="#002147" strokeWidth={3} />
                                )}
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View className="py-10 items-center">
                                <Text className="text-gray-400 italic">No items available</Text>
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
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}
                className="flex-1"
            >
                <ScrollView 
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 240 }} 
                    className="px-8" 
                    showsVerticalScrollIndicator={false} 
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={true}
                >
                    
                    {/* Brand Banner */}
                    <View className="items-center mt-4 mb-2">
                        <View className="shadow-lg shadow-primary/10 rounded-2xl overflow-hidden bg-white p-1 border border-gray-50">
                            <Image
                                source={getFormattedLogoUrl() ? { uri: getFormattedLogoUrl()! } : LogoImage}
                                className="w-24 h-24 rounded-2xl"
                                resizeMode="contain"
                            />
                        </View>
                        <Text className="text-primary font-black text-xl mt-2">KIU Explorer</Text>
                        <Text className="text-gray-400 text-xs mt-0.5 uppercase tracking-widest font-semibold">Gateway to Excellence</Text>
                    </View>

                    {/* consolidated toggles */}
                    <View className="flex-row bg-gray-100 p-1 rounded-2xl mb-3 border border-gray-200/50">
                        <TouchableOpacity
                            onPress={() => setActiveTab('login')}
                            className={`flex-1 py-3.5 rounded-xl items-center justify-center ${activeTab === 'login' ? 'bg-primary shadow-md shadow-primary/20' : ''}`}
                        >
                            <Text className={`text-xs font-black uppercase tracking-wider ${activeTab === 'login' ? 'text-white' : 'text-gray-400'}`}>Sign In</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('register')}
                            className={`flex-1 py-3.5 rounded-xl items-center justify-center ${activeTab === 'register' ? 'bg-primary shadow-md shadow-primary/20' : ''}`}
                        >
                            <Text className={`text-xs font-black uppercase tracking-wider ${activeTab === 'register' ? 'text-white' : 'text-gray-400'}`}>Register</Text>
                        </TouchableOpacity>
                    </View>

                    {activeTab === 'login' ? (
                        /* LOGIN FORM */
                        <View className="space-y-4 pt-1 pb-6">
                            <View>
                                <Text className="text-primary font-bold text-sm mb-1.5 ml-1">Email Address</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16 shadow-inner">
                                    <Mail size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary text-base font-semibold"
                                        placeholder="name@student.kiu.edu.ng"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                            </View>

                            <View>
                                <Text className="text-primary font-bold text-sm mb-1.5 ml-1">Password</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16 shadow-inner">
                                    <Lock size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary text-base font-semibold"
                                        placeholder="••••••••"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showPassword}
                                        value={password}
                                        onChangeText={setPassword}
                                    />
                                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                        {showPassword ? (
                                            <EyeOff size={20} color="#6B7280" />
                                        ) : (
                                            <Eye size={20} color="#6B7280" />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity onPress={() => router.push('/forgot-password')} className="items-end mt-1">
                                <Text className="text-primary font-black text-sm">Forgot Password?</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleLogin}
                                disabled={isLoading}
                                className="bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/30 mt-6"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white text-lg font-bold mr-2">Login</Text>
                                        <ArrowRight size={20} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        /* REGISTER WIZARD */
                        <View className="space-y-4 pb-10">
                            {/* Step Indicators */}
                            <View className="flex-row justify-between items-center mb-2 px-2">
                                <Text className="text-gray-400 text-xs font-black uppercase">Step {registerStep} of 2</Text>
                                <Text className="text-primary text-xs font-black uppercase tracking-wider">
                                    {registerStep === 1 ? 'Personal Info' : 'Academic Profile'}
                                </Text>
                            </View>

                            {registerStep === 1 ? (
                                /* Step 1 Fields */
                                <View className="space-y-4">
                                    <View className="flex-row gap-3">
                                        <View className="flex-1">
                                            <Text className="text-primary font-bold text-sm mb-1.5 ml-1">Surname</Text>
                                            <View className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-15 justify-center">
                                                <TextInput
                                                    className="text-primary text-base font-semibold"
                                                    placeholder="Doe"
                                                    placeholderTextColor="#9CA3AF"
                                                    value={regData.surname}
                                                    onChangeText={(val) => setRegData({ ...regData, surname: val })}
                                                />
                                            </View>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-primary font-bold text-sm mb-1.5 ml-1">First Name</Text>
                                            <View className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-15 justify-center">
                                                <TextInput
                                                    className="text-primary text-base font-semibold"
                                                    placeholder="John"
                                                    placeholderTextColor="#9CA3AF"
                                                    value={regData.first_name}
                                                    onChangeText={(val) => setRegData({ ...regData, first_name: val })}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-primary font-bold text-sm mb-2 ml-1">Email Address</Text>
                                        <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16">
                                            <Mail size={20} color="#6B7280" />
                                            <TextInput
                                                className="flex-1 ml-3 text-primary text-base font-semibold"
                                                placeholder="john.doe@student.kiu.edu.ng"
                                                placeholderTextColor="#9CA3AF"
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                value={regData.email}
                                                onChangeText={(val) => setRegData({ ...regData, email: val })}
                                            />
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-primary font-bold text-sm mb-2 ml-1">Password</Text>
                                        <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16">
                                            <Lock size={20} color="#6B7280" />
                                            <TextInput
                                                className="flex-1 ml-3 text-primary text-base font-semibold"
                                                placeholder="Minimum 8 characters"
                                                placeholderTextColor="#9CA3AF"
                                                secureTextEntry={!showPassword}
                                                value={regData.password}
                                                onChangeText={(val) => setRegData({ ...regData, password: val })}
                                            />
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-primary font-bold text-sm mb-2 ml-1">Confirm Password</Text>
                                        <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16">
                                            <Lock size={20} color="#6B7280" />
                                            <TextInput
                                                className="flex-1 ml-3 text-primary text-base font-semibold"
                                                placeholder="Repeat password"
                                                placeholderTextColor="#9CA3AF"
                                                secureTextEntry={!showPassword}
                                                value={regData.password_confirmation}
                                                onChangeText={(val) => setRegData({ ...regData, password_confirmation: val })}
                                            />
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleNextRegisterStep}
                                        className="bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/30 mt-8"
                                    >
                                        <Text className="text-white text-lg font-bold mr-2">Continue</Text>
                                        <ArrowRight size={20} color="white" />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                /* Step 2 Fields */
                                <View className="space-y-5">
                                    <View>
                                        <Text className="text-primary font-bold text-sm mb-2 ml-1">Faculty</Text>
                                        <TouchableOpacity
                                            onPress={() => openDropdownModal('faculty')}
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16 flex-row items-center justify-between"
                                        >
                                            <Text className="text-primary font-semibold text-base flex-1" numberOfLines={1}>
                                                {getSelectedLabel('faculty')}
                                            </Text>
                                            <ChevronDown size={20} color="#002147" />
                                        </TouchableOpacity>
                                    </View>

                                    <View>
                                        <Text className="text-primary font-bold text-sm mb-2 ml-1">Department</Text>
                                        <TouchableOpacity
                                            onPress={() => openDropdownModal('department')}
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16 flex-row items-center justify-between"
                                        >
                                            <Text className="text-primary font-semibold text-base flex-1" numberOfLines={1}>
                                                {getSelectedLabel('department')}
                                            </Text>
                                            <ChevronDown size={20} color="#002147" />
                                        </TouchableOpacity>
                                    </View>

                                    <View>
                                        <Text className="text-primary font-bold text-sm mb-2 ml-1">Programme</Text>
                                        <TouchableOpacity
                                            onPress={() => openDropdownModal('programme')}
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16 flex-row items-center justify-between"
                                        >
                                            <Text className="text-primary font-semibold text-base flex-1" numberOfLines={1}>
                                                {getSelectedLabel('programme')}
                                            </Text>
                                            <ChevronDown size={20} color="#002147" />
                                        </TouchableOpacity>
                                    </View>

                                    <View className="flex-row space-x-4">
                                        <View className="flex-1">
                                            <Text className="text-primary font-bold text-sm mb-2 ml-1">Level</Text>
                                            <TouchableOpacity
                                                onPress={() => openDropdownModal('level')}
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16 flex-row items-center justify-between"
                                            >
                                                <Text className="text-primary font-semibold text-base">
                                                    {regData.level ? `${regData.level} Lvl` : 'Lvl'}
                                                </Text>
                                                <ChevronDown size={18} color="#002147" />
                                            </TouchableOpacity>
                                        </View>
                                        <View className="flex-2 flex-grow">
                                            <Text className="text-primary font-bold text-sm mb-2 ml-1">Academic Session</Text>
                                            <TouchableOpacity
                                                onPress={() => openDropdownModal('session')}
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16 flex-row items-center justify-between"
                                            >
                                                <Text className="text-primary font-semibold text-base" numberOfLines={1}>
                                                    {getSelectedLabel('session')}
                                                </Text>
                                                <ChevronDown size={18} color="#002147" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View className="flex-row space-x-4 mt-8">
                                        <TouchableOpacity
                                            onPress={() => setRegisterStep(1)}
                                            className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center"
                                        >
                                            <ArrowLeft size={24} color="#002147" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleRegister}
                                            disabled={isLoading}
                                            className="flex-1 bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/30"
                                        >
                                            {isLoading ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <>
                                                    <Text className="text-white text-lg font-bold mr-2">Create Account</Text>
                                                    <CheckCircle2 size={20} color="white" />
                                                </>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}

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
