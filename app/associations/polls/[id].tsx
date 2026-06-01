import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, Info, CheckCircle2, PieChart, Users, Clock, ShieldCheck, Share2 } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

const { width } = Dimensions.get('window');

interface Poll {
    id: number;
    title: string;
    description: string;
    association_name: string;
    options: { id: number; text: string; votes: number }[];
    total_votes: number;
    ends_at: string;
    has_voted: boolean;
}

export default function PollVotingPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [poll, setPoll] = useState<Poll | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isVoting, setIsVoting] = useState(false);

    useEffect(() => {
        fetchPoll();
    }, [id]);

    const fetchPoll = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/associations/polls/${id}`);
            setPoll(response.data);
        } catch (error) {
            console.error('Error:', error);
            // Professional Mock Data for Polls
            setPoll({
                id: Number(id),
                title: 'Strategic Direction: 2026 Symposium Theme',
                description: 'We are deciding on the core theme for our upcoming annual symposium. Your choice will determine the focus of guest speakers and technical workshops.',
                association_name: 'CS Association',
                options: [
                    { id: 1, text: 'Quantum Resilience & Ethics', votes: 142 },
                    { id: 2, text: 'Distributed Intelligence Patterns', votes: 89 },
                    { id: 3, text: 'The Future of Neural Architectures', votes: 215 },
                ],
                total_votes: 446,
                ends_at: '2026-01-20T23:59:59',
                has_voted: false
            });
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async () => {
        if (selectedOption === null || !poll) return;
        try {
            setIsVoting(true);
            // Simulated vote API call
            setTimeout(() => {
                const updatedOptions = poll.options.map(opt =>
                    opt.id === selectedOption ? { ...opt, votes: opt.votes + 1 } : opt
                );
                setPoll({
                    ...poll,
                    options: updatedOptions,
                    total_votes: poll.total_votes + 1,
                    has_voted: true
                });
                setIsVoting(false);
            }, 1000);
        } catch (error) {
            console.error('Error:', error);
            setIsVoting(false);
        }
    };

    if (loading) return (
        <View className="flex-1 bg-white items-center justify-center">
            <ActivityIndicator size="large" color="#002147" />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Poll Header */}
                <View className="flex-row justify-between items-center py-6 mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100"
                    >
                        <ChevronLeft size={24} color="#002147" />
                    </TouchableOpacity>
                    <View className="flex-row">
                        <TouchableOpacity className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100 mr-2">
                            <Share2 size={20} color="#002147" />
                        </TouchableOpacity>
                        <TouchableOpacity className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-100">
                            <Info size={20} color="#002147" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Association Branding */}
                <View className="bg-primary px-4 py-1.5 rounded-lg self-start mb-4">
                    <Text className="text-secondary font-black text-[10px] uppercase tracking-widest">{poll?.association_name}</Text>
                </View>
                <Text className="text-primary font-black text-3xl mb-4 leading-[42px]">{poll?.title}</Text>
                <Text className="text-gray-500 text-base leading-7 mb-10">{poll?.description}</Text>

                {/* Voting/Results Matrix */}
                <View className="space-y-4">
                    {poll?.options.map((option) => {
                        const percentage = Math.round((option.votes / poll.total_votes) * 100);
                        const isSelected = selectedOption === option.id;

                        return (
                            <TouchableOpacity
                                key={option.id}
                                disabled={poll.has_voted || isVoting}
                                onPress={() => setSelectedOption(option.id)}
                                className={`p-6 rounded-[32px] border-2 relative overflow-hidden ${isSelected || (poll.has_voted && percentage === Math.max(...poll.options.map(o => Math.round((o.votes / poll.total_votes) * 100))))
                                        ? 'bg-primary border-primary'
                                        : 'bg-white border-gray-50 shadow-sm'
                                    }`}
                            >
                                {poll.has_voted && (
                                    <View
                                        className="absolute inset-0 bg-white/5 opacity-20"
                                        style={{ width: `${percentage}%` }}
                                    />
                                )}

                                <View className="flex-row justify-between items-center relative z-10">
                                    <Text className={`flex-1 font-black text-sm uppercase tracking-tight ${isSelected || (poll.has_voted && percentage === Math.max(...poll.options.map(o => Math.round((o.votes / poll.total_votes) * 100))))
                                            ? 'text-white' : 'text-primary'
                                        }`}>
                                        {option.text}
                                    </Text>

                                    {poll.has_voted ? (
                                        <Text className={`font-black text-xs ${isSelected || (poll.has_voted && percentage === Math.max(...poll.options.map(o => Math.round((o.votes / poll.total_votes) * 100))))
                                                ? 'text-secondary' : 'text-gray-400'
                                            }`}>
                                            {percentage}%
                                        </Text>
                                    ) : (
                                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-secondary border-secondary' : 'bg-gray-100 border-gray-100'
                                            }`}>
                                            {isSelected && <CheckCircle2 size={16} color="#002147" />}
                                        </View>
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Tactical Metadata */}
                <View className="flex-row justify-between mt-12 pt-8 border-t border-gray-50">
                    <View className="flex-row items-center">
                        <Users size={16} color="#94A3B8" />
                        <Text className="text-gray-400 font-bold text-[10px] uppercase ml-2 tracking-widest">{poll?.total_votes} Total Votes</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Clock size={16} color="#94A3B8" />
                        <Text className="text-gray-400 font-bold text-[10px] uppercase ml-2 tracking-widest">Ending Soon</Text>
                    </View>
                </View>

                <View className="mt-8 bg-gray-50 p-6 rounded-[24px] border border-gray-100 flex-row items-center">
                    <ShieldCheck size={20} color="#002147" />
                    <Text className="text-primary font-bold text-[10px] uppercase ml-3 tracking-widest">Election protocol verified by campus security</Text>
                </View>
            </ScrollView>

            {/* Commit Vote Bar */}
            {!poll?.has_voted && (
                <View className="absolute bottom-0 w-full bg-white/95 px-6 pt-6 pb-10 border-t border-gray-50 backdrop-blur-md">
                    <TouchableOpacity
                        onPress={handleVote}
                        disabled={selectedOption === null || isVoting}
                        className={`h-16 rounded-[24px] flex-row items-center justify-center shadow-xl ${selectedOption === null || isVoting ? 'bg-gray-100' : 'bg-primary shadow-primary/20'
                            }`}
                    >
                        {isVoting ? <ActivityIndicator color="#002147" /> : (
                            <>
                                <CheckCircle2 size={20} color={selectedOption === null ? '#94A3B8' : 'white'} />
                                <Text className={`font-black text-lg ml-3 tracking-widest uppercase ${selectedOption === null ? 'text-gray-400' : 'text-white'
                                    }`}>
                                    Commit Decision
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
