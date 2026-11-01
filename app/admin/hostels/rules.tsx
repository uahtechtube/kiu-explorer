import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    ChevronLeft, Moon, Users, Utensils, Wifi,
    Shield, AlertTriangle, Volume2, LogIn,
} from 'lucide-react-native';

interface RuleSection {
    title: string;
    icon: React.ComponentType<any>;
    color: string;
    rules: string[];
}

const RULE_SECTIONS: RuleSection[] = [
    {
        title: 'Access & Curfew',
        icon: LogIn,
        color: '#3B82F6',
        rules: [
            'Main gate closes at 11:00 PM on weekdays and 12:00 AM on weekends.',
            'Students out after curfew must notify the hostel administrator in advance.',
            'Visitor access is strictly between 8:00 AM and 8:00 PM.',
            'No overnight visitors are permitted in the hostel at any time.',
        ],
    },
    {
        title: 'Noise & Quiet Hours',
        icon: Volume2,
        color: '#8B5CF6',
        rules: [
            'Quiet hours are enforced from 10:00 PM to 6:00 AM daily.',
            'Loud music, parties, or group gatherings must not disturb other residents.',
            'TV and audio equipment volume must be kept at reasonable levels at all times.',
        ],
    },
    {
        title: 'Room & Facility Use',
        icon: Utensils,
        color: '#10B981',
        rules: [
            'Cooking is permitted only in designated kitchen areas.',
            'Gas cookers and electric stoves are strictly prohibited in bedrooms.',
            'Students are responsible for maintaining cleanliness in shared bathrooms and common areas.',
            'Disposing of waste must be done in designated bins outside.',
            'Furniture provided is for hostel use only and must not be moved or damaged.',
        ],
    },
    {
        title: 'Visitors & Guests',
        icon: Users,
        color: '#F59E0B',
        rules: [
            'All visitors must be registered at the reception before entry.',
            'Students are responsible for the conduct of their visitors.',
            'Visitors of the opposite sex are not allowed beyond the reception lounge.',
        ],
    },
    {
        title: 'Internet & Utilities',
        icon: Wifi,
        color: '#06B6D4',
        rules: [
            'Wi-Fi is provided for academic purposes and reasonable personal use.',
            'Excessive bandwidth usage (e.g., video streaming during peak hours) may be throttled.',
            'Power outlets must not be overloaded — no more than two devices per socket.',
            'Report any electrical, plumbing, or infrastructure faults immediately via the app.',
        ],
    },
    {
        title: 'Security',
        icon: Shield,
        color: '#EF4444',
        rules: [
            'Do not share your room key or access card with anyone.',
            'Report lost keys or cards to the administration within 24 hours.',
            'Suspicious persons or activities must be reported to security immediately.',
            'Possession of illegal substances, weapons, or contraband is grounds for immediate eviction.',
        ],
    },
    {
        title: 'Sleeping Hours',
        icon: Moon,
        color: '#6366F1',
        rules: [
            'Lights-out is recommended at 12:00 AM.',
            'Residents are encouraged to maintain a healthy sleep schedule to support academics.',
        ],
    },
    {
        title: 'Violations & Penalties',
        icon: AlertTriangle,
        color: '#DC2626',
        rules: [
            'First-time violations result in a formal written warning.',
            'Repeated violations may lead to suspension of hostel privileges or eviction.',
            'Damage to hostel property will be charged to the responsible student.',
            'Serious misconduct is reported to the university disciplinary committee.',
        ],
    },
];

export default function HostelRules() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center border-b border-gray-50">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ChevronLeft size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text className="text-primary text-xl font-bold">Hostel Rules & Guidelines</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                {/* Banner */}
                <View className="bg-primary/5 rounded-[32px] p-6 mb-8 border border-primary/10">
                    <Text className="text-primary font-bold text-lg mb-1">Campus Accommodation Policy</Text>
                    <Text className="text-slate-500 text-xs leading-5">
                        These rules apply to all students residing in university hostels. Compliance
                        ensures a safe, respectful, and productive environment for everyone.
                        Violations are handled according to the university's disciplinary code.
                    </Text>
                </View>

                {RULE_SECTIONS.map((section, index) => (
                    <View
                        key={index}
                        className="bg-white border border-gray-100 rounded-[28px] p-5 mb-5 shadow-sm"
                    >
                        {/* Section Header */}
                        <View className="flex-row items-center mb-4">
                            <View
                                className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
                                style={{ backgroundColor: `${section.color}15` }}
                            >
                                <section.icon size={20} color={section.color} />
                            </View>
                            <Text className="text-primary font-bold text-base">{section.title}</Text>
                        </View>

                        {/* Rules */}
                        {section.rules.map((rule, rIndex) => (
                            <View key={rIndex} className="flex-row mb-3">
                                <View
                                    className="w-1.5 h-1.5 rounded-full mt-1.5 mr-3"
                                    style={{ backgroundColor: section.color }}
                                />
                                <Text className="text-gray-600 text-sm leading-5 flex-1">{rule}</Text>
                            </View>
                        ))}
                    </View>
                ))}

                {/* Footer note */}
                <View className="bg-amber-50 rounded-2xl p-4 mt-2 mb-6 border border-amber-100">
                    <Text className="text-amber-700 text-xs leading-5 text-center font-medium">
                        These rules are effective for the current academic session.
                        Students are expected to have read and acknowledged these guidelines upon check-in.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
