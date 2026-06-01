import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
    Heart, MessageCircle, Share2, MoreHorizontal, Plus, X, Send, 
    Globe, Layers, Users, TrendingUp, ShieldAlert, UserPlus, UserMinus, Clock 
} from 'lucide-react-native';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface Post {
    id: number;
    content: string;
    visibility: 'school' | 'class' | 'association';
    user: {
        id: number;
        surname: string;
        first_name: string;
        passport_photograph?: string;
    };
    association?: {
        id: number;
        name: string;
    };
    likes_count: number;
    comments_count: number;
    created_at: string;
    type: 'social' | 'news';
    comments?: Array<{
        id: number;
        content: string;
        created_at: string;
        user: {
            surname: string;
            first_name: string;
        };
    }>;
}

export default function SocialHubScreen() {
    const router = useRouter();
    const { user } = useAuth();
    
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [posts, setPosts] = useState<Post[]>([]);
    const [activeTab, setActiveTab] = useState<'school' | 'class' | 'association' | 'trending'>('school');

    // Friends lists for contextual follow states
    const [friends, setFriends] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);

    // Action sheet and Moderation modals
    const [activeActionPost, setActiveActionPost] = useState<Post | null>(null);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    
    const [reportingPost, setReportingPost] = useState<Post | null>(null);
    const [reportReason, setReportReason] = useState('');
    const [submittingReport, setSubmittingReport] = useState(false);

    // Comments State
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);

    const fetchFriendsData = async () => {
        try {
            const [friendsRes, requestsRes] = await Promise.all([
                api.get('/friends'),
                api.get('/friends/requests/pending')
            ]);
            setFriends(friendsRes.data || []);
            setPendingRequests(requestsRes.data || []);
        } catch (error) {
            console.error('Error fetching friendships:', error);
        }
    };

    const fetchPosts = async (tabName = activeTab) => {
        try {
            setLoading(true);
            const response = await api.get('/posts', {
                params: { tab: tabName }
            });
            setPosts(response.data.data || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
            setPosts([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts(activeTab);
        fetchFriendsData();
    }, [activeTab]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([fetchPosts(activeTab), fetchFriendsData()]);
        setRefreshing(false);
    }, [activeTab]);

    const handleLike = async (id: number) => {
        try {
            const response = await api.post(`/posts/${id}/like`);
            const liked = response.data.liked;
            
            // Optimistically update posts state
            setPosts(prevPosts => prevPosts.map(p => {
                if (p.id === id) {
                    return {
                        ...p,
                        likes_count: liked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1)
                    };
                }
                return p;
            }));

            // Sync open comments modal if applicable
            if (selectedPost && selectedPost.id === id) {
                setSelectedPost(prev => prev ? { 
                    ...prev, 
                    likes_count: liked ? prev.likes_count + 1 : Math.max(0, prev.likes_count - 1)
                } : null);
            }
        } catch (error) {
            console.error('Like failed:', error);
        }
    };

    const handleCommentSubmit = async () => {
        if (!selectedPost || !commentContent.trim()) return;

        setSubmittingComment(true);
        try {
            const response = await api.post(`/posts/${selectedPost.id}/comment`, {
                content: commentContent
            });
            setCommentContent('');
            
            const newComment = response.data.comment;
            if (newComment) {
                const updatedComments = [...(selectedPost.comments || []), newComment];
                setSelectedPost({
                    ...selectedPost,
                    comments: updatedComments,
                    comments_count: selectedPost.comments_count + 1
                });
            }
            
            fetchPosts(); // Sync the background list feed
        } catch (error) {
            console.error('Comment submission error:', error);
            Alert.alert('Publish Error', 'Failed to publish your comment. Please try again.');
        } finally {
            setSubmittingComment(false);
        }
    };

    // Friend Requests
    const handleAddFriend = async (authorId: number) => {
        try {
            await api.post('/friends/request', { receiver_id: authorId });
            Alert.alert('Request Sent', 'Friend request sent successfully.');
            fetchFriendsData();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to send request.';
            Alert.alert('Error', msg);
        }
    };

    const handleUnfriend = async (authorId: number) => {
        Alert.alert(
            'Confirm Unfriend',
            'Are you sure you want to remove this classmate from your friends list?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/friends/${authorId}`);
                            fetchFriendsData();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to remove friend.');
                        }
                    }
                }
            ]
        );
    };

    // Post Deletions & Reports
    const handleDeletePost = async (postId: number) => {
        Alert.alert(
            'Delete Post',
            'Are you sure you want to permanently delete this post?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/posts/${postId}`);
                            setActionModalVisible(false);
                            fetchPosts();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete post.');
                        }
                    }
                }
            ]
        );
    };

    const handleReportSubmit = async () => {
        if (!reportingPost || !reportReason.trim()) return;

        setSubmittingReport(true);
        try {
            await api.post(`/posts/${reportingPost.id}/report`, {
                reason: reportReason
            });
            Alert.alert('Report Submitted', 'Thank you. Content has been queued for moderation.');
            setReportReason('');
            setReportingPost(null);
        } catch (error) {
            Alert.alert('Error', 'Failed to report post.');
        } finally {
            setSubmittingReport(false);
        }
    };

    const renderFriendshipButton = (author: any) => {
        if (!user || author.id === user.id) return null;

        const isFriend = friends.some(f => f.id === author.id);
        const hasPending = pendingRequests.some(r => r.sender_id === author.id);

        if (isFriend) {
            return (
                <TouchableOpacity 
                    onPress={() => handleUnfriend(author.id)}
                    className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200"
                >
                    <UserMinus size={12} color="#64748B" />
                    <Text className="text-[10px] font-bold text-gray-600 ml-1.5">Unfriend</Text>
                </TouchableOpacity>
            );
        }

        if (hasPending) {
            return (
                <View className="flex-row items-center bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                    <Clock size={12} color="#D97706" />
                    <Text className="text-[10px] font-bold text-amber-700 ml-1.5">Pending</Text>
                </View>
            );
        }

        return (
            <TouchableOpacity 
                onPress={() => handleAddFriend(author.id)}
                className="flex-row items-center bg-secondary px-3 py-1.5 rounded-lg"
            >
                <UserPlus size={12} color="#002147" />
                <Text className="text-[10px] font-bold text-primary ml-1.5">Add Friend</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100">
                <Text className="text-2xl font-black text-primary italic tracking-tight">KIU Lounge</Text>
                <TouchableOpacity
                    onPress={() => router.push('/social/create')}
                    className="bg-primary w-10 h-10 rounded-full items-center justify-center shadow-lg shadow-primary/20"
                >
                    <Plus size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Custom Tab Switcher */}
            <View className="flex-row px-4 py-3 bg-white border-b border-gray-100 justify-around">
                <TouchableOpacity 
                    onPress={() => setActiveTab('school')}
                    className={`px-3 py-2 rounded-xl flex-row items-center ${activeTab === 'school' ? 'bg-primary' : 'bg-transparent'}`}
                >
                    <Globe size={13} color={activeTab === 'school' ? 'white' : '#64748B'} />
                    <Text className={`text-xs font-bold ml-1.5 ${activeTab === 'school' ? 'text-white' : 'text-gray-500'}`}>Lounge</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => setActiveTab('class')}
                    className={`px-3 py-2 rounded-xl flex-row items-center ${activeTab === 'class' ? 'bg-primary' : 'bg-transparent'}`}
                >
                    <Layers size={13} color={activeTab === 'class' ? 'white' : '#64748B'} />
                    <Text className={`text-xs font-bold ml-1.5 ${activeTab === 'class' ? 'text-white' : 'text-gray-500'}`}>My Class</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => setActiveTab('association')}
                    className={`px-3 py-2 rounded-xl flex-row items-center ${activeTab === 'association' ? 'bg-primary' : 'bg-transparent'}`}
                >
                    <Users size={13} color={activeTab === 'association' ? 'white' : '#64748B'} />
                    <Text className={`text-xs font-bold ml-1.5 ${activeTab === 'association' ? 'text-white' : 'text-gray-500'}`}>Clubs</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => setActiveTab('trending')}
                    className={`px-3 py-2 rounded-xl flex-row items-center ${activeTab === 'trending' ? 'bg-primary' : 'bg-transparent'}`}
                >
                    <TrendingUp size={13} color={activeTab === 'trending' ? 'white' : '#64748B'} />
                    <Text className={`text-xs font-bold ml-1.5 ${activeTab === 'trending' ? 'text-white' : 'text-gray-500'}`}>Trending</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 bg-gray-50"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {/* Feed */}
                <View className="px-4 mt-4 pb-20">
                    {loading && !posts.length ? (
                        <ActivityIndicator color="#002147" className="mt-10" />
                    ) : posts.length === 0 ? (
                        <View className="items-center py-20 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm mt-4">
                            <Layers size={48} color="#94A3B8" strokeWidth={1.5} />
                            <Text className="text-primary font-bold mt-4 text-base">Lounge Feed Empty</Text>
                            <Text className="text-gray-400 text-xs text-center mt-2 px-6">
                                There are no moments shared here yet. Be the first to share an update with your classmates!
                            </Text>
                        </View>
                    ) : (
                        posts.map((post) => (
                            <View key={post.id} className="bg-white rounded-[32px] mb-5 shadow-sm border border-gray-100 overflow-hidden">
                                {/* Post Header */}
                                <View className="flex-row items-center justify-between p-5">
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <View className="w-11 h-11 bg-primary/5 rounded-2xl items-center justify-center mr-3.5 border border-primary/10">
                                            <Text className="font-black text-primary text-xs">
                                                {post.user.surname.charAt(0)}{post.user.first_name.charAt(0)}
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-center flex-wrap">
                                                <Text className="font-black text-primary text-sm mr-2">{post.user.surname} {post.user.first_name}</Text>
                                                {renderFriendshipButton(post.user)}
                                            </View>
                                            <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest mt-1">
                                                {new Date(post.created_at).toLocaleDateString()} • {post.association ? post.association.name : (post.type === 'news' ? 'News' : 'Moment')}
                                            </Text>
                                        </View>
                                    </View>
                                    
                                    <TouchableOpacity 
                                        onPress={() => {
                                            setActiveActionPost(post);
                                            setActionModalVisible(true);
                                        }}
                                        className="w-8 h-8 items-center justify-center"
                                    >
                                        <MoreHorizontal size={18} color="#94A3B8" />
                                    </TouchableOpacity>
                                </View>

                                {/* Post Content */}
                                <View className="px-6 pb-4">
                                    <Text className="text-gray-600 text-[14px] leading-6 font-medium">
                                        {post.content}
                                    </Text>
                                </View>

                                {/* Visibility and engagement metrics */}
                                <View className="flex-row items-center px-6 pb-2">
                                    <View className="bg-gray-100 px-2 py-1 rounded-md flex-row items-center">
                                        {post.visibility === 'class' ? (
                                            <Layers size={10} color="#64748B" />
                                        ) : post.visibility === 'association' ? (
                                            <Users size={10} color="#64748B" />
                                        ) : (
                                            <Globe size={10} color="#64748B" />
                                        )}
                                        <Text className="text-[9px] font-black text-gray-500 uppercase ml-1 tracking-wider">{post.visibility || 'school'}</Text>
                                    </View>
                                </View>

                                {/* Actions */}
                                <View className="flex-row items-center justify-between px-6 py-4 border-t border-gray-50/80">
                                    <View className="flex-row items-center">
                                        <TouchableOpacity
                                            onPress={() => handleLike(post.id)}
                                            className="flex-row items-center mr-5 bg-red-50 px-3 py-1.5 rounded-xl"
                                        >
                                            <Heart size={16} color="#EF4444" fill="#EF4444" opacity={0.2} />
                                            <Text className="ml-2 text-red-600 font-bold text-xs">{post.likes_count}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => {
                                                setSelectedPost(post);
                                                setCommentModalVisible(true);
                                            }}
                                            className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-xl"
                                        >
                                            <MessageCircle size={16} color="#3B82F6" />
                                            <Text className="ml-2 text-blue-600 font-bold text-xs">{post.comments_count}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TouchableOpacity className="w-9 h-9 bg-gray-50 rounded-xl items-center justify-center border border-gray-100">
                                        <Share2 size={16} color="#64748B" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Actions Context Sheet Modal */}
            <Modal
                visible={actionModalVisible}
                animationType="fade"
                transparent
                onRequestClose={() => setActionModalVisible(false)}
            >
                <View className="flex-1 bg-black/40 justify-end">
                    <View className="bg-white rounded-t-[32px] p-6 pb-8 border border-gray-100">
                        <View className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                        <Text className="text-primary font-black text-center text-xs uppercase tracking-widest mb-6">Post Options</Text>
                        
                        {activeActionPost && (
                            <View className="space-y-3">
                                {user && (activeActionPost.user.id === user.id || user.role === 'admin') ? (
                                    <TouchableOpacity 
                                        onPress={() => handleDeletePost(activeActionPost.id)}
                                        className="bg-red-50 flex-row items-center p-4 rounded-2xl border border-red-100"
                                    >
                                        <ShieldAlert size={18} color="#EF4444" />
                                        <Text className="text-red-700 font-bold text-sm ml-3">Delete Post Permanently</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity 
                                        onPress={() => {
                                            setActionModalVisible(false);
                                            setReportingPost(activeActionPost);
                                        }}
                                        className="bg-amber-50 flex-row items-center p-4 rounded-2xl border border-amber-100"
                                    >
                                        <ShieldAlert size={18} color="#D97706" />
                                        <Text className="text-amber-800 font-bold text-sm ml-3">Report Inappropriate Content</Text>
                                    </TouchableOpacity>
                                )}

                                <TouchableOpacity 
                                    onPress={() => setActionModalVisible(false)}
                                    className="bg-gray-100 items-center justify-center p-4 rounded-2xl border border-gray-200 mt-2"
                                >
                                    <Text className="text-gray-700 font-bold text-sm">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Custom Report Input Modal */}
            <Modal
                visible={reportingPost !== null}
                animationType="slide"
                transparent
                onRequestClose={() => setReportingPost(null)}
            >
                <View className="flex-1 bg-black/60 justify-center px-6">
                    <View className="bg-white rounded-[32px] p-6 shadow-2xl border border-gray-100">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-primary font-black text-lg">Report Moment</Text>
                            <TouchableOpacity onPress={() => setReportingPost(null)} className="p-1 bg-gray-100 rounded-full">
                                <X size={18} color="#002147" />
                            </TouchableOpacity>
                        </View>
                        <Text className="text-gray-400 text-xs mb-4">
                            Help us keep KIU Lounge safe. Explain why this post breaches standards (e.g. harassment, hate speech, spam):
                        </Text>
                        <TextInput
                            value={reportReason}
                            onChangeText={setReportReason}
                            placeholder="Enter report details here..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={4}
                            className="bg-gray-50 rounded-2xl px-4 py-3 text-primary text-sm font-medium border border-gray-100 min-h-[100px] mb-5 leading-5"
                        />
                        <View className="flex-row space-x-3">
                            <TouchableOpacity 
                                onPress={() => setReportingPost(null)}
                                className="flex-1 bg-gray-100 rounded-xl py-3.5 items-center justify-center border border-gray-200"
                            >
                                <Text className="text-gray-700 font-bold text-xs uppercase tracking-wider">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleReportSubmit}
                                disabled={submittingReport || !reportReason.trim()}
                                className={`flex-1 rounded-xl py-3.5 items-center justify-center ${submittingReport || !reportReason.trim() ? 'bg-gray-200' : 'bg-primary'}`}
                            >
                                {submittingReport ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-xs uppercase tracking-wider">Submit Report</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Premium Slide-up Comments Bottom Sheet Modal */}
            <Modal
                visible={commentModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setCommentModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[40px] h-[80%] shadow-2xl">
                        
                        {/* Modal Header */}
                        <View className="px-6 py-5 border-b border-gray-100 flex-row justify-between items-center">
                            <View>
                                <Text className="text-primary font-black text-xl">Lounge Replies</Text>
                                <Text className="text-gray-400 text-xs mt-0.5">{selectedPost?.comments_count || 0} comments</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => {
                                    setCommentModalVisible(false);
                                    setSelectedPost(null);
                                }}
                                className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
                            >
                                <X size={20} color="#002147" />
                            </TouchableOpacity>
                        </View>

                        {/* Scrollable Comments Feed */}
                        <ScrollView
                            className="flex-1 px-6 py-4 bg-gray-50/50"
                            showsVerticalScrollIndicator={false}
                        >
                            {/* Original Post Context */}
                            {selectedPost && (
                                <View className="bg-primary/5 p-5 rounded-3xl border border-primary/10 mb-6">
                                    <View className="flex-row items-center mb-3">
                                        <View className="w-8 h-8 bg-primary rounded-xl items-center justify-center mr-3">
                                            <Text className="text-white font-black text-[10px]">
                                                {selectedPost.user.surname.charAt(0)}{selectedPost.user.first_name.charAt(0)}
                                            </Text>
                                        </View>
                                        <Text className="font-black text-primary text-xs">{selectedPost.user.surname} {selectedPost.user.first_name}</Text>
                                    </View>
                                    <Text className="text-gray-700 text-sm leading-6 font-medium">
                                        {selectedPost.content}
                                    </Text>
                                </View>
                            )}

                            {/* Comments Listing */}
                            <Text className="text-primary/40 font-black text-[10px] uppercase tracking-widest mb-4">Replies</Text>
                            
                            {selectedPost?.comments && selectedPost.comments.length > 0 ? (
                                selectedPost.comments.map((comm) => (
                                    <View key={comm.id} className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm">
                                        <View className="flex-row items-center mb-2">
                                            <View className="w-7 h-7 bg-gray-100 rounded-lg items-center justify-center mr-2">
                                                <Text className="text-primary font-bold text-[9px]">
                                                    {comm.user?.surname?.charAt(0)}{comm.user?.first_name?.charAt(0)}
                                                </Text>
                                            </View>
                                            <Text className="font-bold text-primary text-xs">
                                                {comm.user?.surname} {comm.user?.first_name}
                                            </Text>
                                            <Text className="text-gray-400 text-[9px] ml-auto">
                                                {new Date(comm.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                        <Text className="text-gray-600 text-xs leading-5 font-medium ml-9">
                                            {comm.content}
                                        </Text>
                                    </View>
                                ))
                            ) : (
                                <View className="items-center py-10 opacity-30">
                                    <MessageCircle size={40} color="#002147" strokeWidth={1.5} />
                                    <Text className="text-primary font-black mt-2 text-center text-xs">
                                        No comments yet. Start the conversation!
                                    </Text>
                                </View>
                            )}
                            <View className="h-6" />
                        </ScrollView>

                        {/* Input Area */}
                        <View className="px-6 py-5 border-t border-gray-100 bg-white flex-row items-center">
                            <TextInput
                                value={commentContent}
                                onChangeText={setCommentContent}
                                placeholder="Type a response to this moment..."
                                placeholderTextColor="#94A3B8"
                                multiline
                                className="flex-1 bg-gray-50 rounded-2xl px-5 py-4 text-primary font-medium border border-gray-100 max-h-24 text-sm"
                            />
                            <TouchableOpacity
                                onPress={handleCommentSubmit}
                                disabled={submittingComment || !commentContent.trim()}
                                className={`ml-3 w-12 h-12 rounded-full items-center justify-center shadow-lg ${submittingComment || !commentContent.trim() ? 'bg-gray-200' : 'bg-primary shadow-primary/20'}`}
                            >
                                {submittingComment ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Send size={18} color="white" />
                                )}
                            </TouchableOpacity>
                        </View>

                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
