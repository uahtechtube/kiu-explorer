import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Save, Globe, Phone, Mail, MapPin, Award, BookOpen, FileText } from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';
import AdminNavBar from '../../components/admin/AdminNavBar';

interface SchoolDetails {
    school_name: string;
    background: string;
    vision: string;
    mission: string;
    motto: string;
    established_year: string;
    address: string;
    phone: string;
    email: string;
    website: string;
}

export default function SchoolInfoManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [schoolName, setSchoolName] = useState('');
    const [motto, setMotto] = useState('');
    const [establishedYear, setEstablishedYear] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');
    const [background, setBackground] = useState('');
    const [vision, setVision] = useState('');
    const [mission, setMission] = useState('');

    useEffect(() => {
        fetchSchoolInfo();
    }, []);

    const fetchSchoolInfo = async () => {
        try {
            setLoading(true);
            const response = await api.get('/school/info');
            const data = response.data || {};
            setSchoolName(data.school_name || '');
            setMotto(data.motto || '');
            setEstablishedYear(String(data.established_year || ''));
            setPhone(data.phone || '');
            setEmail(data.email || '');
            setWebsite(data.website || '');
            setAddress(data.address || '');
            setBackground(data.background || '');
            setVision(data.vision || '');
            setMission(data.mission || '');
        } catch (error) {
            console.error('Error fetching school info:', error);
            Alert.alert('Notice', 'Failed to fetch school details. Loaded simulated template.');
            setSchoolName('Kashim Ibrahim University');
            setMotto('Knowledge, Character, and Service');
            setEstablishedYear('2002');
            setPhone('+234 76 290 0000');
            setEmail('info@kiu.edu.ng');
            setWebsite('https://kiu.edu.ng');
            setAddress('Maiduguri, Borno State, Nigeria');
            setBackground('Kashim Ibrahim University (KIU) stands as a beacon of academic brilliance in Northern Nigeria. Named after the visionary statesman Alhaji Kashim Ibrahim, our institution is dedicated to transforming lives.');
            setVision('To lead Africa in innovative research and community transformation.');
            setMission('Empowering students with ethical values and practical expertise.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!schoolName.trim()) {
            Alert.alert('Validation Error', 'School Name is required.');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                school_name: schoolName.trim(),
                motto: motto.trim(),
                established_year: establishedYear ? parseInt(establishedYear) : null,
                phone: phone.trim(),
                email: email.trim(),
                website: website.trim(),
                address: address.trim(),
                background: background.trim(),
                vision: vision.trim(),
                mission: mission.trim()
            };

            await api.put('/school/info', payload);
            Alert.alert('Success', 'School details updated successfully.');
        } catch (error: any) {
            console.error('Error saving school info:', error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to save school information.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center flex-1">
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest mb-1">Global Information</Text>
                        <Text className="text-white text-xl font-bold">University Details</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        className="w-12 h-12 bg-secondary rounded-2xl items-center justify-center shadow-lg shadow-secondary/30"
                    >
                        <Save size={20} color="#002147" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#002147" className="m-auto" />
            ) : (
                <ScrollView
                    className="flex-1 -mt-10 px-6"
                    contentContainerStyle={{ paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                >
                    <PremiumCard variant="elevated" className="bg-white p-6 border-gray-100 shadow-xl mb-6">
                        <Text className="text-primary font-black text-lg mb-4">Core Information</Text>
                        
                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold mb-1">School Name *</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                placeholder="e.g. Kashim Ibrahim University"
                                value={schoolName}
                                onChangeText={setSchoolName}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold mb-1">University Motto</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                placeholder="e.g. Knowledge, Character, and Service"
                                value={motto}
                                onChangeText={setMotto}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold mb-1">Established Year</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                placeholder="e.g. 2002"
                                keyboardType="numeric"
                                value={establishedYear}
                                onChangeText={setEstablishedYear}
                            />
                        </View>
                    </PremiumCard>

                    <PremiumCard variant="elevated" className="bg-white p-6 border-gray-100 shadow-xl mb-6">
                        <Text className="text-primary font-black text-lg mb-4">Contact Gateway</Text>

                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold mb-1">Outreach Phone</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                placeholder="+234 76 290 0000"
                                value={phone}
                                onChangeText={setPhone}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold mb-1">Outreach Email</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                placeholder="info@kiu.edu.ng"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={email}
                                onChangeText={setEmail}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold mb-1">Website URL</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                placeholder="https://kiu.edu.ng"
                                autoCapitalize="none"
                                value={website}
                                onChangeText={setWebsite}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold mb-1">Campus Address</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                placeholder="Maiduguri, Borno State, Nigeria"
                                multiline
                                numberOfLines={2}
                                value={address}
                                onChangeText={setAddress}
                            />
                        </View>
                    </PremiumCard>

                    <PremiumCard variant="elevated" className="bg-white p-6 border-gray-100 shadow-xl mb-6">
                        <Text className="text-primary font-black text-lg mb-4">Background & Vision</Text>

                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold mb-1">Background Description</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                placeholder="Overview history and description..."
                                multiline
                                numberOfLines={4}
                                value={background}
                                onChangeText={setBackground}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold mb-1">Our Vision</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                placeholder="To lead Africa..."
                                multiline
                                numberOfLines={2}
                                value={vision}
                                onChangeText={setVision}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold mb-1">Our Mission</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-medium"
                                placeholder="Empowering students..."
                                multiline
                                numberOfLines={2}
                                value={mission}
                                onChangeText={setMission}
                            />
                        </View>
                    </PremiumCard>

                    <TouchableOpacity
                        onPress={handleSave}
                        disabled={saving}
                        className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20 mt-4 mb-8"
                    >
                        {saving ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Save size={18} color="white" />
                                <Text className="text-white font-black text-base ml-2 uppercase">
                                    Update School Info
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            )}
            
            <AdminNavBar />
        </SafeAreaView>
    );
}
