import React from 'react';
import { View, Text } from 'react-native';
import { Calendar, BookOpen, ChevronRight } from 'lucide-react-native';
import { PremiumCard } from './PremiumCard';
import { StatusBadge } from './StatusBadge';

interface AssignmentCardProps {
    assignment: {
        id: number;
        title: string;
        course?: {
            code: string;
            name: string;
        };
        course_name?: string;
        due_date: string;
        max_score: number;
        status: 'pending' | 'submitted' | 'graded';
        score?: number;
    };
    onPress?: () => void;
}

export const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment, onPress }) => {
    const isOverdue = new Date(assignment.due_date) < new Date() && assignment.status === 'pending';
    const courseName = assignment.course?.name || assignment.course_name || 'General';

    return (
        <PremiumCard
            onPress={onPress}
            variant="elevated"
            className="mb-4"
        >
            <View className="flex-row justify-between items-start">
                <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                        <View className="bg-primary/5 p-1.5 rounded-lg mr-2">
                            <BookOpen size={16} color="#002147" />
                        </View>
                        <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                            {courseName}
                        </Text>
                    </View>
                    <Text className="text-primary text-lg font-bold mb-3" numberOfLines={2}>
                        {assignment.title}
                    </Text>
                </View>
                <StatusBadge status={isOverdue ? 'overdue' : assignment.status} />
            </View>

            <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-gray-50">
                <View className="flex-row items-center">
                    <Calendar size={14} color="#64748B" />
                    <Text className="text-gray-400 text-xs ml-1.5">
                        {new Date(assignment.due_date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                        })}
                    </Text>
                </View>

                <View className="flex-row items-center">
                    {assignment.status === 'graded' ? (
                        <View className="flex-row items-center">
                            <Text className="text-primary font-bold">{assignment.score}</Text>
                            <Text className="text-gray-400 text-xs"> / {assignment.max_score}</Text>
                        </View>
                    ) : (
                        <View className="flex-row items-center">
                            <Text className="mr-1 text-primary/60 text-xs">Detail</Text>
                            <ChevronRight size={14} color="#002147" />
                        </View>
                    )}
                </View>
            </View>
        </PremiumCard>
    );
};
