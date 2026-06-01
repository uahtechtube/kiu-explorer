import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Activity, Database, HardDrive, Users, Zap, Server, AlertTriangle, CheckCircle } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface SystemHealth {
    status: 'healthy' | 'degraded' | 'critical';
    health_percentage: number;
    uptime: string;
    database: {
        status: string;
        response_time: string;
    };
    storage: {
        total: number;
        free: number;
        used_percentage: number;
    };
    active_users: {
        current: number;
        online_now: number;
    };
}

interface ActivityLog {
    user: string;
    email: string;
    action: string;
    timestamp: string;
    ip_address: string;
}

export default function SystemMonitoring() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [logs, setLogs] = useState<ActivityLog[]>([]);

    useEffect(() => {
        fetchSystemData();
    }, []);

    const fetchSystemData = async () => {
        try {
            setLoading(true);
            const [healthRes, logsRes] = await Promise.all([
                api.get('/admin/system/health'),
                api.get('/admin/system/logs')
            ]);
            setHealth(healthRes.data);
            setLogs(logsRes.data.logs || []);
        } catch (error) {
            console.error('Error:', error);
            // Mock data
            setHealth({
                status: 'healthy',
                health_percentage: 98,
                uptime: '12d 04h 22m',
                database: {
                    status: 'connected',
                    response_time: '2.5ms'
                },
                storage: {
                    total: 500000000000,
                    free: 375000000000,
                    used_percentage: 25
                },
                active_users: {
                    current: 5245,
                    online_now: 342
                }
            });
            setLogs([
                {
                    user: 'Ahmed Ibrahim',
                    email: 'ahmed@kiu.edu',
                    action: 'Login',
                    timestamp: '2026-02-08T11:30:00',
                    ip_address: '192.168.1.100'
                },
                {
                    user: 'Sarah Mohammed',
                    email: 'sarah@kiu.edu',
                    action: 'Login',
                    timestamp: '2026-02-08T11:25:00',
                    ip_address: '192.168.1.101'
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchSystemData();
        setRefreshing(false);
    }, []);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'healthy': return '#10B981';
            case 'degraded': return '#F59E0B';
            case 'critical': return '#EF4444';
            default: return '#64748B';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-24 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Infrastructure</Text>
                        <Text className="text-white text-xl font-bold">System Monitoring</Text>
                    </View>
                    <TouchableOpacity
                        onPress={onRefresh}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <Activity size={22} color="white" />
                    </TouchableOpacity>
                </View>

                {/* System Health Card */}
                {health && (
                    <PremiumCard variant="glass" className="p-6 border-white/10">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View
                                    className="w-12 h-12 rounded-2xl items-center justify-center"
                                    style={{ backgroundColor: `${getHealthColor(health.status)}20` }}
                                >
                                    {health.status === 'healthy' ? (
                                        <CheckCircle size={24} color={getHealthColor(health.status)} />
                                    ) : (
                                        <AlertTriangle size={24} color={getHealthColor(health.status)} />
                                    )}
                                </View>
                                <View className="ml-4">
                                    <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                                        System Status
                                    </Text>
                                    <Text className="text-white text-2xl font-black capitalize">{health.status}</Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-white text-4xl font-black">{health.health_percentage}%</Text>
                                <Text className="text-white/60 text-[10px] font-bold uppercase">Health</Text>
                            </View>
                        </View>
                        <View className="bg-white/10 h-2 rounded-full overflow-hidden">
                            <View
                                className="h-full rounded-full"
                                style={{
                                    width: `${health.health_percentage}%`,
                                    backgroundColor: getHealthColor(health.status)
                                }}
                            />
                        </View>
                        <Text className="text-white/60 text-xs font-bold mt-3">
                            Uptime: {health.uptime}
                        </Text>
                    </PremiumCard>
                )}
            </View>

            <ScrollView
                className="flex-1 -mt-14 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !health ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : (
                    <>
                        {/* Metrics Grid */}
                        <View className="flex-row flex-wrap justify-between mb-6">
                            {/* Database */}
                            <PremiumCard variant="elevated" className="w-[48%] p-5 mb-4 bg-white border-gray-100">
                                <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mb-4">
                                    <Database size={24} color="#3B82F6" />
                                </View>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                    Database
                                </Text>
                                <Text className="text-primary text-lg font-black capitalize mb-1">
                                    {health?.database.status}
                                </Text>
                                <Text className="text-gray-400 text-xs font-bold">
                                    Response: {health?.database.response_time}
                                </Text>
                            </PremiumCard>

                            {/* Storage */}
                            <PremiumCard variant="elevated" className="w-[48%] p-5 mb-4 bg-white border-gray-100">
                                <View className="w-12 h-12 bg-purple-50 rounded-2xl items-center justify-center mb-4">
                                    <HardDrive size={24} color="#8B5CF6" />
                                </View>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                    Storage
                                </Text>
                                <Text className="text-primary text-lg font-black mb-1">
                                    {health?.storage.used_percentage}%
                                </Text>
                                <Text className="text-gray-400 text-xs font-bold">
                                    {formatBytes(health?.storage.free || 0)} free
                                </Text>
                            </PremiumCard>

                            {/* Active Users */}
                            <PremiumCard variant="elevated" className="w-[48%] p-5 mb-4 bg-white border-gray-100">
                                <View className="w-12 h-12 bg-emerald-50 rounded-2xl items-center justify-center mb-4">
                                    <Users size={24} color="#10B981" />
                                </View>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                    Total Users
                                </Text>
                                <Text className="text-primary text-lg font-black mb-1">
                                    {health?.active_users.current.toLocaleString()}
                                </Text>
                                <Text className="text-gray-400 text-xs font-bold">
                                    {health?.active_users.online_now} online now
                                </Text>
                            </PremiumCard>

                            {/* Server */}
                            <PremiumCard variant="elevated" className="w-[48%] p-5 mb-4 bg-white border-gray-100">
                                <View className="w-12 h-12 bg-rose-50 rounded-2xl items-center justify-center mb-4">
                                    <Server size={24} color="#EF4444" />
                                </View>
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">
                                    Server
                                </Text>
                                <Text className="text-primary text-lg font-black mb-1">
                                    Running
                                </Text>
                                <Text className="text-gray-400 text-xs font-bold">
                                    {health?.uptime}
                                </Text>
                            </PremiumCard>
                        </View>

                        {/* Activity Logs */}
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-primary font-black text-xl">Recent Activity</Text>
                            <TouchableOpacity>
                                <Text className="text-secondary font-black text-[10px] uppercase">View All</Text>
                            </TouchableOpacity>
                        </View>

                        {logs.map((log, index) => (
                            <PremiumCard
                                key={index}
                                variant="solid"
                                className="mb-3 p-4 bg-white border-gray-50 flex-row items-center"
                            >
                                <View className="w-10 h-10 bg-primary/5 rounded-2xl items-center justify-center mr-4">
                                    <Zap size={16} color="#002147" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-primary font-black text-sm">{log.action}</Text>
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase">
                                        {log.user} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </PremiumCard>
                        ))}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
