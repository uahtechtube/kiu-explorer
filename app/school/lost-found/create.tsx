import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Camera, Check, MapPin, Phone, User, FileText } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../lib/api';

export default function ReportLostFoundItem() {
  const router = useRouter();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    contact_details: user?.phone_number || '',
    type: 'lost' as 'lost' | 'found',
    founder: '',
  });

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Please allow access to your photo library to add an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
      if (result.assets[0].base64) {
        setBase64Image(result.assets[0].base64);
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.location.trim() || !form.contact_details.trim()) {
      Alert.alert('Error', 'Please fill in all required fields (Title, Description, Location, and Contact Details).');
      return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        title: form.title,
        description: form.description,
        location: form.location,
        contact_details: form.contact_details,
        type: form.type,
      };

      if (form.type === 'found' && form.founder.trim()) {
        payload.founder = form.founder;
      }

      if (base64Image) {
        payload.image = `data:image/jpeg;base64,${base64Image}`;
      }

      await api.post('/lost-items', payload);
      Alert.alert('Success', 'Report submitted successfully.', [
        { text: 'OK', onPress: () => router.push('/school/lost-found') },
      ]);
    } catch (error: any) {
      console.error('Submission failed:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="bg-primary px-6 pt-4 pb-6 rounded-b-[32px] shadow-md flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-white/10 rounded-full items-center justify-center">
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Report Item</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6 mt-6" showsVerticalScrollIndicator={false}>
        {/* Toggle Type */}
        <View className="flex-row bg-gray-100 p-1.5 rounded-2xl mb-6">
          <TouchableOpacity
            onPress={() => setForm({ ...form, type: 'lost' })}
            className={`flex-1 py-3 rounded-xl items-center ${
              form.type === 'lost' ? 'bg-primary shadow-sm' : ''
            }`}
          >
            <Text className={`font-bold text-xs ${form.type === 'lost' ? 'text-white' : 'text-gray-500'}`}>
              I Lost Something
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setForm({ ...form, type: 'found' })}
            className={`flex-1 py-3 rounded-xl items-center ${
              form.type === 'found' ? 'bg-primary shadow-sm' : ''
            }`}
          >
            <Text className={`font-bold text-xs ${form.type === 'found' ? 'text-white' : 'text-gray-500'}`}>
              I Found Something
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Inputs */}
        <View className="space-y-4 mb-8">
          {/* Title */}
          <View>
            <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2 ml-1">
              Item Title *
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
              <FileText size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-primary text-sm h-full"
                placeholder={form.type === 'lost' ? 'e.g. Lost HP Laptop' : 'e.g. Found Key Fob'}
                value={form.title}
                onChangeText={(text) => setForm({ ...form, title: text })}
              />
            </View>
          </View>

          {/* Description */}
          <View>
            <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2 ml-1">
              Description / Specific Details *
            </Text>
            <View className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
              <TextInput
                className="text-primary text-sm min-h-[100px]"
                placeholder="Mention details like color, brand, stickers, serial numbers, specific condition, or when it was lost/found."
                multiline
                style={{ textAlignVertical: 'top' }}
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
              />
            </View>
          </View>

          {/* Location */}
          <View>
            <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2 ml-1">
              Location *
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
              <MapPin size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-primary text-sm h-full"
                placeholder="e.g. Science Lecture Theatre room 4"
                value={form.location}
                onChangeText={(text) => setForm({ ...form, location: text })}
              />
            </View>
          </View>

          {/* Conditional Founder (If found) */}
          {form.type === 'found' && (
            <View>
              <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2 ml-1">
                Founder Name / Holder Details
              </Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
                <User size={18} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-3 text-primary text-sm h-full"
                  placeholder="e.g. Abubakar Musa (or leave blank if security has it)"
                  value={form.founder}
                  onChangeText={(text) => setForm({ ...form, founder: text })}
                />
              </View>
            </View>
          )}

          {/* Contact Details */}
          <View>
            <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2 ml-1">
              Contact Details / Where to collect *
            </Text>
            <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14">
              <Phone size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 ml-3 text-primary text-sm h-full"
                placeholder="e.g. Call 08012345678 or visit Security Gate 1"
                value={form.contact_details}
                onChangeText={(text) => setForm({ ...form, contact_details: text })}
              />
            </View>
          </View>

          {/* Image Picker */}
          <View>
            <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2 ml-1">
              Upload Image (Optional)
            </Text>
            {imageUri ? (
              <View className="relative w-full h-48 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 items-center justify-center">
                <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
                <TouchableOpacity
                  onPress={pickImage}
                  className="absolute bottom-3 right-3 bg-primary/80 px-4 py-2 rounded-full border border-white/20"
                >
                  <Text className="text-white text-xs font-bold">Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={pickImage}
                className="w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl items-center justify-center bg-gray-50"
              >
                <Camera size={28} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs mt-2 font-bold">Select Item Image</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting}
          className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 mb-12"
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white text-base font-bold mr-2">Submit Report</Text>
              <Check size={18} color="white" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
