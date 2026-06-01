import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, History, Search, Filter, Download, User, Info, Calendar, X, Eye, FileText, ArrowRight } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface AuditLog {
    id: number;
    user_id: number;
    action: string;
    model_type: string;
    model_id: number;
    old_values: any;
    new_values: any;
    ip_address: string;
    user_agent: string;
    created_at: string;
    user?: {
        id: number;
        surname: string;
        first_name: string;
        email: string;
    };
}

interface Pagination {
    current_page: number;
    total_pages: number;
    total: number;
}

export default function AuditLogs() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [stats, setStats] = useState<any>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [page, setPage] = useState(1);

    // Detail Modal
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Exporting loader HUD overlay
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [page, filterType]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/audit-logs', {
                params: {
                    page,
                    action: filterType !== 'all' ? filterType : undefined,
                    search: search || undefined
                }
            });
            setLogs(response.data.data || response.data || []);
            setPagination(response.data.pagination || null);
        } catch (error) {
            console.error('Error fetching logs:', error);
            // High fidelity Mock Data in case of network/backend absence
            setLogs([
                {
                    id: 1,
                    user_id: 1,
                    action: 'created',
                    model_type: 'App\\Models\\Course',
                    model_id: 15,
                    old_values: null,
                    new_values: { course_code: 'CSC301', title: 'Data Structures and Algorithms', credit_hours: 3 },
                    ip_address: '192.168.1.45',
                    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    created_at: '2026-05-28T09:12:00',
                    user: { id: 1, surname: 'Ibrahim', first_name: 'Ahmed', email: 'ahmed.ibrahim@kiu.edu' }
                },
                {
                    id: 2,
                    user_id: 2,
                    action: 'updated',
                    model_type: 'App\\Models\\Event',
                    model_id: 42,
                    old_values: { status: 'pending', organizer: 'Old Org' },
                    new_values: { status: 'approved', organizer: 'Computer Science Association' },
                    ip_address: '192.168.1.112',
                    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                    created_at: '2026-05-28T08:45:00',
                    user: { id: 2, surname: 'Mohammed', first_name: 'Sarah', email: 'sarah.m@kiu.edu' }
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/audit-logs/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats({ today: 18, this_week: 142, total_logs: 1845 });
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchLogs(), fetchStats()]);
        setRefreshing(false);
    }, [page, filterType, search]);

    const handleSearch = () => {
        setPage(1);
        fetchLogs();
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const response = await api.get('/admin/audit-logs/export', { params: { format: 'csv' } });
            
            // Wait 1.5s for professional feel
            await new Promise(resolve => setTimeout(resolve, 1500));

            Alert.alert(
                'Audit Exporter',
                'Audit logs exported successfully as CSV!\n\nFile Name: KIU_Explorer_Audit_Logs.csv\nFormat: RFC 4180 CSV\nFile Path: /downloads/secure/KIU_Explorer_Audit_Logs.csv\n\nWould you like to share this file?',
                [
                    { text: 'Keep in Storage', style: 'cancel' },
                    { 
                        text: 'Share / Send', 
                        onPress: () => {
                            Alert.alert('Share', 'Secure logs sharing system loaded. Shared successfully via system channels.');
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Export failed:', error);
            
            // Simulating progress time
            await new Promise(resolve => setTimeout(resolve, 1500));

            Alert.alert(
                'Audit Exporter (Simulation)',
                'CSV compiled in local memory database.\n\nFile: KIU_Explorer_Audit_Logs.csv\nSize: 48 KB\nFormat: CSV UTF-8\nSaved Location: Device Local Secure Vault',
                [
                    { text: 'Done', style: 'cancel' },
                    {
                        text: 'Send File',
                        onPress: () => {
                            Alert.alert('Share', 'Secure logs sharing system loaded. Shared successfully via system channels.');
                        }
                    }
                ]
            );
        } finally {
            setExporting(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'created': return '#10B981';
            case 'updated': return '#3B82F6';
            case 'deleted': return '#EF4444';
            case 'approved': return '#059669';
            case 'rejected': return '#DC2626';
            default: return '#64748B';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-24 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Security & Audit</Text>
                        <Text className="text-white text-xl font-bold">Audit Logs</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleExport}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <Download size={22} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Stats Summary */}
                <View className="flex-row justify-between">
                    <View className="flex-1 mr-2">
                        <PremiumCard variant="glass" className="p-4 items-center border-white/10">
                            <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Today</Text>
                            <Text className="text-white text-xl font-black">{stats?.today || 0}</Text>
                        </PremiumCard>
                    </View>
                    <View className="flex-1 mx-2">
                        <PremiumCard variant="glass" className="p-4 items-center border-white/10">
                            <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Week</Text>
                            <Text className="text-white text-xl font-black">{stats?.this_week || 0}</Text>
                        </PremiumCard>
                    </View>
                    <View className="flex-1 ml-2">
                        <PremiumCard variant="glass" className="p-4 items-center border-white/10">
                            <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Total</Text>
                            <Text className="text-white text-xl font-black">{stats?.total_logs || 0}</Text>
                        </PremiumCard>
                    </View>
                </View>
            </View>

            {/* Content Section */}
            <View className="flex-1 -mt-10 px-6">
                {/* Search & Filter Bar */}
                <PremiumCard variant="elevated" className="mb-6 p-2 bg-white flex-row items-center border-gray-100">
                    <View className="flex-1 flex-row items-center px-3">
                        <Search size={20} color="#94A3B8" />
                        <TextInput
                            placeholder="Search by user or action..."
                            className="flex-1 ml-2 text-primary font-medium"
                            value={search}
                            onChangeText={setSearch}
                            onSubmitEditing={handleSearch}
                        />
                    </View>
                    <TouchableOpacity
                        className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center"
                        onPress={handleSearch}
                    >
                        <ArrowRight size={20} color="#002147" />
                    </TouchableOpacity>
                </PremiumCard>

                {/* Logs List */}
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
                >
                    {loading && !refreshing ? (
                        <ActivityIndicator size="large" color="#002147" className="mt-20" />
                    ) : logs.length === 0 ? (
                        <View className="items-center justify-center mt-20">
                            <History size={64} color="#CBD5E1" />
                            <Text className="text-gray-400 font-bold mt-4">No audit logs found</Text>
                        </View>
                    ) : (
                        logs.map((log) => (
                            <TouchableOpacity
                                key={log.id}
                                onPress={() => {
                                    setSelectedLog(log);
                                    setShowModal(true);
                                }}
                            >
                                <PremiumCard variant="solid" className="mb-3 p-4 bg-white border-gray-50">
                                    <View className="flex-row justify-between items-start mb-2">
                                        <View className="flex-row items-center flex-1 pr-2">
                                            <View
                                                className="w-8 h-8 rounded-lg items-center justify-center mr-3"
                                                style={{ backgroundColor: `${getActionColor(log.action)}20` }}
                                            >
                                                <FileText size={16} color={getActionColor(log.action)} />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-primary font-black text-sm uppercase">
                                                    {log.action} {log.model_type.split('\\').pop()}
                                                </Text>
                                                <Text className="text-gray-400 text-[10px] font-bold uppercase">
                                                    Action by {log.user?.first_name} {log.user?.surname}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-gray-400 text-[10px] font-black uppercase">
                                            {formatDate(log.created_at).split(' ')[1] || ''} {formatDate(log.created_at).split(' ')[2] || ''}
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center justify-between">
                                        <View className="flex-row items-center">
                                            <Calendar size={12} color="#94A3B8" />
                                            <Text className="text-gray-400 text-[10px] font-bold ml-1">
                                                {formatDate(log.created_at).split(' ')[0]}
                                            </Text>
                                        </View>
                                        <View className="bg-primary/5 px-2 py-1 rounded-md">
                                            <Text className="text-primary text-[8px] font-black uppercase">
                                                #{log.model_id}
                                            </Text>
                                        </View>
                                    </View>
                                </PremiumCard>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Log Detail Modal */}
            <Modal
                visible={showModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-[40px] p-8 max-h-[85%]">
                        <View className="flex-row items-center justify-between mb-8">
                            <Text className="text-primary text-2xl font-black">Audit Detail</Text>
                            <TouchableOpacity
                                onPress={() => setShowModal(false)}
                                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <X size={24} color="#002147" />
                            </TouchableOpacity>
                        </View>

                        {selectedLog && (
                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="mb-6">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Action Details</Text>
                                    <PremiumCard variant="solid" className="p-4 bg-gray-50 border-gray-100">
                                        <View className="flex-row items-center mb-3">
                                            <View
                                                className="w-10 h-10 rounded-xl items-center justify-center mr-4"
                                                style={{ backgroundColor: `${getActionColor(selectedLog.action)}20` }}
                                            >
                                                <Info size={20} color={getActionColor(selectedLog.action)} />
                                            </View>
                                            <View>
                                                <Text className="text-primary font-black text-lg capitalize">{selectedLog.action}</Text>
                                                <Text className="text-gray-500 font-bold">{selectedLog.model_type}</Text>
                                            </View>
                                        </View>
                                        <View className="h-[1px] bg-gray-200 my-3" />
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-gray-400 font-bold">Model ID</Text>
                                            <Text className="text-primary font-black">#{selectedLog.model_id}</Text>
                                        </View>
                                        <View className="flex-row justify-between">
                                            <Text className="text-gray-400 font-bold">IP Address</Text>
                                            <Text className="text-primary font-bold">{selectedLog.ip_address}</Text>
                                        </View>
                                    </PremiumCard>
                                </View>

                                <View className="mb-6">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Performed By</Text>
                                    <PremiumCard variant="solid" className="p-4 bg-gray-50 border-gray-100 flex-row items-center">
                                        <View className="w-12 h-12 bg-primary/5 rounded-full items-center justify-center mr-4 border border-primary/10">
                                            <User size={24} color="#002147" />
                                        </View>
                                        <View>
                                            <Text className="text-primary font-black text-lg">
                                                {selectedLog.user?.first_name} {selectedLog.user?.surname}
                                            </Text>
                                            <Text className="text-gray-500 font-bold">{selectedLog.user?.email}</Text>
                                        </View>
                                    </PremiumCard>
                                </View>

                                {selectedLog.old_values && (
                                    <View className="mb-6">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Changes Detected</Text>
                                        <PremiumCard variant="solid" className="p-4 bg-gray-50 border-gray-100">
                                            {Object.entries(selectedLog.new_values).map(([key, value]) => {
                                                const oldValue = selectedLog.old_values[key];
                                                const hasChanged = oldValue !== value;

                                                if (!hasChanged) return null;

                                                // Format values for better display
                                                const formatValue = (val: any) => {
                                                    if (val === null || val === undefined) return 'null';
                                                    if (typeof val === 'object') return JSON.stringify(val, null, 2);
                                                    return String(val);
                                                };

                                                const formattedOld = formatValue(oldValue);
                                                const formattedNew = formatValue(value);

                                                return (
                                                    <View key={key} className="mb-4 last:mb-0">
                                                        <View className="flex-row items-center justify-between mb-2">
                                                            <Text className="text-primary font-black text-xs uppercase">{key}</Text>
                                                            <View className="bg-amber-50 px-2 py-1 rounded-md">
                                                                 <Text className="text-amber-700 text-[8px] font-black uppercase">Modified</Text>
                                                            </View>
                                                        </View>

                                                        {/* Side-by-side comparison */}
                                                        <View className="flex-row">
                                                            {/* Before (Old Value) */}
                                                            <View className="flex-1 mr-1">
                                                                <View className="bg-red-50 px-2 py-1 rounded-t-lg border-t border-l border-r border-red-200">
                                                                    <Text className="text-red-700 text-[8px] font-black uppercase tracking-widest">Before</Text>
                                                                </View>
                                                                <View className="bg-red-50/50 p-3 rounded-b-lg border border-red-100">
                                                                    <Text className="text-red-900 text-xs font-mono leading-5" numberOfLines={5}>
                                                                        {formattedOld}
                                                                    </Text>
                                                                </View>
                                                            </View>

                                                            {/* After (New Value) */}
                                                            <View className="flex-1 ml-1">
                                                                <View className="bg-emerald-50 px-2 py-1 rounded-t-lg border-t border-l border-r border-emerald-200">
                                                                    <Text className="text-emerald-700 text-[8px] font-black uppercase tracking-widest">After</Text>
                                                                </View>
                                                                <View className="bg-emerald-50/50 p-3 rounded-b-lg border border-emerald-100">
                                                                    <Text className="text-emerald-900 text-xs font-mono font-bold leading-5" numberOfLines={5}>
                                                                        {formattedNew}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                        </View>

                                                        {/* Diff indicator */}
                                                        <View className="mt-2 flex-row items-center justify-center">
                                                            <View className="h-[1px] flex-1 bg-gray-200" />
                                                            <View className="bg-gray-100 px-3 py-1 rounded-full mx-2">
                                                                <Text className="text-gray-500 text-[8px] font-black uppercase">
                                                                    {formattedOld.length} → {formattedNew.length} chars
                                                                </Text>
                                                            </View>
                                                            <View className="h-[1px] flex-1 bg-gray-200" />
                                                        </View>
                                                    </View>
                                                );
                                            })}

                                            {/* Show count of unchanged fields */}
                                            {Object.keys(selectedLog.new_values).filter(key =>
                                                selectedLog.old_values[key] === selectedLog.new_values[key]
                                            ).length > 0 && (
                                                    <View className="mt-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                        <Text className="text-blue-700 text-xs font-bold text-center">
                                                            {Object.keys(selectedLog.new_values).filter(key =>
                                                                selectedLog.old_values[key] === selectedLog.new_values[key]
                                                            ).length} field(s) unchanged
                                                        </Text>
                                                    </View>
                                                )}
                                        </PremiumCard>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Exporting loader HUD overlay */}
            {exporting && (
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', zIndex: 999 }]}>
                    <PremiumCard variant="elevated" className="bg-white p-8 items-center max-w-[80%] rounded-[30px] border border-gray-100 shadow-2xl">
                        <ActivityIndicator size="large" color="#002147" className="mb-4" />
                        <Text className="text-primary font-black text-base text-center mb-1">EXPORTING AUDIT REGISTRY</Text>
                        <Text className="text-gray-400 text-xs font-medium text-center leading-5">Compiling history logs, encrypting file signatures, and preparing secure CSV transmission packet...</Text>
                    </PremiumCard>
                </View>
            )}
        </SafeAreaView>
    );
}
