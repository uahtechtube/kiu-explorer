import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, GraduationCap, Network, BookOpen, Calendar, MapPin, ArrowRight } from 'lucide-react-native';
import { PremiumCard } from '../../../components/shared/PremiumCard';
import AdminNavBar from '../../../components/admin/AdminNavBar';

const { width } = Dimensions.get('window');

export default function AcademicHubScreen() {
    const router = useRouter();

    const modules = [
        {
            title: 'Faculties & Colleges',
            desc: 'Manage university divisions, deans, and basic operational codes.',
            icon: GraduationCap,
            color: '#3B82F6', // Vibrant Royal Blue
            route: '/admin/academic/faculties',
        },
        {
            title: 'Departments',
            desc: 'Configure academic departments, assign to faculties, and track fields.',
            icon: Network,
            color: '#8B5CF6', // Vibrant Purple
            route: '/admin/academic/departments',
        },
        {
            title: 'Programmes & Degrees',
            desc: 'Manage student degree courses, degree types, and durations.',
            icon: BookOpen,
            color: '#10B981', // Emerald Green
            route: '/admin/academic/programmes',
        },
        {
            title: 'Academic Sessions',
            desc: 'Configure semesters, dates, and set the university current session.',
            icon: Calendar,
            color: '#F59E0B', // Bright Amber
            route: '/admin/academic/sessions',
        },
        {
            title: 'Offices & Administration Units',
            desc: 'Configure campus administrative offices, operating hours, and location points.',
            icon: MapPin,
            color: '#06B6D4', // Modern Cyan
            route: '/admin/academic/offices',
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.push('/admin/dashboard')}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center flex-1">
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Structure Config</Text>
                        <Text className="text-white text-xl font-bold">Academic Portals</Text>
                    </View>
                    <View className="w-12 h-12" />
                </View>
            </View>

            <ScrollView
                className="flex-1 -mt-10 px-6"
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
            >
                <View className="mb-6 bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 flex-row items-center">
                    <View className="flex-1">
                        <Text className="text-primary font-black text-base">University Configuration</Text>
                        <Text className="text-gray-500 text-xs mt-1">Configure and manage all institutional layers of Kashim Ibrahim University.</Text>
                    </View>
                </View>

                {modules.map((item, idx) => {
                    const IconComponent = item.icon;
                    return (
                        <PremiumCard
                            key={idx}
                            variant="elevated"
                            className="bg-white p-5 border-gray-100 shadow-sm flex-row items-center mb-5"
                            onPress={() => router.push(item.route as any)}
                        >
                            <View 
                                style={{ backgroundColor: `${item.color}15` }} 
                                className="w-14 h-14 rounded-2xl items-center justify-center mr-4 border"
                                // Subtle matching border color
                                // @ts-ignore
                                borderColor={`${item.color}30`}
                            >
                                <IconComponent size={24} color={item.color} />
                            </View>
                            
                            <View className="flex-1">
                                <Text className="text-primary font-black text-base leading-tight mb-1">{item.title}</Text>
                                <Text className="text-gray-400 text-[11px] leading-normal font-medium">{item.desc}</Text>
                            </View>
                            
                            <ArrowRight size={18} color="#CBD5E1" />
                        </PremiumCard>
                    );
                })}
            </ScrollView>

            <AdminNavBar />
        </SafeAreaView>
    );
}
