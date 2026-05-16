import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Video, Users, Bell, Search, GraduationCap, ArrowRight } from 'lucide-react-native';
import api from '../../lib/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/student/dashboard');
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <View className="bg-primary px-6 pt-8 pb-12 rounded-b-[40px] shadow-lg">
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-secondary rounded-full items-center justify-center">
                <Text className="text-primary font-bold text-xl">{user?.name?.charAt(0)}</Text>
              </View>
              <View className="ml-3">
                <Text className="text-gray-300 text-sm">Welcome back,</Text>
                <Text className="text-white text-xl font-bold">{user?.name}</Text>
              </View>
            </View>
            <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
              <Bell size={24} color="white" />
              <View className="absolute top-2 right-2 w-3 h-3 bg-accent rounded-full border-2 border-primary" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View className="mt-8 bg-white/10 flex-row items-center px-4 h-12 rounded-2xl">
            <Search size={20} color="#9CA3AF" />
            <Text className="text-gray-400 ml-2">Search tutorials, classes...</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap px-6 -mt-8 justify-between">
          {[
            { label: 'Tutorials', value: '12', icon: BookOpen, color: '#3B82F6' },
            { label: 'Classes', value: '04', icon: Video, color: '#10B981' },
            { label: 'Network', value: '85', icon: Users, color: '#F59E0B' },
          ].map((stat, i) => (stat &&
            <View key={i} className="bg-white w-[30%] p-4 rounded-3xl shadow-sm items-center">
              <View style={{ backgroundColor: `${stat.color}10` }} className="p-2 rounded-xl mb-2">
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text className="text-primary font-bold text-lg">{stat.value}</Text>
              <Text className="text-gray-400 text-[10px]">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View className="px-6 mt-8">
          <Text className="text-primary text-xl font-bold mb-4">Jump Back In</Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <View className="bg-blue-50 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                <GraduationCap size={24} color="#3B82F6" />
              </View>
              <Text className="text-primary font-bold text-lg">E-Exam</Text>
              <Text className="text-gray-400 text-xs mt-1">Take practice test</Text>
              <View className="mt-4 flex-row items-center">
                <Text className="text-blue-500 font-semibold mr-1">Start</Text>
                <ArrowRight size={14} color="#3B82F6" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
              <View className="bg-amber-50 w-12 h-12 rounded-2xl items-center justify-center mb-4">
                <Video size={24} color="#F59E0B" />
              </View>
              <Text className="text-primary font-bold text-lg">Live Class</Text>
              <Text className="text-gray-400 text-xs mt-1">Join active room</Text>
              <View className="mt-4 flex-row items-center">
                <Text className="text-amber-500 font-semibold mr-1">Join</Text>
                <ArrowRight size={14} color="#F59E0B" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Tutorials */}
        <View className="px-6 mt-8 mb-10">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-primary text-xl font-bold">Recent Tutorials</Text>
            <TouchableOpacity><Text className="text-primary font-semibold">See All</Text></TouchableOpacity>
          </View>

          {[1, 2, 3].map((_, i) => (
            <TouchableOpacity key={i} className="bg-white p-4 rounded-3xl shadow-sm flex-row items-center mb-3">
              <View className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center">
                <BookOpen size={24} color="#6B7280" />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-primary font-bold text-base" numberOfLines={1}>Advanced Web Development (CSC 401)</Text>
                <View className="flex-row items-center mt-1">
                  <Text className="text-gray-400 text-xs">Lecturer: Dr. Ibrahim</Text>
                  <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                  <Text className="text-gray-400 text-xs">PDF • 2MB</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
