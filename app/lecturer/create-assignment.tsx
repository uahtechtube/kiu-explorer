import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ArrowLeft, Book, Calendar, CheckSquare, Save, HelpCircle } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

export default function CreateAssignment() {
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [form, setForm] = useState({
        course_id: '',
        title: '',
        description: '',
        instructions: '',
        due_date: '',
        max_score: '100',
        allow_late_submission: true
    });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/courses/allocated');
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const handleSave = async () => {
        if (!form.course_id || !form.title || !form.due_date) {
            Alert.alert('Missing Fields', 'Please fill in all required fields marked with *');
            return;
        }

        setIsSaving(true);
        try {
            await api.post('/assignments', form);
            Alert.alert(
                'Success',
                'Assignment created and students notified.',
                [{ text: 'View List', onPress: () => router.push('/lecturer/assignments' as any) }]
            );
        } catch (error) {
            console.error('Save error:', error);
            Alert.alert('Error', 'Failed to create assignment. Please check your inputs.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <View className="flex-1 bg-white items-center justify-center p-10"><ActivityIndicator size="large" color="#002147" /></View>;
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-50">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                        <ArrowLeft size={20} color="#002147" />
                    </TouchableOpacity>
                    <Text className="text-primary font-bold text-lg">New Assignment</Text>
                    <TouchableOpacity className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
                        <HelpCircle size={20} color="#64748B" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}>
                    {/* Course Selection */}
                    <Text className="text-primary font-bold text-base mb-3">Target Course*</Text>
                    <View className="mb-6 flex-row flex-wrap">
                        {courses.map((course) => (
                            <TouchableOpacity
                                key={course.id}
                                onPress={() => setForm({ ...form, course_id: course.id })}
                                className={`mr-2 mb-2 px-4 py-2 rounded-xl border ${form.course_id === course.id
                                        ? 'bg-primary border-primary'
                                        : 'bg-white border-gray-200'
                                    }`}
                            >
                                <Text className={`text-xs font-bold ${form.course_id === course.id ? 'text-white' : 'text-gray-500'}`}>
                                    {course.code}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Title */}
                    <Text className="text-primary font-bold text-base mb-3">Assignment Title*</Text>
                    <PremiumCard variant="solid" className="bg-gray-50/50 p-4 mb-6">
                        <TextInput
                            placeholder="e.g. Mid-term Project: Algorithm Design"
                            className="text-primary text-base"
                            value={form.title}
                            onChangeText={(val) => setForm({ ...form, title: val })}
                        />
                    </PremiumCard>

                    {/* Description */}
                    <Text className="text-primary font-bold text-base mb-3">General Description</Text>
                    <PremiumCard variant="solid" className="bg-gray-50/50 p-4 mb-6">
                        <TextInput
                            placeholder="Explain the background of this assignment..."
                            className="text-primary text-base min-h-[100px]"
                            multiline
                            textAlignVertical="top"
                            value={form.description}
                            onChangeText={(val) => setForm({ ...form, description: val })}
                        />
                    </PremiumCard>

                    {/* Settings Grid */}
                    <View className="flex-row mb-6">
                        <View className="flex-1 mr-2">
                            <Text className="text-primary font-bold text-base mb-3">Max Score*</Text>
                            <PremiumCard variant="solid" className="bg-gray-50/50 p-4">
                                <TextInput
                                    placeholder="100"
                                    keyboardType="numeric"
                                    className="text-primary text-base font-bold"
                                    value={form.max_score}
                                    onChangeText={(val) => setForm({ ...form, max_score: val })}
                                />
                            </PremiumCard>
                        </View>
                        <View className="flex-1 ml-2">
                            <Text className="text-primary font-bold text-base mb-3">Due Date*</Text>
                            <PremiumCard variant="solid" className="bg-gray-50/50 p-4">
                                <TextInput
                                    placeholder="2026-02-15"
                                    className="text-primary text-base"
                                    value={form.due_date}
                                    onChangeText={(val) => setForm({ ...form, due_date: val })}
                                />
                            </PremiumCard>
                        </View>
                    </View>

                    {/* Additional Options */}
                    <TouchableOpacity
                        onPress={() => setForm({ ...form, allow_late_submission: !form.allow_late_submission })}
                        className="flex-row items-center bg-gray-50/50 p-4 rounded-2xl border border-gray-100"
                    >
                        <View className={`w-6 h-6 rounded-md items-center justify-center mr-3 ${form.allow_late_submission ? 'bg-primary' : 'bg-gray-200'}`}>
                            <CheckSquare size={16} color="white" />
                        </View>
                        <Text className="text-primary font-medium">Allow Late Submissions</Text>
                    </TouchableOpacity>

                </ScrollView>

                {/* Action Bar */}
                <View className="p-6 border-t border-gray-50">
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={isSaving}
                        className={`h-16 rounded-[24px] items-center justify-center flex-row shadow-xl ${isSaving ? 'bg-gray-200' : 'bg-primary'}`}
                    >
                        {isSaving ? <ActivityIndicator color="white" /> : <Save size={20} color="white" className="mr-2" />}
                        <Text className="text-white text-lg font-black ml-2">Publish Assignment</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
