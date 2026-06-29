import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, ActivityIndicator, Alert, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Shield, Store, ShoppingBag, Trash2, ShieldAlert, ShieldCheck, ClipboardList, Search, ChevronRight, Activity } from 'lucide-react-native';
import api from '../../../lib/api';
import { PremiumCard } from '../../../components/shared/PremiumCard';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import AdminNavBar from '../../../components/admin/AdminNavBar';

const { width } = Dimensions.get('window');

export default function AdminMarketplaceConsole() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'shops' | 'products' | 'logs'>('shops');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Lists
    const [shops, setShops] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Stats
    const [stats, setStats] = useState({
        total_shops: 0,
        active_shops: 0,
        suspended_shops: 0,
        total_products: 0,
    });

    useEffect(() => {
        fetchData();
        fetchStats();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            // Fetch stats by retrieving lists count (simplified stats)
            const shopsRes = await api.get('/admin/marketplace/shops');
            const productsRes = await api.get('/admin/marketplace/products');
            
            const totalShops = shopsRes.data.total || shopsRes.data.data?.length || 0;
            const totalProducts = productsRes.data.total || productsRes.data.data?.length || 0;
            
            const active = shopsRes.data.data?.filter((s: any) => s.status === 'active').length || 0;
            const suspended = totalShops - active;

            setStats({
                total_shops: totalShops,
                active_shops: active,
                suspended_shops: suspended,
                total_products: totalProducts
            });
        } catch (e) {
            console.error('Error fetching admin stats', e);
        }
    };

    const fetchData = async (pageNum = 1, isAppend = false) => {
        try {
            setLoading(true);
            if (activeTab === 'shops') {
                const response = await api.get('/admin/marketplace/shops', {
                    params: { page: pageNum, search: searchQuery }
                });
                if (isAppend) {
                    setShops(prev => [...prev, ...response.data.data]);
                } else {
                    setShops(response.data.data);
                }
                setTotalPages(response.data.last_page || 1);
            } else if (activeTab === 'products') {
                const response = await api.get('/admin/marketplace/products', {
                    params: { page: pageNum, search: searchQuery }
                });
                if (isAppend) {
                    setProducts(prev => [...prev, ...response.data.data]);
                } else {
                    setProducts(response.data.data);
                }
                setTotalPages(response.data.last_page || 1);
            } else {
                // Fetch Audit Logs filtered by Marketplace Models (Shop/Product)
                const response = await api.get('/admin/audit-logs');
                // Filter client-side or let backend handle it. Since backend has `model_type` like filter, let's filter client-side for absolute robust accuracy
                const filteredLogs = response.data.data?.filter((log: any) => 
                    log.model_type?.includes('Shop') || 
                    log.model_type?.includes('Product') ||
                    log.action?.toLowerCase().includes('shop') ||
                    log.action?.toLowerCase().includes('product')
                ) || [];
                
                setLogs(filteredLogs);
                setTotalPages(1);
            }
            setPage(pageNum);
        } catch (error) {
            console.error('Admin fetching marketplace failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchData(1, false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData(1, false);
        await fetchStats();
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (page < totalPages && !loading) {
            fetchData(page + 1, true);
        }
    };

    const handleToggleShopStatus = async (shop: any) => {
        const newStatus = shop.status === 'active' ? 'suspended' : 'active';
        Alert.alert(
            shop.status === 'active' ? 'Suspend Shop' : 'Activate Shop',
            `Are you sure you want to change the status of "${shop.name}" to ${newStatus}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.patch(`/admin/marketplace/shops/${shop.id}/status`, {
                                status: newStatus
                            });
                            Alert.alert('Success', `Shop is now ${newStatus}.`);
                            fetchData(1, false);
                            fetchStats();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to update shop status.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleToggleProductStatus = async (product: any) => {
        const newStatus = product.status === 'active' ? 'suspended' : 'active';
        Alert.alert(
            product.status === 'active' ? 'Suspend Product' : 'Activate Product',
            `Are you sure you want to change the status of "${product.name}" to ${newStatus}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.patch(`/admin/marketplace/products/${product.id}/status`, {
                                status: newStatus
                            });
                            Alert.alert('Success', `Product listing is now ${newStatus}.`);
                            fetchData(1, false);
                        } catch (e) {
                            Alert.alert('Error', 'Failed to update product status.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteShop = (shopId: number) => {
        Alert.alert(
            'Delete Shop',
            'Are you sure you want to permanently delete this student shop and all its products? This action is logged.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.delete(`/admin/marketplace/shops/${shopId}`);
                            fetchData(1, false);
                            fetchStats();
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete shop.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleDeleteProduct = (productId: number) => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product listing? This action is logged.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.delete(`/admin/marketplace/products/${productId}`);
                            fetchData(1, false);
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete product.');
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const formatPrice = (price: number | string) => {
        const val = typeof price === 'string' ? parseFloat(price) : price;
        return `₦${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Admin Command Header */}
            <View className="bg-primary px-6 pt-6 pb-20 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <Text className="text-secondary font-black text-[10px] uppercase tracking-widest">KIU Oversight</Text>
                        <Text className="text-white text-2xl font-black">Marketplace Console</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronRight size={20} color="white" style={{ transform: [{ rotate: '180deg' }] }} />
                    </TouchableOpacity>
                </View>

                {/* Micro-Stats Display */}
                <View className="flex-row justify-between">
                    <View className="flex-1 bg-white/5 p-3 rounded-2xl mr-2">
                        <Text className="text-white/40 text-[8px] font-bold uppercase tracking-wider">Total Shops</Text>
                        <Text className="text-white font-black text-lg mt-0.5">{stats.total_shops}</Text>
                    </View>
                    <View className="flex-1 bg-white/5 p-3 rounded-2xl mr-2">
                        <Text className="text-white/40 text-[8px] font-bold uppercase tracking-wider">Active Shops</Text>
                        <Text className="text-emerald-400 font-black text-lg mt-0.5">{stats.active_shops}</Text>
                    </View>
                    <View className="flex-1 bg-white/5 p-3 rounded-2xl">
                        <Text className="text-white/40 text-[8px] font-bold uppercase tracking-wider">Products</Text>
                        <Text className="text-white font-black text-lg mt-0.5">{stats.total_products}</Text>
                    </View>
                </View>
            </View>

            {/* Scrollable controls and list */}
            <View className="flex-1 -mt-10 px-6">
                {/* Mode Selector Tab Bar */}
                <PremiumCard variant="elevated" className="bg-white p-1 mb-6 flex-row border-gray-100">
                    <TouchableOpacity
                        onPress={() => { setActiveTab('shops'); setPage(1); }}
                        className={`flex-1 py-3.5 rounded-2xl items-center flex-row justify-center ${activeTab === 'shops' ? 'bg-primary' : ''}`}
                    >
                        <Store size={14} color={activeTab === 'shops' ? '#FFF' : '#002147'} />
                        <Text className={`font-black text-[10px] uppercase ml-2 ${activeTab === 'shops' ? 'text-white' : 'text-primary'}`}>Shops</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => { setActiveTab('products'); setPage(1); }}
                        className={`flex-1 py-3.5 rounded-2xl items-center flex-row justify-center ${activeTab === 'products' ? 'bg-primary' : ''}`}
                    >
                        <ShoppingBag size={14} color={activeTab === 'products' ? '#FFF' : '#002147'} />
                        <Text className={`font-black text-[10px] uppercase ml-2 ${activeTab === 'products' ? 'text-white' : 'text-primary'}`}>Products</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => { setActiveTab('logs'); setPage(1); }}
                        className={`flex-1 py-3.5 rounded-2xl items-center flex-row justify-center ${activeTab === 'logs' ? 'bg-primary' : ''}`}
                    >
                        <ClipboardList size={14} color={activeTab === 'logs' ? '#FFF' : '#002147'} />
                        <Text className={`font-black text-[10px] uppercase ml-2 ${activeTab === 'logs' ? 'text-white' : 'text-primary'}`}>Logs</Text>
                    </TouchableOpacity>
                </PremiumCard>

                {/* Search Bar (Hide for logs tab) */}
                {activeTab !== 'logs' && (
                    <View className="bg-white px-4 h-12 rounded-2xl border border-gray-200/50 shadow-sm flex-row items-center mb-6">
                        <Search size={18} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 text-primary ml-2 h-full text-xs"
                            placeholder={activeTab === 'shops' ? 'Search shop name or owner...' : 'Search product name...'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            onSubmitEditing={handleSearch}
                            returnKeyType="search"
                        />
                    </View>
                )}

                {/* Lists rendering */}
                <View className="flex-1">
                    {activeTab === 'shops' ? (
                        <FlatList
                            data={shops}
                            keyExtractor={item => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.3}
                            renderItem={({ item }) => (
                                <PremiumCard variant="solid" className="mb-3 p-4 bg-white border-gray-50 flex-row items-center justify-between">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-primary font-black text-sm uppercase">{item.name}</Text>
                                        <Text className="text-gray-400 text-[10px] font-bold mt-0.5">
                                            Owner: {item.owner ? `${item.owner.first_name} ${item.owner.surname}` : 'Student'} • Products: {item.products?.length || 0}
                                        </Text>
                                        <View className="flex-row mt-2">
                                            <StatusBadge status={item.status} />
                                        </View>
                                    </View>
                                    <View className="flex-row">
                                        <TouchableOpacity
                                            onPress={() => handleToggleShopStatus(item)}
                                            className={`p-2.5 rounded-xl mr-2 ${item.status === 'active' ? 'bg-amber-50' : 'bg-emerald-50'}`}
                                        >
                                            {item.status === 'active' ? (
                                                <ShieldAlert size={16} color="#D97706" />
                                            ) : (
                                                <ShieldCheck size={16} color="#059669" />
                                            )}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteShop(item.id)}
                                            className="bg-red-50 p-2.5 rounded-xl"
                                        >
                                            <Trash2 size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </PremiumCard>
                            )}
                            ListEmptyComponent={
                                loading ? <ActivityIndicator size="small" color="#002147" className="my-10" /> : (
                                    <View className="items-center py-20">
                                        <Store size={40} color="#CBD5E1" />
                                        <Text className="text-gray-400 text-xs font-bold uppercase mt-4">No shops registered.</Text>
                                    </View>
                                )
                            }
                        />
                    ) : activeTab === 'products' ? (
                        <FlatList
                            data={products}
                            keyExtractor={item => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            onEndReached={handleLoadMore}
                            onEndReachedThreshold={0.3}
                            renderItem={({ item }) => (
                                <PremiumCard variant="solid" className="mb-3 p-4 bg-white border-gray-50 flex-row items-center justify-between">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-primary font-black text-sm uppercase">{item.name}</Text>
                                        <Text className="text-gray-400 text-[10px] font-bold mt-0.5">
                                            Shop: {item.shop?.name || 'Student Store'} • Price: {formatPrice(item.price)}
                                        </Text>
                                        <View className="flex-row mt-2">
                                            <StatusBadge status={item.status} />
                                        </View>
                                    </View>
                                    <View className="flex-row">
                                        <TouchableOpacity
                                            onPress={() => handleToggleProductStatus(item)}
                                            className={`p-2.5 rounded-xl mr-2 ${item.status === 'active' ? 'bg-amber-50' : 'bg-emerald-50'}`}
                                        >
                                            {item.status === 'active' ? (
                                                <ShieldAlert size={16} color="#D97706" />
                                            ) : (
                                                <ShieldCheck size={16} color="#059669" />
                                            )}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => handleDeleteProduct(item.id)}
                                            className="bg-red-50 p-2.5 rounded-xl"
                                        >
                                            <Trash2 size={16} color="#EF4444" />
                                        </TouchableOpacity>
                                    </View>
                                </PremiumCard>
                            )}
                            ListEmptyComponent={
                                loading ? <ActivityIndicator size="small" color="#002147" className="my-10" /> : (
                                    <View className="items-center py-20">
                                        <ShoppingBag size={40} color="#CBD5E1" />
                                        <Text className="text-gray-400 text-xs font-bold uppercase mt-4">No products listed.</Text>
                                    </View>
                                )
                            }
                        />
                    ) : (
                        /* Governance logs */
                        <FlatList
                            data={logs}
                            keyExtractor={item => item.id.toString()}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 100 }}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                            renderItem={({ item }) => {
                                const logDate = new Date(item.created_at).toLocaleString();
                                const userName = item.user ? `${item.user.first_name} ${item.user.surname}` : 'Admin';
                                return (
                                    <PremiumCard variant="solid" className="mb-3 p-4 bg-white border-gray-50 flex-row items-center">
                                        <View className="w-10 h-10 bg-primary/5 rounded-2xl items-center justify-center mr-4">
                                            <Activity size={16} color="#002147" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-primary font-black text-xs uppercase">{item.action}</Text>
                                            <Text className="text-gray-500 text-[10px] leading-relaxed mt-1">
                                                By: <Text className="font-bold">{userName}</Text> • Model ID: #{item.model_id}
                                            </Text>
                                            <Text className="text-gray-400 text-[8px] font-bold uppercase mt-1">{logDate}</Text>
                                        </View>
                                    </PremiumCard>
                                );
                            }}
                            ListEmptyComponent={
                                loading ? <ActivityIndicator size="small" color="#002147" className="my-10" /> : (
                                    <View className="items-center py-20">
                                        <ClipboardList size={40} color="#CBD5E1" />
                                        <Text className="text-gray-400 text-xs font-bold uppercase mt-4">No governance logs found.</Text>
                                    </View>
                                )
                            }
                        />
                    )}
                </View>
            </View>

            <AdminNavBar />
        </SafeAreaView>
    );
}
