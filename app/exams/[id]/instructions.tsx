import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Clock, FileText, AlertCircle, CheckSquare, ChevronLeft } from 'lucide-react-native';
import api from '../../../lib/api';

interface ExamDetails {
    id: number;
    title: string;
    course_code: string;
    type: string;
    duration: number;
    total_questions: number;
    total_marks: number;
    instructions: string[];
    scheduled_at: string;
    can_start: boolean;
}

export default function ExamInstructionsPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [examDetails, setExamDetails] = useState<ExamDetails | null>(null);
    const [agreed, setAgreed] = useState(false);

    useEffect(() => {
        fetchExamDetails();
    }, [id]);

    const fetchExamDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/exams/${id}`);
            setExamDetails(response.data);
        } catch (error) {
            console.error('Error fetching exam details:', error);
            Alert.alert('Error', 'Failed to load exam details.');
            setExamDetails(null);
        } finally {
            setLoading(false);
        }
    };

    const handleStartExam = () => {
        if (!agreed) {
            Alert.alert('Agreement Required', 'Please accept the terms and conditions to start the exam');
            return;
        }

        if (!examDetails?.can_start) {
            Alert.alert('Not Available', 'This exam is not yet available to start');
            return;
        }

        Alert.alert(
            'Start Exam',
            'Once you start, the timer will begin and you cannot pause. Are you ready?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start Now',
                    style: 'default',
                    onPress: () => router.push(`/exams/${id}/take`),
                },
            ]
        );
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <Text className="text-gray-500 text-lg">Loading exam details...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white text-2xl font-bold">Exam Instructions</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Exam Info Card */}
                <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
                    <Text className="text-primary text-2xl font-bold mb-2">{examDetails?.title}</Text>
                    <Text className="text-gray-500 text-base mb-4">{examDetails?.course_code}</Text>

                    <View className="bg-blue-50 p-4 rounded-2xl">
                        <Text className="text-blue-900 font-bold text-sm mb-2">{examDetails?.type}</Text>
                        <View className="flex-row flex-wrap">
                            <View className="w-1/2 mb-2">
                                <Text className="text-blue-600 text-xs">Duration</Text>
                                <Text className="text-blue-900 font-bold">{examDetails?.duration} minutes</Text>
                            </View>
                            <View className="w-1/2 mb-2">
                                <Text className="text-blue-600 text-xs">Questions</Text>
                                <Text className="text-blue-900 font-bold">{examDetails?.total_questions}</Text>
                            </View>
                            <View className="w-1/2">
                                <Text className="text-blue-600 text-xs">Total Marks</Text>
                                <Text className="text-blue-900 font-bold">{examDetails?.total_marks}</Text>
                            </View>
                            <View className="w-1/2">
                                <Text className="text-blue-600 text-xs">Pass Mark</Text>
                                <Text className="text-blue-900 font-bold">
                                    {examDetails ? Math.floor(examDetails.total_marks * 0.5) : 0}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Important Notice */}
                <View className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-5 mb-6">
                    <View className="flex-row items-center mb-3">
                        <AlertCircle size={24} color="#F59E0B" />
                        <Text className="text-amber-900 font-bold text-lg ml-2">Important Notice</Text>
                    </View>
                    <Text className="text-amber-800 text-sm leading-6">
                        Once you start this exam, the timer will begin immediately and cannot be paused. Make
                        sure you are in a quiet environment with a stable internet connection before
                        proceeding.
                    </Text>
                </View>

                {/* Instructions */}
                <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-gray-100">
                    <View className="flex-row items-center mb-4">
                        <FileText size={24} color="#002147" />
                        <Text className="text-primary font-bold text-xl ml-2">Instructions</Text>
                    </View>

                    {examDetails?.instructions.map((instruction, index) => (
                        <View key={index} className="flex-row mb-3">
                            <View className="w-6 h-6 bg-blue-100 rounded-full items-center justify-center mr-3 mt-0.5">
                                <Text className="text-blue-600 font-bold text-xs">{index + 1}</Text>
                            </View>
                            <Text className="flex-1 text-gray-700 text-sm leading-6">{instruction}</Text>
                        </View>
                    ))}
                </View>

                {/* Terms Agreement */}
                <TouchableOpacity
                    onPress={() => setAgreed(!agreed)}
                    className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-gray-100 flex-row items-center"
                >
                    <View
                        className={`w-6 h-6 rounded-lg border-2 items-center justify-center mr-3 ${agreed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                            }`}
                    >
                        {agreed && <CheckSquare size={20} color="#FFFFFF" />}
                    </View>
                    <Text className="flex-1 text-gray-700 text-sm">
                        I have read and understood all the instructions and agree to the exam terms and
                        conditions
                    </Text>
                </TouchableOpacity>

                {/* Start Button */}
                <TouchableOpacity
                    onPress={handleStartExam}
                    disabled={!agreed || !examDetails?.can_start}
                    className={`py-4 rounded-3xl items-center mb-8 ${agreed && examDetails?.can_start ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                >
                    <Text className="text-white font-bold text-lg">
                        {examDetails?.can_start ? 'Start Exam' : 'Exam Not Available'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
