import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ChevronLeft, Users, FileText, Settings, ShieldAlert, CheckCircle2, XCircle, Trash2, Save, Info, Calendar, Megaphone, Plus, Sparkles, Send } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';

interface PendingRequest {
    id: number;
    user_id: number;
    user: {
        id: number;
        surname: string;
        first_name: string;
        matric_number?: string;
    };
}

interface AssocDoc {
    id: number;
    title: string;
    file_path: string;
    file_type: string;
}

export default function AssociationManagePage() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // Tab state: 'menu' | 'members' | 'settings' | 'docs' | 'announcement'
    const [currentView, setCurrentView] = useState<'menu' | 'members' | 'settings' | 'docs' | 'announcement'>('menu');
    const [loading, setLoading] = useState(false);
    
    // Member requests state
    const [requests, setRequests] = useState<PendingRequest[]>([]);
    
    // Documents state
    const [documents, setDocuments] = useState<AssocDoc[]>([]);
    const [docTitle, setDocTitle] = useState('');
    const [docUrl, setDocUrl] = useState('');
    const [docType, setDocType] = useState('PDF');
    const [addingDoc, setAddingDoc] = useState(false);

    // Announcement state
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementContent, setAnnouncementContent] = useState('');
    const [publishingAnnouncement, setPublishingAnnouncement] = useState(false);

    // Settings form state
    const [name, setName] = useState('');
    const [acronym, setAcronym] = useState('');
    const [category, setCategory] = useState('Academic');
    const [description, setDescription] = useState('');
    const [meetingSchedule, setMeetingSchedule] = useState('');
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch association details for pre-filling settings/docs
    const fetchAssociationDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/associations/${id}`);
            const data = response.data.data;
            setName(data.name || '');
            setAcronym(data.acronym || '');
            setCategory(data.category || 'Academic');
            setDescription(data.description || '');
            setMeetingSchedule(data.meeting_schedule || '');
            setDocuments(data.documents || []);
        } catch (error) {
            console.error('Error fetching details for edit:', error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch pending join requests
    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/student/associations/${id}/requests`);
            setRequests(response.data.data || []);
        } catch (error) {
            console.error('Error fetching pending requests:', error);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentView === 'members') {
            fetchPendingRequests();
        } else if (currentView === 'settings' || currentView === 'docs') {
            fetchAssociationDetails();
        }
    }, [currentView]);

    const handleApprove = async (userId: number, studentName: string) => {
        try {
            await api.post(`/student/associations/${id}/requests/${userId}/approve`);
            Alert.alert('Approved', `Successfully admitted ${studentName} into the association.`);
            fetchPendingRequests();
        } catch (error: any) {
            console.error('Approve error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Could not approve request.');
        }
    };

    const handleReject = async (userId: number, studentName: string) => {
        try {
            await api.post(`/student/associations/${id}/requests/${userId}/reject`);
            Alert.alert('Rejected', `Declined join request from ${studentName}.`);
            fetchPendingRequests();
        } catch (error: any) {
            console.error('Reject error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Could not reject request.');
        }
    };

    const handleUpdateSettings = async () => {
        if (!name.trim() || !acronym.trim() || !description.trim()) {
            Alert.alert('Validation Error', 'Name, Acronym, and Description are required.');
            return;
        }

        try {
            setSaving(true);
            await api.put(`/student/associations/${id}`, {
                name: name.trim(),
                acronym: acronym.trim().toUpperCase(),
                category,
                description: description.trim(),
                meeting_schedule: meetingSchedule.trim()
            });
            Alert.alert('Success', 'Association profile updated successfully!');
            setCurrentView('menu');
        } catch (error: any) {
            console.error('Update error:', error);
            Alert.alert('Update Failed', error.response?.data?.message || 'Could not save updates. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAssociation = () => {
        Alert.alert(
            '⚠️ Danger Zone',
            'Are you absolutely sure you want to permanently disband this association? All member records and feed updates will be deleted forever.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disband Association',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setDeleting(true);
                            await api.delete(`/student/associations/${id}`);
                            Alert.alert('Disbanded', 'Association deleted successfully.');
                            router.replace('/associations');
                        } catch (error: any) {
                            console.error('Delete error:', error);
                            Alert.alert('Deletion Failed', error.response?.data?.message || 'Could not delete association.');
                        } finally {
                            setDeleting(false);
                        }
                    }
                }
            ]
        );
    };

    const handleAddDocument = async () => {
        if (!docTitle.trim() || !docUrl.trim()) {
            Alert.alert('Validation Error', 'Title and URL link are required.');
            return;
        }

        try {
            setAddingDoc(true);
            const response = await api.post(`/student/associations/${id}/documents`, {
                title: docTitle.trim(),
                file_url: docUrl.trim(),
                type: docType
            });

            Alert.alert('Success', 'Official document uploaded to archives!');
            setDocTitle('');
            setDocUrl('');
            setDocType('PDF');
            
            // Refresh documents list
            fetchAssociationDetails();
        } catch (error: any) {
            console.error('Add document error:', error);
            Alert.alert('Failed', error.response?.data?.message || 'Could not save document.');
        } finally {
            setAddingDoc(false);
        }
    };

    const handleDeleteDocument = (docId: number, title: string) => {
        Alert.alert(
            'Remove Document',
            `Are you sure you want to delete ${title} from official archives?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/student/associations/${id}/documents/${docId}`);
                            Alert.alert('Removed', 'Document removed successfully.');
                            fetchAssociationDetails();
                        } catch (error: any) {
                            console.error('Delete doc error:', error);
                            Alert.alert('Error', 'Could not delete document.');
                        }
                    }
                }
            ]
        );
    };

    const handlePublishAnnouncement = async () => {
        if (!announcementContent.trim()) {
            Alert.alert('Validation Error', 'Broadcast description is required.');
            return;
        }

        try {
            setPublishingAnnouncement(true);
            const heading = announcementTitle.trim() ? `📢 ${announcementTitle.trim().toUpperCase()}\n\n` : '📢 IMPORTANT BROADCAST\n\n';
            const fullContent = heading + announcementContent.trim();
            
            await api.post('/posts', {
                content: fullContent,
                association_id: Number(id),
                type: 'news',
                visibility: 'association'
            });

            Alert.alert('Broadcast Alert', 'High-importance news alert published to feed successfully!');
            setAnnouncementTitle('');
            setAnnouncementContent('');
            setCurrentView('menu');
        } catch (error: any) {
            console.error('Announcement publish error:', error);
            Alert.alert('Error', error.response?.data?.message || 'Could not publish announcement.');
        } finally {
            setPublishingAnnouncement(false);
        }
    };

    const handleMenuPress = (label: string) => {
        if (label === 'Manage Members') {
            setCurrentView('members');
        } else if (label === 'Settings') {
            setCurrentView('settings');
        } else if (label === 'Association Docs') {
            setCurrentView('docs');
        } else if (label === 'Post Announcement') {
            setCurrentView('announcement');
        }
    };

    const menuItems = [
        { label: 'Manage Members', icon: Users, color: '#3B82F6', desc: 'Approve pending student join requests' },
        { label: 'Post Announcement', icon: Megaphone, color: '#F59E0B', desc: 'Alert all members with a feed broadcast' },
        { label: 'Association Docs', icon: FileText, color: '#10B981', desc: 'Add or remove official archive documents' },
        { label: 'Settings', icon: Settings, color: '#64748B', desc: 'Edit profile, schedule, or disband club' },
    ];

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Premium Header */}
            <View className="bg-primary px-6 pt-6 pb-8 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => {
                            if (currentView !== 'menu') {
                                setCurrentView('menu');
                            } else {
                                router.back();
                            }
                        }}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20 mr-4"
                    >
                        <ChevronLeft size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest">
                            {currentView === 'menu' ? 'Executive Panel' : currentView === 'members' ? 'Admissions Governance' : currentView === 'docs' ? 'Official Archives' : currentView === 'announcement' ? 'Broadcast alerts' : 'General Configuration'}
                        </Text>
                        <Text className="text-white text-xl font-bold">
                            {currentView === 'menu' ? 'Executive Board' : currentView === 'members' ? 'Join Requests' : currentView === 'docs' ? 'Archives Registry' : currentView === 'announcement' ? 'Publish Broadcast' : 'Club Settings'}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
                {loading && <ActivityIndicator size="large" color="#002147" className="my-10" />}

                {!loading && currentView === 'menu' && (
                    <View className="space-y-6">
                        <View className="flex-row flex-wrap justify-between mt-2">
                            {menuItems.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleMenuPress(item.label)}
                                    className="w-[48%] bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100 min-h-[160px]"
                                >
                                    <View
                                        className="w-12 h-12 rounded-2xl items-center justify-center mb-4"
                                        style={{ backgroundColor: `${item.color}15` }}
                                    >
                                        <item.icon size={24} color={item.color} />
                                    </View>
                                    <Text className="text-primary font-bold text-lg mb-1">{item.label}</Text>
                                    <Text className="text-gray-400 text-xs leading-4">{item.desc}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="bg-blue-50 p-5 rounded-3xl mt-4 border border-blue-100">
                            <Text className="text-blue-900 font-bold text-lg mb-2">Executive Command Center</Text>
                            <Text className="text-blue-700 text-xs leading-5">
                                As the President, you are fully authorized to admit pending member requests, push feed broadcast announcements, upload constitutional resources, and modify official meeting structures. Use caution when making modifications.
                            </Text>
                        </View>
                    </View>
                )}

                {/* MEMBERS APPROVAL VIEW */}
                {!loading && currentView === 'members' && (
                    <View className="space-y-4">
                        <Text className="text-primary font-black text-xl mb-2">Pending Applicants ({requests.length})</Text>

                        {requests.length > 0 ? (
                            requests.map((req) => {
                                const fullName = `${req.user?.first_name || ''} ${req.user?.surname || ''}`;
                                return (
                                    <PremiumCard key={req.id} variant="elevated" className="bg-white p-5 border-gray-100 rounded-[28px] mb-4 flex-row items-center">
                                        <View className="w-12 h-12 bg-primary/5 rounded-2xl items-center justify-center border border-primary/5 mr-4">
                                            <Users size={20} color="#002147" />
                                        </View>
                                        <View className="flex-1 mr-2">
                                            <Text className="text-primary font-black text-sm">{fullName}</Text>
                                            <Text className="text-gray-400 font-bold text-[8px] uppercase tracking-widest">{req.user?.matric_number || 'KIU/STUDENT'}</Text>
                                        </View>
                                        <View className="flex-row">
                                            <TouchableOpacity
                                                onPress={() => handleReject(req.user_id, fullName)}
                                                className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center border border-red-100 mr-2"
                                            >
                                                <XCircle size={18} color="#EF4444" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleApprove(req.user_id, fullName)}
                                                className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100"
                                            >
                                                <CheckCircle2 size={18} color="#10B981" />
                                            </TouchableOpacity>
                                        </View>
                                    </PremiumCard>
                                );
                            })
                        ) : (
                            <View className="bg-white p-8 border border-gray-100 rounded-[32px] items-center justify-center py-16">
                                <CheckCircle2 size={48} color="#CBD5E1" strokeWidth={1} />
                                <Text className="text-gray-400 font-bold mt-4 text-center">No pending membership requests outstanding</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* ARCHIVES / DOCUMENTS MANAGEMENT VIEW */}
                {!loading && currentView === 'docs' && (
                    <View className="space-y-6">
                        <Text className="text-primary font-black text-xl">Archive New Document</Text>
                        
                        <PremiumCard variant="elevated" className="bg-white p-5 rounded-[28px] border-0 mb-6">
                            <View className="flex-row items-center mb-3">
                                <Sparkles size={16} color="#FFD700" className="mr-2" />
                                <Text className="text-primary font-black text-xs uppercase tracking-wide">Document Registry Form</Text>
                            </View>

                            <View className="mb-4">
                                <Text className="text-primary font-black text-[10px] uppercase mb-1.5 ml-1">Document Title</Text>
                                <TextInput
                                    value={docTitle}
                                    onChangeText={setDocTitle}
                                    placeholder="e.g. Club Constitution 2026/2027"
                                    placeholderTextColor="#94A3B8"
                                    className="bg-gray-50 border border-gray-200 text-primary font-semibold text-sm px-4 py-3 rounded-xl focus:border-primary"
                                />
                            </View>

                            <View className="mb-4">
                                <Text className="text-primary font-black text-[10px] uppercase mb-1.5 ml-1">Document Link / URL</Text>
                                <TextInput
                                    value={docUrl}
                                    onChangeText={setDocUrl}
                                    placeholder="e.g. https://google.drive/constitution.pdf"
                                    placeholderTextColor="#94A3B8"
                                    autoCapitalize="none"
                                    className="bg-gray-50 border border-gray-200 text-primary font-semibold text-sm px-4 py-3 rounded-xl focus:border-primary"
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="text-primary font-black text-[10px] uppercase mb-2 ml-1">Document Type</Text>
                                <View className="flex-row gap-2">
                                    {['PDF', 'DOC', 'ZIP', 'OTHER'].map(type => (
                                        <TouchableOpacity
                                            key={type}
                                            onPress={() => setDocType(type)}
                                            className={`px-4 py-2 rounded-xl border ${docType === type ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'}`}
                                        >
                                            <Text className={`text-[10px] font-black uppercase ${docType === type ? 'text-secondary' : 'text-gray-500'}`}>
                                                {type}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleAddDocument}
                                disabled={addingDoc}
                                className="bg-primary py-3.5 rounded-2xl flex-row items-center justify-center shadow-md shadow-primary/20"
                            >
                                {addingDoc ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <>
                                        <Plus size={16} color="white" className="mr-2" />
                                        <Text className="text-white font-black text-xs uppercase tracking-wider">Add To Archives</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </PremiumCard>

                        <Text className="text-primary font-black text-xl mb-3">Live Documents List</Text>
                        
                        {documents.length > 0 ? (
                            documents.map(doc => (
                                <View key={doc.id} className="flex-row items-center bg-white border border-gray-100 p-5 rounded-[24px] mb-3 shadow-sm">
                                    <View className="w-10 h-10 bg-primary/5 rounded-2xl items-center justify-center mr-4">
                                        <FileText size={18} color="#002147" />
                                    </View>
                                    <View className="flex-1 mr-2">
                                        <Text className="text-primary font-black text-sm">{doc.title}</Text>
                                        <Text className="text-gray-400 text-[10px] uppercase font-bold">{doc.file_type}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteDocument(doc.id, doc.title)}
                                        className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center border border-red-100"
                                    >
                                        <Trash2 size={16} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <View className="bg-white p-6 border border-gray-100 rounded-[24px] items-center py-10">
                                <FileText size={32} color="#CBD5E1" strokeWidth={1} />
                                <Text className="text-gray-400 font-bold mt-3">No documents uploaded yet</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* POST ANNOUNCEMENT BROADCAST VIEW */}
                {!loading && currentView === 'announcement' && (
                    <View className="space-y-5">
                        <Text className="text-primary font-black text-xl">Publish Announcement Broadcast</Text>
                        
                        <PremiumCard variant="elevated" className="bg-white p-6 rounded-[28px] border-0 mb-6">
                            <View className="flex-row items-center mb-4">
                                <Megaphone size={16} color="#F59E0B" className="mr-2" />
                                <Text className="text-primary font-black text-xs uppercase tracking-wide">Alert All Approved Members</Text>
                            </View>

                            <View className="mb-4">
                                <Text className="text-primary font-black text-[10px] uppercase mb-1.5 ml-1">Announcement Heading</Text>
                                <TextInput
                                    value={announcementTitle}
                                    onChangeText={setAnnouncementTitle}
                                    placeholder="e.g. Urgent General Assembly Meeting"
                                    placeholderTextColor="#94A3B8"
                                    className="bg-gray-50 border border-gray-200 text-primary font-semibold text-sm px-4 py-3.5 rounded-xl focus:border-primary"
                                />
                            </View>

                            <View className="mb-6">
                                <Text className="text-primary font-black text-[10px] uppercase mb-1.5 ml-1">Broadcast Details</Text>
                                <TextInput
                                    value={announcementContent}
                                    onChangeText={setAnnouncementContent}
                                    multiline
                                    numberOfLines={6}
                                    placeholder="Type the announcement details and instructions for club members..."
                                    placeholderTextColor="#94A3B8"
                                    textAlignVertical="top"
                                    className="bg-gray-50 border border-gray-200 text-primary font-semibold text-sm px-4 py-3 rounded-xl focus:border-primary min-h-[140px]"
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handlePublishAnnouncement}
                                disabled={publishingAnnouncement}
                                className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20"
                            >
                                {publishingAnnouncement ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <>
                                        <Send size={16} color="white" className="mr-2" />
                                        <Text className="text-white font-black text-sm uppercase tracking-wider">Publish Alert Broadcast</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </PremiumCard>
                    </View>
                )}

                {/* EDIT/DELETE SETTINGS VIEW */}
                {!loading && currentView === 'settings' && (
                    <View className="space-y-5">
                        <Text className="text-primary font-black text-xl mb-2">Edit Association Profile</Text>

                        {/* Input: Name */}
                        <View className="mb-4">
                            <View className="flex-row items-center mb-1.5">
                                <Info size={14} color="#002147" className="mr-1.5" />
                                <Text className="text-primary font-black text-xs uppercase tracking-wide">Association Full Name</Text>
                            </View>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                className="bg-white border border-gray-200 text-primary font-semibold text-sm px-4 py-3.5 rounded-2xl focus:border-primary"
                            />
                        </View>

                        {/* Input: Acronym */}
                        <View className="mb-4">
                            <View className="flex-row items-center mb-1.5">
                                <Users size={14} color="#002147" className="mr-1.5" />
                                <Text className="text-primary font-black text-xs uppercase tracking-wide">Club Acronym</Text>
                            </View>
                            <TextInput
                                value={acronym}
                                onChangeText={setAcronym}
                                autoCapitalize="characters"
                                className="bg-white border border-gray-200 text-primary font-semibold text-sm px-4 py-3.5 rounded-2xl focus:border-primary"
                            />
                        </View>

                        {/* Category Selection */}
                        <View className="mb-4">
                            <Text className="text-primary font-black text-xs uppercase tracking-wide mb-2.5">Category Classification</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {['Academic', 'Social', 'Sports', 'Cultural', 'Professional', 'Other'].map((cat) => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => setCategory(cat)}
                                        className={`px-4 py-2.5 rounded-xl border ${category === cat ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                                    >
                                        <Text className={`text-[10px] font-black uppercase ${category === cat ? 'text-secondary' : 'text-gray-500'}`}>
                                            {cat}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Input: Description */}
                        <View className="mb-4">
                            <View className="flex-row items-center mb-1.5">
                                <FileText size={14} color="#002147" className="mr-1.5" />
                                <Text className="text-primary font-black text-xs uppercase tracking-wide">Club Description</Text>
                            </View>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                                className="bg-white border border-gray-200 text-primary font-semibold text-sm px-4 py-3 rounded-2xl focus:border-primary min-h-[100px]"
                            />
                        </View>

                        {/* Input: Meeting Schedule */}
                        <View className="mb-8">
                            <View className="flex-row items-center mb-1.5">
                                <Calendar size={14} color="#002147" className="mr-1.5" />
                                <Text className="text-primary font-black text-xs uppercase tracking-wide">Meeting Schedule</Text>
                            </View>
                            <TextInput
                                value={meetingSchedule}
                                onChangeText={setMeetingSchedule}
                                className="bg-white border border-gray-200 text-primary font-semibold text-sm px-4 py-3.5 rounded-2xl focus:border-primary"
                            />
                        </View>

                        {/* Save Button */}
                        <TouchableOpacity
                            onPress={handleUpdateSettings}
                            disabled={saving}
                            className="bg-primary py-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-primary/20"
                        >
                            {saving ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Save size={18} color="white" className="mr-2" />
                                    <Text className="text-white font-black text-sm uppercase tracking-wider">Save Club Configuration</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {/* Destructive Disband Zone */}
                        <View className="border-t border-red-100 pt-6 mt-8">
                            <View className="bg-red-50 border border-red-100 rounded-3xl p-5">
                                <View className="flex-row items-center mb-2">
                                    <ShieldAlert size={20} color="#EF4444" className="mr-2" />
                                    <Text className="text-red-900 font-bold text-base">Disband Danger Zone</Text>
                                </View>
                                <Text className="text-red-700 text-xs leading-5 mb-4">
                                    Permanently dissolve and delete this club association. All membership lists, feed history, and settings will be lost. This cannot be undone.
                                </Text>
                                <TouchableOpacity
                                    onPress={handleDeleteAssociation}
                                    disabled={deleting}
                                    className="bg-red-500 py-3.5 rounded-2xl flex-row items-center justify-center border border-red-600"
                                >
                                    {deleting ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <>
                                            <Trash2 size={16} color="white" className="mr-2" />
                                            <Text className="text-white font-black text-xs uppercase tracking-wider">Disband & Delete Association</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
