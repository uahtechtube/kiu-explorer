import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, Lock, Unlock, Pin, Plus, Trash2, Eye, Download, Search, ShieldCheck, ShieldAlert, Key, FileText, Check, MoreVertical } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import api from '../../../lib/api';

interface VaultDoc {
    id: number;
    title: string;
    category: 'admission_letter' | 'registration' | 'transcript' | 'receipt' | 'other';
    file_name: string;
    file_size: number;
    mime_type: string;
    description?: string;
    is_pinned: boolean;
    formatted_size: string;
    created_at: string;
}

const CATEGORIES = [
    { value: 'admission_letter', label: 'Admission' },
    { value: 'registration', label: 'Registration' },
    { value: 'transcript', label: 'Transcripts' },
    { value: 'receipt', label: 'Receipts' },
    { value: 'other', label: 'Other Docs' },
];

export default function DocumentVaultScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [unlocked, setUnlocked] = useState(false);
    const [pinExists, setPinExists] = useState(false);

    // Passcode states
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [isSettingUp, setIsSettingUp] = useState(false);
    const [setupStep, setSetupStep] = useState(1); // 1 = Enter new PIN, 2 = Confirm PIN

    // Forgot PIN states
    const [forgotModalVisible, setForgotModalVisible] = useState(false);
    const [accountPassword, setAccountPassword] = useState('');
    const [verifyingPassword, setVerifyingPassword] = useState(false);

    // Document States
    const [documents, setDocuments] = useState<VaultDoc[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

    // Upload Modal states
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [docTitle, setDocTitle] = useState('');
    const [docDescription, setDocDescription] = useState('');
    const [docCategory, setDocCategory] = useState<'admission_letter' | 'registration' | 'transcript' | 'receipt' | 'other'>('admission_letter');
    const [uploading, setUploading] = useState(false);

    // Dynamic viewing/decryption state
    const [decryptingId, setDecryptingId] = useState<number | null>(null);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    // Check if vault PIN is already configured on the device
    const checkPinConfig = async () => {
        try {
            const savedPin = await SecureStore.getItemAsync('vault_pin');
            if (savedPin) {
                setPinExists(true);
                setIsSettingUp(false);
            } else {
                setPinExists(false);
                setIsSettingUp(true);
                setSetupStep(1);
            }
        } catch (error) {
            console.error('SecureStore error checking PIN:', error);
        }
    };

    useEffect(() => {
        checkPinConfig();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/vault');
            setDocuments(response.data || []);
        } catch (error) {
            console.error('Error fetching vault documents:', error);
            Alert.alert('Fetch Error', 'Failed to retrieve secure vault files.');
        } finally {
            setLoading(false);
        }
    };

    // Trigger document fetch once unlocked
    useEffect(() => {
        if (unlocked) {
            fetchDocuments();
        }
    }, [unlocked]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchDocuments();
        setRefreshing(false);
    };

    // Custom PIN input handler
    const handleKeyPress = (char: string) => {
        if (char === 'back') {
            setPin(prev => prev.slice(0, -1));
            return;
        }

        if (pin.length >= 4) return;

        const newPin = pin + char;
        setPin(newPin);

        // If filled 4 digits
        if (newPin.length === 4) {
            if (isSettingUp) {
                if (setupStep === 1) {
                    setConfirmPin(newPin);
                    setPin('');
                    setSetupStep(2);
                } else {
                    if (newPin === confirmPin) {
                        saveNewPin(newPin);
                    } else {
                        Alert.alert('Mismatch', 'PIN codes did not match. Please start again.');
                        setPin('');
                        setSetupStep(1);
                    }
                }
            } else {
                verifyPinAndUnlock(newPin);
            }
        }
    };

    const saveNewPin = async (finalPin: string) => {
        try {
            await SecureStore.setItemAsync('vault_pin', finalPin);
            Alert.alert('Vault Secured', 'Your 4-digit security PIN is now configured.');
            setPinExists(true);
            setIsSettingUp(false);
            setUnlocked(true);
            setPin('');
        } catch (error) {
            Alert.alert('Error', 'Could not store PIN in secure device storage.');
        }
    };

    const verifyPinAndUnlock = async (enteredPin: string) => {
        try {
            const savedPin = await SecureStore.getItemAsync('vault_pin');
            if (enteredPin === savedPin) {
                setUnlocked(true);
                setPin('');
            } else {
                Alert.alert('Access Denied', 'Incorrect PIN code. Please try again.');
                setPin('');
            }
        } catch (error) {
            Alert.alert('Error', 'Secure storage access failure.');
        }
    };

    // Forgot PIN handler
    const handleVerifyPasswordResetPin = async () => {
        if (!accountPassword.trim()) {
            Alert.alert('Input Needed', 'Please enter your password.');
            return;
        }

        setVerifyingPassword(true);
        try {
            const response = await api.post('/student/vault/verify-password', {
                password: accountPassword
            });

            if (response.data.success) {
                // Wipe the secure store PIN
                await SecureStore.deleteItemAsync('vault_pin');
                
                Alert.alert('Success', 'Identity verified. You can now setup a new PIN.');
                setForgotModalVisible(false);
                setAccountPassword('');
                
                // Switch back to setup state
                setPinExists(false);
                setIsSettingUp(true);
                setSetupStep(1);
                setPin('');
                setUnlocked(false);
            }
        } catch (error: any) {
            Alert.alert('Reset Failed', error.response?.data?.message || 'Password verification failed. Try again.');
        } finally {
            setVerifyingPassword(false);
        }
    };

    // Document Picker & Upload
    const handleUploadPicker = async () => {
        if (!docTitle.trim()) {
            Alert.alert('Validation Error', 'Please enter a title for your document.');
            return;
        }

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                copyToCacheDirectory: true
            });

            if (result.canceled || !result.assets || result.assets.length === 0) {
                return;
            }

            const file = result.assets[0];
            
            // Limit to 15MB
            if (file.size && file.size > 15 * 1024 * 1024) {
                Alert.alert('File Too Large', 'Maximum file size permitted is 15MB.');
                return;
            }

            setUploading(true);

            const formData = new FormData();
            formData.append('document', {
                uri: file.uri,
                name: file.name,
                type: file.mimeType || 'application/pdf'
            } as any);
            formData.append('title', docTitle.trim());
            formData.append('category', docCategory);
            if (docDescription.trim()) {
                formData.append('description', docDescription.trim());
            }

            await api.post('/student/vault', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            Alert.alert('Secured Successfully', 'Your file has been encrypted and stored in your vault.');
            setUploadModalVisible(false);
            setDocTitle('');
            setDocDescription('');
            setDocCategory('admission_letter');
            fetchDocuments();
        } catch (error: any) {
            console.error('Vault upload error:', error);
            Alert.alert('Encryption Upload Failed', error.response?.data?.message || 'Failed to encrypt and store document.');
        } finally {
            setUploading(false);
        }
    };

    // Decrypt, Download and Open document securely using sharing API
    const handleViewDocument = async (doc: VaultDoc) => {
        try {
            setDecryptingId(doc.id);
            const token = Platform.OS === 'web' ? localStorage.getItem('token') : await SecureStore.getItemAsync('token');
            
            const localUri = `${FileSystem.cacheDirectory}${doc.file_name}`;

            const downloadResult = await FileSystem.downloadAsync(
                `${api.defaults.baseURL}/student/vault/${doc.id}/download`,
                localUri,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (downloadResult.status === 200) {
                await Sharing.shareAsync(downloadResult.uri, {
                    mimeType: doc.mime_type,
                    dialogTitle: `Open ${doc.title}`,
                    UTI: doc.mime_type
                });
            } else {
                Alert.alert('Decryption Error', 'Failed to retrieve file from secure vault. Server status: ' + downloadResult.status);
            }
        } catch (error) {
            console.error('Decryption sharing error:', error);
            Alert.alert('Decryption Failed', 'Could not decrypt and open this file securely.');
        } finally {
            setDecryptingId(null);
        }
    };

    // Download document to device storage
    const handleDownloadDocument = async (doc: VaultDoc) => {
        try {
            setDownloadingId(doc.id);
            const token = Platform.OS === 'web' ? localStorage.getItem('token') : await SecureStore.getItemAsync('token');
            
            const localUri = `${FileSystem.documentDirectory}${doc.file_name}`;

            const downloadResult = await FileSystem.downloadAsync(
                `${api.defaults.baseURL}/student/vault/${doc.id}/download`,
                localUri,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (downloadResult.status === 200) {
                // Share with specific intent to save to files / downloads
                await Sharing.shareAsync(downloadResult.uri, {
                    mimeType: doc.mime_type,
                    dialogTitle: `Save ${doc.title}`,
                    UTI: doc.mime_type
                });
                Alert.alert('Success', `"${doc.title}" downloaded and decrypted successfully.`);
            } else {
                Alert.alert('Download Error', 'Failed to download file from secure vault. Status: ' + downloadResult.status);
            }
        } catch (error) {
            console.error('Download error:', error);
            Alert.alert('Download Failed', 'Could not save the document securely to your device.');
        } finally {
            setDownloadingId(null);
        }
    };

    // Pinned status toggle
    const handleTogglePin = async (doc: VaultDoc) => {
        try {
            await api.put(`/student/vault/${doc.id}`, {
                is_pinned: !doc.is_pinned
            });
            fetchDocuments();
        } catch (error) {
            Alert.alert('Error', 'Failed to toggle pin state.');
        }
    };

    // Delete Document
    const handleDeleteDocument = (id: number) => {
        Alert.alert(
            'Shred Document',
            'Are you sure you want to permanently delete (shred) this document from your vault? It cannot be recovered.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Shred',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/student/vault/${id}`);
                            fetchDocuments();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete file.');
                        }
                    }
                }
            ]
        );
    };

    const getCategoryLabel = (catKey: string) => {
        const cat = CATEGORIES.find(c => c.value === catKey);
        return cat ? cat.label : catKey.toUpperCase();
    };

    // Lock Vault manually
    const handleManualLock = () => {
        setUnlocked(false);
        setPin('');
    };

    // Filter documents
    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              doc.file_name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategoryFilter === 'all' || doc.category === selectedCategoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Custom Keypad UI for Lockscreen
    const renderKeypad = () => {
        const keys = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['Forgot', '0', '⌫']
        ];

        return (
            <View className="w-full px-8 mt-10">
                {keys.map((row, rIdx) => (
                    <View key={rIdx} className="flex-row justify-between mb-5">
                        {row.map((key, kIdx) => {
                            const isSpecial = key === 'Forgot' || key === '⌫';
                            return (
                                <TouchableOpacity
                                    key={kIdx}
                                    disabled={key === 'Forgot' && isSettingUp}
                                    onPress={() => {
                                        if (key === 'Forgot') {
                                            setForgotModalVisible(true);
                                        } else if (key === '⌫') {
                                            handleKeyPress('back');
                                        } else {
                                            handleKeyPress(key);
                                        }
                                    }}
                                    className={`w-[26%] aspect-square rounded-full items-center justify-center ${isSpecial ? 'bg-transparent' : 'bg-white/10 border border-white/20'}`}
                                >
                                    {key === '5' ? (
                                        <Text className="text-white text-lg">⌫</Text>
                                    ) : (
                                        <Text className={`text-white font-extrabold ${key === 'Forgot' ? 'text-xs text-secondary' : 'text-2xl'}`}>
                                            {key}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        );
    };

    // Renders Lockscreen or Main UI
    if (!unlocked) {
        return (
            <SafeAreaView className="flex-1 bg-primary justify-center items-center">
                <Stack.Screen options={{ headerShown: false }} />
                
                {/* Shield Icon and Lockscreen Header */}
                <View className="items-center mb-8 px-8">
                    <View className="bg-white/15 p-6 rounded-full border border-white/20 mb-5">
                        <Lock size={44} color="#F59E0B" />
                    </View>
                    
                    <Text className="text-white text-2xl font-black text-center">Secure Vault</Text>
                    
                    <Text className="text-white/60 text-xs text-center mt-2.5 leading-5">
                        {isSettingUp 
                            ? (setupStep === 1 ? 'Configure a new 4-digit access PIN to encrypt and secure your private student records.' : 'Confirm your 4-digit PIN.') 
                            : 'Enter your 4-digit secure vault PIN to decrypt files.'
                        }
                    </Text>
                </View>

                {/* Passcode dots display */}
                <View className="flex-row space-x-6 justify-center items-center h-10 mt-2">
                    {[1, 2, 3, 4].map((dot) => {
                        const filled = pin.length >= dot;
                        return (
                            <View 
                                key={dot} 
                                className={`w-4 h-4 rounded-full border border-white/40 ${filled ? 'bg-secondary' : 'bg-transparent'}`} 
                            />
                        );
                    })}
                </View>

                {/* Keypad */}
                {renderKeypad()}

                {/* Quick Back to App */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mt-8 bg-white/5 border border-white/10 rounded-2xl px-6 py-3"
                >
                    <Text className="text-white/80 font-bold text-xs">Return to Dashboard</Text>
                </TouchableOpacity>

                {/* Forgot PIN Password Prompt Modal */}
                <Modal
                    visible={forgotModalVisible}
                    animationType="fade"
                    transparent
                    onRequestClose={() => setForgotModalVisible(false)}
                >
                    <View className="flex-1 bg-black/80 justify-center px-6">
                        <View className="bg-white rounded-[32px] p-6 shadow-2xl">
                            <View className="items-center mb-4">
                                <Key size={36} color="#EF4444" />
                                <Text className="text-primary font-black text-base mt-3 text-center">Verify Identity</Text>
                                <Text className="text-gray-400 text-xs text-center mt-1">Enter your account password to reset your Vault PIN.</Text>
                            </View>

                            <TextInput
                                secureTextEntry
                                value={accountPassword}
                                onChangeText={setAccountPassword}
                                placeholder="Your login password"
                                className="bg-gray-50 text-primary border border-gray-200 rounded-2xl px-4 h-12 text-sm font-semibold mb-6"
                            />

                            <View className="flex-row space-x-3">
                                <TouchableOpacity
                                    onPress={() => setForgotModalVisible(false)}
                                    className="flex-1 bg-gray-100 rounded-2xl py-4 items-center justify-center border border-gray-200"
                                >
                                    <Text className="text-gray-700 font-bold text-sm">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    disabled={verifyingPassword}
                                    onPress={handleVerifyPasswordResetPin}
                                    className="flex-1 bg-red-500 rounded-2xl py-4 items-center justify-center flex-row shadow-lg shadow-red-500/20"
                                >
                                    {verifyingPassword ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className="text-white font-bold text-sm">Verify & Reset</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        );
    }

    // Main vault dashboard
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Header */}
            <View className="bg-primary px-6 pt-6 pb-8 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center flex-row">
                        <ShieldCheck size={20} color="#F59E0B" className="mr-1.5" />
                        <Text className="text-white text-xl font-bold">Document Vault</Text>
                    </View>
                    <TouchableOpacity
                        onPress={handleManualLock}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <Lock size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Info Note and Search Bar */}
                <View className="mt-5">
                    <View className="bg-white/10 border border-white/10 p-3 rounded-2xl flex-row items-center mb-4">
                        <ShieldCheck size={16} color="#10B981" />
                        <Text className="text-white/80 text-[10px] ml-2 flex-1">
                            Your vault files are fully encrypted before saving. Decryption occurs on request.
                        </Text>
                    </View>

                    <View className="bg-white rounded-2xl flex-row items-center px-4 h-12 border border-gray-100 shadow-sm">
                        <Search size={18} color="#94A3B8" />
                        <TextInput
                            placeholder="Search document title or file name..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            placeholderTextColor="#94A3B8"
                            className="flex-1 text-primary text-sm font-semibold ml-3"
                        />
                    </View>
                </View>
            </View>

            {/* Category horizontal filters */}
            <View className="py-4">
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                >
                    <TouchableOpacity
                        onPress={() => setSelectedCategoryFilter('all')}
                        className={`mr-2 px-4 py-2.5 rounded-xl border ${selectedCategoryFilter === 'all' ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                    >
                        <Text className={`font-bold text-xs ${selectedCategoryFilter === 'all' ? 'text-white' : 'text-primary/75'}`}>
                            All Docs
                        </Text>
                    </TouchableOpacity>
                    {CATEGORIES.map((cat) => {
                        const isSelected = selectedCategoryFilter === cat.value;
                        return (
                            <TouchableOpacity
                                key={cat.value}
                                onPress={() => setSelectedCategoryFilter(cat.value)}
                                className={`mr-2 px-4 py-2.5 rounded-xl border ${isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-primary/75'}`}>
                                    {cat.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Main Documents view */}
            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002147" />}
            >
                {loading && !documents.length ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : filteredDocs.length === 0 ? (
                    <View className="items-center py-20 bg-white rounded-[32px] border border-gray-100 p-6 shadow-sm mt-2">
                        <FileText size={48} color="#94A3B8" strokeWidth={1.5} />
                        <Text className="text-primary font-bold mt-4 text-base">No Documents Found</Text>
                        <Text className="text-gray-400 text-xs text-center mt-2 px-6">
                            Tap the floating '+' button to pick and encrypt your first document.
                        </Text>
                    </View>
                ) : (
                    filteredDocs.map((doc) => (
                        <View 
                            key={doc.id} 
                            className={`bg-white rounded-[28px] p-5 mb-4 border ${doc.is_pinned ? 'border-secondary/40 bg-secondary/5' : 'border-gray-100'} shadow-sm`}
                        >
                            <View className="flex-row justify-between items-start border-b border-gray-50 pb-3.5 mb-3.5">
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="bg-primary/5 p-3 rounded-2xl border border-primary/10 mr-3">
                                        <FileText size={20} color="#002147" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary font-bold text-sm" numberOfLines={1}>
                                            {doc.title}
                                        </Text>
                                        <Text className="text-gray-400 text-[9px] uppercase font-bold tracking-wider mt-1">
                                            {getCategoryLabel(doc.category)} • {doc.formatted_size}
                                        </Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center">
                                    <TouchableOpacity 
                                        onPress={() => handleTogglePin(doc)}
                                        className={`p-2 rounded-xl mr-1 ${doc.is_pinned ? 'bg-secondary/20' : 'bg-gray-50'}`}
                                    >
                                        <Pin size={12} color={doc.is_pinned ? '#D97706' : '#94A3B8'} fill={doc.is_pinned ? '#D97706' : 'none'} />
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={() => handleDeleteDocument(doc.id)}
                                        className="p-2 bg-red-50 rounded-xl"
                                    >
                                        <Trash2 size={12} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {doc.description && (
                                <Text className="text-primary/75 text-xs font-semibold leading-5 mb-3 bg-gray-50/50 p-2.5 rounded-xl">
                                    {doc.description}
                                </Text>
                            )}

                            <View className="flex-row justify-between items-center bg-gray-50 p-3 rounded-2xl">
                                <View className="flex-1 mr-2">
                                    <Text className="text-gray-400 text-[8px] font-bold uppercase tracking-wider">File Name</Text>
                                    <Text className="text-primary/80 text-[10px] font-bold mt-0.5" numberOfLines={1}>{doc.file_name}</Text>
                                </View>
                                <View className="flex-row">
                                    <TouchableOpacity
                                        disabled={decryptingId === doc.id || downloadingId === doc.id}
                                        onPress={() => handleViewDocument(doc)}
                                        className="bg-primary/95 flex-row items-center px-3 py-2 rounded-xl"
                                    >
                                        {decryptingId === doc.id ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <>
                                                <Eye size={12} color="white" />
                                                <Text className="text-white text-[10px] font-black uppercase ml-1 font-semibold">Open</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        disabled={decryptingId === doc.id || downloadingId === doc.id}
                                        onPress={() => handleDownloadDocument(doc)}
                                        className="bg-emerald-600 flex-row items-center px-3 py-2 rounded-xl ml-1.5"
                                    >
                                        {downloadingId === doc.id ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : (
                                            <>
                                                <Download size={12} color="white" />
                                                <Text className="text-white text-[10px] font-black uppercase ml-1 font-semibold">Save</Text>
                                            </>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Floating Action Button for uploads */}
            <TouchableOpacity
                onPress={() => setUploadModalVisible(true)}
                className="absolute bottom-6 right-6 w-14 h-14 bg-secondary rounded-full items-center justify-center shadow-lg shadow-secondary/30"
            >
                <Plus size={28} color="#002147" />
            </TouchableOpacity>

            {/* Secure Upload modal */}
            <Modal
                visible={uploadModalVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setUploadModalVisible(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[40px] p-6 pb-10 shadow-2xl">
                        <View className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
                        <Text className="text-primary font-black text-center text-xs uppercase tracking-widest mb-6">Encrypt & Upload File</Text>

                        {/* Title */}
                        <Text className="text-primary font-bold text-xs mb-2">Document Title</Text>
                        <TextInput
                            value={docTitle}
                            onChangeText={setDocTitle}
                            placeholder="e.g. Admission Letter 2026"
                            className="bg-gray-50 text-primary border border-gray-155 rounded-2xl px-4 h-12 text-sm font-semibold mb-4"
                        />

                        {/* Category Dropdown Selection */}
                        <Text className="text-primary font-bold text-xs mb-2">Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                            {CATEGORIES.map((cat) => {
                                const selected = docCategory === cat.value;
                                return (
                                    <TouchableOpacity
                                        key={cat.value}
                                        onPress={() => setDocCategory(cat.value as any)}
                                        className={`mr-2 px-4.5 py-3 rounded-xl border ${selected ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'}`}
                                    >
                                        <Text className={`font-bold text-xs ${selected ? 'text-white' : 'text-primary'}`}>
                                            {cat.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        {/* Description */}
                        <Text className="text-primary font-bold text-xs mb-2">Description / Notes (Optional)</Text>
                        <TextInput
                            value={docDescription}
                            onChangeText={setDocDescription}
                            placeholder="e.g. Received from Registrar's office on June 4"
                            className="bg-gray-50 text-primary border border-gray-155 rounded-2xl px-4 h-12 text-sm font-semibold mb-6"
                        />

                        {/* Buttons */}
                        <View className="flex-row space-x-3">
                            <TouchableOpacity
                                onPress={() => setUploadModalVisible(false)}
                                className="flex-1 bg-gray-100 rounded-2xl py-4.5 items-center justify-center border border-gray-200"
                            >
                                <Text className="text-gray-700 font-bold text-sm">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                disabled={uploading}
                                onPress={handleUploadPicker}
                                className="flex-1 bg-primary rounded-2xl py-4.5 items-center justify-center flex-row shadow-lg shadow-primary/20"
                            >
                                {uploading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white font-bold text-sm mr-2">Secure & Upload</Text>
                                        <Lock size={14} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
