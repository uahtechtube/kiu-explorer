import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Save, Globe, Phone, Mail, MapPin, Award, BookOpen, FileText, Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
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
    whatsapp_number: string;
    email: string;
    website: string;
}

export default function SchoolInfoManagement() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Cover Photo & Logo states
    const [schoolId, setSchoolId] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [coverImageUrl, setCoverImageUrl] = useState('');
    const [photo, setPhoto] = useState<string | null>(null);       // new logo
    const [coverPhoto, setCoverPhoto] = useState<string | null>(null); // new cover image

    // Form fields
    const [schoolName, setSchoolName] = useState('');
    const [motto, setMotto] = useState('');
    const [establishedYear, setEstablishedYear] = useState('');
    const [phone, setPhone] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [address, setAddress] = useState('');
    const [background, setBackground] = useState('');
    const [vision, setVision] = useState('');
    const [mission, setMission] = useState('');

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Please allow access to your photo library');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });
        if (!result.canceled && result.assets[0].base64) {
            setPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    const pickCoverImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert('Permission Required', 'Please allow access to your photo library');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.8,
            base64: true,
        });
        if (!result.canceled && result.assets[0].base64) {
            setCoverPhoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
        }
    };

    useEffect(() => {
        fetchSchoolInfo();
    }, []);

    const fetchSchoolInfo = async () => {
        try {
            setLoading(true);
            const response = await api.get('/school/info');
            const data = response.data || {};
            setSchoolId(String(data.id || ''));
            setLogoUrl(data.logo_url || '');
            setCoverImageUrl(data.cover_image || '');
            setSchoolName(data.school_name || '');
            setMotto(data.motto || '');
            setEstablishedYear(String(data.established_year || ''));
            setPhone(data.phone || '');
            setWhatsappNumber(data.whatsapp_number || '');
            setEmail(data.email || '');
            setWebsite(data.website || '');
            setAddress(data.address || '');
            setBackground(data.background || '');
            setVision(data.vision || '');
            setMission(data.mission || '');
        } catch (error) {
            console.error('Error fetching school info:', error);
            Alert.alert('Notice', 'Failed to fetch school details. Loaded simulated template.');
            setSchoolId('1');
            setSchoolName('Kashim Ibrahim University');
            setMotto('Knowledge, Character, and Service');
            setEstablishedYear('2002');
            setPhone('+234 76 290 0000');
            setWhatsappNumber('+234 76 290 0000');
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
                id: schoolId ? parseInt(schoolId) : null,
                school_name: schoolName.trim(),
                motto: motto.trim(),
                established_year: establishedYear ? parseInt(establishedYear) : null,
                phone: phone.trim(),
                whatsapp_number: whatsappNumber.trim(),
                email: email.trim(),
                website: website.trim(),
                address: address.trim(),
                background: background.trim(),
                vision: vision.trim(),
                mission: mission.trim(),
                photo: photo,
                cover_photo: coverPhoto,
            };

            const response = await api.put('/school/info', payload);
            if (response.data?.data) {
                const data = response.data.data;
                setSchoolId(String(data.id || ''));
                setLogoUrl(data.logo_url || '');
                setCoverImageUrl(data.cover_image || '');
                setPhoto(null);
                setCoverPhoto(null);
            }
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
                            <Text className="text-gray-400 text-xs font-bold mb-1">School Info Record ID</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                placeholder="e.g. 1"
                                keyboardType="numeric"
                                value={schoolId}
                                onChangeText={setSchoolId}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold mb-2">School Logo</Text>
                            <TouchableOpacity
                                onPress={pickImage}
                                className="flex-row items-center bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4"
                            >
                                <View className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 mr-4">
                                    {photo || logoUrl ? (
                                        <Image
                                            source={{ uri: photo || logoUrl }}
                                            className="w-full h-full"
                                            resizeMode="contain"
                                        />
                                    ) : (
                                        <View className="w-full h-full items-center justify-center">
                                            <Camera size={20} color="#9ca3af" />
                                        </View>
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-primary font-bold text-sm">Tap to change logo</Text>
                                    <Text className="text-gray-400 text-xs mt-0.5">Square format recommended</Text>
                                </View>
                                <Camera size={18} color="#002147" />
                            </TouchableOpacity>
                        </View>

                        <View className="mb-4">
                            <Text className="text-gray-400 text-xs font-bold mb-2">School Info Cover Photo</Text>
                            <View className="relative h-44 rounded-3xl overflow-hidden bg-gray-100 border border-gray-200">
                                <Image
                                    source={{ uri: coverPhoto || coverImageUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&q=80' }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    onPress={pickCoverImage}
                                    className="absolute bottom-3 right-3 bg-primary w-10 h-10 rounded-xl items-center justify-center shadow-lg"
                                >
                                    <Camera size={18} color="white" />
                                </TouchableOpacity>
                                {coverPhoto && (
                                    <View className="absolute top-3 left-3 bg-green-500 px-2 py-1 rounded-lg">
                                        <Text className="text-white text-xs font-bold">New</Text>
                                    </View>
                                )}
                            </View>
                            <Text className="text-gray-400 text-xs mt-1 ml-1">16:9 landscape ratio recommended</Text>
                        </View>
                        
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
                            <Text className="text-gray-400 text-xs font-bold mb-1">WhatsApp Help Number</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-primary font-bold"
                                placeholder="+234 76 290 0000"
                                value={whatsappNumber}
                                onChangeText={setWhatsappNumber}
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
