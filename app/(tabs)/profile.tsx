import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, LogOut, ChevronRight, Settings, Shield, Bell, HelpCircle, GraduationCap, X, Check } from 'lucide-react-native';
import api from '../../lib/api';

export default function ProfileScreen() {
    const { user, signOut, signIn } = useAuth();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        phone_number: '',
        state_of_origin: '',
        lga: '',
        residential_address: '',
        guardian_name: '',
        guardian_phone: '',
    });

    const openEditModal = () => {
        setEditForm({
            phone_number: user?.phone_number || '',
            state_of_origin: user?.state_of_origin || '',
            lga: user?.lga || '',
            residential_address: user?.residential_address || '', // Assuming this field exists in user object
            guardian_name: user?.student_profile?.guardian_name || '',
            guardian_phone: user?.student_profile?.guardian_phone || '',
        });
        setEditModalVisible(true);
    };

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            const response = await api.patch('/profile', editForm);
            // Update local user state
            await signIn(response.data.token || null, response.data.user); // Assuming backend returns updated user/token
            Alert.alert('Success', 'Profile updated successfully');
            setEditModalVisible(false);
        } catch (error: any) {
            console.error('Update failed', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout from KIU Explorer?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: signOut },
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1">
                {/* Profile Header */}
                <View className="items-center py-10 border-b border-gray-50">
                    <View className="w-24 h-24 bg-primary rounded-full items-center justify-center shadow-lg mb-4">
                        <Text className="text-white text-3xl font-bold">{user?.name?.charAt(0)}</Text>
                        <View className="absolute bottom-0 right-0 w-8 h-8 bg-secondary rounded-full border-4 border-white items-center justify-center">
                            <Shield size={14} color="#002147" />
                        </View>
                    </View>
                    <Text className="text-2xl font-bold text-primary">{user?.name}</Text>
                    <Text className="text-gray-400 mt-1">{user?.email}</Text>
                    <View className="bg-primary/5 px-4 py-1 rounded-full mt-3">
                        <Text className="text-primary font-semibold text-xs uppercase tracking-widest">{user?.role}</Text>
                    </View>
                </View>

                {/* Academic Details Card */}
                <View className="px-6 mt-8">
                    <View className="bg-primary p-6 rounded-[32px] shadow-sm">
                        <View className="flex-row items-center mb-6">
                            <GraduationCap size={24} color="#FFD700" />
                            <Text className="text-white font-bold text-lg ml-3">Academic Record</Text>
                        </View>
                        <View className="space-y-4">
                            <View className="flex-row justify-between items-center border-b border-white/10 pb-3">
                                <Text className="text-white/60 text-sm">Faculty</Text>
                                <Text className="text-white font-medium text-sm">{user?.student_profile?.faculty?.name || 'Social Sciences'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center border-b border-white/10 pb-3">
                                <Text className="text-white/60 text-sm">Department</Text>
                                <Text className="text-white font-medium text-sm">{user?.student_profile?.department?.name || 'Political Science'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white/60 text-sm">Level</Text>
                                <Text className="text-white font-medium text-sm">{user?.student_profile?.level || '400'} Level</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Bio Data Card */}
                <View className="px-6 mt-6">
                    <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <View className="flex-row items-center justify-between mb-6">
                            <View className="flex-row items-center">
                                <User size={24} color="#002147" />
                                <Text className="text-primary font-bold text-lg ml-3">Bio Data</Text>
                            </View>
                            <TouchableOpacity
                                onPress={openEditModal}
                                className="bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100"
                            >
                                <Text className="text-primary text-xs font-bold">Edit</Text>
                            </TouchableOpacity>
                        </View>
                        <View className="space-y-4">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-400 text-sm">Gender</Text>
                                <Text className="text-primary font-semibold text-sm">{user?.gender || 'Not set'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-400 text-sm">Phone</Text>
                                <Text className="text-primary font-semibold text-sm">{user?.phone_number || 'Not set'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-400 text-sm">State of Origin</Text>
                                <Text className="text-primary font-semibold text-sm">{user?.state_of_origin || 'Not set'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-400 text-sm">LGA</Text>
                                <Text className="text-primary font-semibold text-sm">{user?.lga || 'Not set'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Guardian Info Card */}
                <View className="px-6 mt-6">
                    <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <View className="flex-row items-center mb-6">
                            <Shield size={22} color="#002147" />
                            <Text className="text-primary font-bold text-lg ml-3">Guardian Info</Text>
                        </View>
                        <View className="space-y-4">
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-400 text-sm">Full Name</Text>
                                <Text className="text-primary font-semibold text-sm">{user?.student_profile?.guardian_name || 'Not set'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-400 text-sm">Phone</Text>
                                <Text className="text-primary font-semibold text-sm">{user?.student_profile?.guardian_phone || 'Not set'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Menu Items */}
                <View className="px-6 mt-8">
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 ml-2">Preferences</Text>

                    <TouchableOpacity className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between mb-3 border border-gray-100">
                        <View className="flex-row items-center">
                            <View className="bg-blue-50 p-2 rounded-xl mr-3">
                                <Bell size={20} color="#3B82F6" />
                            </View>
                            <Text className="text-primary font-semibold">Notifications</Text>
                        </View>
                        <ChevronRight size={18} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between mb-3 border border-gray-100">
                        <View className="flex-row items-center">
                            <View className="bg-purple-50 p-2 rounded-xl mr-3">
                                <Settings size={20} color="#8B5CF6" />
                            </View>
                            <Text className="text-primary font-semibold">Account Settings</Text>
                        </View>
                        <ChevronRight size={18} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between mb-3 border border-gray-100">
                        <View className="flex-row items-center">
                            <View className="bg-green-50 p-2 rounded-xl mr-3">
                                <HelpCircle size={20} color="#10B981" />
                            </View>
                            <Text className="text-primary font-semibold">Support & Help</Text>
                        </View>
                        <ChevronRight size={18} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="mt-8 bg-red-50 p-5 rounded-3xl flex-row items-center justify-center border border-red-100 mb-10"
                    >
                        <LogOut size={22} color="#EF4444" />
                        <Text className="text-red-500 font-bold text-lg ml-3">Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Edit Profile Modal */}
            < Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)
                }
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1"
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        <View className="bg-white rounded-t-3xl h-[85%] p-6">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-primary">Edit Profile</Text>
                                <TouchableOpacity onPress={() => setEditModalVisible(false)} className="p-2 bg-gray-50 rounded-full">
                                    <X size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <View className="space-y-4 mb-6">
                                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Personal Info</Text>

                                    <View>
                                        <Text className="text-primary font-semibold mb-2 ml-1">Phone Number</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                            value={editForm.phone_number}
                                            onChangeText={(text) => setEditForm({ ...editForm, phone_number: text })}
                                            placeholder="080..."
                                            keyboardType="phone-pad"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-primary font-semibold mb-2 ml-1">State of Origin</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                            value={editForm.state_of_origin}
                                            onChangeText={(text) => setEditForm({ ...editForm, state_of_origin: text })}
                                            placeholder="Enter state"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-primary font-semibold mb-2 ml-1">LGA</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                            value={editForm.lga}
                                            onChangeText={(text) => setEditForm({ ...editForm, lga: text })}
                                            placeholder="Enter LGA"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-primary font-semibold mb-2 ml-1">Residential Address</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary pt-4"
                                            value={editForm.residential_address}
                                            onChangeText={(text) => setEditForm({ ...editForm, residential_address: text })}
                                            placeholder="Enter full address"
                                            multiline
                                            style={{ height: 80, textAlignVertical: 'top' }}
                                        />
                                    </View>

                                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-4 mb-2">Guardian Info</Text>

                                    <View>
                                        <Text className="text-primary font-semibold mb-2 ml-1">Guardian Name</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                            value={editForm.guardian_name}
                                            onChangeText={(text) => setEditForm({ ...editForm, guardian_name: text })}
                                            placeholder="Guardian full name"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-primary font-semibold mb-2 ml-1">Guardian Phone</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                            value={editForm.guardian_phone}
                                            onChangeText={(text) => setEditForm({ ...editForm, guardian_phone: text })}
                                            placeholder="Guardian phone number"
                                            keyboardType="phone-pad"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={handleUpdateProfile}
                                    disabled={isUpdating}
                                    className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 mb-8"
                                >
                                    {isUpdating ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Text className="text-white text-lg font-bold mr-2">Save Changes</Text>
                                            <Check size={20} color="white" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal >
        </SafeAreaView >
    );
}
