import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Image, Modal, Alert, FlatList, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useAuth } from '../../context/AuthContext';
import { 
    Menu, 
    Bell, 
    User as UserIcon, 
    Search, 
    SlidersHorizontal, 
    GraduationCap, 
    BookOpen, 
    Calendar, 
    MessageSquare, 
    CheckCircle2, 
    ChevronRight, 
    Megaphone,
    X,
    AlertCircle,
    Sparkles,
    Store,
    Home,
    Award,
    CreditCard,
    MessageCircle,
    Settings,
    HelpCircle,
    LogOut,
    Video,
    Zap,
    FileText,
    Play,
    Users,
    Calculator
} from 'lucide-react-native';
import api from '../../lib/api';

const LogoImage = require('../../assets/images/logo.png');

let hasShownPopupThisSession = false;

const resolveMediaUrl = (path: string | null | undefined): string | null => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanBase = api.defaults.baseURL?.replace('/api', '') || '';
    return `${cleanBase}/${path.replace(/^\//, '')}`;
};

interface PopupSlideProps {
    popup: any;
    width: number;
}

function PopupSlide({ popup, width }: PopupSlideProps) {
    const imageUrl = resolveMediaUrl(popup.image);
    const videoUrl = resolveMediaUrl(popup.video);
    const player = useVideoPlayer(videoUrl ?? null, (p) => {
        p.loop = true;
        p.play();
    });

    return (
        <View style={{ width }} className="px-6 pb-4">
            <ScrollView showsVerticalScrollIndicator={false} className="max-h-64">
                <View className="w-14 h-14 bg-amber-50 rounded-2xl items-center justify-center mb-4 mt-5 border border-amber-100 self-center">
                    <AlertCircle size={28} color="#D97706" />
                </View>
                <Text className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1 text-center">Notice</Text>
                <Text className="text-xl font-bold text-primary text-center mb-3">{popup.title}</Text>
                {!!popup.body && (
                    <Text className="text-gray-600 text-sm leading-5 text-center">{popup.body}</Text>
                )}
                {imageUrl && (
                    <Image source={{ uri: imageUrl }} className="w-full h-40 rounded-2xl mt-4" resizeMode="cover" />
                )}
                {videoUrl && (
                    <VideoView
                        player={player}
                        nativeControls
                        style={{ width: '100%', height: 180, borderRadius: 16, marginTop: 16 }}
                    />
                )}
            </ScrollView>
        </View>
    );
}

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
  const { user, signOut } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [popups, setPopups] = useState<any[]>([]);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupIndex, setPopupIndex] = useState(0);
  const popupListRef = useRef<FlatList<any>>(null);
  const { width: windowWidth } = useWindowDimensions();
  const popupWidth = Math.min(windowWidth - 48, 384);
  
  // Navigation Modals
  const [sideMenuVisible, setSideMenuVisible] = useState(false);
  const [viewAllModalVisible, setViewAllModalVisible] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  };

  const userName = (user?.first_name && user?.surname) 
    ? `${user.first_name} ${user.surname}` 
    : (user?.name || dashboardData?.student?.name || 'John Doe');

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
      if (!hasShownPopupThisSession) {
        api.get('/popup-announcement/active')
          .then(res => {
            const list = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
            const active = list.filter((p: any) => p.is_active);
            if (active.length) {
              setPopups(active);
              setPopupIndex(0);
              setPopupVisible(true);
              hasShownPopupThisSession = true;
            }
          })
          .catch(err => console.error('Error fetching popup:', err));
      }
    }
  }, [user]);

  useEffect(() => {
    if (!popupVisible || popups.length <= 1) return;
    const timer = setInterval(() => {
      setPopupIndex(prev => {
        const next = (prev + 1) % popups.length;
        popupListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [popupVisible, popups.length]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, []);

  const handleLogout = () => {
    setSideMenuVisible(false);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of KIU Explorer?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Log Out', style: 'destructive', onPress: () => signOut() }
      ]
    );
  };

  const navigateTo = (path: string) => {
    setSideMenuVisible(false);
    setViewAllModalVisible(false);
    router.push(path as any);
  };

  const allFeatures = [
    { title: 'My Courses', icon: GraduationCap, color: '#2563EB', bg: '#EFF6FF', route: '/courses' },
    { title: 'Virtual Classes', icon: Video, color: '#D97706', bg: '#FFF7ED', route: '/classes' },
    { title: 'Library', icon: BookOpen, color: '#16A34A', bg: '#F0FDF4', route: '/library' },
    { title: 'Assignments', icon: CheckCircle2, color: '#059669', bg: '#ECFDF5', route: '/assignments' },
    { title: 'Exams & CBT', icon: FileText, color: '#DC2626', bg: '#FEF2F2', route: '/exams' },
    { title: 'Quizzes', icon: Zap, color: '#7C3AED', bg: '#F5F3FF', route: '/quizzes' },
    { title: 'Video Tutorials', icon: Play, color: '#0284C7', bg: '#F0F9FF', route: '/tutorials' },
    { title: 'Gutti AI', icon: Sparkles, color: '#4F46E5', bg: '#EEF2FF', route: '/ai-assistant' },
    { title: 'Homework AI', icon: Calculator, color: '#0891B2', bg: '#ECFEFF', route: '/ai-assistant/homework' },
    { title: 'Attendance', icon: Calendar, color: '#EA580C', bg: '#FFF7ED', route: '/attendance' },
    { title: 'Social Feed', icon: Users, color: '#EC4899', bg: '#FDF2F8', route: '/social' },
    { title: 'Marketplace', icon: Store, color: '#D97706', bg: '#FEF3C7', route: '/marketplace' },
    { title: 'Associations', icon: Award, color: '#059669', bg: '#D1FAE5', route: '/associations' },
    { title: 'Events', icon: Calendar, color: '#2563EB', bg: '#DBEAFE', route: '/events' },
    { title: 'Hostels', icon: Home, color: '#7C3AED', bg: '#EDE9FE', route: '/hostels' },
    { title: 'Notifications', icon: Bell, color: '#9333EA', bg: '#FAF5FF', route: '/notifications' },
    { title: 'Payments', icon: CreditCard, color: '#0D9488', bg: '#CCFBF1', route: '/payments' },
    { title: 'Search', icon: Search, color: '#64748B', bg: '#F1F5F9', route: '/search' },
    { title: 'Profile', icon: UserIcon, color: '#002147', bg: '#E2E8F0', route: '/profile' },
    { title: 'Settings', icon: Settings, color: '#475569', bg: '#F8FAFC', route: '/settings' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header Navigation */}
      <View className="bg-white px-6 py-4 flex-row items-center justify-between border-b border-gray-100 shadow-xs">
        <TouchableOpacity onPress={() => setSideMenuVisible(true)} className="p-2 -ml-2 rounded-xl bg-gray-50">
          <Menu size={22} color="#002147" />
        </TouchableOpacity>

        <View className="flex-row items-center">
          <Text className="text-2xl font-black text-primary tracking-tight">Kiu<Text className="text-amber-600">Explorer</Text></Text>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigateTo('/notifications')} className="p-2 bg-gray-50 rounded-full relative mr-3">
            <Bell size={20} color="#002147" />
            <View className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full items-center justify-center border-2 border-white">
              <Text className="text-white text-[9px] font-bold">3</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigateTo('/profile')} className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center border border-gray-200 overflow-hidden">
            {user?.passport_photograph ? (
              <Image source={{ uri: user.passport_photograph }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <UserIcon size={18} color="#6B7280" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting & University Crest Section */}
        <View className="flex-row items-center justify-between mt-6 mb-6">
          <View className="flex-1 pr-4">
            <Text className="text-gray-500 text-sm font-medium">{getGreeting()}</Text>
            <Text className="text-primary font-black text-2xl mt-0.5" numberOfLines={1}>
              {userName} 👋
            </Text>
            <Text className="text-gray-400 text-xs mt-1 leading-4">
              Welcome back! Ready to explore today?
            </Text>
          </View>
          <View className="w-24 h-24 items-center justify-center bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
            <Image source={LogoImage} className="w-20 h-20" resizeMode="contain" />
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigateTo('/search')}
          className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 shadow-sm flex-row items-center justify-between mb-6"
        >
          <View className="flex-row items-center flex-1 mr-2">
            <Search size={20} color="#94A3B8" />
            <Text className="text-gray-400 text-sm ml-3 flex-1" numberOfLines={1}>
              Search for resources, services, and more...
            </Text>
          </View>
          <View className="p-1.5 bg-gray-50 rounded-xl">
            <SlidersHorizontal size={18} color="#64748B" />
          </View>
        </TouchableOpacity>

        {/* Quick Access Section (4 items - Fees removed per user request) */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-primary font-bold text-lg">Quick Access</Text>
            <TouchableOpacity onPress={() => setViewAllModalVisible(true)}>
              <Text className="text-blue-600 font-semibold text-xs">View All</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between">
            {/* Gutti AI */}
            <TouchableOpacity onPress={() => navigateTo('/ai-assistant')} className="items-center w-[22%]">
              <View className="w-14 h-14 bg-indigo-50 rounded-2xl items-center justify-center border border-indigo-100/60 mb-2 shadow-xs">
                <Sparkles size={24} color="#4F46E5" />
              </View>
              <Text className="text-gray-700 text-xs font-semibold text-center">Gutti AI</Text>
            </TouchableOpacity>

            {/* Library */}
            <TouchableOpacity onPress={() => navigateTo('/library')} className="items-center w-[22%]">
              <View className="w-14 h-14 bg-emerald-50 rounded-2xl items-center justify-center border border-emerald-100/60 mb-2 shadow-xs">
                <BookOpen size={24} color="#16A34A" />
              </View>
              <Text className="text-gray-700 text-xs font-semibold text-center">Library</Text>
            </TouchableOpacity>

            {/* Messages */}
            <TouchableOpacity onPress={() => navigateTo('/messages')} className="items-center w-[22%]">
              <View className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center border border-blue-100/60 mb-2 shadow-xs">
                <MessageCircle size={24} color="#002147" />
              </View>
              <Text className="text-gray-700 text-xs font-semibold text-center">Messages</Text>
            </TouchableOpacity>

            {/* Announcements */}
            <TouchableOpacity onPress={() => navigateTo('/notifications')} className="items-center w-[22%]">
              <View className="w-14 h-14 bg-purple-50 rounded-2xl items-center justify-center border border-purple-100/60 mb-2 shadow-xs">
                <MessageSquare size={24} color="#9333EA" />
              </View>
              <Text className="text-gray-700 text-xs font-semibold text-center">Announcements</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* My Dashboard Grid (2x2) */}
        <View className="mb-6">
          <Text className="text-primary font-bold text-lg mb-4">My Dashboard</Text>
          <View className="flex-row flex-wrap justify-between">
            {/* Enrolled Courses Card */}
            <TouchableOpacity 
              onPress={() => navigateTo('/courses')} 
              className="bg-white w-[48%] p-4 rounded-2xl border border-gray-100 shadow-sm mb-4"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center">
                  <BookOpen size={20} color="#2563EB" />
                </View>
              </View>
              <Text className="text-gray-500 text-xs font-medium">Enrolled Courses</Text>
              <View className="flex-row justify-between items-baseline mt-1">
                <Text className="text-primary font-black text-xl">{dashboardData?.overview?.enrolled_courses || 5}</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-400 text-[10px] mr-1">Courses</Text>
                  <ChevronRight size={14} color="#94A3B8" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Assignments Card */}
            <TouchableOpacity 
              onPress={() => navigateTo('/assignments')} 
              className="bg-white w-[48%] p-4 rounded-2xl border border-gray-100 shadow-sm mb-4"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center">
                  <CheckCircle2 size={20} color="#16A34A" />
                </View>
              </View>
              <Text className="text-gray-500 text-xs font-medium">Assignments</Text>
              <View className="flex-row justify-between items-baseline mt-1">
                <Text className="text-primary font-black text-xl">3</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-400 text-[10px] mr-1">Pending</Text>
                  <ChevronRight size={14} color="#94A3B8" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Upcoming Classes Card */}
            <TouchableOpacity 
              onPress={() => navigateTo('/classes')} 
              className="bg-white w-[48%] p-4 rounded-2xl border border-gray-100 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="w-10 h-10 bg-amber-50 rounded-xl items-center justify-center">
                  <Calendar size={20} color="#D97706" />
                </View>
              </View>
              <Text className="text-gray-500 text-xs font-medium">Upcoming Classes</Text>
              <View className="flex-row justify-between items-baseline mt-1">
                <Text className="text-primary font-black text-xl">{dashboardData?.upcoming_classes?.length || 2}</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-400 text-[10px] mr-1">Today</Text>
                  <ChevronRight size={14} color="#94A3B8" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Notifications Card */}
            <TouchableOpacity 
              onPress={() => navigateTo('/notifications')} 
              className="bg-white w-[48%] p-4 rounded-2xl border border-gray-100 shadow-sm"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center">
                  <Bell size={20} color="#9333EA" />
                </View>
              </View>
              <Text className="text-gray-500 text-xs font-medium">Notifications</Text>
              <View className="flex-row justify-between items-baseline mt-1">
                <Text className="text-primary font-black text-xl">{dashboardData?.notifications_count || 3}</Text>
                <View className="flex-row items-center">
                  <Text className="text-gray-400 text-[10px] mr-1">New</Text>
                  <ChevronRight size={14} color="#94A3B8" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Latest Announcements */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-primary font-bold text-lg">Latest Announcements</Text>
            <TouchableOpacity onPress={() => navigateTo('/announcements')}>
              <Text className="text-blue-600 font-semibold text-xs">View All</Text>
            </TouchableOpacity>
          </View>

          {dashboardData?.announcements && dashboardData.announcements.length > 0 ? (
            dashboardData.announcements.slice(0, 2).map((item, idx) => (
              <TouchableOpacity key={idx} onPress={() => navigateTo('/announcements')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3">
                <View className="flex-row items-start">
                  <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                    <Megaphone size={20} color="#2563EB" />
                  </View>
                  <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                      <Text className="text-primary font-bold text-sm flex-1 mr-2" numberOfLines={1}>{item.title}</Text>
                      <Text className="text-gray-400 text-[10px]">{item.date}</Text>
                    </View>
                    <Text className="text-gray-500 text-xs leading-4 mb-2" numberOfLines={2}>{item.extract}</Text>
                    <View className="self-start px-2.5 py-0.5 bg-blue-50 rounded-full">
                      <Text className="text-blue-600 text-[10px] font-semibold">General</Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <TouchableOpacity onPress={() => navigateTo('/announcements')} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <View className="flex-row items-start">
                <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center mr-3">
                  <Megaphone size={20} color="#2563EB" />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-primary font-bold text-sm flex-1 mr-2" numberOfLines={1}>Semester Registration Open</Text>
                    <Text className="text-gray-400 text-[10px]">May 20, 2024</Text>
                  </View>
                  <Text className="text-gray-500 text-xs leading-4 mb-2" numberOfLines={2}>
                    Register for the 2024/2025 semester before the deadline.
                  </Text>
                  <View className="self-start px-2.5 py-0.5 bg-blue-50 rounded-full">
                    <Text className="text-blue-600 text-[10px] font-semibold">General</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Slide-out Navigation Drawer Menu Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sideMenuVisible}
        onRequestClose={() => setSideMenuVisible(false)}
      >
        <View className="flex-1 bg-black/50 flex-row">
          <View className="w-[82%] bg-white h-full shadow-2xl p-6">
            <SafeAreaView className="flex-1" edges={['top', 'bottom']}>
              <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                {/* Menu Header */}
                <View className="flex-row justify-between items-center pb-6 border-b border-gray-100 mb-6">
                  <View className="flex-row items-center flex-1 pr-2">
                    <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center border border-primary/20 overflow-hidden mr-3">
                      {user?.passport_photograph ? (
                        <Image source={{ uri: user.passport_photograph }} className="w-full h-full" resizeMode="cover" />
                      ) : (
                        <UserIcon size={24} color="#002147" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-primary font-black text-base" numberOfLines={1}>{userName}</Text>
                      <Text className="text-gray-400 text-xs" numberOfLines={1}>{user?.email || 'Student Portal'}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSideMenuVisible(false)} className="p-2 bg-gray-100 rounded-full">
                    <X size={18} color="#475569" />
                  </TouchableOpacity>
                </View>

                {/* Navigation Sections */}
                <Text className="text-gray-400 text-[11px] font-black uppercase tracking-wider mb-3">Academics & Learning</Text>
                
                <TouchableOpacity onPress={() => navigateTo('/courses')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <GraduationCap size={20} color="#2563EB" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">My Courses</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/classes')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <Video size={20} color="#D97706" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Virtual Classes</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/library')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <BookOpen size={20} color="#16A34A" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Library</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/assignments')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <CheckCircle2 size={20} color="#059669" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Assignments</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/exams')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <FileText size={20} color="#DC2626" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Exams & CBT</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/quizzes')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <Zap size={20} color="#7C3AED" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Quizzes</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/tutorials')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-4">
                  <Play size={20} color="#0284C7" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Video Tutorials</Text>
                </TouchableOpacity>

                <Text className="text-gray-400 text-[11px] font-black uppercase tracking-wider mb-3">AI & Smart Utilities</Text>

                <TouchableOpacity onPress={() => navigateTo('/ai-assistant')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <Sparkles size={20} color="#4F46E5" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Gutti AI Assistant</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/attendance')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-4">
                  <Calendar size={20} color="#EA580C" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Attendance Tracker</Text>
                </TouchableOpacity>

                <Text className="text-gray-400 text-[11px] font-black uppercase tracking-wider mb-3">Campus Life</Text>

                <TouchableOpacity onPress={() => navigateTo('/social')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <Users size={20} color="#EC4899" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Social Feed</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/marketplace')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <Store size={20} color="#D97706" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Student Marketplace</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/associations')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <Award size={20} color="#059669" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Associations</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/events')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <Calendar size={20} color="#2563EB" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Events</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/hostels')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-4">
                  <Home size={20} color="#7C3AED" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Hostels</Text>
                </TouchableOpacity>

                <Text className="text-gray-400 text-[11px] font-black uppercase tracking-wider mb-3">Account & Settings</Text>

                <TouchableOpacity onPress={() => navigateTo('/profile')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <UserIcon size={20} color="#002147" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">My Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/payments')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <CreditCard size={20} color="#0D9488" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Payments</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/settings')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-1">
                  <Settings size={20} color="#475569" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Settings</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigateTo('/support')} className="flex-row items-center py-3 px-2 rounded-xl active:bg-gray-50 mb-6">
                  <HelpCircle size={20} color="#64748B" />
                  <Text className="text-gray-700 font-semibold text-sm ml-3">Help & Support</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleLogout} className="flex-row items-center py-3 px-3 rounded-xl bg-rose-50 border border-rose-100 mb-6">
                  <LogOut size={20} color="#E11D48" />
                  <Text className="text-rose-600 font-bold text-sm ml-3">Sign Out</Text>
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </View>
          <TouchableOpacity onPress={() => setSideMenuVisible(false)} className="flex-1" />
        </View>
      </Modal>

      {/* "View All" Features Grid Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={viewAllModalVisible}
        onRequestClose={() => setViewAllModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[36px] max-h-[85%] p-6 shadow-2xl">
            <View className="flex-row justify-between items-center pb-4 border-b border-gray-100 mb-4">
              <Text className="text-xl font-bold text-primary">All KIU Features</Text>
              <TouchableOpacity onPress={() => setViewAllModalVisible(false)} className="p-2 bg-gray-100 rounded-full">
                <X size={18} color="#475569" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="py-2">
              <View className="flex-row flex-wrap justify-between">
                {allFeatures.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => navigateTo(item.route)}
                    className="w-[30%] items-center mb-6"
                  >
                    <View style={{ backgroundColor: item.bg }} className="w-16 h-16 rounded-2xl items-center justify-center mb-2 shadow-xs">
                      <item.icon size={26} color={item.color} />
                    </View>
                    <Text className="text-gray-700 text-xs font-semibold text-center" numberOfLines={1}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Popup Announcement Modal (auto-sliding slides) */}
      {popups.length > 0 && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={popupVisible}
          onRequestClose={() => setPopupVisible(false)}
        >
          <View className="flex-1 bg-black/60 items-center justify-center px-6">
            <View className="bg-white w-full max-w-sm rounded-[28px] overflow-hidden shadow-2xl">
              <View className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

              <FlatList
                ref={popupListRef}
                data={popups}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                getItemLayout={(_, index) => ({ length: popupWidth, offset: popupWidth * index, index })}
                onMomentumScrollEnd={(e) => setPopupIndex(Math.round(e.nativeEvent.contentOffset.x / popupWidth))}
                renderItem={({ item }) => <PopupSlide popup={item} width={popupWidth} />}
              />

              <TouchableOpacity
                onPress={() => setPopupVisible(false)}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full items-center justify-center z-10"
              >
                <X size={18} color="#475569" />
              </TouchableOpacity>

              {popups.length > 1 && (
                <View className="flex-row justify-center pb-3">
                  {popups.map((_, i) => (
                    <View
                      key={i}
                      className={`w-2 h-2 rounded-full mx-1 ${i === popupIndex ? 'bg-primary' : 'bg-gray-200'}`}
                    />
                  ))}
                </View>
              )}

              <View className="px-6 pb-6 pt-2">
                <TouchableOpacity
                  onPress={() => setPopupVisible(false)}
                  className="w-full bg-primary py-3.5 rounded-2xl items-center justify-center shadow-lg shadow-primary/20"
                >
                  <Text className="text-white font-bold text-base">
                    {popups.length > 1 ? 'Cancel' : 'Understood'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
