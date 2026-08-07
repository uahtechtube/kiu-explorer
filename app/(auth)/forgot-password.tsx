import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, KeyRound, ArrowRight, CheckCircle2 } from 'lucide-react-native';
import api from '../../lib/api';

export default function ForgotPasswordScreen() {
    const router = useRouter();

    const [step, setStep] = useState<1 | 2>(1);
    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [sentEmail, setSentEmail] = useState('');

    const handleSendCode = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await api.post('/forgot-password', { email });
            setSentEmail(email);
            if (response.data?.code) {
                setCode(response.data.code);
            }
            setStep(2);
            Alert.alert('Code Sent', response.data?.message || 'Check your email for the password reset code.');
        } catch (error: any) {
            const message = error.response?.data?.message
                || error.response?.data?.email?.[0]
                || 'Failed to send reset code. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!code || !password || !passwordConfirmation) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        if (password !== passwordConfirmation) {
            Alert.alert('Error', 'Passwords do not match.');
            return;
        }
        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters.');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/reset-password', {
                email: sentEmail,
                token: code.trim(),
                password,
                password_confirmation: passwordConfirmation,
            });
            Alert.alert(
                'Password Reset',
                'Your password has been reset successfully. You can now sign in.',
                [{ text: 'OK', onPress: () => router.replace('/login') }]
            );
        } catch (error: any) {
            const message = error.response?.data?.message
                || error.response?.data?.password?.[0]
                || 'Failed to reset password. Please try again.';
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}
                className="flex-1"
            >
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
                    className="px-8"
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets={true}
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-gray-100 rounded-2xl items-center justify-center mt-4"
                    >
                        <ArrowLeft size={22} color="#002147" />
                    </TouchableOpacity>

                    <View className="mt-6 mb-8">
                        <Text className="text-primary font-black text-2xl">Forgot Password</Text>
                        <Text className="text-gray-400 text-sm mt-2 leading-5">
                            {step === 1
                                ? 'Enter the email address linked to your account and we will send you a password reset code.'
                                : `Enter the reset code sent to ${sentEmail || 'your email'} and choose a new password.`}
                        </Text>
                    </View>

                    {step === 1 ? (
                        <View className="space-y-4">
                            <View>
                                <Text className="text-primary font-bold text-sm mb-1.5 ml-1">Email Address</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16 shadow-inner">
                                    <Mail size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary text-base font-semibold"
                                        placeholder="name@student.kiu.edu.ng"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        value={email}
                                        onChangeText={setEmail}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSendCode}
                                disabled={isLoading}
                                className="bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/30 mt-6"
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white text-lg font-bold mr-2">Send Reset Code</Text>
                                        <ArrowRight size={20} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View className="space-y-4">
                            <View>
                                <Text className="text-primary font-bold text-sm mb-1.5 ml-1">Reset Code</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16 shadow-inner">
                                    <KeyRound size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary text-base font-semibold"
                                        placeholder="Paste the code from your email"
                                        placeholderTextColor="#9CA3AF"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        value={code}
                                        onChangeText={setCode}
                                    />
                                </View>
                                {!!code && (
                                    <Text className="text-green-600 text-xs font-semibold mt-1.5 ml-1">
                                        Code filled in automatically (development mode).
                                    </Text>
                                )}
                            </View>

                            <View>
                                <Text className="text-primary font-bold text-sm mb-1.5 ml-1">New Password</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16 shadow-inner">
                                    <Lock size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary text-base font-semibold"
                                        placeholder="Minimum 8 characters"
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

                            <View>
                                <Text className="text-primary font-bold text-sm mb-1.5 ml-1">Confirm New Password</Text>
                                <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-16 shadow-inner">
                                    <Lock size={20} color="#6B7280" />
                                    <TextInput
                                        className="flex-1 ml-3 text-primary text-base font-semibold"
                                        placeholder="Repeat new password"
                                        placeholderTextColor="#9CA3AF"
                                        secureTextEntry={!showPassword}
                                        value={passwordConfirmation}
                                        onChangeText={setPasswordConfirmation}
                                    />
                                </View>
                            </View>

                            <View className="flex-row space-x-4 mt-6">
                                <TouchableOpacity
                                    onPress={() => setStep(1)}
                                    className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center"
                                >
                                    <ArrowLeft size={24} color="#002147" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleResetPassword}
                                    disabled={isLoading}
                                    className="flex-1 bg-primary h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-primary/30"
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Text className="text-white text-lg font-bold mr-2">Reset Password</Text>
                                            <CheckCircle2 size={20} color="white" />
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
