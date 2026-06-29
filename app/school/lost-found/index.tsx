import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, TextInput, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Search, Plus, MapPin, Tag, MessageSquare, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react-native';
import api from '../../../lib/api';

interface LostItem {
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
    passport_photograph: string;
  };
}

export default function LostFoundFeed() {
  const router = useRouter();
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'lost' | 'found'>('all');

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (activeTab !== 'all') {
        params.type = activeTab;
      }
      if (searchQuery) {
        params.search = searchQuery;
      }
      const response = await api.get('/lost-items', { params });
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching lost items:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchItems();
    setRefreshing(false);
  };

  const handleSearch = () => {
    fetchItems();
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      const diffHours = Math.round(diffMs / 3600000);
      const diffDays = Math.round(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch (e) {
      return '';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-primary px-6 pt-4 pb-6 shadow-md rounded-b-[32px]">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
            <ChevronLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Lost & Found</Text>
          <View className="w-10" />
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-white/10 px-4 h-12 rounded-2xl">
          <Search size={18} color="#9CA3AF" />
          <TextInput
            className="flex-1 text-white ml-2 h-full"
            placeholder="Search laptop, keys, wallet..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row px-6 mt-6 space-x-2">
        {(['all', 'lost', 'found'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full border ${
              activeTab === tab
                ? 'bg-primary border-primary'
                : 'bg-white border-gray-100'
            }`}
          >
            <Text
              className={`font-semibold text-xs capitalize ${
                activeTab === tab ? 'text-white' : 'text-gray-400'
              }`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#002147" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6 mt-4"
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {items.length === 0 ? (
            <View className="items-center py-20 bg-white rounded-[32px] border border-gray-100 shadow-sm mt-4 px-6">
              <AlertCircle size={48} color="#9CA3AF" />
              <Text className="text-primary font-bold text-lg mt-4">No Items Found</Text>
              <Text className="text-gray-400 text-center text-xs mt-2">
                Be the first to report a lost or found item to help fellow students!
              </Text>
            </View>
          ) : (
            items.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/school/lost-found/${item.id}`)}
                className="bg-white p-4 rounded-[28px] border border-gray-100 shadow-sm mb-4 flex-row"
              >
                {/* Image / Icon container */}
                <View className="w-24 h-24 bg-gray-50 rounded-2xl items-center justify-center overflow-hidden border border-gray-100 mr-4">
                  {item.full_image_url ? (
                    <Image
                      source={{ uri: item.full_image_url }}
                      className="w-full h-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Tag size={28} color={item.type === 'lost' ? '#EF4444' : '#10B981'} />
                  )}
                </View>

                {/* Details */}
                <View className="flex-1 justify-between">
                  <View>
                    <View className="flex-row items-center justify-between mb-1">
                      <View className={`px-2 py-0.5 rounded-md ${
                        item.type === 'lost' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                      }`}>
                        <Text className={`text-[9px] font-bold uppercase ${
                          item.type === 'lost' ? 'text-rose-600' : 'text-emerald-600'
                        }`}>
                          {item.type}
                        </Text>
                      </View>
                      <Text className="text-gray-400 text-[10px]">{formatTime(item.created_at)}</Text>
                    </View>

                    <Text className="text-primary font-bold text-sm" numberOfLines={1}>
                      {item.title}
                    </Text>

                    <View className="flex-row items-center mt-1">
                      <MapPin size={10} color="#9CA3AF" />
                      <Text className="text-gray-400 text-[10px] ml-1" numberOfLines={1}>
                        {item.location}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between pt-2 border-t border-gray-50">
                    <View className="flex-row items-center">
                      <Text className="text-[10px] text-gray-500 font-semibold" numberOfLines={1}>
                        By {item.user?.name}
                      </Text>
                    </View>

                    <View className="flex-row items-center space-x-1">
                      {item.status === 'resolved' ? (
                        <View className="flex-row items-center bg-gray-50 px-2 py-0.5 rounded-full">
                          <CheckCircle2 size={10} color="#6B7280" />
                          <Text className="text-[9px] text-gray-500 font-bold ml-1 uppercase">Resolved</Text>
                        </View>
                      ) : (
                        <View className="flex-row items-center bg-sky-50 px-2 py-0.5 rounded-full">
                          <AlertCircle size={10} color="#0284C7" />
                          <Text className="text-[9px] text-sky-600 font-bold ml-1 uppercase">Open</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push('/school/lost-found/create')}
        className="absolute bottom-6 right-6 w-14 h-14 bg-secondary rounded-full items-center justify-center shadow-lg shadow-primary/20"
      >
        <Plus size={28} color="#002147" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
