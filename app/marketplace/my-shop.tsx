import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { Store, Plus, Edit2, Trash2, ShoppingBag, Eye, EyeOff, Save, X, Phone, MessageCircle, Upload, Video } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import api from '../../lib/api';

export default function MyShopConsole() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [hasShop, setHasShop] = useState(false);
    const [shop, setShop] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);

    // Shop Form state
    const [shopName, setShopName] = useState('');
    const [shopDesc, setShopDesc] = useState('');
    const [shopPhone, setShopPhone] = useState('');
    const [shopWhatsapp, setShopWhatsapp] = useState('');
    const [shopEmail, setShopEmail] = useState('');
    const [shopLogo, setShopLogo] = useState<string | null>(null);
    const [shopBanner, setShopBanner] = useState<string | null>(null);

    // Edit Shop Modal state
    const [isEditShopOpen, setIsEditShopOpen] = useState(false);

    // Product Modal state
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [prodName, setProdName] = useState('');
    const [prodDesc, setProdDesc] = useState('');
    const [prodPrice, setProdPrice] = useState('');
    const [prodCategory, setProdCategory] = useState('Books');
    const [prodImage, setProdImage] = useState<string | null>(null);
    const [prodGallery, setProdGallery] = useState<{ type: 'image' | 'video'; file?: string; url?: string; uri?: string }[]>([]);

    useEffect(() => {
        fetchMyShop();
    }, []);

    const fetchMyShop = async () => {
        try {
            setLoading(true);
            const response = await api.get('/marketplace/my-shop');
            if (response.data.has_shop) {
                setHasShop(true);
                setShop(response.data.shop);
                setProducts(response.data.shop.products || []);
                
                // Pre-fill form fields
                setShopName(response.data.shop.name);
                setShopDesc(response.data.shop.description || '');
                setShopPhone(response.data.shop.contact_phone);
                setShopWhatsapp(response.data.shop.whatsapp_number || '');
                setShopEmail(response.data.shop.contact_email || '');
                setShopLogo(response.data.shop.logo);
                setShopBanner(response.data.shop.banner);
            } else {
                setHasShop(false);
            }
        } catch (error) {
            console.error('Error fetching shop info:', error);
            Alert.alert('Error', 'Failed to retrieve your shop details.');
        } finally {
            setLoading(false);
        }
    };

    const handlePickFile = async (type: 'logo' | 'banner' | 'product_image') => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'image/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const base64 = await FileSystem.readAsStringAsync(file.uri, {
                    encoding: 'base64',
                });
                const dataUrl = `data:${file.mimeType || 'image/jpeg'};base64,${base64}`;

                if (type === 'logo') {
                    setShopLogo(dataUrl);
                } else if (type === 'banner') {
                    setShopBanner(dataUrl);
                } else if (type === 'product_image') {
                    setProdImage(dataUrl);
                }
            }
        } catch (error) {
            console.error('Error picking document:', error);
            Alert.alert('Error', 'Failed to pick file.');
        }
    };

    const handleAddGalleryMedia = () => {
        if (prodGallery.length >= 5) {
            Alert.alert('Limit Reached', 'You can upload up to 5 gallery files.');
            return;
        }

        Alert.alert(
            'Select Media Type',
            'Would you like to attach an Image or a Video?',
            [
                {
                    text: 'Image',
                    onPress: () => pickGalleryFile('image')
                },
                {
                    text: 'Video',
                    onPress: () => pickGalleryFile('video')
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const pickGalleryFile = async (mediaType: 'image' | 'video') => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: mediaType === 'image' ? 'image/*' : 'video/*',
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                const base64 = await FileSystem.readAsStringAsync(file.uri, {
                    encoding: 'base64',
                });
                const dataUrl = `data:${file.mimeType || (mediaType === 'image' ? 'image/jpeg' : 'video/mp4')};base64,${base64}`;

                setProdGallery(prev => [
                    ...prev,
                    {
                        type: mediaType,
                        file: dataUrl,
                        uri: file.uri
                    }
                ]);
            }
        } catch (error) {
            console.error('Error picking gallery file:', error);
            Alert.alert('Error', 'Failed to pick gallery file.');
        }
    };

    const handleCreateShop = async () => {
        if (!shopName || !shopPhone) {
            Alert.alert('Missing Fields', 'Please fill in the Shop Name and Phone Number.');
            return;
        }

        try {
            setLoading(true);
            const payload: any = {
                name: shopName,
                description: shopDesc,
                contact_phone: shopPhone,
                whatsapp_number: shopWhatsapp || shopPhone,
                contact_email: shopEmail,
            };

            if (shopLogo && shopLogo.startsWith('data:')) {
                payload.logo = shopLogo;
            }
            if (shopBanner && shopBanner.startsWith('data:')) {
                payload.banner = shopBanner;
            }

            const response = await api.post('/marketplace/shops', payload);
            Alert.alert('Success', 'Your student shop is now live!');
            fetchMyShop();
        } catch (error: any) {
            console.error('Create shop failed:', error);
            const errorMsg = error.response?.data?.message || 'Failed to create shop. Please try again.';
            Alert.alert('Error', errorMsg);
            setLoading(false);
        }
    };

    const handleUpdateShop = async () => {
        if (!shopName || !shopPhone) {
            Alert.alert('Missing Fields', 'Please fill in the Shop Name and Phone Number.');
            return;
        }

        try {
            setLoading(true);
            const payload: any = {
                name: shopName,
                description: shopDesc,
                contact_phone: shopPhone,
                whatsapp_number: shopWhatsapp || shopPhone,
                contact_email: shopEmail,
            };

            if (shopLogo && shopLogo.startsWith('data:')) {
                payload.logo = shopLogo;
            }
            if (shopBanner && shopBanner.startsWith('data:')) {
                payload.banner = shopBanner;
            }

            await api.put(`/marketplace/shops/${shop.id}`, payload);
            Alert.alert('Success', 'Shop details updated successfully.');
            setIsEditShopOpen(false);
            fetchMyShop();
        } catch (error: any) {
            console.error('Update shop failed:', error);
            Alert.alert('Error', 'Failed to update shop details.');
            setLoading(false);
        }
    };

    const handleDeleteShop = () => {
        Alert.alert(
            'Delete Shop',
            'Are you sure you want to permanently delete your shop? This will delete all your product listings.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Permanently',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.delete(`/marketplace/shops/${shop.id}`);
                            Alert.alert('Success', 'Your shop has been deleted.');
                            setHasShop(false);
                            setShop(null);
                            setProducts([]);
                        } catch (e) {
                            Alert.alert('Error', 'Failed to delete shop.');
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleOpenAddProduct = () => {
        setEditingProduct(null);
        setProdName('');
        setProdDesc('');
        setProdPrice('');
        setProdCategory('Books');
        setProdImage(null);
        setProdGallery([]);
        setIsProductModalOpen(true);
    };

    const handleOpenEditProduct = (product: any) => {
        setEditingProduct(product);
        setProdName(product.name);
        setProdDesc(product.description || '');
        setProdPrice(product.price.toString());
        setProdCategory(product.category || 'Books');
        setProdImage(product.image_url);
        setProdGallery(product.gallery || []);
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = async () => {
        if (!prodName || !prodPrice || !prodCategory) {
            Alert.alert('Missing Fields', 'Please complete the product details.');
            return;
        }

        try {
            setLoading(true);
            const payload: any = {
                name: prodName,
                description: prodDesc,
                price: parseFloat(prodPrice),
                category: prodCategory,
                gallery: prodGallery.map(item => {
                    if (item.file) {
                        return { type: item.type, file: item.file };
                    } else {
                        return { type: item.type, url: item.url };
                    }
                })
            };

            if (prodImage && prodImage.startsWith('data:')) {
                payload.image = prodImage;
            }

            if (editingProduct) {
                // Update
                await api.put(`/marketplace/products/${editingProduct.id}`, payload);
                Alert.alert('Success', 'Product updated successfully!');
            } else {
                // Create
                await api.post('/marketplace/products', payload);
                Alert.alert('Success', 'Product listed successfully!');
            }
            
            setIsProductModalOpen(false);
            fetchMyShop();
        } catch (error: any) {
            console.error('Save product failed:', error);
            Alert.alert('Error', 'Failed to save product listing.');
            setLoading(false);
        }
    };

    const handleToggleSoldOut = async (product: any) => {
        const newStatus = product.status === 'active' ? 'sold_out' : 'active';
        try {
            setLoading(true);
            await api.put(`/marketplace/products/${product.id}`, {
                status: newStatus
            });
            fetchMyShop();
        } catch (e) {
            Alert.alert('Error', 'Failed to update product status.');
            setLoading(false);
        }
    };

    const handleDeleteProduct = (productId: number) => {
        Alert.alert(
            'Delete Product',
            'Are you sure you want to delete this product listing?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await api.delete(`/marketplace/products/${productId}`);
                            fetchMyShop();
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
        return `₦${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (loading && !shopName && !hasShop) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
                <Text className="text-gray-400 mt-2 text-xs uppercase font-bold">Synchronizing seller center...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Stack.Screen options={{ title: 'My Shop Console', headerShown: true, headerStyle: { backgroundColor: '#002147' }, headerTintColor: '#fff' }} />

            {!hasShop ? (
                /* ONBOARDING: CREATE SHOP FORM */
                <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
                    <View className="items-center py-6">
                        <View className="w-16 h-16 bg-secondary/10 rounded-3xl items-center justify-center border border-secondary/20 mb-4">
                            <Store size={32} color="#002147" />
                        </View>
                        <Text className="text-primary font-black text-xl text-center uppercase">Setup Your Student Shop</Text>
                        <Text className="text-gray-400 text-xs text-center mt-1">Start selling your books, food, electronics, or services directly to classmates.</Text>
                    </View>

                    <View className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-12">
                        <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2">Shop Name *</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-2xl text-primary mb-4 border border-gray-100 text-sm"
                            placeholder="e.g. Alhaji's Bookshop"
                            value={shopName}
                            onChangeText={setShopName}
                        />

                        <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2">Description</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-2xl text-primary mb-4 border border-gray-100 text-sm h-24"
                            placeholder="Tell students what you sell..."
                            multiline
                            numberOfLines={4}
                            value={shopDesc}
                            onChangeText={setShopDesc}
                        />

                        <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2">Call Contact Phone *</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-2xl text-primary mb-4 border border-gray-100 text-sm"
                            placeholder="e.g. +2348012345678"
                            keyboardType="phone-pad"
                            value={shopPhone}
                            onChangeText={setShopPhone}
                        />

                        <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2">WhatsApp Contact Number</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-2xl text-primary mb-4 border border-gray-100 text-sm"
                            placeholder="e.g. +2348012345678"
                            keyboardType="phone-pad"
                            value={shopWhatsapp}
                            onChangeText={setShopWhatsapp}
                        />

                        <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2">Contact Email (Optional)</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-2xl text-primary mb-6 border border-gray-100 text-sm"
                            placeholder="e.g. seller@kiu.edu.ng"
                            keyboardType="email-address"
                            value={shopEmail}
                            onChangeText={setShopEmail}
                        />

                        <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2">Shop Logo (PNG/JPG) *</Text>
                        <View className="flex-row items-center mb-4">
                            <TouchableOpacity
                                onPress={() => handlePickFile('logo')}
                                className="bg-gray-100 border border-dashed border-gray-300 rounded-2xl p-4 items-center justify-center flex-1 mr-4"
                            >
                                <Upload size={20} color="#002147" />
                                <Text className="text-primary font-bold text-xs mt-1">Upload Logo</Text>
                            </TouchableOpacity>
                            {shopLogo && (
                                <View className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200">
                                    <Image source={{ uri: shopLogo.startsWith('data:') ? shopLogo : (shopLogo.startsWith('http') ? shopLogo : `${api.defaults.baseURL?.replace('/api', '')}/${shopLogo}`) }} className="w-full h-full" />
                                </View>
                            )}
                        </View>

                        <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2">Shop Banner (PNG/JPG) *</Text>
                        <View className="flex-row items-center mb-6">
                            <TouchableOpacity
                                onPress={() => handlePickFile('banner')}
                                className="bg-gray-100 border border-dashed border-gray-300 rounded-2xl p-4 items-center justify-center flex-1 mr-4"
                            >
                                <Upload size={20} color="#002147" />
                                <Text className="text-primary font-bold text-xs mt-1">Upload Banner</Text>
                            </TouchableOpacity>
                            {shopBanner && (
                                <View className="w-24 h-16 rounded-2xl overflow-hidden border border-gray-200">
                                    <Image source={{ uri: shopBanner.startsWith('data:') ? shopBanner : (shopBanner.startsWith('http') ? shopBanner : `${api.defaults.baseURL?.replace('/api', '')}/${shopBanner}`) }} className="w-full h-full" resizeMode="cover" />
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={handleCreateShop}
                            className="bg-secondary py-4 rounded-2xl items-center flex-row justify-center"
                        >
                            <Save size={16} color="#002147" />
                            <Text className="text-primary font-bold text-xs uppercase ml-2">Activate Shop</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            ) : (
                /* CONSOLE DASHBOARD: SHOP MANAGEMENT */
                <View className="flex-1">
                    <FlatList
                        data={products}
                        keyExtractor={item => item.id.toString()}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        ListHeaderComponent={
                            <View className="p-6 pb-2">
                                {/* Shop Control Header Card */}
                                <View className="bg-white rounded-[32px] border border-gray-100 shadow-sm mb-6 overflow-hidden">
                                    {shop.banner ? (
                                        <Image
                                            source={{ uri: shop.banner.startsWith('http') ? shop.banner : `${api.defaults.baseURL?.replace('/api', '')}/${shop.banner}` }}
                                            className="w-full h-32"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View className="w-full h-24 bg-primary/10 items-center justify-center">
                                            <Store size={32} color="#002147" opacity={0.3} />
                                        </View>
                                    )}
                                    <View className="p-6">
                                        <View className="flex-row items-center -mt-12 mb-4">
                                            <View className="w-16 h-16 bg-white rounded-[20px] items-center justify-center overflow-hidden border-2 border-white shadow-md mr-4">
                                                {shop.logo ? (
                                                    <Image
                                                        source={{ uri: shop.logo.startsWith('http') ? shop.logo : `${api.defaults.baseURL?.replace('/api', '')}/${shop.logo}` }}
                                                        className="w-full h-full"
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <Store size={24} color="#002147" />
                                                )}
                                            </View>
                                            <View className="flex-1 pt-6">
                                                <Text className="text-primary font-black text-lg uppercase leading-tight" numberOfLines={1}>{shop.name}</Text>
                                                <Text className="text-gray-400 text-[10px] font-bold mt-0.5 uppercase">{shop.status === 'active' ? 'Active Store' : 'Suspended'}</Text>
                                            </View>
                                        </View>

                                        <Text className="text-gray-600 text-xs leading-normal">
                                            {shop.description || 'Welcome to my student store! Items listed here are available for trade.'}
                                        </Text>

                                        <View className="flex-row mt-4 pt-4 border-t border-gray-100">
                                            <TouchableOpacity
                                                onPress={() => setIsEditShopOpen(true)}
                                                className="flex-1 bg-gray-50 py-3 rounded-xl border border-gray-200/50 flex-row items-center justify-center mr-2"
                                            >
                                                <Edit2 size={12} color="#002147" />
                                                <Text className="text-primary font-bold text-[10px] uppercase ml-1.5">Edit Details</Text>
                                            </TouchableOpacity>
                                            
                                            <TouchableOpacity
                                                onPress={handleDeleteShop}
                                                className="bg-red-50 p-3 rounded-xl items-center justify-center"
                                            >
                                                <Trash2 size={14} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-primary font-black text-sm uppercase">My Listed Products</Text>
                                    <TouchableOpacity
                                        onPress={handleOpenAddProduct}
                                        className="bg-secondary/20 px-4 py-2 rounded-xl flex-row items-center border border-secondary/30"
                                    >
                                        <Plus size={12} color="#002147" />
                                        <Text className="text-primary font-bold text-[10px] uppercase ml-1">List Product</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <View className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm mx-6 mb-3 flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1 mr-4">
                                    <View className="w-14 h-14 bg-gray-50 rounded-2xl items-center justify-center overflow-hidden border border-gray-100 mr-3">
                                        {item.image_url ? (
                                            <Image
                                                source={{ uri: item.image_url.startsWith('http') ? item.image_url : `${api.defaults.baseURL?.replace('/api', '')}/${item.image_url}` }}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <ShoppingBag size={20} color="#9CA3AF" />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-primary font-bold text-sm uppercase" numberOfLines={1}>{item.name}</Text>
                                        <Text className="text-secondary font-black text-xs mt-1">{formatPrice(item.price)}</Text>
                                        <View className="flex-row items-center mt-1">
                                            <Text className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                item.status === 'active' ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'
                                            }`}>
                                                {item.status.replace('_', ' ')}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <View className="flex-row items-center">
                                    <TouchableOpacity
                                        onPress={() => handleToggleSoldOut(item)}
                                        className="bg-gray-50 p-2.5 rounded-xl border border-gray-200/50 mr-2"
                                    >
                                        {item.status === 'active' ? <EyeOff size={14} color="#64748B" /> : <Eye size={14} color="#10B981" />}
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleOpenEditProduct(item)}
                                        className="bg-blue-50 p-2.5 rounded-xl mr-2"
                                    >
                                        <Edit2 size={14} color="#3B82F6" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDeleteProduct(item.id)}
                                        className="bg-red-50 p-2.5 rounded-xl"
                                    >
                                        <Trash2 size={14} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20 px-6">
                                <ShoppingBag size={48} color="#CBD5E1" />
                                <Text className="text-gray-400 mt-4 text-xs font-bold uppercase text-center">No products listed. Tap "List Product" to start.</Text>
                            </View>
                        }
                    />

                    {/* EDIT SHOP DETAIL MODAL */}
                    <Modal visible={isEditShopOpen} animationType="slide">
                        <SafeAreaView className="flex-1 bg-white p-6">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-primary font-black text-lg uppercase">Edit Shop Info</Text>
                                <TouchableOpacity onPress={() => setIsEditShopOpen(false)}>
                                    <X size={20} color="#002147" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text className="text-primary font-bold text-xs uppercase mb-2">Shop Name</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-2xl text-primary mb-4 border border-gray-100 text-sm"
                                    value={shopName}
                                    onChangeText={setShopName}
                                />

                                <Text className="text-primary font-bold text-xs uppercase mb-2">Description</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-2xl text-primary mb-4 border border-gray-100 text-sm h-24"
                                    multiline
                                    numberOfLines={4}
                                    value={shopDesc}
                                    onChangeText={setShopDesc}
                                />

                                <Text className="text-primary font-bold text-xs uppercase mb-2">Contact Phone</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-2xl text-primary mb-4 border border-gray-100 text-sm"
                                    keyboardType="phone-pad"
                                    value={shopPhone}
                                    onChangeText={setShopPhone}
                                />

                                <Text className="text-primary font-bold text-xs uppercase mb-2">WhatsApp Contact</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-2xl text-primary mb-4 border border-gray-100 text-sm"
                                    keyboardType="phone-pad"
                                    value={shopWhatsapp}
                                    onChangeText={setShopWhatsapp}
                                />

                                <Text className="text-primary font-bold text-xs uppercase mb-6">Contact Email</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-2xl text-primary mb-6 border border-gray-100 text-sm"
                                    keyboardType="email-address"
                                    value={shopEmail}
                                    onChangeText={setShopEmail}
                                />

                                <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2">Shop Logo (PNG/JPG) *</Text>
                                <View className="flex-row items-center mb-4">
                                    <TouchableOpacity
                                        onPress={() => handlePickFile('logo')}
                                        className="bg-gray-100 border border-dashed border-gray-300 rounded-2xl p-4 items-center justify-center flex-1 mr-4"
                                    >
                                        <Upload size={20} color="#002147" />
                                        <Text className="text-primary font-bold text-xs mt-1">Upload Logo</Text>
                                    </TouchableOpacity>
                                    {shopLogo && (
                                        <View className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200">
                                            <Image source={{ uri: shopLogo.startsWith('data:') ? shopLogo : (shopLogo.startsWith('http') ? shopLogo : `${api.defaults.baseURL?.replace('/api', '')}/${shopLogo}`) }} className="w-full h-full" />
                                        </View>
                                    )}
                                </View>

                                <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2">Shop Banner (PNG/JPG) *</Text>
                                <View className="flex-row items-center mb-6">
                                    <TouchableOpacity
                                        onPress={() => handlePickFile('banner')}
                                        className="bg-gray-100 border border-dashed border-gray-300 rounded-2xl p-4 items-center justify-center flex-1 mr-4"
                                    >
                                        <Upload size={20} color="#002147" />
                                        <Text className="text-primary font-bold text-xs mt-1">Upload Banner</Text>
                                    </TouchableOpacity>
                                    {shopBanner && (
                                        <View className="w-24 h-16 rounded-2xl overflow-hidden border border-gray-200">
                                            <Image source={{ uri: shopBanner.startsWith('data:') ? shopBanner : (shopBanner.startsWith('http') ? shopBanner : `${api.defaults.baseURL?.replace('/api', '')}/${shopBanner}`) }} className="w-full h-full" resizeMode="cover" />
                                        </View>
                                    )}
                                </View>

                                <TouchableOpacity
                                    onPress={handleUpdateShop}
                                    className="bg-secondary py-4 rounded-2xl items-center flex-row justify-center mt-4"
                                >
                                    <Save size={16} color="#002147" />
                                    <Text className="text-primary font-bold text-xs uppercase ml-2">Save Changes</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </SafeAreaView>
                    </Modal>

                    {/* ADD / EDIT PRODUCT MODAL */}
                    <Modal visible={isProductModalOpen} animationType="slide">
                        <SafeAreaView className="flex-1 bg-white p-6">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-primary font-black text-lg uppercase">
                                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                                </Text>
                                <TouchableOpacity onPress={() => setIsProductModalOpen(false)}>
                                    <X size={20} color="#002147" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <Text className="text-primary font-bold text-xs uppercase mb-2">Product Name *</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-2xl text-primary mb-4 border border-gray-100 text-sm"
                                    placeholder="e.g. Engineering Mathematics Volume 1"
                                    value={prodName}
                                    onChangeText={setProdName}
                                />

                                <Text className="text-primary font-bold text-xs uppercase mb-2">Price (₦) *</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-2xl text-primary mb-4 border border-gray-100 text-sm"
                                    placeholder="e.g. 5000"
                                    keyboardType="numeric"
                                    value={prodPrice}
                                    onChangeText={setProdPrice}
                                />

                                <Text className="text-primary font-bold text-xs uppercase mb-2">Category *</Text>
                                <View className="flex-row flex-wrap mb-4">
                                    {['Books', 'Electronics', 'Fashion', 'Food', 'Services', 'Other'].map((cat, idx) => {
                                        const isSelected = prodCategory === cat;
                                        return (
                                            <TouchableOpacity
                                                key={idx}
                                                onPress={() => setProdCategory(cat)}
                                                className={`px-3 py-2 rounded-xl mr-2 mb-2 border ${
                                                    isSelected ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'
                                                }`}
                                            >
                                                <Text className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-primary'}`}>{cat}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <Text className="text-primary font-bold text-xs uppercase mb-2">Product Description</Text>
                                <TextInput
                                    className="bg-gray-50 p-4 rounded-2xl text-primary mb-4 border border-gray-100 text-sm h-24"
                                    placeholder="Condition, details, usage, etc..."
                                    multiline
                                    numberOfLines={4}
                                    value={prodDesc}
                                    onChangeText={setProdDesc}
                                />

                                {/* Main Product Image */}
                                <Text className="text-primary font-bold text-xs uppercase tracking-wider mb-2">Main Product Image *</Text>
                                <View className="flex-row items-center mb-4">
                                    <TouchableOpacity
                                        onPress={() => handlePickFile('product_image')}
                                        className="bg-gray-100 border border-dashed border-gray-300 rounded-2xl p-4 items-center justify-center flex-1 mr-4"
                                    >
                                        <Upload size={20} color="#002147" />
                                        <Text className="text-primary font-bold text-xs mt-1">Upload Main Image</Text>
                                    </TouchableOpacity>
                                    {prodImage && (
                                        <View className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200">
                                            <Image source={{ uri: prodImage.startsWith('data:') ? prodImage : (prodImage.startsWith('http') ? prodImage : `${api.defaults.baseURL?.replace('/api', '')}/${prodImage}`) }} className="w-full h-full" />
                                        </View>
                                    )}
                                </View>

                                {/* Product Gallery Picker */}
                                <View className="mb-6">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-primary font-bold text-xs uppercase">Product Gallery ({prodGallery.length}/5)</Text>
                                        {prodGallery.length < 5 && (
                                            <TouchableOpacity
                                                onPress={handleAddGalleryMedia}
                                                className="bg-secondary/15 px-3 py-1.5 rounded-lg border border-secondary/25 flex-row items-center"
                                            >
                                                <Plus size={10} color="#002147" />
                                                <Text className="text-primary font-bold text-[8px] uppercase ml-1">Add Media</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    
                                    <View className="flex-row flex-wrap">
                                        {prodGallery.map((item, idx) => (
                                            <View key={idx} className="mr-3 mb-3 relative w-20 h-20 bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden justify-center items-center">
                                                {item.type === 'image' ? (
                                                    <Image
                                                        source={{ uri: item.file || (item.url?.startsWith('http') ? item.url : `${api.defaults.baseURL?.replace('/api', '')}/${item.url}`) }}
                                                        className="w-full h-full"
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <View className="items-center justify-center">
                                                        <Video size={24} color="#002147" />
                                                        <Text className="text-[8px] text-gray-500 font-bold mt-1 uppercase">Video</Text>
                                                    </View>
                                                )}
                                                <TouchableOpacity
                                                    onPress={() => setProdGallery(prev => prev.filter((_, i) => i !== idx))}
                                                    className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                                                >
                                                    <X size={10} color="white" />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                <TouchableOpacity
                                    onPress={handleSaveProduct}
                                    className="bg-secondary py-4 rounded-2xl items-center flex-row justify-center mt-4"
                                >
                                    <Save size={16} color="#002147" />
                                    <Text className="text-primary font-bold text-xs uppercase ml-2">Publish Product</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </SafeAreaView>
                    </Modal>
                </View>
            )}
        </SafeAreaView>
    );
}
