import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Bell, Users, FileText } from 'lucide-react-native';
import api from '../../lib/api';

export default function CreateAnnouncementPage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetAudience, setTargetAudience] = useState('students');
    const [priority, setPriority] = useState('medium');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('Missing Fields', 'Please enter both title and content.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/lecturer/announcements', {
                title: title.trim(),
                content: content.trim(),
                type: 'academic',
                target_audience: targetAudience,
                priority: priority,
                send_notification: true,
            });

            Alert.alert('Success', 'Announcement posted successfully!');
            router.back();
        } catch (error: any) {
            const msg = error?.response?.data?.message || 'Failed to post announcement.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-2xl font-bold">New Notification</Text>
                        <Text className="text-gray-300 text-sm">Post an announcement to students</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6 mb-8">
                <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100">
                    <Text className="text-gray-500 text-xs uppercase mb-2">Title *</Text>
                    <View className="flex-row items-center bg-gray-50 p-3 rounded-xl mb-4">
                        <Bell size={20} color="#6B7280" />
                        <TextInput
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Announcement title"
                            className="flex-1 ml-2 text-gray-800"
                        />
                    </View>

                    <Text className="text-gray-500 text-xs uppercase mb-2">Message *</Text>
                    <View className="flex-row bg-gray-50 p-3 rounded-xl mb-4 min-h-[120px]">
                        <FileText size={20} color="#6B7280" className="mt-1" />
                        <TextInput
                            value={content}
                            onChangeText={setContent}
                            placeholder="Type your message here..."
                            multiline
                            className="flex-1 ml-2 text-gray-800"
                            textAlignVertical="top"
                        />
                    </View>

                    <Text className="text-gray-500 text-xs uppercase mb-2">Target Audience *</Text>
                    <View className="flex-row bg-gray-50 p-1 rounded-xl mb-4 border border-gray-100">
                        <TouchableOpacity
                            onPress={() => setTargetAudience('students')}
                            className={`flex-1 py-3 rounded-lg items-center ${targetAudience === 'students' ? 'bg-primary' : 'bg-transparent'}`}
                        >
                            <Text className={`font-bold text-xs ${targetAudience === 'students' ? 'text-white' : 'text-gray-500'}`}>All Students</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setTargetAudience('level_100')}
                            className={`flex-1 py-3 rounded-lg items-center ${targetAudience === 'level_100' ? 'bg-primary' : 'bg-transparent'}`}
                        >
                            <Text className={`font-bold text-xs ${targetAudience === 'level_100' ? 'text-white' : 'text-gray-500'}`}>Level 100</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setTargetAudience('level_400')}
                            className={`flex-1 py-3 rounded-lg items-center ${targetAudience === 'level_400' ? 'bg-primary' : 'bg-transparent'}`}
                        >
                            <Text className={`font-bold text-xs ${targetAudience === 'level_400' ? 'text-white' : 'text-gray-500'}`}>Level 400</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-gray-500 text-xs uppercase mb-2">Priority *</Text>
                    <View className="flex-row bg-gray-50 p-1 rounded-xl mb-4 border border-gray-100">
                        <TouchableOpacity
                            onPress={() => setPriority('medium')}
                            className={`flex-1 py-3 rounded-lg items-center ${priority === 'medium' ? 'bg-blue-600' : 'bg-transparent'}`}
                        >
                            <Text className={`font-bold text-xs ${priority === 'medium' ? 'text-white' : 'text-gray-500'}`}>Medium</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setPriority('high')}
                            className={`flex-1 py-3 rounded-lg items-center ${priority === 'high' ? 'bg-red-500' : 'bg-transparent'}`}
                        >
                            <Text className={`font-bold text-xs ${priority === 'high' ? 'text-white' : 'text-gray-500'}`}>High/Urgent</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`py-4 rounded-3xl items-center mt-2 ${loading ? 'bg-gray-300' : 'bg-primary'}`}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Post Notification</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
