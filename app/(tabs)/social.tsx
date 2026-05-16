import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Heart, MessageCircle, Share2, MoreHorizontal, Plus } from 'lucide-react-native';

export default function SocialHubScreen() {
    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row justify-between items-center border-b border-gray-100">
                <Text className="text-2xl font-bold text-primary">Social Hub</Text>
                <TouchableOpacity className="bg-primary p-2 rounded-full">
                    <Plus size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 bg-gray-50">
                {/* Stories/Associations Circle */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-6 px-6 bg-white">
                    <View className="items-center mr-6">
                        <TouchableOpacity className="w-16 h-16 rounded-full border-2 border-dashed border-primary items-center justify-center">
                            <Camera size={24} color="#002147" />
                        </TouchableOpacity>
                        <Text className="text-[10px] mt-2 text-primary font-semibold">Post</Text>
                    </View>

                    {[1, 2, 3, 4, 5].map((_, i) => (
                        <View key={i} className="items-center mr-6">
                            <View className="w-16 h-16 rounded-full border-2 border-secondary bg-gray-100 overflow-hidden">
                                <View className="bg-primary/10 flex-1 items-center justify-center">
                                    <Text className="text-primary font-bold">SUG</Text>
                                </View>
                            </View>
                            <Text className="text-[10px] mt-2 text-gray-500 font-medium">Association</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* Feed */}
                <View className="px-4 mt-4 pb-10">
                    {[1, 2].map((_, i) => (
                        <View key={i} className="bg-white rounded-[32px] mb-6 shadow-sm overflow-hidden border border-gray-100">
                            {/* Post Header */}
                            <View className="flex-row items-center justify-between p-4">
                                <View className="flex-row items-center">
                                    <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                        <Text className="font-bold text-primary">UA</Text>
                                    </View>
                                    <View>
                                        <Text className="font-bold text-primary">Umar Alhaji</Text>
                                        <Text className="text-gray-400 text-[10px]">2 hours ago • Faculty of Law</Text>
                                    </View>
                                </View>
                                <TouchableOpacity><MoreHorizontal size={20} color="#9CA3AF" /></TouchableOpacity>
                            </View>

                            {/* Post Image Placeholder */}
                            <View className="h-64 bg-gray-100 mx-4 rounded-3xl items-center justify-center">
                                <Text className="text-gray-300">Shared Moment Preview</Text>
                            </View>

                            {/* Post Content */}
                            <View className="p-4">
                                <Text className="text-gray-700 leading-5">
                                    Just finished the first lecture on Constitutional Law. KIU Explorer makes it so easy to follow up with tutorials! #KIU #LawStudent
                                </Text>
                            </View>

                            {/* Actions */}
                            <View className="flex-row items-center px-4 pb-4 mt-2">
                                <TouchableOpacity className="flex-row items-center mr-6">
                                    <Heart size={22} color="#E63946" />
                                    <Text className="ml-2 text-gray-500 font-medium">124</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-row items-center mr-6">
                                    <MessageCircle size={22} color="#6B7280" />
                                    <Text className="ml-2 text-gray-500 font-medium">18</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-row items-center">
                                    <Share2 size={22} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
