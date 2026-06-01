import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, HelpCircle, MessageSquare, ChevronDown, ChevronUp, Send, CheckCircle, Clock } from 'lucide-react-native';
import api from '../lib/api';

export default function SupportScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'faqs' | 'contact'>('faqs');
    const [isLoading, setIsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [faqs, setFaqs] = useState<any[]>([]);
    const [tickets, setTickets] = useState<any[]>([]);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const [ticketForm, setTicketForm] = useState({
        subject: '',
        message: '',
        priority: 'medium'
    });

    useEffect(() => {
        fetchSupportData();
    }, []);

    const fetchSupportData = async () => {
        try {
            const response = await api.get('/support');
            setFaqs(response.data.faqs);
            setTickets(response.data.tickets);
        } catch (error) {
            console.error('Error fetching support data', error);
        } finally {
            setIsLoading(false);
        }
    };

    const submitTicket = async () => {
        if (!ticketForm.subject || !ticketForm.message) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post('/support/tickets', ticketForm);
            Alert.alert('Success', 'Ticket submitted successfully');
            setTickets([response.data.ticket, ...tickets]);
            setTicketForm({ subject: '', message: '', priority: 'medium' });
            setActiveTab('contact'); // Stay on contact tab but maybe show history
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to submit ticket');
        } finally {
            setSubmitting(false);
        }
    };

    const renderFaqItem = ({ item, index }: { item: any, index: number }) => (
        <TouchableOpacity
            onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
            className="bg-white mb-3 p-4 rounded-xl border border-gray-100 shadow-sm"
        >
            <View className="flex-row justify-between items-center">
                <Text className="text-gray-800 font-bold flex-1 pr-4">{item.question}</Text>
                {expandedFaq === index ? <ChevronUp size={20} color="#9CA3AF" /> : <ChevronDown size={20} color="#9CA3AF" />}
            </View>
            {expandedFaq === index && (
                <View className="mt-3 pt-3 border-t border-gray-50">
                    <Text className="text-gray-600 leading-5">{item.answer}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'resolved': return '#10B981';
            case 'closed': return '#6B7280';
            case 'in_progress': return '#3B82F6';
            default: return '#F59E0B'; // open
        }
    };

    if (isLoading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-gray-200 bg-white">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 bg-gray-100 p-2 rounded-full">
                    <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Support & Help</Text>
            </View>

            {/* Tabs */}
            <View className="flex-row px-6 py-4 space-x-4">
                <TouchableOpacity
                    onPress={() => setActiveTab('faqs')}
                    className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'faqs' ? 'bg-primary' : 'bg-white border border-gray-200'}`}
                >
                    <Text className={`font-bold ${activeTab === 'faqs' ? 'text-white' : 'text-gray-600'}`}>FAQs</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('contact')}
                    className={`flex-1 py-3 rounded-xl items-center ${activeTab === 'contact' ? 'bg-primary' : 'bg-white border border-gray-200'}`}
                >
                    <Text className={`font-bold ${activeTab === 'contact' ? 'text-white' : 'text-gray-600'}`}>Contact Us</Text>
                </TouchableOpacity>
            </View>

            <View className="flex-1 px-6">
                {activeTab === 'faqs' ? (
                    <FlatList
                        data={faqs}
                        keyExtractor={(_, index) => index.toString()}
                        renderItem={renderFaqItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No FAQs available yet.</Text>}
                    />
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Contact Form */}
                        <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                            <View className="flex-row items-center mb-4">
                                <MessageSquare size={20} color="#3B82F6" />
                                <Text className="text-lg font-bold text-gray-800 ml-2">Send a Message</Text>
                            </View>

                            <View className="space-y-4">
                                <View>
                                    <Text className="text-gray-600 mb-2 font-medium">Subject</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 h-12 text-gray-800"
                                        value={ticketForm.subject}
                                        onChangeText={(text) => setTicketForm({ ...ticketForm, subject: text })}
                                        placeholder="Brief summary of issue"
                                    />
                                </View>

                                <View>
                                    <Text className="text-gray-600 mb-2 font-medium">Message</Text>
                                    <TextInput
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 pt-4 text-gray-800"
                                        value={ticketForm.message}
                                        onChangeText={(text) => setTicketForm({ ...ticketForm, message: text })}
                                        placeholder="Describe your issue in detail..."
                                        multiline
                                        numberOfLines={4}
                                        style={{ height: 100, textAlignVertical: 'top' }}
                                    />
                                </View>

                                <TouchableOpacity
                                    onPress={submitTicket}
                                    disabled={submitting}
                                    className="bg-primary py-3 rounded-xl items-center mt-2 flex-row justify-center shadow-lg shadow-blue-900/20"
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Send size={18} color="white" />
                                            <Text className="text-white font-bold text-base ml-2">Submit Ticket</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Recent Tickets History */}
                        <View className="mb-10">
                            <Text className="text-lg font-bold text-gray-800 mb-3 ml-1">Your Recent Tickets</Text>
                            {tickets.length === 0 ? (
                                <View className="bg-gray-50 p-6 rounded-xl item-center justify-center border border-dashed border-gray-300">
                                    <Text className="text-gray-400 text-center">No support tickets found.</Text>
                                </View>
                            ) : (
                                tickets.map((ticket) => (
                                    <View key={ticket.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-3">
                                        <View className="flex-row justify-between items-start mb-2">
                                            <Text className="font-semibold text-gray-800 flex-1 mr-2">{ticket.subject}</Text>
                                            <View
                                                style={{ backgroundColor: `${getStatusColor(ticket.status)}20` }}
                                                className="px-2 py-1 rounded-md"
                                            >
                                                <Text
                                                    style={{ color: getStatusColor(ticket.status) }}
                                                    className="text-xs font-bold uppercase"
                                                >
                                                    {ticket.status.replace('_', ' ')}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-gray-500 text-xs mb-2" numberOfLines={2}>{ticket.message}</Text>
                                        <View className="flex-row items-center">
                                            <Clock size={12} color="#9CA3AF" />
                                            <Text className="text-gray-400 text-xs ml-1">
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    </View>
                                ))
                            )}
                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}
