import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookOpen, Users, FileText, BarChart3, Video, Plus, Calendar, LogOut, Home, Bell, User } from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface DashboardStats {
    total_students: number;
    active_classes: number;
    pending_submissions: number;
    upcoming_classes: number;
}

interface UpcomingClass {
    id: number;
    course_code: string;
    title: string;
    time: string;
    room: string;
    students_count: number;
}

export default function LecturerDashboard() {
    const router = useRouter();
    const { signOut, user } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [upcomingClasses, setUpcomingClasses] = useState<UpcomingClass[]>([]);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lecturer/dashboard');
            setStats(response.data.stats);
            setUpcomingClasses(response.data.upcoming_classes || []);
        } catch (error) {
            console.error('Error:', error);
            // Mock data
            setStats({
                total_students: 245,
                active_classes: 4,
                pending_submissions: 12,
                upcoming_classes: 3,
            });
            setUpcomingClasses([
                { id: 1, course_code: 'CSC 401', title: 'Web Development', time: 'Today, 10:00 AM', room: 'Lab 3', students_count: 65 },
                { id: 2, course_code: 'CSC 301', title: 'Database Systems', time: 'Tomorrow, 2:00 PM', room: 'LT 5', students_count: 80 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchDashboard();
        setRefreshing(false);
    }, []);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                        router.replace('/(auth)/welcome');
                    }
                }
            ]
        );
    };

    const quickActions = [
        { label: 'Virtual Classes', icon: Video, color: '#3B82F6', route: '/lecturer/virtual-classes' },
        { label: 'Manage Exams', icon: FileText, color: '#EF4444', route: '/lecturer/manage-exams' },
        { label: 'Manage Content', icon: FileText, color: '#8B5CF6', route: '/lecturer/my-content' },
        { label: 'Assignments', icon: FileText, color: '#10B981', route: '/lecturer/assignments' },
    ];

    const contentActions = [
        { label: 'Upload Tutorial', icon: Video, color: '#3B82F6', route: '/lecturer/upload-tutorial' },
        { label: 'New Exam', icon: FileText, color: '#EF4444', route: '/lecturer/create-exam' },
        { label: 'Schedule Class', icon: Calendar, color: '#10B981', route: '/lecturer/virtual-classes/create' },
        { label: 'Post Notification', icon: Bell, color: '#F59E0B', route: '/lecturer/create-announcement' },
    ];


    return (
        <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
            {/* Fixed Header Section - Similar to Student Dashboard */}
            <View className="bg-primary px-6 pt-4 pb-6 shadow-lg">
                <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1">
                        <View className="w-12 h-12 bg-secondary rounded-full items-center justify-center overflow-hidden">
                            {user?.passport_photograph ? (
                                <Image
                                    source={{ uri: user.passport_photograph }}
                                    className="w-12 h-12"
                                    resizeMode="cover"
                                />
                            ) : (
                                <Text className="text-primary font-bold text-xl">{user?.name?.charAt(0) || 'D'}</Text>
                            )}
                        </View>
                        <View className="ml-3 flex-1">
                            <Text className="text-gray-300 text-sm">Welcome back,</Text>
                            <Text className="text-white text-xl font-bold" numberOfLines={1}>{user?.name || 'Dr. John Doe'}</Text>
                        </View>
                    </View>
                    <View className="w-10 h-10 bg-white/10 rounded-full items-center justify-center ml-2">
                        <Bell size={24} color="white" />
                    </View>
                </View>
            </View>

            <ScrollView
                className="flex-1 bg-gray-50"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : (
                    <>
                        {/* Stats Grid */}
                        <View className="flex-row flex-wrap justify-between px-6 pt-6 mb-6">
                            <View className="bg-white p-5 rounded-3xl w-[48%] mb-4 shadow-sm border border-gray-100">
                                <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mb-3">
                                    <Users size={24} color="#3B82F6" />
                                </View>
                                <Text className="text-gray-500 text-xs uppercase mb-1">Total Students</Text>
                                <Text className="text-primary text-3xl font-bold">{stats?.total_students}</Text>
                            </View>

                            <View className="bg-white p-5 rounded-3xl w-[48%] mb-4 shadow-sm border border-gray-100">
                                <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mb-3">
                                    <BookOpen size={24} color="#10B981" />
                                </View>
                                <Text className="text-gray-500 text-xs uppercase mb-1">Active Classes</Text>
                                <Text className="text-primary text-3xl font-bold">{stats?.active_classes}</Text>
                            </View>

                            <View className="bg-white p-5 rounded-3xl w-[48%] shadow-sm border border-gray-100">
                                <View className="w-12 h-12 bg-orange-50 rounded-2xl items-center justify-center mb-3">
                                    <FileText size={24} color="#F97316" />
                                </View>
                                <Text className="text-gray-500 text-xs uppercase mb-1">Pending Reviews</Text>
                                <Text className="text-primary text-3xl font-bold">{stats?.pending_submissions}</Text>
                            </View>

                            <View className="bg-white p-5 rounded-3xl w-[48%] shadow-sm border border-gray-100">
                                <View className="w-12 h-12 bg-purple-50 rounded-2xl items-center justify-center mb-3">
                                    <Calendar size={24} color="#8B5CF6" />
                                </View>
                                <Text className="text-gray-500 text-xs uppercase mb-1">Upcoming</Text>
                                <Text className="text-primary text-3xl font-bold">{stats?.upcoming_classes}</Text>
                            </View>
                        </View>

                        {/* Quick Actions */}
                        <Text className="text-primary font-bold text-lg mb-4 px-6">Quick Actions</Text>
                        <View className="flex-row flex-wrap justify-between mb-6 px-6">
                            {quickActions.map((action, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => router.push(action.route as any)}
                                    className="bg-white p-5 rounded-3xl w-[48%] mb-4 shadow-sm border border-gray-100"
                                >
                                    <View
                                        className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                                        style={{ backgroundColor: `${action.color}15` }}
                                    >
                                        <action.icon size={24} color={action.color} />
                                    </View>
                                    <Text className="text-gray-800 font-bold text-sm">{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Post Content */}
                        <Text className="text-primary font-bold text-lg mb-4 px-6">Create Content</Text>
                        <View className="flex-row flex-wrap justify-between mb-6 px-6">
                            {contentActions.map((action, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => router.push(action.route as any)}
                                    className="bg-white p-5 rounded-3xl w-[48%] mb-4 shadow-sm border border-gray-100"
                                >
                                    <View
                                        className="w-12 h-12 rounded-full items-center justify-center mb-3"
                                        style={{ backgroundColor: action.color }}
                                    >
                                        <action.icon size={20} color="#fff" />
                                    </View>
                                    <Text className="text-gray-800 font-bold text-sm">{action.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Upcoming Classes */}
                        <Text className="text-primary font-bold text-lg mb-4 px-6">Upcoming Classes</Text>
                        <View className="px-6">
                            {upcomingClasses.map((cls) => (
                                <TouchableOpacity
                                    key={cls.id}
                                    onPress={() => router.push(`/lecturer/class-management/${cls.id}`)}
                                    className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100"
                                >
                                    <View className="flex-row justify-between items-start mb-2">
                                        <View>
                                            <Text className="text-primary font-bold text-lg">{cls.course_code}</Text>
                                            <Text className="text-gray-600 text-sm">{cls.title}</Text>
                                        </View>
                                        <View className="bg-blue-50 px-3 py-1 rounded-lg">
                                            <Text className="text-blue-600 text-xs font-bold">{cls.students_count} students</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row justify-between items-center border-t border-gray-100 pt-3">
                                        <Text className="text-gray-500 text-sm">{cls.time}</Text>
                                        <Text className="text-gray-500 text-sm">{cls.room}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View className="h-24" />
                    </>
                )}
            </ScrollView>

            {/* Bottom Navigation Bar */}
            <View className="bg-white border-t border-gray-200" style={{ paddingBottom: 25, paddingTop: 10, height: 85 }}>
                <View className="flex-row justify-around items-center px-6">
                    <TouchableOpacity
                        onPress={() => router.push('/(tabs)')}
                        className="items-center flex-1"
                    >
                        <View className="w-10 h-10 items-center justify-center">
                            <Home size={24} color="#002147" strokeWidth={2.5} />
                        </View>
                        <Text className="text-primary text-xs font-semibold mt-1">Home</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/lecturer/profile')}
                        className="items-center flex-1"
                    >
                        <View className="w-10 h-10 items-center justify-center">
                            <User size={24} color="#9CA3AF" strokeWidth={2} />
                        </View>
                        <Text className="text-gray-400 text-xs font-semibold mt-1">Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/notifications')}
                        className="items-center flex-1"
                    >
                        <View className="w-10 h-10 items-center justify-center">
                            <Bell size={24} color="#9CA3AF" strokeWidth={2} />
                        </View>
                        <Text className="text-gray-400 text-xs font-semibold mt-1">Alerts</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="items-center flex-1"
                    >
                        <View className="w-10 h-10 items-center justify-center">
                            <LogOut size={24} color="#9CA3AF" strokeWidth={2} />
                        </View>
                        <Text className="text-gray-400 text-xs font-semibold mt-1">Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
