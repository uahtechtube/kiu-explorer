import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Linking, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Store, Phone, MessageCircle, Mail, Tag, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react-native';
import api from '../../../lib/api';

export default function ShopDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [shop, setShop] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchShopInfo();
        }
    }, [id]);

    const fetchShopInfo = async () => {
        try {
            setLoading(true);
            
            // Fetch shop info (custom endpoint or product list by shop)
            const shopResponse = await api.get(`/marketplace/my-shop`); // we fetch products by shop ID
            // Wait, we need to fetch a specific shop by ID.
            // Let's call products with parameter `shop_id` which returns products and we can extract shop details from the first product,
            // OR fetch products and active shops. Let's make an endpoint search or filter products by shop_id.
            const productsResponse = await api.get('/marketplace/products', {
                params: { shop_id: id }
            });
            
            setProducts(productsResponse.data.data);
            
            // Extract shop from first product, or make another fetch
            if (productsResponse.data.data.length > 0) {
                setShop(productsResponse.data.data[0].shop);
            } else {
                // If there are no products in the shop yet, fetch details from admin endpoint or similar.
                // Wait! Let's hit the admin endpoint to get shop info, or we can fetch a shop details.
                // Oh! Let's check: does `/marketplace/shops` support listing? Yes. We can filter `/marketplace/shops` or fetch `/marketplace/my-shop` if it's ours,
                // but since it's another student's, let's search in the shops listing endpoint `/marketplace/shops?search={id}` or fetch from `/admin/marketplace/shops`? No, standard students can't call admin routes.
                // Wait! We can easily call `api.get('/marketplace/shops')` and find the matching shop, or let's inspect the controller `/marketplace/shops` endpoint.
                // In our MarketplaceController:
                // `indexShops` returns a paginated list of shops.
                // Let's search `/marketplace/shops` using search param or get by ID.
                const shopsResponse = await api.get('/marketplace/shops', {
                    params: { search: id }
                });
                
                // Let's find the matching shop
                const matchedShop = shopsResponse.data.data.find((s: any) => s.id.toString() === id?.toString());
                if (matchedShop) {
                    setShop(matchedShop);
                }
            }
        } catch (error) {
            console.error('Error fetching shop details:', error);
            Alert.alert('Error', 'Failed to load shop details.');
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        const phone = shop?.contact_phone;
        if (!phone) {
            Alert.alert('Error', 'Contact phone number not available.');
            return;
        }
        Linking.openURL(`tel:${phone}`);
    };

    const handleWhatsApp = () => {
        const phone = shop?.whatsapp_number || shop?.contact_phone;
        if (!phone) {
            Alert.alert('Error', 'WhatsApp number not available.');
            return;
        }
        
        const cleanPhone = phone.replace(/[^\d]/g, '');
        const message = encodeURIComponent(`Hi, I saw your shop "${shop.name}" listed on KIU Explorer E-Commerce. I'm interested in viewing your products.`);
        const waUrl = `whatsapp://send?phone=${cleanPhone}&text=${message}`;
        const webWaUrl = `https://wa.me/${cleanPhone}?text=${message}`;

        Linking.canOpenURL(waUrl).then(supported => {
            if (supported) {
                Linking.openURL(waUrl);
            } else {
                Linking.openURL(webWaUrl);
            }
        });
    };

    const formatPrice = (price: number | string) => {
        const val = typeof price === 'string' ? parseFloat(price) : price;
        return `₦${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const renderProductItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push(`/marketplace/product/${item.id}` as any)}
            className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mb-3 flex-row items-center justify-between"
        >
            <View className="flex-row items-center flex-1 mr-2">
                <View className="w-16 h-16 bg-gray-100 rounded-2xl items-center justify-center overflow-hidden mr-4">
                    {item.image_url ? (
                        <Image
                            source={{ uri: item.image_url.startsWith('http') ? item.image_url : `${api.defaults.baseURL?.replace('/api', '')}/${item.image_url}` }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <ShoppingBag size={24} color="#9CA3AF" />
                    )}
                </View>
                <View className="flex-1">
                    <Text className="text-primary font-bold text-sm uppercase" numberOfLines={1}>{item.name}</Text>
                    <Text className="text-gray-400 text-[10px] mt-0.5" numberOfLines={1}>{item.description || 'No description.'}</Text>
                    <Text className="text-secondary font-black text-xs mt-2">{formatPrice(item.price)}</Text>
                </View>
            </View>
            <ArrowRight size={14} color="#002147" />
        </TouchableOpacity>
    );

    if (loading && !shop) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
                <Text className="text-gray-400 mt-2 text-xs uppercase font-bold">Loading shop details...</Text>
            </SafeAreaView>
        );
    }

    if (!shop) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
                <AlertTriangle size={48} color="#EF4444" />
                <Text className="text-primary font-bold text-lg mt-4 text-center">Shop Not Found</Text>
                <Text className="text-gray-400 text-sm mt-2 text-center">This shop may have been suspended or removed.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-primary px-6 py-3 rounded-full">
                    <Text className="text-white font-bold text-xs uppercase">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Stack.Screen options={{ title: shop.name || 'Student Shop', headerShown: true, headerStyle: { backgroundColor: '#002147' }, headerTintColor: '#fff' }} />

            <FlatList
                data={products}
                renderItem={renderProductItem}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                ListHeaderComponent={
                    <>
                        {/* Shop Header banner/logo card */}
                        <View className="bg-white pb-6 shadow-sm border-b border-gray-100 mb-4">
                            {/* Mock Banner */}
                            <View className="bg-primary/20 h-28 w-full items-center justify-center relative">
                                {shop.banner ? (
                                    <Image
                                        source={{ uri: shop.banner.startsWith('http') ? shop.banner : `${api.defaults.baseURL?.replace('/api', '')}/${shop.banner}` }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View className="bg-gradient-to-r from-primary to-blue-900 w-full h-full opacity-60 absolute" />
                                )}
                            </View>
                            
                            {/* Logo and Info */}
                            <View className="px-6 -mt-10 flex-row items-end mb-4">
                                <View className="w-20 h-20 bg-white rounded-[24px] items-center justify-center border-4 border-white shadow-md overflow-hidden">
                                    {shop.logo ? (
                                        <Image
                                            source={{ uri: shop.logo.startsWith('http') ? shop.logo : `${api.defaults.baseURL?.replace('/api', '')}/${shop.logo}` }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <Store size={32} color="#002147" />
                                    )}
                                </View>
                                <View className="ml-4 pb-1 flex-1">
                                    <Text className="text-primary font-black text-lg uppercase leading-tight">{shop.name}</Text>
                                    <Text className="text-gray-400 text-[10px] mt-0.5">E-COMMERCE STORE OWNER</Text>
                                </View>
                            </View>

                            {/* Description and contacts */}
                            <View className="px-6">
                                <Text className="text-gray-600 text-sm leading-relaxed mb-4">
                                    {shop.description || 'Welcome to my shop on KIU Explorer!'}
                                </Text>

                                <View className="flex-row justify-between pt-4 border-t border-gray-50">
                                    <TouchableOpacity
                                        onPress={handleCall}
                                        className="flex-1 bg-primary py-3.5 rounded-2xl items-center flex-row justify-center mr-2"
                                    >
                                        <Phone size={14} color="white" />
                                        <Text className="text-white font-bold text-xs uppercase ml-2">Call Shop</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={handleWhatsApp}
                                        className="flex-1 bg-emerald-500 py-3.5 rounded-2xl items-center flex-row justify-center ml-2"
                                    >
                                        <MessageCircle size={14} color="white" />
                                        <Text className="text-white font-bold text-xs uppercase ml-2">WhatsApp</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                        <Text className="text-primary font-black text-sm uppercase px-6 mb-3">Listed Products</Text>
                    </>
                }
                ListEmptyComponent={
                    <View className="items-center justify-center py-20 px-6">
                        <ShoppingBag size={48} color="#CBD5E1" />
                        <Text className="text-gray-400 mt-4 text-sm font-bold uppercase text-center">No products listed by this shop yet.</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
