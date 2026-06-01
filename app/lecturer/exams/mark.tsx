import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ChevronLeft, Check, Award, FileText, User } from 'lucide-react-native';
import api from '../../../lib/api';

interface TheoryResponse {
    id: number;
    exam_attempt_id: number;
    question_id: number;
    theory_answer: string | null;
    marks_obtained: number;
    question: {
        id: number;
        question_text: string;
        marks: number;
    };
}

interface Attempt {
    id: number;
    user: {
        id: number;
        surname: string;
        first_name: string;
        matric_number: string;
    };
    score: number;
    status: string;
    theory_responses: TheoryResponse[];
}

export default function MarkTheoryExamScreen() {
    const { examId } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [selectedAttempt, setSelectedAttempt] = useState<Attempt | null>(null);
    
    // Grades input state: key is question_id, value is string score
    const [grades, setGrades] = useState<{ [key: number]: string }>({});
    const [submitting, setSubmitting] = useState(false);

    const fetchAttempts = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/lecturer/exams/${examId}/attempts-to-mark`);
            const data = response.data || [];
            
            // Only keep attempts that have theory questions
            const filtered = data.filter((att: Attempt) => att.theory_responses && att.theory_responses.length > 0);
            setAttempts(filtered);
            if (filtered.length > 0) {
                setSelectedAttempt(filtered[0]);
            }
        } catch (error) {
            console.error('Error fetching attempts to mark:', error);
            Alert.alert('Error', 'Failed to retrieve submitted attempts.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (examId) {
            fetchAttempts();
        }
    }, [examId]);

    useEffect(() => {
        if (selectedAttempt) {
            // Initialize grades input
            const initialGrades: { [key: number]: string } = {};
            selectedAttempt.theory_responses.forEach(resp => {
                initialGrades[resp.question_id] = String(resp.marks_obtained || '0');
            });
            setGrades(initialGrades);
        }
    }, [selectedAttempt]);

    const handleGradeChange = (questionId: number, text: string) => {
        // Sanitize input to digits only
        const sanitized = text.replace(/[^0-9]/g, '');
        setGrades(prev => ({
            ...prev,
            [questionId]: sanitized
        }));
    };

    const handleSaveGrades = async () => {
        if (!selectedAttempt) return;

        // Validation
        const gradesArray = [];
        for (const resp of selectedAttempt.theory_responses) {
            const marksAwarded = parseInt(grades[resp.question_id] || '0', 10);
            const maxMarks = resp.question.marks;

            if (isNaN(marksAwarded) || marksAwarded < 0) {
                Alert.alert('Invalid Grade', `Grade for question must be a positive number.`);
                return;
            }

            if (marksAwarded > maxMarks) {
                Alert.alert('Invalid Grade', `Grade awarded (${marksAwarded}) cannot exceed maximum marks (${maxMarks}).`);
                return;
            }

            gradesArray.push({
                question_id: resp.question_id,
                marks_obtained: marksAwarded
            });
        }

        setSubmitting(true);
        try {
            await api.post(`/lecturer/exams/attempts/${selectedAttempt.id}/grade`, {
                grades: gradesArray
            });

            Alert.alert('Grades Saved', 'Student responses successfully graded.', [
                {
                    text: 'OK',
                    onPress: () => {
                        // Refresh and pick next pending attempt if exists
                        const currentIndex = attempts.findIndex(a => a.id === selectedAttempt.id);
                        if (currentIndex !== -1 && currentIndex + 1 < attempts.length) {
                            setSelectedAttempt(attempts[currentIndex + 1]);
                        } else {
                            fetchAttempts();
                        }
                    }
                }
            ]);
        } catch (error) {
            console.error('Save grades failed:', error);
            Alert.alert('Error', 'Failed to save student grades.');
        } finally {
            setSubmitting(false);
        }
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
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Lecturer</Text>
                        <Text className="text-white text-xl font-bold">Theory Marking</Text>
                    </View>
                    <View className="w-12" />
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#002147" className="mt-20" />
            ) : attempts.length === 0 ? (
                <View className="items-center py-20 bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm m-6 mt-10">
                    <FileText size={48} color="#94A3B8" strokeWidth={1.5} />
                    <Text className="text-primary font-bold mt-4 text-base">All Marked!</Text>
                    <Text className="text-gray-400 text-xs text-center mt-2 px-6">
                        There are no pending student theory responses waiting to be graded for this exam.
                    </Text>
                </View>
            ) : (
                <View className="flex-1 flex-row">
                    {/* Left sidebar listing students (large screen or list modal on small) */}
                    <View className="w-[30%] bg-white border-r border-gray-100 p-4">
                        <Text className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-4">Pending List</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {attempts.map((att) => {
                                const isSelected = selectedAttempt?.id === att.id;
                                return (
                                    <TouchableOpacity
                                        key={att.id}
                                        onPress={() => setSelectedAttempt(att)}
                                        className={`p-3.5 rounded-2xl mb-3 border ${isSelected ? 'bg-primary/5 border-primary/20' : 'bg-gray-50 border-gray-100'}`}
                                    >
                                        <Text className={`font-bold text-xs ${isSelected ? 'text-primary' : 'text-gray-600'}`}>
                                            {att.user.surname} {att.user.first_name.charAt(0)}.
                                        </Text>
                                        <Text className="text-gray-400 text-[9px] mt-1">{att.user.matric_number}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    {/* Right area displaying student answers */}
                    <View className="flex-1 p-6">
                        {selectedAttempt && (
                            <View className="flex-1">
                                <View className="flex-row items-center bg-white p-4 rounded-3xl border border-gray-100 mb-6">
                                    <View className="w-10 h-10 bg-primary/5 rounded-full items-center justify-center mr-3 border border-primary/10">
                                        <User size={18} color="#002147" />
                                    </View>
                                    <View>
                                        <Text className="text-primary font-black text-sm">{selectedAttempt.user.surname} {selectedAttempt.user.first_name}</Text>
                                        <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mt-0.5">{selectedAttempt.user.matric_number}</Text>
                                    </View>
                                </View>

                                <ScrollView showsVerticalScrollIndicator={false} className="flex-1 space-y-6" contentContainerStyle={{ paddingBottom: 100 }}>
                                    {selectedAttempt.theory_responses.map((resp, index) => (
                                        <View key={resp.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                            <View className="flex-row justify-between mb-3">
                                                <Text className="text-primary font-black text-xs uppercase tracking-wider">Question {index + 1}</Text>
                                                <Text className="text-gray-400 text-xs font-bold">Max Marks: {resp.question.marks}</Text>
                                            </View>
                                            <Text className="text-primary font-bold text-sm mb-4 leading-5">{resp.question.question_text}</Text>

                                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-2">Student Answer:</Text>
                                            <View className="bg-gray-50 rounded-2xl p-4 border border-gray-100 mb-4 min-h-[80px]">
                                                <Text className="text-primary/80 text-xs font-medium leading-5">
                                                    {resp.theory_answer || 'No answer submitted.'}
                                                </Text>
                                            </View>

                                            <View className="flex-row items-center justify-between mt-2">
                                                <Text className="text-primary font-bold text-xs">Award Marks:</Text>
                                                <View className="flex-row items-center">
                                                    <TextInput
                                                        value={grades[resp.question_id] || ''}
                                                        onChangeText={(text) => handleGradeChange(resp.question_id, text)}
                                                        placeholder="0"
                                                        keyboardType="number-pad"
                                                        className="w-16 h-11 bg-gray-50 border border-gray-200 rounded-xl px-2 text-center text-primary font-black text-sm"
                                                    />
                                                    <Text className="text-gray-400 text-xs font-bold ml-2">/ {resp.question.marks}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>

                                {/* Save Button */}
                                <TouchableOpacity
                                    onPress={handleSaveGrades}
                                    disabled={submitting}
                                    className={`absolute bottom-4 left-0 right-0 py-4.5 rounded-2xl items-center justify-center flex-row shadow-lg ${submitting ? 'bg-gray-300' : 'bg-primary shadow-primary/20'}`}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Text className="text-white font-black text-sm uppercase tracking-widest">Save Student Grades</Text>
                                            <Check size={16} color="white" className="ml-3" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

// Inline helper X icon
const X = () => (
    <View className="w-5 h-5 items-center justify-center">
        <Text className="text-primary font-black text-xs">✕</Text>
    </View>
);
