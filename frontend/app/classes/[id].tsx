import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
    Video,
    Mic,
    MicOff,
    VideoOff,
    Phone,
    MessageCircle,
    Users,
    Hand,
    Download,
    Maximize,
    ChevronLeft,
    Send,
    FileText,
} from 'lucide-react-native';
import api from '../../lib/api';

interface ClassDetails {
    id: number;
    title: string;
    course_code: string;
    lecturer_name: string;
    status: 'scheduled' | 'live' | 'ended';
    scheduled_at: string;
    duration: number;
    participants_count: number;
    recording_url?: string;
    materials: Array<{
        id: number;
        name: string;
        type: string;
        url: string;
        size: string;
    }>;
}

interface ChatMessage {
    id: number;
    user_name: string;
    message: string;
    timestamp: string;
    is_lecturer: boolean;
}

export default function ClassRoomPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showParticipants, setShowParticipants] = useState(false);
    const [showMaterials, setShowMaterials] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');

    useEffect(() => {
        fetchClassDetails();
        // Mark attendance when joining
        markAttendance();
    }, [id]);

    const fetchClassDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/virtual-classes/${id}`);
            setClassDetails(response.data);

            // Load chat messages
            const chatResponse = await api.get(`/student/virtual-classes/${id}/chat`);
            setChatMessages(chatResponse.data.messages || []);
        } catch (error) {
            console.error('Error fetching class details:', error);
            Alert.alert('Error', 'Failed to load class details.');
            setClassDetails(null);
            setChatMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const markAttendance = async () => {
        try {
            await api.post(`/student/virtual-classes/${id}/attendance`);
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim()) return;

        try {
            const response = await api.post(`/student/virtual-classes/${id}/chat`, {
                message: messageInput,
            });

            const newMessage: ChatMessage = {
                id: Date.now(),
                user_name: 'You',
                message: messageInput,
                timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                is_lecturer: false,
            };

            setChatMessages([...chatMessages, newMessage]);
            setMessageInput('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleRaiseHand = async () => {
        try {
            await api.post(`/student/virtual-classes/${id}/raise-hand`);
            setHandRaised(!handRaised);
            Alert.alert(
                handRaised ? 'Hand Lowered' : 'Hand Raised',
                handRaised ? 'Your hand has been lowered' : 'The lecturer will be notified'
            );
        } catch (error) {
            console.error('Error raising hand:', error);
        }
    };

    const handleLeaveClass = () => {
        Alert.alert('Leave Class', 'Are you sure you want to leave this class?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Leave',
                style: 'destructive',
                onPress: () => router.back(),
            },
        ]);
    };

    const handleDownloadMaterial = async (material: any) => {
        Alert.alert('Download', `Downloading ${material.name}...`);
        // Implement actual download logic
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 items-center justify-center">
                <Text className="text-white text-lg">Loading class...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* Header */}
            <View className="px-4 py-3 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center">
                    <ChevronLeft size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View className="flex-1 ml-3">
                    <Text className="text-white font-bold text-base" numberOfLines={1}>
                        {classDetails?.title}
                    </Text>
                    <Text className="text-gray-400 text-xs">{classDetails?.course_code}</Text>
                </View>
                {classDetails?.status === 'live' && (
                    <View className="bg-red-500 px-3 py-1 rounded-full flex-row items-center">
                        <View className="w-2 h-2 bg-white rounded-full mr-1.5" />
                        <Text className="text-white text-xs font-bold">LIVE</Text>
                    </View>
                )}
            </View>

            {/* Video Area */}
            <View className="flex-1 bg-black relative">
                {/* Main Video (Lecturer's screen share or video) */}
                <View className="flex-1 items-center justify-center bg-gray-800">
                    <Video size={64} color="#6B7280" />
                    <Text className="text-gray-400 mt-4">
                        {classDetails?.status === 'live' ? 'Video Stream' : 'Class Recording'}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">{classDetails?.lecturer_name}</Text>
                </View>

                {/* Self Video (Picture-in-Picture) */}
                {classDetails?.status === 'live' && (
                    <View className="absolute top-4 right-4 w-24 h-32 bg-gray-700 rounded-2xl items-center justify-center border-2 border-gray-600">
                        {isVideoOff ? (
                            <VideoOff size={24} color="#9CA3AF" />
                        ) : (
                            <View className="w-12 h-12 bg-blue-500 rounded-full items-center justify-center">
                                <Text className="text-white font-bold">You</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Participants Count */}
                <View className="absolute top-4 left-4 bg-black/60 px-3 py-2 rounded-xl flex-row items-center">
                    <Users size={16} color="#FFFFFF" />
                    <Text className="text-white text-sm font-semibold ml-2">
                        {classDetails?.participants_count}
                    </Text>
                </View>

                {/* Fullscreen Button */}
                <TouchableOpacity className="absolute bottom-4 right-4 w-10 h-10 bg-black/60 rounded-full items-center justify-center">
                    <Maximize size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Controls */}
            <View className="bg-gray-800 px-6 py-4">
                <View className="flex-row items-center justify-between">
                    {/* Mic Toggle */}
                    <TouchableOpacity
                        onPress={() => setIsMuted(!isMuted)}
                        className={`w-14 h-14 rounded-full items-center justify-center ${isMuted ? 'bg-red-500' : 'bg-gray-700'
                            }`}
                    >
                        {isMuted ? <MicOff size={24} color="#FFFFFF" /> : <Mic size={24} color="#FFFFFF" />}
                    </TouchableOpacity>

                    {/* Video Toggle */}
                    <TouchableOpacity
                        onPress={() => setIsVideoOff(!isVideoOff)}
                        className={`w-14 h-14 rounded-full items-center justify-center ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'
                            }`}
                    >
                        {isVideoOff ? (
                            <VideoOff size={24} color="#FFFFFF" />
                        ) : (
                            <Video size={24} color="#FFFFFF" />
                        )}
                    </TouchableOpacity>

                    {/* Raise Hand */}
                    <TouchableOpacity
                        onPress={handleRaiseHand}
                        className={`w-14 h-14 rounded-full items-center justify-center ${handRaised ? 'bg-yellow-500' : 'bg-gray-700'
                            }`}
                    >
                        <Hand size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Chat */}
                    <TouchableOpacity
                        onPress={() => setShowChat(!showChat)}
                        className="w-14 h-14 bg-gray-700 rounded-full items-center justify-center relative"
                    >
                        <MessageCircle size={24} color="#FFFFFF" />
                        {chatMessages.length > 0 && (
                            <View className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full items-center justify-center">
                                <Text className="text-white text-xs font-bold">{chatMessages.length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Materials */}
                    <TouchableOpacity
                        onPress={() => setShowMaterials(!showMaterials)}
                        className="w-14 h-14 bg-gray-700 rounded-full items-center justify-center"
                    >
                        <FileText size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Leave */}
                    <TouchableOpacity
                        onPress={handleLeaveClass}
                        className="w-14 h-14 bg-red-500 rounded-full items-center justify-center"
                    >
                        <Phone size={24} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Chat Modal */}
            <Modal visible={showChat} animationType="slide" transparent>
                <View className="flex-1 bg-black/50">
                    <View className="flex-1 mt-20 bg-white rounded-t-3xl">
                        <View className="px-6 py-4 border-b border-gray-200 flex-row items-center justify-between">
                            <Text className="text-primary text-xl font-bold">Class Chat</Text>
                            <TouchableOpacity onPress={() => setShowChat(false)}>
                                <Text className="text-blue-500 font-semibold">Close</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-6 py-4">
                            {chatMessages.map((msg) => (
                                <View key={msg.id} className="mb-4">
                                    <View className="flex-row items-center mb-1">
                                        <Text
                                            className={`font-bold text-sm ${msg.is_lecturer ? 'text-blue-600' : 'text-gray-700'
                                                }`}
                                        >
                                            {msg.user_name}
                                        </Text>
                                        <Text className="text-gray-400 text-xs ml-2">{msg.timestamp}</Text>
                                    </View>
                                    <Text className="text-gray-800">{msg.message}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <View className="px-6 py-4 border-t border-gray-200 flex-row items-center">
                            <TextInput
                                value={messageInput}
                                onChangeText={setMessageInput}
                                placeholder="Type a message..."
                                className="flex-1 bg-gray-100 px-4 py-3 rounded-2xl"
                            />
                            <TouchableOpacity
                                onPress={handleSendMessage}
                                className="ml-3 w-12 h-12 bg-blue-500 rounded-full items-center justify-center"
                            >
                                <Send size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Materials Modal */}
            <Modal visible={showMaterials} animationType="slide" transparent>
                <View className="flex-1 bg-black/50">
                    <View className="flex-1 mt-20 bg-white rounded-t-3xl">
                        <View className="px-6 py-4 border-b border-gray-200 flex-row items-center justify-between">
                            <Text className="text-primary text-xl font-bold">Class Materials</Text>
                            <TouchableOpacity onPress={() => setShowMaterials(false)}>
                                <Text className="text-blue-500 font-semibold">Close</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1 px-6 py-4">
                            {classDetails?.materials.map((material) => (
                                <TouchableOpacity
                                    key={material.id}
                                    onPress={() => handleDownloadMaterial(material)}
                                    className="bg-gray-50 p-4 rounded-2xl mb-3 flex-row items-center"
                                >
                                    <View className="w-12 h-12 bg-blue-100 rounded-xl items-center justify-center">
                                        <FileText size={24} color="#3B82F6" />
                                    </View>
                                    <View className="flex-1 ml-3">
                                        <Text className="text-primary font-bold">{material.name}</Text>
                                        <Text className="text-gray-500 text-sm">{material.size}</Text>
                                    </View>
                                    <Download size={20} color="#3B82F6" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
