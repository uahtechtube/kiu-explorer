import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, FlatList, Image, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Search, Store, ShoppingBag, ArrowRight, Tag, Phone, MessageCircle, ChevronRight, PlusCircle } from 'lucide-react-native';
import api from '../../lib/api';

const { width } = Dimensions.get('window');

const CATEGORIES = [
    { name: 'All', icon: Tag, color: '#3B82F6' },
    { name: 'Books', icon: Tag, color: '#10B981' },
    { name: 'Electronics', icon: Tag, color: '#8B5CF6' },
    { name: 'Fashion', icon: Tag, color: '#EC4899' },
    { name: 'Food', icon: Tag, color: '#F59E0B' },
    { name: 'Services', icon: Tag, color: '#06B6D4' },
    { name: 'Other', icon: Tag, color: '#64748B' },
];

export default function StudentMarketplace() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'products' | 'shops'>('products');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const [products, setProducts] = useState<any[]>([]);
    const [shops, setShops] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchData();
    }, [activeTab, selectedCategory]);

    const fetchData = async (pageNum = 1, isAppend = false) => {
        try {
            setLoading(true);
            if (activeTab === 'products') {
                const categoryFilter = selectedCategory === 'All' ? '' : selectedCategory;
                const response = await api.get('/marketplace/products', {
                    params: {
                        page: pageNum,
                        category: categoryFilter,
                        search: searchQuery
                    }
                });
                
                if (isAppend) {
                    setProducts(prev => [...prev, ...response.data.data]);
                } else {
                    setProducts(response.data.data);
                }
                setTotalPages(response.data.last_page || 1);
            } else {
                const response = await api.get('/marketplace/shops', {
                    params: {
                        page: pageNum,
                        search: searchQuery
                    }
                });
                if (isAppend) {
                    setShops(prev => [...prev, ...response.data.data]);
                } else {
                    setShops(response.data.data);
                }
                setTotalPages(response.data.last_page || 1);
            }
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching marketplace data:', error);
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
        setRefreshing(false);
    };

    const handleLoadMore = () => {
        if (page < totalPages && !loading) {
            fetchData(page + 1, true);
        }
    };

    const formatPrice = (price: number | string) => {
        const val = typeof price === 'string' ? parseFloat(price) : price;
        return `₦${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const renderProductItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/marketplace/product/${item.id}` as any)}
            className="bg-white w-[48%] rounded-[24px] border border-gray-100 shadow-sm mb-4 overflow-hidden"
        >
            <View className="bg-gray-100 h-32 w-full relative items-center justify-center">
                {item.image_url ? (
                    <Image
                        source={{ uri: item.image_url.startsWith('http') ? item.image_url : `${api.defaults.baseURL?.replace('/api', '')}/${item.image_url}` }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                ) : (
                    <View className="items-center justify-center p-4">
                        <ShoppingBag size={32} color="#9CA3AF" />
                        <Text className="text-gray-400 text-[10px] mt-1 text-center font-bold uppercase">{item.category}</Text>
                    </View>
                )}
                <View className="absolute top-2 right-2 bg-primary/80 px-2 py-0.5 rounded-full">
                    <Text className="text-white text-[9px] font-bold uppercase">{item.category}</Text>
                </View>
            </View>
            <View className="p-3">
                <Text className="text-primary font-bold text-xs uppercase" numberOfLines={1}>{item.name}</Text>
                <Text className="text-gray-400 text-[10px] mt-0.5" numberOfLines={1}>{item.shop?.name || 'Student Shop'}</Text>
                <View className="flex-row justify-between items-center mt-2 pt-2 border-t border-gray-50">
                    <Text className="text-secondary font-black text-sm">{formatPrice(item.price)}</Text>
                    <ArrowRight size={12} color="#002147" />
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderShopItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/marketplace/shop/${item.id}` as any)}
            className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-3 flex-row items-center"
        >
            <View className="w-14 h-14 bg-secondary/10 rounded-2xl items-center justify-center overflow-hidden border border-gray-50 mr-4">
                {item.logo ? (
                    <Image
                        source={{ uri: item.logo.startsWith('http') ? item.logo : `${api.defaults.baseURL?.replace('/api', '')}/${item.logo}` }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                ) : (
                    <Store size={24} color="#002147" />
                )}
            </View>
            <View className="flex-1 mr-2">
                <Text className="text-primary font-bold text-sm uppercase" numberOfLines={1}>{item.name}</Text>
                <Text className="text-gray-400 text-[10px] mt-0.5" numberOfLines={2}>{item.description || 'No description provided.'}</Text>
                <View className="flex-row items-center mt-2">
                    <View className="flex-row items-center bg-emerald-50 px-2 py-0.5 rounded-md mr-2">
                        <Phone size={8} color="#10B981" />
                        <Text className="text-emerald-600 text-[8px] font-bold ml-1">{item.contact_phone}</Text>
                    </View>
                </View>
            </View>
            <ChevronRight size={16} color="#CBD5E1" />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Stack.Screen options={{ title: 'Student Marketplace', headerShown: true, headerStyle: { backgroundColor: '#002147' }, headerTintColor: '#fff' }} />

            {/* Sub Header & Search Section */}
            <View className="bg-primary px-6 pb-6 pt-4 rounded-b-[32px] shadow-lg">
                <View className="flex-row items-center bg-white/10 px-4 h-12 rounded-2xl mb-4">
                    <Search size={18} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 text-white ml-2 h-full text-sm"
                        placeholder="Search products or shops..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); fetchData(1, false); }}>
                            <Text className="text-gray-400 text-xs">Clear</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Tab Switcher */}
                <View className="flex-row bg-white/5 p-1 rounded-2xl">
                    <TouchableOpacity
                        onPress={() => { setActiveTab('products'); setPage(1); }}
                        className={`flex-1 py-3 rounded-xl items-center flex-row justify-center ${activeTab === 'products' ? 'bg-secondary' : ''}`}
                    >
                        <ShoppingBag size={14} color={activeTab === 'products' ? '#002147' : '#FFFFFF'} />
                        <Text className={`font-bold text-xs ml-2 ${activeTab === 'products' ? 'text-primary' : 'text-white'}`}>Products</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => { setActiveTab('shops'); setPage(1); }}
                        className={`flex-1 py-3 rounded-xl items-center flex-row justify-center ${activeTab === 'shops' ? 'bg-secondary' : ''}`}
                    >
                        <Store size={14} color={activeTab === 'shops' ? '#002147' : '#FFFFFF'} />
                        <Text className={`font-bold text-xs ml-2 ${activeTab === 'shops' ? 'text-primary' : 'text-white'}`}>Shops</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Categories scroll (only for products tab) */}
            {activeTab === 'products' && (
                <View className="py-4">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-6">
                        {CATEGORIES.map((cat, idx) => {
                            const isSelected = selectedCategory === cat.name;
                            return (
                                <TouchableOpacity
                                    key={idx}
                                    onPress={() => setSelectedCategory(cat.name)}
                                    style={{ backgroundColor: isSelected ? cat.color : '#FFFFFF' }}
                                    className="px-4 py-2 rounded-2xl mr-2 shadow-sm border border-gray-100 flex-row items-center"
                                >
                                    <cat.icon size={12} color={isSelected ? '#FFFFFF' : cat.color} />
                                    <Text style={{ color: isSelected ? '#FFFFFF' : '#002147' }} className="font-bold text-xs ml-2">{cat.name}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>
            )}

            {/* List Content */}
            <View className="flex-1 px-6 pt-2">
                {activeTab === 'products' ? (
                    <FlatList
                        key="products-grid"
                        data={products}
                        renderItem={renderProductItem}
                        keyExtractor={item => item.id.toString()}
                        numColumns={2}
                        columnWrapperStyle={{ justifyContent: 'space-between' }}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.3}
                        ListEmptyComponent={
                            loading ? null : (
                                <View className="items-center justify-center py-20">
                                    <ShoppingBag size={48} color="#CBD5E1" />
                                    <Text className="text-gray-400 mt-4 text-sm font-bold uppercase">No products listed.</Text>
                                </View>
                            )
                        }
                        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#002147" className="my-4" /> : null}
                    />
                ) : (
                    <FlatList
                        key="shops-list"
                        data={shops}
                        renderItem={renderShopItem}
                        keyExtractor={item => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.3}
                        ListEmptyComponent={
                            loading ? null : (
                                <View className="items-center justify-center py-20">
                                    <Store size={48} color="#CBD5E1" />
                                    <Text className="text-gray-400 mt-4 text-sm font-bold uppercase">No student shops found.</Text>
                                </View>
                            )
                        }
                        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#002147" className="my-4" /> : null}
                    />
                )}
            </View>

            {/* Floating Action Button for Seller Console */}
            <TouchableOpacity
                onPress={() => router.push('/marketplace/my-shop')}
                className="absolute bottom-6 right-6 bg-secondary flex-row items-center px-5 py-4 rounded-full shadow-lg border border-primary/10"
            >
                <PlusCircle size={20} color="#002147" />
                <Text className="text-primary font-bold text-xs uppercase ml-2 tracking-wide">My Shop Console</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}
