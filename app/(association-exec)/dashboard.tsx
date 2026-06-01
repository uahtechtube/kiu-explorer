import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
    Modal,
    RefreshControl,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import {
    ChevronLeft,
    Users,
    Vote,
    Plus,
    DollarSign,
    Lock,
    Trash,
    Check,
    AlertTriangle,
    BarChart2
} from 'lucide-react-native';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

const financeStorage = {
    getItem: async (key: string) => {
        if (Platform.OS === 'web') {
            return localStorage.getItem(key);
        }
        return await SecureStore.getItemAsync(key);
    }
};

interface Member {
    id: number;
    user: {
        id: number;
        first_name: string;
        surname: string;
        email: string;
        matric_number: string;
    };
    role: string;
    status: string;
}

interface Poll {
    id: number;
    title: string;
    description: string;
    is_active: boolean;
    options: Array<{
        id: number;
        option_text: string;
        votes_count: number;
    }>;
}

export default function AssociationExecDashboard() {
    const { associationId, associationName } = useLocalSearchParams();
    const router = useRouter();
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState<'members' | 'polls'>('members');

    // Data States
    const [members, setMembers] = useState<Member[]>([]);
    const [polls, setPolls] = useState<Poll[]>([]);
    const [totalCollected, setTotalCollected] = useState(0);

    // Create Poll Modal State
    const [pollModalVisible, setPollModalVisible] = useState(false);
    const [pollTitle, setPollTitle] = useState('');
    const [pollDescription, setPollDescription] = useState('');
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
    const [isCreatingPoll, setIsCreatingPoll] = useState(false);

    const loadFinancials = async () => {
        try {
            const storedFinances = await financeStorage.getItem(`association_finances_${associationId}`);
            if (storedFinances) {
                const parsed = JSON.parse(storedFinances);
                setTotalCollected(parsed.totalCollected || 0);
            } else {
                setTotalCollected(0);
            }
        } catch (e) {
            console.error('Error loading financials in dashboard:', e);
            setTotalCollected(0);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Association Members
            const membersResponse = await api.get(`/student/associations/${associationId}/members`);
            setMembers(membersResponse.data.data || []);

            // 2. Fetch Association Polls
            const pollsResponse = await api.get('/polls', {
                params: { association_id: associationId }
            });
            setPolls(pollsResponse.data || []);

            // 3. Fetch Financials
            await loadFinancials();
        } catch (error) {
            console.error('Error fetching association exec dashboard data:', error);
            Alert.alert('Error', 'Could not load executive data. Please check connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        const unsubscribe = navigation.addListener('focus', () => {
            loadFinancials();
        });
        return unsubscribe;
    }, [associationId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const handleAddOptionField = () => {
        setPollOptions([...pollOptions, '']);
    };

    const handleRemoveOptionField = (index: number) => {
        if (pollOptions.length <= 2) return;
        const updated = [...pollOptions];
        updated.splice(index, 1);
        setPollOptions(updated);
    };

    const handleOptionChange = (text: string, index: number) => {
        const updated = [...pollOptions];
        updated[index] = text;
        setPollOptions(updated);
    };

    const handleCreatePoll = async () => {
        if (!pollTitle.trim()) {
            Alert.alert('Validation Error', 'Poll title is required');
            return;
        }

        const validOptions = pollOptions.filter(opt => opt.trim().length > 0);
        if (validOptions.length < 2) {
            Alert.alert('Validation Error', 'Please specify at least 2 non-empty options.');
            return;
        }

        setIsCreatingPoll(true);
        try {
            await api.post('/polls', {
                association_id: associationId,
                title: pollTitle,
                description: pollDescription,
                options: validOptions,
                starts_at: new Date().toISOString(),
                ends_at: new Date(Date.now() + 7 * 86400000).toISOString(), // 7 days default
                allow_multiple_votes: false,
                show_results_before_voting: true
            });

            Alert.alert('Success', 'Poll created successfully!');
            setPollTitle('');
            setPollDescription('');
            setPollOptions(['', '']);
            setPollModalVisible(false);
            fetchData();
        } catch (error) {
            console.error('Failed to create poll:', error);
            Alert.alert('Error', 'Failed to create poll. Please try again.');
        } finally {
            setIsCreatingPoll(false);
        }
    };

    const handleClosePoll = (pollId: number) => {
        Alert.alert(
            'Close Poll',
            'Are you sure you want to end this poll? No more votes will be allowed.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Close Poll',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.post(`/polls/${pollId}/close`);
                            Alert.alert('Success', 'Poll ended successfully.');
                            fetchData();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to close poll.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                        <ChevronLeft size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white text-lg font-bold">Executive Office</Text>
                    <View className="w-10" />
                </View>

                <View className="mt-8">
                    <Text className="text-yellow-400 text-xs font-bold uppercase mb-1">Association Manager</Text>
                    <Text className="text-white text-2xl font-bold" numberOfLines={1}>{associationName}</Text>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-6 -mt-6"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {/* Dues and Finance Stat Card */}
                <PremiumCard variant="gradient" className="p-5 mt-2 mb-6 shadow-md border-0">
                    <View className="flex-row justify-between items-center mb-4">
                        <View className="flex-1">
                            <Text className="text-white/60 text-xs uppercase font-bold tracking-wider">Financial Overview</Text>
                            <Text className="text-white text-3xl font-extrabold mt-1">₦{totalCollected.toLocaleString()}</Text>
                            <Text className="text-yellow-400 text-xs font-semibold mt-1">Total Dues Collected</Text>
                        </View>
                        <View className="w-12 h-12 bg-white/15 rounded-2xl items-center justify-center">
                            <DollarSign size={24} color="#FFF" />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: '/(association-exec)/finances',
                            params: { associationId, associationName }
                        })}
                        className="bg-white py-3 rounded-2xl items-center justify-center shadow-sm"
                    >
                        <Text className="text-primary font-bold text-sm">Open Financial Center</Text>
                    </TouchableOpacity>
                </PremiumCard>

                {/* Tab Selectors */}
                <View className="bg-gray-200/60 p-1.5 rounded-2xl flex-row items-center mb-6">
                    <TouchableOpacity
                        onPress={() => setActiveTab('members')}
                        className={`flex-1 py-3 rounded-xl flex-row justify-center items-center ${
                            activeTab === 'members' ? 'bg-white shadow-sm' : ''
                        }`}
                    >
                        <Users size={16} color={activeTab === 'members' ? '#002147' : '#64748B'} />
                        <Text className={`font-bold text-xs ml-2 ${
                            activeTab === 'members' ? 'text-primary' : 'text-gray-500'
                        }`}>
                            Roster ({members.length})
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setActiveTab('polls')}
                        className={`flex-1 py-3 rounded-xl flex-row justify-center items-center ${
                            activeTab === 'polls' ? 'bg-white shadow-sm' : ''
                        }`}
                    >
                        <Vote size={16} color={activeTab === 'polls' ? '#002147' : '#64748B'} />
                        <Text className={`font-bold text-xs ml-2 ${
                            activeTab === 'polls' ? 'text-primary' : 'text-gray-500'
                        }`}>
                            Polls ({polls.length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Contents */}
                {loading ? (
                    <ActivityIndicator size="large" color="#002147" className="mt-10" />
                ) : activeTab === 'members' ? (
                    <View>
                        {members.length > 0 ? (
                            members.map((member) => (
                                <PremiumCard key={member.id} variant="solid" className="mb-3 p-4 bg-white border-gray-100 flex-row items-center justify-between">
                                    <View className="flex-1 mr-3">
                                        <Text className="text-primary font-bold text-sm">
                                            {member.user.first_name} {member.user.surname}
                                        </Text>
                                        <Text className="text-gray-400 text-xs mt-0.5">{member.user.matric_number || member.user.email}</Text>
                                    </View>

                                    <View className="bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                                        <Text className="text-primary text-[9px] font-black uppercase tracking-wider">
                                            {member.role}
                                        </Text>
                                    </View>
                                </PremiumCard>
                            ))
                        ) : (
                            <View className="bg-white rounded-3xl p-8 items-center border border-gray-100">
                                <Users size={32} color="#CBD5E1" />
                                <Text className="text-gray-400 mt-2 font-bold">No active members found</Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View>
                        <TouchableOpacity
                            onPress={() => setPollModalVisible(true)}
                            className="bg-primary/10 border-2 border-dashed border-primary/20 p-4 rounded-3xl items-center flex-row justify-center mb-4"
                        >
                            <Plus size={18} color="#002147" />
                            <Text className="text-primary font-bold ml-2">Create Election or Poll</Text>
                        </TouchableOpacity>

                        {polls.length > 0 ? (
                            polls.map((poll) => {
                                const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes_count, 0);
                                return (
                                    <PremiumCard key={poll.id} variant="solid" className="mb-4 p-5 bg-white border-gray-100">
                                        <View className="flex-row justify-between items-start mb-2">
                                            <View className="flex-1">
                                                <Text className="text-primary font-bold text-base" numberOfLines={1}>{poll.title}</Text>
                                                <Text className="text-gray-400 text-xs mt-0.5">{poll.description || 'No description provided'}</Text>
                                            </View>
                                            <View className={`px-2.5 py-0.5 rounded-full ${
                                                poll.is_active ? 'bg-green-100' : 'bg-gray-100'
                                            }`}>
                                                <Text className={`text-[9px] font-black tracking-widest ${
                                                    poll.is_active ? 'text-green-700' : 'text-gray-500'
                                                }`}>
                                                    {poll.is_active ? 'ACTIVE' : 'CLOSED'}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Poll Option Stats */}
                                        <View className="my-4 space-y-2">
                                            {poll.options.map((opt) => {
                                                const percentage = totalVotes > 0 ? (opt.votes_count / totalVotes) * 100 : 0;
                                                return (
                                                    <View key={opt.id} className="mb-2">
                                                        <View className="flex-row justify-between items-center mb-1">
                                                            <Text className="text-gray-700 text-xs font-semibold">{opt.option_text}</Text>
                                                            <Text className="text-primary text-xs font-bold">{opt.votes_count} votes ({percentage.toFixed(0)}%)</Text>
                                                        </View>
                                                        <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                            <View
                                                                className="h-full bg-primary rounded-full"
                                                                style={{ width: `${percentage}%` }}
                                                            />
                                                        </View>
                                                    </View>
                                                );
                                            })}
                                        </View>

                                        {poll.is_active && (
                                            <TouchableOpacity
                                                onPress={() => handleClosePoll(poll.id)}
                                                className="border border-red-200 py-2.5 rounded-xl items-center justify-center flex-row"
                                            >
                                                <Lock size={14} color="#EF4444" />
                                                <Text className="text-red-500 text-xs font-bold ml-1.5">Close Poll Now</Text>
                                            </TouchableOpacity>
                                        )}
                                    </PremiumCard>
                                );
                            })
                        ) : (
                            <View className="bg-white rounded-3xl p-8 items-center border border-gray-100">
                                <Vote size={32} color="#CBD5E1" />
                                <Text className="text-gray-400 mt-2 font-bold">No polls created yet</Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* Create Poll Modal */}
            <Modal visible={pollModalVisible} animationType="slide" transparent>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-[40px] h-[85%] p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-primary">Create Poll / Election</Text>
                            <TouchableOpacity
                                onPress={() => setPollModalVisible(false)}
                                className="bg-gray-100 p-2 rounded-full"
                            >
                                <Text className="text-gray-500 font-bold text-xs">Cancel</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                            <View className="space-y-4 mb-6">
                                <View>
                                    <Text className="text-primary font-bold text-xs uppercase mb-2 ml-1">Poll Title</Text>
                                    <TextInput
                                        value={pollTitle}
                                        onChangeText={setPollTitle}
                                        placeholder="e.g. 2026 Association Presidential Election"
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 h-14 text-primary text-sm"
                                    />
                                </View>

                                <View>
                                    <Text className="text-primary font-bold text-xs uppercase mb-2 ml-1">Description / Guidelines</Text>
                                    <TextInput
                                        value={pollDescription}
                                        onChangeText={setPollDescription}
                                        placeholder="Guidelines, requirements, or instructions for this vote."
                                        multiline
                                        className="bg-gray-50 border border-gray-100 rounded-2xl px-4 pt-4 text-primary text-sm"
                                        style={{ height: 80, textAlignVertical: 'top' }}
                                    />
                                </View>

                                <Text className="text-primary font-bold text-xs uppercase mt-4 mb-2 ml-1">Options / Candidates</Text>

                                {pollOptions.map((opt, idx) => (
                                    <View key={idx} className="flex-row items-center mb-2">
                                        <TextInput
                                            value={opt}
                                            onChangeText={(text) => handleOptionChange(text, idx)}
                                            placeholder={`Option ${idx + 1}`}
                                            className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 h-12 text-primary text-sm"
                                        />
                                        {pollOptions.length > 2 && (
                                            <TouchableOpacity
                                                onPress={() => handleRemoveOptionField(idx)}
                                                className="ml-2 w-10 h-10 bg-red-50 rounded-full items-center justify-center"
                                            >
                                                <Trash size={16} color="#EF4444" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                ))}

                                <TouchableOpacity
                                    onPress={handleAddOptionField}
                                    className="bg-gray-100 py-3 rounded-2xl items-center flex-row justify-center border border-gray-200 mt-2"
                                >
                                    <Plus size={16} color="#002147" />
                                    <Text className="text-primary font-bold text-xs ml-1">Add Another Option</Text>
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                onPress={handleCreatePoll}
                                disabled={isCreatingPoll}
                                className="bg-primary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/30 mb-8"
                            >
                                {isCreatingPoll ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <>
                                        <Text className="text-white text-base font-bold mr-2">Publish Poll Now</Text>
                                        <Check size={20} color="white" />
                                    </>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
