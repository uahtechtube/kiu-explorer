import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Upload, FileText, Link as LinkIcon, Video, Youtube, X } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import api from '../../lib/api';

type UploadTab = 'file' | 'link' | 'youtube';

function extractYouTubeId(input: string): string | null {
    if (!input) return null;
    // Already a plain video ID (11 chars, no slashes or dots)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) return input.trim();
    // Full URL patterns
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const re of patterns) {
        const m = input.match(re);
        if (m) return m[1];
    }
    return null;
}

export default function UploadTutorialPage() {
    const router = useRouter();
    const [tab, setTab] = useState<UploadTab>('file');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [courseCode, setCourseCode] = useState('');

    // File tab state
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [fileType, setFileType] = useState('');

    // Link tab state
    const [videoUrl, setVideoUrl] = useState('');

    // YouTube tab state
    const [youtubeInput, setYoutubeInput] = useState('');
    const [youtubeId, setYoutubeId] = useState<string | null>(null);
    const [youtubeParseError, setYoutubeParseError] = useState('');

    const [uploading, setUploading] = useState(false);

    const handleYoutubeInputChange = (text: string) => {
        setYoutubeInput(text);
        const id = extractYouTubeId(text);
        if (id) {
            setYoutubeId(id);
            setYoutubeParseError('');
        } else if (text.length > 5) {
            setYoutubeId(null);
            setYoutubeParseError('Could not extract Video ID. Paste the full YouTube URL.');
        } else {
            setYoutubeId(null);
            setYoutubeParseError('');
        }
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'video/*', 'audio/*', 'application/vnd.ms-powerpoint',
                    'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
                copyToCacheDirectory: true,
                multiple: false
            });
            if (!result.canceled && result.assets?.length > 0) {
                const file = result.assets[0];
                const mimeType = file.mimeType || 'application/octet-stream';
                let detectedType = 'pdf';
                if (mimeType.startsWith('video/')) detectedType = 'video';
                else if (mimeType.startsWith('audio/')) detectedType = 'audio';
                setSelectedFile({ uri: file.uri, name: file.name, type: mimeType, size: file.size || 0 });
                setFileType(detectedType);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick document. Please try again.');
        }
    };

    const handleSubmit = async () => {
        if (!title.trim() || !courseCode.trim()) {
            Alert.alert('Missing Fields', 'Please enter a title and a valid course code (e.g. CSC 401).');
            return;
        }

        setUploading(true);
        try {
            if (tab === 'youtube') {
                if (!youtubeId) {
                    Alert.alert('No YouTube Video', 'Please enter a valid YouTube URL or video ID.');
                    setUploading(false);
                    return;
                }
                await api.post('/lecturer/tutorials/youtube/save', {
                    youtube_video_id: youtubeId,
                    title: title.trim(),
                    description: description.trim() || null,
                    course_code: courseCode.trim() || null,
                });
                Alert.alert('Success!', 'YouTube tutorial embedded successfully!');
                router.back();
            } else if (tab === 'file') {
                if (!selectedFile) {
                    Alert.alert('No File', 'Please select a file to upload.');
                    setUploading(false);
                    return;
                }
                const formData = new FormData();
                formData.append('title', title.trim());
                formData.append('description', description.trim());
                formData.append('course_code', courseCode.trim());
                
                if (fileType === 'pdf' || fileType === 'doc' || fileType === 'ppt') {
                    // Send to library
                    formData.append('category', 'reference');
                    formData.append('file', {
                        uri: selectedFile.uri,
                        name: selectedFile.name,
                        type: selectedFile.type
                    } as any);
                    await api.post('/library', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    Alert.alert('Success!', 'Document added to Library successfully!');
                } else {
                    formData.append('file_type', fileType);
                    formData.append('file', {
                        uri: selectedFile.uri,
                        name: selectedFile.name,
                        type: selectedFile.type
                    } as any);
                    await api.post('/lecturer/tutorials', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                    Alert.alert('Success!', 'Tutorial uploaded successfully!');
                }
                router.back();
            } else {
                // link tab
                if (!videoUrl.trim()) {
                    Alert.alert('No Link', 'Please enter a video URL.');
                    setUploading(false);
                    return;
                }
                const formData = new FormData();
                formData.append('title', title.trim());
                formData.append('description', description.trim());
                formData.append('course_code', courseCode.trim());
                formData.append('video_url', videoUrl.trim());
                await api.post('/lecturer/tutorials', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                Alert.alert('Success!', 'Tutorial saved successfully!');
                router.back();
            }
        } catch (error: any) {
            let msg = 'Failed to upload tutorial.';
            if (error?.response?.data) {
                if (error.response.data.message) {
                    msg = error.response.data.message;
                } else if (typeof error.response.data === 'object') {
                    // Extract first validation error from Laravel
                    const firstKey = Object.keys(error.response.data)[0];
                    if (firstKey && Array.isArray(error.response.data[firstKey])) {
                        msg = error.response.data[firstKey][0];
                    }
                }
            }
            Alert.alert('Upload Error', msg);
        } finally {
            setUploading(false);
        }
    };

    const tabs: { key: UploadTab; label: string; icon: React.ReactNode }[] = [
        { key: 'file', label: 'Upload File', icon: <FileText size={18} color={tab === 'file' ? '#fff' : '#6B7280'} /> },
        { key: 'link', label: 'Video Link', icon: <Video size={18} color={tab === 'link' ? '#fff' : '#6B7280'} /> },
        { key: 'youtube', label: 'YouTube', icon: <Youtube size={18} color={tab === 'youtube' ? '#fff' : '#6B7280'} /> },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-2xl font-bold">Upload Tutorial</Text>
                        <Text className="text-gray-300 text-sm">Share learning materials</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Tab Selector */}
                <View className="flex-row mb-6 bg-white rounded-2xl p-1 border border-gray-100">
                    {tabs.map((t) => (
                        <TouchableOpacity
                            key={t.key}
                            onPress={() => setTab(t.key)}
                            style={{
                                flex: 1, paddingVertical: 10, borderRadius: 14, alignItems: 'center',
                                backgroundColor: tab === t.key ? '#002147' : 'transparent'
                            }}
                        >
                            {t.icon}
                            <Text style={{
                                fontWeight: '700', marginTop: 3, fontSize: 11,
                                color: tab === t.key ? '#fff' : '#6B7280'
                            }}>
                                {t.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Common Fields */}
                <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100">
                    <Text className="text-gray-500 text-xs uppercase mb-2 font-bold">Course Identification (Code or Name) *</Text>
                    <TextInput
                        value={courseCode}
                        onChangeText={setCourseCode}
                        placeholder="e.g. CSC 401, MATH 101, General, etc."
                        className="bg-gray-50 p-4 rounded-2xl text-gray-800 mb-4 font-semibold"
                    />
                    <Text className="text-gray-500 text-xs uppercase mb-2">Title *</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Tutorial title"
                        className="bg-gray-50 p-3 rounded-xl text-gray-800 mb-4"
                    />
                    <Text className="text-gray-500 text-xs uppercase mb-2">Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Brief description"
                        multiline
                        numberOfLines={3}
                        className="bg-gray-50 p-3 rounded-xl text-gray-800 min-h-[80px]"
                        textAlignVertical="top"
                    />
                </View>

                {/* Tab-specific content */}
                {tab === 'file' && (
                    <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-gray-100">
                        <Text className="text-gray-500 text-xs uppercase mb-3">Upload Document or Video</Text>
                        {selectedFile && (
                            <View className="bg-blue-50 p-4 rounded-2xl mb-3 flex-row items-center justify-between">
                                <View className="flex-1">
                                    <Text className="text-blue-900 font-bold" numberOfLines={1}>{selectedFile.name}</Text>
                                    <Text className="text-blue-600 text-xs mt-1">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {fileType.toUpperCase()}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setSelectedFile(null)} className="ml-3">
                                    <X size={18} color="#3b82f6" />
                                </TouchableOpacity>
                            </View>
                        )}
                        <TouchableOpacity
                            onPress={pickDocument}
                            className="bg-gray-50 border-2 border-dashed border-gray-300 p-6 rounded-2xl items-center"
                        >
                            <Upload size={32} color="#6B7280" />
                            <Text className="text-gray-600 font-bold mt-2">
                                {selectedFile ? 'Change File' : 'Select PDF, Video or PPT'}
                            </Text>
                            <Text className="text-gray-400 text-xs mt-1">Max size: 50MB</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {tab === 'link' && (
                    <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-gray-100">
                        <Text className="text-gray-500 text-xs uppercase mb-3">External Video URL</Text>
                        <View className="flex-row items-center bg-gray-50 p-3 rounded-xl">
                            <LinkIcon size={20} color="#6B7280" />
                            <TextInput
                                value={videoUrl}
                                onChangeText={setVideoUrl}
                                placeholder="https://..."
                                className="flex-1 ml-2 text-gray-800"
                                autoCapitalize="none"
                                keyboardType="url"
                            />
                        </View>
                    </View>
                )}

                {tab === 'youtube' && (
                    <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-gray-100">
                        <Text className="text-gray-500 text-xs uppercase mb-3">YouTube URL or Video ID</Text>
                        <View className="flex-row items-center bg-gray-50 p-3 rounded-xl mb-1">
                            <Youtube size={20} color="#dc2626" />
                            <TextInput
                                value={youtubeInput}
                                onChangeText={handleYoutubeInputChange}
                                placeholder="https://youtube.com/watch?v=... or videoId"
                                className="flex-1 ml-2 text-gray-800"
                                autoCapitalize="none"
                                keyboardType="url"
                            />
                            {youtubeInput.length > 0 && (
                                <TouchableOpacity onPress={() => { setYoutubeInput(''); setYoutubeId(null); setYoutubeParseError(''); }}>
                                    <X size={16} color="#9ca3af" />
                                </TouchableOpacity>
                            )}
                        </View>

                        {youtubeParseError ? (
                            <Text className="text-red-500 text-xs mt-1 ml-1">{youtubeParseError}</Text>
                        ) : null}

                        {/* Thumbnail Preview */}
                        {youtubeId && (
                            <View className="mt-4">
                                <Text className="text-gray-500 text-xs uppercase mb-2">Preview</Text>
                                <View className="rounded-2xl overflow-hidden">
                                    <Image
                                        source={{ uri: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` }}
                                        style={{ width: '100%', height: 180 }}
                                        resizeMode="cover"
                                    />
                                    <View style={{
                                        position: 'absolute', bottom: 8, right: 8,
                                        backgroundColor: '#dc2626', borderRadius: 6,
                                        paddingHorizontal: 8, paddingVertical: 3
                                    }}>
                                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
                                            ID: {youtubeId}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="text-green-600 text-xs mt-2 font-bold">
                                    ✓ Video ID extracted successfully
                                </Text>
                            </View>
                        )}

                        <Text className="text-gray-400 text-xs mt-3">
                            Paste any YouTube link (watch, short, embed) or just the 11-character video ID.
                        </Text>
                    </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={uploading}
                    className={`py-4 rounded-3xl items-center mb-8 ${uploading ? 'bg-gray-300' : 'bg-primary'}`}
                >
                    {uploading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">
                            {tab === 'youtube' ? 'Embed YouTube Tutorial' :
                                tab === 'file' ? 'Upload Tutorial' : 'Save Tutorial'}
                        </Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
