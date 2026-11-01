import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Video, Calendar, Clock, User, ExternalLink, ArrowLeft } from 'lucide-react-native';
import api from '../../lib/api';

interface VirtualClass {
    id: number;
    title: string;
    description: string;
    scheduled_at: string;
    duration: number;
    status: 'upcoming' | 'active' | 'ended';
    course: {
        course_code: string;
        course_title: string;
    };
    lecturer_name?: string;
    meeting_link?: string;
}

export default function VirtualClasses() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [classes, setClasses] = useState<VirtualClass[]>([]);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'active'>('upcoming');

    useEffect(() => {
        fetchClasses();
    }, [activeTab]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/virtual-classes', {
                params: { status: activeTab }
            });
            setClasses(response.data.data || response.data);
        } catch (error) {
            console.error('Error fetching classes:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchClasses();
        setRefreshing(false);
    };

    const handleJoinClass = async (cls: VirtualClass) => {
        if (cls.status !== 'active') {
            Alert.alert('Class Not Active', 'This class has not started yet');
            return;
        }

        try {
            const response = await api.post(`/virtual-classes/${cls.id}/join`);
            const meetingLink = response.data.meeting_link || cls.meeting_link;

            if (meetingLink) {
                Alert.alert(
                    'Join Virtual Class',
                    'Opening meeting link...',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Open',
                            onPress: () => Linking.openURL(meetingLink)
                        }
                    ]
                );
            } else {
                Alert.alert('No Meeting Link', 'The lecturer has not provided a meeting link yet');
            }
        } catch (error) {
            console.error('Error joining class:', error);
            Alert.alert('Error', 'Failed to join class');
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 py-4">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ArrowLeft size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text className="text-white text-xl font-bold">Virtual Classes</Text>
                </View>

                {/* Tabs */}
                <View className="flex-row bg-white/10 rounded-2xl p-1">
                    {(['upcoming', 'active'] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            className={`flex-1 py-2 rounded-xl ${activeTab === tab ? 'bg-white' : ''
                                }`}
                        >
                            <Text className={`text-center font-semibold capitalize ${activeTab === tab ? 'text-primary' : 'text-white'
                                }`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Classes List */}
            <ScrollView
                className="flex-1 px-6 py-4"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {classes.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Video size={64} color="#D1D5DB" />
                        <Text className="text-gray-500 text-lg mt-4">No {activeTab} classes</Text>
                        <Text className="text-gray-400 text-sm mt-2 text-center px-8">
                            Your lecturers will schedule virtual classes here
                        </Text>
                    </View>
                ) : (
                    classes.map((cls) => (
                        <View
                            key={cls.id}
                            className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
                        >
                            {/* Course Code & Status */}
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="bg-primary/10 px-3 py-1 rounded-lg">
                                    <Text className="text-primary font-bold">{cls.course.course_code}</Text>
                                </View>
                                {cls.status === 'active' && (
                                    <View className="bg-green-100 px-3 py-1 rounded-lg flex-row items-center">
                                        <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                                        <Text className="text-green-700 font-semibold">Live Now</Text>
                                    </View>
                                )}
                            </View>

                            {/* Title */}
                            <Text className="text-gray-800 font-bold text-lg mb-2">{cls.title}</Text>

                            {/* Description */}
                            {cls.description && (
                                <Text className="text-gray-600 mb-3" numberOfLines={2}>
                                    {cls.description}
                                </Text>
                            )}

                            {/* Lecturer */}
                            {cls.lecturer_name && (
                                <View className="flex-row items-center mb-2">
                                    <User size={16} color="#6B7280" />
                                    <Text className="text-gray-600 ml-2">{cls.lecturer_name}</Text>
                                </View>
                            )}

                            {/* Date & Time */}
                            <View className="flex-row items-center mb-2">
                                <Calendar size={16} color="#6B7280" />
                                <Text className="text-gray-600 ml-2">{formatDate(cls.scheduled_at)}</Text>
                                <Clock size={16} color="#6B7280" className="ml-4" />
                                <Text className="text-gray-600 ml-2">{formatTime(cls.scheduled_at)}</Text>
                            </View>

                            {/* Duration */}
                            <View className="flex-row items-center mb-4">
                                <Clock size={16} color="#6B7280" />
                                <Text className="text-gray-600 ml-2">{cls.duration} minutes</Text>
                            </View>

                            {/* Join Button */}
                            {cls.status === 'active' && (
                                <TouchableOpacity
                                    onPress={() => handleJoinClass(cls)}
                                    className="bg-primary rounded-2xl py-3 flex-row items-center justify-center"
                                >
                                    <Video size={20} color="#FFF" />
                                    <Text className="text-white font-semibold ml-2">Join Class</Text>
                                    <ExternalLink size={16} color="#FFF" className="ml-2" />
                                </TouchableOpacity>
                            )}

                            {cls.status === 'upcoming' && (
                                <View className="bg-gray-100 rounded-2xl py-3 items-center">
                                    <Text className="text-gray-600 font-semibold">Scheduled</Text>
                                </View>
                            )}
                        </View>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
