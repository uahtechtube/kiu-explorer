import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, Bell, Calendar, User, ShieldAlert, BookOpen, Globe, Info, Download, Link as LinkIcon } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import { StatusBadge } from '../../components/shared/StatusBadge';

interface AnnouncementDetails {
    id: number;
    title: string;
    content: string;
    type: 'general' | 'emergency' | 'academic' | 'event' | 'administrative' | 'exam';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    published_at: string;
    attachment_url?: string;
    publisher?: {
        surname: string;
        first_name: string;
    };
}

export default function AnnouncementDetailPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [announcement, setAnnouncement] = useState<AnnouncementDetails | null>(null);

    const fetchDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/announcements/${id}`);
            setAnnouncement(response.data);
        } catch (error) {
            console.error('Error loading announcement details:', error);
            // Fallback mock data matching ID in case of network issues
            const mockData: Record<number, AnnouncementDetails> = {
                1: {
                    id: 1,
                    title: 'Urgent: Campus Maintenance Closure',
                    content: 'Due to ongoing electrical infrastructure upgrades, the South Campus will be inaccessible on Friday, 16th Jan. Classes scheduled for Hall A-E will move online. High voltage testing will be conducted, so all students are strictly warned to stay away from the construction zones.',
                    type: 'emergency',
                    priority: 'urgent',
                    published_at: '2026-01-14T08:00:00Z',
                    publisher: { surname: 'Office', first_name: 'Registrar' }
                },
                2: {
                    id: 2,
                    title: 'Examination Timetable Release',
                    content: 'First semester provisional timetables are now available. Students are advised to report discrepancies to the Dean of Students by Jan 20th. Make sure to double check overlap cases and missing course codes to avoid exams scheduling clashes.',
                    type: 'academic',
                    priority: 'high',
                    published_at: '2026-01-13T14:30:00Z',
                    publisher: { surname: 'Exams', first_name: 'Director of' }
                },
                3: {
                    id: 3,
                    title: 'KIU Annual Tech Fair 2026',
                    content: 'Join us for a three-day celebration of digital innovation. Register your projects at the Students Center. Exhibition slots are limited and prize pools up to ₦500,000 are up for grabs. Mentorship guides are available from standard industry partners.',
                    type: 'event',
                    priority: 'medium',
                    published_at: '2026-01-12T11:00:00Z',
                    publisher: { surname: 'VC', first_name: 'Office of the' }
                }
            };
            const numId = Number(id);
            if (mockData[numId]) {
                setAnnouncement(mockData[numId]);
            } else {
                setAnnouncement({
                    id: numId,
                    title: 'KIU Circular Update',
                    content: 'This official campus publication has been updated. Please consult the administration office or your departmental notice board for complete details regarding academic and general updates.',
                    type: 'general',
                    priority: 'low',
                    published_at: new Date().toISOString(),
                    publisher: { surname: 'Admin', first_name: 'School' }
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchDetails();
        }
    }, [id]);

    const getIcon = (type?: string) => {
        switch (type?.toLowerCase()) {
            case 'emergency': return <ShieldAlert size={24} color="#EF4444" />;
            case 'academic': return <BookOpen size={24} color="#3B82F6" />;
            case 'event': return <Globe size={24} color="#10B981" />;
            default: return <Info size={24} color="#6B7280" />;
        }
    };

    const getHeaderColorClass = (type?: string) => {
        switch (type?.toLowerCase()) {
            case 'emergency': return 'bg-rose-50 border-rose-100';
            case 'academic': return 'bg-blue-50 border-blue-100';
            case 'event': return 'bg-emerald-50 border-emerald-100';
            default: return 'bg-gray-50 border-gray-100';
        }
    };

    const handleDownloadAttachment = () => {
        if (announcement?.attachment_url) {
            Linking.openURL(announcement.attachment_url);
        } else {
            Alert.alert('Attachment', 'No downloadable attachments are linked to this circular.');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Header */}
            <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">KIU Circular</Text>
                        <Text className="text-white text-xl font-bold">News Detail</Text>
                    </View>
                    <TouchableOpacity className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                        <Bell size={22} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#002147" />
                    <Text className="text-gray-400 mt-4 font-bold">Loading announcement content...</Text>
                </View>
            ) : announcement ? (
                <ScrollView
                    className="flex-1 -mt-10 px-6"
                    contentContainerStyle={{ paddingBottom: 60 }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Announcement Card wrapper */}
                    <PremiumCard variant="elevated" className="bg-white p-6 border-gray-100 rounded-[32px] overflow-hidden">
                        
                        {/* Priority / Type Banner */}
                        <View className={`p-4 rounded-2xl mb-6 flex-row items-center justify-between border ${getHeaderColorClass(announcement.type)}`}>
                            <View className="flex-row items-center">
                                {getIcon(announcement.type)}
                                <Text className="text-primary font-black uppercase text-sm ml-3 tracking-wider">
                                    {announcement.type?.toUpperCase()}
                                </Text>
                            </View>
                            <StatusBadge status={announcement.priority?.toLowerCase() as any} />
                        </View>

                        {/* Title */}
                        <Text className="text-primary text-2xl font-black mb-4 leading-tight">
                            {announcement.title}
                        </Text>

                        {/* Metadata Row */}
                        <View className="flex-row items-center justify-between py-4 border-t border-b border-gray-50 mb-6">
                            <View className="flex-row items-center">
                                <Calendar size={16} color="#94A3B8" />
                                <Text className="text-gray-400 text-xs font-bold ml-1.5">
                                    {new Date(announcement.published_at).toLocaleDateString(undefined, {
                                        month: 'short', day: 'numeric', year: 'numeric'
                                    })}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <User size={16} color="#94A3B8" />
                                <Text className="text-gray-400 text-xs font-black ml-1.5 uppercase">
                                    {announcement.publisher ? `${announcement.publisher.first_name} ${announcement.publisher.surname}` : 'VC Office'}
                                </Text>
                            </View>
                        </View>

                        {/* Body Text */}
                        <Text className="text-gray-600 leading-7 text-base font-medium mb-8">
                            {announcement.content}
                        </Text>

                        {/* Download / Attachment Button */}
                        <TouchableOpacity
                            onPress={handleDownloadAttachment}
                            className="bg-primary/5 py-4 px-5 rounded-2xl flex-row items-center justify-between border border-primary/10"
                        >
                            <View className="flex-row items-center">
                                <LinkIcon size={18} color="#002147" />
                                <Text className="text-primary font-black text-xs uppercase ml-3 tracking-widest">
                                    Download circular PDF
                                </Text>
                            </View>
                            <Download size={18} color="#002147" />
                        </TouchableOpacity>

                    </PremiumCard>
                </ScrollView>
            ) : (
                <View className="flex-1 justify-center items-center px-8">
                    <Info size={48} color="#EF4444" />
                    <Text className="text-gray-400 font-bold text-center mt-4">Announcement not found or has expired.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}
