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
    ActivityIndicator,
    Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ArrowLeft, User, FileText, Download, CheckCircle2, MessageSquare, Award } from 'lucide-react-native';
import api from '../../../../../lib/api';
import { PremiumCard } from '../../../../../components/shared/PremiumCard';

export default function GradeSubmission() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [submission, setSubmission] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Grading State
    const [grade, setGrade] = useState({
        score: '',
        feedback: ''
    });

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get(`/submissions/${id}`);
                setSubmission(response.data);
                if (response.data.status === 'graded') {
                    setGrade({
                        score: response.data.score.toString(),
                        feedback: response.data.feedback || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching submission detail:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleSaveGrade = async () => {
        const scoreNum = parseFloat(grade.score);
        if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > (submission.assignment?.max_score || 100)) {
            Alert.alert('Invalid Score', `Please enter a valid score between 0 and ${submission.assignment?.max_score || 100}`);
            return;
        }

        setIsSaving(true);
        try {
            await api.post(`/submissions/${id}/grade`, {
                score: grade.score,
                feedback: grade.feedback
            });
            Alert.alert(
                'Success',
                'Grade successfully published to student.',
                [{ text: 'Back to List', onPress: () => router.back() }]
            );
        } catch (error) {
            console.error('Grading error:', error);
            Alert.alert('Error', 'Failed to publish grade. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || !submission) {
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
                    <Text className="text-primary font-bold text-lg">Grade Submission</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}>
                    {/* Student Info */}
                    <View className="flex-row items-center mb-8">
                        <View className="w-16 h-16 bg-primary/5 rounded-[24px] items-center justify-center mr-4">
                            <User size={32} color="#002147" />
                        </View>
                        <View>
                            <Text className="text-primary text-xl font-bold">{submission.student?.name}</Text>
                            <Text className="text-gray-400 text-sm">Reg: {submission.student?.registration_number || submission.student?.matric_number || 'N/A'}</Text>
                        </View>
                    </View>

                    {/* Submission content */}
                    <View className="mb-10">
                        <Text className="text-primary font-bold text-lg mb-4">Student's Work</Text>

                        {submission.submission_text && (
                            <PremiumCard variant="solid" className="bg-gray-50 p-6 mb-4">
                                <Text className="text-gray-700 leading-6 text-base">{submission.submission_text}</Text>
                            </PremiumCard>
                        )}

                        {submission.file_path && (
                            <TouchableOpacity
                                onPress={() => submission.full_file_url && Linking.openURL(submission.full_file_url)}
                                className="flex-row items-center bg-blue-50/30 p-4 rounded-2xl border border-blue-100"
                            >
                                <View className="bg-blue-100 p-3 rounded-xl mr-4">
                                    <FileText size={20} color="#2563EB" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-blue-900 font-bold text-base" numberOfLines={1}>
                                        {submission.file_name || 'Submitted_Work.pdf'}
                                    </Text>
                                    <Text className="text-blue-600/60 text-xs">Download to Review</Text>
                                </View>
                                <Download size={20} color="#2563EB" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Grading Form */}
                    <View>
                        <Text className="text-primary font-bold text-lg mb-4">Assessment</Text>

                        <View className="flex-row items-center mb-6">
                            <View className="flex-1 mr-4">
                                <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">Assign Score</Text>
                                <PremiumCard variant="elevated" className="p-0 border-primary/20 bg-primary/5">
                                    <TextInput
                                        placeholder="0"
                                        keyboardType="numeric"
                                        className="text-primary text-3xl font-black p-5 text-center"
                                        value={grade.score}
                                        onChangeText={(val) => setGrade({ ...grade, score: val })}
                                    />
                                </PremiumCard>
                            </View>
                            <View className="justify-center pt-6">
                                <Text className="text-gray-400 text-2xl font-bold">/ {submission.assignment?.max_score || 100}</Text>
                            </View>
                        </View>

                        <Text className="text-gray-400 text-[10px] font-bold uppercase mb-2">Feedback & Comments</Text>
                        <PremiumCard variant="solid" className="bg-gray-50 p-5">
                            <TextInput
                                placeholder="Write constructive feedback for the student..."
                                className="text-primary text-base min-h-[120px]"
                                multiline
                                textAlignVertical="top"
                                value={grade.feedback}
                                onChangeText={(val) => setGrade({ ...grade, feedback: val })}
                            />
                        </PremiumCard>
                    </View>
                </ScrollView>

                {/* Submit Grade Button */}
                <View className="absolute bottom-10 left-6 right-6">
                    <TouchableOpacity
                        onPress={handleSaveGrade}
                        disabled={isSaving}
                        className={`h-16 rounded-[24px] items-center justify-center flex-row shadow-xl ${isSaving ? 'bg-gray-200' : 'bg-primary'}`}
                    >
                        {isSaving ? <ActivityIndicator color="white" /> : <Award size={20} color="#FFD700" className="mr-2" />}
                        <Text className="text-white text-lg font-black ml-2">Publish Result</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
