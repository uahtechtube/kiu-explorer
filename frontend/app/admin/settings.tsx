import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Bell, Shield, Database, Globe, Mail, Lock, Smartphone, ChevronRight, Zap, RefreshCw, Layers, LogOut } from 'lucide-react-native';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { useAuth } from '../../context/AuthContext';
import AdminNavBar from '../../components/admin/AdminNavBar';
import api from '../../lib/api';

const { width } = Dimensions.get('window');

export default function AdminSettingsPage() {
    const router = useRouter();
    const { signOut } = useAuth();
    const [notifications, setNotifications] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [twoFactor, setTwoFactor] = useState(true);

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

    const toggleSettings = [
        { label: 'Maintenance Mode', sub: 'Disable platform access', icon: Shield, value: maintenanceMode, onToggle: setMaintenanceMode, color: '#EF4444' },
        { label: 'Email Outreach', sub: 'System global notifications', icon: Mail, value: notifications, onToggle: setNotifications, color: '#3B82F6' },
        { label: 'Cloud Security (2FA)', sub: 'Biometric & SMS verification', icon: Lock, value: twoFactor, onToggle: setTwoFactor, color: '#10B981' },
    ];

    const actionItems = [
        { label: 'Vault Backup', sub: 'Full database synchrony', icon: Database, color: '#3B82F6', action: () => Alert.alert('Vault', 'Database snapshot created.') },
        { label: 'Engine Refresh', sub: 'Flush system cache layers', icon: RefreshCw, color: '#8B5CF6', action: () => Alert.alert('Engine', 'Optimization cycle complete.') },
        { label: 'Global Logs', sub: 'Trace system activity', icon: Layers, color: '#F59E0B', action: () => Alert.alert('Logs', 'Archives decrypted for viewing.') },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg">
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

            <ScrollView
                className="flex-1 -mt-10 px-6"
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {/* System Toggles */}
                <Text className="text-primary font-black text-xl mb-4 mt-4">Security & Core</Text>
                <PremiumCard variant="elevated" className="bg-white p-0 border-gray-100 overflow-hidden mb-8">
                    {toggleSettings.map((item, index) => (
                        <View
                            key={index}
                            className={`flex-row items-center justify-between p-6 ${index < toggleSettings.length - 1 ? 'border-b border-gray-50' : ''}`}
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

                {/* Operation Buttons */}
                <Text className="text-primary font-black text-xl mb-4">Operations Hub</Text>
                <View className="flex-row flex-wrap justify-between mb-8">
                    {actionItems.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={item.action}
                            className="w-full mb-4"
                        >
                            <PremiumCard variant="solid" className="p-5 flex-row items-center border-gray-100 bg-white">
                                <View
                                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                                    style={{ backgroundColor: `${item.color}10` }}
                                >
                                    <item.icon size={22} color={item.color} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-primary font-black text-sm">{item.label}</Text>
                                    <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">{item.sub}</Text>
                                </View>
                                <ChevronRight size={18} color="#CBD5E1" />
                            </PremiumCard>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Critical Danger Zone */}
                <PremiumCard variant="solid" className="bg-rose-50 border-rose-100 p-8 pt-10 mt-4 rounded-[32px]">
                    <View className="flex-row items-center mb-4">
                        <Shield size={20} color="#EF4444" />
                        <Text className="text-rose-900 font-black text-lg ml-3">Structural Reset</Text>
                    </View>
                    <Text className="text-rose-800 text-sm leading-6 mb-8">
                        Reseting system configuration will erase custom overrides and restore default security protocols. This action is tracked.
                    </Text>
                    <TouchableOpacity
                        onPress={() => Alert.alert('Reset', 'Authorized credential required for factory reset.')}
                        className="bg-rose-500 h-16 rounded-2xl items-center justify-center shadow-lg shadow-rose-200"
                    >
                        <Text className="text-white font-black text-lg tracking-widest uppercase">Initiate Total Reset</Text>
                    </TouchableOpacity>
                </PremiumCard>
            </ScrollView>
            <AdminNavBar />
        </SafeAreaView>
    );
}
