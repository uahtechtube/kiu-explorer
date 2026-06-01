import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions, TextInput, ActivityIndicator, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, MapPin, Navigation, Search, Layers, Clock, Phone, Mail, BookOpen, Coffee, Briefcase, Award, ShieldAlert, X, Compass, ExternalLink, Home } from 'lucide-react-native';
import { WebView } from 'react-native-webview';
import api from '../../lib/api';
import { PremiumCard } from '../../components/shared/PremiumCard';

const { width } = Dimensions.get('window');

interface Location {
    id: number;
    name: string;
    type: 'building' | 'facility' | 'emergency_point' | 'office' | 'library' | 'cafeteria' | 'hostel' | 'sports' | 'other' | string;
    coords: string;
    description: string;
    latitude?: number;
    longitude?: number;
    contact_phone?: string;
    contact_email?: string;
    operating_hours?: string;
    floor_number?: number;
    building_code?: string;
}

export default function CampusMapPage() {
    const router = useRouter();
    const webViewRef = useRef<WebView>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(false);
    const [locations, setLocations] = useState<Location[]>([]);
    const [selectedLoc, setSelectedLoc] = useState<Location | null>(null);

    const categories = ['All', 'Faculties', 'Lecture Halls', 'Library', 'Labs', 'Hostels', 'Sports'];

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            setLoading(true);
            const response = await api.get('/school/map');
            const list = response.data.data || response.data || [];
            setLocations(list);
            
            // Set first location as default selected for guide description details
            if (list.length > 0) {
                setSelectedLoc(list[0]);
            }
        } catch (error) {
            console.error('Error fetching map locations:', error);
            // High fidelity fallback matching SchoolController static locations
            const fallback: Location[] = [
                {
                    id: 1,
                    name: 'Faculty of Science',
                    type: 'Faculties',
                    coords: 'Block A, East Wing',
                    description: 'Home to the departments of Computer Science, Biotech, and Physics. Contains state-of-the-art computer labs and classrooms.',
                    latitude: 0.3019,
                    longitude: 32.5968,
                    operating_hours: '08:00 AM - 06:00 PM',
                    contact_email: 'science@kiu.ac.ug',
                    building_code: 'FOS-BLK'
                },
                {
                    id: 2,
                    name: 'Main Auditorium',
                    type: 'Lecture Halls',
                    coords: 'Central Campus',
                    description: 'A 2,500 capacity hall for major events, conferences, and large joint lecture halls.',
                    latitude: 0.3011,
                    longitude: 32.5959,
                    operating_hours: '07:00 AM - 09:00 PM',
                    building_code: 'AUD-CTR'
                },
                {
                    id: 3,
                    name: 'E-Library Complex',
                    type: 'Library',
                    coords: 'Academic Center',
                    description: 'State-of-the-art digital library featuring 500+ computer systems, high-speed Wi-Fi, and 24/7 online resource portals.',
                    latitude: 0.3023,
                    longitude: 32.5960,
                    operating_hours: '08:00 AM - 10:00 PM',
                    contact_phone: '+256 414 500 100',
                    contact_email: 'library@kiu.ac.ug',
                    building_code: 'LIB-BLK'
                },
                {
                    id: 4,
                    name: 'Kashim Ibrahim Hall',
                    type: 'Hostels',
                    coords: 'South Campus',
                    description: 'Premier university male student residence hall featuring standard study rooms, recreation facilities, and 24/7 security wardens.',
                    latitude: 0.2998,
                    longitude: 32.5966,
                    operating_hours: '24 Hours Open',
                    building_code: 'KIH-HST'
                },
                {
                    id: 5,
                    name: 'ICT Innovation Lab',
                    type: 'Labs',
                    coords: 'Block C, Ground Floor',
                    description: 'Incubation hub for AI modeling, mobile application development, IoT engineering, and software startup prototyping.',
                    latitude: 0.3025,
                    longitude: 32.5971,
                    operating_hours: '08:30 AM - 05:30 PM',
                    contact_email: 'innovations@kiu.ac.ug',
                    building_code: 'ICT-LAB'
                },
                {
                    id: 6,
                    name: 'Faculty of Arts',
                    type: 'Faculties',
                    coords: 'Block B, West Wing',
                    description: 'Houses the school of Humanities, languages, economics, and mass communication studio labs.',
                    latitude: 0.3010,
                    longitude: 32.5975,
                    operating_hours: '08:00 AM - 05:00 PM',
                    building_code: 'ART-BLK'
                },
                {
                    id: 7,
                    name: 'Sports Complex',
                    type: 'Sports',
                    coords: 'North Campus',
                    description: 'Standard athletics running tracks, soccer pitches, basketball arenas, and fitness center gymnasium.',
                    latitude: 0.3032,
                    longitude: 32.5955,
                    operating_hours: '06:00 AM - 07:00 PM',
                    building_code: 'SPT-CTR'
                }
            ];
            setLocations(fallback);
            setSelectedLoc(fallback[0]);
        } finally {
            setLoading(false);
        }
    };

    // Filter location list
    const filteredLocations = locations.filter(loc => {
        const matchesCategory = selectedCategory === 'All' || 
            loc.type.toLowerCase() === selectedCategory.toLowerCase() ||
            (selectedCategory === 'Faculties' && loc.type.includes('Faculties')) ||
            (selectedCategory === 'Lecture Halls' && loc.type.includes('Halls')) ||
            (selectedCategory === 'Library' && loc.type.includes('Library')) ||
            (selectedCategory === 'Labs' && loc.type.includes('Labs')) ||
            (selectedCategory === 'Hostels' && loc.type.includes('Hostels')) ||
            (selectedCategory === 'Sports' && loc.type.includes('Sports'));

        const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            loc.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesSearch;
    });

    const handleSelectLocation = (loc: Location) => {
        setSelectedLoc(loc);
        if (loc.latitude && loc.longitude && webViewRef.current) {
            // Trigger interactive map panning
            const jsCode = `panToLocation(${loc.id}, ${loc.latitude}, ${loc.longitude}, "${loc.name}");`;
            webViewRef.current.injectJavaScript(jsCode);
        }
    };

    const handleExternalNavigation = (loc: Location) => {
        const lat = loc.latitude || 0.3015;
        const lng = loc.longitude || 32.5962;
        const label = encodeURIComponent(loc.name);
        
        // Open in native Google Maps or Apple Maps app
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    Alert.alert('Error', 'Cannot launch navigation app.');
                }
            })
            .catch((err) => console.error('An error occurred', err));
    };

    const getIcon = (type: string) => {
        const t = type.toLowerCase();
        if (t.includes('lib')) return BookOpen;
        if (t.includes('hall') || t.includes('aud')) return Compass;
        if (t.includes('hostel')) return Home;
        if (t.includes('lab')) return Coffee;
        if (t.includes('sport')) return Award;
        if (t.includes('emergency')) return ShieldAlert;
        return MapPin;
    };

    const themeColors: Record<string, string> = {
        'faculties': '#002147',
        'lecture halls': '#002147',
        'library': '#8B5CF6',
        'labs': '#F59E0B',
        'hostels': '#002147',
        'sports': '#10B981',
        'emergency_point': '#EF4444'
    };

    const getLandmarkColor = (type: string) => {
        return themeColors[type.toLowerCase()] || '#64748B';
    };

    // Generate HTML for map (Leaflet styled identically to premium Google Maps Voyager theme)
    const mapHtmlString = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
            body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; font-family: -apple-system, sans-serif; background-color: #f8fafc; }
            .leaflet-popup-content-title { font-weight: 900; color: #002147; font-size: 13px; margin-bottom: 2px; }
            .leaflet-popup-content-desc { color: #64748B; font-size: 10px; line-height: 1.4; font-weight: 500; }
            .leaflet-popup-tip { background: white; }
            .leaflet-popup-content-wrapper { border-radius: 12px; padding: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        </style>
    </head>
    <body>
        <div id="map"></div>
        <script>
            // KIU Kashim Ibrahim University Center Coordinates
            var map = L.map('map', { zoomControl: false }).setView([0.3015, 32.5962], 16);
            
            // Clean Road Tile Theme Layer
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 19
            }).addTo(map);

            var markers = {};

            function addMarker(id, name, lat, lng, type, desc) {
                if (!lat || !lng) return;
                
                var color = '#002147';
                var typeLower = type.toLowerCase();
                if (typeLower.includes('lib')) color = '#8B5CF6';
                if (typeLower.includes('lab')) color = '#F59E0B';
                if (typeLower.includes('sport')) color = '#10B981';
                if (typeLower.includes('emergency')) color = '#EF4444';

                // Add a glowing radar pulse dot for high-end look
                var customIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: "<div style='position: relative; display: flex; align-items: center; justify-content: center;'>" +
                          "<div style='position: absolute; width: 22px; height: 22px; border-radius: 50%; background-color: " + color + "; opacity: 0.18; transform: scale(1); animation: pulse 2s infinite;'></div>" +
                          "<div style='background-color: " + color + "; width: 12px; height: 12px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.25); z-index: 10;'></div>" +
                          "</div>",
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                });

                var marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);
                
                marker.bindPopup(
                    "<div class='leaflet-popup-content-title'>" + name + "</div>" +
                    "<div class='leaflet-popup-content-desc'>" + desc + "</div>"
                );
                
                markers[id] = marker;
            }

            function panToLocation(id, lat, lng, name) {
                map.setView([lat, lng], 17.5, { animate: true, duration: 1 });
                setTimeout(function() {
                    if (markers[id]) {
                        markers[id].openPopup();
                    }
                }, 800);
            }

            // Load initial markers from coordinates
            var data = ${JSON.stringify(locations.filter(l => l.latitude && l.longitude))};
            data.forEach(function(item) {
                addMarker(item.id, item.name, item.latitude, item.longitude, item.type, item.description || '');
            });
        </script>
    </body>
    </html>
    `;

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Immersive Header with Search */}
            <View className="bg-primary px-6 pt-6 pb-12 rounded-b-[40px] shadow-lg">
                <View className="flex-row items-center justify-between mb-8">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <ChevronLeft size={24} color="white" />
                    </TouchableOpacity>
                    <View className="items-center">
                        <Text className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Campus Explorer</Text>
                        <Text className="text-white text-xl font-bold">University Map</Text>
                    </View>
                    <TouchableOpacity 
                        onPress={fetchLocations}
                        className="w-12 h-12 bg-white/10 rounded-2xl items-center justify-center border border-white/20"
                    >
                        <Layers size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Premium Search Bar */}
                <View className="bg-white flex-row items-center px-5 h-14 rounded-2xl shadow-xl shadow-primary/20">
                    <Search size={20} color="#94A3B8" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={(text) => {
                            setSearchQuery(text);
                            // Live filter the locations
                        }}
                        placeholder="Search landmark or building..."
                        placeholderTextColor="#94A3B8"
                        className="flex-1 ml-3 text-primary font-bold text-sm"
                    />
                </View>

                {/* Category Chips */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-8 -mx-2">
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => {
                                setSelectedCategory(cat);
                            }}
                            className={`px-6 py-2.5 rounded-full mx-2 border ${selectedCategory === cat
                                ? 'bg-secondary border-secondary shadow-lg shadow-secondary/20'
                                : 'bg-white/10 border-white/10'
                                }`}
                        >
                            <Text className={`font-black text-[10px] uppercase ${selectedCategory === cat ? 'text-primary' : 'text-white/60'}`}>
                                {cat}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView className="flex-1 mt-4 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                {/* Visual Map Overview using Google Maps Styled WebView */}
                <PremiumCard variant="elevated" className="p-0 overflow-hidden mb-6 mt-2 h-[260px] border border-gray-100 rounded-[32px] shadow-lg">
                    {locations.length > 0 ? (
                        <WebView
                            ref={webViewRef}
                            originWhitelist={['*']}
                            source={{ html: mapHtmlString }}
                            style={{ flex: 1 }}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                        />
                    ) : (
                        <ActivityIndicator size="large" color="#002147" className="m-auto" />
                    )}
                </PremiumCard>

                {/* Guide Panel Details (Description Guide & Other Details) */}
                {selectedLoc && (
                    <PremiumCard variant="elevated" className="bg-white p-6 border-gray-100 rounded-[32px] shadow-xl mb-6">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center flex-1 mr-2">
                                <View 
                                    className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
                                    style={{ backgroundColor: `${getLandmarkColor(selectedLoc.type)}15` }}
                                >
                                    {React.createElement(getIcon(selectedLoc.type), {
                                        size: 20,
                                        color: getLandmarkColor(selectedLoc.type)
                                    })}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-primary font-black text-lg leading-6">{selectedLoc.name}</Text>
                                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mt-1">{selectedLoc.type}</Text>
                                </View>
                            </View>
                            
                            {/* Building Code Badge */}
                            {selectedLoc.building_code && (
                                <View className="bg-primary/5 border border-primary/10 px-3 py-1 rounded-xl">
                                    <Text className="text-primary font-black text-[9px] uppercase tracking-wider">{selectedLoc.building_code}</Text>
                                </View>
                            )}
                        </View>

                        {/* Guide Description */}
                        <Text className="text-primary/80 font-medium text-sm leading-6 mb-5">
                            {selectedLoc.description}
                        </Text>

                        {/* Guides Details Grid */}
                        <View className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 mb-5 space-y-3">
                            <View className="flex-row items-center">
                                <MapPin size={14} color="#64748B" />
                                <Text className="text-gray-600 text-xs font-bold ml-2">Guide Location: {selectedLoc.coords}</Text>
                            </View>
                            {selectedLoc.operating_hours && (
                                <View className="flex-row items-center mt-2">
                                    <Clock size={14} color="#64748B" />
                                    <Text className="text-gray-600 text-xs font-bold ml-2">Hours: {selectedLoc.operating_hours}</Text>
                                </View>
                            )}
                            {selectedLoc.contact_phone && (
                                <View className="flex-row items-center mt-2">
                                    <Phone size={14} color="#64748B" />
                                    <Text className="text-gray-600 text-xs font-bold ml-2">Phone: {selectedLoc.contact_phone}</Text>
                                </View>
                            )}
                            {selectedLoc.contact_email && (
                                <View className="flex-row items-center mt-2">
                                    <Mail size={14} color="#64748B" />
                                    <Text className="text-gray-600 text-xs font-bold ml-2">{selectedLoc.contact_email}</Text>
                                </View>
                            )}
                        </View>

                        {/* Interactive Navigation Button */}
                        <TouchableOpacity
                            onPress={() => handleExternalNavigation(selectedLoc)}
                            className="bg-secondary h-14 rounded-2xl flex-row items-center justify-center shadow-lg shadow-secondary/30"
                        >
                            <Navigation size={18} color="#002147" />
                            <Text className="text-primary font-black text-sm ml-2 uppercase">Navigate via Google Maps</Text>
                            <ExternalLink size={14} color="#002147" className="ml-1" />
                        </TouchableOpacity>
                    </PremiumCard>
                )}

                {/* Directory List Header */}
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-primary font-black text-xl">Directory Guide</Text>
                    <Text className="text-secondary font-black text-xs uppercase">{filteredLocations.length} Locations</Text>
                </View>

                {/* Directory Locations list */}
                {filteredLocations.length > 0 ? (
                    filteredLocations.map((loc) => (
                        <TouchableOpacity
                            key={loc.id}
                            onPress={() => handleSelectLocation(loc)}
                            activeOpacity={0.8}
                        >
                            <PremiumCard
                                variant="solid"
                                className={`bg-white mb-4 p-5 border border-gray-100 flex-row items-center rounded-2xl ${
                                    selectedLoc?.id === loc.id ? 'border-secondary shadow-lg shadow-secondary/5 bg-secondary/5' : ''
                                }`}
                            >
                                <View 
                                    className="w-14 h-14 rounded-2xl items-center justify-center mr-4 border"
                                    style={{ 
                                        backgroundColor: `${getLandmarkColor(loc.type)}10`,
                                        borderColor: `${getLandmarkColor(loc.type)}15`
                                    }}
                                >
                                    {React.createElement(getIcon(loc.type), {
                                        size: 22,
                                        color: getLandmarkColor(loc.type)
                                    })}
                                </View>

                                <View className="flex-1">
                                    <View className="flex-row items-center mb-1">
                                        <Text className="text-gray-400 text-[8px] font-black uppercase tracking-widest mr-2">{loc.type}</Text>
                                        <View className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                                    </View>
                                    <Text className="text-primary font-black text-base mb-1" numberOfLines={1}>{loc.name}</Text>
                                    <Text className="text-gray-500 text-[10px] font-medium leading-4" numberOfLines={1}>
                                        {loc.coords}
                                    </Text>
                                </View>

                                <TouchableOpacity 
                                    onPress={() => handleExternalNavigation(loc)}
                                    className="w-10 h-10 bg-primary/5 border border-primary/10 rounded-xl items-center justify-center"
                                >
                                    <Navigation size={16} color="#002147" />
                                </TouchableOpacity>
                            </PremiumCard>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View className="items-center justify-center py-24 opacity-30">
                        <MapPin size={48} color="#002147" strokeWidth={1} />
                        <Text className="text-primary font-black mt-4 uppercase">Location not found</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
