import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { User, Mail, LogOut, ChevronRight, Settings, Shield, Bell, HelpCircle, BookOpen, X, Check, Camera, Award } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../lib/api';

export default function LecturerProfileScreen() {
    const { user, signOut, signIn } = useAuth();
    const router = useRouter();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    // Edit Form State
    const [editForm, setEditForm] = useState({
        phone_number: '',
        office_location: '',
        office_hours: '',
        specialization: '',
    });

    const openEditModal = () => {
        setEditForm({
            phone_number: user?.phone_number || '',
            office_location: user?.lecturer_profile?.office_location || '',
            office_hours: user?.lecturer_profile?.office_hours || '',
            specialization: user?.lecturer_profile?.specialization || '',
        });
        setEditModalVisible(true);
    };

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            const response = await api.patch('/profile', editForm);
            await signIn(response.data.token || null, response.data.user);
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
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
                    }
                },
            ]
        );
    };

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Please allow access to your photo library');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
            uploadImage(result.assets[0].base64);
        }
    };

    const uploadImage = async (base64Image: string) => {
        try {
            const response = await api.post('/profile/upload-image', {
                image: `data:image/jpeg;base64,${base64Image}`
            });

            Alert.alert('Success', 'Profile photo updated successfully');

            if (response.data.user) {
                await signIn(response.data.token, response.data.user);
            }
        } catch (error: any) {
            Alert.alert('Error', 'Failed to upload image');
            console.error(error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1">
                {/* Profile Header */}
                <View className="items-center py-10 border-b border-gray-50">
                    <TouchableOpacity onPress={pickImage} className="w-24 h-24 bg-primary rounded-full items-center justify-center shadow-lg mb-4">
                        {user?.passport_photograph ? (
                            <Image
                                source={{ uri: user.passport_photograph }}
                                className="w-24 h-24 rounded-full"
                                resizeMode="cover"
                            />
                        ) : (
                            <Text className="text-white text-3xl font-bold">{user?.name?.charAt(0)}</Text>
                        )}
                        <View className="absolute bottom-0 right-0 w-8 h-8 bg-secondary rounded-full border-4 border-white items-center justify-center">
                            <Camera size={14} color="#002147" />
                        </View>
                    </TouchableOpacity>
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
                            <Award size={24} color="#FFD700" />
                            <Text className="text-white font-bold text-lg ml-3">Professional Info</Text>
                        </View>
                        <View className="space-y-4">
                            <View className="flex-row justify-between items-center border-b border-white/10 pb-3">
                                <Text className="text-white/60 text-sm">Faculty</Text>
                                <Text className="text-white font-medium text-sm">{user?.lecturer_profile?.faculty?.name || 'Not set'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center border-b border-white/10 pb-3">
                                <Text className="text-white/60 text-sm">Department</Text>
                                <Text className="text-white font-medium text-sm">{user?.lecturer_profile?.department?.name || 'Not set'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white/60 text-sm">Specialization</Text>
                                <Text className="text-white font-medium text-sm">{user?.lecturer_profile?.specialization || 'Not set'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Office Info Card */}
                <View className="px-6 mt-6">
                    <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <View className="flex-row items-center justify-between mb-6">
                            <View className="flex-row items-center">
                                <BookOpen size={24} color="#002147" />
                                <Text className="text-primary font-bold text-lg ml-3">Office Information</Text>
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
                                <Text className="text-gray-400 text-sm">Phone</Text>
                                <Text className="text-primary font-semibold text-sm">{user?.phone_number || 'Not set'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-400 text-sm">Office Location</Text>
                                <Text className="text-primary font-semibold text-sm">{user?.lecturer_profile?.office_location || 'Not set'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-gray-400 text-sm">Office Hours</Text>
                                <Text className="text-primary font-semibold text-sm">{user?.lecturer_profile?.office_hours || 'Not set'}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Menu Items */}
                <View className="px-6 mt-8">
                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 ml-2">Preferences</Text>

                    <TouchableOpacity onPress={() => router.push('/notifications')} className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between mb-3 border border-gray-100">
                        <View className="flex-row items-center">
                            <View className="bg-blue-50 p-2 rounded-xl mr-3">
                                <Bell size={20} color="#3B82F6" />
                            </View>
                            <Text className="text-primary font-semibold">Notifications</Text>
                        </View>
                        <ChevronRight size={18} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/settings' as any)} className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between mb-3 border border-gray-100">
                        <View className="flex-row items-center">
                            <View className="bg-purple-50 p-2 rounded-xl mr-3">
                                <Settings size={20} color="#8B5CF6" />
                            </View>
                            <Text className="text-primary font-semibold">Account Settings</Text>
                        </View>
                        <ChevronRight size={18} color="#D1D5DB" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/support' as any)} className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between mb-3 border border-gray-100">
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
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
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
                                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Office Info</Text>

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
                                        <Text className="text-primary font-semibold mb-2 ml-1">Office Location</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                            value={editForm.office_location}
                                            onChangeText={(text) => setEditForm({ ...editForm, office_location: text })}
                                            placeholder="e.g., Block A, Room 205"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-primary font-semibold mb-2 ml-1">Office Hours</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                            value={editForm.office_hours}
                                            onChangeText={(text) => setEditForm({ ...editForm, office_hours: text })}
                                            placeholder="e.g., Mon-Fri 9AM-5PM"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-primary font-semibold mb-2 ml-1">Specialization</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary pt-4"
                                            value={editForm.specialization}
                                            onChangeText={(text) => setEditForm({ ...editForm, specialization: text })}
                                            placeholder="e.g., Machine Learning, Web Development"
                                            multiline
                                            style={{ height: 80, textAlignVertical: 'top' }}
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
            </Modal>
        </SafeAreaView>
    );
}
