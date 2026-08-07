import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Users, GraduationCap, LogOut, Plus, RefreshCw, Mail, Check, User, ChevronDown, X } from 'lucide-react-native';
import api from '../../lib/api';

export default function DeanDashboard() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submittingUser, setSubmittingUser] = useState(false);

    // Modal forms
    const [createUserVisible, setCreateUserVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'students'>('overview');

    // Create User Form State
    const [newUser, setNewUser] = useState({
        surname: '',
        first_name: '',
        email: '',
        password: '',
        role: 'hod' as 'hod' | 'lecturer' | 'tutor',
        department_id: '',
    });

    // Dropdowns & Departments List
    const [departments, setDepartments] = useState<any[]>([]);
    const [deptModalVisible, setDeptModalVisible] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Stats
            const statsRes = await api.get('/dean/stats');
            setStats(statsRes.data.stats);

            // Students
            const studentsRes = await api.get('/dean/students');
            setStudents(studentsRes.data.data || []);

            // Departments in this faculty
            if (user?.faculty_id) {
                const deptsRes = await api.get(`/faculties/${user.faculty_id}/departments`);
                setDepartments(deptsRes.data.data || deptsRes.data);
            }
        } catch (error: any) {
            console.error('Error fetching Dean data', error);
            Alert.alert('Data Error', 'Failed to retrieve dashboard metrics.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.surname || !newUser.first_name || !newUser.email || !newUser.password || !newUser.department_id) {
            Alert.alert('Validation Error', 'Please fill in all fields.');
            return;
        }

        setSubmittingUser(true);
        try {
            await api.post('/dean/users', newUser);
            Alert.alert('Success', `${newUser.role.toUpperCase()} account created successfully.`);
            setCreateUserVisible(false);
            setNewUser({
                surname: '',
                first_name: '',
                email: '',
                password: '',
                role: 'hod',
                department_id: '',
            });
            fetchDashboardData(); // Refresh metrics
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || 'Failed to create user account.';
            Alert.alert('Action Failed', errorMsg);
        } finally {
            setSubmittingUser(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Confirm Sign Out',
            'Are you sure you want to log out of the portal?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/(auth)/welcome');
                    }
                }
            ]
        );
    };

    const getSelectedDeptLabel = () => {
        return departments.find(d => d.id === newUser.department_id)?.name || 'Select Department';
    };

    if (loading && !stats) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
                <Text className="text-gray-400 mt-4 font-semibold">Loading Faculty Hub...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header Section */}
            <View className="bg-primary px-6 pt-6 pb-8 rounded-b-[40px] shadow-lg">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Faculty Administrator</Text>
                        <Text className="text-white text-2xl font-black">Dean Hub</Text>
                    </View>
                    <TouchableOpacity onPress={handleLogout} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
                        <LogOut size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Profile Card Summary */}
                <View className="bg-white/10 p-4 rounded-2xl flex-row items-center border border-white/5">
                    <View className="w-12 h-12 bg-secondary rounded-full items-center justify-center">
                        <Text className="text-primary font-black text-lg">{user?.surname?.charAt(0)}{user?.first_name?.charAt(0)}</Text>
                    </View>
                    <View className="ml-3 flex-grow">
                        <Text className="text-white font-bold text-base">{user?.surname} {user?.first_name}</Text>
                        <Text className="text-gray-300 text-xs mt-0.5">{user?.email}</Text>
                    </View>
                </View>
            </View>

            {/* Navigation Tabs */}
            <View className="flex-row bg-white p-1 rounded-2xl mx-6 mt-6 border border-gray-100 shadow-sm">
                <TouchableOpacity
                    onPress={() => setActiveTab('overview')}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${activeTab === 'overview' ? 'bg-primary' : ''}`}
                >
                    <Text className={`text-xs font-bold ${activeTab === 'overview' ? 'text-white' : 'text-gray-500'}`}>Overview</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('students')}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${activeTab === 'students' ? 'bg-primary' : ''}`}
                >
                    <Text className={`text-xs font-bold ${activeTab === 'students' ? 'text-white' : 'text-gray-500'}`}>Student Roster</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'overview' ? (
                /* OVERVIEW TAB */
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="flex-grow px-6 mt-6" showsVerticalScrollIndicator={false}>
                    
                    {/* Floating Add User Button */}
                    <TouchableOpacity
                        onPress={() => setCreateUserVisible(true)}
                        className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 mb-6"
                    >
                        <Plus size={20} color="white" strokeWidth={3} />
                        <Text className="text-white font-black text-sm ml-2">Create Faculty User</Text>
                    </TouchableOpacity>

                    {/* Stats Grid */}
                    <Text className="text-primary/40 font-black text-[10px] uppercase tracking-widest mb-4">Faculty Stats</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {[
                            { label: 'HODs', value: stats?.hods || 0, icon: Users, color: '#3B82F6' },
                            { label: 'Lecturers', value: stats?.lecturers || 0, icon: Users, color: '#10B981' },
                            { label: 'Tutors', value: stats?.tutors || 0, icon: Users, color: '#F59E0B' },
                            { label: 'Students', value: stats?.students || 0, icon: GraduationCap, color: '#EC4899' },
                        ].map((item, i) => (
                            <View key={i} className="bg-white w-[48%] p-5 rounded-3xl border border-gray-100 shadow-sm mb-4">
                                <View style={{ backgroundColor: `${item.color}15` }} className="w-10 h-10 rounded-xl items-center justify-center mb-3">
                                    <item.icon size={20} color={item.color} />
                                </View>
                                <Text className="text-primary font-black text-2xl">{item.value}</Text>
                                <Text className="text-gray-400 text-xs font-semibold mt-1">{item.label}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Refresh trigger */}
                    <TouchableOpacity
                        onPress={fetchDashboardData}
                        className="flex-row items-center justify-center py-4 bg-gray-100 rounded-2xl border border-gray-200 mt-2"
                    >
                        <RefreshCw size={16} color="#6B7280" />
                        <Text className="text-gray-500 font-bold text-xs ml-2 uppercase tracking-wider">Sync Dashboard</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                /* STUDENTS TAB */
                <FlatList
                    data={students}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120 }}
                    renderItem={({ item }) => (
                        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-4">
                            <View className="flex-row items-center justify-between mb-3 pb-3 border-b border-gray-50">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 bg-primary/5 rounded-xl items-center justify-center mr-2">
                                        <GraduationCap size={16} color="#002147" />
                                    </View>
                                    <Text className="text-primary font-black text-sm">{item.surname} {item.first_name}</Text>
                                </View>
                                <View className="bg-amber-50 px-2 py-1 rounded-lg">
                                    <Text className="text-amber-600 text-[10px] font-black">{item.student_profile?.level || '100'} Lvl</Text>
                                </View>
                            </View>
                            <Text className="text-gray-400 text-xs font-semibold">Department: <Text className="text-primary">{item.student_profile?.department?.name || 'General'}</Text></Text>
                            <Text className="text-gray-400 text-xs font-semibold mt-1">Programme: <Text className="text-primary">{item.student_profile?.programme?.name || 'General'}</Text></Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="py-20 items-center">
                            <GraduationCap size={48} color="#9CA3AF" />
                            <Text className="text-gray-400 font-semibold mt-4">No enrolled students in this faculty.</Text>
                        </View>
                    }
                />
            )}

            {/* Create User Slide-up Modal */}
            <Modal
                visible={createUserVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setCreateUserVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    className="flex-1"
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        {/* Tap outside to close */}
                        <TouchableWithoutFeedback onPress={() => setCreateUserVisible(false)}>
                            <View className="absolute inset-0" />
                        </TouchableWithoutFeedback>

                        <View className="bg-white rounded-t-[36px] max-h-[85%] p-6 shadow-2xl relative z-10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-primary">Create Faculty User</Text>
                                <TouchableOpacity onPress={() => setCreateUserVisible(false)} className="p-2 bg-gray-50 rounded-full w-10 h-10 items-center justify-center">
                                    <X size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 mb-6">
                                <View>
                                    <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2 ml-1">Account Role</Text>
                                    <View className="flex-row bg-gray-100 p-1 rounded-2xl">
                                        {(['hod', 'lecturer', 'tutor'] as const).map((role) => (
                                            <TouchableOpacity
                                                key={role}
                                                onPress={() => setNewUser({ ...newUser, role })}
                                                className={`flex-1 py-3.5 rounded-xl items-center justify-center ${newUser.role === role ? 'bg-primary' : ''}`}
                                            >
                                                <Text className={`text-[10px] font-black uppercase tracking-wider ${newUser.role === role ? 'text-white' : 'text-gray-400'}`}>{role}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View className="flex-row space-x-4">
                                    <View className="flex-1">
                                        <Text className="text-primary font-semibold mb-2 ml-1">Surname</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                            placeholder="Surname"
                                            value={newUser.surname}
                                            onChangeText={(val) => setNewUser({ ...newUser, surname: val })}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary font-semibold mb-2 ml-1">First Name</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                            placeholder="First name"
                                            value={newUser.first_name}
                                            onChangeText={(val) => setNewUser({ ...newUser, first_name: val })}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Email Address</Text>
                                    <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                                        <Mail size={18} color="#9CA3AF" />
                                        <TextInput
                                            className="flex-1 ml-2 text-primary font-semibold"
                                            placeholder="email@example.com"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            value={newUser.email}
                                            onChangeText={(val) => setNewUser({ ...newUser, email: val })}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Temporary Password</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                        placeholder="Minimum 6 characters"
                                        secureTextEntry
                                        value={newUser.password}
                                        onChangeText={(val) => setNewUser({ ...newUser, password: val })}
                                    />
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Department Scope</Text>
                                    <TouchableOpacity
                                        onPress={() => setDeptModalVisible(true)}
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 flex-row items-center justify-between"
                                    >
                                        <Text className="text-primary font-semibold text-sm flex-1" numberOfLines={1}>{getSelectedDeptLabel()}</Text>
                                        <ChevronDown size={20} color="#002147" />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    onPress={handleCreateUser}
                                    disabled={submittingUser}
                                    className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 mt-6"
                                >
                                    {submittingUser ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Text className="text-white text-lg font-bold mr-2">Create Account</Text>
                                            <Check size={20} color="white" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Department Selection Sub-Modal */}
            <Modal
                visible={deptModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setDeptModalVisible(false)}
            >
                <View className="flex-1 bg-black/50 justify-end">
                    <TouchableWithoutFeedback onPress={() => setDeptModalVisible(false)}>
                        <View className="absolute inset-0" />
                    </TouchableWithoutFeedback>
                    <View className="bg-white rounded-t-[36px] min-h-[40%] p-6 relative z-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-primary">Select Department</Text>
                            <TouchableOpacity onPress={() => setDeptModalVisible(false)} className="px-4 py-2 bg-gray-100 rounded-full">
                                <Text className="text-gray-500 font-bold text-xs uppercase">Close</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={departments}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {
                                        setNewUser({ ...newUser, department_id: item.id });
                                        setDeptModalVisible(false);
                                    }}
                                    className="flex-row items-center justify-between h-14 border-b border-gray-50 px-2"
                                >
                                    <Text className="text-gray-700 text-sm font-semibold flex-1 mr-4" numberOfLines={1}>{item.name}</Text>
                                    {newUser.department_id === item.id && (
                                        <Check size={18} color="#002147" strokeWidth={3} />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
