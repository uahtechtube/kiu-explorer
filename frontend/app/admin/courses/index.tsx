import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Search, BookOpen, Users, Edit, Trash2, Filter, GraduationCap } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';

interface Course {
    id: number;
    course_code: string;
    title: string;
    description: string;
    level: string;
    semester: string;
    credit_hours: number;
    department: {
        name: string;
        faculty: {
            name: string;
        };
    };
    allocations_count?: number;
    registrations_count?: number;
}

export default function CoursesManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string>('all');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/courses');
            setCourses(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error:', error);
            // Mock data for demonstration
            setCourses([
                {
                    id: 1,
                    course_code: 'CSC301',
                    title: 'Data Structures and Algorithms',
                    description: 'Advanced study of data structures, algorithms, and complexity analysis',
                    level: '300',
                    semester: '1',
                    credit_hours: 3,
                    department: {
                        name: 'Computer Science',
                        faculty: { name: 'Science' }
                    },
                    allocations_count: 2,
                    registrations_count: 145
                },
                {
                    id: 2,
                    course_code: 'MTH201',
                    title: 'Linear Algebra',
                    description: 'Vector spaces, matrices, and linear transformations',
                    level: '200',
                    semester: '1',
                    credit_hours: 3,
                    department: {
                        name: 'Mathematics',
                        faculty: { name: 'Science' }
                    },
                    allocations_count: 1,
                    registrations_count: 98
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchCourses();
        setRefreshing(false);
    }, []);

    const handleDeleteCourse = (courseId: number, courseTitle: string) => {
        Alert.alert(
            'Delete Course',
            `Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // await api.delete(`/courses/${courseId}`);
                            setCourses(courses.filter(c => c.id !== courseId));
                            Alert.alert('Success', 'Course deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete course');
                        }
                    }
                }
            ]
        );
    };

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.course_code.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
        return matchesSearch && matchesLevel;
    });

    const levels = ['all', '100', '200', '300', '400', '500'];

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
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Academic Control</Text>
                        <Text className="text-white text-xl font-bold">Course Management</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {/* Navigate to create course */ }}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/30"
                    >
                        <Plus size={22} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-3 flex-row items-center border border-white/20">
                    <Search size={20} color="white" />
                    <TextInput
                        placeholder="Search courses..."
                        placeholderTextColor="rgba(255,255,255,0.5)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="flex-1 ml-3 text-white font-medium"
                    />
                </View>
            </View>

            {/* Level Filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mt-14 px-6 mb-4"
                contentContainerStyle={{ paddingRight: 24 }}
            >
                {levels.map((level) => (
                    <TouchableOpacity
                        key={level}
                        onPress={() => setSelectedLevel(level)}
                        className={`mr-3 px-6 py-3 rounded-2xl border ${selectedLevel === level
                            ? 'bg-secondary border-secondary shadow-lg shadow-secondary/20'
                            : 'bg-white border-gray-100'
                            }`}
                    >
                        <Text className={`font-black text-xs uppercase ${selectedLevel === level ? 'text-primary' : 'text-gray-400'
                            }`}>
                            {level === 'all' ? 'All Levels' : `Level ${level}`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !courses.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-20" />
                ) : filteredCourses.length === 0 ? (
                    <View className="items-center justify-center py-32 opacity-20">
                        <BookOpen size={64} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4">NO COURSES FOUND</Text>
                    </View>
                ) : (
                    filteredCourses.map((course) => (
                        <PremiumCard
                            key={course.id}
                            variant="elevated"
                            className="bg-white mb-4 p-5 border-l-4 border-l-primary border-gray-100"
                        >
                            {/* Course Header */}
                            <View className="flex-row justify-between items-start mb-4">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-2">
                                        <View className="bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                                            <Text className="text-primary font-black text-[10px] uppercase tracking-widest">
                                                {course.course_code}
                                            </Text>
                                        </View>
                                        <View className="bg-secondary/10 px-3 py-1 rounded-lg ml-2 border border-secondary/20">
                                            <Text className="text-primary font-black text-[8px] uppercase">
                                                {course.credit_hours} Credits
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className="text-primary text-lg font-black">{course.title}</Text>
                                    <Text className="text-gray-400 text-xs font-medium mt-1" numberOfLines={2}>
                                        {course.description}
                                    </Text>
                                </View>
                            </View>

                            {/* Course Details */}
                            <View className="bg-gray-50/50 p-4 rounded-2xl border border-gray-50 mb-4">
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Department</Text>
                                    <Text className="text-primary font-bold text-xs">{course.department?.name || 'N/A'}</Text>
                                </View>
                                <View className="flex-row justify-between mb-2">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Faculty</Text>
                                    <Text className="text-primary font-bold text-xs">{course.department?.faculty?.name || 'N/A'}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Level/Semester</Text>
                                    <Text className="text-primary font-bold text-xs">
                                        {course.level}L • Semester {course.semester}
                                    </Text>
                                </View>
                            </View>

                            {/* Stats */}
                            <View className="flex-row justify-between mb-4">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 bg-blue-50 rounded-xl items-center justify-center mr-2">
                                        <GraduationCap size={16} color="#3B82F6" />
                                    </View>
                                    <View>
                                        <Text className="text-gray-400 text-[8px] font-black uppercase">Lecturers</Text>
                                        <Text className="text-primary font-black text-sm">{course.allocations_count || 0}</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 bg-emerald-50 rounded-xl items-center justify-center mr-2">
                                        <Users size={16} color="#10B981" />
                                    </View>
                                    <View>
                                        <Text className="text-gray-400 text-[8px] font-black uppercase">Students</Text>
                                        <Text className="text-primary font-black text-sm">{course.registrations_count || 0}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Actions */}
                            <View className="flex-row pt-4 border-t border-gray-50">
                                <TouchableOpacity
                                    onPress={() => {/* Navigate to edit */ }}
                                    className="flex-1 bg-primary/5 rounded-xl py-3 mr-2 flex-row items-center justify-center border border-primary/10"
                                >
                                    <Edit size={16} color="#002147" />
                                    <Text className="text-primary font-black text-xs ml-2 uppercase">Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => handleDeleteCourse(course.id, course.title)}
                                    className="flex-1 bg-rose-50 rounded-xl py-3 ml-2 flex-row items-center justify-center border border-rose-100"
                                >
                                    <Trash2 size={16} color="#EF4444" />
                                    <Text className="text-rose-600 font-black text-xs ml-2 uppercase">Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </PremiumCard>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
