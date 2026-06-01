import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';

const LogoImage = require('../../assets/images/logo.jpg');

export default function WelcomeScreen() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 px-8 justify-between pb-12">
                {/* Top Section - Branding with Custom Logo */}
                <View className="items-center mt-12">
                    <View className="shadow-xl shadow-primary/10 rounded-[32px] overflow-hidden bg-white p-1 border border-gray-100">
                        <Image
                            source={LogoImage}
                            className="w-32 h-32 rounded-[28px]"
                            resizeMode="contain"
                        />
                    </View>
                    <Text className="text-gray-500 text-center mt-6 text-base font-medium tracking-wide">
                        Your Digital Gateway to Excellence
                    </Text>
                </View>

                {/* Middle Section - Illustration/Value Prop */}
                <View className="items-center my-6">
                    <View className="bg-primary/5 p-8 rounded-[36px] border border-primary/5">
                        <View className="bg-primary/10 p-6 rounded-[28px]">
                            <Text className="text-primary font-semibold text-center leading-6 text-sm">
                                Access Tutorials • Join E-Classes{"\n"}Take Exams • Engage Socially
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Bottom Section - Actions with Safe Spacing */}
                <View className="pb-4">
                    <TouchableOpacity
                        onPress={() => router.push('/login')}
                        className="bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/30 mb-5"
                    >
                        <Text className="text-white text-lg font-bold mr-2">Login</Text>
                        <ArrowRight size={20} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/register')}
                        className="h-16 rounded-2xl items-center justify-center border-2 border-primary/20 mb-6"
                    >
                        <Text className="text-primary text-lg font-bold">Create an Account</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-gray-400 text-xs mt-2">
                        Kashim Ibrahim University © {new Date().getFullYear()}
                    </Text>
                </View>
            </View>
        </SafeAreaView>
    );
}
