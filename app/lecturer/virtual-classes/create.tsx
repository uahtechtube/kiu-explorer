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
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

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
            const response = await api.get('/courses');
            setCourses(response.data || []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            Alert.alert('Error', 'Failed to load courses');
        }
    };

    const filteredCourses = searchQuery.trim() === '' ? courses : courses.filter((c: any) =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            Alert.alert('Error', 'Please select a valid course and fill in all required fields');
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
            
            let errorMsg = 'Failed to create virtual class';
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMsg = error.response.data;
                } else if (error.response.data.message) {
                    errorMsg = error.response.data.message;
                } else {
                    // Laravel multi-field Validation errors
                    const errors = error.response.data;
                    const messages = Object.keys(errors).map(key => {
                        const errVal = errors[key];
                        return Array.isArray(errVal) ? errVal.join(' ') : String(errVal);
                    });
                    if (messages.length > 0) {
                        errorMsg = messages.join('\n');
                    }
                }
            }
            
            Alert.alert('Error', errorMsg);
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

            <ScrollView className="flex-1 px-6 py-6" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 60 }}>
                {/* Course Selection */}
                <View className="mb-6 relative z-50">
                    <Text className="text-gray-700 font-semibold mb-2">Course *</Text>
                    <View className="bg-white rounded-2xl px-4 py-4 border border-gray-200 flex-row items-center justify-between">
                        <TextInput
                            placeholder="Search course code or title... (e.g. CSC 301)"
                            className="text-primary text-base font-bold flex-1"
                            value={searchQuery}
                            onFocus={() => setShowDropdown(true)}
                            onChangeText={(val) => {
                                setSearchQuery(val);
                                setShowDropdown(true);
                                if (formData.course_id) setFormData({ ...formData, course_id: '' });
                            }}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => { setSearchQuery(''); setFormData({ ...formData, course_id: '' }); setShowDropdown(true); }} className="p-1">
                                <Text className="text-gray-400 font-bold text-xs">✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    {showDropdown && (
                        <View className="absolute top-20 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-xl max-h-60 overflow-hidden z-50">
                            <ScrollView nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                                {filteredCourses.length > 0 ? (
                                    filteredCourses.map((course: any) => (
                                        <TouchableOpacity
                                            key={course.id}
                                            onPress={() => {
                                                setFormData({ ...formData, course_id: course.id.toString() });
                                                setSearchQuery(`${course.code} - ${course.title}`);
                                                setShowDropdown(false);
                                            }}
                                            className="p-4 border-b border-gray-50 hover:bg-gray-50 flex-row items-center justify-between"
                                        >
                                            <View className="flex-1 mr-2">
                                                <Text className="text-primary font-bold text-sm">{course.code}</Text>
                                                <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>{course.title}</Text>
                                            </View>
                                            {formData.course_id === course.id.toString() && (
                                                <Text className="text-green-600 font-bold text-xs">✓ Selected</Text>
                                            )}
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <View className="p-4 items-center">
                                        <Text className="text-gray-400 text-sm">No matching courses found</Text>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    )}
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
