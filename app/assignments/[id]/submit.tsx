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
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
    ArrowLeft,
    FileUp,
    FileText,
    X,
    Send,
    AlertCircle,
    CheckCircle2,
    Trash2
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

export default function AssignmentSubmission() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [assignment, setAssignment] = useState<any>(null);
    const [submissionText, setSubmissionText] = useState('');
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const response = await api.get(`/assignments/${id}`);
                setAssignment(response.data);
            } catch (error) {
                console.error('Error fetching assignment:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handlePickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled) {
                setSelectedFile(result.assets[0]);
            }
        } catch (err) {
            console.error('Pick document error:', err);
        }
    };

    const handleSubmit = async () => {
        if (!submissionText && !selectedFile) {
            Alert.alert('Empty Submission', 'Please provide a file or write some text for your submission.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            if (submissionText) {
                formData.append('submission_text', submissionText);
            }

            if (selectedFile) {
                // @ts-ignore - FormData needs this specific shape for files in React Native
                formData.append('file', {
                    uri: selectedFile.uri,
                    name: selectedFile.name,
                    type: selectedFile.mimeType || 'application/octet-stream',
                });
            }

            await api.post(`/assignments/${id}/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            Alert.alert(
                'Success',
                'Your assignment has been submitted successfully!',
                [{ text: 'Great!', onPress: () => router.push(`/assignments/${id}`) }]
            );
        } catch (error: any) {
            console.error('Submission error:', error);
            const message = error.response?.data?.message || 'Failed to submit assignment. Please try again.';
            Alert.alert('Submission Failed', message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || !assignment) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                {/* Header */}
                <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-50">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-full bg-gray-50 items-center justify-center"
                    >
                        <ArrowLeft size={20} color="#002147" />
                    </TouchableOpacity>
                    <Text className="text-primary font-bold text-lg">Turn In Assignment</Text>
                    <View className="w-10" />
                </View>

                <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}>
                    {/* Assignment Quick Ref */}
                    <View className="mb-8">
                        <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Submitting for</Text>
                        <Text className="text-primary text-2xl font-bold">{assignment.title}</Text>
                    </View>

                    {/* Submission Text Area */}
                    <View className="mb-8">
                        <Text className="text-primary font-bold text-lg mb-4">Submission Text (Optional)</Text>
                        <View className="bg-gray-50/80 rounded-[24px] p-4 border border-gray-100">
                            <TextInput
                                placeholder="Write your comments or submission text here..."
                                className="text-gray-700 text-base min-h-[150px] text-left align-top"
                                multiline
                                textAlignVertical="top"
                                value={submissionText}
                                onChangeText={setSubmissionText}
                            />
                        </View>
                    </View>

                    {/* File Upload Area */}
                    <View className="mb-8">
                        <Text className="text-primary font-bold text-lg mb-4">Attach Files</Text>

                        {!selectedFile ? (
                            <TouchableOpacity
                                onPress={handlePickDocument}
                                activeOpacity={0.7}
                                className="border-2 border-dashed border-gray-200 rounded-[32px] p-10 items-center justify-center bg-gray-50/30"
                            >
                                <View className="bg-primary/5 p-5 rounded-full mb-4">
                                    <FileUp size={32} color="#002147" />
                                </View>
                                <Text className="text-primary font-bold text-lg">Choose document</Text>
                                <Text className="text-gray-400 text-sm mt-1">PDF, DOCX, ZIP or Images (Max 10MB)</Text>
                            </TouchableOpacity>
                        ) : (
                            <PremiumCard variant="elevated" className="bg-primary/5 border-primary/10 p-5">
                                <View className="flex-row items-center">
                                    <View className="bg-primary p-3 rounded-2xl mr-4 shadow-lg shadow-primary/20">
                                        <FileText size={24} color="white" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary font-bold text-base" numberOfLines={1}>
                                            {selectedFile.name}
                                        </Text>
                                        <Text className="text-gray-400 text-xs">
                                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • File ready
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => setSelectedFile(null)}
                                        className="w-10 h-10 bg-rose-50 rounded-full items-center justify-center border border-rose-100"
                                    >
                                        <Trash2 size={18} color="#E11D48" />
                                    </TouchableOpacity>
                                </View>
                            </PremiumCard>
                        )}
                    </View>

                    {/* Safety Tips */}
                    <View className="bg-amber-50/50 p-6 rounded-[24px] border border-amber-100/50 flex-row items-start">
                        <AlertCircle size={20} color="#D97706" className="mr-3" />
                        <View className="flex-1">
                            <Text className="text-amber-900 font-bold mb-1">Wait!</Text>
                            <Text className="text-amber-700/80 text-xs leading-5">
                                Ensure you have included all parts of your assignment. Once submitted, you may not be able to edit it depending on the lecturer's settings.
                            </Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Submit Button */}
                <View className="p-6 bg-white border-t border-gray-50">
                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        className={`h-16 rounded-[24px] items-center justify-center flex-row shadow-xl ${isSubmitting ? 'bg-gray-200' : 'bg-primary'
                            }`}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="white" className="mr-2" />
                        ) : (
                            <Send size={20} color="white" className="mr-2" />
                        )}
                        <Text className="text-white text-lg font-black">
                            {isSubmitting ? 'Uploading...' : 'Confirm Submission'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
