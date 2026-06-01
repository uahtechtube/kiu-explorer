import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { LayoutDashboard, Users, TrendingUp, Settings } from 'lucide-react-native';

const TABS = [
    { label: 'Dashboard', icon: LayoutDashboard, route: '/admin/dashboard' },
    { label: 'Users', icon: Users, route: '/admin/users' },
    { label: 'Analytics', icon: TrendingUp, route: '/admin/analytics' },
    { label: 'Settings', icon: Settings, route: '/admin/settings' },
];

export default function AdminNavBar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <View style={styles.container}>
            {TABS.map((tab) => {
                const isActive = pathname === tab.route || pathname.startsWith(tab.route + '/') ||
                    (tab.route === '/admin/dashboard' && pathname === '/admin/dashboard');
                return (
                    <TouchableOpacity
                        key={tab.route}
                        style={styles.tab}
                        onPress={() => router.push(tab.route as any)}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconWrapper, isActive && styles.iconWrapperActive]}>
                            <tab.icon
                                size={22}
                                color={isActive ? '#002147' : '#94A3B8'}
                                strokeWidth={isActive ? 2.5 : 1.8}
                            />
                        </View>
                        <Text style={[styles.label, isActive && styles.labelActive]}>
                            {tab.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        paddingBottom: Platform.OS === 'ios' ? 20 : 8,
        paddingTop: 10,
        paddingHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 12,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapper: {
        width: 44,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 3,
    },
    iconWrapperActive: {
        backgroundColor: '#FFD70020',
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 0.2,
        textTransform: 'uppercase',
    },
    labelActive: {
        color: '#002147',
    },
});
