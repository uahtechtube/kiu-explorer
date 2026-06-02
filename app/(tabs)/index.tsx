import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Video, Users, Bell, Search, GraduationCap, ArrowRight, Home } from 'lucide-react-native';
import api from '../../lib/api';

interface DashboardData {
  student: {
    name: string;
    matric_number: string;
    level: string;
    avatar: string;
  };
  session: string;
  overview: {
    enrolled_courses: number;
    cgpa: string;
    attendance: string;
    total_tutorials: number;
    total_classes: number;
  };
  upcoming_classes: Array<{
    id: number;
    code: string;
    title: string;
    lecturer: string;
    time: string;
    date: string;
    status: string;
  }>;
  announcements: Array<{
    id: number;
    title: string;
    date: string;
    extract: string;
  }>;
  latest_resources: Array<{
    id: number;
    title: string;
    author: string;
    category: string;
    course_code: string;
    file_type: string;
    file_size: string;
  }>;
  notifications_count?: number;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

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
    <SafeAreaView className="flex-1 bg-primary" edges={['top']}>
      {/* Fixed Header Section */}
      <View className="bg-primary px-6 pt-4 pb-6 shadow-lg">
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center flex-1">
            <TouchableOpacity onPress={() => router.push('/profile')} className="w-12 h-12 bg-secondary rounded-full items-center justify-center overflow-hidden">
              {user?.passport_photograph ? (
                <Image
                  source={{ uri: user.passport_photograph }}
                  className="w-12 h-12"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-primary font-bold text-xl">{user?.name?.charAt(0) || dashboardData?.student?.name?.charAt(0)}</Text>
              )}
            </TouchableOpacity>
            <View className="ml-3 flex-1">
              <Text className="text-gray-300 text-sm">Welcome back,</Text>
              <Text className="text-white text-xl font-bold" numberOfLines={1}>{dashboardData?.student?.name || user?.name}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            className="w-10 h-10 bg-white/10 rounded-full items-center justify-center ml-2"
          >
            <Bell size={24} color="white" />
            {(dashboardData?.notifications_count || 0) > 0 || (dashboardData?.announcements?.length || 0) > 0 ? (
              <View className="absolute top-2 right-2 w-3 h-3 bg-accent rounded-full border-2 border-primary" />
            ) : null}
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        className="flex-1 bg-gray-50"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar - Now part of scrollable content */}
        <View className="bg-primary px-6 pt-4 pb-8">
          <TouchableOpacity
            onPress={() => router.push('/search')}
            className="bg-white/10 flex-row items-center px-4 h-12 rounded-2xl"
          >
            <Search size={20} color="#9CA3AF" />
            <Text className="text-gray-400 ml-2">Search tutorials, classes...</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap px-6 pt-6 pb-4 justify-between">
          {[
            { label: 'Courses', value: dashboardData?.overview?.enrolled_courses || '0', icon: BookOpen, color: '#3B82F6' },
            { label: 'Classes', value: dashboardData?.overview?.total_classes || '0', icon: Video, color: '#10B981' },
            { label: 'Attendance', value: dashboardData?.overview?.attendance || '0%', icon: Users, color: '#F59E0B' },
          ].map((stat, i) => (
            <View key={i} className="bg-white w-[30%] p-4 rounded-3xl shadow-sm items-center">
              <View style={{ backgroundColor: `${stat.color}10` }} className="p-2 rounded-xl mb-2">
                <stat.icon size={20} color={stat.color} />
              </View>
              <Text className="text-primary font-bold text-lg">{stat.value}</Text>
              <Text className="text-gray-400 text-[10px]">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Announcements Preview */}
        {dashboardData && dashboardData.announcements && dashboardData.announcements.length > 0 && (
          <View className="px-6 mt-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-primary text-xl font-bold">Latest News</Text>
              <TouchableOpacity onPress={() => router.push('/announcements')}>
                <Text className="text-blue-500 text-sm">See All</Text>
              </TouchableOpacity>
            </View>
            {dashboardData.announcements.map((ann) => (
              <TouchableOpacity
                key={ann.id}
                onPress={() => router.push(`/announcements/${ann.id}` as any)}
                className="bg-white p-4 rounded-3xl mb-3 flex-row items-center border border-gray-100 shadow-sm"
              >
                <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mr-4">
                  <Bell size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="text-primary font-bold text-sm" numberOfLines={1}>{ann.title}</Text>
                  <Text className="text-gray-400 text-xs mt-1" numberOfLines={1}>{ann.extract}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Classes */}
        {dashboardData && dashboardData.upcoming_classes && dashboardData.upcoming_classes.length > 0 && (
          <View className="px-6 mt-8">
            <Text className="text-primary text-xl font-bold mb-4">Today's Schedule</Text>
            {dashboardData.upcoming_classes.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => router.push(`/classes/${item.id}` as any)}
                className="bg-white p-4 rounded-3xl mb-3 border border-gray-100 shadow-sm"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-amber-50 rounded-xl items-center justify-center mr-3">
                      <Video size={18} color="#F59E0B" />
                    </View>
                    <View>
                      <Text className="text-primary font-bold text-sm">{item.code}: {item.title}</Text>
                      <Text className="text-gray-400 text-xs">{item.lecturer}</Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-primary font-bold text-xs">{item.time}</Text>
                    <Text className="text-amber-500 text-[10px] mt-1 font-semibold">{item.status.toUpperCase()}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View className="px-6 mt-8">
          <Text className="text-primary text-xl font-bold mb-4">Jump Back In</Text>
          <View className="flex-row space-x-4">
            <TouchableOpacity
              onPress={() => router.push('/exams')}
              className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100"
            >
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

            <TouchableOpacity
              onPress={() => router.push('/classes')}
              className="flex-1 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100"
            >
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

        {/* Library Highlights */}
        {dashboardData && dashboardData.latest_resources && dashboardData.latest_resources.length > 0 && (
          <View className="px-6 mt-8">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-primary text-xl font-bold">New in Library</Text>
              <TouchableOpacity onPress={() => router.push('/library')}>
                <Text className="text-blue-500 text-sm">Explore All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
              {dashboardData.latest_resources.map((res) => (
                <TouchableOpacity
                  key={res.id}
                  onPress={() => router.push(`/library/${res.id}` as any)}
                  className="bg-white p-5 rounded-[32px] mr-4 border border-gray-100 shadow-sm w-64"
                >
                  <View className="bg-purple-50 w-10 h-10 rounded-xl items-center justify-center mb-3">
                    <BookOpen size={20} color="#7C3AED" />
                  </View>
                  <Text className="text-primary font-bold text-sm mb-1" numberOfLines={1}>{res.title}</Text>
                  <Text className="text-gray-400 text-[10px] mb-3">{res.course_code || res.category?.replace('_', ' ').toUpperCase() || 'GENERAL'}</Text>
                  <View className="flex-row justify-between items-center pt-3 border-t border-gray-50">
                    <Text className="text-primary font-bold text-[10px]">{res.file_type}</Text>
                    <Text className="text-gray-400 text-[10px]">{res.file_size}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Features Grid */}
        <View className="px-6 mt-8 pb-8">
          <Text className="text-primary text-xl font-bold mb-4">Explore Features</Text>
          <View className="flex-row flex-wrap justify-between">
            {[
              { label: 'E-Classroom', icon: Video, color: '#3B82F6', route: '/classes' },
              { label: 'E-Exams', icon: GraduationCap, color: '#10B981', route: '/exams' },
              { label: 'Assignments', icon: BookOpen, color: '#F59E0B', route: '/assignments' },
              { label: 'My Courses', icon: BookOpen, color: '#EC4899', route: '/courses/register' },
              { label: 'Gutti AI', icon: BookOpen, color: '#8B5CF6', route: '/ai-assistant' },
              { label: 'Events', icon: Users, color: '#F59E0B', route: '/events' },
              { label: 'Associations', icon: Users, color: '#EF4444', route: '/associations' },
              { label: 'Messages', icon: Bell, color: '#06B6D4', route: '/messages' },
              { label: 'Attendance', icon: BookOpen, color: '#84CC16', route: '/attendance' },
              { label: 'Library', icon: BookOpen, color: '#7C3AED', route: '/library' },
              { label: 'Campus Map', icon: Search, color: '#14B8A6', route: '/school/map' },
              { label: 'Staff Directory', icon: Users, color: '#F97316', route: '/school/staff' },
              { label: 'Calendar', icon: BookOpen, color: '#EC4899', route: '/school/calendar' },
              { label: 'Hostels', icon: Home, color: '#3B82F6', route: '/hostels' },
              { label: 'School Info', icon: BookOpen, color: '#6366F1', route: '/school/info' },
              { label: 'About Devs', icon: Users, color: '#F97316', route: '/school/about-us' },
              { label: 'Notifications', icon: Bell, color: '#EF4444', route: '/notifications' },
              { label: 'Payments', icon: GraduationCap, color: '#F59E0B', route: '/payments' },
              { label: 'Search', icon: Search, color: '#64748B', route: '/search' },
            ].map((feature, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => router.push(feature.route as any)}
                className="bg-white w-[48%] p-5 rounded-3xl shadow-sm border border-gray-100 mb-4"
              >
                <View
                  style={{ backgroundColor: `${feature.color}15` }}
                  className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                >
                  <feature.icon size={24} color={feature.color} />
                </View>
                <Text className="text-primary font-bold text-base">{feature.label}</Text>
                <View className="mt-2 flex-row items-center">
                  <Text className="text-gray-400 text-xs mr-1">Open</Text>
                  <ArrowRight size={12} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
