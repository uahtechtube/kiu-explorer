import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, Send, Calculator, ChevronLeft, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../lib/api';

export default function AIHomeworkHelpPage() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const [questionText, setQuestionText] = useState('');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [selectedBase64, setSelectedBase64] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const pickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets) {
                setSelectedImage(result.assets[0].uri);
                setSelectedBase64(`data:${result.assets[0].mimeType || 'image/jpeg'};base64,${result.assets[0].base64}`);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera permission is required.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                quality: 0.7,
                base64: true,
            });

            if (!result.canceled && result.assets) {
                setSelectedImage(result.assets[0].uri);
                setSelectedBase64(`data:${result.assets[0].mimeType || 'image/jpeg'};base64,${result.assets[0].base64}`);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const handleAnalyze = async () => {
        if (!questionText && !selectedImage) {
            Alert.alert('Empty Input', 'Please enter a question or upload an image.');
            return;
        }

        setIsAnalyzing(true);

        // Navigate to chat with the result or question context
        router.push({
            pathname: '/ai-assistant',
            params: {
                initialQuery: selectedImage
                    ? "I've uploaded an image of a problem. Please analyze it and help me solve it step-by-step."
                    : `Please help me solve this homework problem:\n\n${questionText}\n\nProvide a step-by-step solution.`,
                initialFiles: JSON.stringify(selectedBase64 ? [selectedBase64] : [])
            }
        });

        setIsAnalyzing(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center mb-2">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View className="flex-1">
                        <Text className="text-white text-2xl font-bold">Homework Help</Text>
                        <Text className="text-gray-300 text-sm">Snap a photo or type your problem</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {/* Input Area */}
                <View className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 mb-6">
                    <TextInput
                        value={questionText}
                        onChangeText={setQuestionText}
                        placeholder="Type your homework question here..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        className="text-gray-800 text-base min-h-[120px] mb-4"
                        textAlignVertical="top"
                    />

                    {selectedImage && (
                        <View className="mb-4 relative">
                            <Image
                                source={{ uri: selectedImage }}
                                className="w-full h-48 rounded-2xl bg-gray-100"
                                resizeMode="cover"
                            />
                            <TouchableOpacity
                                onPress={() => setSelectedImage(null)}
                                className="absolute top-2 right-2 bg-black/50 p-1 rounded-full"
                            >
                                <X size={20} color="#FFFFFF" />
                            </TouchableOpacity>
                        </View>
                    )}

                    <View className="flex-row space-x-3 border-t border-gray-100 pt-4">
                        <TouchableOpacity
                            onPress={takePhoto}
                            className="flex-1 bg-blue-50 py-3 rounded-2xl items-center flex-row justify-center"
                        >
                            <Camera size={20} color="#3B82F6" />
                            <Text className="text-blue-600 font-bold ml-2">Camera</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={pickImage}
                            className="flex-1 bg-blue-50 py-3 rounded-2xl items-center flex-row justify-center"
                        >
                            <ImageIcon size={20} color="#3B82F6" />
                            <Text className="text-blue-600 font-bold ml-2">Gallery</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Tips Section */}
                <View className="mb-6">
                    <Text className="text-gray-500 font-bold text-sm mb-3 uppercase tracking-wider">Tips for best results</Text>

                    <View className="bg-white rounded-2xl p-4 mb-2 flex-row items-center border border-gray-100">
                        <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                            <Text className="text-green-600 font-bold">1</Text>
                        </View>
                        <Text className="text-gray-600 flex-1">Ensure the image is clear and well-lit</Text>
                    </View>

                    <View className="bg-white rounded-2xl p-4 mb-2 flex-row items-center border border-gray-100">
                        <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                            <Text className="text-green-600 font-bold">2</Text>
                        </View>
                        <Text className="text-gray-600 flex-1">Crop the image to focus on one problem</Text>
                    </View>

                    <View className="bg-white rounded-2xl p-4 flex-row items-center border border-gray-100">
                        <View className="w-8 h-8 bg-green-100 rounded-full items-center justify-center mr-3">
                            <Text className="text-green-600 font-bold">3</Text>
                        </View>
                        <Text className="text-gray-600 flex-1">Include any specific instructions</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Footer Action */}
            <View 
                style={{ paddingBottom: Math.max(insets.bottom + 16, 36) }}
                className="px-6 pt-4 bg-white border-t border-gray-100"
            >
                <TouchableOpacity
                    onPress={handleAnalyze}
                    disabled={isAnalyzing || (!questionText && !selectedImage)}
                    className={`py-4 rounded-3xl items-center flex-row justify-center ${isAnalyzing || (!questionText && !selectedImage)
                        ? 'bg-gray-300'
                        : 'bg-primary'
                        }`}
                >
                    {isAnalyzing ? (
                        <Text className="text-white font-bold text-lg">Analyzing...</Text>
                    ) : (
                        <>
                            <Calculator size={24} color="#FFFFFF" />
                            <Text className="text-white font-bold text-lg ml-2">Solve Problem</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
