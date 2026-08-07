import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';
import { User, Mail, LogOut, ChevronRight, Settings, Shield, Bell, HelpCircle, GraduationCap, X, Check, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../lib/api';

export default function ProfileScreen() {
    const { user, signOut, signIn, updateProfile } = useAuth();
    const router = useRouter();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isExec, setIsExec] = useState(false);
    const [execAssociations, setExecAssociations] = useState<any[]>([]);

    useEffect(() => {
        if (user && user.role === 'student') {
            checkExecStatus();
        } else {
            setIsExec(false);
            setExecAssociations([]);
        }
    }, [user]);

    const checkExecStatus = async () => {
        try {
            const response = await api.get('/student/associations/my/memberships');
            const memberships = response.data.data || [];
            const execRoles = ['president', 'vice_president', 'secretary'];
            const execAssocs = memberships.filter((m: any) => execRoles.includes(m.member_role));
            if (execAssocs.length > 0) {
                setIsExec(true);
                setExecAssociations(execAssocs);
            } else {
                setIsExec(false);
                setExecAssociations([]);
            }
        } catch (error) {
            console.error('Error checking association exec status:', error);
        }
    };

    // Edit Form State
    const [editForm, setEditForm] = useState({
        surname: '',
        first_name: '',
        other_names: '',
        gender: '',
        dob: '',
        nationality: '',
        phone_number: '',
        alternative_phone_number: '',
        state_of_origin: '',
        lga: '',
        residential_address: '',
        city: '',
        state_of_residence: '',
        guardian_name: '',
        guardian_relationship: '',
        guardian_phone: '',
        guardian_email: '',
        guardian_address: '',
    });

    const openEditModal = () => {
        const studentProfile = user?.student_profile || user?.studentProfile || {};
        setEditForm({
            surname: user?.surname || '',
            first_name: user?.first_name || '',
            other_names: user?.other_names || '',
            gender: user?.gender || '',
            dob: user?.dob || '',
            nationality: user?.nationality || 'Nigerian',
            phone_number: user?.phone_number || '',
            alternative_phone_number: user?.alternative_phone_number || '',
            state_of_origin: user?.state_of_origin || '',
            lga: user?.lga || '',
            residential_address: user?.residential_address || '',
            city: user?.city || '',
            state_of_residence: user?.state_of_residence || '',
            guardian_name: studentProfile.guardian_name || '',
            guardian_relationship: studentProfile.guardian_relationship || '',
            guardian_phone: studentProfile.guardian_phone || '',
            guardian_email: studentProfile.guardian_email || '',
            guardian_address: studentProfile.guardian_address || '',
        });
        setEditModalVisible(true);
    };

    const handleUpdateProfile = async () => {
        setIsUpdating(true);
        try {
            const response = await api.patch('/profile', editForm);
            await updateProfile(response.data.user);
            setEditModalVisible(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            console.error('Profile update error:', error?.response?.data || error?.message || error);
            const msg = error?.response?.data?.error || error?.response?.data?.message || 'Failed to update profile';
            Alert.alert('Error', msg);
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

            // Update the user in AuthContext with the returned user (no token change needed)
            if (response.data.user) {
                await updateProfile(response.data.user);
            }

            Alert.alert('Success', 'Profile photo updated successfully');
        } catch (error: any) {
            console.error('Image upload error:', error?.response?.data || error?.message || error);
            const msg = error?.response?.data?.error || 'Failed to upload image';
            Alert.alert('Error', msg);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
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
                    <Text className="text-2xl font-bold text-primary">{(user?.surname && user?.first_name) ? `${user.surname} ${user.first_name}` : (user?.name || 'User')}</Text>
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
                                <Text className="text-white font-medium text-sm">{user?.student_profile?.faculty?.name || 'Not set'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center border-b border-white/10 pb-3">
                                <Text className="text-white/60 text-sm">Department</Text>
                                <Text className="text-white font-medium text-sm">{user?.student_profile?.department?.name || 'Not set'}</Text>
                            </View>
                            <View className="flex-row justify-between items-center">
                                <Text className="text-white/60 text-sm">Level</Text>
                                <Text className="text-white font-medium text-sm">{user?.student_profile?.level ? `${user.student_profile.level} Level` : 'Not set'}</Text>
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
                    {user?.role === 'student' && (
                        <>
                            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 ml-2">Personal File</Text>

                            <TouchableOpacity onPress={() => router.push('/profile/parent-guardian')} className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between mb-3 border border-gray-100">
                                <View className="flex-row items-center">
                                    <View className="bg-orange-50 p-2 rounded-xl mr-3">
                                        <Shield size={20} color="#F97316" />
                                    </View>
                                    <Text className="text-primary font-semibold">Parents & Guardians</Text>
                                </View>
                                <ChevronRight size={18} color="#D1D5DB" />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => router.push('/profile/documents')} className="bg-gray-50 p-4 rounded-2xl flex-row items-center justify-between mb-5 border border-gray-100">
                                <View className="flex-row items-center">
                                    <View className="bg-pink-50 p-2 rounded-xl mr-3">
                                        <GraduationCap size={20} color="#EC4899" />
                                    </View>
                                    <Text className="text-primary font-semibold">Student Documents</Text>
                                </View>
                                <ChevronRight size={18} color="#D1D5DB" />
                            </TouchableOpacity>

                            {isExec && (
                                <>
                                    <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-4 ml-2 mt-4">Executive Workspaces</Text>
                                    {execAssociations.map((assoc) => (
                                        <TouchableOpacity
                                            key={assoc.id}
                                            onPress={() => router.push({
                                                pathname: '/(association-exec)/dashboard',
                                                params: { associationId: assoc.id.toString(), associationName: assoc.name }
                                            } as any)}
                                            className="bg-primary/5 p-4 rounded-2xl flex-row items-center justify-between mb-3 border border-primary/10"
                                        >
                                            <View className="flex-row items-center flex-1 mr-2">
                                                <View className="bg-primary/10 p-2 rounded-xl mr-3">
                                                    <Shield size={20} color="#002147" />
                                                </View>
                                                <View className="flex-1">
                                                    <Text className="text-primary font-bold text-sm" numberOfLines={1}>{assoc.acronym} Executive Workspace</Text>
                                                    <Text className="text-gray-500 text-[10px] uppercase font-bold mt-0.5">{assoc.member_role}</Text>
                                                </View>
                                            </View>
                                            <ChevronRight size={18} color="#002147" />
                                        </TouchableOpacity>
                                    ))}
                                </>
                            )}
                        </>
                    )}

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
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    className="flex-1"
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        {/* Tap outside to close modal */}
                        <TouchableWithoutFeedback onPress={() => setEditModalVisible(false)}>
                            <View className="absolute inset-0" />
                        </TouchableWithoutFeedback>

                        <View className="bg-white rounded-t-3xl h-[85%] p-6 relative z-10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-primary">Edit Profile</Text>
                                <TouchableOpacity onPress={() => setEditModalVisible(false)} className="p-2 bg-gray-50 rounded-full w-10 h-10 items-center justify-center">
                                    <X size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 160 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                                <View className="space-y-4 mb-6">
                                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Personal Credentials</Text>

                                    <View className="flex-row gap-3">
                                        <View className="flex-1">
                                            <Text className="text-primary font-semibold mb-2 ml-1">Surname</Text>
                                            <TextInput
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                                value={editForm.surname}
                                                onChangeText={(text) => setEditForm({ ...editForm, surname: text })}
                                                placeholder="Surname"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-primary font-semibold mb-2 ml-1">First Name</Text>
                                            <TextInput
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                                value={editForm.first_name}
                                                onChangeText={(text) => setEditForm({ ...editForm, first_name: text })}
                                                placeholder="First name"
                                            />
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-primary font-semibold mb-2 ml-1">Other Names</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                            value={editForm.other_names}
                                            onChangeText={(text) => setEditForm({ ...editForm, other_names: text })}
                                            placeholder="Other names"
                                        />
                                    </View>

                                    <View className="flex-row gap-3">
                                        <View className="flex-1">
                                            <Text className="text-primary font-semibold mb-2 ml-1">Gender</Text>
                                            <TextInput
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                                value={editForm.gender}
                                                onChangeText={(text) => setEditForm({ ...editForm, gender: text })}
                                                placeholder="Male/Female"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-primary font-semibold mb-2 ml-1">Date of Birth</Text>
                                            <TextInput
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                                value={editForm.dob}
                                                onChangeText={(text) => setEditForm({ ...editForm, dob: text })}
                                                placeholder="YYYY-MM-DD"
                                            />
                                        </View>
                                    </View>

                                    <View className="flex-row gap-3">
                                        <View className="flex-1">
                                            <Text className="text-primary font-semibold mb-2 ml-1">Nationality</Text>
                                            <TextInput
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                                value={editForm.nationality}
                                                onChangeText={(text) => setEditForm({ ...editForm, nationality: text })}
                                                placeholder="Nationality"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-primary font-semibold mb-2 ml-1">Phone Number</Text>
                                            <TextInput
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                                value={editForm.phone_number}
                                                onChangeText={(text) => setEditForm({ ...editForm, phone_number: text })}
                                                placeholder="080..."
                                                keyboardType="phone-pad"
                                            />
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="text-primary font-semibold mb-2 ml-1">Alternative Phone</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                            value={editForm.alternative_phone_number}
                                            onChangeText={(text) => setEditForm({ ...editForm, alternative_phone_number: text })}
                                            placeholder="Optional alternative phone"
                                            keyboardType="phone-pad"
                                        />
                                    </View>

                                    <View className="flex-row gap-3">
                                        <View className="flex-1">
                                            <Text className="text-primary font-semibold mb-2 ml-1">State of Origin</Text>
                                            <TextInput
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                                value={editForm.state_of_origin}
                                                onChangeText={(text) => setEditForm({ ...editForm, state_of_origin: text })}
                                                placeholder="Enter state"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-primary font-semibold mb-2 ml-1">LGA</Text>
                                            <TextInput
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                                value={editForm.lga}
                                                onChangeText={(text) => setEditForm({ ...editForm, lga: text })}
                                                placeholder="Enter LGA"
                                            />
                                        </View>
                                    </View>

                                    <View className="flex-row gap-3">
                                        <View className="flex-1">
                                            <Text className="text-primary font-semibold mb-2 ml-1">City</Text>
                                            <TextInput
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                                value={editForm.city}
                                                onChangeText={(text) => setEditForm({ ...editForm, city: text })}
                                                placeholder="City"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-primary font-semibold mb-2 ml-1">State of Residence</Text>
                                            <TextInput
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                                value={editForm.state_of_residence}
                                                onChangeText={(text) => setEditForm({ ...editForm, state_of_residence: text })}
                                                placeholder="Current state"
                                            />
                                        </View>
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

                                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-6 mb-2">Guardian Information</Text>

                                    <View className="flex-row space-x-4">
                                        <View className="flex-2 flex-grow">
                                            <Text className="text-primary font-semibold mb-2 ml-1">Guardian Name</Text>
                                            <TextInput
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                                value={editForm.guardian_name}
                                                onChangeText={(text) => setEditForm({ ...editForm, guardian_name: text })}
                                                placeholder="Guardian full name"
                                            />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-primary font-semibold mb-2 ml-1">Relationship</Text>
                                            <TextInput
                                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                                value={editForm.guardian_relationship}
                                                onChangeText={(text) => setEditForm({ ...editForm, guardian_relationship: text })}
                                                placeholder="e.g. Father"
                                            />
                                        </View>
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

                                    <View>
                                        <Text className="text-primary font-semibold mb-2 ml-1">Guardian Email</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary"
                                            value={editForm.guardian_email}
                                            onChangeText={(text) => setEditForm({ ...editForm, guardian_email: text })}
                                            placeholder="guardian@example.com"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>

                                    <View>
                                        <Text className="text-primary font-semibold mb-2 ml-1">Guardian Address</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary pt-4"
                                            value={editForm.guardian_address}
                                            onChangeText={(text) => setEditForm({ ...editForm, guardian_address: text })}
                                            placeholder="Guardian residential address"
                                            multiline
                                            style={{ height: 80, textAlignVertical: 'top' }}
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={handleUpdateProfile}
                                    disabled={isUpdating}
                                    className="bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/30 mb-8"
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
        </SafeAreaView >
    );
}
