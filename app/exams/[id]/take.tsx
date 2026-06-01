import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Clock, ChevronLeft, ChevronRight, Flag, AlertCircle } from 'lucide-react-native';
import api from '../../../lib/api';

interface Question {
    id: number;
    question_number: number;
    question_text: string;
    type: 'objective' | 'theory' | 'fill_in_blank' | 'true_false' | 'mcq';
    marks: number;
    options?: Array<{ id: number, option_text: string }>;
    answer?: string;
}

export default function TakeExamPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [examTitle, setExamTitle] = useState('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: any }>({});
    const [attemptId, setAttemptId] = useState<number | null>(null);
    const [timeRemaining, setTimeRemaining] = useState(7200); // 120 minutes in seconds
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showQuestionNav, setShowQuestionNav] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        fetchExamQuestions();
        startTimer();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [id]);

    const fetchExamQuestions = async () => {
        try {
            setLoading(true);
            const response = await api.post(`/exams/${id}/start`);
            setExamTitle(response.data.exam.title);
            setQuestions(response.data.questions || []);
            setAttemptId(response.data.attempt_id);

            // Calculate remaining time from expires_at
            const expiresAt = new Date(response.data.expires_at).getTime();
            const now = new Date().getTime();
            setTimeRemaining(Math.max(0, Math.floor((expiresAt - now) / 1000)));
        } catch (error) {
            console.error('Error fetching questions:', error);
            Alert.alert('Error', 'Failed to load exam questions.');
            setQuestions([]);
        } finally {
            setLoading(false);
        }
    };

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 1) {
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId: number, answer: any) => {
        setAnswers({ ...answers, [questionId]: answer });
        // Auto-save answer
        saveAnswer(questionId, answer);
    };

    const saveAnswer = async (questionId: number, answer: any) => {
        try {
            await api.post(`/student/exams/${id}/save-answer`, {
                attempt_id: attemptId,
                question_id: questionId,
                selected_option_id: answer?.id || null,
                answer_text: typeof answer === 'string' ? answer : null,
            });
        } catch (error) {
            console.error('Error saving answer:', error);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleSubmit = () => {
        const unanswered = questions.filter((q) => !answers[q.id]);
        if (unanswered.length > 0) {
            Alert.alert(
                'Unanswered Questions',
                `You have ${unanswered.length} unanswered question(s). Do you want to submit anyway?`,
                [
                    { text: 'Review', style: 'cancel' },
                    { text: 'Submit', style: 'destructive', onPress: () => setShowSubmitModal(true) },
                ]
            );
        } else {
            setShowSubmitModal(true);
        }
    };

    const handleAutoSubmit = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        Alert.alert('Time Up!', 'Your exam has been automatically submitted.');
        await submitExam(true);
    };

    const submitExam = async (isAuto = false) => {
        if (!attemptId) return;

        try {
            const formattedResponses = questions.map(q => {
                const answer = answers[q.id];
                return {
                    question_id: q.id,
                    selected_option_id: (q.type === 'objective' || q.type === 'mcq' || q.type === 'true_false') ? (answer?.id || answer) : null,
                    answer_text: q.type === 'fill_in_blank' ? answer : null,
                };
            });

            const endpoint = isAuto ? `/exams/attempts/${attemptId}/force-submit` : `/exams/attempts/${attemptId}/submit`;
            const response = await api.post(endpoint, { responses: formattedResponses });

            setShowSubmitModal(false);
            Alert.alert('Success', 'Your exam has been submitted successfully!', [
                {
                    text: 'View Results',
                    onPress: () => router.replace(`/exams/results/${attemptId}`),
                },
            ]);
        } catch (error) {
            console.error('Error submitting exam:', error);
            Alert.alert('Error', 'Failed to submit exam. Please try again.');
        }
    };

    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = Object.keys(answers).length;
    const progress = (answeredCount / questions.length) * 100;

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <Text className="text-gray-500 text-lg">Loading exam...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Fixed Header */}
            <View className="bg-primary px-6 py-4">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-white font-bold text-lg flex-1" numberOfLines={1}>
                        {examTitle}
                    </Text>
                    <View
                        className={`px-4 py-2 rounded-full ${timeRemaining < 600 ? 'bg-red-500' : 'bg-white/20'
                            }`}
                    >
                        <View className="flex-row items-center">
                            <Clock size={16} color="#FFFFFF" />
                            <Text className="text-white font-bold ml-2">{formatTime(timeRemaining)}</Text>
                        </View>
                    </View>
                </View>

                {/* Progress Bar */}
                <View className="bg-white/20 h-2 rounded-full overflow-hidden">
                    <View className="bg-secondary h-full" style={{ width: `${progress}%` }} />
                </View>
                <Text className="text-gray-300 text-xs mt-1">
                    {answeredCount} of {questions.length} answered
                </Text>
            </View>

            {/* Question Content */}
            <ScrollView className="flex-1 px-6 pt-6">
                {currentQuestion && (
                    <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
                        {/* Question Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-gray-500 text-sm">
                                Question {currentQuestion.question_number} of {questions.length}
                            </Text>
                            <View className="bg-blue-100 px-3 py-1 rounded-full">
                                <Text className="text-blue-600 font-bold text-xs">
                                    {currentQuestion.marks} {currentQuestion.marks === 1 ? 'mark' : 'marks'}
                                </Text>
                            </View>
                        </View>

                        {/* Question Text */}
                        <Text className="text-primary text-lg font-semibold mb-6 leading-7">
                            {currentQuestion.question_text}
                        </Text>

                        {/* MCQ Options */}
                        {(currentQuestion.type === 'mcq' || currentQuestion.type === 'objective') && currentQuestion.options && (
                            <View>
                                {currentQuestion.options.map((option, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => handleAnswerChange(currentQuestion.id, option)}
                                        className={`p-4 rounded-2xl mb-3 border-2 ${answers[currentQuestion.id]?.id === option.id
                                            ? 'bg-blue-50 border-blue-500'
                                            : 'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <View className="flex-row items-center">
                                            <View
                                                className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-3 ${answers[currentQuestion.id]?.id === option.id
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'border-gray-300'
                                                    }`}
                                            >
                                                {answers[currentQuestion.id]?.id === option.id && (
                                                    <View className="w-3 h-3 bg-white rounded-full" />
                                                )}
                                            </View>
                                            <Text
                                                className={`flex-1 ${answers[currentQuestion.id]?.id === option.id
                                                    ? 'text-blue-900 font-semibold'
                                                    : 'text-gray-700'
                                                    }`}
                                            >
                                                {option.option_text}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}

                        {/* Theory Answer */}
                        {currentQuestion.type === 'theory' && (
                            <TextInput
                                value={answers[currentQuestion.id] || ''}
                                onChangeText={(text) => handleAnswerChange(currentQuestion.id, text)}
                                placeholder="Type your answer here..."
                                multiline
                                numberOfLines={10}
                                textAlignVertical="top"
                                className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-gray-800 min-h-[200px]"
                            />
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Navigation Footer */}
            <View className="bg-white px-6 py-4 border-t border-gray-200">
                <View className="flex-row items-center justify-between mb-3">
                    <TouchableOpacity
                        onPress={handlePrevious}
                        disabled={currentQuestionIndex === 0}
                        className={`flex-row items-center px-4 py-3 rounded-2xl ${currentQuestionIndex === 0 ? 'bg-gray-200' : 'bg-gray-700'
                            }`}
                    >
                        <ChevronLeft size={20} color={currentQuestionIndex === 0 ? '#9CA3AF' : '#FFFFFF'} />
                        <Text
                            className={`font-semibold ml-1 ${currentQuestionIndex === 0 ? 'text-gray-400' : 'text-white'
                                }`}
                        >
                            Previous
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setShowQuestionNav(true)}
                        className="bg-blue-100 px-4 py-3 rounded-2xl"
                    >
                        <Text className="text-blue-600 font-semibold">Questions</Text>
                    </TouchableOpacity>

                    {currentQuestionIndex === questions.length - 1 ? (
                        <TouchableOpacity
                            onPress={handleSubmit}
                            className="flex-row items-center px-4 py-3 rounded-2xl bg-green-500"
                        >
                            <Flag size={20} color="#FFFFFF" />
                            <Text className="text-white font-semibold ml-1">Submit</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={handleNext}
                            className="flex-row items-center px-4 py-3 rounded-2xl bg-gray-700"
                        >
                            <Text className="text-white font-semibold mr-1">Next</Text>
                            <ChevronRight size={20} color="#FFFFFF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Question Navigation Modal */}
            <Modal visible={showQuestionNav} animationType="slide" transparent>
                <View className="flex-1 bg-black/50">
                    <View className="flex-1 mt-20 bg-white rounded-t-3xl">
                        <View className="px-6 py-4 border-b border-gray-200 flex-row items-center justify-between">
                            <Text className="text-primary text-xl font-bold">All Questions</Text>
                            <TouchableOpacity onPress={() => setShowQuestionNav(false)}>
                                <Text className="text-blue-500 font-semibold">Close</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-6 py-4">
                            <View className="flex-row flex-wrap">
                                {questions.map((q, index) => (
                                    <TouchableOpacity
                                        key={`nav-${q.id}-${index}`}
                                        onPress={() => {
                                            setCurrentQuestionIndex(index);
                                            setShowQuestionNav(false);
                                        }}
                                        className={`w-[23%] aspect-square m-1 rounded-2xl items-center justify-center ${answers[q.id]
                                            ? 'bg-green-500'
                                            : index === currentQuestionIndex
                                                ? 'bg-blue-500'
                                                : 'bg-gray-200'
                                            }`}
                                    >
                                        <Text
                                            className={`font-bold ${answers[q.id] || index === currentQuestionIndex
                                                ? 'text-white'
                                                : 'text-gray-600'
                                                }`}
                                        >
                                            {q.question_number}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View className="mt-6 bg-gray-50 p-4 rounded-2xl">
                                <View className="flex-row items-center mb-2">
                                    <View className="w-6 h-6 bg-green-500 rounded-lg mr-2" />
                                    <Text className="text-gray-700">Answered</Text>
                                </View>
                                <View className="flex-row items-center mb-2">
                                    <View className="w-6 h-6 bg-blue-500 rounded-lg mr-2" />
                                    <Text className="text-gray-700">Current</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="w-6 h-6 bg-gray-200 rounded-lg mr-2" />
                                    <Text className="text-gray-700">Not Answered</Text>
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Submit Confirmation Modal */}
            <Modal visible={showSubmitModal} animationType="fade" transparent>
                <View className="flex-1 bg-black/50 items-center justify-center px-6">
                    <View className="bg-white rounded-3xl p-6 w-full max-w-sm">
                        <View className="items-center mb-4">
                            <View className="w-16 h-16 bg-amber-100 rounded-full items-center justify-center mb-3">
                                <AlertCircle size={32} color="#F59E0B" />
                            </View>
                            <Text className="text-primary text-xl font-bold mb-2">Submit Exam?</Text>
                            <Text className="text-gray-600 text-center">
                                Are you sure you want to submit? You cannot change your answers after submission.
                            </Text>
                        </View>

                        <View className="bg-gray-50 p-4 rounded-2xl mb-4">
                            <Text className="text-gray-700 text-sm">
                                Answered: {answeredCount} / {questions.length}
                            </Text>
                            <Text className="text-gray-700 text-sm mt-1">
                                Time Remaining: {formatTime(timeRemaining)}
                            </Text>
                        </View>

                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => setShowSubmitModal(false)}
                                className="flex-1 bg-gray-200 py-3 rounded-2xl items-center"
                            >
                                <Text className="text-gray-700 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => submitExam(false)}
                                className="flex-1 bg-green-500 py-3 rounded-2xl items-center"
                            >
                                <Text className="text-white font-bold">Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
