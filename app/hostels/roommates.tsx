import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Heart, MessageSquare, Info, Sparkles, Sliders } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

interface RoommateProfile {
    sleep_habit: string;
    study_habit: string;
    cleanliness: string;
    social_habit: string;
    bio: string;
    interests: string;
}

interface Match {
    student_id: number;
    name: string;
    matric_number: string;
    gender: string;
    email: string;
    phone_number: string;
    room_number: string;
    match_percentage: number;
    profile: RoommateProfile;
}

export default function RoommateMatching() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<RoommateProfile | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [activeTab, setActiveTab] = useState<'matches' | 'profile'>('matches');
    const [bookingStatusError, setBookingStatusError] = useState<string | null>(null);

    // Form fields
    const [sleepHabit, setSleepHabit] = useState<'early_bird' | 'night_owl' | 'flexible'>('flexible');
    const [studyHabit, setStudyHabit] = useState<'quiet' | 'light_music' | 'group'>('quiet');
    const [cleanliness, setCleanliness] = useState<'neat_freak' | 'moderate' | 'relaxed'>('moderate');
    const [socialHabit, setSocialHabit] = useState<'introvert' | 'extrovert' | 'balanced'>('balanced');
    const [bio, setBio] = useState('');
    const [interests, setInterests] = useState('');

    useEffect(() => {
        fetchProfileAndMatches();
    }, [activeTab]);

    const fetchProfileAndMatches = async () => {
        try {
            setLoading(true);
            setBookingStatusError(null);
            
            const profRes = await api.get('/student/hostels/roommates/profile');
            const data = profRes.data.data;
            if (data) {
                setProfile(data);
                setSleepHabit(data.sleep_habit);
                setStudyHabit(data.study_habit);
                setCleanliness(data.cleanliness);
                setSocialHabit(data.social_habit);
                setBio(data.bio || '');
                setInterests(data.interests || '');
            }

            if (activeTab === 'matches') {
                const matchRes = await api.get('/student/hostels/roommates/matches');
                setMatches(matchRes.data.data || []);
            }
        } catch (error: any) {
            if (error.response?.status === 403) {
                setBookingStatusError(error.response?.data?.message || 'You must have an approved hostel booking to find compatible roommates.');
            } else {
                console.warn('Error fetching roommate data:', error.message || error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            const response = await api.post('/student/hostels/roommates/profile', {
                sleep_habit: sleepHabit,
                study_habit: studyHabit,
                cleanliness: cleanliness,
                social_habit: socialHabit,
                bio,
                interests,
            });

            if (response.data.status === 'success') {
                Alert.alert('Success', 'Matching profile saved successfully!');
                setProfile(response.data.data);
                setActiveTab('matches');
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save profile.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">Roommate Directory</Text>
            </View>

            {bookingStatusError ? (
                <View className="flex-1 justify-center items-center px-8 bg-gray-50">
                    <PremiumCard variant="elevated" className="bg-white p-8 items-center w-full shadow-xl shadow-primary/5">
                        <View className="w-20 h-20 bg-rose-50 rounded-full items-center justify-center mb-6">
                            <Info size={40} color="#F43F5E" />
                        </View>
                        <Text className="text-primary font-black text-xl text-center mb-2">Access Restricted</Text>
                        <Text className="text-gray-400 text-center text-sm leading-6 mb-8">
                            {bookingStatusError}
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.replace('/hostels')}
                            className="bg-primary w-full py-4.5 rounded-2xl items-center shadow-lg shadow-primary/20"
                        >
                            <Text className="text-white font-black text-sm uppercase tracking-wider">Hostel Booking Portal</Text>
                        </TouchableOpacity>
                    </PremiumCard>
                </View>
            ) : (
                <>
                    {/* Tabs */}
                    <View className="flex-row bg-white border-b border-gray-100 p-2">
                        <TouchableOpacity
                            onPress={() => setActiveTab('matches')}
                            className={`flex-1 py-3 rounded-2xl items-center flex-row justify-center space-x-2 ${
                                activeTab === 'matches' ? 'bg-primary' : ''
                            }`}
                        >
                            <Sparkles size={16} color={activeTab === 'matches' ? 'white' : '#64748B'} />
                            <Text className={`font-bold text-sm ${activeTab === 'matches' ? 'text-white' : 'text-slate-500'}`}>
                                Compatible Matches
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setActiveTab('profile')}
                            className={`flex-1 py-3 rounded-2xl items-center flex-row justify-center space-x-2 ${
                                activeTab === 'profile' ? 'bg-primary' : ''
                            }`}
                        >
                            <Sliders size={16} color={activeTab === 'profile' ? 'white' : '#64748B'} />
                            <Text className={`font-bold text-sm ${activeTab === 'profile' ? 'text-white' : 'text-slate-500'}`}>
                                My Preference Profile
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {loading && !saving ? (
                        <View className="flex-1 justify-center items-center">
                            <ActivityIndicator size="large" color="#3B82F6" />
                        </View>
                    ) : activeTab === 'matches' ? (
                        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                            {matches.length > 0 ? (
                                matches.map((match) => (
                                    <View
                                        key={match.student_id}
                                        className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6"
                                    >
                                        <View className="flex-row items-center justify-between mb-4">
                                            <View className="flex-row items-center space-x-3">
                                                <View className="w-12 h-12 bg-blue-50 rounded-full items-center justify-center">
                                                    <User size={24} color="#3B82F6" />
                                                </View>
                                                <View>
                                                    <Text className="text-primary font-bold text-lg">{match.name}</Text>
                                                    <Text className="text-gray-400 text-xs">Room {match.room_number}</Text>
                                                </View>
                                            </View>
                                            <View className="bg-green-50 px-4 py-2 rounded-2xl">
                                                <Text className="text-green-600 font-bold text-sm">{match.match_percentage}% Match</Text>
                                            </View>
                                        </View>

                                        {match.profile?.bio ? (
                                            <Text className="text-slate-500 text-sm leading-5 mb-4 italic">
                                                "{match.profile.bio}"
                                            </Text>
                                        ) : null}

                                        <View className="flex-row flex-wrap gap-2 mb-4">
                                            <View className="bg-slate-100 px-3 py-1.5 rounded-xl">
                                                <Text className="text-slate-600 text-xs capitalize">💤 {match.profile.sleep_habit.replace('_', ' ')}</Text>
                                            </View>
                                            <View className="bg-slate-100 px-3 py-1.5 rounded-xl">
                                                <Text className="text-slate-600 text-xs capitalize">📖 {match.profile.study_habit}</Text>
                                            </View>
                                            <View className="bg-slate-100 px-3 py-1.5 rounded-xl">
                                                <Text className="text-slate-600 text-xs capitalize">🧹 {match.profile.cleanliness.replace('_', ' ')}</Text>
                                            </View>
                                            <View className="bg-slate-100 px-3 py-1.5 rounded-xl">
                                                <Text className="text-slate-600 text-xs capitalize">🗣️ {match.profile.social_habit}</Text>
                                            </View>
                                        </View>

                                        {match.profile?.interests ? (
                                            <View className="mb-4">
                                                <Text className="text-slate-400 text-[10px] uppercase font-bold mb-1">Interests & Hobbies</Text>
                                                <Text className="text-slate-600 text-xs font-semibold">{match.profile.interests}</Text>
                                            </View>
                                        ) : null}

                                        <View className="h-[1px] bg-slate-50 my-2" />

                                        <View className="flex-row space-x-3 mt-2">
                                            <TouchableOpacity
                                                onPress={() => Alert.alert('Contact', `Email: ${match.email}\nPhone: ${match.phone_number}`)}
                                                className="flex-1 bg-primary py-4 rounded-2xl items-center flex-row justify-center space-x-2"
                                            >
                                                <MessageSquare size={16} color="white" />
                                                <Text className="text-white font-bold text-sm">Contact Roommate</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View className="mt-20 items-center justify-center p-6 bg-white border border-gray-100 rounded-[32px]">
                                    <Sparkles size={64} color="#CBD5E1" />
                                    <Text className="text-primary font-bold text-xl mt-4">Find Compatible Roommates</Text>
                                    <Text className="text-gray-400 text-center mt-2 mb-6 text-sm">
                                        Create your preference profile first, and we'll scan your hostel to match you with compatible students!
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setActiveTab('profile')}
                                        className="bg-blue-50 px-8 py-4 rounded-2xl"
                                    >
                                        <Text className="text-blue-600 font-bold">Create Matching Profile</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </ScrollView>
                    ) : (
                        <ScrollView className="flex-1 p-6" showsVerticalScrollIndicator={false}>
                            <View className="bg-white border border-gray-100 rounded-[32px] p-6 shadow-sm mb-6">
                                <Text className="text-primary font-bold text-lg mb-4">Habits & Lifestyle Preferences</Text>

                                {/* Sleep Habits */}
                                <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Sleep Schedule</Text>
                                <View className="flex-row space-x-2 mb-4">
                                    {['early_bird', 'night_owl', 'flexible'].map((v) => (
                                        <TouchableOpacity
                                            key={v}
                                            onPress={() => setSleepHabit(v as any)}
                                            className={`flex-1 py-3 rounded-xl items-center capitalize ${
                                                sleepHabit === v ? 'bg-blue-600' : 'bg-gray-50 border border-slate-100'
                                            }`}
                                        >
                                            <Text className={`text-xs font-bold ${sleepHabit === v ? 'text-white' : 'text-slate-600'}`}>
                                                {v.replace('_', ' ')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Study Habits */}
                                <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Study Environment</Text>
                                <View className="flex-row space-x-2 mb-4">
                                    {['quiet', 'light_music', 'group'].map((v) => (
                                        <TouchableOpacity
                                            key={v}
                                            onPress={() => setStudyHabit(v as any)}
                                            className={`flex-1 py-3 rounded-xl items-center capitalize ${
                                                studyHabit === v ? 'bg-blue-600' : 'bg-gray-50 border border-slate-100'
                                            }`}
                                        >
                                            <Text className={`text-xs font-bold ${studyHabit === v ? 'text-white' : 'text-slate-600'}`}>
                                                {v.replace('_', ' ')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Cleanliness */}
                                <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Cleanliness Style</Text>
                                <View className="flex-row space-x-2 mb-4">
                                    {['neat_freak', 'moderate', 'relaxed'].map((v) => (
                                        <TouchableOpacity
                                            key={v}
                                            onPress={() => setCleanliness(v as any)}
                                            className={`flex-1 py-3 rounded-xl items-center capitalize ${
                                                cleanliness === v ? 'bg-blue-600' : 'bg-gray-50 border border-slate-100'
                                            }`}
                                        >
                                            <Text className={`text-xs font-bold ${cleanliness === v ? 'text-white' : 'text-slate-600'}`}>
                                                {v.replace('_', ' ')}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Social */}
                                <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Socializing Preference</Text>
                                <View className="flex-row space-x-2 mb-6">
                                    {['introvert', 'extrovert', 'balanced'].map((v) => (
                                        <TouchableOpacity
                                            key={v}
                                            onPress={() => setSocialHabit(v as any)}
                                            className={`flex-1 py-3 rounded-xl items-center capitalize ${
                                                socialHabit === v ? 'bg-blue-600' : 'bg-gray-50 border border-slate-100'
                                            }`}
                                        >
                                            <Text className={`text-xs font-bold ${socialHabit === v ? 'text-white' : 'text-slate-600'}`}>
                                                {v}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Roommate Bio Description</Text>
                                <TextInput
                                    placeholder="Write a brief description of yourself and what you are looking for in a roommate..."
                                    value={bio}
                                    onChangeText={setBio}
                                    multiline
                                    numberOfLines={4}
                                    className="bg-gray-50 border border-slate-100 p-4 rounded-2xl text-slate-800 text-sm mb-4 min-h-[100px]"
                                />

                                <Text className="text-slate-500 font-bold text-xs uppercase mb-2">Interests & Hobbies (Comma separated)</Text>
                                <TextInput
                                    placeholder="e.g. Gaming, Football, Coding, Music"
                                    value={interests}
                                    onChangeText={setInterests}
                                    className="bg-gray-50 border border-slate-100 px-4 py-3 rounded-2xl text-slate-800 text-sm mb-6"
                                />

                                <TouchableOpacity
                                    onPress={handleSaveProfile}
                                    disabled={saving}
                                    className="bg-primary w-full py-5 rounded-2xl items-center"
                                >
                                    {saving ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-bold text-base">Save Matching Profile</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    )}
                </>
            )}
        </SafeAreaView>
    );
}
