import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, TextInput, Alert, Modal, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Search, BookOpen, Users, Edit, Trash2, Filter, GraduationCap, X, Save, ChevronDown, Check } from 'lucide-react-native';
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

    // Add & Edit Form States
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingCourse, setEditingCourse] = useState<Course | null>(null);
    const [departments, setDepartments] = useState<any[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Selector States
    const [showSelectorModal, setShowSelectorModal] = useState(false);
    const [selectorSearch, setSelectorSearch] = useState('');

    const [formCode, setFormCode] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formDesc, setFormDesc] = useState('');
    const [formUnit, setFormUnit] = useState('3');
    const [formLevel, setFormLevel] = useState('100');
    const [formSemester, setFormSemester] = useState('First');
    const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
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
                    semester: 'First',
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
                    semester: 'First',
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

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/admin/departments');
            const list = response.data.data || response.data || [];
            setDepartments(list);
            if (list.length > 0 && selectedDeptId === null) {
                setSelectedDeptId(list[0].id);
            }
        } catch {
            const list = [
                { id: 1, name: 'Computer Science' },
                { id: 2, name: 'Mathematics' },
                { id: 3, name: 'Electrical Engineering' }
            ];
            setDepartments(list);
            if (selectedDeptId === null) {
                setSelectedDeptId(1);
            }
        }
    };

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchCourses(),
            fetchDepartments()
        ]);
        setRefreshing(false);
    }, []);

    const handleCreateCourse = () => {
        setEditingCourse(null);
        setFormCode('');
        setFormTitle('');
        setFormDesc('');
        setFormUnit('3');
        setFormLevel('100');
        setFormSemester('First');
        if (departments.length > 0) {
            setSelectedDeptId(departments[0].id);
        }
        setShowFormModal(true);
    };

    const handleEditCourse = (course: Course) => {
        setEditingCourse(course);
        setFormCode(course.course_code);
        setFormTitle(course.title);
        setFormDesc(course.description);
        setFormUnit(String(course.credit_hours));
        setFormLevel(course.level);
        setFormSemester(course.semester === '1' || course.semester === 'First' ? 'First' : 'Second');
        
        // Find matching department ID if exists
        const matched = departments.find(d => d.name === course.department?.name);
        if (matched) {
            setSelectedDeptId(matched.id);
        } else if (departments.length > 0) {
            setSelectedDeptId(departments[0].id);
        }
        setShowFormModal(true);
    };

    const handleSaveCourse = async () => {
        if (!formCode.trim() || !formTitle.trim()) {
            Alert.alert('Validation Error', 'Course Code and Title are required.');
            return;
        }

        const payload = {
            code: formCode.trim(),
            title: formTitle.trim(),
            description: formDesc.trim(),
            unit: parseInt(formUnit) || 3,
            level: formLevel,
            semester: formSemester,
            department_id: selectedDeptId,
        };

        try {
            setSubmitting(true);
            if (editingCourse) {
                await api.put(`/courses/${editingCourse.id}`, payload);
                Alert.alert('Success', 'Course updated successfully!');
            } else {
                await api.post('/courses', payload);
                Alert.alert('Success', 'Course created successfully!');
            }
            setShowFormModal(false);
            fetchCourses();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save course.');
        } finally {
            setSubmitting(false);
        }
    };

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
                            await api.delete(`/courses/${courseId}`);
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
                        onPress={handleCreateCourse}
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
                                    <Text className="text-primary font-bold text-xs">{course.department?.faculty?.name || 'Science'}</Text>
                                </View>
                                <View className="flex-row justify-between">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Level/Semester</Text>
                                    <Text className="text-primary font-bold text-xs">
                                        {course.level}L • {course.semester === '1' || course.semester === 'First' ? '1st' : '2nd'} Semester
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
                                    onPress={() => handleEditCourse(course)}
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

            {/* Course Editor Modal */}
            <Modal
                visible={showFormModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowFormModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[40px] p-8 max-h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-primary text-xl font-black">
                                {editingCourse ? 'Edit Course' : 'Create Course'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowFormModal(false)}>
                                <X size={24} color="#002147" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Course Code</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. CSC301"
                                    value={formCode}
                                    onChangeText={setFormCode}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Course Title</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                    placeholder="e.g. System Programming"
                                    value={formTitle}
                                    onChangeText={setFormTitle}
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-1">Description</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                    placeholder="Course details and syllabus overview..."
                                    multiline
                                    numberOfLines={3}
                                    value={formDesc}
                                    onChangeText={setFormDesc}
                                />
                            </View>

                            <View className="flex-row mb-4">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-400 text-xs font-bold mb-1">Units</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="3"
                                        keyboardType="numeric"
                                        value={formUnit}
                                        onChangeText={setFormUnit}
                                    />
                                </View>
                                <View className="flex-1 ml-2">
                                    <Text className="text-gray-400 text-xs font-bold mb-1">Level</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                        placeholder="300"
                                        keyboardType="numeric"
                                        value={formLevel}
                                        onChangeText={setFormLevel}
                                    />
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-gray-400 text-xs font-bold mb-2">Semester</Text>
                                <View className="flex-row">
                                    {['First', 'Second'].map(sem => (
                                        <TouchableOpacity
                                            key={sem}
                                            onPress={() => setFormSemester(sem)}
                                            className={`flex-1 py-3 border rounded-xl mr-2 items-center ${
                                                formSemester === sem ? 'bg-primary border-primary' : 'bg-white border-gray-100'
                                            }`}
                                        >
                                            <Text className={`font-bold text-xs ${formSemester === sem ? 'text-white' : 'text-gray-400'}`}>
                                                {sem} Semester
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View className="mb-6">
                                <Text className="text-gray-400 text-xs font-bold mb-1.5">Department Assignment *</Text>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectorSearch('');
                                        setShowSelectorModal(true);
                                    }}
                                    className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 flex-row justify-between items-center"
                                >
                                    <Text className={`font-bold ${selectedDeptId ? 'text-primary' : 'text-gray-400'}`}>
                                        {departments.find(d => d.id === selectedDeptId)?.name || 'Select Department'}
                                    </Text>
                                    <ChevronDown size={18} color="#94A3B8" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={handleSaveCourse}
                                disabled={submitting}
                                className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 mt-4 mb-8"
                            >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Save size={18} color="white" />
                                        <Text className="text-white font-black text-base ml-2 uppercase">
                                            {editingCourse ? 'Save Changes' : 'Create Course Now'}
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Database Selector Modal */}
            <Modal
                visible={showSelectorModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowSelectorModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[40px] p-6 h-[70%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-primary text-xl font-black capitalize">
                                Select Department
                            </Text>
                            <TouchableOpacity onPress={() => setShowSelectorModal(false)}>
                                <X size={24} color="#002147" />
                            </TouchableOpacity>
                        </View>

                        {/* Search Box */}
                        <View className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-1.5 flex-row items-center mb-4">
                            <Search size={18} color="#94A3B8" />
                            <TextInput
                                placeholder="Search departments..."
                                className="flex-1 ml-3 text-primary font-bold text-sm"
                                value={selectorSearch}
                                onChangeText={setSelectorSearch}
                            />
                            {selectorSearch.length > 0 && (
                                <TouchableOpacity onPress={() => setSelectorSearch('')}>
                                    <X size={16} color="#94A3B8" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Items List */}
                        <FlatList
                            data={departments.filter(d => d.name.toLowerCase().includes(selectorSearch.toLowerCase()))}
                            keyExtractor={(item) => item.id.toString()}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => {
                                const isSelected = selectedDeptId === item.id;
                                return (
                                    <TouchableOpacity
                                        onPress={() => {
                                            setSelectedDeptId(item.id);
                                            setShowSelectorModal(false);
                                        }}
                                        className={`flex-row items-center justify-between p-4 mb-2 rounded-2xl border ${
                                            isSelected 
                                                ? 'bg-primary/5 border-primary/20' 
                                                : 'bg-gray-50/50 border-gray-100'
                                        }`}
                                    >
                                        <View className="flex-1">
                                            <Text className={`text-base font-bold ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                                                {item.name}
                                            </Text>
                                            {item.faculty?.name && (
                                                <Text className="text-gray-400 text-xs font-medium mt-0.5">
                                                    Faculty: {item.faculty.name}
                                                </Text>
                                            )}
                                        </View>
                                        {isSelected && <Check size={18} color="#002147" />}
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={() => (
                                <View className="py-12 items-center justify-center">
                                    <Text className="text-gray-400 font-bold text-sm">
                                        No departments found matching search.
                                    </Text>
                                </View>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
