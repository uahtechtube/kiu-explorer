import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Plus, MessageSquare, Clock, CheckCircle2, AlertTriangle, Hammer } from 'lucide-react-native';
import api from '../../lib/api';

interface Complaint {
    id: number;
    category: string;
    title: string;
    description: string;
    status: 'pending' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    admin_comment?: string;
}

export default function HostelComplaints() {
    const router = useRouter();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Form state
    const [category, setCategory] = useState('other');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const response = await api.get('/student/hostels/complaints');
            setComplaints(response.data.data);
        } catch (error) {
            console.error('Error fetching complaints', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    const onRefresh = React.useCallback(async () => {
        setRefreshing(true);
        await fetchComplaints();
        setRefreshing(false);
    }, []);

    const handleSubmit = async () => {
        if (!title || !description) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        try {
            setSubmitting(true);
            await api.post('/student/hostels/complaints', {
                category,
                title,
                description,
            });
            Alert.alert('Success', 'Complaint submitted successfully.');
            setIsAdding(false);
            setTitle('');
            setDescription('');
            fetchComplaints();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to submit complaint.';
            Alert.alert('Error', message);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return 'bg-green-50 text-green-600';
            case 'in_progress': return 'bg-blue-50 text-blue-600';
            case 'pending': return 'bg-amber-50 text-amber-600';
            default: return 'bg-gray-50 text-gray-500';
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-50">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <ChevronLeft size={24} color="#0F172A" />
                    </TouchableOpacity>
                    <Text className="text-primary text-xl font-bold">Maintenance</Text>
                </View>
                {!isAdding && (
                    <TouchableOpacity
                        onPress={() => setIsAdding(true)}
                        className="bg-primary w-10 h-10 rounded-full items-center justify-center"
                    >
                        <Plus size={20} color="white" />
                    </TouchableOpacity>
                )}
            </View>

            <ScrollView
                className="flex-1"
                contentContainerStyle={{ padding: 24 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {isAdding ? (
                    <View className="bg-gray-50 p-6 rounded-[32px]">
                        <Text className="text-primary text-xl font-bold mb-6">Report an Issue</Text>

                        <Text className="text-gray-500 mb-2 font-semibold">Category</Text>
                        <View className="flex-row flex-wrap mb-4">
                            {['plumbing', 'electrical', 'carpentry', 'cleaning', 'security', 'other'].map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-xl mr-2 mb-2 ${category === cat ? 'bg-primary' : 'bg-white border border-gray-200'
                                        }`}
                                >
                                    <Text className={`text-xs capitalize font-semibold ${category === cat ? 'text-white' : 'text-gray-500'
                                        }`}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text className="text-gray-500 mb-2 font-semibold">Short Title</Text>
                        <TextInput
                            className="bg-white px-4 h-12 rounded-xl border border-gray-200 mb-4 text-primary"
                            placeholder="e.g. Broken faucet"
                            value={title}
                            onChangeText={setTitle}
                        />

                        <Text className="text-gray-500 mb-2 font-semibold">Detailed Description</Text>
                        <TextInput
                            className="bg-white px-4 py-3 rounded-xl border border-gray-200 mb-6 text-primary"
                            style={{ height: 120 }}
                            multiline
                            textAlignVertical="top"
                            placeholder="Describe the issue in detail..."
                            value={description}
                            onChangeText={setDescription}
                        />

                        <View className="flex-row space-x-4">
                            <TouchableOpacity
                                onPress={() => setIsAdding(false)}
                                className="flex-1 bg-white py-4 rounded-2xl items-center border border-gray-200"
                            >
                                <Text className="text-gray-500 font-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={submitting}
                                className="flex-2 bg-primary py-4 rounded-2xl items-center"
                            >
                                {submitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold">Submit Report</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View>
                        <Text className="text-primary text-xl font-bold mb-6">Repair History</Text>
                        {loading && !refreshing ? (
                            <ActivityIndicator size="large" color="#3B82F6" className="mt-10" />
                        ) : complaints.length > 0 ? (
                            complaints.map((item) => (
                                <View
                                    key={item.id}
                                    className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-sm mb-4"
                                >
                                    <View className="flex-row justify-between items-start mb-3">
                                        <View className="bg-blue-50/50 px-3 py-1 rounded-full">
                                            <Text className="text-blue-600 text-[10px] font-bold uppercase tracking-wider">{item.category}</Text>
                                        </View>
                                        <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status).split(' ')[0]}`}>
                                            <Text className={`text-[10px] font-bold uppercase ${getStatusColor(item.status).split(' ')[1]}`}>
                                                {item.status.replace('_', ' ')}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text className="text-primary font-bold text-lg mb-1">{item.title}</Text>
                                    <Text className="text-gray-500 text-sm mb-4">{item.description}</Text>

                                    {item.admin_comment && (
                                        <View className="bg-gray-50 p-4 rounded-2xl mb-4 border-l-4 border-blue-400">
                                            <View className="flex-row items-center mb-1">
                                                <MessageSquare size={14} color="#3B82F6" />
                                                <Text className="text-primary font-bold text-xs ml-2">Feedback:</Text>
                                            </View>
                                            <Text className="text-gray-600 text-xs italic">{item.admin_comment}</Text>
                                        </View>
                                    )}

                                    <View className="flex-row items-center">
                                        <Clock size={12} color="#9CA3AF" />
                                        <Text className="text-gray-400 text-[10px] ml-1">{new Date(item.created_at).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View className="mt-20 items-center">
                                <Hammer size={64} color="#E2E8F0" />
                                <Text className="text-gray-400 mt-4 text-center">No maintenance reports found.</Text>
                                <TouchableOpacity
                                    onPress={() => setIsAdding(true)}
                                    className="mt-6 bg-blue-50 px-8 py-4 rounded-2xl"
                                >
                                    <Text className="text-blue-600 font-bold">Report First Issue</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
