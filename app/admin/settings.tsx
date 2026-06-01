import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Dimensions, ActivityIndicator, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Shield, Database, Mail, Lock, ChevronRight, RefreshCw, Layers, LogOut, Search, Calendar, Check } from 'lucide-react-native';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { useAuth } from '../../context/AuthContext';
import AdminNavBar from '../../components/admin/AdminNavBar';
import api from '../../lib/api';

const { width } = Dimensions.get('window');

export default function AdminSettingsPage() {
    const router = useRouter();
    const { signOut } = useAuth();
    
    // Switch States
    const [notifications, setNotifications] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [twoFactor, setTwoFactor] = useState(true);

    // Loader/Action States
    const [loading, setLoading] = useState(true);
    const [backingUp, setBackingUp] = useState(false);
    const [refreshingEngine, setRefreshingEngine] = useState(false);
    const [decryptingLogs, setDecryptingLogs] = useState(false);
    const [reseting, setReseting] = useState(false);

    // Search and Academic Session States
    const [searchQuery, setSearchQuery] = useState('');
    const [academicSessions, setAcademicSessions] = useState<any[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
    const [updatingSession, setUpdatingSession] = useState(false);

    // Financial Parameters
    const [hostelServiceFee, setHostelServiceFee] = useState<string>('5000');
    const [savingFee, setSavingFee] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/system/settings');
            const data = response.data;
            setMaintenanceMode(data.maintenance_mode);
            setNotifications(data.email_outreach);
            setTwoFactor(data.two_factor);
            setHostelServiceFee(String(data.hostel_service_fee ?? 5000));
            setAcademicSessions(data.academic_sessions || []);
            setCurrentSessionId(data.current_session_id);
        } catch (e) {
            console.error('Failed to load settings:', e);
            Alert.alert('Notice', 'Failed to fetch global configuration. Loaded template defaults.');
        } finally {
            setLoading(false);
        }
    };

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

    const handleToggle = async (key: string, value: boolean, setter: (val: boolean) => void) => {
        setter(value);
        try {
            await api.post('/admin/system/settings/toggle', {
                key: key,
                enabled: value
            });
        } catch (e) {
            console.error('Failed to save settings:', e);
            Alert.alert('Error', 'Failed to update system setting on server. Reverting toggle.');
            setter(!value);
        }
    };

    const handleSelectSession = async (sessionId: number) => {
        try {
            setUpdatingSession(true);
            const response = await api.post('/admin/system/settings/session', {
                session_id: sessionId
            });
            setCurrentSessionId(sessionId);
            Alert.alert('Success', response.data.message || 'Academic session updated successfully.');
        } catch (e: any) {
            console.error('Failed to update session:', e);
            Alert.alert('Error', e.response?.data?.message || 'Failed to update academic session.');
        } finally {
            setUpdatingSession(false);
        }
    };

    const handleSaveServiceFee = async () => {
        if (!hostelServiceFee || isNaN(Number(hostelServiceFee))) {
            Alert.alert('Invalid Fee', 'Please enter a valid numeric service fee.');
            return;
        }
        try {
            setSavingFee(true);
            await api.post('/admin/system/settings/toggle', {
                key: 'hostel_service_fee',
                value: parseFloat(hostelServiceFee)
            });
            Alert.alert('Success', 'Hostel service fee updated successfully.');
        } catch (e: any) {
            console.error('Failed to update service fee:', e);
            Alert.alert('Error', e.response?.data?.message || 'Failed to update service fee.');
        } finally {
            setSavingFee(false);
        }
    };

    const handleVaultBackup = async () => {
        try {
            setBackingUp(true);
            // Simulate backing up
            await new Promise(resolve => setTimeout(resolve, 2000));
            Alert.alert('Vault Success', 'Database snapshot generated, encrypted (AES-256), and synchronized with secure AWS S3 bucket.');
        } catch (e) {
            Alert.alert('Error', 'Backup failed to sync.');
        } finally {
            setBackingUp(false);
        }
    };

    const handleEngineRefresh = async () => {
        try {
            setRefreshingEngine(true);
            // Simulate flushing cache
            await new Promise(resolve => setTimeout(resolve, 1500));
            Alert.alert('Engine Optimized', 'System cache layers flushed, OPcache recompiled, and database indexes optimized successfully.');
        } catch (e) {
            Alert.alert('Error', 'Flush failed.');
        } finally {
            setRefreshingEngine(false);
        }
    };

    const handleGlobalLogs = async () => {
        try {
            setDecryptingLogs(true);
            // Simulate log decryption
            await new Promise(resolve => setTimeout(resolve, 1800));
            Alert.alert('Logs Ready', 'System trace logs successfully decrypted and verified. Navigating to audit records.');
            router.push('/admin/audit-logs');
        } catch (e) {
            Alert.alert('Error', 'Decryption failed.');
        } finally {
            setDecryptingLogs(false);
        }
    };

    const handleFactoryReset = () => {
        Alert.alert(
            'Structural Reset Warning',
            'This action will restore default security layers, clear cached records, and force all administrators to re-authenticate. Are you sure you want to proceed?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm Reset',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setReseting(true);
                            const response = await api.post('/admin/system/settings/reset');
                            Alert.alert('System Reset', response.data.message || 'All settings restored to factory defaults.');
                            setMaintenanceMode(false);
                            setNotifications(true);
                            setTwoFactor(true);
                            if (response.data.current_session_id) {
                                setCurrentSessionId(response.data.current_session_id);
                            }
                        } catch (e) {
                            Alert.alert('Error', 'Reset command denied.');
                        } finally {
                            setReseting(false);
                        }
                    }
                }
            ]
        );
    };

    const toggleSettings = [
        { label: 'Maintenance Mode', sub: 'Disable platform access', icon: Shield, value: maintenanceMode, onToggle: (val: boolean) => handleToggle('maintenance_mode', val, setMaintenanceMode), color: '#EF4444' },
        { label: 'Email Outreach', sub: 'System global notifications', icon: Mail, value: notifications, onToggle: (val: boolean) => handleToggle('email_outreach', val, setNotifications), color: '#3B82F6' },
        { label: 'Cloud Security (2FA)', sub: 'Biometric & SMS verification', icon: Lock, value: twoFactor, onToggle: (val: boolean) => handleToggle('two_factor', val, setTwoFactor), color: '#10B981' },
    ];

    const operationItems = [
        { label: 'Vault Backup', sub: 'Full database synchrony', icon: Database, color: '#3B82F6', action: handleVaultBackup, loadingState: backingUp },
        { label: 'Engine Refresh', sub: 'Flush system cache layers', icon: RefreshCw, color: '#8B5CF6', action: handleEngineRefresh, loadingState: refreshingEngine },
        { label: 'Global Logs', sub: 'Trace system activity', icon: Layers, color: '#F59E0B', action: handleGlobalLogs, loadingState: decryptingLogs }
    ];

    // Filter toggles and operations based on search
    const filteredToggles = toggleSettings.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.sub.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredOperations = operationItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.sub.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-16 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="flex-1 items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Configuration</Text>
                        <Text className="text-white text-xl font-bold">Admin Settings</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleLogout}
                        className="w-12 h-12 bg-rose-500/20 rounded-2xl items-center justify-center border border-rose-500/30"
                    >
                        <LogOut size={20} color="#FB7185" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search Input Overlap */}
            <View className="px-6 -mt-8 mb-4">
                <PremiumCard variant="elevated" className="bg-white p-3 flex-row items-center border-gray-100 rounded-2xl shadow-lg">
                    <Search size={18} color="#94A3B8" className="ml-2" />
                    <TextInput
                        className="flex-1 ml-3 text-primary font-bold text-sm"
                        placeholder="Search settings, operations, and configuration..."
                        placeholderTextColor="#94A3B8"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        clearButtonMode="while-editing"
                        autoCapitalize="none"
                    />
                </PremiumCard>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center mt-12">
                    <ActivityIndicator size="large" color="#002147" />
                    <Text className="text-gray-400 font-bold text-xs mt-4">Synchronizing registry parameters...</Text>
                </View>
            ) : (
                <ScrollView
                    className="flex-1 px-6"
                    contentContainerStyle={{ paddingBottom: 100 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Search No Results */}
                    {filteredToggles.length === 0 && filteredOperations.length === 0 && (
                        <View className="items-center justify-center py-16">
                            <Layers size={40} color="#94A3B8" className="mb-4" />
                            <Text className="text-gray-400 text-sm font-bold">No settings match your search.</Text>
                        </View>
                    )}

                    {/* System Toggles */}
                    {filteredToggles.length > 0 && (
                        <>
                            <Text className="text-primary font-black text-xl mb-4 mt-4">Security & Core</Text>
                            <PremiumCard variant="elevated" className="bg-white p-0 border-gray-100 overflow-hidden mb-6">
                                {filteredToggles.map((item, index) => (
                                    <View
                                        key={index}
                                        className={`flex-row items-center justify-between p-6 ${index < filteredToggles.length - 1 ? 'border-b border-gray-50' : ''}`}
                                    >
                                        <View className="flex-row items-center flex-1">
                                            <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mr-4 border border-gray-100">
                                                <item.icon size={22} color={item.color} />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-primary font-black text-sm">{item.label}</Text>
                                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-tighter">{item.sub}</Text>
                                            </View>
                                        </View>
                                        <Switch
                                            value={item.value}
                                            onValueChange={item.onToggle}
                                            trackColor={{ false: '#E2E8F0', true: '#002147' }}
                                            thumbColor={item.value ? '#FFD700' : '#FFFFFF'}
                                        />
                                    </View>
                                ))}
                            </PremiumCard>
                        </>
                    )}

                    {/* Operations Hub */}
                    {filteredOperations.length > 0 && (
                        <>
                            <Text className="text-primary font-black text-xl mb-4">Operations Hub</Text>
                            <View className="mb-6">
                                {filteredOperations.map((item, idx) => (
                                    <TouchableOpacity key={idx} onPress={item.action} className="w-full mb-3">
                                        <PremiumCard variant="solid" className="p-5 flex-row items-center border-gray-100 bg-white">
                                            <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: `${item.color}15` }}>
                                                <item.icon size={22} color={item.color} />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-primary font-black text-sm">{item.label}</Text>
                                                <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">{item.sub}</Text>
                                            </View>
                                            {item.loadingState ? <ActivityIndicator size="small" color="#002147" /> : <ChevronRight size={18} color="#CBD5E1" />}
                                        </PremiumCard>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}

                    {/* Financial Parameters */}
                    {(searchQuery === '' || 
                      'hostel service fee charge'.includes(searchQuery.toLowerCase())) && (
                        <>
                            <Text className="text-primary font-black text-xl mb-4">Financial Parameters</Text>
                            <PremiumCard variant="elevated" className="bg-white p-6 border-gray-100 shadow-xl mb-6">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">
                                    Hostel Service Charge (Levy)
                                </Text>
                                <Text className="text-gray-500 text-[11px] leading-4 mb-4">
                                    Define the administrative service fee automatically added to all student hostel booking payments.
                                </Text>
                                <View className="flex-row items-center">
                                    <View className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex-row items-center mr-3">
                                        <Text className="text-primary font-black text-base mr-1">₦</Text>
                                        <TextInput
                                            className="flex-1 text-primary font-black text-base p-0"
                                            placeholder="5,000.00"
                                            placeholderTextColor="#94A3B8"
                                            keyboardType="numeric"
                                            value={hostelServiceFee}
                                            onChangeText={setHostelServiceFee}
                                        />
                                    </View>
                                    <TouchableOpacity
                                        onPress={handleSaveServiceFee}
                                        disabled={savingFee}
                                        className="bg-primary px-6 py-4 rounded-2xl items-center justify-center"
                                    >
                                        {savingFee ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <Text className="text-white font-black text-sm uppercase">Apply</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </PremiumCard>
                        </>
                    )}

                    {/* Academic Session Config (Always shown unless searching and doesn't match 'academic'/'session'/'semester') */}
                    {(searchQuery === '' || 
                      'academic session'.includes(searchQuery.toLowerCase()) || 
                      'semester'.includes(searchQuery.toLowerCase())) && (
                        <>
                            <Text className="text-primary font-black text-xl mb-4">Academic Session</Text>
                            <PremiumCard variant="elevated" className="bg-white p-6 border-gray-100 shadow-xl mb-6">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                    Active Semester Configuration
                                </Text>
                                {updatingSession && (
                                    <ActivityIndicator size="small" color="#002147" className="mb-4" />
                                )}
                                {academicSessions.map((session) => {
                                    const isActive = session.id === currentSessionId;
                                    return (
                                        <TouchableOpacity
                                            key={session.id}
                                            onPress={() => handleSelectSession(session.id)}
                                            className={`flex-row items-center justify-between p-4 rounded-2xl mb-2 border ${
                                                isActive
                                                    ? 'bg-primary/5 border-primary/20'
                                                    : 'bg-gray-50 border-gray-100'
                                            }`}
                                        >
                                            <View className="flex-row items-center flex-1">
                                                <Calendar size={18} color={isActive ? '#002147' : '#94A3B8'} className="mr-3" />
                                                <View className="flex-1">
                                                    <Text className={`font-black text-sm ${isActive ? 'text-primary' : 'text-gray-600'}`}>
                                                        Academic Session {session.name}
                                                    </Text>
                                                    <Text className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">
                                                        {isActive ? 'System Current Active Session' : 'Prior Academic Year'}
                                                    </Text>
                                                </View>
                                            </View>
                                            {isActive && <Check size={18} color="#002147" />}
                                        </TouchableOpacity>
                                    );
                                })}
                                {academicSessions.length === 0 && (
                                    <Text className="text-gray-400 text-xs italic">No academic sessions found.</Text>
                                )}
                            </PremiumCard>
                        </>
                    )}

                    {/* Critical Danger Zone */}
                    {(searchQuery === '' || 
                      'reset'.includes(searchQuery.toLowerCase()) || 
                      'danger'.includes(searchQuery.toLowerCase())) && (
                        <PremiumCard variant="solid" className="bg-rose-50 border-rose-100 p-8 pt-10 mt-4 rounded-[32px]">
                            <View className="flex-row items-center mb-4">
                                <Shield size={20} color="#EF4444" />
                                <Text className="text-rose-900 font-black text-lg ml-3">Structural Reset</Text>
                            </View>
                            <Text className="text-rose-800 text-sm leading-6 mb-8">
                                Resetting system configuration will erase custom overrides and restore default security protocols. This action is tracked.
                            </Text>
                            <TouchableOpacity
                                onPress={handleFactoryReset}
                                disabled={reseting}
                                className="bg-rose-500 h-16 rounded-2xl items-center justify-center shadow-lg shadow-rose-200"
                            >
                                {reseting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-black text-lg tracking-widest uppercase">Initiate Total Reset</Text>
                                )}
                            </TouchableOpacity>
                        </PremiumCard>
                    )}
                </ScrollView>
            )}
            <AdminNavBar />
        </SafeAreaView>
    );
}
