import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Save, Clock, Calendar, CalendarDays } from 'lucide-react-native';
import api from '../../lib/api';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

export default function EditExamPage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [duration, setDuration] = useState('');
    const [scheduledDate, setScheduledDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [updating, setUpdating] = useState(false);

    const showPicker = () => {
        if (Platform.OS === 'android') {
            DateTimePickerAndroid.open({
                value: scheduledDate,
                onChange: (event, date) => {
                    if (event.type === 'set' && date) {
                        const selectedDate = date;
                        DateTimePickerAndroid.open({
                            value: selectedDate,
                            onChange: (event, time) => {
                                if (event.type === 'set' && time) {
                                    const finalDateTime = new Date(
                                        selectedDate.getFullYear(),
                                        selectedDate.getMonth(),
                                        selectedDate.getDate(),
                                        time.getHours(),
                                        time.getMinutes()
                                    );
                                    setScheduledDate(finalDateTime);
                                }
                            },
                            mode: 'time',
                            is24Hour: true,
                        });
                    }
                },
                mode: 'date',
            });
        } else {
            setShowDatePicker(true);
        }
    };

    useEffect(() => {
        if (id) {
            fetchExamDetails();
        }
    }, [id]);

    const fetchExamDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/exams/${id}`);
            const exam = response.data;
            setTitle(exam.title);
            setCourseCode(exam.course_code);
            setDuration(exam.duration.toString());
            setScheduledDate(new Date(exam.start_time || exam.scheduled_at));
        } catch (error) {
            console.error('Error fetching exam details:', error);
            Alert.alert('Error', 'Failed to load exam details.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!title || !courseCode || !duration) {
            Alert.alert('Missing Fields', 'Please fill in all required fields.');
            return;
        }

        setUpdating(true);
        try {
            await api.put(`/lecturer/exams/${id}`, {
                title,
                course_code: courseCode,
                duration: parseInt(duration),
                start_time: scheduledDate.toISOString(),
            });

            Alert.alert('Success', 'Exam updated successfully!');
            router.back();
        } catch (error: any) {
            console.error('Error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update exam.';
            Alert.alert('Error', errorMessage);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="bg-primary px-6 pt-6 pb-8">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-white text-2xl font-bold">Edit Exam</Text>
                        <Text className="text-gray-300 text-sm">Update exam details</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100">
                    <Text className="text-primary font-bold text-lg mb-4">Exam Details</Text>

                    <Text className="text-gray-500 text-xs font-bold mb-1 ml-1 uppercase">Course Code</Text>
                    <TextInput
                        value={courseCode}
                        onChangeText={setCourseCode}
                        placeholder="Course Code"
                        className="bg-gray-50 p-3 rounded-xl text-gray-800 mb-4"
                    />

                    <Text className="text-gray-500 text-xs font-bold mb-1 ml-1 uppercase">Exam Title</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Exam Title"
                        className="bg-gray-50 p-3 rounded-xl text-gray-800 mb-4"
                    />

                    <View className="flex-row space-x-3 mb-4">
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs font-bold mb-1 ml-1 uppercase">Duration (mins)</Text>
                            <TextInput
                                value={duration}
                                onChangeText={setDuration}
                                placeholder="Duration"
                                keyboardType="numeric"
                                className="bg-gray-50 p-3 rounded-xl text-gray-800"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-gray-500 text-xs font-bold mb-1 ml-1 uppercase">Scheduled Date</Text>
                            <TouchableOpacity 
                                onPress={showPicker}
                                className="flex-1 bg-gray-50 p-3 rounded-xl flex-row items-center justify-between"
                            >
                                <Text className="text-gray-800 text-xs">
                                    {scheduledDate.toLocaleDateString()} {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                                <CalendarDays size={18} color="#64748B" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {Platform.OS === 'ios' && showDatePicker && (
                        <DateTimePicker
                            value={scheduledDate}
                            mode="datetime"
                            is24Hour={true}
                            display="spinner"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) {
                                    setScheduledDate(selectedDate);
                                }
                            }}
                        />
                    )}
                </View>

                <TouchableOpacity
                    onPress={handleUpdate}
                    disabled={updating}
                    className={`py-4 rounded-3xl items-center mb-8 flex-row justify-center ${updating ? 'bg-gray-300' : 'bg-primary'}`}
                >
                    {!updating && <Save size={20} color="white" className="mr-2" />}
                    <Text className="text-white font-bold text-lg ml-2">
                        {updating ? 'Updating...' : 'Save Changes'}
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
