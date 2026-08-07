import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, FlatList, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Users, GraduationCap, LogOut, Plus, RefreshCw, Mail, Check, Trash2, ShieldAlert, MessageCircle, ChevronDown, X, BookOpen } from 'lucide-react-native';
import api from '../../lib/api';

export default function HodDashboard() {
    const { user, signOut } = useAuth();
    const router = useRouter();

    const [stats, setStats] = useState<any>(null);
    const [feedPosts, setFeedPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Navigation Tab
    const [activeTab, setActiveTab] = useState<'overview' | 'feed' | 'registration'>('overview');

    // Create Lecturer/Tutor Form
    const [createUserVisible, setCreateUserVisible] = useState(false);
    const [newUser, setNewUser] = useState({
        surname: '',
        first_name: '',
        email: '',
        password: '',
        role: 'lecturer' as 'lecturer' | 'tutor',
    });

    // Create Programme Form
    const [createProgVisible, setCreateProgVisible] = useState(false);
    const [newProg, setNewProg] = useState({
        name: '',
        degree_type: 'B.Sc.',
        duration: '4 years',
        description: '',
    });

    // Create Course Form
    const [createCourseVisible, setCreateCourseVisible] = useState(false);
    const [newCourse, setNewCourse] = useState({
        code: '',
        title: '',
        unit: '3',
        level: '100' as '100' | '200' | '300' | '400' | '500',
        semester: 'First' as 'First' | 'Second',
        description: '',
        is_elective: false,
    });

    useEffect(() => {
        fetchDashboardData();
    }, [activeTab]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Stats
            const statsRes = await api.get('/hod/stats');
            setStats(statsRes.data.stats);

            // Local Feed
            if (activeTab === 'feed') {
                const feedRes = await api.get('/hod/feed');
                setFeedPosts(feedRes.data.data || []);
            }
        } catch (error: any) {
            console.error('Error fetching HOD data', error);
            Alert.alert('Data Error', 'Failed to retrieve department stats.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        if (!newUser.surname || !newUser.first_name || !newUser.email || !newUser.password) {
            Alert.alert('Validation Error', 'Please fill in all fields.');
            return;
        }

        setActionLoading(true);
        try {
            await api.post('/hod/users', newUser);
            Alert.alert('Success', `${newUser.role.toUpperCase()} account created successfully.`);
            setCreateUserVisible(false);
            setNewUser({ surname: '', first_name: '', email: '', password: '', role: 'lecturer' });
            fetchDashboardData();
        } catch (error: any) {
            Alert.alert('Action Failed', error.response?.data?.message || 'Failed to create user account.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateProgramme = async () => {
        if (!newProg.name) {
            Alert.alert('Validation Error', 'Please enter a programme name.');
            return;
        }

        setActionLoading(true);
        try {
            await api.post('/hod/programmes', newProg);
            Alert.alert('Success', 'Academic programme created successfully.');
            setCreateProgVisible(false);
            setNewProg({ name: '', degree_type: 'B.Sc.', duration: '4 years', description: '' });
            fetchDashboardData();
        } catch (error: any) {
            Alert.alert('Action Failed', error.response?.data?.message || 'Failed to create programme.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateCourse = async () => {
        if (!newCourse.code || !newCourse.title || !newCourse.unit) {
            Alert.alert('Validation Error', 'Please fill in course code, title, and credit units.');
            return;
        }

        setActionLoading(true);
        try {
            await api.post('/hod/courses', {
                ...newCourse,
                unit: parseInt(newCourse.unit),
            });
            Alert.alert('Success', 'Course added successfully.');
            setCreateCourseVisible(false);
            setNewCourse({
                code: '',
                title: '',
                unit: '3',
                level: '100',
                semester: 'First',
                description: '',
                is_elective: false,
            });
            fetchDashboardData();
        } catch (error: any) {
            Alert.alert('Action Failed', error.response?.data?.message || 'Failed to register course.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeletePost = (postId: number) => {
        Alert.alert(
            'Moderate Post',
            'Delete this post permanently from the lounge feed?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/hod/posts/${postId}`);
                            Alert.alert('Moderated', 'Post was deleted successfully.');
                            fetchDashboardData();
                        } catch (error: any) {
                            Alert.alert('Error', 'Failed to delete post.');
                        }
                    }
                }
            ]
        );
    };

    const handleLogout = async () => {
        Alert.alert(
            'Confirm Sign Out',
            'Are you sure you want to log out of the HOD portal?',
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

    if (loading && !stats) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
                <Text className="text-gray-400 mt-4 font-semibold">Loading Department Hub...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header Section */}
            <View className="bg-primary px-6 pt-6 pb-8 rounded-b-[40px] shadow-lg">
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Department Administrator</Text>
                        <Text className="text-white text-2xl font-black">HOD Hub</Text>
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
                    onPress={() => setActiveTab('registration')}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${activeTab === 'registration' ? 'bg-primary' : ''}`}
                >
                    <Text className={`text-xs font-bold ${activeTab === 'registration' ? 'text-white' : 'text-gray-500'}`}>Curriculum</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('feed')}
                    className={`flex-1 py-3 rounded-xl items-center justify-center ${activeTab === 'feed' ? 'bg-primary' : ''}`}
                >
                    <Text className={`text-xs font-bold ${activeTab === 'feed' ? 'text-white' : 'text-gray-500'}`}>Lounge Feed</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'overview' ? (
                /* OVERVIEW TAB */
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="flex-grow px-6 mt-6" showsVerticalScrollIndicator={false}>
                    
                    {/* Add Lecturer/Tutor Button */}
                    <TouchableOpacity
                        onPress={() => setCreateUserVisible(true)}
                        className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 mb-6"
                    >
                        <Plus size={20} color="white" strokeWidth={3} />
                        <Text className="text-white font-black text-sm ml-2">Create Lecturer or Tutor</Text>
                    </TouchableOpacity>

                    {/* Stats Grid */}
                    <Text className="text-primary/40 font-black text-[10px] uppercase tracking-widest mb-4">Department Stats</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {[
                            { label: 'Lecturers', value: stats?.lecturers || 0, icon: Users, color: '#3B82F6' },
                            { label: 'Tutors', value: stats?.tutors || 0, icon: Users, color: '#10B981' },
                            { label: 'Programmes', value: stats?.programmes || 0, icon: BookOpen, color: '#F59E0B' },
                            { label: 'Courses', value: stats?.courses || 0, icon: BookOpen, color: '#EC4899' },
                            { label: 'Students', value: stats?.students || 0, icon: GraduationCap, color: '#8B5CF6' },
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

                    <TouchableOpacity
                        onPress={fetchDashboardData}
                        className="flex-row items-center justify-center py-4 bg-gray-100 rounded-2xl border border-gray-200 mt-2"
                    >
                        <RefreshCw size={16} color="#6B7280" />
                        <Text className="text-gray-500 font-bold text-xs ml-2 uppercase tracking-wider">Sync Dashboard</Text>
                    </TouchableOpacity>
                </ScrollView>
            ) : activeTab === 'registration' ? (
                /* CURRICULUM MANAGEMENT TAB */
                <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="flex-grow px-6 mt-6" showsVerticalScrollIndicator={false}>
                    
                    <Text className="text-primary/40 font-black text-[10px] uppercase tracking-widest mb-4">Academic Registration</Text>
                    
                    <TouchableOpacity
                        onPress={() => setCreateProgVisible(true)}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex-row justify-between items-center mb-4"
                    >
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-amber-50 rounded-2xl items-center justify-center mr-4">
                                <BookOpen size={24} color="#F59E0B" />
                            </View>
                            <View>
                                <Text className="text-primary font-black text-base">Add Programme</Text>
                                <Text className="text-gray-400 text-xs mt-0.5">e.g. B.Sc. Computer Science</Text>
                            </View>
                        </View>
                        <Plus size={20} color="#002147" strokeWidth={2.5} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setCreateCourseVisible(true)}
                        className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex-row justify-between items-center mb-4"
                    >
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                                <BookOpen size={24} color="#3B82F6" />
                            </View>
                            <View>
                                <Text className="text-primary font-black text-base">Add Course</Text>
                                <Text className="text-gray-400 text-xs mt-0.5">Define codes, units & semesters</Text>
                            </View>
                        </View>
                        <Plus size={20} color="#002147" strokeWidth={2.5} />
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                /* LOUNGE FEED MODERATION TAB */
                <FlatList
                    data={feedPosts}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 120 }}
                    renderItem={({ item }) => (
                        <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-4">
                            <View className="flex-row items-center justify-between mb-3">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 bg-primary/5 rounded-xl items-center justify-center mr-2">
                                        <Text className="text-primary font-black text-[10px]">{item.user?.surname?.charAt(0)}{item.user?.first_name?.charAt(0)}</Text>
                                    </View>
                                    <View>
                                        <Text className="text-primary font-black text-xs">{item.user?.surname} {item.user?.first_name}</Text>
                                        <Text className="text-gray-400 text-[9px]">{new Date(item.created_at).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => handleDeletePost(item.id)} className="w-9 h-9 bg-red-50 rounded-xl items-center justify-center">
                                    <Trash2 size={16} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-gray-600 text-sm leading-5 font-semibold mt-1">{item.content}</Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View className="py-20 items-center">
                            <MessageCircle size={48} color="#9CA3AF" />
                            <Text className="text-gray-400 font-semibold mt-4">No lounge activity in this department.</Text>
                        </View>
                    }
                />
            )}

            {/* Create Staff User Modal */}
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
                        <TouchableWithoutFeedback onPress={() => setCreateUserVisible(false)}>
                            <View className="absolute inset-0" />
                        </TouchableWithoutFeedback>

                        <View className="bg-white rounded-t-[36px] p-6 shadow-2xl relative z-10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-primary">Create Department Staff</Text>
                                <TouchableOpacity onPress={() => setCreateUserVisible(false)} className="p-2 bg-gray-50 rounded-full w-10 h-10 items-center justify-center">
                                    <X size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 mb-6">
                                <View>
                                    <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2 ml-1">Staff Role</Text>
                                    <View className="flex-row bg-gray-100 p-1 rounded-2xl">
                                        {(['lecturer', 'tutor'] as const).map((role) => (
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
                                            value={newUser.surname}
                                            onChangeText={(val) => setNewUser({ ...newUser, surname: val })}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary font-semibold mb-2 ml-1">First Name</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
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

                                <TouchableOpacity
                                    onPress={handleCreateUser}
                                    disabled={actionLoading}
                                    className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 mt-6"
                                >
                                    {actionLoading ? (
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

            {/* Create Programme Modal */}
            <Modal
                visible={createProgVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setCreateProgVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    className="flex-1"
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        <TouchableWithoutFeedback onPress={() => setCreateProgVisible(false)}>
                            <View className="absolute inset-0" />
                        </TouchableWithoutFeedback>

                        <View className="bg-white rounded-t-[36px] p-6 shadow-2xl relative z-10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-primary">Add Programme</Text>
                                <TouchableOpacity onPress={() => setCreateProgVisible(false)} className="p-2 bg-gray-50 rounded-full w-10 h-10 items-center justify-center">
                                    <X size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 mb-6">
                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Programme Name</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                        placeholder="e.g. B.Sc. Computer Science"
                                        value={newProg.name}
                                        onChangeText={(val) => setNewProg({ ...newProg, name: val })}
                                    />
                                </View>

                                <View className="flex-row space-x-4">
                                    <View className="flex-1">
                                        <Text className="text-primary font-semibold mb-2 ml-1">Degree Type</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                            placeholder="B.Sc."
                                            value={newProg.degree_type}
                                            onChangeText={(val) => setNewProg({ ...newProg, degree_type: val })}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary font-semibold mb-2 ml-1">Duration</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                            placeholder="4 years"
                                            value={newProg.duration}
                                            onChangeText={(val) => setNewProg({ ...newProg, duration: val })}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Description</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                        placeholder="Optional description"
                                        value={newProg.description}
                                        onChangeText={(val) => setNewProg({ ...newProg, description: val })}
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={handleCreateProgramme}
                                    disabled={actionLoading}
                                    className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 mt-6"
                                >
                                    {actionLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Text className="text-white text-lg font-bold mr-2">Register Programme</Text>
                                            <Check size={20} color="white" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Create Course Modal */}
            <Modal
                visible={createCourseVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setCreateCourseVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    className="flex-1"
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        <TouchableWithoutFeedback onPress={() => setCreateCourseVisible(false)}>
                            <View className="absolute inset-0" />
                        </TouchableWithoutFeedback>

                        <View className="bg-white rounded-t-[36px] p-6 shadow-2xl relative z-10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-primary">Add Course</Text>
                                <TouchableOpacity onPress={() => setCreateCourseVisible(false)} className="p-2 bg-gray-50 rounded-full w-10 h-10 items-center justify-center">
                                    <X size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 mb-6">
                                <View className="flex-row space-x-4">
                                    <View className="flex-1">
                                        <Text className="text-primary font-semibold mb-2 ml-1">Course Code</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                            placeholder="e.g. CSC101"
                                            autoCapitalize="characters"
                                            value={newCourse.code}
                                            onChangeText={(val) => setNewCourse({ ...newCourse, code: val })}
                                        />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary font-semibold mb-2 ml-1">Credit Units</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                            placeholder="3"
                                            keyboardType="number-pad"
                                            value={newCourse.unit}
                                            onChangeText={(val) => setNewCourse({ ...newCourse, unit: val })}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Course Title</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                        placeholder="e.g. Introduction to Programming"
                                        value={newCourse.title}
                                        onChangeText={(val) => setNewCourse({ ...newCourse, title: val })}
                                    />
                                </View>

                                <View className="flex-row space-x-4">
                                    <View className="flex-1">
                                        <Text className="text-primary font-semibold mb-2 ml-1">Level</Text>
                                        <View className="flex-row bg-gray-100 p-1 rounded-2xl">
                                            {(['100', '200', '300', '400', '500'] as const).map((lvl) => (
                                                <TouchableOpacity
                                                    key={lvl}
                                                    onPress={() => setNewCourse({ ...newCourse, level: lvl })}
                                                    className={`flex-1 py-2 rounded-xl items-center justify-center ${newCourse.level === lvl ? 'bg-primary' : ''}`}
                                                >
                                                    <Text className={`text-[9px] font-black uppercase ${newCourse.level === lvl ? 'text-white' : 'text-gray-400'}`}>{lvl}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row space-x-4">
                                    <View className="flex-1">
                                        <Text className="text-primary font-semibold mb-2 ml-1">Semester</Text>
                                        <View className="flex-row bg-gray-100 p-1 rounded-2xl">
                                            {(['First', 'Second'] as const).map((sem) => (
                                                <TouchableOpacity
                                                    key={sem}
                                                    onPress={() => setNewCourse({ ...newCourse, semester: sem })}
                                                    className={`flex-1 py-3 rounded-xl items-center justify-center ${newCourse.semester === sem ? 'bg-primary' : ''}`}
                                                >
                                                    <Text className={`text-[10px] font-black uppercase tracking-wider ${newCourse.semester === sem ? 'text-white' : 'text-gray-400'}`}>{sem}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Description</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                        placeholder="Optional description"
                                        value={newCourse.description}
                                        onChangeText={(val) => setNewCourse({ ...newCourse, description: val })}
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={handleCreateCourse}
                                    disabled={actionLoading}
                                    className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 mt-6"
                                >
                                    {actionLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Text className="text-white text-lg font-bold mr-2">Register Course</Text>
                                            <Check size={20} color="white" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
