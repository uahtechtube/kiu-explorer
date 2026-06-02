import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Users, BookOpen, AlertTriangle, TrendingUp, Settings, Shield, FileText, MessageSquare, Activity, ChevronRight, Bell, Zap, ClipboardList, Lock, Monitor, Megaphone, Home as House, LogOut, DollarSign, MapPin, Network } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { usePermissions } from '../../hooks/usePermissions';
import { useAuth } from '../../context/AuthContext';
import AdminNavBar from '../../components/admin/AdminNavBar';

const { width } = Dimensions.get('window');

interface SystemStats {
    total_users: number;
    active_students: number;
    total_lecturers: number;
    total_courses: number;
    pending_reports: number;
    system_health: number;
    server_uptime: string;
}

export default function AdminDashboard() {
    const router = useRouter();
    const { hasPermission } = usePermissions();
    const { user, signOut } = useAuth();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<SystemStats | null>(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/dashboard');
            setStats(response.data.stats);
        } catch (error) {
            console.error('Error:', error);
            // Professional Mock data
            setStats({
                total_users: 5245, active_students: 4800, total_lecturers: 245, total_courses: 156, pending_reports: 8, system_health: 98, server_uptime: '12d 04h 22m',
            });
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
            'Sign Out',
            'Are you sure you want to sign out of the admin panel?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Sign Out',
                    style: 'destructive',
                    onPress: async () => {
                        try { await api.post('/auth/logout'); } catch (e) { }
                        await signOut();
                    }
                }
            ]
        );
    };

    const quickActions = [
        { label: 'Users', sub: 'Directory', icon: Users, color: '#3B82F6', route: '/admin/users', permission: 'manage_users' },
        { label: 'Security', sub: 'Audit Logs', icon: ClipboardList, color: '#6366F1', route: '/admin/audit-logs', permission: 'view_audit_logs' },
        { label: 'Metrics', sub: 'Analytics', icon: TrendingUp, color: '#10B981', route: '/admin/analytics', permission: 'view_analytics' },
        { label: 'Roles', sub: 'Permissions', icon: Lock, color: '#8B5CF6', route: '/admin/roles', permission: 'manage_roles' },
    ];

    const functionalModules = [
        { label: 'Courses', sub: 'Curriculum', icon: BookOpen, color: '#3B82F6', route: '/admin/courses', permission: 'manage_courses' },
        { label: 'Associations', sub: 'Clubs & Feeds', icon: Users, color: '#8B5CF6', route: '/admin/associations', permission: 'manage_users' },
        { label: 'Approvals', sub: 'Moderation', icon: Shield, color: '#EF4444', route: '/admin/approvals', permission: 'approve_content' },
        { label: 'E-Classroom', sub: 'Live Classes', icon: Monitor, color: '#F59E0B', route: '/admin/classes', permission: 'manage_classes' },
        { label: 'Alert Center', sub: 'Broadcast', icon: Megaphone, color: '#6366F1', route: '/admin/alerts', permission: 'manage_alerts' },
        { label: 'Hostel Admin', sub: 'Accommodation', icon: House, color: '#3B82F6', route: '/admin/hostels', permission: 'manage_hostels' },
        { label: 'Finance', sub: 'Payments', icon: DollarSign, color: '#10B981', route: '/admin/finance/payments', permission: 'manage_finance' },
        { label: 'Moderation', sub: 'Reports Watch', icon: AlertTriangle, color: '#EF4444', route: '/admin/moderation', permission: 'approve_content' },
        { label: 'System Health', sub: 'Monitoring', icon: Activity, color: '#10B981', route: '/admin/system', permission: 'view_analytics' },
        { label: 'Staff Directory', sub: 'Faculty Members', icon: Users, color: '#8B5CF6', route: '/admin/staff', permission: 'manage_users' },
        { label: 'App Developers', sub: 'Dev Team CRUD', icon: Users, color: '#F97316', route: '/admin/about-us', permission: 'manage_users' },
        { label: 'Campus Map', sub: 'Map Locations', icon: MapPin, color: '#06B6D4', route: '/admin/map', permission: 'manage_hostels' },
        { label: 'Academic Portals', sub: 'Structure CRUD', icon: Network, color: '#8B5CF6', route: '/admin/academic', permission: 'manage_users' },
        { label: 'School Info', sub: 'Update Details', icon: House, color: '#10B981', route: '/admin/school-info', permission: 'manage_users' },
        { label: 'Reports Console', sub: 'Data Analytics', icon: FileText, color: '#8B5CF6', route: '/admin/reports', permission: 'view_analytics' },
    ];

    const filteredActions = quickActions.filter(action => !action.permission || hasPermission(action.permission));
    const filteredModules = functionalModules.filter(module => !module.permission || hasPermission(module.permission));

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* High-End Admin Header */}
            <View className="bg-primary px-6 pt-6 pb-24 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <View>
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">KIU Oversight</Text>
                        <Text className="text-white text-2xl font-black">Command Center</Text>
                        {user && <Text className="text-white/50 text-xs mt-0.5">{user.name}</Text>}
                    </View>
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.push('/admin/alerts' as any)}
                            className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20 mr-2"
                        >
                            <Bell size={22} color="white" />
                            {stats && stats.pending_reports > 0 && (
                                <View className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-primary" />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleLogout}
                            className="w-12 h-12 bg-rose-500/20 rounded-2xl items-center justify-center border border-rose-500/30"
                        >
                            <LogOut size={20} color="#FB7185" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* System Health Glass Card */}
                <PremiumCard variant="glass" className="p-6 border-white/10 flex-row items-center">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                            <Zap size={14} color="#FFD700" />
                            <Text className="text-white/60 font-black text-[10px] uppercase ml-2 tracking-widest">System Status</Text>
                        </View>
                        <Text className="text-white text-3xl font-black">{stats?.system_health}% <Text className="text-emerald-400 text-sm">Optimal</Text></Text>
                        <Text className="text-white/40 text-[10px] font-bold mt-1 uppercase">Uptime: {stats?.server_uptime}</Text>
                    </View>
                    <View className="w-16 h-16 rounded-full items-center justify-center border-4 border-emerald-500/30">
                        <Activity size={32} color="#10B981" />
                    </View>
                </PremiumCard>
            </View>

            <ScrollView
                className="flex-1 -mt-12 px-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !stats ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : (
                    <>
                        {/* Summary Metrics Grid */}
                        <View className="flex-row flex-wrap justify-between mt-4 mb-8">
                            {[
                                { label: 'Students', value: stats?.active_students, icon: Users, color: '#3B82F6', trend: '+12%', permission: 'view_analytics' },
                                { label: 'Lecturers', value: stats?.total_lecturers, icon: BookOpen, color: '#10B981', trend: '+5', permission: 'view_analytics' },
                                { label: 'Courses', value: stats?.total_courses, icon: FileText, color: '#8B5CF6', trend: 'Active', permission: 'manage_courses' },
                                { label: 'Reports', value: stats?.pending_reports, icon: AlertTriangle, color: '#EF4444', trend: 'Priority', permission: 'approve_content' },
                            ].filter(item => !item.permission || hasPermission(item.permission)).map((item, idx) => (
                                <PremiumCard key={idx} variant="elevated" className="w-[48%] p-4 mb-4 bg-white border-gray-100">
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="p-2 rounded-xl" style={{ backgroundColor: `${item.color}10` }}>
                                            <item.icon size={18} color={item.color} />
                                        </View>
                                        <Text className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${idx === 3 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                                            }`}>{item.trend}</Text>
                                    </View>
                                    <Text className="text-gray-400 font-black text-[8px] uppercase tracking-widest">{item.label}</Text>
                                    <Text className="text-primary text-2xl font-black">{item.value?.toLocaleString()}</Text>
                                </PremiumCard>
                            ))}
                        </View>

                        {/* Quick Actions Grid */}
                        {filteredActions.length > 0 && (
                            <View className="flex-row flex-wrap justify-between mb-8">
                                {filteredActions.map((action, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => router.push(action.route as any)}
                                        className="w-[48%] mb-4"
                                    >
                                        <PremiumCard variant="solid" className="p-5 flex-row items-center border-gray-100">
                                            <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${action.color}15` }}>
                                                <action.icon size={20} color={action.color} />
                                            </View>
                                            <View>
                                                <Text className="text-primary font-black text-xs uppercase">{action.label}</Text>
                                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-tighter">{action.sub}</Text>
                                            </View>
                                        </PremiumCard>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Functional Modules Container */}
                        {filteredModules.length > 0 && (
                            <>
                                <Text className="text-primary font-black text-xl mb-4">Management Modules</Text>
                                <View className="flex-row flex-wrap justify-between mb-8">
                                    {filteredModules.map((module, index) => (
                                        <TouchableOpacity
                                            key={index}
                                            onPress={() => router.push(module.route as any)}
                                            className="w-[48%] mb-4"
                                        >
                                            <PremiumCard variant="elevated" className="p-5 flex-row items-center bg-white border-gray-50">
                                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${module.color}10` }}>
                                                    <module.icon size={20} color={module.color} />
                                                </View>
                                                <View>
                                                    <Text className="text-primary font-black text-xs uppercase">{module.label}</Text>
                                                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">{module.sub}</Text>
                                                </View>
                                            </PremiumCard>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        {/* Recent Governance Activity */}
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-primary font-black text-xl">Governance Log</Text>
                            <TouchableOpacity onPress={() => router.push('/admin/audit-logs' as any)}>
                                <Text className="text-secondary font-black text-[10px] uppercase">View History</Text>
                            </TouchableOpacity>
                        </View>

                        {[
                            { id: 1, action: 'User Permissions Updated', user: 'Othman Bello', time: '5m ago', type: 'user' },
                            { id: 2, report: 'Flagged Content Resolved', target: 'Social Feed', time: '12m ago', type: 'shield' },
                            { id: 3, update: 'System Backup Successful', time: '1h ago', type: 'zap' },
                        ].map((activity) => (
                            <PremiumCard key={activity.id} variant="solid" className="mb-3 p-4 border-gray-50 bg-white flex-row items-center">
                                <View className="w-10 h-10 bg-primary/5 rounded-2xl items-center justify-center mr-4">
                                    {activity.type === 'user' ? <Users size={16} color="#002147" /> :
                                        activity.type === 'shield' ? <Shield size={16} color="#002147" /> :
                                            <Zap size={16} color="#002147" />}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-primary font-black text-sm">{activity.action || activity.report || activity.update}</Text>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase">{activity.user || activity.target || 'System'} • {activity.time}</Text>
                                </View>
                                <ChevronRight size={14} color="#CBD5E1" />
                            </PremiumCard>
                        ))}
                    </>
                )}
            </ScrollView>
            <AdminNavBar />
        </SafeAreaView>
    );
}
