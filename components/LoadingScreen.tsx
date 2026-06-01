import React from 'react';
import { View, ActivityIndicator, Text, Image } from 'react-native';

const LogoImage = require('../assets/images/logo.jpg');

export default function LoadingScreen() {
    return (
        <View className="flex-1 bg-white items-center justify-center px-8">
            <View className="shadow-2xl shadow-primary/20 rounded-[32px] overflow-hidden bg-white p-1 border border-gray-100 mb-8">
                <Image
                    source={LogoImage}
                    className="w-28 h-28 rounded-[28px]"
                    resizeMode="contain"
                />
            </View>
            <Text className="text-2xl font-black text-primary mb-2 tracking-tight text-center">
                Welcome to KIU Explorer
            </Text>
            <Text className="text-gray-400 text-sm text-center mb-6">
                Your Digital Gateway to Excellence
            </Text>
            <ActivityIndicator size="large" color="#002147" />
        </View>
    );
}
