import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Linking, Alert, Share, TextInput, Modal } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Phone, MessageCircle, Mail, Store, Share2, AlertTriangle, ChevronRight, Upload, X, Star, Video } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { VideoView, useVideoPlayer } from 'expo-video';
import api from '../../../lib/api';

function ReviewVideoPlayer({ url }: { url: string }) {
    const videoUrl = url.startsWith('http') ? url : `${api.defaults.baseURL?.replace('/api', '')}/${url}`;
    const player = useVideoPlayer(videoUrl, p => {
        p.loop = false;
    });

    return (
        <VideoView
            player={player}
            style={{ width: 160, height: 112 }}
            allowsPictureInPicture
            nativeControls
        />
    );
}

export default function ProductDetails() {
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Active gallery media state
    const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
    
    // Write Review modal state
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewDesc, setReviewDesc] = useState('');
    const [reviewMediaType, setReviewMediaType] = useState<'image' | 'video' | 'none'>('none');
    const [reviewMediaFile, setReviewMediaFile] = useState<string | null>(null);
    const [submittingReview, setSubmittingReview] = useState(false);

    // Video Player hook for the active gallery media
    const isVideo = activeMedia?.type === 'video';
    const videoUrl = isVideo ? (activeMedia?.url?.startsWith('http') ? activeMedia.url : `${api.defaults.baseURL?.replace('/api', '')}/${activeMedia?.url}`) : '';
    const player = useVideoPlayer(videoUrl, p => {
        p.loop = false;
    });

    useEffect(() => {
        if (id) {
            fetchProduct();
        }
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/marketplace/products/${id}`);
            setProduct(response.data);
            if (response.data && response.data.image_url) {
                setActiveMedia({
                    type: 'image',
                    url: response.data.image_url
                });
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            Alert.alert('Error', 'Failed to load product details.');
        } finally {
            setLoading(false);
        }
    };

    const handleCall = () => {
        const phone = product?.shop?.contact_phone;
        if (!phone) {
            Alert.alert('Error', 'Contact phone number not available.');
            return;
        }
        Linking.openURL(`tel:${phone}`);
    };

    const handleWhatsApp = () => {
        const phone = product?.shop?.whatsapp_number || product?.shop?.contact_phone;
        if (!phone) {
            Alert.alert('Error', 'WhatsApp number not available.');
            return;
        }
        
        // Remove spaces, + or special characters for WhatsApp URL
        const cleanPhone = phone.replace(/[^\d]/g, '');
        const message = encodeURIComponent(`Hi, I saw your product "${product.name}" listed for ${formatPrice(product.price)} on KIU Explorer E-Commerce and I am interested in buying it. Is it still available?`);
        
        // Try opening whatsapp directly first
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

    const handleEmail = () => {
        const email = product?.shop?.contact_email;
        if (!email) return;
        Linking.openURL(`mailto:${email}?subject=Interested in ${product.name}&body=Hi, I am interested in buying your product "${product.name}" listed on KIU Explorer.`);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out this product: ${product.name} on KIU Explorer Marketplace for only ${formatPrice(product.price)}!`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    const formatPrice = (price: number | string) => {
        if (!price) return '₦0.00';
        const val = typeof price === 'string' ? parseFloat(price) : price;
        return `₦${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handlePickReviewMedia = async (mediaType: 'image' | 'video') => {
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

                setReviewMediaType(mediaType);
                setReviewMediaFile(dataUrl);
            }
        } catch (error) {
            console.error('Error picking review media:', error);
            Alert.alert('Error', 'Failed to pick review attachment.');
        }
    };

    const handleSubmitReview = async () => {
        if (reviewRating < 1 || reviewRating > 5) {
            Alert.alert('Rating Required', 'Please choose a rating from 1 to 5 stars.');
            return;
        }

        try {
            setSubmittingReview(true);
            const payload: any = {
                rating: reviewRating,
                description: reviewDesc,
                media_type: reviewMediaType,
            };

            if (reviewMediaFile && reviewMediaType !== 'none') {
                payload.media_file = reviewMediaFile;
            }

            await api.post(`/marketplace/products/${id}/reviews`, payload);
            Alert.alert('Success', 'Review posted successfully!');
            setIsReviewModalOpen(false);
            
            // Clear states
            setReviewRating(5);
            setReviewDesc('');
            setReviewMediaType('none');
            setReviewMediaFile(null);
            
            // Reload product details to fetch new reviews
            fetchProduct();
        } catch (error) {
            console.error('Failed to submit review:', error);
            Alert.alert('Error', 'Failed to submit review. Make sure attachment size is small.');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#002147" />
                <Text className="text-gray-400 mt-2 text-xs uppercase font-bold">Loading product info...</Text>
            </SafeAreaView>
        );
    }

    if (!product) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
                <AlertTriangle size={48} color="#EF4444" />
                <Text className="text-primary font-bold text-lg mt-4 text-center">Product Not Found</Text>
                <Text className="text-gray-400 text-sm mt-2 text-center">This product may have been removed by the owner or administrator.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-6 bg-primary px-6 py-3 rounded-full">
                    <Text className="text-white font-bold text-xs uppercase">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const sellerName = product.shop?.owner 
        ? `${product.shop.owner.first_name} ${product.shop.owner.surname}` 
        : 'Student Seller';

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <Stack.Screen options={{ title: 'Product Details', headerShown: true, headerStyle: { backgroundColor: '#002147' }, headerTintColor: '#fff' }} />
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                {/* Product Image Section */}
                <View className="bg-white h-72 w-full relative items-center justify-center border-b border-gray-100">
                    {activeMedia?.type === 'image' && activeMedia?.url ? (
                        <Image
                            source={{ uri: activeMedia.url.startsWith('http') ? activeMedia.url : `${api.defaults.baseURL?.replace('/api', '')}/${activeMedia.url}` }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : activeMedia?.type === 'video' && activeMedia?.url ? (
                        <View className="w-full h-full bg-slate-900 justify-center">
                            <VideoView
                                player={player}
                                style={{ width: '100%', height: 288 }}
                                allowsPictureInPicture
                                nativeControls
                            />
                        </View>
                    ) : (
                        <View className="items-center justify-center p-6 w-full h-full bg-secondary/5">
                            <Store size={64} color="#9CA3AF" />
                            <Text className="text-gray-400 text-xs mt-2 uppercase font-bold tracking-wider">{product.category}</Text>
                        </View>
                    )}
                    <TouchableOpacity
                        onPress={handleShare}
                        className="absolute top-4 right-4 w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/20"
                    >
                        <Share2 size={16} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Product Gallery Slider */}
                {product.gallery && product.gallery.length > 0 && (
                    <View className="bg-white py-3 border-b border-gray-100">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
                            {/* Main image thumbnail */}
                            <TouchableOpacity
                                onPress={() => setActiveMedia({ type: 'image', url: product.image_url })}
                                className={`w-16 h-16 rounded-xl overflow-hidden mr-3 border-2 ${activeMedia?.url === product.image_url ? 'border-secondary' : 'border-gray-200'}`}
                            >
                                <Image
                                    source={{ uri: product.image_url.startsWith('http') ? product.image_url : `${api.defaults.baseURL?.replace('/api', '')}/${product.image_url}` }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            </TouchableOpacity>

                            {/* Gallery thumbnails */}
                            {product.gallery.map((item: any, idx: number) => {
                                const isSelected = activeMedia?.url === item.url;
                                return (
                                    <TouchableOpacity
                                        key={idx}
                                        onPress={() => setActiveMedia({ type: item.type, url: item.url })}
                                        className={`w-16 h-16 rounded-xl overflow-hidden mr-3 border-2 justify-center items-center ${isSelected ? 'border-secondary' : 'border-gray-200'} ${item.type === 'video' ? 'bg-slate-900' : ''}`}
                                    >
                                        {item.type === 'image' ? (
                                            <Image
                                                source={{ uri: item.url.startsWith('http') ? item.url : `${api.defaults.baseURL?.replace('/api', '')}/${item.url}` }}
                                                className="w-full h-full"
                                                resizeMode="cover"
                                            />
                                        ) : (
                                            <View className="items-center justify-center">
                                                <Video size={16} color="white" />
                                                <Text className="text-[6px] text-gray-300 font-bold uppercase mt-0.5">Video</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Main Product Info Card */}
                <View className="bg-white p-6 mb-3 shadow-sm">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1 mr-4">
                            <Text className="text-primary font-black text-xl uppercase leading-tight">{product.name}</Text>
                            
                            {/* Star Rating Summary */}
                            <View className="flex-row items-center mt-2">
                                <View className="flex-row items-center mr-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            size={12}
                                            color="#F59E0B"
                                            fill={star <= Math.round(product.average_rating || 0) ? '#F59E0B' : 'transparent'}
                                        />
                                    ))}
                                </View>
                                <Text className="text-gray-500 text-xs font-semibold">
                                    {product.average_rating || 0} ({product.ratings_count || 0} reviews)
                                </Text>
                            </View>

                            <View className="flex-row items-center mt-2 flex-wrap">
                                <View className="bg-blue-50 px-3 py-1 rounded-full mr-2 mb-1">
                                    <Text className="text-blue-600 text-[10px] font-bold uppercase">{product.category}</Text>
                                </View>
                                {product.status === 'sold_out' && (
                                    <View className="bg-red-50 px-3 py-1 rounded-full mb-1">
                                        <Text className="text-red-600 text-[10px] font-bold uppercase">Sold Out</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                        <Text className="text-secondary font-black text-2xl">{formatPrice(product.price)}</Text>
                    </View>
                </View>

                {/* Description Card */}
                <View className="bg-white p-6 mb-3 shadow-sm">
                    <Text className="text-primary font-bold text-sm uppercase mb-3">Product Description</Text>
                    <Text className="text-gray-600 text-sm leading-relaxed">
                        {product.description || 'No description provided for this product.'}
                    </Text>
                </View>

                {/* Shop / Seller Details Card */}
                <View className="bg-white p-6 shadow-sm mb-3">
                    <Text className="text-primary font-bold text-sm uppercase mb-4">Shop & Seller Information</Text>
                    <TouchableOpacity
                        onPress={() => router.push(`/marketplace/shop/${product.shop?.id}` as any)}
                        className="flex-row items-center justify-between bg-gray-50 p-4 rounded-3xl border border-gray-100"
                    >
                        <View className="flex-row items-center flex-1 mr-2">
                            <View className="w-12 h-12 bg-secondary/20 rounded-2xl items-center justify-center overflow-hidden border border-gray-100 mr-3">
                                {product.shop?.logo ? (
                                    <Image
                                        source={{ uri: product.shop.logo.startsWith('http') ? product.shop.logo : `${api.defaults.baseURL?.replace('/api', '')}/${product.shop.logo}` }}
                                        className="w-full h-full"
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <Store size={20} color="#002147" />
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className="text-primary font-bold text-sm" numberOfLines={1}>{product.shop?.name || 'Student Shop'}</Text>
                                <Text className="text-gray-400 text-[10px]" numberOfLines={1}>Owner: {sellerName}</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-secondary font-bold text-[10px] uppercase mr-1">View Shop</Text>
                            <ChevronRight size={14} color="#002147" />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Direct payment disclaimer notice */}
                <View className="p-6 bg-amber-50/50 border-t border-b border-amber-100 flex-row items-start mb-6">
                    <AlertTriangle size={18} color="#F59E0B" className="mr-3 mt-0.5" />
                    <View className="flex-1">
                        <Text className="text-amber-800 font-bold text-xs uppercase">Important Safety Notice</Text>
                        <Text className="text-amber-700 text-[11px] mt-1 leading-normal">
                            Transactions are settled off-app directly with the student owner. Never pay in advance unless you are meeting the seller in a secure public campus location to exchange the items.
                        </Text>
                    </View>
                </View>

                {/* Product Reviews Card */}
                <View className="bg-white p-6 shadow-sm mb-6">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-primary font-bold text-sm uppercase">Product Reviews ({product.reviews?.length || 0})</Text>
                        <TouchableOpacity
                            onPress={() => setIsReviewModalOpen(true)}
                            className="bg-secondary/20 px-3 py-1.5 rounded-xl border border-secondary/30"
                        >
                            <Text className="text-primary font-bold text-[10px] uppercase">Write Review</Text>
                        </TouchableOpacity>
                    </View>

                    {product.reviews && product.reviews.length > 0 ? (
                        product.reviews.map((review: any) => {
                            const userPhoto = review.user?.passport_photograph;
                            const userFullName = review.user
                                ? `${review.user.first_name} ${review.user.surname}`
                                : 'Anonymous Student';
                            
                            const photoUri = userPhoto
                                ? (userPhoto.startsWith('http') ? userPhoto : `${api.defaults.baseURL?.replace('/api', '')}/${userPhoto}`)
                                : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

                            return (
                                <View key={review.id} className="border-b border-gray-100 py-4 last:border-0">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <View className="flex-row items-center">
                                            <Image
                                                source={{ uri: photoUri }}
                                                className="w-8 h-8 rounded-full border border-gray-200 mr-2"
                                            />
                                            <View>
                                                <Text className="text-primary font-bold text-xs">{userFullName}</Text>
                                                <View className="flex-row mt-0.5">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star
                                                            key={star}
                                                            size={10}
                                                            color="#F59E0B"
                                                            fill={star <= review.rating ? '#F59E0B' : 'transparent'}
                                                            className="mr-0.5"
                                                        />
                                                    ))}
                                                </View>
                                            </View>
                                        </View>
                                        <Text className="text-gray-400 text-[10px]">
                                            {new Date(review.created_at).toLocaleDateString()}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-600 text-xs leading-normal mb-2">{review.description}</Text>
                                    
                                    {/* Review Media Attachment */}
                                    {review.media_type !== 'none' && review.media_url && (
                                        <View className="mt-2 rounded-2xl overflow-hidden border border-gray-100 self-start">
                                            {review.media_type === 'image' ? (
                                                <Image
                                                    source={{ uri: review.media_url.startsWith('http') ? review.media_url : `${api.defaults.baseURL?.replace('/api', '')}/${review.media_url}` }}
                                                    className="w-40 h-28"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <View className="w-40 h-28 bg-slate-900 justify-center">
                                                    <ReviewVideoPlayer url={review.media_url} />
                                                </View>
                                            )}
                                        </View>
                                    )}
                                </View>
                            );
                        })
                    ) : (
                        <Text className="text-gray-400 text-xs italic">No reviews yet. Be the first to review this product!</Text>
                    )}
                </View>
            </ScrollView>

            {/* WRITE A REVIEW MODAL */}
            <Modal visible={isReviewModalOpen} animationType="slide">
                <SafeAreaView className="flex-1 bg-white p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-primary font-black text-lg uppercase">Write a Review</Text>
                        <TouchableOpacity onPress={() => setIsReviewModalOpen(false)}>
                            <X size={20} color="#002147" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Rating Stars Select */}
                        <Text className="text-primary font-bold text-xs uppercase mb-2">Your Rating *</Text>
                        <View className="flex-row mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <TouchableOpacity key={star} onPress={() => setReviewRating(star)} className="mr-3">
                                    <Star
                                        size={32}
                                        color="#F59E0B"
                                        fill={star <= reviewRating ? '#F59E0B' : 'transparent'}
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Description Text Input */}
                        <Text className="text-primary font-bold text-xs uppercase mb-2">Description</Text>
                        <TextInput
                            className="bg-gray-50 p-4 rounded-2xl text-primary mb-4 border border-gray-100 text-sm h-28"
                            placeholder="Share your experience with this product..."
                            multiline
                            numberOfLines={4}
                            value={reviewDesc}
                            onChangeText={setReviewDesc}
                        />

                        {/* Media Selector type */}
                        <Text className="text-primary font-bold text-xs uppercase mb-2">Add Photo or Video</Text>
                        <View className="flex-row space-x-3 mb-6">
                            <TouchableOpacity
                                onPress={() => handlePickReviewMedia('image')}
                                className={`flex-1 flex-row items-center justify-center py-4 bg-gray-50 border rounded-2xl ${reviewMediaType === 'image' ? 'border-secondary bg-secondary/5' : 'border-gray-200'}`}
                            >
                                <Upload size={16} color="#002147" />
                                <Text className="text-primary font-bold text-xs ml-2">Attach Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handlePickReviewMedia('video')}
                                className={`flex-1 flex-row items-center justify-center py-4 bg-gray-50 border rounded-2xl ${reviewMediaType === 'video' ? 'border-secondary bg-secondary/5' : 'border-gray-200'}`}
                            >
                                <Upload size={16} color="#002147" />
                                <Text className="text-primary font-bold text-xs ml-2">Attach Video</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Preview Selected Media */}
                        {reviewMediaType !== 'none' && reviewMediaFile && (
                            <View className="relative w-32 h-24 rounded-2xl overflow-hidden mb-6 border border-gray-200 self-center">
                                {reviewMediaType === 'image' ? (
                                    <Image source={{ uri: reviewMediaFile }} className="w-full h-full" resizeMode="cover" />
                                ) : (
                                    <View className="w-full h-full bg-slate-900 items-center justify-center">
                                        <Video size={24} color="white" />
                                        <Text className="text-[8px] text-gray-300 font-bold mt-1">Video Ready</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    onPress={() => {
                                        setReviewMediaType('none');
                                        setReviewMediaFile(null);
                                    }}
                                    className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                                >
                                    <X size={10} color="white" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleSubmitReview}
                            disabled={submittingReview}
                            className={`py-4 rounded-2xl items-center justify-center ${submittingReview ? 'bg-gray-300' : 'bg-secondary'}`}
                        >
                            {submittingReview ? (
                                <ActivityIndicator color="#002147" />
                            ) : (
                                <Text className="text-primary font-bold text-xs uppercase">Submit Review</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </Modal>

            {/* Bottom Floating Contact Buttons */}
            {product.status !== 'sold_out' && (
                <View 
                    style={{ paddingBottom: Math.max(insets.bottom + 16, 36) }} 
                    className="absolute bottom-0 left-0 right-0 bg-white px-6 pt-4 border-t border-gray-100 flex-row justify-between shadow-2xl"
                >
                    <TouchableOpacity
                        onPress={handleCall}
                        className="flex-1 bg-primary py-4 rounded-2xl items-center flex-row justify-center mr-3 border border-primary"
                    >
                        <Phone size={16} color="white" />
                        <Text className="text-white font-bold text-xs uppercase ml-2">Call Seller</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleWhatsApp}
                        className="flex-1 bg-emerald-500 py-4 rounded-2xl items-center flex-row justify-center"
                    >
                        <MessageCircle size={16} color="white" />
                        <Text className="text-white font-bold text-xs uppercase ml-2">WhatsApp Chat</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}
