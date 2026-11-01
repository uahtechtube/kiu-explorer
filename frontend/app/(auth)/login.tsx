import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, LogIn } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/login', { email, password });
            const { token, user } = response.data;

            await signIn(token, user);
            // Auth routing in _layout will handle redirect to (tabs)
        } catch (error: any) {
            const message = error.response?.data?.message || 'Invalid credentials. Please try again.';
            Alert.alert('Login Failed', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8">
                    {/* Header */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mt-6 w-10 h-10 items-center justify-center rounded-full bg-gray-50"
                    >
                        <ArrowLeft size={24} color="#002147" />
                    </TouchableOpacity>

                    <View className="mt-12">
                        <Text className="text-3xl font-bold text-primary">Welcome Back</Text>
                        <Text className="text-gray-500 mt-2">Sign in to continue your explorer journey</Text>
                    </View>

                    {/* Form */}
                    <View className="mt-12 space-y-6">
                        <View>
                            <Text className="text-primary font-semibold mb-2 ml-1">Email Address</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16">
                                <Mail size={20} color="#6B7280" />
                                <TextInput
                                    className="flex-1 ml-3 text-primary"
                                    placeholder="name@student.kiu.edu.ng"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View>
                            <Text className="text-primary font-semibold mb-2 ml-1">Password</Text>
                            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16">
                                <Lock size={20} color="#6B7280" />
                                <TextInput
                                    className="flex-1 ml-3 text-primary"
                                    placeholder="••••••••"
                                    placeholderTextColor="#9CA3AF"
                                    secureTextEntry={!showPassword}
                                    value={password}
                                    onChangeText={setPassword}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    {showPassword ? (
                                        <EyeOff size={20} color="#6B7280" />
                                    ) : (
                                        <Eye size={20} color="#6B7280" />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity className="items-end">
                            <Text className="text-primary font-bold">Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <View className="mt-12">
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            className="bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/30"
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-white text-lg font-bold mr-2">Login</Text>
                                    <LogIn size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>

                        <View className="flex-row justify-center mt-8">
                            <Text className="text-gray-500">Don't have an account? </Text>
                            <TouchableOpacity onPress={() => router.push('/register')}>
                                <Text className="text-primary font-bold">Sign Up</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
