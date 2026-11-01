import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Calendar, Clock, Users, Video, ArrowLeft, Play, StopCircle } from 'lucide-react-native';
import api from '../../../lib/api';

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
    meeting_link?: string;
}

export default function VirtualClassesList() {
    const router = useRouter();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'upcoming' | 'active' | 'ended'>('upcoming');
    const [classes, setClasses] = useState<VirtualClass[]>([]);

    useEffect(() => {
        fetchClasses();
    }, [activeTab]);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await api.get('/lecturer/virtual-classes', {
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

    const handleStartClass = async (classId: number) => {
        Alert.alert(
            'Start Class',
            'Are you ready to start this virtual class?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start',
                    onPress: async () => {
                        try {
                            await api.post(`/lecturer/virtual-classes/${classId}/start`);
                            Alert.alert('Success', 'Class started successfully');
                            fetchClasses();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to start class');
                        }
                    }
                }
            ]
        );
    };

    const handleEndClass = async (classId: number) => {
        Alert.alert(
            'End Class',
            'Are you sure you want to end this class?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.post(`/lecturer/virtual-classes/${classId}/end`);
                            Alert.alert('Success', 'Class ended successfully');
                            fetchClasses();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to end class');
                        }
                    }
                }
            ]
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'upcoming': return 'bg-blue-100 text-blue-700';
            case 'active': return 'bg-green-100 text-green-700';
            case 'ended': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 py-4">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="mr-4">
                            <ArrowLeft size={24} color="#FFF" />
                        </TouchableOpacity>
                        <Text className="text-white text-xl font-bold">Virtual Classes</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/lecturer/virtual-classes/create')}
                        className="bg-white/20 p-3 rounded-2xl"
                    >
                        <Plus size={20} color="#FFF" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View className="flex-row bg-white/10 rounded-2xl p-1">
                    {(['upcoming', 'active', 'ended'] as const).map((tab) => (
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
                        {activeTab === 'upcoming' && (
                            <TouchableOpacity
                                onPress={() => router.push('/lecturer/virtual-classes/create')}
                                className="bg-primary px-6 py-3 rounded-2xl mt-4"
                            >
                                <Text className="text-white font-semibold">Create New Class</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    classes.map((cls) => (
                        <TouchableOpacity
                            key={cls.id}
                            onPress={() => router.push(`/lecturer/virtual-classes/${cls.id}`)}
                            className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
                        >
                            {/* Course Code & Status */}
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="bg-primary/10 px-3 py-1 rounded-lg">
                                    <Text className="text-primary font-bold">{cls.course.course_code}</Text>
                                </View>
                                <View className={`px-3 py-1 rounded-lg ${getStatusColor(cls.status)}`}>
                                    <Text className="font-semibold capitalize">{cls.status}</Text>
                                </View>
                            </View>

                            {/* Title */}
                            <Text className="text-gray-800 font-bold text-lg mb-2">{cls.title}</Text>

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

                            {/* Action Buttons */}
                            {cls.status === 'upcoming' && (
                                <TouchableOpacity
                                    onPress={() => handleStartClass(cls.id)}
                                    className="bg-green-500 rounded-2xl py-3 flex-row items-center justify-center"
                                >
                                    <Play size={20} color="#FFF" />
                                    <Text className="text-white font-semibold ml-2">Start Class</Text>
                                </TouchableOpacity>
                            )}

                            {cls.status === 'active' && (
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => cls.meeting_link && router.push(cls.meeting_link as any)}
                                        className="flex-1 bg-primary rounded-2xl py-3 flex-row items-center justify-center"
                                    >
                                        <Video size={20} color="#FFF" />
                                        <Text className="text-white font-semibold ml-2">Join Meeting</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleEndClass(cls.id)}
                                        className="bg-red-500 rounded-2xl px-4 py-3 items-center justify-center"
                                    >
                                        <StopCircle size={20} color="#FFF" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
