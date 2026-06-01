import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, X, Clock, Calendar, CheckCircle, CalendarDays } from 'lucide-react-native';
import api from '../../lib/api';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

interface Question {
    id: string;
    type: 'mcq' | 'theory';
    question: string;
    marks: number;
    options?: string[];
    correct_index?: number;
}

export default function CreateExamPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [duration, setDuration] = useState('');
    const [scheduledDate, setScheduledDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [creating, setCreating] = useState(false);
    
    const showPicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: scheduledDate,
                onChange: (event, date) => {
                    if (event.type === 'set' && date) {
                        // After date is set, open time picker
                        const selectedDate = date;
                        DateTimePickerAndroid.open({
                            value: selectedDate,
                            onChange: (event, time) => {
                                if (event.type === 'set' && time) {
                                    const finalDateTime = new Date(
                                        selectedDate.getFullYear(),
                                        selectedDate.getMonth(),
                                        selectedDate.getDate(),
                                        time.getHours(),
                                        time.getMinutes()
                                    );
                                    setScheduledDate(finalDateTime);
                                }
                            },
                            mode: 'time',
                            is24Hour: true,
                        });
                    }
                },
                mode: 'date',
            });
        } else {
            setShowDatePicker(true);
        }
    };

    const addQuestion = (type: 'mcq' | 'theory') => {
        const newQuestion: Question = {
            id: Date.now().toString(),
            type,
            question: '',
            marks: 2,
            options: type === 'mcq' ? ['', '', '', ''] : undefined,
            correct_index: type === 'mcq' ? 0 : undefined,
        };
        setQuestions([...questions, newQuestion]);
    };

    const removeQuestion = (id: string) => {
        setQuestions(questions.filter(q => q.id !== id));
    };

    const updateQuestion = (id: string, field: string, value: any) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, [field]: value } : q
        ));
    };

    const updateOption = (questionId: string, optionIndex: number, value: string) => {
        setQuestions(questions.map(q => {
            if (q.id === questionId && q.options) {
                const newOptions = [...q.options];
                newOptions[optionIndex] = value;
                return { ...q, options: newOptions };
            }
            return q;
        }));
    };

    const handleCreate = async () => {
        if (!title || !courseCode || !duration || questions.length === 0) {
            Alert.alert('Missing Fields', 'Please fill in all required fields and add at least one question.');
            return;
        }

        setCreating(true);
        try {
            await api.post('/lecturer/exams', {
                title,
                course_code: courseCode,
                duration: parseInt(duration),
                scheduled_at: scheduledDate.toISOString(),
                questions,
            });

            Alert.alert('Success', 'Exam created successfully!');
            router.back();
        } catch (error: any) {
            console.error('Error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create exam. Please try again.';
            Alert.alert('Error', errorMessage);
        } finally {
            setCreating(false);
        }
    };

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-2xl font-bold">Create Exam</Text>
                        <Text className="text-gray-300 text-sm">Set up assessment</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Exam Details */}
                <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100">
                    <Text className="text-primary font-bold text-lg mb-4">Exam Details</Text>

                    <TextInput
                        value={courseCode}
                        onChangeText={setCourseCode}
                        placeholder="Course Code (e.g., CSC 401)"
                        className="bg-gray-50 p-3 rounded-xl text-gray-800 mb-3"
                    />

                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Exam Title"
                        className="bg-gray-50 p-3 rounded-xl text-gray-800 mb-3"
                    />

                    <View className="flex-row space-x-3">
                        <View className="flex-1">
                            <TextInput
                                value={duration}
                                onChangeText={setDuration}
                                placeholder="Duration (mins)"
                                keyboardType="numeric"
                                className="bg-gray-50 p-3 rounded-xl text-gray-800"
                            />
                        </View>
                        <TouchableOpacity 
                            onPress={showPicker}
                            className="flex-1 bg-gray-50 p-3 rounded-xl flex-row items-center justify-between"
                        >
                            <Text className={scheduledDate ? "text-gray-800" : "text-gray-400"}>
                                {scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <CalendarDays size={18} color="#64748B" />
                        </TouchableOpacity>

                        {Platform.OS === 'ios' && showDatePicker && (
                            <DateTimePicker
                                value={scheduledDate}
                                mode="datetime"
                                is24Hour={true}
                                display="spinner"
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) {
                                        setScheduledDate(selectedDate);
                                    }
                                }}
                            />
                        )}
                    </View>

                    <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100">
                        <Text className="text-gray-500">Total Questions: {questions.length}</Text>
                        <Text className="text-gray-500">Total Marks: {totalMarks}</Text>
                    </View>
                </View>

                {/* Add Question Buttons */}
                <View className="mb-4">
                    <TouchableOpacity
                        onPress={() => addQuestion('mcq')}
                        className="w-full bg-blue-50 py-3.5 rounded-2xl items-center flex-row justify-center border border-blue-100"
                    >
                        <Plus size={18} color="#3B82F6" />
                        <Text className="text-blue-600 font-bold ml-2">Add MCQ Question</Text>
                    </TouchableOpacity>
                </View>

                {/* Questions List */}
                {questions.map((q, index) => (
                    <View key={q.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-primary font-bold">Question {index + 1} ({q.type.toUpperCase()})</Text>
                            <TouchableOpacity onPress={() => removeQuestion(q.id)}>
                                <X size={20} color="#EF4444" />
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            value={q.question}
                            onChangeText={(text) => updateQuestion(q.id, 'question', text)}
                            placeholder="Enter question"
                            multiline
                            className="bg-gray-50 p-3 rounded-xl text-gray-800 mb-3"
                        />

                        {q.type === 'mcq' && q.options && (
                            <View className="mb-3">
                                <Text className="text-gray-500 text-xs uppercase mb-2">Options (Select the correct one)</Text>
                                {q.options.map((option, i) => (
                                    <View key={i} className="flex-row items-center mb-2">
                                        <TextInput
                                            value={option}
                                            onChangeText={(text) => updateOption(q.id, i, text)}
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            className="bg-gray-50 p-3 rounded-xl text-gray-800 flex-1 mr-2"
                                        />
                                        <TouchableOpacity 
                                            onPress={() => updateQuestion(q.id, 'correct_index', i)}
                                            className={`p-2 rounded-full ${q.correct_index === i ? 'bg-green-500' : 'bg-gray-100'}`}
                                        >
                                            <CheckCircle size={20} color={q.correct_index === i ? '#FFFFFF' : '#94A3B8'} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        <TextInput
                            value={q.marks.toString()}
                            onChangeText={(text) => updateQuestion(q.id, 'marks', parseInt(text) || 0)}
                            placeholder="Marks"
                            keyboardType="numeric"
                            className="bg-gray-50 p-3 rounded-xl text-gray-800 w-24"
                        />
                    </View>
                ))}

                {/* Create Button */}
                <TouchableOpacity
                    onPress={handleCreate}
                    disabled={creating}
                    className={`py-4 rounded-3xl items-center mb-8 ${creating ? 'bg-gray-300' : 'bg-primary'
                        }`}
                >
                    <Text className="text-white font-bold text-lg">
                        {creating ? 'Creating...' : 'Create Exam'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
