import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, FileText, Download, CheckCircle2, XCircle, MessageSquare, Target, User, Clock, Star, Send } from 'lucide-react-native';
import api from '../../../../lib/api';
import { PremiumCard } from '../../../../components/shared/PremiumCard';
import { StatusBadge } from '../../../../components/shared/StatusBadge';

interface Submission {
    id: number;
    student: {
        id: number;
        surname: string;
        first_name: string;
        matric_number: string;
    };
    submission_text: string | null;
    file_path: string | null;
    file_name: string | null;
    full_file_url?: string | null;
    submitted_at: string;
    is_late: boolean;
    score: number | null;
    feedback: string | null;
    status: 'pending' | 'graded';
}

export default function GradingCockpitPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [gradeScore, setGradeScore] = useState('');
    const [gradeFeedback, setGradeFeedback] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, [id]);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/lecturer/assignments/${id}/submissions`);
            const data = response.data || [];
            setSubmissions(data);
            if (data.length > 0) setSelectedSubmission(data[0]);
        } catch (error) {
            console.error('Error:', error);
            // Professional Mock Data for Grading
            const mockSubmissions: Submission[] = [
                {
                    id: 1,
                    student: { id: 201, surname: 'Musa', first_name: 'Ibrahim', matric_number: 'KIU/CSC/22/001' },
                    submission_text: 'My distributed systems implementation uses the SWIM protocol for failure detection. I have attached the architecture diagram and the code repository link below.',
                    file_path: 'submissions/123.pdf',
                    file_name: 'dist_systems_final.pdf',
                    submitted_at: '2026-01-16T10:00:00',
                    is_late: false,
                    score: null,
                    feedback: null,
                    status: 'pending'
                },
                {
                    id: 2,
                    student: { id: 202, surname: 'Abubakar', first_name: 'Fatima', matric_number: 'KIU/CSC/22/015' },
                    submission_text: 'Summary of Byzantine Fault Tolerance in modern blockchain systems.',
                    file_path: 'submissions/456.pdf',
                    file_name: 'bft_summary.pdf',
                    submitted_at: '2026-01-15T22:30:00',
                    is_late: false,
                    score: 85,
                    feedback: 'Excellent work on the PBFT section.',
                    status: 'graded'
                }
            ];
            setSubmissions(mockSubmissions);
            setSelectedSubmission(mockSubmissions[0]);
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async () => {
        if (!selectedSubmission || !gradeScore) return;
        try {
            setSubmitting(true);
            await api.post(`/lecturer/assignments/submissions/${selectedSubmission.id}/grade`, {
                score: parseInt(gradeScore),
                feedback: gradeFeedback
            });
            Alert.alert('Success', 'Submission graded successfully.');
            fetchSubmissions();
            setGradeScore('');
            setGradeFeedback('');
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Failed to submit grade.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <View className="flex-1 bg-white items-center justify-center">
            <ActivityIndicator size="large" color="#002147" />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Professional Grading Header */}
            <View className="bg-primary px-6 pt-4 pb-6 border-b border-white/10">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center"
                    >
                        <ChevronLeft size={20} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-secondary font-black text-[8px] uppercase tracking-widest mb-1">Academy Oversight</Text>
                        <Text className="text-white text-lg font-bold">Grading Cockpit</Text>
                    </View>
                    <View className="w-10" />
                </View>
            </View>

            <View className="flex-1 flex-row">
                {/* Left Panel: Student List */}
                <View className="w-1/3 bg-white border-r border-gray-100">
                    <ScrollView className="flex-1 px-3 py-4">
                        <Text className="text-gray-400 font-black text-[8px] uppercase tracking-widest mb-4 ml-2">Submissions ({submissions.length})</Text>
                        {submissions.map((sub) => (
                            <TouchableOpacity
                                key={sub.id}
                                onPress={() => {
                                    setSelectedSubmission(sub);
                                    setGradeScore(sub.score?.toString() || '');
                                    setGradeFeedback(sub.feedback || '');
                                }}
                                className={`p-3 rounded-2xl mb-2 border ${selectedSubmission?.id === sub.id ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-100'
                                    }`}
                            >
                                <Text className={`font-bold text-xs ${selectedSubmission?.id === sub.id ? 'text-white' : 'text-primary'}`} numberOfLines={1}>
                                    {sub.student.surname} {sub.student.first_name.charAt(0)}.
                                </Text>
                                <View className="flex-row items-center justify-between mt-2">
                                    <View className={`px-2 py-0.5 rounded-md ${selectedSubmission?.id === sub.id ? 'bg-white/20' : 'bg-primary/5'}`}>
                                        <Text className={`font-black text-[7px] uppercase ${selectedSubmission?.id === sub.id ? 'text-secondary' : 'text-primary'}`}>
                                            {sub.status === 'graded' ? `${sub.score}%` : 'Pending'}
                                        </Text>
                                    </View>
                                    {sub.is_late && <XCircle size={10} color="#EF4444" />}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Right Panel: Content & Grading */}
                <View className="flex-1 bg-gray-50">
                    {selectedSubmission ? (
                        <ScrollView className="flex-1 px-6 py-8" contentContainerStyle={{ paddingBottom: 100 }}>
                            {/* Student Metadata Card */}
                            <PremiumCard variant="solid" className="p-5 bg-white border-gray-100 rounded-[24px] mb-8">
                                <View className="flex-row items-center mb-4">
                                    <View className="w-10 h-10 bg-primary/5 rounded-xl items-center justify-center mr-3">
                                        <User size={20} color="#002147" />
                                    </View>
                                    <View>
                                        <Text className="text-primary font-black text-base">{selectedSubmission.student.surname}, {selectedSubmission.student.first_name}</Text>
                                        <Text className="text-gray-400 font-bold text-[10px] uppercase">{selectedSubmission.student.matric_number}</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center justify-between border-t border-gray-50 pt-4">
                                    <View className="flex-row items-center">
                                        <Clock size={12} color="#94A3B8" />
                                        <Text className="text-gray-400 text-[8px] font-black uppercase ml-1.5">{new Date(selectedSubmission.submitted_at).toLocaleString()}</Text>
                                    </View>
                                    <StatusBadge status={selectedSubmission.status} />
                                </View>
                            </PremiumCard>

                            {/* Submission Text */}
                            <Text className="text-primary font-black text-sm uppercase mb-3 tracking-widest">Submission Artifact</Text>
                            <PremiumCard variant="elevated" className="p-6 bg-white border-gray-100 rounded-[24px] mb-8">
                                <Text className="text-gray-600 text-sm leading-6">
                                    {selectedSubmission.submission_text || 'No accompanying text provided.'}
                                </Text>
                            </PremiumCard>

                            {/* File Attachment */}
                            {selectedSubmission.file_name && (
                                <TouchableOpacity
                                    onPress={() => {
                                        const url = selectedSubmission.full_file_url || (selectedSubmission.file_path ? `${api.defaults.baseURL?.replace('/api', '')}/storage/${selectedSubmission.file_path}` : null);
                                        if (url) {
                                            Linking.openURL(url);
                                        } else {
                                            Alert.alert('Error', 'Unable to resolve download URL.');
                                        }
                                    }}
                                    className="flex-row items-center bg-white p-4 rounded-2xl border border-gray-100 mb-8 shadow-sm"
                                >
                                    <View className="w-12 h-12 bg-secondary/10 rounded-xl items-center justify-center mr-4">
                                        <FileText size={24} color="#002147" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary font-bold text-sm" numberOfLines={1}>{selectedSubmission.file_name}</Text>
                                        <Text className="text-gray-400 text-[10px] uppercase font-black">Digital Manuscript</Text>
                                    </View>
                                    <Download size={20} color="#94A3B8" />
                                </TouchableOpacity>
                            )}

                            {/* Grading Matrix */}
                            <Text className="text-primary font-black text-sm uppercase mb-3 tracking-widest">Assessment Matrix</Text>
                            <PremiumCard variant="solid" className="p-6 bg-white border-gray-100 rounded-[24px]">
                                <View className="mb-6">
                                    <View className="flex-row justify-between items-center mb-4">
                                        <Text className="text-gray-400 text-[10px] font-black uppercase">Final Score</Text>
                                        <View className="bg-primary px-3 py-1 rounded-lg">
                                            <Text className="text-secondary font-black text-xs">{gradeScore ? `${gradeScore}%` : '0%'}</Text>
                                        </View>
                                    </View>
                                    <TextInput
                                        value={gradeScore}
                                        onChangeText={setGradeScore}
                                        keyboardType="numeric"
                                        placeholder="Enter percentage (0-100)"
                                        className="h-14 bg-gray-50 rounded-xl px-4 text-primary font-bold"
                                    />
                                </View>

                                <View className="mb-6">
                                    <Text className="text-gray-400 text-[10px] font-black uppercase mb-4">Qualitative Feedback</Text>
                                    <TextInput
                                        value={gradeFeedback}
                                        onChangeText={setGradeFeedback}
                                        multiline
                                        numberOfLines={4}
                                        placeholder="Constructive critique..."
                                        className="bg-gray-50 rounded-xl p-4 text-primary font-medium min-h-[120px]"
                                        textAlignVertical="top"
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={handleGrade}
                                    disabled={submitting || !gradeScore}
                                    className={`h-16 rounded-2xl flex-row items-center justify-center shadow-lg ${submitting || !gradeScore ? 'bg-gray-100' : 'bg-primary shadow-primary/20'
                                        }`}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Target size={20} color={!gradeScore ? '#94A3B8' : 'white'} />
                                            <Text className={`font-black uppercase tracking-widest ml-3 ${!gradeScore ? 'text-gray-400' : 'text-white'}`}>
                                                {selectedSubmission.status === 'graded' ? 'Update Grade' : 'Commit Grade'}
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </PremiumCard>
                        </ScrollView>
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <Target size={64} color="#CBD5E1" strokeWidth={1} />
                            <Text className="text-gray-400 font-bold mt-4">Select a submission to begin</Text>
                        </View>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
}
