import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, MapPin, Phone, Trash2, Send, CheckCircle2, User, AlertCircle, Calendar, MessageSquare } from 'lucide-react-native';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    passport_photograph: string | null;
    role: string;
  };
}

interface LostItem {
  id: number;
  user_id: number;
  title: string;
  description: string;
  image_url: string | null;
  full_image_url: string | null;
  location: string;
  founder: string | null;
  contact_details: string;
  type: 'lost' | 'found';
  status: 'open' | 'resolved';
  created_at: string;
  user: {
    id: number;
    name: string;
    passport_photograph: string | null;
    role: string;
  };
  comments: Comment[];
}

export default function LostFoundDetails() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  const [item, setItem] = useState<LostItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    try {
      const response = await api.get(`/lost-items/${id}`);
      setItem(response.data);
    } catch (error) {
      console.error('Error fetching lost item details:', error);
      Alert.alert('Error', 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      const response = await api.post(`/lost-items/${id}/comments`, {
        content: commentText.trim(),
      });
      // Append comment locally or refetch
      if (item) {
        const newComment = response.data.data;
        setItem({
          ...item,
          comments: [...item.comments, newComment],
        });
      }
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to send message.');
    } finally {
      setSendingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/lost-items/comments/${commentId}`);
            if (item) {
              setItem({
                ...item,
                comments: item.comments.filter((c) => c.id !== commentId),
              });
            }
          } catch (error) {
            console.error('Error deleting comment:', error);
            Alert.alert('Error', 'Failed to delete message.');
          }
        },
      },
    ]);
  };

  const handleToggleStatus = async () => {
    if (!item) return;
    const newStatus = item.status === 'open' ? 'resolved' : 'open';
    setActionLoading(true);
    try {
      const response = await api.patch(`/lost-items/${item.id}/status`, {
        status: newStatus,
      });
      setItem({
        ...item,
        status: newStatus,
      });
      Alert.alert('Success', `Item marked as ${newStatus}.`);
    } catch (error) {
      console.error('Error toggling status:', error);
      Alert.alert('Error', 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeletePost = () => {
    Alert.alert('Delete Post', 'Are you sure you want to delete this report permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setActionLoading(true);
          try {
            await api.delete(`/lost-items/${id}`);
            Alert.alert('Success', 'Report deleted successfully.', [
              { text: 'OK', onPress: () => router.push('/school/lost-found') },
            ]);
          } catch (error) {
            console.error('Error deleting report:', error);
            Alert.alert('Error', 'Failed to delete report.');
            setActionLoading(false);
          }
        },
      },
    ]);
  };

  const isOwner = item && user && item.user_id === user.id;
  const isAdmin = user && user.role === 'admin';
  const canManage = isOwner || isAdmin;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return '';
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#002147" />
      </View>
    );
  }

  if (!item) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center px-6">
        <AlertCircle size={48} color="#EF4444" />
        <Text className="text-primary font-bold text-lg mt-4">Report Not Found</Text>
        <TouchableOpacity
          onPress={() => router.push('/school/lost-found')}
          className="mt-6 bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold text-sm">Back to Feed</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View className="bg-primary px-6 pt-4 pb-6 rounded-b-[32px] shadow-md flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold" numberOfLines={1}>
            {item.title}
          </Text>
          {canManage ? (
            <TouchableOpacity onPress={handleDeletePost} className="w-10 h-10 bg-rose-500/20 rounded-full items-center justify-center border border-rose-500/20">
              <Trash2 size={18} color="#FB7185" />
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}
        </View>

        <ScrollView className="flex-1 px-6 mt-4" showsVerticalScrollIndicator={false}>
          {/* Main Info Card */}
          <View className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm mb-6">
            {/* Image section */}
            {item.full_image_url && (
              <View className="w-full h-56 rounded-2xl overflow-hidden border border-gray-100 mb-5">
                <Image source={{ uri: item.full_image_url }} className="w-full h-full" resizeMode="cover" />
              </View>
            )}

            {/* Title, Type Badge and Date */}
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-1 mr-2">
                <View className="flex-row items-center mb-1">
                  <View className={`px-2.5 py-0.5 rounded-md mr-2 ${
                    item.type === 'lost' ? 'bg-rose-50' : 'bg-emerald-50'
                  }`}>
                    <Text className={`text-[10px] font-black uppercase tracking-wider ${
                      item.type === 'lost' ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {item.type}
                    </Text>
                  </View>
                  <View className={`px-2.5 py-0.5 rounded-md ${
                    item.status === 'resolved' ? 'bg-gray-100' : 'bg-sky-50'
                  }`}>
                    <Text className={`text-[10px] font-black uppercase tracking-wider ${
                      item.status === 'resolved' ? 'text-gray-500' : 'text-sky-600'
                    }`}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text className="text-primary font-extrabold text-lg mt-1">{item.title}</Text>
              </View>
            </View>

            {/* Description */}
            <Text className="text-gray-600 text-sm leading-relaxed mb-6">
              {item.description}
            </Text>

            {/* Poster Details */}
            <View className="flex-row items-center p-3.5 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
              <View className="w-10 h-10 bg-primary rounded-full items-center justify-center overflow-hidden mr-3">
                {item.user?.passport_photograph ? (
                  <Image source={{ uri: item.user.passport_photograph }} className="w-10 h-10" />
                ) : (
                  <Text className="text-white font-bold">{item.user?.name?.charAt(0)}</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reported By</Text>
                <Text className="text-primary font-bold text-sm">{item.user?.name}</Text>
              </View>
            </View>

            {/* Item Meta Properties */}
            <View className="space-y-3.5">
              <View className="flex-row items-center border-b border-gray-50 pb-3">
                <MapPin size={18} color="#9CA3AF" />
                <View className="ml-3 flex-1">
                  <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Location</Text>
                  <Text className="text-primary font-semibold text-sm">{item.location}</Text>
                </View>
              </View>

              {item.founder && (
                <View className="flex-row items-center border-b border-gray-50 pb-3">
                  <User size={18} color="#9CA3AF" />
                  <View className="ml-3 flex-1">
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Founder / Holder</Text>
                    <Text className="text-primary font-semibold text-sm">{item.founder}</Text>
                  </View>
                </View>
              )}

              <View className="flex-row items-center border-b border-gray-50 pb-3">
                <Phone size={18} color="#9CA3AF" />
                <View className="ml-3 flex-1">
                  <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contact Detail / Handover</Text>
                  <Text className="text-primary font-semibold text-sm">{item.contact_details}</Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <Calendar size={18} color="#9CA3AF" />
                <View className="ml-3 flex-1">
                  <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Report Date</Text>
                  <Text className="text-primary font-semibold text-sm">{formatDate(item.created_at)}</Text>
                </View>
              </View>
            </View>

            {/* Poster Actions */}
            {canManage && (
              <TouchableOpacity
                onPress={handleToggleStatus}
                disabled={actionLoading}
                className={`mt-6 h-12 rounded-2xl flex-row items-center justify-center border ${
                  item.status === 'resolved'
                    ? 'border-gray-200 bg-white'
                    : 'bg-emerald-500 border-emerald-500 shadow-sm'
                }`}
              >
                {actionLoading ? (
                  <ActivityIndicator color={item.status === 'resolved' ? '#002147' : 'white'} />
                ) : (
                  <>
                    <CheckCircle2 size={16} color={item.status === 'resolved' ? '#6B7280' : 'white'} />
                    <Text className={`font-bold text-sm ml-2 ${
                      item.status === 'resolved' ? 'text-gray-500' : 'text-white'
                    }`}>
                      {item.status === 'resolved' ? 'Re-open Case' : 'Mark as Resolved'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Comment Thread (Discussion Section) */}
          <View className="mb-8">
            <View className="flex-row items-center mb-4">
              <MessageSquare size={20} color="#002147" />
              <Text className="text-primary font-bold text-lg ml-2">Discussion Room</Text>
              <View className="ml-2 bg-primary/10 px-2 py-0.5 rounded-full">
                <Text className="text-primary font-bold text-xs">{item.comments.length}</Text>
              </View>
            </View>

            {item.comments.length === 0 ? (
              <View className="items-center py-10 bg-white rounded-[28px] border border-gray-100 shadow-sm px-6">
                <Text className="text-gray-400 text-xs text-center font-medium">
                  No messages yet. Send a message to get in touch with the poster/finder!
                </Text>
              </View>
            ) : (
              <View className="space-y-4">
                {item.comments.map((comment) => {
                  const isCommentAuthor = user && comment.user.id === user.id;
                  const canDeleteComment = isCommentAuthor || isAdmin;
                  return (
                    <View
                      key={comment.id}
                      className={`p-4 rounded-3xl border border-gray-50 ${
                        isCommentAuthor ? 'bg-blue-50/40 ml-8' : 'bg-white mr-8 shadow-sm'
                      }`}
                    >
                      <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                          <View className="w-7 h-7 bg-primary/10 rounded-full items-center justify-center overflow-hidden mr-2">
                            {comment.user?.passport_photograph ? (
                              <Image source={{ uri: comment.user.passport_photograph }} className="w-7 h-7" />
                            ) : (
                              <Text className="text-primary font-bold text-xs">{comment.user?.name?.charAt(0)}</Text>
                            )}
                          </View>
                          <View>
                            <Text className="text-primary font-bold text-xs">{comment.user?.name}</Text>
                            <Text className="text-gray-400 text-[8px] font-semibold uppercase">{comment.user?.role}</Text>
                          </View>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-gray-400 text-[8px] mr-2">{formatDate(comment.created_at)}</Text>
                          {canDeleteComment && (
                            <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                              <Trash2 size={12} color="#EF4444" />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                      <Text className="text-gray-600 text-sm">{comment.content}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Input box */}
        <View 
          style={{ paddingBottom: Math.max(insets.bottom + 16, 36) }}
          className="bg-white border-t border-gray-100 px-4 pt-4 flex-row items-center"
        >
          <TextInput
            className="flex-1 bg-gray-50 text-primary border border-gray-100 rounded-2xl px-4 h-12 text-sm"
            placeholder="Type a message to owner/finder..."
            value={commentText}
            onChangeText={setCommentText}
            onSubmitEditing={handlePostComment}
            editable={!sendingComment}
          />
          <TouchableOpacity
            onPress={handlePostComment}
            disabled={sendingComment || !commentText.trim()}
            className={`w-12 h-12 rounded-2xl items-center justify-center ml-3 ${
              commentText.trim() ? 'bg-primary' : 'bg-gray-100'
            }`}
          >
            {sendingComment ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Send size={18} color={commentText.trim() ? 'white' : '#9CA3AF'} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
