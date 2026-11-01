import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FileText, Download, Eye, ChevronLeft, File, Image, Video } from 'lucide-react-native';
import api from '../../../lib/api';

interface Material {
    id: number;
    name: string;
    type: 'pdf' | 'doc' | 'ppt' | 'image' | 'video' | 'zip' | 'other';
    size: string;
    uploaded_at: string;
    url: string;
    downloads: number;
}

interface ClassInfo {
    id: number;
    title: string;
    course_code: string;
    lecturer_name: string;
}

export default function ClassMaterialsPage() {
    const router = useRouter();
    const { classId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
    const [materials, setMaterials] = useState<Material[]>([]);

    useEffect(() => {
        fetchMaterials();
    }, [classId]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/virtual-classes/${classId}/materials`);
            setClassInfo(response.data.class);
            setMaterials(response.data.materials || []);
        } catch (error) {
            console.error('Error fetching materials:', error);
            Alert.alert('Error', 'Failed to load materials.');
            setClassInfo(null);
            setMaterials([]);
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
            case 'doc':
            case 'ppt':
                return FileText;
            case 'image':
                return Image;
            case 'video':
                return Video;
            default:
                return File;
        }
    };

    const getFileColor = (type: string) => {
        switch (type) {
            case 'pdf':
                return '#EF4444';
            case 'doc':
                return '#3B82F6';
            case 'ppt':
                return '#F59E0B';
            case 'image':
                return '#10B981';
            case 'video':
                return '#8B5CF6';
            case 'zip':
                return '#6B7280';
            default:
                return '#6B7280';
        }
    };

    const handleDownload = async (material: Material) => {
        try {
            Alert.alert('Download Started', `Downloading ${material.name}...`);
            // Implement actual download logic
            await api.post(`/student/virtual-classes/materials/${material.id}/download`);
        } catch (error) {
            console.error('Error downloading material:', error);
            Alert.alert('Error', 'Failed to download material');
        }
    };

    const handlePreview = (material: Material) => {
        if (material.type === 'pdf' || material.type === 'image') {
            Alert.alert('Preview', `Opening ${material.name}...`);
            // Implement preview logic
        } else {
            Alert.alert('Preview Not Available', 'This file type cannot be previewed');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white text-2xl font-bold">Class Materials</Text>
                    </View>
                </View>

                {classInfo && (
                    <View className="bg-white/10 p-4 rounded-2xl">
                        <Text className="text-white font-bold text-lg mb-1">{classInfo.title}</Text>
                        <Text className="text-gray-300 text-sm">{classInfo.course_code}</Text>
                        <Text className="text-gray-400 text-xs mt-1">{classInfo.lecturer_name}</Text>
                    </View>
                )}
            </View>

            {/* Materials List */}
            <ScrollView className="flex-1 px-6 pt-4">
                {loading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#002147" />
                        <Text className="text-gray-500 mt-4">Loading materials...</Text>
                    </View>
                ) : materials.length === 0 ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <FileText size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-lg font-semibold mt-4">No materials available</Text>
                        <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                            The lecturer hasn't uploaded any materials yet
                        </Text>
                    </View>
                ) : (
                    <>
                        <View className="mb-4">
                            <Text className="text-gray-500 text-sm">
                                {materials.length} {materials.length === 1 ? 'file' : 'files'} available
                            </Text>
                        </View>

                        {materials.map((material) => {
                            const IconComponent = getFileIcon(material.type);
                            const iconColor = getFileColor(material.type);

                            return (
                                <View
                                    key={material.id}
                                    className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
                                >
                                    <View className="flex-row items-start">
                                        {/* File Icon */}
                                        <View
                                            className="w-14 h-14 rounded-2xl items-center justify-center"
                                            style={{ backgroundColor: `${iconColor}15` }}
                                        >
                                            <IconComponent size={28} color={iconColor} />
                                        </View>

                                        {/* File Info */}
                                        <View className="flex-1 ml-4">
                                            <Text className="text-primary font-bold text-base mb-1" numberOfLines={2}>
                                                {material.name}
                                            </Text>
                                            <View className="flex-row items-center">
                                                <Text className="text-gray-500 text-xs">{material.size}</Text>
                                                <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                                                <Text className="text-gray-500 text-xs">
                                                    {material.downloads} downloads
                                                </Text>
                                            </View>
                                            <Text className="text-gray-400 text-xs mt-1">
                                                Uploaded {formatDate(material.uploaded_at)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Action Buttons */}
                                    <View className="flex-row mt-4 space-x-2">
                                        <TouchableOpacity
                                            onPress={() => handleDownload(material)}
                                            className="flex-1 bg-primary py-3 rounded-2xl items-center flex-row justify-center"
                                        >
                                            <Download size={16} color="#FFFFFF" />
                                            <Text className="text-white font-bold ml-2">Download</Text>
                                        </TouchableOpacity>

                                        {(material.type === 'pdf' || material.type === 'image') && (
                                            <TouchableOpacity
                                                onPress={() => handlePreview(material)}
                                                className="bg-gray-100 px-4 py-3 rounded-2xl items-center justify-center"
                                            >
                                                <Eye size={20} color="#002147" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            );
                        })}

                        <View className="h-6" />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
