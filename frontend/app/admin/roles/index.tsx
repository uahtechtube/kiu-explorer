import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, TextInput, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Shield, Plus, Edit2, Trash2, Users, Check, X, Search, Filter, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface Permission {
    id: number;
    name: string;
    slug: string;
    category: string;
    description: string;
}

interface Role {
    id: number;
    name: string;
    slug: string;
    description: string;
    permissions_count: number;
    users_count: number;
    permissions?: Permission[];
}

export default function RolesManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<Record<string, Permission[]>>({});

    // Modal states
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        permissions: [] as number[]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [rolesRes, permsRes] = await Promise.all([
                api.get('/admin/roles'),
                api.get('/admin/permissions')
            ]);
            setRoles(rolesRes.data.roles);
            setAllPermissions(permsRes.data.permissions);
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    }, []);

    const handleCreateRole = () => {
        setSelectedRole(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            permissions: []
        });
        setShowRoleModal(true);
    };

    const handleEditRole = async (role: Role) => {
        try {
            const response = await api.get(`/admin/roles/${role.id}`);
            const fullRole = response.data.role;
            setSelectedRole(fullRole);
            setFormData({
                name: fullRole.name,
                slug: fullRole.slug,
                description: fullRole.description,
                permissions: fullRole.permissions.map((p: Permission) => p.id)
            });
            setShowRoleModal(true);
        } catch (error) {
            console.error('Error fetching role details:', error);
        }
    };

    const handleSaveRole = async () => {
        try {
            if (selectedRole) {
                await api.put(`/admin/roles/${selectedRole.id}`, formData);
            } else {
                await api.post('/admin/roles', formData);
            }
            setShowRoleModal(false);
            fetchData();
        } catch (error) {
            console.error('Error saving role:', error);
        }
    };

    const handleDeleteRole = async (id: number) => {
        try {
            await api.delete(`/admin/roles/${id}`);
            fetchData();
        } catch (error) {
            alert('Cannot delete role with assigned users');
        }
    };

    const togglePermission = (id: number) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(id)
                ? prev.permissions.filter(pId => pId !== id)
                : [...prev.permissions, id]
        }));
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
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Access Control</Text>
                        <Text className="text-white text-xl font-bold">Roles & Permissions</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleCreateRole}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/20"
                    >
                        <Plus size={24} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* Role Toggles/Filters */}
                <View className="flex-row items-center bg-white/10 p-1 rounded-2xl border border-white/20">
                    <TouchableOpacity className="flex-1 py-3 items-center bg-white rounded-xl shadow-sm">
                        <Text className="text-primary font-black text-xs uppercase">All Roles</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 py-3 items-center">
                        <Text className="text-white font-black text-xs uppercase">Active</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-1 py-3 items-center">
                        <Text className="text-white font-black text-xs uppercase">Permissions</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Roles List */}
            <View className="flex-1 -mt-10 px-6">
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
                >
                    {loading && !refreshing ? (
                        <ActivityIndicator size="large" color="#002147" className="mt-20" />
                    ) : (
                        roles.map((role) => (
                            <PremiumCard key={role.id} variant="elevated" className="mb-4 p-5 bg-white border-gray-100">
                                <View className="flex-row justify-between items-start mb-4">
                                    <View className="flex-row items-center">
                                        <View className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center mr-4">
                                            <Shield size={24} color="#002147" />
                                        </View>
                                        <View>
                                            <Text className="text-primary font-black text-lg">{role.name}</Text>
                                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                                {role.slug}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row">
                                        <TouchableOpacity
                                            onPress={() => handleEditRole(role)}
                                            className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-2"
                                        >
                                            <Edit2 size={16} color="#3B82F6" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteRole(role.id)}
                                            className="w-8 h-8 bg-rose-50 rounded-lg items-center justify-center"
                                        >
                                            <Trash2 size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text className="text-gray-500 text-sm mb-4 leading-5">{role.description}</Text>

                                <View className="flex-row items-center border-t border-gray-50 pt-4">
                                    <View className="flex-row items-center mr-6">
                                        <ShieldCheck size={16} color="#10B981" />
                                        <Text className="text-gray-400 text-xs font-bold ml-2">
                                            {role.permissions_count} Permissions
                                        </Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Users size={16} color="#8B5CF6" />
                                        <Text className="text-gray-400 text-xs font-bold ml-2">
                                            {role.users_count} Users
                                        </Text>
                                    </View>
                                </View>
                            </PremiumCard>
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Role Editor Modal */}
            <Modal
                visible={showRoleModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowRoleModal(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-[40px] p-8 h-[90%]">
                        <View className="flex-row items-center justify-between mb-8">
                            <Text className="text-primary text-2xl font-black">
                                {selectedRole ? 'Edit Role' : 'Create Role'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => setShowRoleModal(false)}
                                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <X size={24} color="#002147" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Role Details */}
                            <View className="mb-6">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Basic Info</Text>
                                <View className="space-y-4">
                                    <View>
                                        <Text className="text-gray-400 text-xs font-bold mb-1 ml-1">Role Name</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-primary font-bold"
                                            placeholder="e.g. Senior Moderator"
                                            value={formData.name}
                                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-gray-400 text-xs font-bold mb-1 ml-1">Slug (Identifier)</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-primary font-bold"
                                            placeholder="e.g. senior-moderator"
                                            value={formData.slug}
                                            onChangeText={(text) => setFormData({ ...formData, slug: text.toLowerCase().replace(/ /g, '-') })}
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-gray-400 text-xs font-bold mb-1 ml-1">Description</Text>
                                        <TextInput
                                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-primary font-bold"
                                            placeholder="What can this role do?"
                                            multiline
                                            numberOfLines={3}
                                            value={formData.description}
                                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Permissions Matrix */}
                            <View className="mb-10">
                                <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Permissions Matrix</Text>
                                {Object.entries(allPermissions).map(([category, perms]) => (
                                    <View key={category} className="mb-6">
                                        <Text className="text-primary font-black text-sm uppercase mb-3 ml-1">{category}</Text>
                                        <View className="flex-row flex-wrap">
                                            {perms.map((perm) => (
                                                <TouchableOpacity
                                                    key={perm.id}
                                                    onPress={() => togglePermission(perm.id)}
                                                    className={`mr-2 mb-2 px-4 py-2 rounded-xl border ${formData.permissions.includes(perm.id)
                                                            ? 'bg-primary border-primary'
                                                            : 'bg-white border-gray-200'
                                                        }`}
                                                >
                                                    <Text className={`text-[10px] font-black uppercase ${formData.permissions.includes(perm.id) ? 'text-white' : 'text-gray-400'
                                                        }`}>
                                                        {perm.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveRole}
                                className="bg-secondary py-5 rounded-2xl items-center shadow-lg shadow-secondary/20 mb-8"
                            >
                                <Text className="text-primary font-black text-lg">Save Role</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
