import React, { useEffect, useState } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, RefreshControl,
    TextInput, ActivityIndicator, Alert, Linking, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
    Bell, Shield, Hammer, Phone, Mail, Plus,
    MessageSquare, Clock, ChevronRight, Info, AlertTriangle, CheckCircle2, ChevronLeft, UserCheck, MapPin
} from 'lucide-react-native';
import api from '../../lib/api';

interface Announcement {
    id: number;
    title: string;
    content: string;
    type: 'general' | 'academic' | 'emergency' | 'event' | 'exam' | 'administrative';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    published_at: string;
}

interface Hostel {
    id: number;
    name: string;
    gender_type: 'male' | 'female' | 'mixed';
}

interface Rule {
    id: number;
    title: string;
    description: string;
}

interface HostelHead {
    id: number;
    hostel_id: number;
    name: string;
    title: string;
    phone: string | null;
    email: string | null;
    room_number: string | null;
    office_hours: string | null;
    bio: string | null;
    image: string | null;
    is_active: boolean;
    hostel?: { id: number; name: string; gender_type: string };
}

interface Complaint {
    id: number;
    category: string;
    title: string;
    description: string;
    status: 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
    created_at: string;
    admin_comment?: string;
}

export default function HostelHub() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'complaints' | 'contact' | 'head'>('alerts');
    
    // Core data states
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [hostelHeads, setHostelHeads] = useState<HostelHead[]>([]);
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [selectedHostelForRule, setSelectedHostelForRule] = useState<number | null>(null);
    
    // Loading & Refreshing states
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Complaint form states
    const [isReporting, setIsReporting] = useState(false);
    const [formCategory, setFormCategory] = useState('other');
    const [formHostelId, setFormHostelId] = useState<string>('');
    const [formRoomNumber, setFormRoomNumber] = useState('');
    const [formTitle, setFormTitle] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [submittingComplaint, setSubmittingComplaint] = useState(false);

    // Fetch hostels list on mount
    useEffect(() => {
        api.get('/student/hostels')
            .then(r => {
                const data: Hostel[] = r.data.data || [];
                setHostels(data);
                // Auto-select first hostel for rules tab
                if (data.length > 0 && selectedHostelForRule === null) {
                    setSelectedHostelForRule(data[0].id);
                }
            })
            .catch(e => console.error('Error fetching hostels', e));
    }, []);

    // Fetch tab-specific data
    const loadData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'alerts') {
                const response = await api.get('/student/announcements');
                // Support both direct array and wrapped data structures
                const data = Array.isArray(response.data) ? response.data : (response.data.data || []);
                setAnnouncements(data);
            } else if (activeTab === 'rules') {
                if (selectedHostelForRule !== null) {
                    const response = await api.get(`/student/hostels/${selectedHostelForRule}/rules`);
                    setRules(response.data.data || []);
                }
            } else if (activeTab === 'complaints') {
                const response = await api.get('/student/hostels/complaints');
                setComplaints(response.data.data || []);
            } else if (activeTab === 'head') {
                const response = await api.get('/student/hostel-heads');
                setHostelHeads(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching data for tab: ' + activeTab, error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [activeTab, selectedHostelForRule]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    };

    const handleCallManagement = () => {
        Linking.openURL('tel:+2348031234567').catch(() => {
            Alert.alert('Error', 'Could not open phone dialer.');
        });
    };

    const handleEmailManagement = () => {
        Linking.openURL('mailto:hostels@kiu.edu.ng').catch(() => {
            Alert.alert('Error', 'Could not open email application.');
        });
    };

    const handleSubmitComplaint = async () => {
        if (!formTitle || !formDescription) {
            Alert.alert('Error', 'Please enter a title and description.');
            return;
        }

        try {
            setSubmittingComplaint(true);
            await api.post('/student/hostels/complaints', {
                category: formCategory,
                hostel_id: formHostelId ? parseInt(formHostelId) : null,
                room_number: formRoomNumber || null,
                title: formTitle,
                description: formDescription,
            });
            Alert.alert('Success', 'Complaint submitted successfully.');
            setIsReporting(false);
            setFormTitle('');
            setFormDescription('');
            setFormRoomNumber('');
            setFormCategory('other');
            // Reload complaints history
            const response = await api.get('/student/hostels/complaints');
            setComplaints(response.data.data || []);
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to submit complaint.';
            Alert.alert('Error', message);
        } finally {
            setSubmittingComplaint(false);
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'resolved':
            case 'closed':
                return { bg: 'bg-green-50', text: 'text-green-600', label: 'Resolved' };
            case 'in_progress':
            case 'assigned':
                return { bg: 'bg-blue-50', text: 'text-blue-600', label: 'In Progress' };
            default:
                return { bg: 'bg-amber-50', text: 'text-amber-600', label: 'Pending' };
        }
    };

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case 'urgent':
            case 'high':
                return { bg: 'bg-rose-50 border-rose-100', text: 'text-rose-600' };
            case 'medium':
                return { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600' };
            default:
                return { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600' };
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="px-6 pt-4 pb-4 border-b border-gray-100 flex-row items-center bg-white shadow-sm">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 w-10 h-10 bg-slate-50 rounded-full items-center justify-center">
                    <ChevronLeft size={20} color="#0F172A" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="text-primary text-2xl font-black">Hostel Hub</Text>
                    <Text className="text-gray-400 text-xs">Guidelines, alerts & complaints portal</Text>
                </View>
            </View>

            {/* Quick Segmented Control Navigation */}
            <View className="px-6 py-4 bg-gray-50/50">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row space-x-2">
                    {[
                        { id: 'alerts', label: 'Alerts', icon: Bell },
                        { id: 'rules', label: 'Rules & Guidelines', icon: Shield },
                        { id: 'complaints', label: 'Maintenance Log', icon: Hammer },
                        { id: 'head', label: 'Meet the Head', icon: UserCheck },
                        { id: 'contact', label: 'Contact Office', icon: Phone },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => {
                                setIsReporting(false);
                                setActiveTab(tab.id as any);
                            }}
                            className={`flex-row items-center px-5 py-3.5 rounded-[20px] mr-2 border ${
                                activeTab === tab.id
                                    ? 'bg-primary border-primary shadow-md'
                                    : 'bg-white border-gray-100 shadow-sm'
                            }`}
                        >
                            <tab.icon size={16} color={activeTab === tab.id ? 'white' : '#64748B'} className="mr-2" />
                            <Text className={`text-xs font-bold ${activeTab === tab.id ? 'text-white' : 'text-slate-600'}`}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Main Content Area */}
            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    activeTab !== 'contact' && !isReporting ? (
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    ) : undefined
                }
            >
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#3B82F6" className="mt-20" />
                ) : (
                    <View className="py-4">
                        {/* 1. ALERTS & ANNOUNCEMENTS TAB */}
                        {activeTab === 'alerts' && (
                            <View>
                                <Text className="text-primary text-lg font-black mb-4">Official Announcements</Text>
                                {announcements.length > 0 ? (
                                    announcements.map((ann) => {
                                        const pStyles = getPriorityStyles(ann.priority);
                                        return (
                                            <View
                                                key={ann.id}
                                                className={`bg-white border p-5 rounded-[28px] shadow-sm mb-4 ${pStyles.bg}`}
                                            >
                                                <View className="flex-row justify-between items-center mb-3">
                                                    <View className="flex-row items-center">
                                                        <Bell size={16} color={ann.priority === 'urgent' ? '#EF4444' : '#3B82F6'} />
                                                        <Text className="text-[10px] font-bold text-slate-500 ml-2 uppercase">
                                                            {ann.type}
                                                        </Text>
                                                    </View>
                                                    <View className={`px-2 py-0.5 rounded-md border ${pStyles.bg}`}>
                                                        <Text className={`text-[8px] font-bold uppercase ${pStyles.text}`}>
                                                            {ann.priority}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <Text className="text-primary font-bold text-base mb-2">{ann.title}</Text>
                                                <Text className="text-slate-600 text-xs leading-5">{ann.content}</Text>
                                                <View className="flex-row items-center mt-4 pt-3 border-t border-slate-100">
                                                    <Clock size={12} color="#94A3B8" />
                                                    <Text className="text-[10px] text-gray-400 font-semibold ml-1.5">
                                                        Posted on {new Date(ann.published_at).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                            </View>
                                        );
                                    })
                                ) : (
                                    <View className="mt-16 items-center">
                                        <Bell size={48} color="#CBD5E1" strokeWidth={1.5} />
                                        <Text className="text-gray-400 mt-4 text-center font-bold">No announcements active</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* 2. RULES & GUIDELINES TAB */}
                        {activeTab === 'rules' && (
                            <View>
                                <Text className="text-primary text-lg font-black mb-1">Rules & Guidelines</Text>
                                <Text className="text-gray-400 text-xs mb-5">Select a hostel to view its specific rules</Text>

                                {/* Dynamic Hostel Selector with gender badges */}
                                {hostels.length > 0 ? (
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5">
                                        {hostels.map((hostel) => {
                                            const isFemale = hostel.gender_type === 'female';
                                            const isSelected = selectedHostelForRule === hostel.id;
                                            const genderLabel = isFemale ? '♀ Female' : hostel.gender_type === 'male' ? '♂ Male' : '⚥ Mixed';
                                            const genderColor = isFemale ? '#EC4899' : hostel.gender_type === 'male' ? '#3B82F6' : '#8B5CF6';
                                            return (
                                                <TouchableOpacity
                                                    key={hostel.id}
                                                    onPress={() => setSelectedHostelForRule(hostel.id)}
                                                    className={`mr-3 px-5 py-4 rounded-[22px] border items-center min-w-[140px] ${
                                                        isSelected
                                                            ? 'border-transparent shadow-md'
                                                            : 'bg-gray-50 border-gray-100'
                                                    }`}
                                                    style={isSelected ? { backgroundColor: genderColor } : {}}
                                                >
                                                    <Text className={`font-black text-sm ${
                                                        isSelected ? 'text-white' : 'text-primary'
                                                    }`}>{hostel.name}</Text>
                                                    <Text className={`text-[10px] font-semibold mt-0.5 ${
                                                        isSelected ? 'text-white/70' : 'text-gray-400'
                                                    }`}>{genderLabel}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                ) : (
                                    <View className="bg-gray-50 rounded-2xl px-4 py-3 mb-5 items-center">
                                        <Text className="text-gray-400 text-xs">Loading hostels...</Text>
                                    </View>
                                )}

                                {/* Rules Container */}
                                <View className="bg-gray-50 p-6 rounded-[32px]">
                                    {!selectedHostelForRule ? (
                                        <View className="items-center py-10">
                                            <Info size={32} color="#94A3B8" />
                                            <Text className="text-gray-400 mt-2 text-center text-xs">Select a hostel above to view its rules.</Text>
                                        </View>
                                    ) : rules.length > 0 ? (
                                        rules.map((rule, idx) => (
                                            <View key={rule.id} className="mb-4">
                                                <View className="flex-row items-start">
                                                    <Text className="text-blue-500 font-black text-sm mr-2">{idx + 1}.</Text>
                                                    <Text className="text-primary font-bold text-sm flex-1">{rule.title}</Text>
                                                </View>
                                                <Text className="text-slate-500 text-xs pl-5 mt-1 leading-5">
                                                    {rule.description}
                                                </Text>
                                            </View>
                                        ))
                                    ) : (
                                        <View className="items-center py-10">
                                            <Info size={32} color="#94A3B8" />
                                            <Text className="text-gray-400 mt-2 text-center text-xs">
                                                No specific guidelines posted for this hostel. Please adhere to basic campus residential rules.
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        )}

                        {/* 3. MAINTENANCE LOGS & REPORTING TAB */}
                        {activeTab === 'complaints' && (
                            <View>
                                {isReporting ? (
                                    /* REPORTING FORM */
                                    <View className="bg-gray-50 p-6 rounded-[32px]">
                                        <View className="flex-row justify-between items-center mb-6">
                                            <Text className="text-primary text-xl font-bold">Report an Issue</Text>
                                            <TouchableOpacity onPress={() => setIsReporting(false)}>
                                                <Text className="text-blue-500 font-bold text-xs uppercase">Cancel</Text>
                                            </TouchableOpacity>
                                        </View>

                                        <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Category</Text>
                                        <View className="flex-row flex-wrap mb-4">
                                            {['plumbing', 'electrical', 'carpentry', 'cleaning', 'security', 'other'].map((cat) => (
                                                <TouchableOpacity
                                                    key={cat}
                                                    onPress={() => setFormCategory(cat)}
                                                    className={`px-3 py-2 rounded-xl mr-2 mb-2 ${
                                                        formCategory === cat ? 'bg-primary' : 'bg-white border border-gray-200'
                                                    }`}
                                                >
                                                    <Text className={`text-[10px] capitalize font-semibold ${
                                                        formCategory === cat ? 'text-white' : 'text-gray-500'
                                                    }`}>{cat}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Hostel Location</Text>
                                        {/* Dynamic hostel selector in complaint form */}
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                                            {[
                                                ...hostels.map(h => ({ id: String(h.id), name: h.name })),
                                                { id: '', name: 'General/None' }
                                            ].map((h) => (
                                                <TouchableOpacity
                                                    key={h.name}
                                                    onPress={() => setFormHostelId(h.id)}
                                                    className={`px-4 py-3.5 rounded-xl border mr-2 items-center ${
                                                        formHostelId === h.id
                                                            ? 'bg-slate-900 border-slate-900'
                                                            : 'bg-white border-gray-200'
                                                    }`}
                                                >
                                                    <Text className={`text-[10px] font-bold ${
                                                        formHostelId === h.id ? 'text-white' : 'text-slate-500'
                                                    }`}>
                                                        {h.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>

                                        <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Room / Block Number</Text>
                                        <TextInput
                                            className="bg-white px-4 h-12 rounded-xl border border-gray-200 mb-4 text-primary text-sm font-semibold"
                                            placeholder="e.g. Room A04, Block B"
                                            value={formRoomNumber}
                                            onChangeText={setFormRoomNumber}
                                        />

                                        <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Title</Text>
                                        <TextInput
                                            className="bg-white px-4 h-12 rounded-xl border border-gray-200 mb-4 text-primary text-sm font-semibold"
                                            placeholder="e.g. Water leak in bathroom"
                                            value={formTitle}
                                            onChangeText={setFormTitle}
                                        />

                                        <Text className="text-gray-500 text-xs font-bold uppercase mb-2">Description</Text>
                                        <TextInput
                                            className="bg-white px-4 py-3 rounded-xl border border-gray-200 mb-6 text-primary text-sm"
                                            style={{ height: 100 }}
                                            multiline
                                            textAlignVertical="top"
                                            placeholder="Provide more specific details of the issue..."
                                            value={formDescription}
                                            onChangeText={setFormDescription}
                                        />

                                        <TouchableOpacity
                                            onPress={handleSubmitComplaint}
                                            disabled={submittingComplaint}
                                            className="bg-primary py-4.5 rounded-2xl items-center shadow-sm"
                                        >
                                            {submittingComplaint ? (
                                                <ActivityIndicator color="white" />
                                            ) : (
                                                <Text className="text-white font-bold text-sm uppercase">Submit Complaint</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    /* COMPLAINTS HISTORY */
                                    <View>
                                        <View className="flex-row justify-between items-center mb-6">
                                            <Text className="text-primary text-lg font-black">Maintenance & Complaints</Text>
                                            <TouchableOpacity
                                                onPress={() => setIsReporting(true)}
                                                className="bg-primary/10 px-4 py-2 rounded-xl flex-row items-center border border-primary/15"
                                            >
                                                <Plus size={14} color="#3B82F6" />
                                                <Text className="text-blue-600 text-xs font-bold ml-1.5">File Report</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {complaints.length > 0 ? (
                                            complaints.map((item) => {
                                                const statusMeta = getStatusStyles(item.status);
                                                return (
                                                    <View
                                                        key={item.id}
                                                        className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-sm mb-4"
                                                    >
                                                        <View className="flex-row justify-between items-start mb-3">
                                                            <View className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                                                <Text className="text-slate-500 text-[9px] font-bold uppercase tracking-wider">
                                                                    {item.category}
                                                                </Text>
                                                            </View>
                                                            <View className={`px-3 py-1 rounded-full ${statusMeta.bg}`}>
                                                                <Text className={`text-[9px] font-bold uppercase ${statusMeta.text}`}>
                                                                    {statusMeta.label}
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        <Text className="text-primary font-bold text-base mb-1">{item.title}</Text>
                                                        <Text className="text-gray-500 text-xs leading-5 mb-4">{item.description}</Text>

                                                        {item.admin_comment && (
                                                            <View className="bg-gray-50 p-4 rounded-2xl mb-4 border-l-4 border-blue-400">
                                                                <View className="flex-row items-center mb-1">
                                                                    <MessageSquare size={12} color="#3B82F6" />
                                                                    <Text className="text-primary font-bold text-[10px] ml-1.5">Feedback:</Text>
                                                                </View>
                                                                <Text className="text-slate-600 text-xs italic">
                                                                    "{item.admin_comment}"
                                                                </Text>
                                                            </View>
                                                        )}

                                                        <View className="flex-row items-center">
                                                            <Clock size={12} color="#94A3B8" />
                                                            <Text className="text-gray-400 text-[10px] ml-1.5">
                                                                Submitted on {new Date(item.created_at).toLocaleDateString()}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                );
                                            })
                                        ) : (
                                            <View className="mt-16 items-center">
                                                <Hammer size={48} color="#CBD5E1" strokeWidth={1.5} />
                                                <Text className="text-gray-400 mt-4 text-center font-bold">No maintenance filings</Text>
                                                <TouchableOpacity
                                                    onPress={() => setIsReporting(true)}
                                                    className="mt-4 bg-slate-50 border border-slate-100 px-6 py-3.5 rounded-2xl"
                                                >
                                                    <Text className="text-slate-600 font-bold text-xs">File First Complaint</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}

                        {/* 4. MEET THE HEAD TAB */}
                        {activeTab === 'head' && (
                            <View>
                                <Text className="text-primary text-lg font-black mb-1">Meet the Hostel Head</Text>
                                <Text className="text-gray-400 text-xs mb-6">
                                    Get to know your hostel wardens and hall masters.
                                </Text>

                                {hostelHeads.length > 0 ? (
                                    hostelHeads.map((head) => {
                                        const imgUrl = head.image
                                            ? `${api.defaults.baseURL?.replace('/api', '')}/storage/${head.image}`
                                            : null;
                                        const genderColor = head.hostel?.gender_type === 'male'
                                            ? { bg: '#EFF6FF', text: '#3B82F6', label: 'Male Hall' }
                                            : head.hostel?.gender_type === 'female'
                                            ? { bg: '#FDF4FF', text: '#A855F7', label: 'Female Hall' }
                                            : { bg: '#F0FDF4', text: '#22C55E', label: 'Mixed Hall' };

                                        return (
                                            <View key={head.id} className="bg-white border border-gray-100 rounded-[32px] shadow-sm mb-5 overflow-hidden">
                                                {/* Card Banner */}
                                                <View className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 pt-6 pb-8" style={{ backgroundColor: '#0F172A' }}>
                                                    <View className="flex-row items-center mb-2">
                                                        {imgUrl ? (
                                                            <Image
                                                                source={{ uri: imgUrl }}
                                                                className="w-20 h-20 rounded-full border-4 border-white/20 mr-4"
                                                                style={{ borderColor: 'rgba(255,255,255,0.3)' }}
                                                            />
                                                        ) : (
                                                            <View className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 items-center justify-center mr-4">
                                                                <UserCheck size={32} color="rgba(255,255,255,0.6)" />
                                                            </View>
                                                        )}
                                                        <View className="flex-1">
                                                            <Text className="text-white font-black text-lg leading-tight">{head.name}</Text>
                                                            <Text className="text-white/60 text-xs font-semibold mt-0.5">{head.title}</Text>
                                                            {head.hostel && (
                                                                <View className="flex-row items-center mt-2">
                                                                    <View style={{ backgroundColor: genderColor.bg }} className="px-3 py-1 rounded-full">
                                                                        <Text style={{ color: genderColor.text }} className="text-[10px] font-bold">
                                                                            {head.hostel.name}
                                                                        </Text>
                                                                    </View>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>
                                                </View>

                                                {/* Details panel */}
                                                <View className="px-5 pt-5 pb-5 gap-3">
                                                    {head.bio && (
                                                        <Text className="text-slate-600 text-xs leading-5 italic mb-2">"{head.bio}"</Text>
                                                    )}

                                                    {head.phone && (
                                                        <View className="flex-row items-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                                                            <Phone size={14} color="#3B82F6" />
                                                            <Text className="text-primary font-semibold text-xs ml-3">{head.phone}</Text>
                                                        </View>
                                                    )}
                                                    {head.email && (
                                                        <View className="flex-row items-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                                                            <Mail size={14} color="#3B82F6" />
                                                            <Text className="text-primary font-semibold text-xs ml-3">{head.email}</Text>
                                                        </View>
                                                    )}
                                                    {head.room_number && (
                                                        <View className="flex-row items-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                                                            <MapPin size={14} color="#3B82F6" />
                                                            <Text className="text-primary font-semibold text-xs ml-3">Office: {head.room_number}</Text>
                                                        </View>
                                                    )}
                                                    {head.office_hours && (
                                                        <View className="flex-row items-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100">
                                                            <Clock size={14} color="#3B82F6" />
                                                            <Text className="text-primary font-semibold text-xs ml-3">{head.office_hours}</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        );
                                    })
                                ) : (
                                    <View className="mt-16 items-center">
                                        <UserCheck size={48} color="#CBD5E1" strokeWidth={1.5} />
                                        <Text className="text-gray-400 mt-4 text-center font-bold">No hostel heads listed yet.</Text>
                                        <Text className="text-gray-300 text-xs text-center mt-1">Check back later or contact the admin office.</Text>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* 5. EMERGENCY CONTACTS TAB */}

                        {activeTab === 'contact' && (
                            <View>
                                <Text className="text-primary text-lg font-black mb-1">Hostel Administration Office</Text>
                                <Text className="text-gray-400 text-xs mb-6">Need immediate assistance? Reach out directly.</Text>

                                <View className="bg-slate-50 border border-slate-100 p-6 rounded-[32px] mb-6">
                                    <Text className="text-primary font-bold text-sm mb-3">Student Affairs Representative</Text>
                                    <Text className="text-slate-600 text-xs leading-5 mb-4">
                                        For issues regarding water shortages, electric faults, guidelines violations, safety alerts, or general maintenance support, contact the wardens or student affairs board.
                                    </Text>
                                    <View className="flex-row items-center mb-2">
                                        <Info size={14} color="#64748B" />
                                        <Text className="text-slate-500 text-xs ml-2">Office Room 102, Main Admin Block</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <Clock size={14} color="#64748B" />
                                        <Text className="text-slate-500 text-xs ml-2">Available: Mon - Fri (8:00 AM - 5:00 PM)</Text>
                                    </View>
                                </View>

                                {/* Contact Action Buttons */}
                                <TouchableOpacity
                                    onPress={handleCallManagement}
                                    className="bg-primary flex-row items-center justify-center py-5 rounded-[28px] mb-4 shadow-sm"
                                >
                                    <Phone size={18} color="white" />
                                    <Text className="text-white font-bold text-sm ml-2.5 uppercase tracking-wide">Call Wardens Office</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={handleEmailManagement}
                                    className="bg-slate-100 border border-slate-200 flex-row items-center justify-center py-5 rounded-[28px] mb-6"
                                >
                                    <Mail size={18} color="#0F172A" />
                                    <Text className="text-slate-900 font-bold text-sm ml-2.5 uppercase tracking-wide">Email Support</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
