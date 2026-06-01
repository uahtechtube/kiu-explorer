import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Calendar, MapPin, Users, FileText, Tag } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../lib/api';

export default function CreateEventPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Social',
        venue: '',
        start_time: new Date(),
        end_time: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours later
        capacity: '',
    });

    const categories = ['Academic', 'Social', 'Sports', 'Cultural', 'Workshop', 'Other'];

    const handleStartTimeChange = (event: any, selectedDate?: Date) => {
        setShowStartPicker(false); // Close picker for iOS
        if (selectedDate) {
            // Ensure end_time is always after start_time
            let newEndTime = formData.end_time;
            if (selectedDate >= formData.end_time) {
                newEndTime = new Date(selectedDate.getTime() + 2 * 60 * 60 * 1000);
            }
            setFormData({ ...formData, start_time: selectedDate, end_time: newEndTime });
        }
    };

    const handleEndTimeChange = (event: any, selectedDate?: Date) => {
        setShowEndPicker(false); // Close picker for iOS
        if (selectedDate) {
            setFormData({ ...formData, end_time: selectedDate });
        }
    };

    const showDateTimePicker = (type: 'start' | 'end') => {
        // For simplicity, use the component-based approach for both platforms
        if (type === 'start') {
            setShowStartPicker(true);
        } else {
            setShowEndPicker(true);
        }
    };

    const handleCreate = async () => {
        // Validation
        if (!formData.title.trim()) {
            Alert.alert('Error', 'Please enter an event title');
            return;
        }
        if (!formData.description.trim()) {
            Alert.alert('Error', 'Please enter a description');
            return;
        }
        if (!formData.venue.trim()) {
            Alert.alert('Error', 'Please enter a venue');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                venue: formData.venue,
                start_time: formData.start_time.toISOString(),
                end_time: formData.end_time.toISOString(),
                capacity: formData.capacity && !isNaN(parseInt(formData.capacity)) ? parseInt(formData.capacity) : null,
            };

            await api.post('/events', payload);

            Alert.alert(
                'Success',
                'Event created successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            console.error('Create event error:', error);
            let errorMessage = 'Failed to create event';

            if (error.response?.data?.errors) {
                // Formatting Laravel validation errors
                const errors = error.response.data.errors;
                errorMessage = Object.values(errors).flat().join('\n');
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            Alert.alert('Validation Error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-8 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Create</Text>
                        <Text className="text-white text-xl font-bold">New Event</Text>
                    </View>
                    <View className="w-12" />
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 -mt-2"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Form Card */}
                <View className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 mt-4">
                    {/* Title Input */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <FileText size={18} color="#002147" opacity={0.6} />
                            <Text className="text-primary font-black text-xs uppercase tracking-widest ml-2">Event Title</Text>
                        </View>
                        <TextInput
                            value={formData.title}
                            onChangeText={(text) => setFormData({ ...formData, title: text })}
                            placeholder="e.g., KIU Tech Summit 2026"
                            placeholderTextColor="#94A3B8"
                            className="bg-gray-50 rounded-2xl px-5 py-4 text-primary font-medium border border-gray-100"
                        />
                    </View>

                    {/* Description Input */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <FileText size={18} color="#002147" opacity={0.6} />
                            <Text className="text-primary font-black text-xs uppercase tracking-widest ml-2">Description</Text>
                        </View>
                        <TextInput
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            placeholder="Describe your event..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                            className="bg-gray-50 rounded-2xl px-5 py-4 text-primary font-medium border border-gray-100"
                        />
                    </View>

                    {/* Category Selection */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Tag size={18} color="#002147" opacity={0.6} />
                            <Text className="text-primary font-black text-xs uppercase tracking-widest ml-2">Category</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-2">
                            {categories.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setFormData({ ...formData, category: cat })}
                                    className={`px-5 py-3 rounded-2xl mx-2 border ${formData.category === cat
                                        ? 'bg-secondary border-secondary'
                                        : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <Text className={`font-black text-xs ${formData.category === cat ? 'text-primary' : 'text-gray-500'
                                        }`}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Venue Input */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <MapPin size={18} color="#002147" opacity={0.6} />
                            <Text className="text-primary font-black text-xs uppercase tracking-widest ml-2">Venue</Text>
                        </View>
                        <TextInput
                            value={formData.venue}
                            onChangeText={(text) => setFormData({ ...formData, venue: text })}
                            placeholder="e.g., Main Auditorium, Block A"
                            placeholderTextColor="#94A3B8"
                            className="bg-gray-50 rounded-2xl px-5 py-4 text-primary font-medium border border-gray-100"
                        />
                    </View>

                    {/* Start Time */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Calendar size={18} color="#002147" opacity={0.6} />
                            <Text className="text-primary font-black text-xs uppercase tracking-widest ml-2">Start Time</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => showDateTimePicker('start')}
                            className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100"
                        >
                            <Text className="text-primary font-medium">
                                {formData.start_time.toLocaleString()}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* End Time */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Calendar size={18} color="#002147" opacity={0.6} />
                            <Text className="text-primary font-black text-xs uppercase tracking-widest ml-2">End Time (Optional)</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => showDateTimePicker('end')}
                            className="bg-gray-50 rounded-2xl px-5 py-4 border border-gray-100"
                        >
                            <Text className="text-primary font-medium">
                                {formData.end_time.toLocaleString()}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Capacity Input */}
                    <View className="mb-6">
                        <View className="flex-row items-center mb-3">
                            <Users size={18} color="#002147" opacity={0.6} />
                            <Text className="text-primary font-black text-xs uppercase tracking-widest ml-2">Capacity (Optional)</Text>
                        </View>
                        <TextInput
                            value={formData.capacity}
                            onChangeText={(text) => setFormData({ ...formData, capacity: text.replace(/[^0-9]/g, '') })}
                            placeholder="e.g., 100"
                            placeholderTextColor="#94A3B8"
                            keyboardType="numeric"
                            className="bg-gray-50 rounded-2xl px-5 py-4 text-primary font-medium border border-gray-100"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={handleCreate}
                        disabled={loading}
                        className={`rounded-2xl py-5 items-center justify-center shadow-lg ${loading ? 'bg-gray-300' : 'bg-primary shadow-primary/20'
                            }`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-black text-base uppercase tracking-widest">
                                Create Event
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Date Time Pickers - Cross-Platform */}
            {showStartPicker && (
                <DateTimePicker
                    value={formData.start_time}
                    mode="datetime"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleStartTimeChange}
                    minimumDate={new Date()}
                />
            )}

            {showEndPicker && (
                <DateTimePicker
                    value={formData.end_time}
                    mode="datetime"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleEndTimeChange}
                    minimumDate={formData.start_time}
                />
            )}
        </SafeAreaView>
    );
}
