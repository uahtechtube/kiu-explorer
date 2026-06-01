import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Search, UserCheck, UserX, Shield, Mail, MoreVertical, Filter, UserPlus, Users, X, Trash2, Edit2, Save } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import AdminNavBar from '../../../components/admin/AdminNavBar';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'lecturer' | 'admin';
    status: 'active' | 'suspended' | 'pending';
    joined_at: string;
}

export default function UserManagementPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('All');
    const [users, setUsers] = useState<User[]>([]);

    const [showAddUser, setShowAddUser] = useState(false);
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('kiu12345');
    const [newUserRole, setNewUserRole] = useState<'student' | 'lecturer' | 'admin'>('student');
    const [addingUser, setAddingUser] = useState(false);

    const [editUser, setEditUser] = useState<User | null>(null);
    const [editUserName, setEditUserName] = useState('');
    const [editUserEmail, setEditUserEmail] = useState('');
    const [editUserPassword, setEditUserPassword] = useState('');
    const [editUserRole, setEditUserRole] = useState<'student' | 'lecturer' | 'admin'>('student');
    const [savingUser, setSavingUser] = useState(false);

    const roles = ['All', 'Student', 'Lecturer', 'Admin'];

    const handleAddUser = async () => {
        if (!newUserName.trim() || !newUserEmail.trim() || !newUserPassword.trim()) {
            Alert.alert('Required Error', 'Please fill all fields');
            return;
        }
        try {
            setAddingUser(true);
            const [firstName, ...surnameParts] = newUserName.trim().split(' ');
            const surname = surnameParts.length ? surnameParts.join(' ') : firstName || 'Unknown';

            await api.post('/admin/users', {
                first_name: firstName,
                surname: surname,
                email: newUserEmail.trim(),
                password: newUserPassword,
                role: newUserRole,
            });
            Alert.alert('Success', 'User created successfully');
            setShowAddUser(false);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserPassword('kiu12345');
            fetchUsers();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to create user');
        } finally {
            setAddingUser(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users');
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Error:', error);
            // Professional Mock Data for Governance
            setUsers([
                { id: 1, name: 'John Doe', email: 'john@student.kiu.edu', role: 'student', status: 'active', joined_at: '2025-09-01' },
                { id: 2, name: 'Dr. Jane Smith', email: 'jane@kiu.edu', role: 'lecturer', status: 'active', joined_at: '2020-01-15' },
                { id: 3, name: 'Alice Johnson', email: 'alice@student.kiu.edu', role: 'student', status: 'suspended', joined_at: '2025-09-01' },
                { id: 4, name: 'Bob Admin', email: 'bob@admin.kiu.edu', role: 'admin', status: 'active', joined_at: '2019-05-20' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (userId: number, action: string) => {
        Alert.alert('Governance Action', `${action} user #${userId}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Confirm',
                onPress: async () => {
                    const newStatus = action === 'Suspend' ? 'suspended' : 'active';
                    const apiStatus = newStatus === 'suspended' ? 'blocked' : 'active';
                    try {
                        await api.patch(`/admin/users/${userId}/status`, { status: apiStatus });
                        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus as any } : u));
                        Alert.alert('Success', `User status updated to ${newStatus}`);
                    } catch (error: any) {
                        Alert.alert('Error', error.response?.data?.message || 'Failed to update user status');
                    }
                },
                style: action === 'Suspend' ? 'destructive' : 'default'
            },
        ]);
    };

    const handleDeleteUser = (userId: number) => {
        Alert.alert('Permanent Deletion', `Are you sure you want to permanently delete user #${userId}? THIS CANNOT BE UNDONE.`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete Permanently',
                onPress: async () => {
                    try {
                        await api.delete(`/admin/users/${userId}`);
                        setUsers(users.filter(u => u.id !== userId));
                        Alert.alert('Success', 'User deleted from the system');
                    } catch (error: any) {
                        Alert.alert('Error', error.response?.data?.message || 'Failed to delete user');
                    }
                },
                style: 'destructive'
            },
        ]);
    };

    const openEditModal = (user: User) => {
        setEditUser(user);
        setEditUserName(user.name);
        setEditUserEmail(user.email);
        setEditUserRole(user.role);
        setEditUserPassword('');
    };

    const saveEditUser = async () => {
        if (!editUser) return;
        try {
            setSavingUser(true);
            const [firstName, ...surnameParts] = editUserName.trim().split(' ');
            const surname = surnameParts.length ? surnameParts.join(' ') : firstName || 'Unknown';

            const payload: any = {
                first_name: firstName,
                surname: surname,
                email: editUserEmail.trim(),
                role: editUserRole,
            };
            if (editUserPassword) {
                payload.password = editUserPassword;
            }

            await api.put(`/admin/users/${editUser.id}`, payload);
            Alert.alert('Success', 'User updated successfully');
            setEditUser(null);
            fetchUsers();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update user');
        } finally {
            setSavingUser(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = selectedRole === 'All' || user.role === selectedRole.toLowerCase();
        return matchesSearch && matchesRole;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* High-End Header */}
            <View className="bg-primary px-6 pt-6 pb-24 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Global Governance</Text>
                        <Text className="text-white text-xl font-bold">User Directory</Text>
                    </View>
                    <TouchableOpacity
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/20"
                        onPress={() => setShowAddUser(true)}
                    >
                        <UserPlus size={22} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* Professional Search Hub */}
                <View className="bg-white flex-row items-center px-5 h-14 rounded-2xl shadow-xl shadow-primary/20 mb-6">
                    <Search size={20} color="#94A3B8" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search identities or email..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-3 text-primary font-medium"
                    />
                </View>

                {/* Role Filter Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
                    {roles.map((role) => (
                        <TouchableOpacity
                            key={role}
                            onPress={() => setSelectedRole(role)}
                            className={`px-6 py-2.5 rounded-2xl mx-2 border ${selectedRole === role ? 'bg-secondary border-secondary' : 'bg-white/10 border-white/10'
                                }`}
                        >
                            <Text className={`font-black text-[10px] uppercase ${selectedRole === role ? 'text-primary' : 'text-white/60'}`}>
                                {role}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                className="flex-1 -mt-12 px-6"
                contentContainerStyle={{ paddingBottom: 100 }}
            >
                {loading && !users.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <PremiumCard
                            key={user.id}
                            variant="elevated"
                            className="bg-white mb-5 p-5 border-gray-100"
                        >
                            <View className="flex-row items-start mb-6">
                                <View className="w-14 h-14 bg-gray-50 rounded-[20px] items-center justify-center border border-gray-100 mr-4">
                                    <Image source={{ uri: `https://ui-avatars.com/api/?name=${user.name}&background=002147&color=fff` }} className="w-full h-full rounded-[20px]" />
                                </View>

                                <View className="flex-1">
                                    <View className="flex-row justify-between items-start">
                                        <View className="flex-1 mr-2">
                                            <Text className="text-primary font-black text-lg mb-1">{user.name}</Text>
                                            <View className="flex-row items-center">
                                                <Mail size={10} color="#94A3B8" />
                                                <Text className="text-gray-400 text-[10px] font-bold ml-1.5">{user.email}</Text>
                                            </View>
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeleteUser(user.id)} className="bg-rose-50 p-2 rounded-xl">
                                            <Trash2 size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                    <View className="flex-row items-center mt-3">
                                        <StatusBadge status={user.role as any} />
                                        <View className="w-1 h-1 bg-gray-200 rounded-full mx-2" />
                                        <StatusBadge status={user.status} />
                                    </View>
                                </View>
                            </View>

                            {/* Rapid Actions */}
                            <View className="flex-row items-center border-t border-gray-50 pt-4">
                                <TouchableOpacity
                                    onPress={() => handleAction(user.id, user.status === 'active' ? 'Suspend' : 'Activate')}
                                    className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl ${user.status === 'active' ? 'bg-rose-50' : 'bg-emerald-50'
                                        }`}
                                >
                                    {user.status === 'active' ? (
                                        <UserX size={14} color="#EF4444" />
                                    ) : (
                                        <UserCheck size={14} color="#10B981" />
                                    )}
                                    <Text className={`font-black text-[10px] uppercase ml-2 ${user.status === 'active' ? 'text-rose-600' : 'text-emerald-600'
                                        }`}>{user.status === 'active' ? 'Revoke Access' : 'Grant Access'}</Text>
                                </TouchableOpacity>
                                <View className="w-2" />
                                <TouchableOpacity onPress={() => openEditModal(user)} className="flex-1 flex-row items-center justify-center bg-primary/5 py-2.5 rounded-xl">
                                    <Edit2 size={14} color="#002147" />
                                    <Text className="text-primary font-black text-[10px] uppercase ml-2">Edit Clearance</Text>
                                </TouchableOpacity>
                            </View>
                        </PremiumCard>
                    ))
                ) : (
                    <View className="items-center justify-center py-32 opacity-20">
                        <Users size={64} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4">NO MATCHING IDENTITIES</Text>
                    </View>
                )}
            </ScrollView>

            {/* Add User Modal */}
            <Modal visible={showAddUser} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-primary text-xl font-bold">Create Identity</Text>
                            <TouchableOpacity onPress={() => setShowAddUser(false)}>
                                <X size={24} color="#0F172A" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Full Name</Text>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl border border-gray-100 text-primary mb-4"
                            placeholder="e.g. John Doe"
                            value={newUserName}
                            onChangeText={setNewUserName}
                        />

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Email Address</Text>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl border border-gray-100 text-primary mb-4"
                            placeholder="e.g. john@kiu.edu"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={newUserEmail}
                            onChangeText={setNewUserEmail}
                        />

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Temporary Password</Text>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl border border-gray-100 text-primary mb-4"
                            secureTextEntry
                            value={newUserPassword}
                            onChangeText={setNewUserPassword}
                        />

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Role Clearance</Text>
                        <View className="flex-row space-x-2 mb-6">
                            {(['student', 'lecturer', 'admin'] as const).map(role => (
                                <TouchableOpacity
                                    key={role}
                                    onPress={() => setNewUserRole(role)}
                                    className={`flex-1 py-3 rounded-xl items-center ${newUserRole === role ? 'bg-primary' : 'bg-gray-100'}`}
                                >
                                    <Text className={`font-bold text-[10px] uppercase ${newUserRole === role ? 'text-white' : 'text-gray-500'}`}>
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={handleAddUser}
                            disabled={addingUser}
                            className="bg-primary py-4 rounded-2xl items-center flex-row justify-center"
                        >
                            {addingUser ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <UserPlus size={18} color="white" />
                                    <Text className="text-white font-bold ml-2">Provision User</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Edit User Modal */}
            <Modal visible={!!editUser} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-primary text-xl font-bold">Edit Identity</Text>
                            <TouchableOpacity onPress={() => setEditUser(null)}>
                                <X size={24} color="#0F172A" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Full Name</Text>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl border border-gray-100 text-primary mb-4"
                            value={editUserName}
                            onChangeText={setEditUserName}
                        />

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Email Address</Text>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl border border-gray-100 text-primary mb-4"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={editUserEmail}
                            onChangeText={setEditUserEmail}
                        />

                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-gray-500 text-sm font-semibold">New Password (leave blank to keep current)</Text>
                            <TouchableOpacity 
                                onPress={() => {
                                    setEditUserPassword('kiu12345');
                                    Alert.alert('Password Set', 'Password has been set to the default: kiu12345');
                                }}
                                className="bg-secondary/40 px-2.5 py-1 rounded-lg border border-secondary/20"
                            >
                                <Text className="text-primary font-black text-[9px] uppercase tracking-wider">Reset to Default</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            className="bg-gray-50 px-4 h-12 rounded-xl border border-gray-100 text-primary mb-4"
                            secureTextEntry
                            placeholder="Enter new password if changing"
                            value={editUserPassword}
                            onChangeText={setEditUserPassword}
                        />

                        <Text className="text-gray-500 text-sm font-semibold mb-2">Role Clearance</Text>
                        <View className="flex-row space-x-2 mb-6">
                            {(['student', 'lecturer', 'admin'] as const).map(role => (
                                <TouchableOpacity
                                    key={role}
                                    onPress={() => setEditUserRole(role)}
                                    className={`flex-1 py-3 rounded-xl items-center ${editUserRole === role ? 'bg-primary' : 'bg-gray-100'}`}
                                >
                                    <Text className={`font-bold text-[10px] uppercase ${editUserRole === role ? 'text-white' : 'text-gray-500'}`}>
                                        {role}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            onPress={saveEditUser}
                            disabled={savingUser}
                            className="bg-primary py-4 rounded-2xl items-center flex-row justify-center"
                        >
                            {savingUser ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Save size={18} color="white" />
                                    <Text className="text-white font-bold ml-2">Save Changes</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <AdminNavBar />
        </SafeAreaView>
    );
}
