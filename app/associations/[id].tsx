import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Dimensions, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Users, ShieldCheck, FileText, ChevronRight, ArrowLeft, MoreVertical, UserCheck, Lock, Send, MessageSquare, Heart, Sparkles, BookOpen, X, Globe } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

const { width } = Dimensions.get('window');

interface AssociationDetail {
    id: number;
    name: string;
    acronym: string;
    description: string;
    category: string;
    vision?: string;
    mission?: string;
    logo_url: string;
    members_count: number;
    is_member: boolean;
    membership_status?: string | null;
    member_role?: string | null;
    members?: Array<{
        id: number;
        role: string;
        status: string;
        user: {
            first_name: string;
            surname: string;
        };
    }>;
    documents?: Array<{
        id: number;
        title: string;
        file_path: string;
        file_type: string;
    }>;
}

export default function AssociationDetailPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [requesting, setRequesting] = useState(false);
    const [association, setAssociation] = useState<AssociationDetail | null>(null);

    // Tab states
    const [activeTab, setActiveTab] = useState<'Overview' | 'Feed'>('Overview');
    
    // Feed states
    const [posts, setPosts] = useState<any[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [posting, setPosting] = useState(false);

    // Comments drawer states
    const [commentsModalVisible, setCommentsModalVisible] = useState(false);
    const [activePostId, setActivePostId] = useState<number | null>(null);
    const [commentText, setCommentText] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        fetchAssociationDetail();
    }, [id]);

    const fetchAssociationDetail = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/associations/${id}`);
            const data = response.data.data;
            
            const formattedAssociation: AssociationDetail = {
                ...data,
                vision: data.vision || 'To lead and empower our members through excellence, professionalism, and community service.',
                mission: data.mission || 'Fostering growth by providing vital learning resources, technical networking, and strategic career workshops.',
            };

            setAssociation(formattedAssociation);
        } catch (error) {
            console.error('Error fetching association:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssociationPosts = async () => {
        try {
            setPostsLoading(true);
            const response = await api.get('/student/posts', {
                params: { association_id: id }
            });
            const postsData = response.data.data || response.data || [];
            setPosts(postsData);
        } catch (error) {
            console.error('Error fetching association posts:', error);
        } finally {
            setPostsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'Feed' && association) {
            const hasAccess = association.is_member || association.member_role === 'president' || association.membership_status === 'approved';
            if (hasAccess) {
                fetchAssociationPosts();
            }
        }
    }, [activeTab]);

    const handleJoin = async () => {
        setRequesting(true);
        try {
            const response = await api.post(`/student/associations/${id}/join`);
            Alert.alert('Request Submitted', response.data.message || 'Your membership request has been submitted and is awaiting executive approval.');
            fetchAssociationDetail();
        } catch (error: any) {
            console.error('Join error:', error);
            Alert.alert('Join Failed', error.response?.data?.message || 'Could not submit request.');
        } finally {
            setRequesting(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) {
            Alert.alert('Validation Error', 'Please type something before publishing.');
            return;
        }

        try {
            setPosting(true);
            await api.post('/posts', {
                content: newPostContent.trim(),
                association_id: Number(id),
                type: 'social',
                visibility: 'association'
            });

            Alert.alert('Success', 'Broadcast published successfully to feed!');
            setNewPostContent('');
            fetchAssociationPosts();
        } catch (error: any) {
            console.error('Post creation error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Could not publish broadcast. Please try again.');
        } finally {
            setPosting(false);
        }
    };

    const handleLikePost = async (postId: number) => {
        try {
            const response = await api.post(`/posts/${postId}/like`);
            const isLiked = response.data.liked;
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    return {
                        ...p,
                        likes_count: isLiked ? (p.likes_count + 1) : Math.max(0, p.likes_count - 1),
                        liked_by_user: isLiked
                    };
                }
                return p;
            }));
        } catch (error) {
            console.error('Like error:', error);
        }
    };

    const openCommentsDrawer = (postId: number) => {
        setActivePostId(postId);
        setCommentsModalVisible(true);
    };

    const handleSendComment = async () => {
        if (!commentText.trim() || !activePostId) return;

        try {
            setSubmittingComment(true);
            const response = await api.post(`/posts/${activePostId}/comment`, {
                content: commentText.trim()
            });

            const newComment = response.data.comment;

            // Insert locally instantly for great UX
            setPosts(prev => prev.map(p => {
                if (p.id === activePostId) {
                    return {
                        ...p,
                        comments_count: (p.comments_count || 0) + 1,
                        comments: [...(p.comments || []), newComment]
                    };
                }
                return p;
            }));

            setCommentText('');
        } catch (error: any) {
            console.error('Comment error:', error);
            Alert.alert('Error', 'Could not post comment.');
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) return (
        <View className="flex-1 bg-white items-center justify-center">
            <ActivityIndicator size="large" color="#002147" />
        </View>
    );

    if (!association) return null;

    const isMemberOrExec = association.is_member || association.member_role === 'president' || association.membership_status === 'approved';
    const activePost = posts.find(p => p.id === activePostId);

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Branding Header Section */}
                <View className="bg-primary pt-12 pb-24 px-6 rounded-b-[40px] relative">
                    <SafeAreaView className="flex-row justify-between mb-8">
                        <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-2xl border border-white/20 items-center justify-center">
                            <ArrowLeft size={24} color="white" />
                        </TouchableOpacity>

                        {association.member_role === 'president' ? (
                            <TouchableOpacity 
                                onPress={() => router.push(`/associations/manage/${id}`)}
                                className="bg-secondary px-4 py-2.5 rounded-2xl flex-row items-center border border-white/10 shadow-md"
                            >
                                <ShieldCheck size={16} color="#002147" />
                                <Text className="text-primary font-black text-[10px] ml-1.5 uppercase">Executive Panel</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl border border-white/20 items-center justify-center">
                                <MoreVertical size={24} color="white" />
                            </TouchableOpacity>
                        )}
                    </SafeAreaView>

                    <View className="flex-row items-center mb-6">
                        <PremiumCard variant="elevated" className="w-24 h-24 p-0 rounded-[32px] overflow-hidden bg-white border-0 shadow-lg items-center justify-center">
                            <Image 
                                source={{ uri: association.logo_url || `https://ui-avatars.com/api/?name=${association.acronym}&background=002147&color=fff` }} 
                                className="w-16 h-16" 
                                resizeMode="contain" 
                            />
                        </PremiumCard>
                        <View className="ml-6 flex-1">
                            <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">{association.category} Division</Text>
                            <Text className="text-white text-3xl font-black">{association.acronym}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center pt-2">
                        <View className="bg-white/10 px-4 py-2 rounded-xl flex-row items-center mr-3 border border-white/5">
                            <Users size={14} color="#FFD700" />
                            <Text className="text-white font-bold text-xs ml-2">{association.members_count}</Text>
                        </View>
                        {isMemberOrExec && (
                            <View className="bg-emerald-500/20 px-4 py-2 rounded-xl flex-row items-center border border-emerald-500/20">
                                <ShieldCheck size={14} color="#10B981" />
                                <Text className="text-emerald-500 font-bold text-xs ml-2 uppercase">
                                    {association.member_role === 'president' ? 'PRESIDENT' : 'MEMBER'}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Sub-Header Tabs (Overview / Feed) */}
                <View className="px-6 -mt-8 mb-6 z-10">
                    <View className="bg-white p-1 rounded-2xl flex-row shadow-xl shadow-primary/10">
                        {['Overview', 'Feed'].map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab as any)}
                                className={`flex-1 flex-row items-center justify-center py-3.5 rounded-xl ${activeTab === tab ? 'bg-primary' : ''}`}
                            >
                                <Text className={`text-[10px] font-black uppercase ${activeTab === tab ? 'text-secondary' : 'text-primary/40'}`}>
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Main Content Section */}
                <View className="px-6">
                    {activeTab === 'Overview' ? (
                        <>
                            <PremiumCard variant="elevated" className="mb-10 p-8 pt-10">
                                <Text className="text-gray-500 leading-7 text-base mb-6">{association.description}</Text>

                                <View className="space-y-6">
                                    <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                                        <Text className="text-primary font-black text-xs uppercase mb-2">Our Vision</Text>
                                        <Text className="text-gray-500 text-sm leading-6">{association.vision}</Text>
                                    </View>
                                    <View className="bg-secondary/5 p-6 rounded-[32px] border border-secondary/10 mt-4">
                                        <Text className="text-primary font-black text-xs uppercase mb-2 text-secondary">Strategic Mission</Text>
                                        <Text className="text-primary/70 text-sm leading-6">{association.mission}</Text>
                                    </View>
                                </View>
                            </PremiumCard>

                            {/* Real Governance Directory */}
                            <View className="mb-10">
                                <View className="flex-row items-center justify-between mb-4">
                                    <Text className="text-primary font-black text-xl">Governance Board</Text>
                                    <Text className="text-gray-300 font-black text-[10px] uppercase tracking-widest">REAL-TIME ROSTER</Text>
                                </View>
                                
                                {association.members && association.members.filter((m: any) => m.role !== 'member' && m.status === 'approved').length > 0 ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                                        {association.members
                                            .filter((m: any) => m.role !== 'member' && m.status === 'approved')
                                            .map((exec, idx) => {
                                                const execName = `${exec.user?.first_name || ''} ${exec.user?.surname || ''}`;
                                                return (
                                                    <View key={idx} className="mr-4 w-[180px]">
                                                        <PremiumCard variant="solid" className="bg-white border-gray-50 p-4 items-center">
                                                            <Image 
                                                                source={{ uri: `https://ui-avatars.com/api/?name=${exec.user?.first_name}+${exec.user?.surname}&background=002147&color=fff` }} 
                                                                className="w-20 h-20 rounded-[24px] bg-gray-100 mb-4 border border-gray-100" 
                                                            />
                                                            <Text className="text-primary font-black text-center text-sm mb-1" numberOfLines={1}>{execName}</Text>
                                                            <StatusBadge status="other" />
                                                            <Text className="text-gray-400 text-[8px] font-black uppercase mt-1.5 tracking-tighter">{exec.role}</Text>
                                                        </PremiumCard>
                                                    </View>
                                                );
                                            })}
                                    </ScrollView>
                                ) : (
                                    <View className="bg-gray-50 border border-gray-100 rounded-[24px] p-6 items-center">
                                        <Users size={24} color="#CBD5E1" />
                                        <Text className="text-gray-400 text-[9px] font-black mt-2 uppercase tracking-wide">Governance Board Assembly in Progress</Text>
                                    </View>
                                )}
                            </View>

                            {/* Live Resources Section */}
                            <View className="mb-10">
                                <Text className="text-primary font-black text-xl mb-4">Official Archives</Text>
                                
                                {association.documents && association.documents.length > 0 ? (
                                    association.documents.map(doc => (
                                        <TouchableOpacity 
                                            key={doc.id} 
                                            onPress={() => {
                                                Alert.alert('Archive Document', `Title: ${doc.title}\nDo you want to download or view this official document?`, [
                                                    { text: 'Cancel', style: 'cancel' },
                                                    { text: 'Open in Browser', onPress: () => {
                                                        const url = doc.file_path;
                                                        Alert.alert('Link Redirect', `Opening ${url}`);
                                                    }}
                                                ]);
                                            }}
                                            className="flex-row items-center bg-gray-50/50 border border-gray-100 p-5 rounded-[24px] mb-3"
                                        >
                                            <View className="w-10 h-10 bg-white rounded-2xl items-center justify-center mr-4 border border-gray-50 shadow-sm">
                                                <FileText size={18} color="#94A3B8" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-primary font-black text-sm">{doc.title}</Text>
                                                <Text className="text-gray-400 text-[10px] uppercase font-bold">{doc.file_type || 'PDF'}</Text>
                                            </View>
                                            <ChevronRight size={16} color="#CBD5E1" />
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View className="bg-gray-50 border border-gray-100 rounded-[24px] p-6 items-center">
                                        <FileText size={24} color="#CBD5E1" />
                                        <Text className="text-gray-400 text-[9px] font-black mt-2 uppercase tracking-wide">No official archives cataloged yet</Text>
                                    </View>
                                )}
                            </View>
                        </>
                    ) : (
                        /* FEED TAB CONTENT */
                        <View className="space-y-6">
                            {!isMemberOrExec ? (
                                /* LOCKED STATE */
                                <View className="items-center justify-center py-20 px-8 border border-gray-100 rounded-[32px] bg-gray-50 mt-4">
                                    <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-5 border border-red-100">
                                        <Lock size={28} color="#EF4444" />
                                    </View>
                                    <Text className="text-primary font-black text-lg text-center mb-2">Community Feed Locked</Text>
                                    <Text className="text-gray-500 text-sm text-center leading-6">
                                        You must be an approved member of {association.acronym} to participate in discussions, read announcements, and view community posts.
                                    </Text>
                                </View>
                            ) : (
                                /* UNLOCKED STATE */
                                <View className="space-y-6">
                                    {/* President Update Composer */}
                                    {association.member_role === 'president' && (
                                        <PremiumCard variant="elevated" className="bg-white p-5 rounded-[28px] mb-6">
                                            <View className="flex-row items-center mb-3">
                                                <Sparkles size={16} color="#FFD700" className="mr-2" />
                                                <Text className="text-primary font-black text-xs uppercase tracking-wide">Publish Executive Broadcast</Text>
                                            </View>
                                            <TextInput
                                                value={newPostContent}
                                                onChangeText={setNewPostContent}
                                                multiline
                                                placeholder={`What is happening in ${association.acronym} today?`}
                                                placeholderTextColor="#94A3B8"
                                                className="bg-gray-50 border border-gray-200 text-primary font-semibold text-sm px-4 py-3.5 rounded-2xl focus:border-primary min-h-[80px] text-left mb-4"
                                                textAlignVertical="top"
                                            />
                                            <TouchableOpacity
                                                onPress={handleCreatePost}
                                                disabled={posting}
                                                className="bg-primary py-3 px-6 rounded-xl flex-row items-center justify-center ml-auto"
                                            >
                                                {posting ? (
                                                    <ActivityIndicator color="white" size="small" />
                                                ) : (
                                                    <>
                                                        <Send size={14} color="white" className="mr-2" />
                                                        <Text className="text-white font-black text-[10px] uppercase tracking-wider">Broadcast Post</Text>
                                                    </>
                                                )}
                                            </TouchableOpacity>
                                        </PremiumCard>
                                    )}

                                    {/* Posts Feed Queue */}
                                    {postsLoading ? (
                                        <ActivityIndicator size="large" color="#002147" className="my-10" />
                                    ) : posts.length > 0 ? (
                                        posts.map((post) => (
                                            <PremiumCard key={post.id} variant="solid" className="bg-white border-gray-100 p-5 rounded-[28px] mb-5">
                                                {/* Author Header */}
                                                <View className="flex-row items-center mb-4">
                                                    <Image 
                                                        source={{ uri: `https://ui-avatars.com/api/?name=${post.user?.first_name}+${post.user?.surname}&background=002147&color=fff` }} 
                                                        className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100" 
                                                    />
                                                    <View className="ml-3">
                                                        <Text className="text-primary font-black text-sm">{post.user?.first_name} {post.user?.surname}</Text>
                                                        <Text className="text-gray-400 font-bold text-[8px] uppercase tracking-widest">
                                                            {association.acronym} PRESIDENT • {new Date(post.created_at).toLocaleDateString()}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Post Content */}
                                                <Text className="text-primary/80 font-medium text-sm leading-6 mb-5">
                                                    {post.content}
                                                </Text>

                                                {/* Interactions */}
                                                <View className="flex-row items-center border-t border-gray-50 pt-3">
                                                    <TouchableOpacity 
                                                        onPress={() => handleLikePost(post.id)}
                                                        className="flex-row items-center bg-gray-50 px-3.5 py-1.5 rounded-xl mr-3"
                                                    >
                                                        <Heart size={14} color="#EF4444" fill={post.liked_by_user ? "#EF4444" : "#FEE2E2"} />
                                                        <Text className="text-gray-500 font-black text-[10px] ml-1.5 uppercase">{post.likes_count || 0}</Text>
                                                    </TouchableOpacity>

                                                    <TouchableOpacity 
                                                        onPress={() => openCommentsDrawer(post.id)}
                                                        className="flex-row items-center bg-gray-50 px-3.5 py-1.5 rounded-xl"
                                                    >
                                                        <MessageSquare size={14} color="#3B82F6" />
                                                        <Text className="text-gray-500 font-black text-[10px] ml-1.5 uppercase">{post.comments_count || 0}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </PremiumCard>
                                        ))
                                    ) : (
                                        <View className="items-center justify-center py-16 opacity-30">
                                            <BookOpen size={48} color="#002147" strokeWidth={1} />
                                            <Text className="text-primary font-black mt-4 uppercase text-[10px] tracking-wider">No updates broadcasted yet</Text>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Application Action Footer */}
            {(!association.is_member && association.member_role !== 'president') && (
                <View className="absolute bottom-0 w-full bg-white/95 border-t border-gray-100 px-6 py-8 backdrop-blur-md">
                    {association.membership_status === 'pending' ? (
                        <View className="h-16 bg-amber-50 border border-amber-200 rounded-[24px] items-center justify-center flex-row">
                            <ActivityIndicator color="#D97706" size="small" className="mr-2" />
                            <Text className="text-amber-700 font-black text-sm uppercase tracking-widest">Awaiting Executive Approval</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={handleJoin}
                            disabled={requesting}
                            className="h-16 bg-primary rounded-[24px] items-center justify-center flex-row shadow-xl shadow-primary/20"
                        >
                            {requesting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <UserCheck size={20} color="white" />
                                    <Text className="text-white font-black text-lg ml-3 tracking-widest">SUBMIT JOIN REQUEST</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            )}

            {/* Sliding Drawer Modal for Discussion/Comments */}
            <Modal
                visible={commentsModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setCommentsModalVisible(false)}
            >
                <KeyboardAvoidingView 
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
                    className="flex-1 bg-black/60 justify-end"
                >
                    <View className="bg-white rounded-t-[40px] h-[75%] p-6 border-t border-gray-100">
                        {/* Drawer Header */}
                        <View className="flex-row items-center justify-between pb-4 border-b border-gray-100 mb-4">
                            <View className="flex-row items-center">
                                <MessageSquare size={20} color="#002147" className="mr-2" />
                                <Text className="text-primary font-black text-lg">Discussion Thread</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => setCommentsModalVisible(false)}
                                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <X size={16} color="#64748B" />
                            </TouchableOpacity>
                        </View>

                        {/* Comments Queue */}
                        <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
                            {activePost && activePost.comments && activePost.comments.length > 0 ? (
                                activePost.comments.map((comment: any, index: number) => (
                                    <View key={index} className="flex-row items-start mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <Image 
                                            source={{ uri: `https://ui-avatars.com/api/?name=${comment.user?.first_name}+${comment.user?.surname}&background=002147&color=fff` }} 
                                            className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-100" 
                                        />
                                        <View className="ml-3 flex-1">
                                            <Text className="text-primary font-black text-xs">
                                                {comment.user?.first_name} {comment.user?.surname}
                                            </Text>
                                            <Text className="text-primary/75 text-xs font-semibold leading-5 mt-1">
                                                {comment.content}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View className="items-center justify-center py-16 opacity-35">
                                    <MessageSquare size={36} color="#CBD5E1" strokeWidth={1.5} />
                                    <Text className="text-primary font-bold text-xs mt-2 uppercase tracking-wide">Be the first to share your thoughts</Text>
                                </View>
                            )}
                        </ScrollView>

                        {/* Comment Form Input */}
                        <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl p-2 mb-4">
                            <TextInput
                                value={commentText}
                                onChangeText={setCommentText}
                                placeholder="Type your comment..."
                                placeholderTextColor="#94A3B8"
                                className="flex-1 text-primary text-sm px-3 font-semibold h-12"
                            />
                            <TouchableOpacity 
                                onPress={handleSendComment}
                                disabled={submittingComment || !commentText.trim()}
                                className="w-12 h-12 bg-primary rounded-xl items-center justify-center shadow-md shadow-primary/20"
                            >
                                {submittingComment ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Send size={18} color="white" />
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
