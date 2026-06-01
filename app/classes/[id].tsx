import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Linking } from 'react-native';
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
    Edit3,
    Play, // Added Play
} from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import api from '../../lib/api';

interface ClassDetails {
    id: number;
    title: string;
    course_code: string;
    lecturer_name: string;
    status: 'scheduled' | 'live' | 'ended' | 'active' | 'upcoming';
    scheduled_at: string;
    duration: number;
    participants_count: number;
    recording_url?: string;
    is_chat_muted?: boolean;
    meeting_link?: string; // Added meeting_link
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
    const [showWhiteboard, setShowWhiteboard] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');

    useEffect(() => {
        fetchClassDetails();
        // Mark attendance when joining
        markAttendance();

        // Poll for real-time changes every 5 seconds (chats, muting, live status, attendee count)
        const interval = setInterval(() => {
            pollUpdates();
        }, 5000);

        return () => clearInterval(interval);
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

    const pollUpdates = async () => {
        try {
            const response = await api.get(`/student/virtual-classes/${id}`);
            setClassDetails(response.data);

            const chatResponse = await api.get(`/student/virtual-classes/${id}/chat`);
            setChatMessages(chatResponse.data.messages || []);
        } catch (error) {
            console.error('Error polling virtual class updates:', error);
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

    if (loading && !classDetails) {
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
                {(classDetails?.status === 'live' || classDetails?.status === 'active') && (
                    <View className="bg-red-500 px-3 py-1 rounded-full flex-row items-center">
                        <View className="w-2 h-2 bg-white rounded-full mr-1.5" />
                        <Text className="text-white text-xs font-bold">LIVE</Text>
                    </View>
                )}
            </View>

            {/* Video Area */}
            <View className="flex-1 bg-black relative">
                {classDetails?.status === 'live' || classDetails?.status === 'active' ? (
                    classDetails?.meeting_link && !classDetails.meeting_link.includes('meet.jit.si') ? (
                        /* External Meeting (Zoom/Teams/etc.) */
                        <View className="flex-1 items-center justify-center bg-gray-800 p-6">
                            <View className="w-20 h-20 bg-blue-500/10 rounded-full items-center justify-center mb-6 border-2 border-blue-500/20">
                                <Video size={40} color="#3B82F6" />
                            </View>
                            <Text className="text-white text-lg font-bold text-center">Zoom Broadcast Session Live</Text>
                            <Text className="text-gray-400 text-xs text-center mt-2 px-6">
                                This class session is hosted externally on Zoom. Click the button below to launch the Zoom app and join the live broadcast room directly.
                            </Text>
                            <TouchableOpacity
                                onPress={() => Linking.openURL(classDetails.meeting_link!)}
                                className="mt-8 bg-blue-500 px-8 py-4 rounded-2xl flex-row items-center shadow-lg shadow-blue-500/20"
                            >
                                <Play size={16} color="white" fill="white" />
                                <Text className="text-white font-black text-sm uppercase tracking-wider ml-2">Launch Zoom App</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        /* Standard Jitsi WebView */
                        <WebView
                            source={{ uri: classDetails?.meeting_link || `https://meet.jit.si/kiu-explorer-class-${id}#config.prejoinPageEnabled=false&config.startWithAudioMuted=true&config.startWithVideoMuted=true` }}
                            allowsInlineMediaPlayback
                            mediaPlaybackRequiresUserAction={false}
                            javaScriptEnabled
                            domStorageEnabled
                            style={{ flex: 1 }}
                            className="flex-1"
                        />
                    )
                ) : (
                    /* Mock or Ended Playback */
                    <View className="flex-1 items-center justify-center bg-gray-800">
                        {classDetails?.recording_url ? (
                            <View className="items-center">
                                <Video size={64} color="#3B82F6" />
                                <Text className="text-white mt-4 font-semibold">Playback Recording Available</Text>
                                <TouchableOpacity
                                    onPress={() => Alert.alert('Recording Playback', `Playing recording from: ${classDetails.recording_url}`)}
                                    className="mt-3 bg-blue-500 px-4 py-2 rounded-xl"
                                >
                                    <Text className="text-white font-bold">Play Recording</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="items-center">
                                <VideoOff size={64} color="#6B7280" />
                                <Text className="text-gray-400 mt-4">
                                    {classDetails?.status === 'ended' ? 'Class Session Ended' : 'Class Has Not Started Yet'}
                                </Text>
                                <Text className="text-gray-500 text-sm mt-1">{classDetails?.lecturer_name}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Self Video (Picture-in-Picture) */}
                {(classDetails?.status === 'live' || classDetails?.status === 'active') && !classDetails?.meeting_link?.includes('zoom.us') && (
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
                        {classDetails?.participants_count || 0}
                    </Text>
                </View>

                {/* Fullscreen Button */}
                <TouchableOpacity className="absolute bottom-4 right-4 w-10 h-10 bg-black/60 rounded-full items-center justify-center">
                    <Maximize size={20} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Controls Console */}
            <View className="bg-gray-800 px-6 py-4 rounded-t-3xl shadow-lg">
                {/* Row 1: Actions */}
                <View className="flex-row items-center justify-between mb-4">
                    {/* Mic Toggle */}
                    <TouchableOpacity
                        onPress={() => setIsMuted(!isMuted)}
                        className={`w-14 h-14 rounded-full items-center justify-center ${isMuted ? 'bg-red-500' : 'bg-gray-700'}`}
                    >
                        {isMuted ? <MicOff size={24} color="#FFFFFF" /> : <Mic size={24} color="#FFFFFF" />}
                    </TouchableOpacity>

                    {/* Video Toggle */}
                    <TouchableOpacity
                        onPress={() => setIsVideoOff(!isVideoOff)}
                        className={`w-14 h-14 rounded-full items-center justify-center ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'}`}
                    >
                        {isVideoOff ? <VideoOff size={24} color="#FFFFFF" /> : <Video size={24} color="#FFFFFF" />}
                    </TouchableOpacity>

                    {/* Raise Hand */}
                    <TouchableOpacity
                        onPress={handleRaiseHand}
                        className={`w-14 h-14 rounded-full items-center justify-center ${handRaised ? 'bg-yellow-500' : 'bg-gray-700'}`}
                    >
                        <Hand size={24} color="#FFFFFF" />
                    </TouchableOpacity>

                    {/* Whiteboard Toggle */}
                    <TouchableOpacity
                        onPress={() => setShowWhiteboard(true)}
                        className="w-14 h-14 bg-gray-700 rounded-full items-center justify-center"
                    >
                        <Edit3 size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>

                {/* Row 2: Overlays */}
                <View className="flex-row items-center justify-between px-4">
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
                                            className={`font-bold text-sm ${msg.is_lecturer ? 'text-blue-600' : 'text-gray-700'}`}
                                        >
                                            {msg.user_name}
                                        </Text>
                                        <Text className="text-gray-400 text-xs ml-2">{msg.timestamp}</Text>
                                    </View>
                                    <Text className="text-gray-800">{msg.message}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        {classDetails?.is_chat_muted ? (
                            <View className="px-6 py-5 bg-gray-100 border-t border-gray-200 flex-row items-center justify-center">
                                <Text className="text-gray-500 font-semibold text-center">
                                    🔇 Classroom chat has been muted by the moderator.
                                </Text>
                            </View>
                        ) : (
                            <View className="px-6 py-4 border-t border-gray-200 flex-row items-center bg-white">
                                <TextInput
                                    value={messageInput}
                                    onChangeText={setMessageInput}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-100 px-4 py-3 rounded-2xl text-gray-800"
                                />
                                <TouchableOpacity
                                    onPress={handleSendMessage}
                                    className="ml-3 w-12 h-12 bg-blue-500 rounded-full items-center justify-center"
                                >
                                    <Send size={20} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        )}
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
                            {classDetails?.materials && classDetails.materials.length > 0 ? (
                                classDetails.materials.map((material) => (
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
                                ))
                            ) : (
                                <View className="items-center justify-center mt-20">
                                    <FileText size={48} color="#CBD5E1" />
                                    <Text className="text-gray-400 mt-4 text-center">No materials uploaded for this class</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Whiteboard Modal */}
            <Modal visible={showWhiteboard} animationType="slide" transparent>
                <View className="flex-1 bg-black/50">
                    <View className="flex-1 mt-10 bg-white rounded-t-3xl overflow-hidden">
                        <View className="px-6 py-4 border-b border-gray-200 flex-row items-center justify-between bg-white">
                            <View className="flex-row items-center">
                                <Edit3 size={22} color="#002147" style={{ marginRight: 8 }} />
                                <Text className="text-primary text-xl font-bold">Collaborative Whiteboard</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowWhiteboard(false)} className="bg-gray-100 px-3 py-1.5 rounded-xl">
                                <Text className="text-blue-500 font-bold">Minimize</Text>
                            </TouchableOpacity>
                        </View>

                        <WebView
                            source={{ uri: `https://witeboard.com/kiu-explorer-whiteboard-${id}` }}
                            javaScriptEnabled
                            domStorageEnabled
                            className="flex-1"
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
