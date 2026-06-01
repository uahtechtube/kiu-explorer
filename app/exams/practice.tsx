import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Brain, BookOpen, Calculator, Code, Globe, ChevronLeft, Play } from 'lucide-react-native';
import api from '../../lib/api';

interface QuizCategory {
    id: number;
    name: string;
    description: string;
    icon: string;
    quiz_count: number;
    total_questions: number;
    color: string;
}

interface Quiz {
    id: number;
    title: string;
    category: string;
    questions_count: number;
    difficulty: 'easy' | 'medium' | 'hard';
    estimated_time: number;
}

export default function PracticeQuizzesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<QuizCategory[]>([]);
    const [popularQuizzes, setPopularQuizzes] = useState<Quiz[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        fetchPracticeData();
    }, []);

    const fetchPracticeData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/practice-quizzes');
            setCategories(response.data.categories || []);
            setPopularQuizzes(response.data.popular || []);
        } catch (error) {
            console.error('Error fetching practice data:', error);
            setCategories([]);
            setPopularQuizzes([]);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (iconName: string) => {
        switch (iconName) {
            case 'code':
                return Code;
            case 'brain':
                return Brain;
            case 'calculator':
                return Calculator;
            case 'globe':
                return Globe;
            default:
                return BookOpen;
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return '#10B981';
            case 'medium':
                return '#F59E0B';
            case 'hard':
                return '#EF4444';
            default:
                return '#6B7280';
        }
    };

    const handleStartQuiz = (quizId: number) => {
        router.push(`/quizzes/${quizId}` as any);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white text-3xl font-bold">Practice Quizzes</Text>
                        <Text className="text-gray-300 text-sm mt-1">Test your knowledge anytime</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {loading ? (
                    <View className="flex-1 items-center justify-center py-20">
                        <ActivityIndicator size="large" color="#002147" />
                        <Text className="text-gray-500 mt-4">Loading quizzes...</Text>
                    </View>
                ) : (
                    <>
                        {/* Categories */}
                        <View className="mb-6">
                            <Text className="text-primary font-bold text-xl mb-4">Categories</Text>

                            {categories.map((category) => {
                                const IconComponent = getCategoryIcon(category.icon);
                                const isSelected = selectedCategory === category.name;
                                return (
                                    <TouchableOpacity
                                        key={category.id}
                                        onPress={() => setSelectedCategory(isSelected ? null : category.name)}
                                        className={`bg-white rounded-3xl p-5 mb-4 shadow-sm border ${isSelected ? 'border-secondary border-2' : 'border-gray-100'}`}
                                    >
                                        <View className="flex-row items-center">
                                            <View
                                                className="w-16 h-16 rounded-2xl items-center justify-center"
                                                style={{ backgroundColor: `${category.color}15` }}
                                            >
                                                <IconComponent size={32} color={category.color} />
                                            </View>

                                            <View className="flex-1 ml-4">
                                                <Text className="text-primary font-bold text-lg mb-1">
                                                    {category.name}
                                                </Text>
                                                <Text className="text-gray-500 text-sm mb-2">
                                                    {category.description}
                                                </Text>
                                                <View className="flex-row items-center">
                                                    <Text className="text-gray-600 text-xs">
                                                        {category.quiz_count} quizzes
                                                    </Text>
                                                    <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                                                    <Text className="text-gray-600 text-xs">
                                                        {category.total_questions} questions
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                                                <Text className="text-gray-600 font-bold">→</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Popular Quizzes */}
                        <View className="mb-8">
                            <Text className="text-primary font-bold text-xl mb-4">
                                {selectedCategory ? `${selectedCategory} Quizzes` : 'Popular Quizzes'}
                            </Text>

                            {popularQuizzes
                                .filter((q) => !selectedCategory || q.category.toLowerCase() === selectedCategory.toLowerCase())
                                .map((quiz) => (
                                    <View
                                        key={quiz.id}
                                    className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100"
                                >
                                    {/* Quiz Header */}
                                    <View className="flex-row items-start justify-between mb-3">
                                        <View className="flex-1">
                                            <Text className="text-primary font-bold text-lg mb-1">{quiz.title}</Text>
                                            <Text className="text-gray-500 text-sm">{quiz.category}</Text>
                                        </View>
                                        <View
                                            className="px-3 py-1 rounded-full"
                                            style={{ backgroundColor: `${getDifficultyColor(quiz.difficulty)}15` }}
                                        >
                                            <Text
                                                className="text-xs font-bold uppercase"
                                                style={{ color: getDifficultyColor(quiz.difficulty) }}
                                            >
                                                {quiz.difficulty}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Quiz Info */}
                                    <View className="flex-row items-center mb-4 pt-3 border-t border-gray-100">
                                        <View className="flex-1">
                                            <Text className="text-gray-500 text-xs">Questions</Text>
                                            <Text className="text-primary font-bold">{quiz.questions_count}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-gray-500 text-xs">Est. Time</Text>
                                            <Text className="text-primary font-bold">{quiz.estimated_time} min</Text>
                                        </View>
                                    </View>

                                    {/* Start Button */}
                                    <TouchableOpacity
                                        onPress={() => handleStartQuiz(quiz.id)}
                                        className="bg-primary py-3 rounded-2xl items-center flex-row justify-center"
                                    >
                                        <Play size={16} color="#FFFFFF" />
                                        <Text className="text-white font-bold ml-2">Start Quiz</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>

                        {/* Info Card */}
                        <View className="bg-blue-50 border-2 border-blue-200 rounded-3xl p-5 mb-8">
                            <Text className="text-blue-900 font-bold text-base mb-2">
                                💡 Practice Makes Perfect
                            </Text>
                            <Text className="text-blue-800 text-sm leading-6">
                                Practice quizzes help you prepare for exams. Take them as many times as you want
                                with instant feedback on your answers. No time limits, no pressure!
                            </Text>
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
