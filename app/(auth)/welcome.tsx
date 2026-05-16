import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GraduationCap, ArrowRight } from 'lucide-react-native';

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-8 justify-between pb-12">
                {/* Top Section - Branding */}
                <View className="items-center mt-20">
                    <View className="w-24 h-24 bg-primary rounded-3xl items-center justify-center shadow-lg shadow-primary/40">
                        <GraduationCap size={48} color="#FFD700" />
                    </View>
                    <Text className="text-3xl font-bold text-primary mt-6 tracking-tight">
                        KIU <Text className="text-secondary">EXPLORER</Text>
                    </Text>
                    <Text className="text-gray-500 text-center mt-2 text-lg">
                        Your Digital Gateway to Excellence
                    </Text>
                </View>

                {/* Middle Section - Illustration/Value Prop */}
                <View className="items-center">
                    <View className="bg-primary/5 p-8 rounded-full">
                        <View className="bg-primary/10 p-6 rounded-full">
                            <Text className="text-primary font-semibold text-center leading-6">
                                Access Tutorials • Join E-Classes{"\n"}Take Exams • Engage Socially
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Section - Actions */}
                <View className="space-y-4">
                    <TouchableOpacity
                        onPress={() => router.push('/login')}
                        className="bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/30"
                    >
                        <Text className="text-white text-lg font-bold mr-2">Begin Your Journey</Text>
                        <ArrowRight size={20} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/register')}
                        className="h-16 rounded-2xl items-center justify-center border-2 border-primary/20"
                    >
                        <Text className="text-primary text-lg font-semibold">Create an Account</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-gray-400 text-sm mt-4">
                        Kashim Ibrahim University © {new Date().getFullYear()}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
