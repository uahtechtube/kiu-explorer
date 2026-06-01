import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Target, AlertCircle, RefreshCw, Trophy, ArrowRight, Zap } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

const { width } = Dimensions.get('window');

interface Question {
    id: number;
    text: string;
    options: string[];
    correct_option: number;
}

export default function QuizInterfacePage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizFinished, setQuizFinished] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => {
        fetchQuizDetails();
    }, [id]);

    const fetchQuizDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/quizzes/${id}`);
            setQuestions(response.data.questions || []);
        } catch (error) {
            console.error('Error:', error);
            // Professional Mock Questions for Practice
            setQuestions([
                { id: 1, text: 'Which protocol is used for failure detection in the Gossiping algorithm?', options: ['SWIM Protocol', 'Heartbeat', 'Ping-Pong', 'UDP Broadcast'], correct_option: 0 },
                { id: 2, text: 'What is the primary goal of the Vector Clock mechanism?', options: ['Clock Sync', 'Causal Ordering', 'Logical Ranking', 'Throughput'], correct_option: 1 },
                { id: 3, text: 'Which of these is a solution for the Byzantine Generals Problem?', options: ['Raft', 'Paxos', 'Practical BFT', 'Two-Phase Commit'], correct_option: 2 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (currentStep < questions.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            setQuizFinished(true);
        }
    };

    const handleFinish = () => {
        setQuizFinished(true);
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach((q, idx) => {
            if (selectedAnswers[idx] === q.correct_option) score++;
        });
        return Math.round((score / questions.length) * 100);
    };

    if (loading) return (
        <View className="flex-1 bg-white items-center justify-center">
            <ActivityIndicator size="large" color="#002147" />
        </View>
    );

    if (quizFinished) {
        const score = calculateScore();
        return (
            <SafeAreaView className="flex-1 bg-white px-6 py-10">
                <View className="items-center mb-10 pt-10">
                    <PremiumCard variant="elevated" className="w-24 h-24 rounded-[32px] items-center justify-center bg-secondary shadow-xl shadow-secondary/30 mb-6">
                        <Trophy size={48} color="#002147" />
                    </PremiumCard>
                    <Text className="text-primary font-black text-4xl mb-2">Well Done!</Text>
                    <Text className="text-gray-400 font-bold uppercase tracking-widest">Mastery Session Complete</Text>
                </View>

                <PremiumCard variant="glass" className="p-8 border-gray-100 bg-gray-50/50 items-center mb-10">
                    <Text className="text-gray-400 text-xs font-black uppercase tracking-[4px] mb-2">Final Proficiency</Text>
                    <Text className="text-primary text-6xl font-black">{score}%</Text>
                    <View className="w-full h-1 bg-gray-200 rounded-full mt-6 overflow-hidden">
                        <View className="h-full bg-secondary" style={{ width: `${score}%` }} />
                    </View>
                </PremiumCard>

                <View className="flex-row justify-between mb-10">
                    <View className="items-center w-[48%] bg-gray-50 p-6 rounded-3xl">
                        <Clock size={24} color="#002147" />
                        <Text className="text-primary font-black text-lg mt-2">08:24</Text>
                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Total Time</Text>
                    </View>
                    <View className="items-center w-[48%] bg-gray-50 p-6 rounded-3xl">
                        <Target size={24} color="#002147" />
                        <Text className="text-primary font-black text-lg mt-2">Elite</Text>
                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Drill Rank</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => router.back()}
                    className="h-16 bg-primary rounded-[24px] items-center justify-center shadow-xl shadow-primary/20"
                >
                    <Text className="text-white font-black text-lg tracking-widest uppercase">Return to Hub</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    if (!quizStarted) {
        return (
            <SafeAreaView className="flex-1 bg-primary px-6 py-10">
                <TouchableOpacity onPress={() => router.back()} className="mb-10 w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20">
                    <ChevronLeft size={24} color="white" />
                </TouchableOpacity>

                <View className="flex-1 items-center justify-center">
                    <PremiumCard variant="glass" className="h-20 w-20 rounded-[24px] items-center justify-center mb-8 border-white/20">
                        <Zap size={32} color="#FFD700" />
                    </PremiumCard>
                    <Text className="text-white text-3xl font-black text-center mb-4">Are you ready to transcend your limits?</Text>
                    <Text className="text-white/60 text-center text-base font-medium leading-6 mb-12">
                        This practice drill consists of {questions.length} elite questions designed to test your core understanding.
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={() => setQuizStarted(true)}
                    className="h-20 bg-secondary rounded-[32px] items-center justify-center flex-row shadow-2xl shadow-secondary/20"
                >
                    <Text className="text-primary font-black text-xl tracking-widest uppercase">Initiate Protocol</Text>
                    <ArrowRight size={20} color="#002147" className="ml-4" />
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Quiz Progress Header */}
            <View className="px-6 pt-4 mb-10">
                <View className="flex-row justify-between items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()}>
                        <XCircle size={24} color="#CBD5E1" />
                    </TouchableOpacity>
                    <View className="bg-gray-100 px-4 py-1.5 rounded-xl border border-gray-200">
                        <Text className="text-primary font-black text-[10px] uppercase">Question {currentStep + 1} of {questions.length}</Text>
                    </View>
                    <View className="flex-row items-center border border-primary/10 px-3 py-1.5 rounded-xl">
                        <Clock size={12} color="#002147" />
                        <Text className="text-primary font-black text-[10px] ml-2">12:45</Text>
                    </View>
                </View>
                <View className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                    <View
                        className="h-full bg-secondary"
                        style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
                    />
                </View>
            </View>

            <ScrollView className="px-6 flex-1">
                <Text className="text-primary font-black text-2xl leading-10 mb-10">
                    {questions[currentStep].text}
                </Text>

                <View className="space-y-4">
                    {questions[currentStep].options.map((option, idx) => {
                        const isSelected = selectedAnswers[currentStep] === idx;
                        return (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => setSelectedAnswers({ ...selectedAnswers, [currentStep]: idx })}
                                className={`p-6 rounded-[24px] border-2 flex-row items-center justify-between ${isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-100'
                                    }`}
                            >
                                <Text className={`flex-1 font-bold text-base ${isSelected ? 'text-white' : 'text-primary'}`}>
                                    {option}
                                </Text>
                                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'bg-secondary border-secondary' : 'bg-gray-100 border-gray-100'
                                    }`}>
                                    {isSelected && <CheckCircle2 size={16} color="#002147" />}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View className="px-6 pt-6 pb-10 border-t border-gray-100">
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={selectedAnswers[currentStep] === undefined}
                    className={`h-16 rounded-[24px] flex-row items-center justify-center shadow-xl ${selectedAnswers[currentStep] === undefined ? 'bg-gray-100' : 'bg-primary shadow-primary/20'
                        }`}
                >
                    <Text className={`font-black text-lg tracking-widest uppercase ${selectedAnswers[currentStep] === undefined ? 'text-gray-400' : 'text-white'
                        }`}>
                        {currentStep === questions.length - 1 ? 'Finalize Drill' : 'Continue'}
                    </Text>
                    {currentStep !== questions.length - 1 && <ChevronRight size={20} color={selectedAnswers[currentStep] === undefined ? '#94A3B8' : 'white'} className="ml-2" />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
