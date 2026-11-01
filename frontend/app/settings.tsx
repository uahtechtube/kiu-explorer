import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Lock, Bell, Moon, Shield, Save } from 'lucide-react-native';
import api from '../lib/api';

export default function SettingsScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Notification Preferences
    const [preferences, setPreferences] = useState({
        push_notifications: true,
        email_notifications: true,
        news_updates: true,
        assignment_alerts: true,
        event_reminders: true,
    });

    // Password Change
    const [passwordForm, setPasswordForm] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: '',
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await api.get('/settings');
            if (response.data.notification_preferences) {
                setPreferences(response.data.notification_preferences);
            }
        } catch (error) {
            console.error('Error fetching settings', error);
        } finally {
            setIsLoading(false);
        }
    };

    const togglePreference = async (key: keyof typeof preferences) => {
        const newPreferences = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPreferences);

        try {
            await api.post('/settings/notifications', newPreferences);
        } catch (error) {
            console.error('Error updating preference', error);
            // Revert on error
            setPreferences(preferences);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        setIsSaving(true);
        try {
            await api.post('/settings/password', {
                current_password: passwordForm.current_password,
                new_password: passwordForm.new_password,
                new_password_confirmation: passwordForm.new_password_confirmation
            });
            Alert.alert('Success', 'Password changed successfully');
            setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-gray-200 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-gray-100 p-2 rounded-full">
                    <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Account Settings</Text>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">

                {/* Notifications Section */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <Bell size={20} color="#3B82F6" />
                        <Text className="text-lg font-bold text-gray-800 ml-2">Notifications</Text>
                    </View>
                    <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                        {Object.keys(preferences).map((key) => (
                            <View key={key} className="flex-row justify-between items-center py-3 border-b border-gray-50 last:border-0">
                                <Text className="text-gray-700 capitalize">
                                    {key.replace('_', ' ')}
                                </Text>
                                <Switch
                                    trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                                    thumbColor={preferences[key as keyof typeof preferences] ? '#FFFFFF' : '#F3F4F6'}
                                    onValueChange={() => togglePreference(key as keyof typeof preferences)}
                                    value={preferences[key as keyof typeof preferences]}
                                />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Security Section */}
                <View className="mb-10">
                    <View className="flex-row items-center mb-4">
                        <Lock size={20} color="#EF4444" />
                        <Text className="text-lg font-bold text-gray-800 ml-2">Security</Text>
                    </View>
                    <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <Text className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Change Password</Text>

                        <View className="space-y-4">
                            <View>
                                <Text className="text-gray-700 mb-2 font-medium">Current Password</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 text-gray-800"
                                    secureTextEntry
                                    value={passwordForm.current_password}
                                    onChangeText={(text) => setPasswordForm({ ...passwordForm, current_password: text })}
                                    placeholder="Enter current password"
                                />
                            </View>

                            <View>
                                <Text className="text-gray-700 mb-2 font-medium">New Password</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 text-gray-800"
                                    secureTextEntry
                                    value={passwordForm.new_password}
                                    onChangeText={(text) => setPasswordForm({ ...passwordForm, new_password: text })}
                                    placeholder="Min. 8 characters"
                                />
                            </View>

                            <View>
                                <Text className="text-gray-700 mb-2 font-medium">Confirm New Password</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 text-gray-800"
                                    secureTextEntry
                                    value={passwordForm.new_password_confirmation}
                                    onChangeText={(text) => setPasswordForm({ ...passwordForm, new_password_confirmation: text })}
                                    placeholder="Re-enter new password"
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handlePasswordChange}
                                disabled={isSaving}
                                className="bg-primary py-3 rounded-xl items-center mt-2 shadow-sm"
                            >
                                {isSaving ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-base">Update Password</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Other Info */}
                <View className="mb-10 items-center">
                    <Text className="text-gray-400 text-xs">App Version 1.0.0</Text>
                    <Text className="text-gray-400 text-xs mt-1">© 2026 KIU EXPLORER</Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
