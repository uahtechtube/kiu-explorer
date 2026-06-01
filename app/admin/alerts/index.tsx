import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Alert as RNAlert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, AlertCircle, Plus, Bell, Shield, Info, CheckCircle, XCircle, Clock, Send, Trash2, Filter, AlertTriangle } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';
import { useWebSocket } from '../../../context/WebSocketContext';

interface SystemAlert {
    id: number;
    type: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    severity: number;
    is_resolved: boolean;
    resolved_at: string | null;
    resolved_by: number | null;
    created_at: string;
    resolver?: {
        id: number;
        surname: string;
        first_name: string;
    };
}

export default function AlertCenter() {
    const router = useRouter();
    const { isConnected, latestAlert } = useWebSocket();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [alerts, setAlerts] = useState<SystemAlert[]>([]);
    const [counts, setCounts] = useState<Record<string, number>>({});
    
    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAlert, setNewAlert] = useState({
        type: 'info' as 'critical' | 'warning' | 'info',
        title: '',
        message: '',
        severity: 3
    });

    useEffect(() => {
        fetchAlerts();
        fetchCounts();
    }, []);

    // Add new alert to list when received via WebSocket
    useEffect(() => {
        if (latestAlert) {
            setAlerts(prev => [latestAlert, ...prev]);
            fetchCounts(); // Update counts
        }
    }, [latestAlert]);

    const fetchAlerts = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/alerts');
            setAlerts(response.data.data);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCounts = async () => {
        try {
            const response = await api.get('/admin/alerts/unresolved-count');
            setCounts(response.data || {});
        } catch (error) {
            console.error('Error fetching counts:', error);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchAlerts(), fetchCounts()]);
        setRefreshing(false);
    }, []);

    const handleCreateAlert = async () => {
        if (!newAlert.title || !newAlert.message) {
            RNAlert.alert('Validation Error', 'Please provide both title and message.');
            return;
        }

        try {
            await api.post('/admin/alerts', newAlert);
            setShowCreateModal(false);
            setNewAlert({ type: 'info', title: '', message: '', severity: 3 });
            fetchAlerts();
            fetchCounts();
            RNAlert.alert('Success', 'System alert broadcasted successfully.');
        } catch (error) {
            RNAlert.alert('Error', 'Failed to create system alert.');
        }
    };

    const handleResolve = async (id: number) => {
        try {
            await api.post(`/admin/alerts/${id}/resolve`);
            fetchAlerts();
            fetchCounts();
        } catch (error) {
            RNAlert.alert('Error', 'Failed to resolve alert.');
        }
    };

    const handleDelete = async (id: number) => {
        RNAlert.alert(
            'Delete Alert',
            'Are you sure you want to delete this alert?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/alerts/${id}`);
                            fetchAlerts();
                            fetchCounts();
                        } catch (error) {
                            RNAlert.alert('Error', 'Failed to delete alert.');
                        }
                    }
                }
            ]
        );
    };

    const getAlertColor = (type: string) => {
        switch (type) {
            case 'critical': return '#EF4444';
            case 'warning': return '#F59E0B';
            case 'info': return '#3B82F6';
            default: return '#64748B';
        }
    };

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'critical': return AlertTriangle;
            case 'warning': return AlertCircle;
            case 'info': return Info;
            default: return Bell;
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
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">System Health</Text>
                        <View className="flex-row items-center">
                            <Text className="text-white text-xl font-bold">Alert Center</Text>
                            {isConnected && (
                                <View className="ml-2 bg-emerald-500 px-2 py-0.5 rounded-full flex-row items-center">
                                    <View className="w-1.5 h-1.5 bg-white rounded-full mr-1" />
                                    <Text className="text-white text-[8px] font-black uppercase">Live</Text>
                                </View>
                            )}
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowCreateModal(true)}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/20"
                    >
                        <Plus size={24} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* Stats Summary */}
                <View className="flex-row justify-between">
                    {[
                        { label: 'Critical', count: counts?.critical || 0, color: '#EF4444' },
                        { label: 'Warning', count: counts?.warning || 0, color: '#F59E0B' },
                        { label: 'Info', count: counts?.info || 0, color: '#3B82F6' }
                    ].map((stat, idx) => (
                        <View key={idx} className="flex-1 mx-1">
                            <PremiumCard variant="glass" className="p-4 items-center border-white/10">
                                <Text className="text-white/60 text-[8px] font-black uppercase tracking-widest mb-1">{stat.label}</Text>
                                <Text className="text-white text-xl font-black" style={{ color: stat.count > 0 ? stat.color : 'white' }}>
                                    {stat.count}
                                </Text>
                            </PremiumCard>
                        </View>
                    ))}
                </View>
            </View>

            {/* Alerts List */}
            <View className="flex-1 -mt-10 px-6">
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
                >
                    {loading && !refreshing ? (
                        <ActivityIndicator size="large" color="#002147" className="mt-20" />
                    ) : alerts.length === 0 ? (
                        <View className="items-center justify-center py-32 opacity-20">
                            <CheckCircle size={64} color="#10B981" strokeWidth={1} />
                            <Text className="text-primary font-black mt-4">NO ACTIVE ALERTS</Text>
                        </View>
                    ) : (
                        alerts.map((alert) => {
                            const Icon = getAlertIcon(alert.type);
                            const color = getAlertColor(alert.type);

                            return (
                                <PremiumCard
                                    key={alert.id}
                                    variant="elevated"
                                    className={`mb-4 p-5 bg-white border-l-4 ${alert.is_resolved ? 'opacity-60 grayscale' : ''
                                        }`}
                                    style={{ borderLeftColor: color }}
                                >
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="flex-row items-center flex-1 pr-2">
                                            <View
                                                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                                style={{ backgroundColor: `${color}15` }}
                                            >
                                                <Icon size={20} color={color} />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-primary font-black text-base">{alert.title}</Text>
                                                <View className="flex-row items-center">
                                                    <Clock size={10} color="#94A3B8" />
                                                    <Text className="text-gray-400 text-[10px] font-bold ml-1">
                                                        {new Date(alert.created_at).toLocaleString()}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>
                                        {!alert.is_resolved && (
                                            <View className="bg-rose-50 px-2 py-1 rounded-md">
                                                <Text className="text-rose-600 text-[8px] font-black uppercase">Level {alert.severity}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <Text className="text-gray-500 text-sm mb-4 leading-5">{alert.message}</Text>

                                    <View className="flex-row justify-between items-center pt-4 border-t border-gray-50">
                                        {alert.is_resolved ? (
                                            <View className="flex-row items-center">
                                                <CheckCircle size={14} color="#10B981" />
                                                <Text className="text-emerald-600 text-xs font-bold ml-2">
                                                    Resolved by {alert.resolver?.first_name}
                                                </Text>
                                            </View>
                                        ) : (
                                            <TouchableOpacity
                                                onPress={() => handleResolve(alert.id)}
                                                className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20"
                                            >
                                                <Text className="text-emerald-600 font-black text-[10px] uppercase">Resolve Alert</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity onPress={() => handleDelete(alert.id)}>
                                            <Trash2 size={16} color="#CBD5E1" />
                                        </TouchableOpacity>
                                    </View>
                                </PremiumCard>
                            );
                        })
                    )}
                </ScrollView>
            </View>

            {/* Create Alert Modal */}
            <Modal
                visible={showCreateModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-[40px] p-8 h-[80%]">
                        <View className="flex-row items-center justify-between mb-8">
                            <Text className="text-primary text-2xl font-black">Broadcast Alert</Text>
                            <TouchableOpacity
                                onPress={() => setShowCreateModal(false)}
                                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <XCircle size={24} color="#002147" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="mb-6">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Alert Level</Text>
                                <View className="flex-row justify-between">
                                    {(['info', 'warning', 'critical'] as const).map((type) => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setNewAlert({ ...newAlert, type })}
                                            className={`flex-1 mx-1 p-4 rounded-2xl border items-center ${newAlert.type === type
                                                    ? `bg-${type === 'critical' ? 'rose' : type === 'warning' ? 'amber' : 'blue'}-500 border-transparent`
                                                    : 'bg-white border-gray-100'
                                                }`}
                                        >
                                            <Text className={`font-black text-[10px] uppercase ${newAlert.type === type ? 'text-white' : 'text-gray-400'
                                                }`}>{type}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="space-y-4 mb-8">
                                <View>
                                    <Text className="text-gray-400 text-xs font-bold mb-1 ml-1">Headline</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-primary font-bold"
                                        placeholder="e.g. Scheduled Maintenance"
                                        value={newAlert.title}
                                        onChangeText={(text) => setNewAlert({ ...newAlert, title: text })}
                                    />
                                </View>
                                <View>
                                    <Text className="text-gray-400 text-xs font-bold mb-1 ml-1">Message Body</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-primary font-medium"
                                        placeholder="Detailed description of the incident or notice..."
                                        multiline
                                        numberOfLines={4}
                                        textAlignVertical="top"
                                        value={newAlert.message}
                                        onChangeText={(text) => setNewAlert({ ...newAlert, message: text })}
                                    />
                                </View>
                                <View>
                                    <Text className="text-gray-400 text-xs font-bold mb-2 ml-1">Severity (1-5)</Text>
                                    <View className="flex-row justify-between px-2">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <TouchableOpacity
                                                key={s}
                                                onPress={() => setNewAlert({ ...newAlert, severity: s })}
                                                className={`w-10 h-10 rounded-full items-center justify-center ${newAlert.severity >= s ? 'bg-secondary' : 'bg-gray-100'
                                                    }`}
                                            >
                                                <Text className="font-black text-primary">{s}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleCreateAlert}
                                className="bg-primary py-5 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 mb-10"
                            >
                                <Send size={20} color="white" />
                                <Text className="text-white font-black text-lg ml-3">Broadcast Alert Now</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
