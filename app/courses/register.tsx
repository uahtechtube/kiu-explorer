import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    RefreshControl,
    ActivityIndicator,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Search, BookOpen, CheckCircle, Plus, Filter, ChevronDown, ChevronLeft } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface Course {
    id: number;
    code: string;
    title: string;
    unit: number;
    level: string;
    semester: string;
    is_elective: boolean;
    is_registered?: boolean;
    department?: {
        name: string;
    };
}

export default function CourseRegistrationPage() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [courses, setCourses] = useState<Course[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'available' | 'registered'>('available');

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/courses', {
                params: { search: searchQuery }
            });
            setCourses(response.data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            // Mock data
            setCourses([
                {
                    id: 1,
                    code: 'CSC 401',
                    title: 'Advanced Software Engineering',
                    unit: 3,
                    level: '400',
                    semester: 'First',
                    is_elective: false,
                    is_registered: false,
                    department: { name: 'Computer Science' }
                },
                {
                    id: 2,
                    code: 'CSC 402',
                    title: 'Artificial Intelligence',
                    unit: 3,
                    level: '400',
                    semester: 'First',
                    is_elective: true,
                    is_registered: false,
                    department: { name: 'Computer Science' }
                },
                {
                    id: 3,
                    code: 'CSC 301',
                    title: 'Database Systems',
                    unit: 4,
                    level: '300',
                    semester: 'First',
                    is_elective: false,
                    is_registered: true,
                    department: { name: 'Computer Science' }
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [searchQuery]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchCourses();
        setRefreshing(false);
    }, [searchQuery]);

    const handleRegister = async (courseId: number, courseCode: string) => {
        Alert.alert(
            'Confirm Registration',
            `Do you want to register for ${courseCode}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Register',
                    onPress: async () => {
                        try {
                            await api.post('/student/courses/register', { course_id: courseId });
                            Alert.alert('Success', 'Course registered successfully!');
                            fetchCourses();
                        } catch (error: any) {
                            console.error('Registration error:', error);
                            const message = error.response?.data?.message || 'Failed to register for course.';
                            Alert.alert('Error', message);
                        }
                    }
                }
            ]
        );
    };

    const filteredCourses = courses.filter(course => {
        if (selectedTab === 'available') {
            return !course.is_registered;
        } else {
            return course.is_registered;
        }
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20 mr-4"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-gray-300 text-xs font-bold uppercase mb-1">Academic Registration</Text>
                        <Text className="text-white text-2xl font-bold">Course Registration</Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="bg-white/10 rounded-2xl flex-row items-center px-4 py-3 border border-white/20">
                    <Search size={20} color="white" />
                    <TextInput
                        placeholder="Search courses..."
                        placeholderTextColor="#CBD5E1"
                        className="flex-1 ml-3 text-white"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row px-6 mt-6 mb-4">
                <TouchableOpacity
                    onPress={() => setSelectedTab('available')}
                    className={`flex-1 mr-2 py-3 rounded-2xl items-center ${selectedTab === 'available' ? 'bg-primary' : 'bg-white border border-gray-200'
                        }`}
                >
                    <Text className={`font-bold ${selectedTab === 'available' ? 'text-white' : 'text-gray-500'}`}>
                        Available Courses
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setSelectedTab('registered')}
                    className={`flex-1 ml-2 py-3 rounded-2xl items-center ${selectedTab === 'registered' ? 'bg-primary' : 'bg-white border border-gray-200'
                        }`}
                >
                    <Text className={`font-bold ${selectedTab === 'registered' ? 'text-white' : 'text-gray-500'}`}>
                        My Courses
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <PremiumCard key={course.id} variant="solid" className="mb-4 p-5 border-gray-100">
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-1">
                                    <View className="flex-row items-center mb-1">
                                        <Text className="text-primary font-bold text-lg">{course.code}</Text>
                                        {!!course.is_elective && (
                                            <View className="ml-2 bg-amber-100 px-2 py-0.5 rounded-lg">
                                                <Text className="text-amber-700 text-[10px] font-bold">ELECTIVE</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className="text-gray-600 text-sm">{course.title}</Text>
                                </View>
                                {!!course.is_registered && (
                                    <View className="bg-green-100 px-3 py-1 rounded-full">
                                        <CheckCircle size={16} color="#059669" />
                                    </View>
                                )}
                            </View>
                            
                            <View className="flex-row items-center mb-4">
                                <View className="bg-blue-50 px-3 py-1 rounded-lg mr-2">
                                    <Text className="text-blue-700 text-xs font-bold">{course.unit} Units</Text>
                                </View>
                                <View className="bg-purple-50 px-3 py-1 rounded-lg mr-2">
                                    <Text className="text-purple-700 text-xs font-bold">Level {course.level}</Text>
                                </View>
                                <View className="bg-gray-100 px-3 py-1 rounded-lg">
                                    <Text className="text-gray-700 text-xs font-bold">{course.semester} Sem</Text>
                                </View>
                            </View>

                            {!!course.department && (
                                <Text className="text-gray-400 text-xs mb-3">{course.department.name}</Text>
                            )}

                            {!course.is_registered && (
                                <TouchableOpacity
                                    onPress={() => handleRegister(course.id, course.code)}
                                    className="bg-primary py-3 rounded-2xl items-center flex-row justify-center"
                                >
                                    <Plus size={18} color="white" />
                                    <Text className="text-white font-bold ml-2">Register for Course</Text>
                                </TouchableOpacity>
                            )}
                        </PremiumCard>
                    ))
                ) : (
                    <View className="items-center justify-center mt-20">
                        <BookOpen size={48} color="#CBD5E1" />
                        <Text className="text-gray-400 text-center mt-4">
                            {selectedTab === 'available'
                                ? 'No available courses found'
                                : 'You have not registered for any courses yet'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
