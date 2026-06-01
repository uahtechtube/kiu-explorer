import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Plus, FileText, Trash2, CheckCircle, AlertCircle, Clock, UploadCloud, Eye } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

interface StudentDocument {
    id: number;
    student_id: number;
    document_type: 'admission_letter' | 'birth_certificate' | 'olevel_result' | 'id_card' | 'passport' | 'other';
    file_name: string;
    file_path: string;
    file_size: number;
    is_verified: boolean | null;
    verified_at?: string;
    verification_notes?: string;
    verifier?: {
        surname: string;
        first_name: string;
    };
    created_at: string;
}

const DOCUMENT_TYPES = [
    { value: 'admission_letter', label: 'Admission Letter' },
    { value: 'birth_certificate', label: 'Birth Certificate' },
    { value: 'olevel_result', label: 'O-Level Result (WAEC/NECO)' },
    { value: 'id_card', label: 'Student ID Card' },
    { value: 'passport', label: 'Passport Photograph' },
    { value: 'other', label: 'Other Credentials' },
];

export default function StudentDocumentsScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [documents, setDocuments] = useState<StudentDocument[]>([]);
    
    // Modal & Upload states
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState<string>('olevel_result');
    const [uploading, setUploading] = useState(false);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/documents');
            setDocuments(response.data || []);
        } catch (error) {
            console.error('Error fetching documents:', error);
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDocuments();
        setRefreshing(false);
    };

    const handleUploadPicker = async () => {
        if (!selectedDocType) {
            Alert.alert('Selection Required', 'Please select a document type to upload.');
            return;
        }

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const file = result.assets[0];
            
            // Limit size to 10MB
            if (file.size && file.size > 10 * 1024 * 1024) {
                Alert.alert('File Too Large', 'Maximum file size permitted is 10MB.');
                return;
            }

            setUploading(true);
            
            const formData = new FormData();
            formData.append('document', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'application/pdf'
            } as any);
            formData.append('student_id', String(user?.id));
            formData.append('document_type', selectedDocType);

            await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            Alert.alert('Upload Successful', 'Your credential has been uploaded successfully for verification.');
            setModalVisible(false);
            fetchDocuments();
        } catch (error: any) {
            console.error('Upload error:', error);
            Alert.alert('Upload Failed', error.response?.data?.message || 'Failed to upload document.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        Alert.alert(
            'Delete Document',
            'Are you sure you want to delete this document from your profile?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/documents/${id}`);
                            fetchDocuments();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete document.');
                        }
                    }
                }
            ]
        );
    };

    const renderVerificationBadge = (doc: StudentDocument) => {
        if (doc.is_verified === true) {
            return (
                <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-lg border border-green-200">
                    <CheckCircle size={10} color="#10B981" />
                    <Text className="text-[9px] font-black text-green-700 ml-1 uppercase">Verified</Text>
                </View>
            );
        }
        if (doc.is_verified === false) {
            return (
                <View className="flex-row items-center bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                    <AlertCircle size={10} color="#EF4444" />
                    <Text className="text-[9px] font-black text-red-700 ml-1 uppercase">Rejected</Text>
                </View>
            );
        }
        return (
            <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                <Clock size={10} color="#D97706" />
                <Text className="text-[9px] font-black text-amber-700 ml-1 uppercase">Pending</Text>
            </View>
        );
    };

    const getDocTypeName = (typeKey: string) => {
        const matching = DOCUMENT_TYPES.find(d => d.value === typeKey);
        return matching ? matching.label : typeKey.toUpperCase();
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
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Student</Text>
                        <Text className="text-white text-xl font-bold">Documents & Credentials</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-md shadow-secondary/10"
                    >
                        <Plus size={22} color="#002147" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView 
                className="flex-1 px-6 mt-6" 
                contentContainerStyle={{ paddingBottom: 40 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !documents.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : documents.length === 0 ? (
                    <View className="items-center py-20 bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm mt-4">
                        <FileText size={48} color="#94A3B8" strokeWidth={1.5} />
                        <Text className="text-primary font-bold mt-4 text-base">No Documents Uploaded</Text>
                        <Text className="text-gray-400 text-xs text-center mt-2 px-6">
                            You haven't uploaded any school registration credentials or certificates yet.
                        </Text>
                    </View>
                ) : (
                    documents.map((doc) => (
                        <View key={doc.id} className="bg-white rounded-[32px] p-6 mb-5 border border-gray-100 shadow-sm">
                            <View className="flex-row justify-between items-start border-b border-gray-50 pb-4 mb-4">
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="bg-primary/5 p-3 rounded-2xl border border-primary/10 mr-3.5">
                                        <FileText size={20} color="#002147" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary font-black text-sm" numberOfLines={1}>
                                            {doc.file_name}
                                        </Text>
                                        <Text className="text-gray-400 text-[10px] uppercase font-bold tracking-wider mt-1">
                                            {getDocTypeName(doc.document_type)}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row space-x-2 items-center">
                                    {renderVerificationBadge(doc)}
                                    <TouchableOpacity 
                                        onPress={() => handleDelete(doc.id)}
                                        className="p-2 bg-red-50 rounded-xl ml-2"
                                    >
                                        <Trash2 size={13} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View className="bg-gray-50 rounded-2xl p-4">
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">File Size</Text>
                                    <Text className="text-primary/80 text-xs font-semibold">
                                        {(doc.file_size / 1024 / 1024).toFixed(2)} MB
                                    </Text>
                                </View>
                                <View className="flex-row justify-between items-center mb-2">
                                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Uploaded Date</Text>
                                    <Text className="text-primary/80 text-xs font-semibold">
                                        {new Date(doc.created_at).toLocaleDateString()}
                                    </Text>
                                </View>

                                {doc.verification_notes && (
                                    <View className="border-t border-gray-200/50 pt-2 mt-2">
                                        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Remarks</Text>
                                        <Text className="text-primary/70 text-xs italic font-medium">
                                            "{doc.verification_notes}"
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Upload Modal Selection */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[40px] p-6 pb-10 shadow-2xl">
                        <View className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                        <Text className="text-primary font-black text-center text-xs uppercase tracking-widest mb-6">Select Document Type</Text>

                        <View className="space-y-2 mb-6">
                            {DOCUMENT_TYPES.map((type) => {
                                const isSelected = selectedDocType === type.value;
                                return (
                                    <TouchableOpacity
                                        key={type.value}
                                        onPress={() => setSelectedDocType(type.value)}
                                        className={`p-4 rounded-2xl flex-row items-center border ${isSelected ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                        <FileText size={18} color={isSelected ? 'white' : '#002147'} />
                                        <Text className={`font-bold text-sm ml-3.5 ${isSelected ? 'text-white' : 'text-primary'}`}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="flex-1 bg-gray-100 rounded-2xl py-4.5 items-center justify-center border border-gray-200"
                            >
                                <Text className="text-gray-700 font-bold text-sm">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleUploadPicker}
                                disabled={uploading}
                                className="flex-1 bg-primary rounded-2xl py-4.5 items-center justify-center flex-row shadow-lg shadow-primary/20"
                            >
                                {uploading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white font-bold text-sm mr-2">Pick & Upload</Text>
                                        <UploadCloud size={16} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// Inline helper X icon
const X = () => (
    <View className="w-5 h-5 items-center justify-center">
        <Text className="text-primary font-black text-xs">✕</Text>
    </View>
);
