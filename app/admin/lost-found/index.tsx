import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Search, Trash2, CheckCircle2, AlertCircle, Eye, ShieldAlert, Tag, User } from 'lucide-react-native';
import api from '../../../lib/api';

interface AdminLostItem {
  id: number;
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
    name: string;
    email: string;
  };
}

export default function AdminLostFoundManager() {
  const router = useRouter();
  const [items, setItems] = useState<AdminLostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await api.get('/admin/lost-items', { params });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching admin lost items:', error);
      Alert.alert('Error', 'Failed to retrieve reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const handleSearch = () => {
    fetchItems();
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Report', 'Are you sure you want to permanently delete this report as an administrator?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/lost-items/${id}`);
            setItems(items.filter((item) => item.id !== id));
            Alert.alert('Deleted', 'Report removed successfully.');
          } catch (error) {
            console.error('Failed to delete report:', error);
            Alert.alert('Error', 'Failed to delete report.');
          }
        },
      },
    ]);
  };

  const handleToggleStatus = async (item: AdminLostItem) => {
    const newStatus = item.status === 'open' ? 'resolved' : 'open';
    try {
      await api.patch(`/lost-items/${item.id}/status`, {
        status: newStatus,
      });
      setItems(
        items.map((i) => (i.id === item.id ? { ...i, status: newStatus } : i))
      );
    } catch (error) {
      console.error('Failed to change status:', error);
      Alert.alert('Error', 'Failed to change item status.');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return '';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-primary px-6 pt-6 pb-24 rounded-b-[40px] shadow-lg">
        <View className="flex-row items-center justify-between mb-6">
          <TouchableOpacity onPress={() => router.back()} className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Oversight Panel</Text>
            <Text className="text-white text-xl font-bold">Lost & Found</Text>
          </View>
          <View className="w-12" />
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white/10 px-4 h-12 rounded-2xl border border-white/10">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-white ml-2 h-full text-sm"
            placeholder="Search items, descriptions, or locations..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Body Content */}
      <ScrollView
        className="flex-1 -mt-16 px-6"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#002147" className="mt-24" />
        ) : items.length === 0 ? (
          <View className="items-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm px-6">
            <ShieldAlert size={48} color="#9CA3AF" />
            <Text className="text-primary font-bold text-lg mt-4">No Reports Registered</Text>
            <Text className="text-gray-400 text-center text-xs mt-2">
              There are currently no lost or found reports matching your search.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <View
              key={item.id}
              className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm mb-4"
            >
              {/* Item overview */}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-row items-center">
                  <View className={`px-2 py-0.5 rounded-md ${
                    item.type === 'lost' ? 'bg-rose-50' : 'bg-emerald-50'
                  }`}>
                    <Text className={`text-[9px] font-black uppercase ${
                      item.type === 'lost' ? 'text-rose-600' : 'text-emerald-600'
                    }`}>
                      {item.type}
                    </Text>
                  </View>
                  <View className={`px-2 py-0.5 rounded-md ml-2 ${
                    item.status === 'resolved' ? 'bg-gray-100' : 'bg-sky-50'
                  }`}>
                    <Text className={`text-[9px] font-black uppercase ${
                      item.status === 'resolved' ? 'text-gray-500' : 'text-sky-600'
                    }`}>
                      {item.status}
                    </Text>
                  </View>
                </View>
                <Text className="text-gray-400 text-[10px]">{formatDate(item.created_at)}</Text>
              </View>

              <Text className="text-primary font-bold text-base mb-1">{item.title}</Text>
              <Text className="text-gray-500 text-xs mb-3" numberOfLines={2}>{item.description}</Text>

              {/* Poster info */}
              <View className="flex-row items-center border-t border-b border-gray-50 py-3 mb-4">
                <User size={16} color="#9CA3AF" />
                <View className="ml-2.5 flex-1">
                  <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reporter</Text>
                  <Text className="text-primary font-semibold text-xs">{item.user?.name} ({item.user?.email})</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row justify-between items-center space-x-2">
                <TouchableOpacity
                  onPress={() => router.push(`/school/lost-found/${item.id}`)}
                  className="flex-1 bg-gray-50 h-10 rounded-xl flex-row items-center justify-center border border-gray-100"
                >
                  <Eye size={14} color="#002147" />
                  <Text className="text-primary text-xs font-bold ml-1.5">View Post</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleToggleStatus(item)}
                  className={`flex-1 h-10 rounded-xl flex-row items-center justify-center border ${
                    item.status === 'resolved'
                      ? 'border-gray-200 bg-white'
                      : 'bg-emerald-50 border-emerald-100'
                  }`}
                >
                  <CheckCircle2 size={14} color={item.status === 'resolved' ? '#6B7280' : '#10B981'} />
                  <Text className={`text-xs font-bold ml-1.5 ${
                    item.status === 'resolved' ? 'text-gray-500' : 'text-emerald-700'
                  }`}>
                    {item.status === 'resolved' ? 'Re-open' : 'Resolve'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  className="w-10 h-10 bg-rose-50 rounded-xl items-center justify-center border border-rose-100"
                >
                  <Trash2 size={14} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
