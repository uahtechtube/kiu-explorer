import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Trophy, CheckCircle, XCircle, Clock, FileText, Download, ChevronLeft, Share2, AlertCircle } from 'lucide-react-native';
import api from '../../../lib/api';
// @ts-ignore
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { useAuth } from '../../../context/AuthContext';

interface ExamResult {
    id: number;
    title: string;
    course_code: string;
    total_marks: number;
    obtained_marks: number;
    percentage: number;
    grade: string;
    status: 'pass' | 'fail';
    submitted_at: string;
    time_taken: number;
    questions: Array<{
        id: number;
        question_number: number;
        question_text: string;
        type: 'mcq' | 'theory';
        marks: number;
        obtained_marks: number;
        user_answer: string;
        correct_answer?: string;
        is_correct?: boolean;
    }>;
}

export default function ExamResultsPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [result, setResult] = useState<ExamResult | null>(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        fetchResults();
    }, [id]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/exams/attempts/${id}/results`);
            setResult(response.data);
        } catch (error) {
            console.error('Error fetching results:', error);
            // Mock data for development
            setResult({
                id: Number(id),
                title: 'Web Development Midterm',
                course_code: 'CSC 401',
                total_marks: 100,
                obtained_marks: 85,
                percentage: 85,
                grade: 'A',
                status: 'pass',
                submitted_at: '2026-01-13T16:30:00',
                time_taken: 105,
                questions: [
                    {
                        id: 1,
                        question_number: 1,
                        question_text: 'What does HTML stand for?',
                        type: 'mcq',
                        marks: 2,
                        obtained_marks: 2,
                        user_answer: 'Hyper Text Markup Language',
                        correct_answer: 'Hyper Text Markup Language',
                        is_correct: true,
                    },
                    {
                        id: 2,
                        question_number: 2,
                        question_text: 'Which CSS property is used to change the text color?',
                        type: 'mcq',
                        marks: 2,
                        obtained_marks: 0,
                        user_answer: 'text-color',
                        correct_answer: 'color',
                        is_correct: false,
                    },
                    {
                        id: 3,
                        question_number: 3,
                        question_text: 'Explain the difference between var, let, and const in JavaScript.',
                        type: 'theory',
                        marks: 10,
                        obtained_marks: 8,
                        user_answer: 'var is function-scoped, let and const are block-scoped...',
                    },
                ],
            });
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'TBA';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'TBA';

        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    const handleDownload = async () => {
        try {
            if (!result) return;
            
            const summary = `
KIU EXPLORER - EXAM RESULT REPORT
--------------------------------
EXAM DETAILS
Course: ${result.course_code}
Exam Title: ${result.title}
Student Name: ${user?.name || 'N/A'}
Reg No: ${user?.reg_no || 'N/A'}

PERFORMANCE SUMMARY
Total Marks: ${result.total_marks}
Obtained Marks: ${result.obtained_marks}
Percentage: ${result.percentage}%
Grade: ${result.grade}
Status: ${result.status.toUpperCase()}

ATTEMPT DETAILS
Submitted At: ${formatDate(result.submitted_at)}
Time Taken: ${formatDuration(result.time_taken)}

--------------------------------
Generated via KIU Explorer
            `;
            
            const filename = `Exam_Result_${result.course_code.replace(/\s+/g, '_')}.txt`;
            const fileUri = FileSystem.cacheDirectory + filename;
            
            await FileSystem.writeAsStringAsync(fileUri, summary);
            
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                Alert.alert('Error', 'Sharing is not available on this device.');
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Error', 'Failed to generate result report.');
        }
    };

    const getGradeColor = (grade: string) => {
        switch (grade) {
            case 'A':
                return '#10B981';
            case 'B':
                return '#3B82F6';
            case 'C':
                return '#F59E0B';
            case 'D':
                return '#EF4444';
            case 'F':
                return '#991B1B';
            default:
                return '#6B7280';
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
                <Text className="text-gray-500 mt-4">Loading results...</Text>
            </SafeAreaView>
        );
    }

    if (!result) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <Text className="text-gray-500 text-lg">Results not found</Text>
            </SafeAreaView>
        );
    }

    const correctAnswers = result.questions.filter((q) => q.is_correct).length;
    const totalQuestions = result.questions.length;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white text-2xl font-bold">Exam Results</Text>
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                        <Share2 size={20} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Score Card */}
                <View className="bg-white rounded-3xl p-6 mb-6 shadow-lg border border-gray-100">
                    <View className="items-center mb-6">
                        <View
                            className="w-32 h-32 rounded-full items-center justify-center mb-4"
                            style={{ backgroundColor: `${getGradeColor(result.grade)}15` }}
                        >
                            <Text
                                className="text-6xl font-bold"
                                style={{ color: getGradeColor(result.grade) }}
                            >
                                {result.grade}
                            </Text>
                        </View>

                        <Text className="text-primary text-2xl font-bold mb-1">{result.percentage}%</Text>
                        <Text className="text-gray-500 text-base">
                            {result.obtained_marks} / {result.total_marks} marks
                        </Text>

                        <View
                            className={`mt-4 px-6 py-2 rounded-full ${result.status === 'pass' ? 'bg-green-100' : 'bg-red-100'
                                }`}
                        >
                            <Text
                                className={`font-bold ${result.status === 'pass' ? 'text-green-600' : 'text-red-600'
                                    }`}
                            >
                                {result.status === 'pass' ? '✓ PASSED' : '✗ FAILED'}
                            </Text>
                        </View>
                    </View>

                    <View className="border-t border-gray-200 pt-4">
                        <Text className="text-primary font-bold text-lg mb-3">{result.title}</Text>
                        <Text className="text-gray-500 text-sm mb-4">{result.course_code}</Text>

                        <View className="flex-row flex-wrap">
                            <View className="w-1/2 mb-3">
                                <Text className="text-gray-500 text-xs mb-1">Submitted</Text>
                                <Text className="text-gray-700 text-sm font-semibold">
                                    {formatDate(result.submitted_at)}
                                </Text>
                            </View>
                            <View className="w-1/2 mb-3">
                                <Text className="text-gray-500 text-xs mb-1">Time Taken</Text>
                                <Text className="text-gray-700 text-sm font-semibold">
                                    {formatDuration(result.time_taken)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Statistics */}
                <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
                    <Text className="text-primary font-bold text-lg mb-4">Performance Summary</Text>

                    <View className="flex-row items-center mb-4">
                        <View className="flex-1">
                            <Text className="text-gray-500 text-sm mb-2">Correct Answers</Text>
                            <View className="bg-gray-200 h-3 rounded-full overflow-hidden">
                                <View
                                    className="bg-green-500 h-full"
                                    style={{ width: `${(correctAnswers / totalQuestions) * 100}%` }}
                                />
                            </View>
                        </View>
                        <Text className="text-green-600 font-bold ml-4">
                            {correctAnswers}/{totalQuestions}
                        </Text>
                    </View>

                    <View className="flex-row justify-between pt-4 border-t border-gray-100">
                        <View className="items-center">
                            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
                                <CheckCircle size={24} color="#10B981" />
                            </View>
                            <Text className="text-gray-500 text-xs">Correct</Text>
                            <Text className="text-primary font-bold">{correctAnswers}</Text>
                        </View>

                        <View className="items-center">
                            <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center mb-2">
                                <XCircle size={24} color="#EF4444" />
                            </View>
                            <Text className="text-gray-500 text-xs">Incorrect</Text>
                            <Text className="text-primary font-bold">{totalQuestions - correctAnswers}</Text>
                        </View>

                        <View className="items-center">
                            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
                                <FileText size={24} color="#3B82F6" />
                            </View>
                            <Text className="text-gray-500 text-xs">Total</Text>
                            <Text className="text-primary font-bold">{totalQuestions}</Text>
                        </View>
                    </View>
                </View>

                {/* View Details Button */}
                <TouchableOpacity
                    onPress={() => setShowDetails(!showDetails)}
                    className="bg-primary py-4 rounded-3xl items-center mb-6"
                >
                    <Text className="text-white font-bold">
                        {showDetails ? 'Hide' : 'View'} Question-by-Question Review
                    </Text>
                </TouchableOpacity>

                {/* Question Details */}
                {showDetails && (
                    <View className="mb-6">
                        <Text className="text-primary font-bold text-lg mb-4">Detailed Review</Text>

                        {result.questions.map((question, index) => (
                            <View
                                key={`${question.id}-${index}`}
                                className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
                            >
                                {/* Question Header */}
                                <View className="flex-row items-center justify-between mb-3">
                                    <Text className="text-gray-500 text-sm">Question {question.question_number}</Text>
                                    <View className="flex-row items-center">
                                        {question.is_correct !== undefined && (
                                            question.is_correct ? (
                                                <CheckCircle size={20} color="#10B981" />
                                            ) : (
                                                <XCircle size={20} color="#EF4444" />
                                            )
                                        )}
                                        <Text className="text-gray-600 text-sm ml-2">
                                            {question.obtained_marks}/{question.marks} marks
                                        </Text>
                                    </View>
                                </View>

                                {/* Question Text */}
                                <Text className="text-primary font-semibold mb-3">{question.question_text}</Text>

                                {/* User Answer */}
                                <View className="bg-gray-50 p-3 rounded-2xl mb-2">
                                    <Text className="text-gray-500 text-xs mb-1">Your Answer:</Text>
                                    <Text className="text-gray-800">{question.user_answer || 'Not answered'}</Text>
                                </View>

                                {/* Correct Answer (for MCQ) */}
                                {question.type === 'mcq' && question.correct_answer && !question.is_correct && (
                                    <View className="bg-green-50 p-3 rounded-2xl">
                                        <Text className="text-green-600 text-xs mb-1">Correct Answer:</Text>
                                        <Text className="text-green-800 font-semibold">{question.correct_answer}</Text>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Action Buttons */}
                <View className="flex-row space-x-3 mb-8">
                    <TouchableOpacity 
                        onPress={handleDownload}
                        className="flex-1 bg-gray-100 py-4 rounded-3xl items-center flex-row justify-center"
                    >
                        <Download size={20} color="#002147" />
                        <Text className="text-primary font-bold ml-2">Download</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push('/exams')}
                        className="flex-1 bg-primary py-4 rounded-3xl items-center"
                    >
                        <Text className="text-white font-bold">Back to Exams</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
