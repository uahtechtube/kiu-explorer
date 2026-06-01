import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Alert, Modal, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Video, FileText, Edit2, Trash2, Ban, CheckCircle, MoreVertical, X, ExternalLink } from 'lucide-react-native';
import api from '../../lib/api';

type TabType = 'videos' | 'documents';

interface ContentItem {
    id: number;
    title: string;
    description: string;
    course_code?: string;
    status?: string;
    is_approved?: boolean;
    source_type?: string;
    file_type?: string;
    thumbnail?: string;
    full_cover_url?: string;
    created_at: string;
}

export default function MyContentPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('videos');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [videos, setVideos] = useState<ContentItem[]>([]);
    const [documents, setDocuments] = useState<ContentItem[]>([]);

    // Edit Modal State
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCourseCode, setEditCourseCode] = useState('');
    const [saving, setSaving] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const [videosRes, docsRes] = await Promise.all([
                api.get('/tutorials?my_content=1'),
                api.get('/library?my_content=1')
            ]);
            setVideos(videosRes.data.data);
            setDocuments(docsRes.data.data || docsRes.data.results || []);
        } catch (error) {
            console.error('Error fetching content:', error);
            // Alert.alert('Error', 'Failed to load your content.');
        } finally {
            setLoading(false);
        }
    };

    const filteredVideos = videos.filter(v => 
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.course_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredDocuments = documents.filter(d => 
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.course_code?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchContent();
        setRefreshing(false);
    };

    const handleToggleStatus = async (item: ContentItem, type: TabType) => {
        try {
            const endpoint = type === 'videos' 
                ? `/lecturer/tutorials/${item.id}/ban` 
                : `/library/${item.id}/status`;
            
            const response = await api.patch(endpoint);
            
            Alert.alert('Success', response.data.message);
            fetchContent(); // Refresh list
        } catch (error) {
            console.error('Error toggling status:', error);
            Alert.alert('Error', 'Failed to update status.');
        }
    };

    const handleDelete = (item: ContentItem, type: TabType) => {
        Alert.alert(
            'Confirm Delete',
            `Are you sure you want to delete "${item.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Delete', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const endpoint = type === 'videos' 
                                ? `/lecturer/tutorials/${item.id}` 
                                : `/library/${item.id}`;
                            await api.delete(endpoint);
                            Alert.alert('Deleted', 'Content removed successfully.');
                            fetchContent();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete content.');
                        }
                    }
                }
            ]
        );
    };

    const openEditModal = (item: ContentItem) => {
        setEditingItem(item);
        setEditTitle(item.title);
        setEditDescription(item.description || '');
        setEditCourseCode(item.course_code || '');
        setEditModalVisible(true);
    };

    const handleUpdate = async () => {
        if (!editingItem) return;
        setSaving(true);
        try {
            const endpoint = activeTab === 'videos' 
                ? `/lecturer/tutorials/${editingItem.id}` 
                : `/library/${editingItem.id}`;
            
            await api.put(endpoint, {
                title: editTitle,
                description: editDescription,
                course_code: editCourseCode
            });

            Alert.alert('Success', 'Content updated successfully.');
            setEditModalVisible(false);
            fetchContent();
        } catch (error) {
            Alert.alert('Error', 'Failed to update content.');
        } finally {
            setSaving(false);
        }
    };

    const renderItem = (item: ContentItem, type: TabType) => {
        const isBanned = type === 'videos' ? item.status === 'banned' : !item.is_approved;
        
        return (
            <View key={item.id} className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-100">
                <View className="flex-row">
                    <View className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden mr-4">
                        {type === 'videos' && item.thumbnail ? (
                            <Image source={{ uri: item.thumbnail }} className="w-full h-full" />
                        ) : type === 'documents' && item.full_cover_url ? (
                            <Image source={{ uri: item.full_cover_url }} className="w-full h-full" />
                        ) : (
                            <View className="items-center justify-center flex-1">
                                {type === 'videos' ? <Video size={30} color="#9CA3AF" /> : <FileText size={30} color="#9CA3AF" />}
                            </View>
                        )}
                    </View>
                    
                    <View className="flex-1">
                        <View className="flex-row justify-between items-start">
                            <Text className="text-primary font-bold text-base flex-1 mr-2" numberOfLines={2}>
                                {item.title}
                            </Text>
                            <View className={`px-2 py-1 rounded-lg ${isBanned ? 'bg-red-50' : 'bg-green-50'}`}>
                                <Text className={`text-[10px] font-bold ${isBanned ? 'text-red-600' : 'text-green-600'}`}>
                                    {isBanned ? 'BANNED' : 'ACTIVE'}
                                </Text>
                            </View>
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">{item.course_code || 'General'}</Text>
                        <Text className="text-gray-400 text-[10px] mt-1">Uploaded: {new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>

                <View className="flex-row justify-end mt-4 pt-3 border-t border-gray-50 space-x-3">
                    <TouchableOpacity 
                        onPress={() => openEditModal(item)}
                        className="flex-row items-center bg-blue-50 px-3 py-2 rounded-xl"
                    >
                        <Edit2 size={14} color="#3B82F6" />
                        <Text className="text-blue-600 text-xs font-bold ml-1">Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => handleToggleStatus(item, type)}
                        className={`flex-row items-center px-3 py-2 rounded-xl ${isBanned ? 'bg-green-50' : 'bg-orange-50'}`}
                    >
                        {isBanned ? <CheckCircle size={14} color="#10B981" /> : <Ban size={14} color="#F59E0B" />}
                        <Text className={`text-xs font-bold ml-1 ${isBanned ? 'text-green-600' : 'text-orange-600'}`}>
                            {isBanned ? 'Activate' : 'Ban'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => handleDelete(item, type)}
                        className="flex-row items-center bg-red-50 px-3 py-2 rounded-xl"
                    >
                        <Trash2 size={14} color="#EF4444" />
                        <Text className="text-red-600 text-xs font-bold ml-1">Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-4">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-2xl font-bold">Manage My Content</Text>
                        <Text className="text-gray-300 text-sm">View and edit your uploads</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="bg-white/10 flex-row items-center px-4 h-12 rounded-2xl mb-4">
                    <Text className="mr-2">🔍</Text>
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search by title or course code..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 text-white text-sm"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <X size={16} color="#94A3B8" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Tab Selector */}
            <View className="flex-row px-6 mt-4 mb-4">
                <TouchableOpacity 
                    onPress={() => setActiveTab('videos')}
                    className={`flex-1 py-3 items-center rounded-2xl mr-2 ${activeTab === 'videos' ? 'bg-primary' : 'bg-white border border-gray-200'}`}
                >
                    <Text className={`font-bold ${activeTab === 'videos' ? 'text-white' : 'text-gray-50'}`}>Videos ({videos.length})</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setActiveTab('documents')}
                    className={`flex-1 py-3 items-center rounded-2xl ml-2 ${activeTab === 'documents' ? 'bg-primary' : 'bg-white border border-gray-200'}`}
                >
                    <Text className={`font-bold ${activeTab === 'documents' ? 'text-white' : 'text-gray-50'}`}>Documents ({documents.length})</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                className="flex-1 px-6"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : (
                    <>
                        {activeTab === 'videos' ? (
                            filteredVideos.length > 0 ? (
                                filteredVideos.map(item => renderItem(item, 'videos'))
                            ) : (
                                <View className="items-center justify-center mt-20">
                                    <Video size={64} color="#D1D5DB" />
                                    <Text className="text-gray-400 mt-4 text-lg">
                                        {searchQuery ? 'No matching videos found' : 'No videos uploaded yet'}
                                    </Text>
                                    {!searchQuery && (
                                        <TouchableOpacity 
                                            onPress={() => router.push('/lecturer/upload-tutorial')}
                                            className="mt-4 bg-primary px-6 py-3 rounded-2xl"
                                        >
                                            <Text className="text-white font-bold">Upload Now</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )
                        ) : (
                            filteredDocuments.length > 0 ? (
                                filteredDocuments.map(item => renderItem(item, 'documents'))
                            ) : (
                                <View className="items-center justify-center mt-20">
                                    <FileText size={64} color="#D1D5DB" />
                                    <Text className="text-gray-400 mt-4 text-lg">
                                        {searchQuery ? 'No matching documents found' : 'No documents uploaded yet'}
                                    </Text>
                                    {!searchQuery && (
                                        <TouchableOpacity 
                                            onPress={() => router.push('/lecturer/upload-tutorial')}
                                            className="mt-4 bg-primary px-6 py-3 rounded-2xl"
                                        >
                                            <Text className="text-white font-bold">Upload Now</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )
                        )}
                        <View className="h-10" />
                    </>
                )}
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-[40px] px-6 pt-8 pb-12">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-primary font-bold text-xl">Edit Content</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <X size={24} color="#000" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-500 text-xs uppercase mb-2">Course Code</Text>
                        <TextInput
                            value={editCourseCode}
                            onChangeText={setEditCourseCode}
                            className="bg-gray-50 p-4 rounded-2xl mb-4 text-gray-800 font-semibold"
                            placeholder="e.g. CSC 401"
                        />

                        <Text className="text-gray-500 text-xs uppercase mb-2">Title</Text>
                        <TextInput
                            value={editTitle}
                            onChangeText={setEditTitle}
                            className="bg-gray-50 p-4 rounded-2xl mb-4 text-gray-800 font-semibold"
                            placeholder="Title"
                        />

                        <Text className="text-gray-500 text-xs uppercase mb-2">Description</Text>
                        <TextInput
                            value={editDescription}
                            onChangeText={setEditDescription}
                            multiline
                            numberOfLines={3}
                            className="bg-gray-50 p-4 rounded-2xl mb-6 text-gray-800"
                            placeholder="Description"
                            textAlignVertical="top"
                        />

                        <TouchableOpacity 
                            onPress={handleUpdate}
                            disabled={saving}
                            className={`py-4 rounded-2xl items-center ${saving ? 'bg-gray-300' : 'bg-primary'}`}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
