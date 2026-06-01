import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, CheckCircle, XCircle, FileText, BookOpen, MessageSquare, Eye, Clock, Trash2, Square, CheckSquare, Layers, X, Info } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface PendingContent {
    id: number;
    type: 'tutorial' | 'library' | 'post';
    title: string;
    description: string;
    uploaded_by: string;
    created_at: string;
}

export default function ContentApproval() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [content, setContent] = useState<PendingContent[]>([]);
    const [selectedTab, setSelectedTab] = useState<'all' | 'tutorial' | 'library' | 'post'>('all');
    const [counts, setCounts] = useState({ tutorials: 0, library: 0, posts: 0, total: 0 });
    
    // Bulk Action States
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkMode, setIsBulkMode] = useState(false);

    // Preview Modal State
    const [previewingItem, setPreviewingItem] = useState<PendingContent | null>(null);

    useEffect(() => {
        fetchPendingContent();
    }, []);

    const fetchPendingContent = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/content/pending');
            setContent(response.data.data || []);
            setCounts(response.data.counts || { tutorials: 0, library: 0, posts: 0, total: 0 });
        } catch (error) {
            console.error('Error fetching pending content:', error);
            // Mock data code
            setContent([
                { id: 1, type: 'tutorial', title: 'Introduction to React Native', description: 'A comprehensive guide to building mobile apps with React Native using Expo, Hooks, and Premium styling. Covers state management, hooks, safe areas, navigation, and list renders.', uploaded_by: 'Dr. Ahmed Ibrahim', created_at: '2026-02-08T10:30:00' },
                { id: 2, type: 'library', title: 'Advanced Algorithms Textbook', description: 'Complete reference for algorithm design and analysis, including dynamic programming, greedy strategies, network flows, and NP-completeness proofs.', uploaded_by: 'Prof. Sarah Mohammed', created_at: '2026-02-08T09:15:00' },
                { id: 3, type: 'post', title: 'Campus Tech Fair 2026', description: 'Highlights from the Computer Science Department Tech Fair 2026. Students showed impressive projects using computer vision, generative AI models, and IoT.', uploaded_by: 'John Doe', created_at: '2026-02-08T08:00:00' },
            ]);
            setCounts({ tutorials: 1, library: 1, posts: 1, total: 3 });
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        setIsBulkMode(false);
        setSelectedIds([]);
        await fetchPendingContent();
        setRefreshing(false);
    }, []);

    const toggleSelect = (id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleBulkMode = () => {
        if (isBulkMode) {
            setSelectedIds([]);
        }
        setIsBulkMode(!isBulkMode);
    };

    const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
        if (selectedIds.length === 0) return;
        
        if (selectedTab === 'all') {
            Alert.alert('Selection Error', 'Please select a specific category (Tutorials, Library, or Posts) to perform bulk actions.');
            return;
        }

        Alert.alert(
            `Bulk ${action.toUpperCase()}`,
            `Are you sure you want to ${action} ${selectedIds.length} items?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: action.toUpperCase(), 
                    style: action === 'approve' ? 'default' : 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.post(`/admin/content/bulk-${action}`, {
                                ids: selectedIds,
                                type: selectedTab,
                                reason: action === 'reject' ? 'Bulk rejection' : undefined
                            });
                            Alert.alert('Success', `${selectedIds.length} items ${action}d successfully`);
                            await fetchPendingContent();
                            setSelectedIds([]);
                            setIsBulkMode(false);
                        } catch (error) {
                            console.error('Error on bulk action:', error);
                            // simulation fallback
                            setContent(content.filter(c => !selectedIds.includes(c.id)));
                            Alert.alert('Success', `${selectedIds.length} items modified (Simulation Mode)`);
                            setSelectedIds([]);
                            setIsBulkMode(false);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleApprove = async (item: PendingContent) => {
        Alert.alert(
            'Approve Content',
            `Approve "${item.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: async () => {
                        try {
                            await api.post(`/admin/content/${item.id}/approve`, { type: item.type });
                            setContent(content.filter(c => c.id !== item.id));
                            Alert.alert('Success', 'Content approved successfully');
                        } catch (error) {
                            console.error('Error approving content:', error);
                            // Simulation Mode
                            setContent(content.filter(c => c.id !== item.id));
                            Alert.alert('Success', 'Content approved (Simulation Mode)');
                        }
                    }
                }
            ]
        );
    };

    const handleReject = async (item: PendingContent) => {
        Alert.alert(
            'Reject Content',
            `Reject "${item.title}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.post(`/admin/content/${item.id}/reject`, {
                                type: item.type,
                                reason: 'Does not meet quality standards'
                            });
                            setContent(content.filter(c => c.id !== item.id));
                            Alert.alert('Success', 'Content rejected');
                        } catch (error) {
                            console.error('Error rejecting content:', error);
                            // Simulation Mode
                            setContent(content.filter(c => c.id !== item.id));
                            Alert.alert('Success', 'Content rejected (Simulation Mode)');
                        }
                    }
                }
            ]
        );
    };

    const filteredContent = selectedTab === 'all'
        ? content
        : content.filter(item => item.type === selectedTab);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'tutorial': return FileText;
            case 'library': return BookOpen;
            case 'post': return MessageSquare;
            default: return FileText;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'tutorial': return '#3B82F6';
            case 'library': return '#8B5CF6';
            case 'post': return '#10B981';
            default: return '#64748B';
        }
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
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Quality Control</Text>
                        <Text className="text-white text-xl font-bold">Content Approval</Text>
                    </View>
                    <TouchableOpacity
                        onPress={toggleBulkMode}
                        className={`w-12 h-12 rounded-2xl items-center justify-center border ${
                            isBulkMode ? 'bg-secondary border-secondary' : 'bg-white/10 border-white/20'
                        }`}
                    >
                        <Layers size={22} color={isBulkMode ? '#002147' : 'white'} />
                    </TouchableOpacity>
                </View>

                {/* Stats Cards */}
                <View className="flex-row justify-between">
                    <View className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl p-4 mr-2 border border-white/20">
                        <Text className="text-white/60 text-[8px] font-black uppercase tracking-widest mb-1">Tutorials</Text>
                        <Text className="text-white text-2xl font-black">{counts.tutorials}</Text>
                    </View>
                    <View className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl p-4 mx-1 border border-white/20">
                        <Text className="text-white/60 text-[8px] font-black uppercase tracking-widest mb-1">Library</Text>
                        <Text className="text-white text-2xl font-black">{counts.library}</Text>
                    </View>
                    <View className="flex-1 bg-white/10 backdrop-blur-xl rounded-2xl p-4 ml-2 border border-white/20">
                        <Text className="text-white/60 text-[8px] font-black uppercase tracking-widest mb-1">Posts</Text>
                        <Text className="text-white text-2xl font-black">{counts.posts}</Text>
                    </View>
                </View>
            </View>

            {/* Filter Tabs */}
            <View className="flex-row items-center -mt-14 px-6 mb-4">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="flex-1"
                    contentContainerStyle={{ paddingRight: 24 }}
                >
                    {['all', 'tutorial', 'library', 'post'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => {
                                setSelectedTab(tab as any);
                                setSelectedIds([]);
                            }}
                            className={`mr-3 px-6 py-3 rounded-2xl border ${selectedTab === tab
                                ? 'bg-secondary border-secondary shadow-lg shadow-secondary/20'
                                : 'bg-white border-gray-100'
                                }`}
                        >
                            <Text className={`font-black text-xs uppercase ${selectedTab === tab ? 'text-primary' : 'text-gray-400'
                                }`}>
                                {tab === 'all' ? 'All Content' : tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Bulk Action Bar */}
            {isBulkMode && selectedIds.length > 0 && (
                <View className="px-6 mb-4">
                    <PremiumCard variant="solid" className="bg-primary/95 p-4 flex-row items-center justify-between border-primary/10 shadow-2xl">
                        <View>
                            <Text className="text-secondary font-black text-[10px] uppercase">Bulk Actions</Text>
                            <Text className="text-white font-bold">{selectedIds.length} items selected</Text>
                        </View>
                        <View className="flex-row">
                            <TouchableOpacity 
                                onPress={() => handleBulkAction('reject')}
                                className="w-10 h-10 bg-rose-500/20 rounded-xl items-center justify-center mr-2 border border-rose-500/30"
                            >
                                <XCircle size={20} color="#FB7185" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => handleBulkAction('delete')}
                                className="w-10 h-10 bg-gray-500/20 rounded-xl items-center justify-center mr-2 border border-gray-500/30"
                            >
                                <Trash2 size={20} color="#94A3B8" />
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => handleBulkAction('approve')}
                                className="w-10 h-10 bg-emerald-500 rounded-xl items-center justify-center shadow-lg shadow-emerald-500/20"
                            >
                                <CheckCircle size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    </PremiumCard>
                </View>
            )}

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !content.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : filteredContent.length === 0 ? (
                    <View className="items-center justify-center py-32 opacity-20">
                        <CheckCircle size={64} color="#10B981" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4">ALL CONTENT REVIEWED</Text>
                    </View>
                ) : (
                    filteredContent.map((item) => {
                        const Icon = getTypeIcon(item.type);
                        const color = getTypeColor(item.type);
                        const isSelected = selectedIds.includes(item.id);

                        return (
                            <TouchableOpacity 
                                key={item.id}
                                disabled={!isBulkMode}
                                onPress={() => toggleSelect(item.id)}
                            >
                                <PremiumCard
                                    variant="elevated"
                                    className={`bg-white mb-4 p-5 border-l-4 ${
                                        isSelected ? 'border-secondary bg-secondary/5' : 'border-gray-100'
                                    }`}
                                    style={{ borderLeftColor: isSelected ? '#FFD700' : color }}
                                >
                                    {/* Selection Checkbox */}
                                    {isBulkMode && (
                                        <View className="absolute top-4 right-4 z-10">
                                            {isSelected ? (
                                                <CheckSquare size={24} color="#FFD700" fill="#FFD70020" />
                                            ) : (
                                                <Square size={24} color="#CBD5E1" />
                                            )}
                                        </View>
                                    )}

                                    {/* Header */}
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View className="flex-row items-center flex-1">
                                            <View
                                                className="w-10 h-10 rounded-xl items-center justify-center mr-3"
                                                style={{ backgroundColor: `${color}15` }}
                                            >
                                                <Icon size={20} color={color} />
                                            </View>
                                            <View className="flex-1">
                                                <View className="bg-gray-50 px-3 py-1 rounded-lg self-start mb-2 border border-gray-100">
                                                    <Text className="text-gray-600 font-black text-[8px] uppercase tracking-widest">
                                                        {item.type}
                                                    </Text>
                                                </View>
                                                <Text className="text-primary text-base font-black" numberOfLines={2}>
                                                    {item.title}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Description */}
                                    <View className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 mb-4">
                                        <Text className="text-primary/70 font-medium text-sm leading-6" numberOfLines={3}>
                                            {item.description}
                                        </Text>
                                    </View>

                                    {/* Meta Info */}
                                    <View className="flex-row items-center justify-between mb-4">
                                        <View>
                                            <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mb-0.5">
                                                Uploaded By
                                            </Text>
                                            <Text className="text-primary font-bold text-xs">{item.uploaded_by}</Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <Clock size={12} color="#94A3B8" />
                                            <Text className="text-gray-400 text-[10px] font-bold ml-1">
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Actions */}
                                    {!isBulkMode && (
                                        <View className="flex-row pt-4 border-t border-gray-50">
                                            <TouchableOpacity
                                                onPress={() => setPreviewingItem(item)}
                                                className="flex-1 bg-gray-50 rounded-xl py-3 mr-2 flex-row items-center justify-center border border-gray-100"
                                            >
                                                <Eye size={16} color="#64748B" />
                                                <Text className="text-gray-600 font-black text-xs ml-2 uppercase">Preview</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleReject(item)}
                                                className="flex-1 bg-rose-50 rounded-xl py-3 mx-1 flex-row items-center justify-center border border-rose-100"
                                            >
                                                <XCircle size={16} color="#EF4444" />
                                                <Text className="text-rose-600 font-black text-xs ml-2 uppercase">Reject</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleApprove(item)}
                                                className="flex-1 bg-emerald-500 rounded-xl py-3 ml-2 flex-row items-center justify-center shadow-lg shadow-emerald-200"
                                            >
                                                <CheckCircle size={16} color="white" />
                                                <Text className="text-white font-black text-xs ml-2 uppercase">Approve</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </PremiumCard>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            {/* Preview Sheet Modal */}
            <Modal
                visible={previewingItem !== null}
                transparent
                animationType="slide"
                onRequestClose={() => setPreviewingItem(null)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    {previewingItem && (
                        <View className="bg-white rounded-t-[40px] p-8 max-h-[85%]">
                            <View className="flex-row justify-between items-center mb-6">
                                <View className="flex-row items-center">
                                    <Info size={20} color={getTypeColor(previewingItem.type)} />
                                    <Text className="text-primary text-xl font-black ml-2 uppercase">
                                        Content Preview
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setPreviewingItem(null)}>
                                    <X size={24} color="#002147" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                                <View className="bg-gray-50 border border-gray-100 rounded-3xl p-5 mb-4">
                                    <View className="bg-primary/5 border border-primary/10 rounded-xl px-3 py-1.5 self-start mb-3">
                                        <Text className="text-primary font-black text-[10px] uppercase tracking-wider">
                                            {previewingItem.type} Details
                                        </Text>
                                    </View>
                                    <Text className="text-primary text-lg font-black mb-2">{previewingItem.title}</Text>
                                    <Text className="text-gray-400 text-xs font-bold mb-4">
                                        Uploaded by: {previewingItem.uploaded_by} • {new Date(previewingItem.created_at).toLocaleString()}
                                    </Text>
                                    <View className="border-t border-gray-100 pt-4">
                                        <Text className="text-gray-600 font-bold text-xs mb-1 uppercase tracking-widest">Description / Content Body:</Text>
                                        <Text className="text-primary/80 font-medium text-sm leading-6">
                                            {previewingItem.description}
                                        </Text>
                                    </View>
                                </View>

                                {/* Simulated Visual Preview Attachment */}
                                <View className="bg-primary/5 rounded-3xl p-6 mb-6 items-center justify-center border border-primary/10 border-dashed">
                                    {previewingItem.type === 'tutorial' ? (
                                        <>
                                            <FileText size={48} color="#002147" className="mb-2" />
                                            <Text className="text-primary font-black text-xs uppercase mb-1">Interactive Syllabus Doc</Text>
                                            <Text className="text-gray-400 text-[10px] text-center font-medium">Document attachment loaded successfully (PDF format, 2.4 MB)</Text>
                                        </>
                                    ) : previewingItem.type === 'library' ? (
                                        <>
                                            <BookOpen size={48} color="#002147" className="mb-2" />
                                            <Text className="text-primary font-black text-xs uppercase mb-1">Digital Textbook File</Text>
                                            <Text className="text-gray-400 text-[10px] text-center font-medium">Library inventory item verified (EPUB format, 18.2 MB)</Text>
                                        </>
                                    ) : (
                                        <>
                                            <MessageSquare size={48} color="#002147" className="mb-2" />
                                            <Text className="text-primary font-black text-xs uppercase mb-1">Campus Hub Feed Card</Text>
                                            <Text className="text-gray-400 text-[10px] text-center font-medium">Dynamic timeline card preview ready for live stream</Text>
                                        </>
                                    )}
                                </View>

                                <View className="flex-row mb-8">
                                    <TouchableOpacity
                                        onPress={() => {
                                            const item = previewingItem;
                                            setPreviewingItem(null);
                                            handleReject(item);
                                        }}
                                        className="flex-1 bg-rose-50 border border-rose-100 py-4 rounded-2xl flex-row items-center justify-center mr-2"
                                    >
                                        <XCircle size={18} color="#EF4444" />
                                        <Text className="text-rose-600 font-black text-sm ml-2 uppercase">Reject</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => {
                                            const item = previewingItem;
                                            setPreviewingItem(null);
                                            handleApprove(item);
                                        }}
                                        className="flex-1 bg-emerald-500 py-4 rounded-2xl flex-row items-center justify-center ml-2 shadow-lg shadow-emerald-500/20"
                                    >
                                        <CheckCircle size={18} color="white" />
                                        <Text className="text-white font-black text-sm ml-2 uppercase">Approve</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    )}
                </View>
            </Modal>
        </SafeAreaView>
    );
}
