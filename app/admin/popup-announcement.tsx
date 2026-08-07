import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, FlatList, Modal, TouchableWithoutFeedback, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Check, Trash2, ToggleLeft, ToggleRight, X, AlertCircle, ImageIcon, Video, Clapperboard } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../lib/api';

export default function AdminPopupAnnouncement() {
    const router = useRouter();
    const [popups, setPopups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Modal state
    const [createVisible, setCreateVisible] = useState(false);

    // Form state
    const [form, setForm] = useState({
        title: '',
        body: '',
        imageData: '',
        imageUrl: '',
        videoUrl: '',
        is_active: false,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<{ uri: string; name: string; type: string } | null>(null);

    useEffect(() => {
        fetchPopups();
    }, []);

    const fetchPopups = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/popup-announcement');
            setPopups(res.data.data || res.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to retrieve popup configurations.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            title: '',
            body: '',
            imageData: '',
            imageUrl: '',
            videoUrl: '',
            is_active: false,
        });
        setImagePreview(null);
        setVideoPreview(null);
        setVideoFile(null);
    };

    const pickMedia = async (kind: 'image' | 'video') => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Required', 'Please grant media library permission.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: kind === 'image' ? ['images'] : ['videos'],
            quality: kind === 'image' ? 0.7 : undefined,
            base64: kind === 'image',
        });
        if (!result.canceled && result.assets[0]) {
            const asset = result.assets[0];
            if (kind === 'image') {
                const mime = asset.mimeType || 'image/jpeg';
                const dataUri = `data:${mime};base64,${asset.base64}`;
                setForm(f => ({ ...f, imageData: dataUri }));
                setImagePreview(asset.uri);
            } else {
                if (asset.fileSize && asset.fileSize > 15 * 1024 * 1024) {
                    Alert.alert('Large Video', 'The selected video is large and may take a while to upload.');
                }
                const mime = asset.mimeType || 'video/mp4';
                const name = asset.fileName || `popup-${Date.now()}.${(mime.split('/')[1] || 'mp4')}`;
                setVideoFile({ uri: asset.uri, name, type: mime });
                setVideoPreview(asset.uri);
            }
        }
    };

    const handleCreate = async () => {
        if (!form.title) {
            Alert.alert('Validation Error', 'Please enter a heading.');
            return;
        }

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('body', form.body || '');
        formData.append('is_active', form.is_active ? 'true' : 'false');

        if (videoFile) {
            formData.append('video_file', videoFile as any);
        } else if (form.videoUrl) {
            formData.append('video', form.videoUrl);
        }

        if (form.imageData) {
            formData.append('image', form.imageData);
        } else if (form.imageUrl) {
            formData.append('image', form.imageUrl);
        }

        setActionLoading(true);
        try {
            await api.post('/admin/popup-announcement', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            Alert.alert('Success', 'Popup announcement configured.');
            setCreateVisible(false);
            resetForm();
            fetchPopups();
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to save configuration.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleActive = async (id: number) => {
        try {
            await api.post(`/admin/popup-announcement/${id}/toggle`);
            fetchPopups();
        } catch (error) {
            Alert.alert('Error', 'Failed to toggle status.');
        }
    };

    const handleDelete = (id: number) => {
        Alert.alert('Confirm Delete', 'Delete this popup configuration permanently?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/admin/popup-announcement/${id}`);
                        fetchPopups();
                    } catch (error) {
                        Alert.alert('Error', 'Failed to delete configuration.');
                    }
                }
            }
        ]);
    };

    if (loading && !popups.length) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-4 pb-6 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center mr-4">
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-white text-xl font-bold">App-Load Popups</Text>
                    <Text className="text-gray-300 text-xs mt-0.5">Manage student portal alerts</Text>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={popups}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                renderItem={({ item }) => (
                    <View className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm mb-4">
                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center flex-1 mr-2">
                                <AlertCircle size={20} color={item.is_active ? '#10B981' : '#64748B'} />
                                <Text className="text-primary font-bold text-base ml-2 flex-1" numberOfLines={1}>{item.title}</Text>
                            </View>
                            <View className="flex-row items-center space-x-2">
                                <TouchableOpacity onPress={() => handleToggleActive(item.id)}>
                                    {item.is_active ? (
                                        <ToggleRight size={32} color="#10B981" />
                                    ) : (
                                        <ToggleLeft size={32} color="#64748B" />
                                    )}
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(item.id)} className="w-8 h-8 bg-red-50 rounded-xl items-center justify-center ml-1">
                                    <Trash2 size={16} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {!!item.body && (
                            <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>{item.body}</Text>
                        )}
                        <View className="flex-row items-center space-x-3 mt-1">
                            {!!item.image && (
                                <View className="flex-row items-center bg-blue-50 rounded-full px-3 py-1">
                                    <ImageIcon size={12} color="#2563EB" />
                                    <Text className="text-blue-600 text-xs font-bold ml-1">Image</Text>
                                </View>
                            )}
                            {!!item.video && (
                                <View className="flex-row items-center bg-purple-50 rounded-full px-3 py-1">
                                    <Video size={12} color="#7C3AED" />
                                    <Text className="text-purple-600 text-xs font-bold ml-1">Video</Text>
                                </View>
                            )}
                            <Text className="text-gray-400 text-xs">Created: {new Date(item.created_at).toLocaleDateString()}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="py-20 items-center">
                        <AlertCircle size={48} color="#9CA3AF" />
                        <Text className="text-gray-400 font-semibold mt-4">No popups configured yet.</Text>
                    </View>
                }
            />

            {/* Float Button */}
            <TouchableOpacity
                onPress={() => setCreateVisible(true)}
                className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full items-center justify-center shadow-lg shadow-primary/30"
            >
                <Plus size={24} color="white" strokeWidth={3} />
            </TouchableOpacity>

            {/* Create Modal */}
            <Modal visible={createVisible} animationType="slide" transparent>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                    className="flex-1"
                >
                    <View className="flex-1 bg-black/50 justify-end">
                        <TouchableWithoutFeedback onPress={() => setCreateVisible(false)}>
                            <View className="absolute inset-0" />
                        </TouchableWithoutFeedback>
                        <View className="bg-white rounded-t-[36px] max-h-[90%] p-6 relative z-10">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-primary">Configure Launch Popup</Text>
                                <TouchableOpacity onPress={() => setCreateVisible(false)} className="p-2 bg-gray-50 rounded-full w-10 h-10 items-center justify-center">
                                    <X size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4 mb-6">
                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Heading</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold"
                                        placeholder="e.g. Registration Deadline Update"
                                        value={form.title}
                                        onChangeText={(val) => setForm({ ...form, title: val })}
                                    />
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Text Body</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-primary font-medium"
                                        placeholder="Write the announcement body here..."
                                        multiline
                                        numberOfLines={4}
                                        style={{ minHeight: 100, textAlignVertical: 'top' }}
                                        value={form.body}
                                        onChangeText={(val) => setForm({ ...form, body: val })}
                                    />
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Image (optional)</Text>
                                    <View className="flex-row space-x-2">
                                        <TouchableOpacity
                                            onPress={() => pickMedia('image')}
                                            className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl h-14 flex-row items-center justify-center"
                                        >
                                            <ImageIcon size={18} color="#002147" />
                                            <Text className="text-primary font-semibold ml-2">
                                                {form.imageData ? 'Change Image' : 'Choose Image'}
                                            </Text>
                                        </TouchableOpacity>
                                        {(form.imageData || form.imageUrl) && (
                                            <TouchableOpacity
                                                onPress={() => { setForm(f => ({ ...f, imageData: '', imageUrl: '' })); setImagePreview(null); }}
                                                className="w-14 h-14 bg-red-50 rounded-2xl items-center justify-center"
                                            >
                                                <Trash2 size={18} color="#EF4444" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    {imagePreview ? (
                                        <Image source={{ uri: imagePreview }} className="w-full h-36 rounded-2xl mt-2" resizeMode="cover" />
                                    ) : null}
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold mt-2"
                                        placeholder="Or paste an image URL here"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        value={form.imageUrl}
                                        onChangeText={(val) => { setForm(f => ({ ...f, imageUrl: val })); setImagePreview(val || null); }}
                                    />
                                </View>

                                <View>
                                    <Text className="text-primary font-semibold mb-2 ml-1">Video (optional)</Text>
                                    <View className="flex-row space-x-2">
                                        <TouchableOpacity
                                            onPress={() => pickMedia('video')}
                                            className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl h-14 flex-row items-center justify-center"
                                        >
                                            <Clapperboard size={18} color="#002147" />
                                            <Text className="text-primary font-semibold ml-2">
                                                {videoFile ? 'Change Video' : 'Choose Video'}
                                            </Text>
                                        </TouchableOpacity>
                                        {(videoFile || form.videoUrl) && (
                                            <TouchableOpacity
                                                onPress={() => { setForm(f => ({ ...f, videoUrl: '' })); setVideoPreview(null); setVideoFile(null); }}
                                                className="w-14 h-14 bg-red-50 rounded-2xl items-center justify-center"
                                            >
                                                <Trash2 size={18} color="#EF4444" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary font-semibold mt-2"
                                        placeholder="Or paste a video URL here"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        value={form.videoUrl}
                                        onChangeText={(val) => { setForm(f => ({ ...f, videoUrl: val })); setVideoPreview(val || null); }}
                                    />
                                </View>

                                <View className="flex-row items-center justify-between py-2">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-primary font-bold">Set Active Immediately</Text>
                                        <Text className="text-gray-400 text-xs mt-0.5">
                                            Multiple active popups appear as auto-sliding slides for students.
                                        </Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setForm({ ...form, is_active: !form.is_active })}>
                                        {form.is_active ? (
                                            <ToggleRight size={36} color="#10B981" />
                                        ) : (
                                            <ToggleLeft size={36} color="#64748B" />
                                        )}
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    onPress={handleCreate}
                                    disabled={actionLoading}
                                    className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 mt-4"
                                >
                                    {actionLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Text className="text-white text-lg font-bold mr-2">Save Configuration</Text>
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
