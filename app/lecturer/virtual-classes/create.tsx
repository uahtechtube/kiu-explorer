import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Calendar, Clock, Link, BookOpen, ArrowLeft } from 'lucide-react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import api from '../../../lib/api';

interface Course {
    id: number;
    course_code: string;
    course_title: string;
}

export default function CreateVirtualClass() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);

    const [formData, setFormData] = useState({
        course_id: '',
        title: '',
        description: '',
        scheduled_at: new Date(),
        duration: '60',
        meeting_link: '',
    });

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/lecturer/courses/allocated');
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
            Alert.alert('Error', 'Failed to load courses');
        }
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        if (selectedDate) {
            setFormData({ ...formData, scheduled_at: selectedDate });
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (selectedTime) {
            const newDate = new Date(formData.scheduled_at);
            newDate.setHours(selectedTime.getHours());
            newDate.setMinutes(selectedTime.getMinutes());
            setFormData({ ...formData, scheduled_at: newDate });
        }
    };

    const showDatepicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: formData.scheduled_at,
                onChange: handleDateChange,
                mode: 'date',
                minimumDate: new Date(),
            });
        } else {
            setShowDatePicker(true);
        }
    };

    const showTimepicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: formData.scheduled_at,
                onChange: handleTimeChange,
                mode: 'time',
            });
        } else {
            setShowTimePicker(true);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.course_id || !formData.title || !formData.duration) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await api.post('/lecturer/virtual-classes', {
                ...formData,
                scheduled_at: formData.scheduled_at.toISOString(),
                duration: parseInt(formData.duration),
            });

            Alert.alert('Success', 'Virtual class created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            console.error('Error creating class:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create virtual class');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 py-4 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <ArrowLeft size={24} color="#FFF" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Create Virtual Class</Text>
            </View>

            <ScrollView className="flex-1 px-6 py-6">
                {/* Course Selection */}
                <View className="mb-6">
                    <Text className="text-gray-700 font-semibold mb-2">Course *</Text>
                    <View className="bg-white rounded-2xl border border-gray-200">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="p-2">
                            {courses.map((course) => (
                                <TouchableOpacity
                                    key={course.id}
                                    onPress={() => setFormData({ ...formData, course_id: course.id.toString() })}
                                    className={`px-4 py-3 rounded-xl mr-2 ${formData.course_id === course.id.toString()
                                            ? 'bg-primary'
                                            : 'bg-gray-100'
                                        }`}
                                >
                                    <Text className={`font-semibold ${formData.course_id === course.id.toString()
                                            ? 'text-white'
                                            : 'text-gray-700'
                                        }`}>
                                        {course.course_code}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* Title */}
                <View className="mb-6">
                    <Text className="text-gray-700 font-semibold mb-2">Class Title *</Text>
                    <TextInput
                        className="bg-white rounded-2xl px-4 py-4 border border-gray-200"
                        placeholder="e.g., Introduction to Databases"
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                    />
                </View>

                {/* Description */}
                <View className="mb-6">
                    <Text className="text-gray-700 font-semibold mb-2">Description</Text>
                    <TextInput
                        className="bg-white rounded-2xl px-4 py-4 border border-gray-200"
                        placeholder="Brief description of the class"
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                {/* Date & Time */}
                <View className="flex-row mb-6">
                    <View className="flex-1 mr-2">
                        <Text className="text-gray-700 font-semibold mb-2">Date *</Text>
                        <TouchableOpacity
                            onPress={showDatepicker}
                            className="bg-white rounded-2xl px-4 py-4 border border-gray-200 flex-row items-center"
                        >
                            <Calendar size={20} color="#6B7280" />
                            <Text className="ml-2 text-gray-700">
                                {formData.scheduled_at.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View className="flex-1 ml-2">
                        <Text className="text-gray-700 font-semibold mb-2">Time *</Text>
                        <TouchableOpacity
                            onPress={showTimepicker}
                            className="bg-white rounded-2xl px-4 py-4 border border-gray-200 flex-row items-center"
                        >
                            <Clock size={20} color="#6B7280" />
                            <Text className="ml-2 text-gray-700">
                                {formData.scheduled_at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* iOS Date/Time Pickers */}
                {Platform.OS === 'ios' && showDatePicker && (
                    <DateTimePicker
                        value={formData.scheduled_at}
                        mode="date"
                        display="spinner"
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                    />
                )}
                {Platform.OS === 'ios' && showTimePicker && (
                    <DateTimePicker
                        value={formData.scheduled_at}
                        mode="time"
                        display="spinner"
                        onChange={handleTimeChange}
                    />
                )}

                {/* Duration */}
                <View className="mb-6">
                    <Text className="text-gray-700 font-semibold mb-2">Duration (minutes) *</Text>
                    <TextInput
                        className="bg-white rounded-2xl px-4 py-4 border border-gray-200"
                        placeholder="60"
                        value={formData.duration}
                        onChangeText={(text) => setFormData({ ...formData, duration: text })}
                        keyboardType="numeric"
                    />
                </View>

                {/* Meeting Link */}
                <View className="mb-6">
                    <Text className="text-gray-700 font-semibold mb-2">Meeting Link</Text>
                    <View className="bg-white rounded-2xl px-4 py-4 border border-gray-200 flex-row items-center">
                        <Link size={20} color="#6B7280" />
                        <TextInput
                            className="flex-1 ml-2"
                            placeholder="https://zoom.us/j/..."
                            value={formData.meeting_link}
                            onChangeText={(text) => setFormData({ ...formData, meeting_link: text })}
                            autoCapitalize="none"
                        />
                    </View>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={loading}
                    className={`bg-primary rounded-2xl py-4 items-center mb-8 ${loading ? 'opacity-50' : ''}`}
                >
                    <Text className="text-white font-bold text-lg">
                        {loading ? 'Creating...' : 'Create Virtual Class'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
