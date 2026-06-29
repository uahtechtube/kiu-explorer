import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, Trash2, Edit, Award, BookOpen, BarChart2, TrendingUp } from 'lucide-react-native';
import api from '../../../lib/api';

interface GpaEntry {
    id: number;
    semester: string;
    course_code: string;
    course_title?: string;
    credit_units: number;
    grade: string;
    grade_points: number;
}

interface SemesterSummary {
    semester: string;
    gpa: number;
    credit_units: number;
    quality_points: number;
    courses_count: number;
}

interface GpaSummary {
    cgpa: number;
    total_credits: number;
    total_quality_points: number;
    classification: string;
    semesters: SemesterSummary[];
}

const SEMESTERS = [
    'Year 1 Sem 1', 'Year 1 Sem 2',
    'Year 2 Sem 1', 'Year 2 Sem 2',
    'Year 3 Sem 1', 'Year 3 Sem 2',
    'Year 4 Sem 1', 'Year 4 Sem 2'
];

const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'];
const CREDIT_OPTIONS = [1, 2, 3, 4, 5, 6];

export default function GpaCalculatorScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedSemester, setSelectedSemester] = useState(SEMESTERS[0]);
    
    // Data states
    const [gpaEntries, setGpaEntries] = useState<Record<string, GpaEntry[]>>({});
    const [summary, setSummary] = useState<GpaSummary | null>(null);

    // Form Modal states
    const [modalVisible, setModalVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    
    const [courseCode, setCourseCode] = useState('');
    const [courseTitle, setCourseTitle] = useState('');
    const [creditUnits, setCreditUnits] = useState(3);
    const [grade, setGrade] = useState('A');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [entriesRes, summaryRes] = await Promise.all([
                api.get('/student/gpa'),
                api.get('/student/gpa/summary')
            ]);
            setGpaEntries(entriesRes.data || {});
            setSummary(summaryRes.data || null);
        } catch (error) {
            console.error('Error fetching GPA data:', error);
            Alert.alert('Error', 'Failed to load GPA data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const handleOpenAddModal = () => {
        setIsEditing(false);
        setEditingId(null);
        setCourseCode('');
        setCourseTitle('');
        setCreditUnits(3);
        setGrade('A');
        setModalVisible(true);
    };

    const handleOpenEditModal = (entry: GpaEntry) => {
        setIsEditing(true);
        setEditingId(entry.id);
        setCourseCode(entry.course_code);
        setCourseTitle(entry.course_title || '');
        setCreditUnits(entry.credit_units);
        setGrade(entry.grade);
        setModalVisible(true);
    };

    const handleSaveCourse = async () => {
        if (!courseCode.trim()) {
            Alert.alert('Validation Error', 'Please enter a course code.');
            return;
        }

        const payload = {
            semester: selectedSemester,
            course_code: courseCode.trim().toUpperCase(),
            course_title: courseTitle.trim() || null,
            credit_units: creditUnits,
            grade: grade
        };

        try {
            if (isEditing && editingId) {
                await api.put(`/student/gpa/${editingId}`, payload);
            } else {
                await api.post('/student/gpa', payload);
            }
            setModalVisible(false);
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save course result.');
        }
    };

    const handleDeleteCourse = (id: number) => {
        Alert.alert(
            'Delete Course',
            'Are you sure you want to delete this course result?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/student/gpa/${id}`);
                            fetchData();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete course.');
                        }
                    }
                }
            ]
        );
    };

    const getSemesterSummary = (semName: string): SemesterSummary => {
        const matching = summary?.semesters?.find(s => s.semester === semName);
        return matching || { semester: semName, gpa: 0, credit_units: 0, quality_points: 0, courses_count: 0 };
    };

    const currentSemesterSummary = getSemesterSummary(selectedSemester);
    const activeEntries = gpaEntries[selectedSemester] || [];

    const getClassificationColor = (classification: string) => {
        if (classification.includes('First Class')) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
        if (classification.includes('Second Class')) return 'text-blue-500 bg-blue-50 border-blue-200';
        if (classification.includes('Third Class')) return 'text-amber-500 bg-amber-50 border-amber-200';
        return 'text-red-500 bg-red-50 border-red-200';
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Header */}
            <View className="bg-primary px-6 pt-6 pb-8 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Academic</Text>
                        <Text className="text-white text-xl font-bold">GPA Calculator</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleOpenAddModal}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-md shadow-secondary/10"
                    >
                        <Plus size={22} color="#002147" />
                    </TouchableOpacity>
                </View>

                {/* CGPA Display Card */}
                {summary && (
                    <View className="bg-white rounded-[28px] mt-6 p-5 shadow-xl flex-row items-center justify-between border border-gray-100">
                        <View className="flex-1 mr-3">
                            <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Cumulative GPA</Text>
                            <Text className="text-primary text-3xl font-black mt-1">{(summary.cgpa || 0.00).toFixed(2)}</Text>
                            <View className={`self-start mt-2 px-2.5 py-1 rounded-xl border ${getClassificationColor(summary.classification)}`}>
                                <Text className="text-[10px] font-bold uppercase tracking-wide">{summary.classification}</Text>
                            </View>
                        </View>
                        <View className="items-end">
                            <TouchableOpacity
                                onPress={() => router.push('/school/gpa-calculator/what-if')}
                                className="bg-primary px-4 py-3 rounded-2xl flex-row items-center shadow-sm"
                            >
                                <TrendingUp size={16} color="white" className="mr-1.5" />
                                <Text className="text-white font-bold text-xs">"What If" Sim</Text>
                            </TouchableOpacity>
                            <View className="mt-3 flex-row space-x-2">
                                <View className="items-center bg-gray-50 border border-gray-100 px-2 py-1 rounded-xl">
                                    <Text className="text-gray-400 text-[8px] font-bold uppercase">Credits</Text>
                                    <Text className="text-primary text-[10px] font-extrabold">{summary.total_credits}</Text>
                                </View>
                                <View className="items-center bg-gray-50 border border-gray-100 px-2 py-1 rounded-xl ml-1">
                                    <Text className="text-gray-400 text-[8px] font-bold uppercase">Points</Text>
                                    <Text className="text-primary text-[10px] font-extrabold">{summary.total_quality_points}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </View>

            {/* Semester Selection Horizontal Slider */}
            <View className="py-4">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                >
                    {SEMESTERS.map((sem) => {
                        const isSelected = selectedSemester === sem;
                        const hasData = (gpaEntries[sem]?.length || 0) > 0;
                        return (
                            <TouchableOpacity
                                key={sem}
                                onPress={() => setSelectedSemester(sem)}
                                className={`mr-2.5 px-5 py-3 rounded-2xl border ${isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                            >
                                <View className="flex-row items-center">
                                    <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-primary/75'}`}>
                                        {sem}
                                    </Text>
                                    {hasData && (
                                        <View className={`w-1.5 h-1.5 rounded-full ml-1.5 ${isSelected ? 'bg-secondary' : 'bg-emerald-500'}`} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Main Content Area */}
            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !summary ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : (
                    <>
                        {/* Semester GPA Stats */}
                        <View className="bg-white rounded-[32px] p-5 border border-gray-100 shadow-sm flex-row justify-around mb-6">
                            <View className="items-center flex-1 border-r border-gray-100">
                                <Text className="text-gray-400 text-[9px] font-bold uppercase tracking-wider mb-1">Semester GPA</Text>
                                <Text className="text-primary text-xl font-extrabold">{(currentSemesterSummary.gpa || 0.00).toFixed(2)}</Text>
                            </View>
                            <View className="items-center flex-1 border-r border-gray-100">
                                <Text className="text-gray-400 text-[9px] font-bold uppercase tracking-wider mb-1">Credits Done</Text>
                                <Text className="text-primary text-xl font-extrabold">{currentSemesterSummary.credit_units}</Text>
                            </View>
                            <View className="items-center flex-1">
                                <Text className="text-gray-400 text-[9px] font-bold uppercase tracking-wider mb-1">Quality Points</Text>
                                <Text className="text-primary text-xl font-extrabold">{currentSemesterSummary.quality_points}</Text>
                            </View>
                        </View>

                        {/* Course List Header */}
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-primary text-base font-bold">Results</Text>
                            <TouchableOpacity onPress={handleOpenAddModal} className="flex-row items-center">
                                <Plus size={14} color="#002147" />
                                <Text className="text-primary text-xs font-bold ml-1">Add Course</Text>
                            </TouchableOpacity>
                        </View>

                        {/* List of Courses */}
                        {activeEntries.length === 0 ? (
                            <View className="items-center py-16 bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm">
                                <BookOpen size={44} color="#94A3B8" strokeWidth={1.5} />
                                <Text className="text-primary font-bold mt-4 text-sm">No Results Recorded</Text>
                                <Text className="text-gray-400 text-xs text-center mt-2 px-6">
                                    Tap the '+' button to log courses and grades completed in {selectedSemester}.
                                </Text>
                            </View>
                        ) : (
                            activeEntries.map((entry) => (
                                <View key={entry.id} className="bg-white rounded-[28px] p-4.5 mb-3.5 border border-gray-100 shadow-sm flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <View className="w-11 h-11 bg-primary/5 rounded-xl border border-primary/10 items-center justify-center mr-3">
                                            <Text className="text-primary font-bold text-xs">{entry.grade}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-primary font-bold text-sm" numberOfLines={1}>{entry.course_code}</Text>
                                            <Text className="text-gray-400 text-[10px]" numberOfLines={1}>
                                                {entry.course_title || 'No Course Title'} • {entry.credit_units} Cr
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row space-x-2 items-center">
                                        <TouchableOpacity
                                            onPress={() => handleOpenEditModal(entry)}
                                            className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl"
                                        >
                                            <Edit size={12} color="#002147" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteCourse(entry.id)}
                                            className="p-2.5 bg-red-50 border border-red-100 rounded-xl ml-1.5"
                                        >
                                            <Trash2 size={12} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        )}
                    </>
                )}
            </ScrollView>

            {/* Add/Edit Course Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[40px] p-6 pb-10 shadow-2xl">
                        <View className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                        <Text className="text-primary font-black text-center text-xs uppercase tracking-widest mb-6">
                            {isEditing ? 'Edit Course Result' : `Add Result to ${selectedSemester}`}
                        </Text>

                        {/* Course Code Input */}
                        <Text className="text-primary font-bold text-xs mb-2">Course Code</Text>
                        <TextInput
                            value={courseCode}
                            onChangeText={setCourseCode}
                            placeholder="e.g. MTH101"
                            autoCapitalize="characters"
                            className="bg-gray-50 text-primary border border-gray-150 rounded-2xl px-4 h-12 text-sm font-semibold mb-4"
                        />

                        {/* Course Title Input */}
                        <Text className="text-primary font-bold text-xs mb-2">Course Title (Optional)</Text>
                        <TextInput
                            value={courseTitle}
                            onChangeText={setCourseTitle}
                            placeholder="e.g. Calculus & Algebra"
                            className="bg-gray-50 text-primary border border-gray-150 rounded-2xl px-4 h-12 text-sm font-semibold mb-4"
                        />

                        {/* Credit Units Choice */}
                        <Text className="text-primary font-bold text-xs mb-2">Credit Units</Text>
                        <View className="flex-row justify-between mb-4">
                            {CREDIT_OPTIONS.map((num) => {
                                const selected = creditUnits === num;
                                return (
                                    <TouchableOpacity
                                        key={num}
                                        onPress={() => setCreditUnits(num)}
                                        className={`w-[14%] aspect-square rounded-xl border items-center justify-center ${selected ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-250'}`}
                                    >
                                        <Text className={`font-bold text-xs ${selected ? 'text-white' : 'text-primary'}`}>{num}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Grade Choice */}
                        <Text className="text-primary font-bold text-xs mb-2">Grade Received</Text>
                        <View className="flex-row justify-between mb-6">
                            {GRADES.map((letter) => {
                                const selected = grade === letter;
                                return (
                                    <TouchableOpacity
                                        key={letter}
                                        onPress={() => setGrade(letter)}
                                        className={`w-[14%] aspect-square rounded-xl border items-center justify-center ${selected ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-250'}`}
                                    >
                                        <Text className={`font-bold text-xs ${selected ? 'text-white' : 'text-primary'}`}>{letter}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Action Buttons */}
                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="flex-1 bg-gray-100 rounded-2xl py-4.5 items-center justify-center border border-gray-200"
                            >
                                <Text className="text-gray-700 font-bold text-sm">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSaveCourse}
                                className="flex-1 bg-primary rounded-2xl py-4.5 items-center justify-center shadow-lg shadow-primary/20"
                            >
                                <Text className="text-white font-bold text-sm">Save Result</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
